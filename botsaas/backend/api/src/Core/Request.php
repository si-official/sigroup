<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Immutable-ish request wrapper.
 *
 * THE CRITICAL DETAIL: php://input can only be read once per request. Webhook
 * signature verification (Meta's X-Hub-Signature-256) is an HMAC over the RAW
 * body, so if anything JSON-decodes the stream first, the raw bytes are gone
 * and every signature check fails forever. So the raw body is captured exactly
 * once here, at construction, and everything else works from that copy.
 */
final class Request
{
    private string $method;
    private string $path;
    private string $rawBody;
    /** @var array<string,string> lowercased header name => value */
    private array $headers;
    /** @var array<string,mixed>|null */
    private ?array $json = null;
    /** @var array<string,string> */
    private array $routeParams = [];

    public function __construct(
        string $method,
        string $path,
        string $rawBody,
        array $headers,
        private array $query = [],
        private array $server = []
    ) {
        $this->method  = strtoupper($method);
        $this->path    = $path;
        $this->rawBody = $rawBody;
        $this->headers = $headers;
    }

    public static function capture(): self
    {
        $uri  = $_SERVER['REQUEST_URI'] ?? '/';
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';

        // Normalise: strip trailing slash (except root), collapse doubles.
        $path = preg_replace('#/+#', '/', $path) ?? '/';
        if ($path !== '/' && str_ends_with($path, '/')) {
            $path = rtrim($path, '/');
        }

        return new self(
            $_SERVER['REQUEST_METHOD'] ?? 'GET',
            $path,
            file_get_contents('php://input') ?: '',
            self::captureHeaders(),
            $_GET ?? [],
            $_SERVER ?? []
        );
    }

    /** @return array<string,string> */
    private static function captureHeaders(): array
    {
        $headers = [];
        if (function_exists('getallheaders')) {
            foreach (getallheaders() as $name => $value) {
                $headers[strtolower($name)] = $value;
            }
            return $headers;
        }
        // CGI/FastCGI fallback — Hostinger sometimes runs without getallheaders.
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $name = strtolower(str_replace('_', '-', substr($key, 5)));
                $headers[$name] = (string) $value;
            }
        }
        foreach (['CONTENT_TYPE' => 'content-type', 'CONTENT_LENGTH' => 'content-length'] as $k => $h) {
            if (isset($_SERVER[$k])) {
                $headers[$h] = (string) $_SERVER[$k];
            }
        }
        return $headers;
    }

    public function method(): string { return $this->method; }
    public function path(): string   { return $this->path; }

    /** The untouched request body. Use this, and only this, for HMAC verification. */
    public function rawBody(): string { return $this->rawBody; }

    /** @return array<string,mixed> */
    public function json(): array
    {
        if ($this->json !== null) {
            return $this->json;
        }
        if ($this->rawBody === '') {
            return $this->json = [];
        }
        $decoded = json_decode($this->rawBody, true);
        return $this->json = is_array($decoded) ? $decoded : [];
    }

    /** Body field, dot-notation capable: input('customer.phone'). */
    public function input(string $key, mixed $default = null): mixed
    {
        $data = $this->json();
        if (!str_contains($key, '.')) {
            return $data[$key] ?? $default;
        }
        foreach (explode('.', $key) as $segment) {
            if (!is_array($data) || !array_key_exists($segment, $data)) {
                return $default;
            }
            $data = $data[$segment];
        }
        return $data;
    }

    /** @return array<string,mixed> */
    public function all(): array
    {
        return array_merge($this->query, $this->json());
    }

    /** @param string[] $keys */
    public function only(array $keys): array
    {
        return array_intersect_key($this->all(), array_flip($keys));
    }

    public function has(string $key): bool
    {
        return $this->input($key) !== null;
    }

    public function query(string $key, mixed $default = null): mixed
    {
        return $this->query[$key] ?? $default;
    }

    public function queryInt(string $key, int $default = 0): int
    {
        $v = $this->query[$key] ?? null;
        return is_numeric($v) ? (int) $v : $default;
    }

    /** Pagination helper: never trust a client-supplied page size. */
    public function limit(int $default = 30, int $max = 100): int
    {
        return max(1, min($this->queryInt('limit', $default), $max));
    }

    public function cursor(): ?string
    {
        $c = $this->query['cursor'] ?? null;
        return is_string($c) && $c !== '' ? $c : null;
    }

    public function header(string $name, ?string $default = null): ?string
    {
        return $this->headers[strtolower($name)] ?? $default;
    }

    /** @return array<string,string> */
    public function headers(): array { return $this->headers; }

    public function bearerToken(): ?string
    {
        $auth = $this->header('authorization');
        if ($auth === null) {
            return null;
        }
        if (preg_match('/^Bearer\s+(.+)$/i', trim($auth), $m) === 1) {
            return trim($m[1]);
        }
        return null;
    }

    public function isJson(): bool
    {
        return str_contains(strtolower($this->header('content-type') ?? ''), 'json');
    }

    public function origin(): ?string
    {
        return $this->header('origin');
    }

    public function userAgent(): string
    {
        return mb_substr($this->header('user-agent') ?? '', 0, 255);
    }

    /**
     * Client IP. X-Forwarded-For is only honoured when the immediate peer is a
     * configured trusted proxy — otherwise any caller could spoof a header and
     * walk straight past the per-IP rate limiter.
     */
    public function ip(): string
    {
        $remote = (string) ($this->server['REMOTE_ADDR'] ?? '0.0.0.0');
        $trusted = Env::list('TRUSTED_PROXIES');

        if ($trusted !== [] && in_array($remote, $trusted, true)) {
            $forwarded = $this->header('x-forwarded-for');
            if ($forwarded !== null) {
                // Leftmost entry is the original client.
                $candidate = trim(explode(',', $forwarded)[0]);
                if (filter_var($candidate, FILTER_VALIDATE_IP) !== false) {
                    return $candidate;
                }
            }
        }
        return $remote;
    }

    /** @param array<string,string> $params */
    public function setRouteParams(array $params): void
    {
        $this->routeParams = $params;
    }

    public function param(string $key, ?string $default = null): ?string
    {
        return $this->routeParams[$key] ?? $default;
    }

    public function paramInt(string $key): int
    {
        $v = $this->routeParams[$key] ?? null;
        return is_numeric($v) ? (int) $v : 0;
    }
}
