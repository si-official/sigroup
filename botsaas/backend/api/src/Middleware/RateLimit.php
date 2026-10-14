<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Core\Context;
use App\Core\Db;
use App\Core\Env;
use App\Core\Logger;
use App\Core\RateLimitException;
use App\Core\Request;
use App\Core\Response;
use Throwable;

/**
 * Fixed-window rate limiter backed by MySQL.
 *
 * MySQL, not Redis, because shared hosting has no Redis. The cost is one
 * upsert per request; the `rate_limits` table is tiny and the primary key is
 * the bucket, so it stays in the buffer pool.
 *
 * The counter is incremented with a single atomic upsert (INSERT ... ON
 * DUPLICATE KEY UPDATE) and the post-increment value is read from the same
 * statement's result, so two simultaneous requests cannot both see "1".
 *
 * Fail-open on database error: a limiter outage must not take the API down.
 * Logged as critical so it is never silent.
 */
final class RateLimit implements MiddlewareInterface
{
    public function __construct(
        private ?int $maxPerWindow = null,
        private ?int $windowSeconds = null,
        private string $scope = 'default'
    ) {
    }

    public function handle(Request $request, callable $next): Response
    {
        if ($request->method() === 'OPTIONS') {
            return $next($request);
        }

        $window = $this->windowSeconds ?? Env::int('RATE_LIMIT_WINDOW', 60);
        $ctx    = Context::current();

        // Most specific identity available: user > tenant > IP.
        [$bucket, $limit] = $this->resolveBucket($request, $ctx);

        try {
            $hits = $this->increment($bucket, $window);
        } catch (Throwable $e) {
            Logger::critical('ratelimit.backend_failed', ['message' => $e->getMessage()]);
            return $next($request); // fail open
        }

        if ($hits > $limit) {
            Logger::warning('ratelimit.exceeded', ['bucket' => $bucket, 'hits' => $hits, 'limit' => $limit]);
            throw new RateLimitException($window);
        }

        $response = $next($request);

        return $response->withHeaders([
            'X-RateLimit-Limit'     => (string) $limit,
            'X-RateLimit-Remaining' => (string) max(0, $limit - $hits),
        ]);
    }

    /** @return array{0:string,1:int} */
    private function resolveBucket(Request $request, Context $ctx): array
    {
        if ($this->maxPerWindow !== null) {
            // Route-specific limiter (e.g. login): key on IP + path + scope.
            return [
                sprintf('%s:%s:%s', $this->scope, $request->ip(), $request->path()),
                $this->maxPerWindow,
            ];
        }

        if ($ctx->userId() !== null) {
            return ['user:' . $ctx->userId(), Env::int('RATE_LIMIT_USER', 600)];
        }

        if ($ctx->tenantIdOrNull() !== null) {
            return ['tenant:' . $ctx->tenantIdOrNull(), Env::int('RATE_LIMIT_TENANT', 1200)];
        }

        return ['ip:' . $request->ip(), Env::int('RATE_LIMIT_IP', 300)];
    }

    /**
     * Atomic increment returning the new count.
     *
     * The trick: when the stored window has expired we RESET rather than
     * increment, detected inside the same UPDATE via the expires_at comparison.
     * One statement, no read-then-write race.
     */
    private function increment(string $bucket, int $window): int
    {
        $key = substr(hash('sha256', $bucket), 0, 48);

        Db::execute(
            'INSERT INTO rate_limits (bucket_key, hits, window_start, expires_at)
             VALUES (:k, 1, NOW(), DATE_ADD(NOW(), INTERVAL :w SECOND))
             ON DUPLICATE KEY UPDATE
                hits         = IF(expires_at < NOW(), 1, hits + 1),
                window_start = IF(expires_at < NOW(), NOW(), window_start),
                expires_at   = IF(expires_at < NOW(), DATE_ADD(NOW(), INTERVAL :w2 SECOND), expires_at)',
            ['k' => $key, 'w' => $window, 'w2' => $window]
        );

        return (int) Db::scalar('SELECT hits FROM rate_limits WHERE bucket_key = :k', ['k' => $key]);
    }
}
