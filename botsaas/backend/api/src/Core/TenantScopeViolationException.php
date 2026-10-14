<?php
declare(strict_types=1);

namespace App\Core;

use RuntimeException;

/**
 * Thrown by BaseRepository when a query touches a tenant-owned table without
 * a tenant scope. This is a programming error AND a security bug, so it is a
 * hard crash rather than anything catchable-and-ignorable. Never catch this to
 * work around it; fix the query.
 */
final class TenantScopeViolationException extends RuntimeException
{
}
