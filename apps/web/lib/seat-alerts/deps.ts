import { openSnapshotStore } from "@turboterp/campus-data/snapshots";
import { supabaseEnv, supabaseSendStore } from "../email/rate-limit";
import { sendExpoPush } from "./expo";
import { lookupInDeptFile, type SeatApiDeps } from "./api";
import { sendPush, vapidConfigured } from "./push";
import { seatAlertStore } from "./store";

// Server-only wiring of the real dependencies for the route files; null when Supabase isn't configured.
export function seatApiDeps(): SeatApiDeps | null {
  const env = supabaseEnv();
  if (!env) return null;
  const snaps = openSnapshotStore();
  return {
    term: async () => (await snaps.get<{ term: string }>("schedule/current"))?.data.term ?? null,
    lookup: async (term, courseId, sectionId) => lookupInDeptFile((await snaps.get<unknown>(`schedule/${term}/sections/${courseId.slice(0, 4)}`))?.data ?? null, courseId, sectionId),
    store: seatAlertStore(env),
    push: sendPush,
    pushExpo: (token, payload) => sendExpoPush(token, payload),
    vapidConfigured: () => vapidConfigured(),
    secret: process.env.CRON_SECRET,
    limits: supabaseSendStore(env),
    now: () => new Date(),
  };
}

export const notConfigured = () => Response.json({ error: "not-configured" }, { status: 503, headers: { "Cache-Control": "no-store" } });
