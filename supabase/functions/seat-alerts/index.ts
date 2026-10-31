import { SupabaseSnapshotStore } from "../../../packages/campus-data/src/snapshots/supabase-store.ts";
import { fetchSectionsHtml, scanSeats } from "../../../packages/course-data/src/soc.ts";
import type { SeatsFile } from "../../../packages/course-data/src/soc-refresh.ts";
import { signWatchToken } from "../../../apps/web/lib/seat-alerts/api.ts";
import { seatAlertStore } from "../../../apps/web/lib/seat-alerts/store.ts";
import { handleSeatAlerts } from "./handler.ts";
import { sendPush, vapidConfigured } from "./push.ts";

// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by the Edge runtime. Set with
// `supabase secrets set`: CRON_SECRET, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT.
const url = () => Deno.env.get("SUPABASE_URL")!;
const serviceKey = () => Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve((req) => {
  const snaps = new SupabaseSnapshotStore({ url: url(), serviceKey: serviceKey() });
  return handleSeatAlerts(req, {
    cronSecret: Deno.env.get("CRON_SECRET"),
    vapidConfigured: () => vapidConfigured(),
    now: () => new Date(),
    runDeps: (now) => ({
      term: async () => (await snaps.get<{ term: string }>("schedule/current"))?.data.term ?? null,
      store: seatAlertStore({ url: url().replace(/\/$/, ""), serviceKey: serviceKey() }),
      fetchSeats: async (term, ids) => scanSeats(await fetchSectionsHtml(term, ids)),
      seatsFile: async (term) => (await snaps.get<SeatsFile>(`schedule/${term}/seats`))?.data ?? null,
      push: sendPush,
      signToken: (watchId) => signWatchToken(watchId, Deno.env.get("CRON_SECRET")!, now),
      sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
      clock: () => performance.now(),
    }),
  });
});
