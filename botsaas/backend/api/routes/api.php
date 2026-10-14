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

// ------------------------------------------------------- phases 3-13 shape ---
//
// PHASE 3 — auth (public, hard-throttled)
// $router->group('/api/auth', [new RateLimit(20, 60, 'auth')], function ($r) {
//     $r->post('/register', [AuthController::class, 'register']);
//     $r->post('/login', [AuthController::class, 'login'], [new RateLimit(5, 900, 'login')]);
//     $r->post('/refresh', [AuthController::class, 'refresh']);
//     $r->post('/logout', [AuthController::class, 'logout'], [new Auth()]);
//     $r->post('/forgot-password', [AuthController::class, 'forgot'], [new RateLimit(3, 900, 'forgot')]);
//     $r->post('/reset-password', [AuthController::class, 'reset']);
//     $r->post('/verify-email', [AuthController::class, 'verifyEmail']);
// });
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
//     $r->get('/products', [ProductController::class, 'index']);
//     $r->post('/products', [ProductController::class, 'store']);
//     $r->patch('/products/{id:int}', [ProductController::class, 'update']);
//     $r->delete('/products/{id:int}', [ProductController::class, 'destroy']);
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
