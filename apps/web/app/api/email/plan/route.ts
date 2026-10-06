import { connection } from "next/server";
import { handlePlanEmail, supabaseGetUser } from "@/lib/email/plan";
import { supabaseEnv, supabaseSendStore } from "@/lib/email/rate-limit";
import { sendEmail } from "@/lib/email/send";

export async function POST(request: Request) {
  await connection(); // never prerendered or cached
  const env = supabaseEnv();
  if (!env) return Response.json({ error: "not-configured" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  return handlePlanEmail(request, {
    getUser: supabaseGetUser(env),
    send: (msg) => sendEmail(msg),
    store: supabaseSendStore(env),
    now: () => new Date(),
  });
}
