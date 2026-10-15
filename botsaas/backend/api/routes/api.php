<?php
declare(strict_types=1);

/**
 * Route table.
 *
 * Phase 1 registers only health and migrate. The commented groups below are
 * the agreed shape for phases 3-13 — written now so route prefixes and their
 * middleware stacks are decided once, in one file, rather than negotiated
 * again in every later phase.
 *
 * @var \App\Core\Router $router
 */

use App\Controllers\HealthController;
use App\Controllers\MigrateController;
use App\Middleware\Auth;
use App\Middleware\RateLimit;
use App\Middleware\RequireRole;
use App\Middleware\TenantScope;

// ---------------------------------------------------------------- public ----

$router->get('/api/health', [HealthController::class, 'index']);
$router->get('/api/health/deep', [HealthController::class, 'deep']);

// Deploy tooling. Secret-guarded inside the controller, plus a tight rate
// limit so the secret cannot be brute-forced.
$router->get('/api/_migrate', [MigrateController::class, 'status'], [new RateLimit(10, 60, 'migrate')]);
$router->post('/api/_migrate', [MigrateController::class, 'run'], [new RateLimit(5, 60, 'migrate')]);

// ---------------------------------------------------------------- auth ------
// Public, hard-throttled. No Auth/TenantScope: these endpoints create sessions.

use App\Controllers\AuthController;
use App\Middleware\RequirePermission;

$router->group('/api/auth', [new RateLimit(20, 60, 'auth')], function (\App\Core\Router $r): void {
    $r->post('/register', [AuthController::class, 'register'], [new RateLimit(5, 3600, 'register')]);
    // Login carries its own tighter limiter on top of LoginThrottle: this one
    // is per-IP-per-path and absorbs floods cheaply; LoginThrottle is per-email
    // and per-IP with exponential lockout, and is the real credential defence.
    $r->post('/login', [AuthController::class, 'login'], [new RateLimit(10, 900, 'login')]);
    $r->post('/refresh', [AuthController::class, 'refresh'], [new RateLimit(60, 900, 'refresh')]);
    $r->post('/forgot-password', [AuthController::class, 'forgotPassword'], [new RateLimit(3, 900, 'forgot')]);
    $r->post('/reset-password', [AuthController::class, 'resetPassword'], [new RateLimit(5, 900, 'reset')]);
    $r->post('/verify-email', [AuthController::class, 'verifyEmail'], [new RateLimit(10, 900, 'verify')]);
});

// Authenticated, no tenant scope needed (platform staff can call these too).
$router->post('/api/auth/logout', [AuthController::class, 'logout'], [new Auth()]);
$router->get('/api/auth/me', [AuthController::class, 'me'], [new Auth(), new TenantScope()]);
$router->get('/api/auth/usage', [AuthController::class, 'usage'], [new Auth(), new TenantScope()]);

// ---------------------------------------------------------------- team ------
// Tenant-scoped and permission-gated. These are the first routes using the
// full stack, and what tests/api_isolation.php exercises.

$tenantStack = [new Auth(), new TenantScope()];

$router->get('/api/team', [\App\Controllers\TeamController::class, 'index'],
    array_merge($tenantStack, [new RequirePermission('team.view')]));

$router->post('/api/team/invite', [\App\Controllers\TeamController::class, 'invite'],
    array_merge($tenantStack, [new RequirePermission('team.invite')]));

$router->patch('/api/team/{id:int}/role', [\App\Controllers\TeamController::class, 'changeRole'],
    array_merge($tenantStack, [new RequirePermission('team.change_role')]));

$router->delete('/api/team/{id:int}', [\App\Controllers\TeamController::class, 'remove'],
    array_merge($tenantStack, [new RequirePermission('team.remove')]));


