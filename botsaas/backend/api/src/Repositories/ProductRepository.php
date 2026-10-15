<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Core\Db;

final class ProductRepository extends BaseRepository
{
    protected string $table = 'products';

    /**
     * Product lookup for the AI tool layer.
     *
     * THE BANGLA/BANGLISH PROBLEM, and why this is not just a FULLTEXT query:
     *
     * MySQL and MariaDB FULLTEXT cannot match across scripts. A customer who
     * types "shari", "saree" or "Shari" will never match a product named
     * "শাড়ি" — and Banglish is how a very large share of Bangladeshi
     * customers actually type. A pure FULLTEXT implementation looks correct
     * in testing (because the developer tests in one script) and then fails
     * for half of real traffic.
     *
     * There is a second trap: InnoDB FULLTEXT ignores tokens shorter than
     * innodb_ft_min_token_size (3 by default), so short Bangla product names
     * are simply invisible to it.
     *
     * So this runs a three-tier search and stops at the first tier that hits:
     *   1. FULLTEXT in NATURAL LANGUAGE MODE  — best relevance ranking
     *   2. search_blob LIKE                   — cross-script, catches Banglish
     *   3. per-token LIKE over name/keywords  — last resort, still bounded
     *
     * @return array<int,array<string,mixed>>
     */
    public function searchForAi(string $query, int $limit = 8): array
    {
        $limit = max(1, min($limit, 25));
        $query = trim($query);

        if ($query === '') {
            return $this->topProducts($limit);
        }

        // --- tier 1: FULLTEXT relevance ---
        $boolean = $this->toBooleanQuery($query);
        if ($boolean !== '') {
            $rows = $this->select(
                "SELECT id, name, description, price, sale_price, stock, track_stock,
                        images, attributes, ai_note,
                        MATCH(name, description, ai_keywords) AGAINST (:q IN BOOLEAN MODE) AS score
                   FROM products
                  WHERE tenant_id = :t
                    AND status = 'active'
                    AND MATCH(name, description, ai_keywords) AGAINST (:q2 IN BOOLEAN MODE)
                  ORDER BY score DESC, sort_order ASC
                  LIMIT {$limit}",
                ['q' => $boolean, 't' => $this->tenantId, 'q2' => $boolean]
            );

            if ($rows !== []) {
                return $this->withVariants($rows);
            }
        }

        // --- tier 2: normalised blob, cross-script ---
        $norm = self::normalize($query);
        if ($norm !== '') {
            $rows = $this->select(
                "SELECT id, name, description, price, sale_price, stock, track_stock,
                        images, attributes, ai_note
                   FROM products
                  WHERE tenant_id = :t AND status = 'active'
                    AND search_blob LIKE :q
                  ORDER BY sort_order ASC, id DESC
                  LIMIT {$limit}",
                ['t' => $this->tenantId, 'q' => '%' . $norm . '%']
            );

            if ($rows !== []) {
                return $this->withVariants($rows);
            }
        }

        // --- tier 3: per-token LIKE ---
        $tokens = array_slice(array_filter(preg_split('/\s+/u', $norm) ?: [], static fn ($t) => mb_strlen($t) >= 2), 0, 4);

        if ($tokens !== []) {
            $clauses  = [];
            $bindings = ['t' => $this->tenantId];

            foreach ($tokens as $i => $token) {
                $clauses[] = "(search_blob LIKE :k{$i} OR name LIKE :n{$i})";
                $bindings["k{$i}"] = '%' . $token . '%';
                $bindings["n{$i}"] = '%' . $token . '%';
            }

            $rows = $this->select(
                "SELECT id, name, description, price, sale_price, stock, track_stock,
                        images, attributes, ai_note
                   FROM products
                  WHERE tenant_id = :t AND status = 'active'
                    AND (" . implode(' OR ', $clauses) . ")
                  ORDER BY sort_order ASC, id DESC
                  LIMIT {$limit}",
                $bindings
            );

            if ($rows !== []) {
                return $this->withVariants($rows);
            }
        }

        return [];
    }

