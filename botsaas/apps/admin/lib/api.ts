/**
 * The single API client. Every network call in the admin panel goes through here.
 *
 * CONSTRAINT 1 shapes this file: the frontend is a static export, so there is
 * no server to hold a session. The access token lives in memory and the
 * refresh token in localStorage, and this module owns the whole token
 * lifecycle because spreading it across components guarantees one of them
 * forgets to refresh.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

// ---------------------------------------------------------------- envelope ---

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type ApiEnvelope<T> =
  | { ok: true; data: T; meta?: Record<string, unknown> }
  | { ok: false; error: ApiError };

export type Page<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
};

/**
 * Thrown for every non-2xx response. Carries the server's error code so
 * callers branch on a stable string rather than parsing a message.
 */
export class ApiRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }

  /** 422 field errors, ready to drop onto form inputs. */
  get fieldErrors(): Record<string, string[]> {
    const fields = this.details?.fields;
    return typeof fields === 'object' && fields !== null ? (fields as Record<string, string[]>) : {};
  }

  /** 402 FEATURE_NOT_IN_PLAN — render the locked card from this. */
  get lockedFeature(): { feature: string; label: string; upgradeUrl: string } | null {
    if (this.code !== 'FEATURE_NOT_IN_PLAN') return null;
    return {
      feature: String(this.details?.feature ?? ''),
      label: String(this.details?.feature_label ?? ''),
      upgradeUrl: String(this.details?.upgrade_url ?? '/subscription/packages'),
    };
  }

  /** 402 QUOTA_EXCEEDED — render the usage-limit prompt from this. */
  get quota(): { metric: string; used: number; limit: number } | null {
    if (this.code !== 'QUOTA_EXCEEDED') return null;
    return {
      metric: String(this.details?.metric ?? ''),
      used: Number(this.details?.used ?? 0),
      limit: Number(this.details?.limit ?? 0),
    };
  }
}

// ------------------------------------------------------------------ tokens ---

const REFRESH_KEY = 'cc.admin.refresh';

let accessToken: string | null = null;
let accessExpiresAt = 0;

/** In memory only: an access token in localStorage is readable by any XSS. */
export function setAccessToken(token: string | null, ttlSeconds = 900): void {
  accessToken = token;
  accessExpiresAt = token ? Date.now() + (ttlSeconds - 60) * 1000 : 0;
}

export function setRefreshToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(REFRESH_KEY, token);
    else localStorage.removeItem(REFRESH_KEY);
  } catch {
    // Private mode or blocked storage: the session simply will not survive a
    // reload. Degrade rather than crash.
  }
}

function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return accessToken !== null || getRefreshToken() !== null;
}

export function clearSession(): void {
  setAccessToken(null);
  setRefreshToken(null);
}

// Concurrent 401s must trigger ONE refresh, not one per in-flight request —
// otherwise a dashboard firing six calls at once rotates the refresh token six
// times and five of them lose the race and log the user out.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  const refresh = getRefreshToken();
  if (!refresh) return false;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      });

      const body = (await res.json()) as ApiEnvelope<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
      }>;

      if (!res.ok || !body.ok) {
        clearSession();
        return false;
      }

      setAccessToken(body.data.access_token, body.data.expires_in);
      setRefreshToken(body.data.refresh_token); // rotation
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

// --------------------------------------------------------------- the client ---

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  /** Skip auth entirely (login, register, password reset). */
  anonymous?: boolean;
  timeoutMs?: number;
};

async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const { method = 'GET', body, query, anonymous = false, timeoutMs = 30_000 } = options;

  // Refresh proactively when the token is about to expire, so the common case
  // is one request rather than a 401 plus a retry.
  if (!anonymous && accessToken && Date.now() > accessExpiresAt) {
    await refreshAccessToken();
  }
  if (!anonymous && !accessToken && getRefreshToken()) {
    await refreshAccessToken();
  }

  const url = new URL(`${API_URL}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (!anonymous && accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  // A hung request on a patchy mobile connection must not spin forever.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  options.signal?.addEventListener('abort', () => controller.abort());

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
      credentials: 'include',
    });
  } catch (e) {
    clearTimeout(timeout);
    if (controller.signal.aborted) {
      throw new ApiRequestError('TIMEOUT', 'The request took too long. Check your connection.', 0);
    }
    throw new ApiRequestError('NETWORK_ERROR', 'Could not reach the server.', 0);
  }
  clearTimeout(timeout);

  if (res.status === 204) {
    return { data: undefined as T };
  }

  let envelope: ApiEnvelope<T>;
  try {
    envelope = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiRequestError('BAD_RESPONSE', 'The server returned an unreadable response.', res.status);
  }

  if (res.ok && envelope.ok) {
    return { data: envelope.data, meta: envelope.meta };
  }

  const error: ApiError = envelope.ok === false
    ? envelope.error
    : { code: 'UNKNOWN', message: 'Request failed.' };

  // One refresh-and-retry on 401, then give up and send them to login.
  if (res.status === 401 && !anonymous && !isRetry) {
    if (await refreshAccessToken()) {
      return request<T>(path, options, true);
    }
    clearSession();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login/?next=${next}`;
    }
  }

  throw new ApiRequestError(error.code, error.message, res.status, error.details);
}

export const api = {
  get: <T>(path: string, query?: RequestOptions['query'], options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET', query }).then((r) => r.data),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }).then((r) => r.data),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }).then((r) => r.data),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }).then((r) => r.data),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }).then((r) => r.data),

  /** Cursor-paginated list, with meta unwrapped into a usable shape. */
  page: async <T>(path: string, query?: RequestOptions['query']): Promise<Page<T>> => {
    const r = await request<T[]>(path, { method: 'GET', query });
    return {
      items: r.data,
      nextCursor: (r.meta?.next_cursor as string | null) ?? null,
      hasMore: Boolean(r.meta?.has_more),
    };
  },
};

export type HealthStatus = { db: string; version: string; env: string; time: string };

export const health = () => api.get<HealthStatus>('/api/health', undefined, { anonymous: true });
