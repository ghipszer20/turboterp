import { connection } from "next/server";
import { supabaseGetUser } from "@/lib/email/plan";
import { supabaseEnv, supabaseSendStore } from "@/lib/email/rate-limit";
import { handleConsentRecord, supabaseConsentStore } from "@/lib/consent/record";

export async function POST(request: Request) {
  await connection(); // never prerendered or cached
  const env = supabaseEnv();
  const secret = process.env.CONSENT_NAME_SECRET ?? "";
  if (!env || !secret) return Response.json({ error: "not-configured" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  return handleConsentRecord(
    request,
    {
      getUser: supabaseGetUser(env),
      store: supabaseConsentStore(env),
      limits: supabaseSendStore(env),
      secret,
      now: () => new Date(),
    },
    ip,
  );
}
