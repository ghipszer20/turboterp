import { openSnapshotStore } from "@turboterp/campus-data/snapshots";
import { supabaseGetUser } from "../email/plan";
import { supabaseEnv } from "../email/rate-limit";
import { lookupInDeptFile, type SeatApiDeps } from "./api";
import { sendPush, vapidConfigured } from "./push";
import { seatAlertStore } from "./store";

// Server-only wiring of the real dependencies for the route files; null when Supabase isn't configured.
export function seatApiDeps(): SeatApiDeps | null {
  const env = supabaseEnv();
  if (!env) return null;
  const snaps = openSnapshotStore();
  return {
    getUser: supabaseGetUser(env),
    term: async () => (await snaps.get<{ term: string }>("schedule/current"))?.data.term ?? null,
    lookup: async (term, courseId, sectionId) => lookupInDeptFile((await snaps.get<unknown>(`schedule/${term}/sections/${courseId.slice(0, 4)}`))?.data ?? null, courseId, sectionId),
    store: seatAlertStore(env),
    push: sendPush,
    vapidConfigured: () => vapidConfigured(),
    secret: process.env.CRON_SECRET,
    now: () => new Date(),
  };
}

export const notConfigured = () => Response.json({ error: "not-configured" }, { status: 503, headers: { "Cache-Control": "no-store" } });
