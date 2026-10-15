<?php
declare(strict_types=1);

namespace App\Repositories;

/**
 * Instant replies are gate 6 in the message pipeline — the last gate before
 * the LLM, and the one that pays for itself. A hit costs ZERO tokens, and for
 * a typical shop these rules absorb a large share of all traffic.
 */
final class InstantReplyRepository extends BaseRepository
{
    protected string $table = 'instant_replies';

    /**
     * First matching rule, highest priority wins.
     *
     * Matching is done in PHP rather than SQL because the comparison has to
     * normalise BOTH sides — Unicode NFC, lowercase, punctuation stripped —
     * and additionally compare a Banglish transliteration. No SQL collation
     * does that, and a rule set is small enough (capped by faq_rule_limit)
     * that loading it is one indexed read.
     *
     * @return array<string,mixed>|null
     */
    public function findMatch(string $incoming, string $channelType = 'all'): ?array
    {
        $rules = $this->select(
            "SELECT id, match_type, keywords, reply_text, attachments, stop_ai, priority
               FROM instant_replies
              WHERE tenant_id = :t AND is_active = 1
                AND channel_scope IN ('all', :ch)
              ORDER BY priority DESC, id ASC",
            ['t' => $this->tenantId, 'ch' => $channelType]
        );

        if ($rules === []) {
            return null;
        }

        $normalized   = ProductRepository::normalize($incoming);
        $transliterated = ProductRepository::normalize(ProductRepository::transliterate($incoming));

        foreach ($rules as $rule) {
            $keywords = json_decode((string) $rule['keywords'], true);
            if (!is_array($keywords)) {
                continue;
            }

            foreach ($keywords as $keyword) {
                $needle = ProductRepository::normalize((string) $keyword);
                if ($needle === '') {
                    continue;
                }

                // Check both the raw normalised text and its transliteration,
                // so a Bangla rule matches a Banglish customer and vice versa.
                foreach ([$normalized, $transliterated] as $haystack) {
                    if ($this->matches((string) $rule['match_type'], $haystack, $needle)) {
                        return $rule;
                    }
                }
            }
        }

        return null;
    }

    private function matches(string $type, string $haystack, string $needle): bool
    {
        return match ($type) {
            'exact'       => $haystack === $needle,
            'starts_with' => str_starts_with($haystack, $needle),
            'regex'       => @preg_match('/' . str_replace('/', '\/', $needle) . '/iu', $haystack) === 1,
            default       => str_contains($haystack, $needle),
        };
    }

    public function recordHit(int $ruleId): void
    {
        $this->execute(
            'UPDATE instant_replies SET hit_count = hit_count + 1 WHERE id = :id AND tenant_id = :t',
            ['id' => $ruleId, 't' => $this->tenantId]
        );
    }

    /**
     * "Your FAQ rules saved you N AI messages this month" — showing owners the
     * money their own configuration earned is the best argument for writing
     * more rules.
     */
    public function savingsThisCycle(): array
    {
        $row = $this->selectOne(
            'SELECT COALESCE(SUM(hit_count), 0) AS hits, COUNT(*) AS rules
               FROM instant_replies WHERE tenant_id = :t AND is_active = 1',
            ['t' => $this->tenantId]
        ) ?? ['hits' => 0, 'rules' => 0];

        return ['hits' => (int) $row['hits'], 'rules' => (int) $row['rules']];
    }
}
