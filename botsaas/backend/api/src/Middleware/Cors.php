<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Core\Env;
use App\Core\Logger;
use App\Core\Request;
use App\Core\Response;

/**
 * CORS with an explicit origin allowlist.
 *
 * Never echo back an arbitrary Origin with credentials allowed — that is
 * equivalent to no CORS at all. The panel and admin origins come from .env.
 *
 * The widget is the deliberate exception: widget.js runs on arbitrary customer
 * websites, so widget routes answer any origin but carry no cookies and are
 * authorised by widget_key + a server-side allowed_domains check instead.
 */
final class Cors implements MiddlewareInterface
{
    public function handle(Request $request, callable $next): Response
    {
        $origin = $request->origin();
        $isWidgetRoute = str_starts_with($request->path(), '/api/widget');

        $headers = [
            'Vary' => 'Origin',
        ];

        if ($isWidgetRoute) {
            $headers['Access-Control-Allow-Origin'] = '*';
        } elseif ($origin !== null && $this->isAllowed($origin)) {
            $headers['Access-Control-Allow-Origin']      = $origin;
            $headers['Access-Control-Allow-Credentials'] = 'true';
        } elseif ($origin !== null) {
            Logger::warning('cors.origin_rejected', ['origin' => $origin, 'path' => $request->path()]);
        }

        if ($request->method() === 'OPTIONS') {
            // Preflight: answer and stop. No DB, no auth, no rate-limit cost.
            return Response::noContent()->withHeaders($headers + [
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Authorization, Content-Type, X-Requested-With, X-Widget-Key, X-Idempotency-Key',
                'Access-Control-Max-Age'       => '86400',
            ]);
        }

        return $next($request)->withHeaders($headers);
    }

    private function isAllowed(string $origin): bool
    {
        $allowed = array_filter([
            Env::stringOrNull('PANEL_URL'),
            Env::stringOrNull('ADMIN_URL'),
            Env::stringOrNull('APP_URL'),
        ]);

        foreach (Env::list('CORS_EXTRA_ORIGINS') as $extra) {
            $allowed[] = $extra;
        }

        $normalize = static fn (string $u): string => rtrim(strtolower($u), '/');

        return in_array($normalize($origin), array_map($normalize, $allowed), true);
    }
}
