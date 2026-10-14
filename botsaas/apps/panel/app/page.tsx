'use client';

import { useEffect, useState } from 'react';
import { health, type HealthStatus, ApiRequestError } from '@/lib/api';

/**
 * Phase 1 placeholder. It exists to prove the full chain end to end —
 * static export -> client fetch -> PHP API -> MySQL -> envelope -> render —
 * before Phase 5 builds the real shell on top.
 */
export default function Page() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    health()
      .then(setStatus)
      .catch((e: unknown) => {
        setError(e instanceof ApiRequestError ? `${e.code}: ${e.message}` : 'Unknown error');
      });
  }, []);

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold">Chat Commerce</h1>
      <p className="mt-1 text-content-muted">Phase 1 — foundation</p>

      <section className="mt-6 rounded-card border border-border bg-surface-2 p-4">
        <h2 className="font-medium">API connection</h2>

        {status === null && error === null && (
          <div className="mt-3 h-4 w-32 animate-pulse rounded bg-border" aria-label="Loading" />
        )}

        {status !== null && (
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="text-content-muted">Database</dt>
              <dd className={status.db === 'up' ? 'text-success' : 'text-danger'}>{status.db}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-content-muted">Version</dt>
              <dd>{status.version}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-content-muted">Environment</dt>
              <dd>{status.env}</dd>
            </div>
          </dl>
        )}

        {error !== null && (
          <p className="mt-3 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