    /** Compact lines for the prompt — never the whole catalogue. */
    public function formatForPrompt(array $products): string
    {
        $lines = [];

        foreach ($products as $p) {
            $price = $p['sale_price'] !== null && (float) $p['sale_price'] > 0
                ? $p['sale_price'] . ' (reg ' . $p['price'] . ')'
                : $p['price'];

            $stock = (int) $p['track_stock'] === 0
                ? 'in stock'
                : ((int) $p['stock'] > 0 ? $p['stock'] . ' left' : 'OUT OF STOCK');

            $line = sprintf('#%d %s | ৳%s | %s', $p['id'], $p['name'], $price, $stock);

            if (!empty($p['variants'])) {
                $line .= ' | ' . implode(', ', array_map(
                    static fn (array $v) => $v['option_name'] . ': ' . $v['option_value'],
                    $p['variants']
                ));
            }
            if (!empty($p['ai_note'])) {
                $line .= ' | NOTE: ' . $p['ai_note'];
            }

            $lines[] = $line;
        }

        return implode("\n", $lines);
    }

    public function topProducts(int $limit = 8): array
    {
        return $this->withVariants($this->select(
            "SELECT id, name, description, price, sale_price, stock, track_stock,
                    images, attributes, ai_note
               FROM products
              WHERE tenant_id = :t AND status = 'active'
              ORDER BY sort_order ASC, id DESC
              LIMIT " . max(1, min($limit, 25)),
            ['t' => $this->tenantId]
        ));
    }

    public function lowStock(?int $threshold = null, int $limit = 50): array
    {
        return $this->select(
            'SELECT id, name, stock, low_stock_at, price
               FROM products
              WHERE tenant_id = :t AND status = \'active\' AND track_stock = 1
                AND stock <= COALESCE(:th, low_stock_at)
              ORDER BY stock ASC
              LIMIT ' . max(1, min($limit, 200)),
            ['t' => $this->tenantId, 'th' => $threshold]
        );
    }

    /**
     * Stock decrement that cannot oversell.
     *
     * Same conditional-UPDATE shape as the quota counter: the comparison lives
     * inside the write, so two simultaneous orders for the last unit cannot
     * both succeed. Returns false when there was not enough stock.
     */
    public function decrementStock(int $productId, int $qty): bool
    {
        $affected = $this->execute(
            "UPDATE products
                SET stock = stock - :q,
                    status = IF(stock - :q2 <= 0 AND track_stock = 1, 'out_of_stock', status)
              WHERE id = :id AND tenant_id = :t
                AND (track_stock = 0 OR stock >= :q3)",
            ['q' => $qty, 'q2' => $qty, 'id' => $productId, 't' => $this->tenantId, 'q3' => $qty]
        );

        return $affected > 0;
    }

    public function restoreStock(int $productId, int $qty): void
    {
        $this->execute(
            "UPDATE products
                SET stock = stock + :q,
                    status = IF(status = 'out_of_stock', 'active', status)
              WHERE id = :id AND tenant_id = :t",
            ['q' => $qty, 'id' => $productId, 't' => $this->tenantId]
        );
    }

    /** Rebuild search_blob. Called on every create/update. */
    public function refreshSearchBlob(int $productId): void
    {
        $p = $this->find($productId, ['id', 'name', 'ai_keywords', 'sku']);
        if ($p === null) {
            return;
        }

        $blob = self::normalize(implode(' ', array_filter([
            $p['name'],
            $p['ai_keywords'],
            $p['sku'],
            self::transliterate((string) $p['name']),
        ])));

        $this->execute(
            'UPDATE products SET search_blob = :b WHERE id = :id AND tenant_id = :t',
            ['b' => $blob, 'id' => $productId, 't' => $this->tenantId]
        );
    }

