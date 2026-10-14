<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Single boot path shared by the HTTP front controller, the cron worker and
 * the CLI. One place where env is loaded, required keys are asserted, the
 * timezone is set and errors are wired — so a cron job can never run with a
 * different configuration than a web request.
 */
final class Bootstrap
{
    private static bool $booted = false;

    public static function boot(string $basePath): void
    {
        if (self::$booted) {
            return;
        }

        // NOTE: the Composer autoloader is required by the ENTRY POINT, not
        // here — this class cannot load itself. Entry points must do:
        //     require __DIR__ . '/../vendor/autoload.php';
        //     Bootstrap::boot(__DIR__ . '/..');
        Env::load($basePath);
        Env::assertRequired();
        Logger::init($basePath);

        // All internal time is UTC; tenant-facing rendering converts to the
        // tenant's timezone. Mixing the two is how "today's sales" ends up
        // six hours wrong for a shop in Dhaka.
        date_default_timezone_set('UTC');
        mb_internal_encoding('UTF-8');

        // Errors become exceptions, so nothing is swallowed as a warning.
        set_error_handler(static function (int $severity, string $message, string $file, int $line): bool {
            if ((error_reporting() & $severity) === 0) {
                return false;
            }
            throw new \ErrorException($message, 0, $severity, $file, $line);
        });

        // Never print errors into a JSON response body.
        ini_set('display_errors', '0');
        ini_set('log_errors', '1');
        error_reporting(E_ALL);

        self::$booted = true;
    }

    public static function basePath(): string
    {
        return dirname(__DIR__, 2);
    }
}
