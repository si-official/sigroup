<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Context;
use App\Core\Request;
use App\Core\Response;
use App\Core\UnauthorizedException;
use App\Core\Validator;
use App\Services\AuthService;
use App\Services\TokenService;
use App\Support\Permissions;

/**
 * Auth endpoints. Thin: validate, delegate to AuthService, shape the response.
 */
final class AuthController
{
    private AuthService $auth;
    private TokenService $tokens;

    public function __construct(?AuthService $auth = null, ?TokenService $tokens = null)
    {
        $this->auth   = $auth ?? new AuthService();
        $this->tokens = $tokens ?? new TokenService();
    }

    public function register(Request $request): Response
    {
        $data = Validator::validate($request->json(), [
            'business_name' => 'required|string|min:2|max:150',
            'name'          => 'required|string|min:2|max:120',
            'email'         => 'required|email|max:190',
            'password'      => 'required|password|max:200',
            'phone'         => 'nullable|bd_phone',
        ]);

        $result = $this->auth->register(
            $data['business_name'],
            $data['name'],
            $data['email'],
            $data['password'],
            $data['phone'] ?? null,
            $request->ip(),
            $request->userAgent()
        );

        return Response::created($result);
    }

    public function login(Request $request): Response
    {
        $data = Validator::validate($request->json(), [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $result = $this->auth->login(
            $data['email'],
            $data['password'],
            $request->ip(),
            $request->userAgent()
        );

        return Response::ok($result);
    }

    public function refresh(Request $request): Response
    {
        $data = Validator::validate($request->json(), [
            'refresh_token' => 'required|string|min:20',
        ]);

        return Response::ok($this->tokens->rotate($data['refresh_token'], $request->ip()));
    }

    public function logout(Request $request): Response
    {
        $token = $request->input('refresh_token');

        if (is_string($token) && $token !== '') {
            $this->auth->logout($token);
        }

        return Response::ok(['logged_out' => true]);
    }

    public function forgotPassword(Request $request): Response
    {
        $data = Validator::validate($request->json(), ['email' => 'required|email']);

        $token = $this->auth->requestPasswordReset($data['email'], $request->ip());

        // Phase 12 wires the mailer; until then the token is logged, never
        // returned. Returning it would hand anyone a password reset for any
        // address they can name.
        if ($token !== null) {
            \App\Core\Logger::info('auth.reset_token_issued', ['delivery' => 'pending_mailer']);
        }

        // Identical response either way — see AuthService for why.
        return Response::ok([
            'sent'    => true,
            'message' => 'If an account exists for that email, a reset link has been sent.',
        ]);
    }

    public function resetPassword(Request $request): Response
    {
        $data = Validator::validate($request->json(), [
            'token'    => 'required|string|min:20',
            'password' => 'required|password|confirmed|max:200',
        ]);

        $this->auth->resetPassword($data['token'], $data['password']);

        return Response::ok(['reset' => true, 'message' => 'Password updated. Please sign in again.']);
    }

    public function verifyEmail(Request $request): Response
    {
        $data = Validator::validate($request->json(), ['token' => 'required|string|min:20']);

        $this->auth->verifyEmail($data['token']);

        return Response::ok(['verified' => true]);
    }

    /** The panel calls this on boot to render nav and hide unusable controls. */
    public function me(Request $request): Response
    {
        $ctx = Context::current();

        if (!$ctx->isAuthenticated()) {
            throw new UnauthorizedException();
        }

        $user = \App\Core\Db::selectOne(
            'SELECT id, tenant_id, name, email, phone, role, locale, email_verified_at, last_login_at
               FROM users WHERE id = :id',
            ['id' => $ctx->userId()]
        );

        return Response::ok([
            'user' => [
                'id'          => (int) $user['id'],
                'name'        => $user['name'],
                'email'       => $user['email'],
                'phone'       => $user['phone'],
                'role'        => $user['role'],
                'locale'      => $user['locale'],
                'verified'    => $user['email_verified_at'] !== null,
                'permissions' => Permissions::forRole((string) $user['role']),
            ],
            'tenant'        => $ctx->tenant(),
            'subscription'  => $ctx->subscription(),
            'limits'        => $ctx->limits(),
            'impersonating' => $ctx->isImpersonating(),
        ]);
    }

    /** Usage meters for the dashboard. */
    public function usage(Request $request): Response
    {
        $quota = \App\Services\QuotaService::forTenant(Context::current()->tenantId());

        return Response::ok(['metrics' => $quota->snapshot()]);
    }
}
