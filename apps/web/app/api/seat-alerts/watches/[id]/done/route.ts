import { connection } from "next/server";
import { handleWatchDone } from "@/lib/seat-alerts/api";
import { notConfigured, seatApiDeps } from "@/lib/seat-alerts/deps";

// Bearer token, or ?token=<signed watch token> from the notification's "I got it" action.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connection();
  const deps = seatApiDeps();
  return deps ? handleWatchDone(request, (await params).id, deps) : notConfigured();
}
