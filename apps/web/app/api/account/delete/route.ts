import { connection } from "next/server";
import { handleAccountDelete, supabaseDeleteUser } from "@/lib/account/delete";
import { supabaseGetUser } from "@/lib/email/plan";
import { supabaseEnv } from "@/lib/email/rate-limit";

export async function POST(request: Request) {
  await connection(); // never prerendered or cached
  const env = supabaseEnv();
  if (!env) return Response.json({ error: "not-configured" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  return handleAccountDelete(request, { getUser: supabaseGetUser(env), deleteUser: supabaseDeleteUser(env) });
}
