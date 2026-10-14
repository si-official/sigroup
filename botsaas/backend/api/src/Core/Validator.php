<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Declarative validator. Rules as 'required|string|max:255' or as arrays.
 * Returns field => messages[] and throws ValidationException on failure.
 *
 * Bangla-correctness rules, which is why this is hand-rolled rather than
 * borrowed:
 *  - every length check uses mb_strlen, so "আপনার নাম" is 9 characters and
 *    not 25 bytes. strlen() here would reject valid Bangla names and
 *    truncate mid-codepoint, producing the mojibake these products are
 *    famous for.
 *  - strings are normalised to Unicode NFC before comparison, so two
 *    visually identical Bangla inputs compare equal.
 */
final class Validator
{
    /** @var array<string,string[]> */
    private array $errors = [];
    /** @var array<string,mixed> */
    private array $validated = [];

    /** @param array<string,mixed> $data @param array<string,string|array> $rules */
    public function __construct(private array $data, private array $rules, private array $messages = [])
    {
    }

    /** @return array<string,mixed> the validated subset */
    public static function validate(array $data, array $rules, array $messages = []): array
    {
        $v = new self($data, $rules, $messages);
        if (!$v->passes()) {
            throw new ValidationException($v->errors());
        }
        return $v->validated();
    }

    public function passes(): bool
    {
        foreach ($this->rules as $field => $ruleSet) {
            $rules = is_string($ruleSet) ? explode('|', $ruleSet) : $ruleSet;
            $value = $this->get($field);

            $isRequired = in_array('required', $rules, true);
            $isNullable = in_array('nullable', $rules, true);

            if ($this->isEmpty($value)) {
                if ($isRequired) {
                    $this->fail($field, 'required', 'This field is required.');
                } elseif ($isNullable || !$isRequired) {
                    $this->validated[$field] = $value === '' ? null : $value;
                }
                continue;
            }

            foreach ($rules as $rule) {
                if (in_array($rule, ['required', 'nullable'], true)) {
                    continue;
                }
                [$name, $arg] = array_pad(explode(':', $rule, 2), 2, null);
                $this->applyRule($field, $name, $arg, $value);
            }

            if (!isset($this->errors[$field])) {
                $this->validated[$field] = $this->cast($rules, $value);
            }
        }

        return $this->errors === [];
    }

