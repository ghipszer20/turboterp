# Edge Functions: seats and Seat Alerts

Two functions replace the Vercel cron jobs `soc-seats` and `seat-alerts` (Vercel bills CPU and provisioned memory for them). Design: `docs/project/scaling-plan.md` 4.1 to 4.3.

**The binding limit is Supabase log ingestion** (Free plan: 1 GB a month; measured about 4.4 KB per Storage request, 1 KB per PostgREST/RPC request, 3 to 4 KB per Edge Function call). So the design minimises requests, not CPU:
- Hot snapshots (the seats row, room availability, the current term) live in the `snapshot_hot` table, not in Storage. The store routes them there; callers don't change.
- *When* a job runs is decided in SQL inside the pg_cron command, so a call that isn't due is never made.
- Functions print nothing on a quiet run, one short line when work happened, detail only on failure.

| Function | Called by (all gating is in `0016_edge_jobs.sql`) | What it does |
|---|---|---|
| `soc-seats` | pg_cron every 5 min, called only inside a hot window (priority/early registration until 14 days after it, and the schedule-adjustment period), otherwise only at minutes 0/15/30/45 | ONE call per run. Reads `schedule/current` and the seats row, fetches Testudo 3 departments at a time (300 ms pause per request, 120 s budget, cursor saved in the row if cut short), writes the seats row back. 3 store requests. |
| `seat-alerts` | pg_cron every minute, called only while an active watch exists | ONE RPC (`seat_alert_load`) reads watches and saved states. Checks watched courses most-watched first (at most 40 Testudo requests), the rest against the seats row, writes only changed states, sends web pushes. |

Both require two things on every call: the Supabase JWT (the anon key, checked by the gateway) and `x-cron-secret` equal to the `CRON_SECRET` secret (checked by the function).

Other jobs set up by the same migration: `turboterp-fast` (rooms only, every 30 min, 7:00 to 00:59 New York time), `turboterp-dining` (menus at 6:00 and 14:00 New York time, Vercel route `/api/cron/dining`), and `turboterp-cron-cleanup` (deletes `cron.job_run_details` older than 7 days).

## Owner steps

Run from the repo root. Replace `<project-ref>` with the project's reference id (Supabase dashboard, Project Settings, General).

1. **Log in and link.**
   ```
   npx supabase login
   npx supabase link --project-ref <project-ref>
   ```
2. **Set the function secrets** (names only here; use the same values as Vercel; `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided by the Edge runtime, don't set them):
   ```
   npx supabase secrets set CRON_SECRET=<value>
   npx supabase secrets set VAPID_PUBLIC_KEY=<value>
   npx supabase secrets set VAPID_PRIVATE_KEY=<value>
   npx supabase secrets set VAPID_SUBJECT=<value>
   ```
   `CRON_SECRET` must stay equal to the Vercel one: it also signs the "I got it" tokens that the web app verifies.
3. **Apply the migration first** (the functions need its tables and RPC). Paste `supabase/migrations/0016_edge_jobs.sql` into the SQL editor (or `npx supabase db push`). It creates `snapshot_hot`, `seat_hot_windows`, `replace_seat_hot_windows`, `seat_alert_load`, and schedules the jobs. Before it, create the two Vault secrets it reads (`cron_secret` already exists from 0003). Run once, never commit the values:
   ```sql
   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
   select vault.create_secret('<the project anon key>', 'anon_key');
   ```
   The anon key is under Project Settings, API. If a secret already exists, update it with `vault.update_secret`. The migration is re-runnable and removes the old `turboterp-soc-seats` and `turboterp-seat-alerts` jobs (which pointed at Vercel). Existing Storage snapshots need no copy: the store reads a missing hot key from Storage once and moves it into the table.
4. **Deploy both functions.** The code imports shared files from `packages/` and `apps/web/lib/`, outside `supabase/functions`, so deploy from the repo root; if the Docker bundler can't see those files, add `--use-api`.
   ```
   npx supabase functions deploy soc-seats
   npx supabase functions deploy seat-alerts
   ```
   Keep JWT verification on (the default). Don't pass `--no-verify-jwt`.
5. **Deploy the web app** (Vercel): it writes the hot windows from the daily job, reads hot snapshots from the table, and serves the new `dining` cron job. Then trigger the daily job once so `seat_hot_windows` is filled (otherwise seats refresh every 15 minutes until the next 09:00 UTC run).
6. **Test each function once by hand:**
   ```
   curl -i -X POST "https://<project-ref>.supabase.co/functions/v1/soc-seats" \
     -H "Authorization: Bearer <anon key>" -H "x-cron-secret: <CRON_SECRET>" \
     -H "Content-Type: application/json" -d '{}'
   curl -i -X POST "https://<project-ref>.supabase.co/functions/v1/seat-alerts" \
     -H "Authorization: Bearer <anon key>" -H "x-cron-secret: <CRON_SECRET>" \
     -H "Content-Type: application/json" -d '{}'
   ```
   Expect HTTP 200 and a JSON report (`soc-seats`: `done: true`, `failed: 0`, `ms` about 100000; `seat-alerts`: `requests <= 40`). 401 means a wrong secret, 503 a missing secret.
7. **Check the jobs:**
   ```sql
   select jobname, schedule from cron.job order by jobname;
   select status_code, created from net._http_response order by created desc limit 10;
   select * from cron.job_run_details order by start_time desc limit 20;
   ```
8. **Read logs.** Dashboard, Edge Functions, pick the function, Logs. A seats run prints one line like `soc-seats 230/230 depts 98s`; failures print `soc-seats: DEPT: error`; a quiet Seat Alerts run prints nothing.

## Running the tests locally

Needs Deno 2 (`deno test` downloads `npm:` packages on first run):
```
deno test -A supabase/functions/soc-seats/handler_test.ts
deno test -A supabase/functions/seat-alerts/
```
`soc-seats/handler_test.ts` counts store requests (3 per seats run) and measures CPU with the real HTML fixture; it prints one JSON line. `seat-alerts/testdata/` holds a throwaway self-signed certificate for the local mock push endpoint (test only, protects nothing).

## Notes

- Invocation budget: seats 288 calls a day off-peak (every 15 min only: 96) plus hot windows, Seat Alerts at most 1,440 a day and none while nothing is watched; far under Supabase's 500k a month.
- The Vercel `soc-sections` (nightly) and campus jobs are unchanged apart from `fast` (rooms only) and the new `dining`. Vercel no longer serves `soc-seats` or `seat-alerts`; `lib/cron.ts` rejects those names.
- The nightly `soc-sections` run also writes its parsed seat counts into the seats row and keeps the `scanBroken` flag there (no separate `seats-scan-broken` key any more).
- The `seat_alert_cursor` table is no longer read; it can be dropped later.
