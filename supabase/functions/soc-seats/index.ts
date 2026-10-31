import { SupabaseSnapshotStore } from "../../../packages/campus-data/src/snapshots/supabase-store.ts";
import { liveRefreshDeps } from "../../../packages/course-data/src/soc-refresh.ts";
import { handleSeats } from "./handler.ts";

// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by the Edge runtime; CRON_SECRET is set with `supabase secrets set`.
Deno.serve((req) =>
  handleSeats(req, {
    cronSecret: Deno.env.get("CRON_SECRET"),
    store: () => new SupabaseSnapshotStore({ url: Deno.env.get("SUPABASE_URL")!, serviceKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! }),
    // 3 departments at a time, each worker pausing 300 ms per request. Past 120 s the run stops, keeps a cursor
    // in the seats row and continues next time (the call limit is 150 s wall).
    refresh: () => ({ ...liveRefreshDeps(), concurrency: 3, budgetMs: 120_000 }),
    now: () => new Date(),
  }));