    private function applyRule(string $field, string $name, ?string $arg, mixed $value): void
    {
        switch ($name) {
            case 'string':
                if (!is_string($value)) {
                    $this->fail($field, 'string', 'Must be text.');
                }
                break;

            case 'int':
            case 'integer':
                if (!is_int($value) && !(is_string($value) && preg_match('/^-?\d+$/', $value) === 1)) {
                    $this->fail($field, 'integer', 'Must be a whole number.');
                }
                break;

            case 'numeric':
                if (!is_numeric($value)) {
                    $this->fail($field, 'numeric', 'Must be a number.');
                }
                break;

            case 'bool':
            case 'boolean':
                if (!is_bool($value) && !in_array($value, [0, 1, '0', '1', 'true', 'false'], true)) {
                    $this->fail($field, 'boolean', 'Must be true or false.');
                }
                break;

            case 'array':
                if (!is_array($value)) {
                    $this->fail($field, 'array', 'Must be a list.');
                }
                break;

            case 'email':
                if (!is_string($value) || filter_var($value, FILTER_VALIDATE_EMAIL) === false) {
                    $this->fail($field, 'email', 'Must be a valid email address.');
                }
                break;

            case 'url':
                if (!is_string($value) || filter_var($value, FILTER_VALIDATE_URL) === false) {
                    $this->fail($field, 'url', 'Must be a valid URL.');
                }
                break;

            // Bangladeshi mobile: 01[3-9] + 8 digits, with or without +88.
            case 'bd_phone':
                $normalized = preg_replace('/[\s\-()]/', '', (string) $value);
                if (preg_match('/^(?:\+?88)?01[3-9]\d{8}$/', (string) $normalized) !== 1) {
                    $this->fail($field, 'bd_phone', 'Must be a valid Bangladeshi mobile number (01XXXXXXXXX).');
                }
                break;

            case 'min':
                if (is_string($value)) {
                    if (mb_strlen($value, 'UTF-8') < (int) $arg) {
                        $this->fail($field, 'min', "Must be at least {$arg} characters.");
                    }
                } elseif (is_numeric($value) && $value < (float) $arg) {
                    $this->fail($field, 'min', "Must be at least {$arg}.");
                } elseif (is_array($value) && count($value) < (int) $arg) {
                    $this->fail($field, 'min', "Select at least {$arg}.");
                }
                break;

            case 'max':
                // mb_strlen, always — see the class docblock.
                if (is_string($value)) {
                    if (mb_strlen($value, 'UTF-8') > (int) $arg) {
                        $this->fail($field, 'max', "Must not exceed {$arg} characters.");
                    }
                } elseif (is_numeric($value) && $value > (float) $arg) {
                    $this->fail($field, 'max', "Must not exceed {$arg}.");
                } elseif (is_array($value) && count($value) > (int) $arg) {
                    $this->fail($field, 'max', "Select no more than {$arg}.");
                }
                break;

            case 'in':
                $allowed = explode(',', (string) $arg);
                if (!in_array((string) $value, $allowed, true)) {
                    $this->fail($field, 'in', 'Must be one of: ' . implode(', ', $allowed) . '.');
                }
                break;

            case 'regex':
                if (!is_string($value) || preg_match((string) $arg, $value) !== 1) {
                    $this->fail($field, 'regex', 'Format is invalid.');
                }
                break;

            case 'date':
                if (strtotime((string) $value) === false) {
                    $this->fail($field, 'date', 'Must be a valid date.');
                }
                break;

            case 'confirmed':
                if ($this->get($field . '_confirmation') !== $value) {
                    $this->fail($field, 'confirmed', 'Confirmation does not match.');
                }
                break;

            // Password policy. Deliberately length-first: a 12-character
            // Bangla or Banglish passphrase beats a mandated "P@ss1" that
            // every user writes on a sticky note.
            case 'password':
                $str = (string) $value;
                if (mb_strlen($str, 'UTF-8') < 8) {
                    $this->fail($field, 'password', 'Password must be at least 8 characters.');
                } elseif (preg_match('/[A-Za-z\x{0980}-\x{09FF}]/u', $str) !== 1 || preg_match('/\d/', $str) !== 1) {
                    $this->fail($field, 'password', 'Password must contain at least one letter and one number.');
                }
                break;

            case 'slug':
                if (preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', (string) $value) !== 1) {
                    $this->fail($field, 'slug', 'Must be lowercase letters, numbers and hyphens only.');
                }
                break;

            case 'json':
                if (!is_string($value) || json_decode($value) === null) {
                    $this->fail($field, 'json', 'Must be valid JSON.');
                }
                break;
        }
    }

    private function cast(array $rules, mixed $value): mixed
    {
        if (is_string($value)) {
            // NFC-normalise so equivalent Bangla sequences compare and store
            // identically, then trim.
            if (class_exists(\Normalizer::class)) {
                $normalized = \Normalizer::normalize($value, \Normalizer::FORM_C);
                if ($normalized !== false) {
                    $value = $normalized;
                }
            }
            $value = trim($value);
        }
        if (in_array('int', $rules, true) || in_array('integer', $rules, true)) {
            return (int) $value;
        }
        if (in_array('bool', $rules, true) || in_array('boolean', $rules, true)) {
            return in_array($value, [true, 1, '1', 'true'], true);
        }
        if (in_array('numeric', $rules, true)) {
            return (float) $value;
        }
        if (in_array('bd_phone', $rules, true)) {
            // Store one canonical form: 01XXXXXXXXX, no country code.
            $digits = preg_replace('/\D/', '', (string) $value);
            return '0' . substr($digits, -10);
        }
        return $value;
    }

    private function get(string $field): mixed
    {
        if (!str_contains($field, '.')) {
            return $this->data[$field] ?? null;
        }
        $data = $this->data;
        foreach (explode('.', $field) as $segment) {
            if (!is_array($data) || !array_key_exists($segment, $data)) {
                return null;
            }
            $data = $data[$segment];
        }
        return $data;
    }

    private function isEmpty(mixed $v): bool
    {
        return $v === null || $v === '' || (is_array($v) && $v === []);
    }

    private function fail(string $field, string $rule, string $message): void
    {
        $this->errors[$field][] = $this->messages["{$field}.{$rule}"] ?? $this->messages[$field] ?? $message;
    }

    /** @return array<string,string[]> */
    public function errors(): array { return $this->errors; }

    /** @return array<string,mixed> */
    public function validated(): array { return $this->validated; }
}
