<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Core\Context;
use App\Core\FeatureNotInPlanException;
use App\Core\Logger;
use App\Core\Request;
use App\Core\Response;

/**
 * Boolean feature gate. Distinct from the quota gate (Phase 3's QuotaService):
 * this answers "does your plan include this at all", not "have you used it up".
 *
 * Returns 402 with feature, label and upgrade_url in details, so the panel can
 * render its locked-feature card from the error alone — no second request, and
 * no hardcoded copy duplicated in the frontend.
 */
final class RequirePackageFeature implements MiddlewareInterface
{
    /** Human labels, so the upsell copy lives in one place. */
    private const LABELS = [
        'wa_enabled'             => 'WhatsApp Bot',
        'ig_enabled'             => 'Instagram Messaging',
        'widget_enabled'         => 'Website Live Chat Widget',
        'courier_enabled'        => 'Courier Integration',
        'shop_assistant_enabled' => 'Shop Assistant',
        'api_access_enabled'     => 'API Access',
        'fb_enabled'             => 'Facebook Messenger',
    ];

    public function __construct(private string $feature)
    {
    }

    public function handle(Request $request, callable $next): Response
    {
        $ctx = Context::current();

        // Voice is tri-state ('none'|'stt'|'both'), not a boolean.
        if ($this->feature === 'voice_stt' || $this->feature === 'voice_tts') {
            $mode = (string) $ctx->limit('voice_mode', 'none');
            $ok = $this->feature === 'voice_stt'
                ? in_array($mode, ['stt', 'both'], true)
                : $mode === 'both';

            if (!$ok) {
                throw new FeatureNotInPlanException(
                    $this->feature,
                    $this->feature === 'voice_stt' ? 'Voice AI (speech to text)' : 'Voice AI (voice replies)'
                );
            }
            return $next($request);
        }

        if (!$ctx->hasFeature($this->feature)) {
            Logger::info('feature.gate_blocked', [
                'feature' => $this->feature,
                'source'  => $ctx->limit('_source'),
                'path'    => $request->path(),
            ]);

            throw new FeatureNotInPlanException(
                $this->feature,
                self::LABELS[$this->feature] ?? $this->feature
            );
        }

        return $next($request);
    }
}
