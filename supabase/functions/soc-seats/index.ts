import { SupabaseSnapshotStore } from "../../../packages/campus-data/src/snapshots/supabase-store.ts";
import { liveRefreshDeps } from "../../../packages/course-data/src/soc-refresh.ts";
import { handleSeats } from "./handler.ts";

// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by the Edge runtime; CRON_SECRET is set with `supabase secrets set`.
Deno.serve((req) =>
  handleSeats(req, {
    cronSecret: Deno.env.get("CRON_SECRET"),
    store: () => new SupabaseSnapshotStore({ url: Deno.env.get("SUPABASE_URL")!, serviceKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! }),
    // 100 s budget: past it a chunk stops, keeps a cursor and continues next run (the call limit is 150 s wall).
    refresh: () => ({ ...liveRefreshDeps(), budgetMs: 100_000 }),
    now: () => new Date(),
  }));
