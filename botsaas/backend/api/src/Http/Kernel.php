<?php
declare(strict_types=1);

namespace App\Http;

use App\Core\ApiException;
use App\Core\Context;
use App\Core\Db;
use App\Core\Env;
use App\Core\Logger;
use App\Core\Request;
use App\Core\Response;
use App\Core\Router;
use App\Middleware\MiddlewareInterface;
use Throwable;

/**
 * Request pipeline.
 *
 * Fixed order — cors -> rate limit -> auth -> tenant -> quota -> handler —
 * and the order is the point:
 *   cors first, so a preflight never touches the database;
 *   rate limit before auth, so credential-stuffing is cheap to absorb;
 *   auth before tenant, since the tenant is derived from the token;
 *   tenant before quota, since quota is a property of the tenant's plan;
 *   quota last, so an over-limit tenant is rejected before any real work.
 */
final class Kernel
{
    /** @var array<int,MiddlewareInterface> runs on every request */
    private array $global = [];

    public function __construct(private Router $router)
    {
    }

    public function pushGlobal(MiddlewareInterface $middleware): self
    {
        $this->global[] = $middleware;
        return $this;
    }

    public function handle(Request $request): Response
    {
        $startedAt = microtime(true);

        try {
            // Global middleware wraps ROUTE MATCHING, not just the handler.
            //
            // Order matters and this is the reason: an OPTIONS preflight has no
            // route of its own, so if the router ran first it would raise 405
            // and the browser would reject every cross-origin request from the
            // panel. Cors must see the request before the router does. Same
            // logic for the rate limiter: a flood of requests to nonexistent
            // paths should be throttled, not route-matched.
            $dispatch = function (Request $req): Response {
                $match = $this->router->match($req);

                if ($match === null) {
                    return Response::error(
                        'NOT_FOUND',
                        'No route matches ' . $req->method() . ' ' . $req->path(),
                        404
                    );
                }

                $req->setRouteParams($match['params']);

                $handler = fn (Request $r): Response => $this->callHandler($match['handler'], $r);

                foreach (array_reverse($this->resolveMiddleware($match['middleware'])) as $middleware) {
                    $next = $handler;
                    $handler = fn (Request $r): Response => $middleware->handle($r, $next);
                }

                return $handler($req);
            };

            $pipeline = $dispatch;
            foreach (array_reverse($this->global) as $middleware) {
                $next = $pipeline;
                $pipeline = fn (Request $req): Response => $middleware->handle($req, $next);
            }

            $response = $pipeline($request);
        } catch (ApiException $e) {
            // Expected failure: the code and message are already client-safe.
            Logger::info('request.rejected', [
                'code'   => $e->errorCode,
                'status' => $e->statusCode,
                'path'   => $request->path(),
            ]);
            $response = Response::fromException($e);
        } catch (Throwable $e) {
            // Unexpected: a bug. Log fully, tell the client nothing specific.
            Logger::exception($e, 'request.unhandled', [
                'path'   => $request->path(),
                'method' => $request->method(),
            ]);

            $response = Env::isDebug()
                ? Response::error('INTERNAL_ERROR', $e->getMessage(), 500, [
                    'class' => get_class($e),
                    'file'  => $e->getFile() . ':' . $e->getLine(),
                ])
                : Response::error('INTERNAL_ERROR', 'Something went wrong. Please try again.', 500);
        }

        $ms = (int) round((microtime(true) - $startedAt) * 1000);

        Logger::info('request.completed', [
            'method'  => $request->method(),
            'path'    => $request->path(),
            'status'  => $response->status(),
            'ms'      => $ms,
            'queries' => Db::queryCount(),
            'ip'      => $request->ip(),
        ]);

        // Slow requests are the early warning that shared hosting is running
        // out of headroom. Its own event so it stays greppable.
        if ($ms > 1000) {
            Logger::warning('request.slow', ['path' => $request->path(), 'ms' => $ms, 'queries' => Db::queryCount()]);
        }

        return $response->withHeader('X-Response-Time', $ms . 'ms');
    }

    /** @param array<int,mixed> $definitions */
    private function resolveMiddleware(array $definitions): array
    {
        $resolved = [];
        foreach ($definitions as $definition) {
            if ($definition instanceof MiddlewareInterface) {
                $resolved[] = $definition;
            } elseif (is_callable($definition)) {
                $resolved[] = $definition();
            } elseif (is_string($definition) && class_exists($definition)) {
                $resolved[] = new $definition();
            }
        }
        return $resolved;
    }

    private function callHandler(mixed $handler, Request $request): Response
    {
        if (is_callable($handler)) {
            return $handler($request);
        }

        // [ControllerClass::class, 'method']
        if (is_array($handler) && count($handler) === 2) {
            [$class, $method] = $handler;
            $controller = is_string($class) ? new $class() : $class;
            return $controller->{$method}($request);
        }

        throw new ApiException('ROUTE_MISCONFIGURED', 'Route handler is not callable.', 500);
    }

    public function terminate(): void
    {
        Context::reset();
        Logger::clearContext();
    }
}
