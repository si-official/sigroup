<?php
declare(strict_types=1);

namespace App\Core;

/**
 * The single response envelope for the entire API:
 *
 *   success -> {"ok":true,  "data":…,  "meta":{…}?}
 *   failure -> {"ok":false, "error":{"code","message","details"?}}
 *
 * HTTP status always agrees with `ok`. A 200 carrying ok:false is a bug — the
 * frontend branches on status first, so a mismatch produces a silent failure
 * that looks like success.
 *
 * JSON_UNESCAPED_UNICODE is not cosmetic: without it every Bangla character
 * becomes a \uXXXX escape, inflating payloads roughly 6x over the wire for a
 * Bangla-first product on mobile data.
 */
final class Response
{
    private const JSON_FLAGS = JSON_UNESCAPED_UNICODE
                             | JSON_UNESCAPED_SLASHES
                             | JSON_INVALID_UTF8_SUBSTITUTE;

    private int $status;
    private array $body;
    /** @var array<string,string> */
    private array $headers;

    private function __construct(int $status, array $body, array $headers = [])
    {
        $this->status  = $status;
        $this->body    = $body;
        $this->headers = $headers;
    }

    public static function ok(mixed $data = null, array $meta = []): self
    {
        $body = ['ok' => true, 'data' => $data];
        if ($meta !== []) {
            $body['meta'] = $meta;
        }
        return new self(200, $body);
    }

    public static function created(mixed $data = null): self
    {
        return new self(201, ['ok' => true, 'data' => $data]);
    }

    public static function accepted(mixed $data = null): self
    {
        return new self(202, ['ok' => true, 'data' => $data]);
    }

    public static function noContent(): self
    {
        return new self(204, []);
    }

    /**
     * Cursor-paginated list. Cursor pagination rather than offset because the
     * inbox and order board are both append-heavy: OFFSET drifts and skips rows
     * while the user is reading, and gets slower the deeper you page.
     *
     * @param array<int,mixed> $items
     */
    public static function page(array $items, ?string $nextCursor, int $limit, array $extra = []): self
    {
        return new self(200, [
            'ok'   => true,
            'data' => $items,
            'meta' => array_merge([
                'count'       => count($items),
                'limit'       => $limit,
                'next_cursor' => $nextCursor,
                'has_more'    => $nextCursor !== null,
            ], $extra),
        ]);
    }

    public static function error(
        string $code,
        string $message,
        int $status = 400,
        array $details = []
    ): self {
        $error = ['code' => $code, 'message' => $message];
        if ($details !== []) {
            $error['details'] = $details;
        }
        return new self($status, ['ok' => false, 'error' => $error]);
    }

    public static function fromException(ApiException $e): self
    {
        $response = self::error($e->errorCode, $e->getMessage(), $e->statusCode, $e->details);
        if ($e instanceof RateLimitException) {
            $response = $response->withHeader('Retry-After', (string) ($e->details['retry_after'] ?? 60));
        }
        return $response;
    }

    public function withHeader(string $name, string $value): self
    {
        $clone = clone $this;
        $clone->headers[$name] = $value;
        return $clone;
    }

    /** @param array<string,string> $headers */
    public function withHeaders(array $headers): self
    {
        $clone = clone $this;
        $clone->headers = array_merge($clone->headers, $headers);
        return $clone;
    }

    public function status(): int { return $this->status; }
    public function body(): array { return $this->body; }

    public function send(): void
    {
        if (!headers_sent()) {
            http_response_code($this->status);
            header('Content-Type: application/json; charset=utf-8');
            header('X-Request-Id: ' . Logger::requestId());
            // API responses are per-tenant and auth-scoped: never cacheable.
            header('Cache-Control: no-store, private');
            foreach ($this->headers as $name => $value) {
                header($name . ': ' . $value, true);
            }
        }

        if ($this->status !== 204) {
            $json = json_encode($this->body, self::JSON_FLAGS);
            if ($json === false) {
                // Encoding failed (almost always invalid UTF-8 from a third
                // party). Degrade to a valid envelope rather than empty output.
                http_response_code(500);
                $json = '{"ok":false,"error":{"code":"ENCODING_FAILED","message":"Response could not be encoded."}}';
            }
            echo $json;
        }
    }
}