    /** @return array<int,array<string,mixed>> */
    private function withVariants(array $products): array
    {
        if ($products === []) {
            return [];
        }

        // One extra query for all variants, not one per product.
        $ids = array_map(static fn (array $p) => (int) $p['id'], $products);
        $in  = implode(',', $ids);

        $variants = $this->select(
            "SELECT product_id, option_name, option_value, price_delta, stock
               FROM product_variants
              WHERE tenant_id = :t AND product_id IN ({$in})",
            ['t' => $this->tenantId]
        );

        $byProduct = [];
        foreach ($variants as $v) {
            $byProduct[(int) $v['product_id']][] = $v;
        }

        foreach ($products as &$p) {
            $p['variants'] = $byProduct[(int) $p['id']] ?? [];
        }

        return $products;
    }

    /** '+token*' per word, so FULLTEXT does prefix matching and ANDs terms. */
    private function toBooleanQuery(string $query): string
    {
        $parts = preg_split('/[\s,.]+/u', $query) ?: [];
        $terms = [];

        foreach ($parts as $part) {
            $clean = preg_replace('/[+\-><()~*"@]+/u', '', $part) ?? '';
            // Below innodb_ft_min_token_size FULLTEXT ignores the token anyway.
            if (mb_strlen($clean, 'UTF-8') >= 3) {
                $terms[] = $clean . '*';
            }
        }

        return implode(' ', array_slice($terms, 0, 6));
    }

    /** Lowercase, strip punctuation, collapse whitespace, NFC-normalise. */
    public static function normalize(string $s): string
    {
        if (class_exists(\Normalizer::class)) {
            $n = \Normalizer::normalize($s, \Normalizer::FORM_C);
            if ($n !== false) {
                $s = $n;
            }
        }

        $s = mb_strtolower($s, 'UTF-8');
        $s = preg_replace('/[^\p{L}\p{N}\s]+/u', ' ', $s) ?? $s;
        $s = preg_replace('/\s+/u', ' ', $s) ?? $s;

        return trim($s);
    }

    /**
     * Rough Bangla -> Latin transliteration, so a product named "শাড়ি" also
     * indexes as "shari" and matches a customer typing Banglish.
     *
     * Deliberately approximate: it feeds a LIKE index, not a dictionary.
     */
    public static function transliterate(string $bangla): string
    {
        static $map = [
            'ক্ষ' => 'kkh', 'জ্ঞ' => 'gg', 'ঙ্গ' => 'ng',
            'অ' => 'o', 'আ' => 'a', 'ই' => 'i', 'ঈ' => 'i', 'উ' => 'u', 'ঊ' => 'u',
            'ঋ' => 'ri', 'এ' => 'e', 'ঐ' => 'oi', 'ও' => 'o', 'ঔ' => 'ou',
            'ক' => 'k', 'খ' => 'kh', 'গ' => 'g', 'ঘ' => 'gh', 'ঙ' => 'ng',
            'চ' => 'ch', 'ছ' => 'chh', 'জ' => 'j', 'ঝ' => 'jh', 'ঞ' => 'n',
            'ট' => 't', 'ঠ' => 'th', 'ড' => 'd', 'ঢ' => 'dh', 'ণ' => 'n',
            'ত' => 't', 'থ' => 'th', 'দ' => 'd', 'ধ' => 'dh', 'ন' => 'n',
            'প' => 'p', 'ফ' => 'f', 'ব' => 'b', 'ভ' => 'bh', 'ম' => 'm',
            'য' => 'j', 'র' => 'r', 'ল' => 'l', 'শ' => 'sh', 'ষ' => 'sh',
            'স' => 's', 'হ' => 'h', 'ড়' => 'r', 'ঢ়' => 'rh', 'য়' => 'y', 'ৎ' => 't',
            'া' => 'a', 'ি' => 'i', 'ী' => 'i', 'ু' => 'u', 'ূ' => 'u', 'ৃ' => 'ri',
            'ে' => 'e', 'ৈ' => 'oi', 'ো' => 'o', 'ৌ' => 'ou',
            '্' => '', 'ং' => 'ng', 'ঃ' => '', 'ঁ' => '',
        ];

        return strtr($bangla, $map);
    }
}
