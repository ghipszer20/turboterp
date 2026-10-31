// Cron -> Edge Function authentication. Supabase's own gateway already checks the JWT in the
// Authorization header (the anon key from Vault, see 0016_edge_jobs.sql). The anon key is public,
// so each function also requires the shared CRON_SECRET in `x-cron-secret`; without it, anyone
// holding the anon key could make these functions hit Testudo and send pushes.

const digest = async (s: string) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));

/** Constant-time check of the x-cron-secret header against the CRON_SECRET secret. */
export async function authorizeCron(header: string | null, secret: string | undefined): Promise<"ok" | "unauthorized" | "not-configured"> {
  if (!secret) return "not-configured";
  const a = await digest(header ?? "");
  const b = await digest(secret);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0 ? "ok" : "unauthorized";
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