// ------------------------------------------------------- phases 3-13 shape ---
//
// WEBHOOKS — no Auth, no TenantScope: identity is the signature, and the
// tenant is resolved from the page/phone id inside the payload. Must stay
// under 2s (constraint 3), so these handlers only verify + enqueue.
// $router->group('/api/webhook', [], function ($r) {
//     $r->get('/messenger', [WebhookController::class, 'verifyMessenger']);
//     $r->post('/messenger', [WebhookController::class, 'messenger']);
//     $r->get('/whatsapp', [WebhookController::class, 'verifyWhatsapp']);
//     $r->post('/whatsapp', [WebhookController::class, 'whatsapp']);
//     $r->post('/instagram', [WebhookController::class, 'instagram']);
//     $r->post('/payment/{gateway:slug}', [WebhookController::class, 'payment']);
//     $r->post('/courier/{provider:slug}', [WebhookController::class, 'courier']);
// });
//
// WIDGET — public, authorised by widget_key + server-side domain allowlist.
// $router->group('/api/widget', [new RateLimit(120, 60, 'widget')], function ($r) {
//     $r->post('/session', [WidgetController::class, 'session']);
//     $r->post('/message', [WidgetController::class, 'send']);
//     $r->get('/stream', [WidgetController::class, 'stream']);
// });
//
// TENANT PANEL — the standard stack for everything a shop owner touches.
// $tenant = [new Auth(), new TenantScope()];
// $router->group('/api', $tenant, function ($r) {
//     $r->get('/dashboard', [DashboardController::class, 'index']);
//
//     $r->get('/inbox', [InboxController::class, 'list']);
//     $r->get('/inbox/stream', [InboxController::class, 'stream']);
//     $r->get('/conversations/{id:int}', [ConversationController::class, 'show']);
//     $r->post('/conversations/{id:int}/reply', [ConversationController::class, 'reply']);
//     $r->post('/conversations/{id:int}/ai', [ConversationController::class, 'toggleAi']);
//
//     $r->get('/products', [ProductController::class, 'index'],
//             [new RequirePermission('product.view')]);
//     $r->post('/products', [ProductController::class, 'store'],
//             [new RequirePermission('product.create')]);
//     $r->patch('/products/{id:int}', [ProductController::class, 'update'],
//             [new RequirePermission('product.edit')]);
//     $r->delete('/products/{id:int}', [ProductController::class, 'destroy'],
//             [new RequirePermission('product.delete')]);
//
//     $r->get('/orders', [OrderController::class, 'index']);
//     $r->patch('/orders/{id:int}/status', [OrderController::class, 'updateStatus']);
//
//     $r->get('/analytics', [AnalyticsController::class, 'index']);
//     $r->post('/ai/test', [AiTestController::class, 'run']);
//
//     // Feature-gated branches: 402 carries the upgrade payload.
//     $r->group('/whatsapp', [new RequirePackageFeature('wa_enabled')], function ($r) {
//         $r->get('/connection', [WhatsappController::class, 'show']);
//         $r->post('/connection', [WhatsappController::class, 'connect']);
//     });
//     $r->group('/widget', [new RequirePackageFeature('widget_enabled')], function ($r) {
//         $r->get('/settings', [WidgetSettingsController::class, 'show']);
//     });
//     $r->group('/courier', [new RequirePackageFeature('courier_enabled')], function ($r) {
//         $r->get('/accounts', [CourierController::class, 'index']);
//     });
// });
//
// PLATFORM ADMIN — separate prefix, role-gated, never TenantScope.
// $router->group('/api/admin', [new Auth(), new RequireRole('super_admin', 'platform_support')], function ($r) {
//     $r->get('/overview', [Admin\OverviewController::class, 'index']);
//     $r->get('/tenants', [Admin\TenantController::class, 'index']);
//     $r->post('/tenants/{id:int}/impersonate', [Admin\TenantController::class, 'impersonate'],
//              [new RequireRole('super_admin')]);
//     $r->get('/packages', [Admin\PackageController::class, 'index']);
//     $r->get('/ai/models', [Admin\AiModelController::class, 'index']);
//     $r->get('/jobs', [Admin\JobController::class, 'index']);
// });
