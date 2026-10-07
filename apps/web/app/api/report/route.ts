import { connection } from "next/server";
import { supabaseEnv, supabaseSendStore } from "@/lib/email/rate-limit";
import { handleReport } from "@/lib/email/report";
import { sendEmail } from "@/lib/email/send";

export async function POST(request: Request) {
  await connection(); // never prerendered or cached
  const env = supabaseEnv();
  return handleReport(request, {
    send: (msg) => sendEmail(msg),
    store: env ? supabaseSendStore(env) : null,
    to: process.env.REPORT_TO_EMAIL,
    now: () => new Date(),
  });
}
