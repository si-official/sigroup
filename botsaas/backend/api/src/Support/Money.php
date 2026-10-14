<?php
declare(strict_types=1);

namespace App\Support;

use InvalidArgumentException;

/**
 * Money as integer paisa. Never a float.
 *
 * Why this class exists: 0.1 + 0.2 !== 0.3 in binary floating point. In an
 * order system that surfaces as a ৳1,247.00 order whose items sum to
 * ৳1,246.99, a courier COD amount that disagrees with the invoice by one
 * paisa, and a wallet balance that drifts over thousands of transactions.
 * Every one of those is a support ticket and a trust problem.
 *
 * So: 1 taka = 100 paisa, stored and computed as int. DECIMAL columns in
 * MySQL are exact too, but PHP reads them as strings and the moment anyone
 * writes `$a + $b` they are back in float arithmetic. This type makes that
 * mistake impossible to express.
 *
 * AI relevance: calculate_total() in the AI tool layer returns a Money, so
 * the figure the bot quotes a customer is the same integer the order row
 * stores and the courier charges.
 */
final class Money
{
    private int $paisa;

    private function __construct(int $paisa)
    {
        $this->paisa = $paisa;
    }

    public static function zero(): self
    {
        return new self(0);
    }

    public static function fromPaisa(int $paisa): self
    {
        return new self($paisa);
    }

    /**
     * From taka. Accepts int, or a numeric string (the form a DECIMAL column
     * and a JSON body both arrive as). Floats are accepted but rounded
     * immediately, so no float ever survives into arithmetic.
     */
    public static function fromTaka(int|float|string $taka): self
    {
        if (is_string($taka)) {
            $clean = trim(str_replace([',', '৳', ' '], '', $taka));
            // Also accept Bangla-Indic digits, which users do paste in.
            $clean = self::bengaliToAsciiDigits($clean);
            if ($clean === '' || !is_numeric($clean)) {
                throw new InvalidArgumentException("Not a valid money value: '{$taka}'");
            }
            $taka = (float) $clean;
        }

        // round() before int cast: (int)(19.99 * 100) is 1998 on many builds.
        return new self((int) round(((float) $taka) * 100));
    }

    public static function parseOrZero(mixed $value): self
    {
        try {
            if ($value === null || $value === '') {
                return self::zero();
            }
            return self::fromTaka(is_scalar($value) ? $value : 0);
        } catch (InvalidArgumentException) {
            return self::zero();
        }
    }

    public function paisa(): int
    {
        return $this->paisa;
    }

    public function taka(): float
    {
        return $this->paisa / 100;
    }

    /** Exact decimal string for a DECIMAL column. Never pass taka() to the DB. */
    public function toDecimalString(): string
    {
        $sign  = $this->paisa < 0 ? '-' : '';
        $abs   = abs($this->paisa);
        return sprintf('%s%d.%02d', $sign, intdiv($abs, 100), $abs % 100);
    }

    // ------------------------------------------------------------ arithmetic

    public function add(self ...$others): self
    {
        $sum = $this->paisa;
        foreach ($others as $o) {
            $sum += $o->paisa;
        }
        return new self($sum);
    }

    public function subtract(self $other): self
    {
        return new self($this->paisa - $other->paisa);
    }

    /** Multiply by a whole quantity. Exact. */
    public function multiply(int $quantity): self
    {
        return new self($this->paisa * $quantity);
    }

    /**
     * Multiply by a rate (a discount factor, an AI cost markup).
     * Rounds half-up at paisa, which is what invoices expect.
     */
    public function multiplyBy(float $rate): self
    {
        return new self((int) round($this->paisa * $rate));
    }

    public function percentage(float $percent): self
    {
        return new self((int) round($this->paisa * $percent / 100));
    }

    public function negate(): self
    {
        return new self(-$this->paisa);
    }

    public function absolute(): self
    {
        return new self(abs($this->paisa));
    }

    /**
     * Split into n parts with no paisa lost. The remainder is distributed one
     * paisa at a time across the first parts, so the parts always sum exactly
     * back to the original — the standard allocation rule, and the reason
     * dividing money by 3 does not silently lose a paisa.
     *
     * @return self[]
     */
    public function allocate(int $parts): array
    {
        if ($parts < 1) {
            throw new InvalidArgumentException('Cannot allocate into fewer than 1 part.');
        }

        $base      = intdiv($this->paisa, $parts);
        $remainder = $this->paisa - ($base * $parts);

        $result = [];
        for ($i = 0; $i < $parts; $i++) {
            $result[] = new self($base + ($i < abs($remainder) ? ($remainder <=> 0) : 0));
        }
        return $result;
    }

    // ------------------------------------------------------------ comparison

    public function equals(self $other): bool            { return $this->paisa === $other->paisa; }
    public function greaterThan(self $other): bool       { return $this->paisa > $other->paisa; }
    public function greaterOrEqual(self $other): bool    { return $this->paisa >= $other->paisa; }
    public function lessThan(self $other): bool          { return $this->paisa < $other->paisa; }
    public function lessOrEqual(self $other): bool       { return $this->paisa <= $other->paisa; }
    public function isZero(): bool                       { return $this->paisa === 0; }
    public function isPositive(): bool                   { return $this->paisa > 0; }
    public function isNegative(): bool                   { return $this->paisa < 0; }

    public static function max(self ...$values): self
    {
        $max = array_shift($values) ?? self::zero();
        foreach ($values as $v) {
            if ($v->greaterThan($max)) {
                $max = $v;
            }
        }
        return $max;
    }

    // ------------------------------------------------------------ formatting

    /**
     * Display form. $locale 'bn' renders Bangla-Indic digits, which is what
     * customers in a Messenger thread expect to read.
     */
    public function format(string $locale = 'bn', bool $withSymbol = true): string
    {
        $formatted = number_format($this->taka(), 2, '.', ',');

        // Drop a pointless ".00" — invoices read better as ৳1,250
        if (str_ends_with($formatted, '.00')) {
            $formatted = substr($formatted, 0, -3);
        }

        if ($locale === 'bn') {
            $formatted = self::asciiToBengaliDigits($formatted);
        }

        return $withSymbol ? '৳' . $formatted : $formatted;
    }

    public function __toString(): string
    {
        return $this->toDecimalString();
    }

    // ------------------------------------------------------- digit transcoding

    private const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

    public static function asciiToBengaliDigits(string $s): string
    {
        return str_replace(['0','1','2','3','4','5','6','7','8','9'], self::BN_DIGITS, $s);
    }

    public static function bengaliToAsciiDigits(string $s): string
    {
        return str_replace(self::BN_DIGITS, ['0','1','2','3','4','5','6','7','8','9'], $s);
    }
}
