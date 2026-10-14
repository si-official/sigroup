<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Regex route table with path params, groups, and per-route middleware.
 *
 * Deliberately not a route-compiler/cache: on shared hosting with ~200 routes
 * the linear match costs well under a millisecond, and a cache file is one
 * more thing that goes stale on deploy and produces a 404 nobody can explain.
 */
final class Router
{
    /** @var array<int,array{method:string,regex:string,params:string[],handler:mixed,middleware:array,name:?string}> */
    private array $routes = [];

    private string $prefix = '';
    /** @var array<int,mixed> */
    private array $groupMiddleware = [];

    public function get(string $path, $handler, array $middleware = []): self    { return $this->add('GET', $path, $handler, $middleware); }
    public function post(string $path, $handler, array $middleware = []): self   { return $this->add('POST', $path, $handler, $middleware); }
    public function put(string $path, $handler, array $middleware = []): self    { return $this->add('PUT', $path, $handler, $middleware); }
    public function patch(string $path, $handler, array $middleware = []): self  { return $this->add('PATCH', $path, $handler, $middleware); }
    public function delete(string $path, $handler, array $middleware = []): self { return $this->add('DELETE', $path, $handler, $middleware); }

    /**
     * Route group with a shared prefix and middleware stack.
     * Nestable: inner groups inherit the outer prefix and middleware.
     */
    public function group(string $prefix, array $middleware, callable $define): void
    {
        $previousPrefix     = $this->prefix;
        $previousMiddleware = $this->groupMiddleware;

        $this->prefix          = $previousPrefix . $prefix;
        $this->groupMiddleware = array_merge($previousMiddleware, $middleware);

        $define($this);

        $this->prefix          = $previousPrefix;
        $this->groupMiddleware = $previousMiddleware;
    }

    private function add(string $method, string $path, $handler, array $middleware): self
    {
        $full = $this->prefix . $path;
        if ($full !== '/' && str_ends_with($full, '/')) {
            $full = rtrim($full, '/');
        }

        // {id} -> named capture of digits; {slug} -> named capture of a segment.
        $params = [];
        $regex  = preg_replace_callback(
            '#\{([a-zA-Z_][a-zA-Z0-9_]*)(?::(int|slug|any))?\}#',
            function (array $m) use (&$params): string {
                $params[] = $m[1];
                $type = $m[2] ?? 'any';
                $pattern = match ($type) {
                    'int'  => '[0-9]+',
                    'slug' => '[A-Za-z0-9_-]+',
                    default => '[^/]+',
                };
                return '(?P<' . $m[1] . '>' . $pattern . ')';
            },
            $full
        );

        $this->routes[] = [
            'method'     => $method,
            'regex'      => '#^' . $regex . '$#',
            'params'     => $params,
            'handler'    => $handler,
            'middleware' => array_merge($this->groupMiddleware, $middleware),
            'name'       => null,
        ];

        return $this;
    }

    /**
     * @return array{handler:mixed,middleware:array,params:array<string,string>}|null
     *         null = no path match (404). Throws 405 when the path matches but
     *         the method does not, which is a materially different bug for the
     *         frontend developer reading the error.
     */
    public function match(Request $request): ?array
    {
        $pathMatchedOtherMethods = [];

        foreach ($this->routes as $route) {
            if (preg_match($route['regex'], $request->path(), $m) !== 1) {
                continue;
            }
            if ($route['method'] !== $request->method()) {
                $pathMatchedOtherMethods[] = $route['method'];
                continue;
            }

            $params = [];
            foreach ($route['params'] as $name) {
                $params[$name] = $m[$name] ?? '';
            }

            return [
                'handler'    => $route['handler'],
                'middleware' => $route['middleware'],
                'params'     => $params,
            ];
        }

        if ($pathMatchedOtherMethods !== []) {
            throw new ApiException(
                'METHOD_NOT_ALLOWED',
                sprintf(
                    '%s is not allowed on this endpoint. Allowed: %s.',
                    $request->method(),
                    implode(', ', array_unique($pathMatchedOtherMethods))
                ),
                405
            );
        }

        return null;
    }

    /** @return array<int,array{method:string,regex:string}> for the admin route inspector */
    public function all(): array
    {
        return array_map(
            fn (array $r) => ['method' => $r['method'], 'regex' => $r['regex']],
            $this->routes
        );
    }

    public function count(): int
    {
        return count($this->routes);
    }
}
