<?php
declare(strict_types=1);

namespace App\Core;

use Throwable;

/**
 * JSON-lines logger with daily rotation.
 *
 * One line per event, machine-greppable, because on shared hosting the only
 * debugging tool you reliably have is `grep` over a file. Every line carries
 * the request id so a single customer message can be traced from webhook
 * through job through LLM call through send.
 */
final class Logger
{
    public const DEBUG    = 10;
    public const INFO     = 20;
    public const WARNING  = 30;
    public const ERROR    = 40;
    public const CRITICAL = 50;

    private const NAMES = [
        self::DEBUG => 'debug', self::INFO => 'info', self::WARNING => 'warning',
        self::ERROR => 'error', self::CRITICAL => 'critical',
    ];

    private static ?string $requestId = null;
    private static ?string $basePath  = null;
    private static int $minLevel      = self::DEBUG;
    /** @var array<string,mixed> Context merged into every line (tenant_id, user_id, job id). */
    private static array $global      = [];

    public static function init(string $basePath): void
    {
        self::$basePath = $basePath;
        self::$minLevel = match (strtolower(Env::string('LOG_LEVEL', 'debug'))) {
            'info'     => self::INFO,
            'warning'  => self::WARNING,
            'error'    => self::ERROR,
            'critical' => self::CRITICAL,
            default    => self::DEBUG,
        };
    }

    public static function requestId(): string
    {
        return self::$requestId ??= bin2hex(random_bytes(8));
    }

    public static function setRequestId(string $id): void
    {
        self::$requestId = $id;
    }

    /** @param array<string,mixed> $context */
    public static function withContext(array $context): void
    {
        self::$global = array_merge(self::$global, $context);
    }

    public static function clearContext(): void
    {
        self::$global = [];
    }

    public static function debug(string $event, array $context = []): void    { self::log(self::DEBUG, $event, $context); }
    public static function info(string $event, array $context = []): void     { self::log(self::INFO, $event, $context); }
    public static function warning(string $event, array $context = []): void  { self::log(self::WARNING, $event, $context); }
    public static function error(string $event, array $context = []): void    { self::log(self::ERROR, $event, $context); }
    public static function critical(string $event, array $context = []): void { self::log(self::CRITICAL, $event, $context); }

    public static function exception(Throwable $e, string $event = 'exception', array $context = []): void
    {
        self::log(self::ERROR, $event, $context + [
            'class'   => get_class($e),
            'message' => $e->getMessage(),
            'file'    => $e->getFile() . ':' . $e->getLine(),
            'trace'   => array_slice(explode("\n", $e->getTraceAsString()), 0, 12),
        ]);
    }

    /** @param array<string,mixed> $context */
    private static function log(int $level, string $event, array $context): void
    {
        if ($level < self::$minLevel) {
            return;
        }

        $line = [
            'ts'    => gmdate('Y-m-d\TH:i:s\Z'),
            'level' => self::NAMES[$level],
            'event' => $event,
            'rid'   => self::requestId(),
        ] + self::$global + ['ctx' => self::redact($context)];

        $json = json_encode(
            $line,
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE
        );

        $dir  = (self::$basePath ?? getcwd()) . '/' . Env::string('LOG_PATH', 'storage/logs');
        if (!is_dir($dir)) {
            @mkdir($dir, 0775, true);
        }
        $file = $dir . '/app-' . gmdate('Y-m-d') . '.log';

        // LOCK_EX keeps concurrent webhook writes from interleaving mid-line.
        @file_put_contents($file, $json . PHP_EOL, FILE_APPEND | LOCK_EX);

        if ($level >= self::ERROR) {
            @file_put_contents($dir . '/error-' . gmdate('Y-m-d') . '.log', $json . PHP_EOL, FILE_APPEND | LOCK_EX);
        }
    }

    /**
     * Strip anything that must never reach a log file. Logs get pasted into
     * chat and support tickets; a leaked page access token is a real incident.
     */
    private static function redact(array $context): array
    {
        $secretish = ['password', 'password_hash', 'token', 'access_token', 'refresh_token',
                      'api_key', 'secret', 'app_secret', 'authorization', 'credentials',
                      'jwt', 'private_key', 'card'];

        foreach ($context as $key => $value) {
            $lower = strtolower((string) $key);
            foreach ($secretish as $needle) {
                if (str_contains($lower, $needle)) {
                    $context[$key] = '[redacted]';
                    continue 2;
                }
            }
            if (is_array($value)) {
                $context[$key] = self::redact($value);
            } elseif (is_string($value) && mb_strlen($value) > 2000) {
                $context[$key] = mb_substr($value, 0, 2000) . '…[truncated]';
            }
        }
        return $context;
    }

    /** Called by the retention cron. */
    public static function prune(int $retentionDays): int
    {
        $dir = (self::$basePath ?? getcwd()) . '/' . Env::string('LOG_PATH', 'storage/logs');
        if (!is_dir($dir)) {
            return 0;
        }
        $cutoff  = time() - ($retentionDays * 86400);
        $deleted = 0;
        foreach (glob($dir . '/*.log') ?: [] as $file) {
            if (filemtime($file) < $cutoff) {
                @unlink($file);
                $deleted++;
            }
        }
        return $deleted;
    }
}
