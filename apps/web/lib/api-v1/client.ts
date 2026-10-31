// Typed reader for /api/v1. No React or Next imports: it moves into a shared package later.
// It never throws: a network failure, a bad status, a version it doesn't know or a payload that
// fails the caller's shape check comes back as an error result, so an older app keeps working
// (and shows its error state) after a web deploy.

import { isV1Envelope } from "./envelope";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

export type V1Options<T> = {
  /** Site origin, e.g. https://turboterp.com (no trailing slash needed). */
  baseUrl: string;
  /** Shape check for `data`; return false to reject. Without it, only the envelope is checked. */
  check?: (data: unknown) => data is T;
  /** The site-lock token, sent as x-turboterp-access. Only while the lock is on. */
  accessToken?: string;
  fetch?: typeof fetch;
};

export const V1_PATHS = {
  today: "/api/v1/today",
  dining: "/api/v1/dining",
  stamp: "/api/v1/dining/stamp",
  foodSearch: "/api/v1/dining/search-index",
  libraries: "/api/v1/libraries",
  rooms: "/api/v1/rooms",
  gyms: "/api/v1/gyms",
  calendar: "/api/v1/calendar",
  buildings: "/api/v1/buildings",
} as const;

export async function fetchV1<T = unknown>(path: string, opts: V1Options<T>): Promise<ApiResult<T>> {
  const doFetch = opts.fetch ?? fetch;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.accessToken) headers["x-turboterp-access"] = opts.accessToken;
  try {
    const res = await doFetch(opts.baseUrl.replace(/\/+$/, "") + path, { headers });
    if (!res.ok) return { ok: false, error: `Request failed (${res.status})` };
    const body: unknown = await res.json();
    if (!isV1Envelope(body)) return { ok: false, error: "Unexpected response version" };
    if (opts.check && !opts.check(body.data)) return { ok: false, error: "Unexpected response shape" };
    return { ok: true, data: body.data as T };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
