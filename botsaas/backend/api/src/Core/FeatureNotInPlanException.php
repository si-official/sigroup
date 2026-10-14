<?php
declare(strict_types=1);

namespace App\Core;

/**
 * 402: the plan does not include this feature at all.
 * Carries enough detail for the panel to render its locked-feature card from
 * the error alone — no second request, no duplicated copy in the frontend.
 */
final class FeatureNotInPlanException extends ApiException
{
    public function __construct(string $feature, string $label, ?string $upgradeUrl = null)
    {
        parent::__construct(
            'FEATURE_NOT_IN_PLAN',
            "Your current plan does not include {$label}.",
            402,
            [
                'feature'       => $feature,
                'feature_label' => $label,
                'upgrade_url'   => $upgradeUrl ?? '/subscription/packages',
            ]
        );
    }
}
