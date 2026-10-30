import type { PlanEmailDeps, PlanUser } from "../email/plan";
import type { SupabaseEnv } from "../email/rate-limit";

// Server-only handler for POST /api/account/delete, with its dependencies injected.
// The database cascades user_documents and unlinks consent_records (migration 0007).

export type AccountDeleteDeps = {
  /** Resolves a Supabase access token to its user, or null when the token is bad. */
  getUser: PlanEmailDeps["getUser"];
  /** Deletes the auth user; throws on failure. */
  deleteUser: (id: string) => Promise<void>;
};

const json = (body: unknown, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function handleAccountDelete(request: Request, deps: AccountDeleteDeps): Promise<Response> {
  const token = /^Bearer\s+(\S+)$/i.exec(request.headers.get("authorization") ?? "")?.[1];
  if (!token) return json({ error: "unauthorized" }, 401);
  let user: PlanUser | null;
  try {
    user = await deps.getUser(token);
  } catch {
    return json({ error: "unavailable" }, 503);
  }
  if (!user) return json({ error: "unauthorized" }, 401);
  try {
    await deps.deleteUser(user.id);
  } catch {
    return json({ error: "unavailable" }, 503);
  }
  return json({ ok: true }, 200);
}

/** Service-role DELETE /auth/v1/admin/users/{id}. */
export function supabaseDeleteUser(env: SupabaseEnv, fetchFn: typeof fetch = fetch): AccountDeleteDeps["deleteUser"] {
  return async (id) => {
    const res = await fetchFn(`${env.url}/auth/v1/admin/users/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { apikey: env.serviceKey, Authorization: `Bearer ${env.serviceKey}` },
    });
    if (!res.ok) throw new Error(`admin delete ${res.status}`);
  };
}
