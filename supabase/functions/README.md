# Edge Functions: seats and Seat Alerts

Two functions replace the Vercel cron jobs `soc-seats` and `seat-alerts` (Vercel bills CPU and provisioned memory for them; Supabase meters Edge Functions by invocation). Design: `docs/project/scaling-plan.md` 4.1 to 4.3.

| Function | Called by | What it does |
|---|---|---|
| `soc-seats` | pg_cron, 4 jobs every 5 min (`{"chunk": 0..3}`) | Scans one quarter of the departments, writes `schedule/<term>/seats-chunk/<n>`, then rebuilds the whole-term `schedule/<term>/seats` file. |
| `seat-alerts` | pg_cron, every minute | Checks watched courses (most-watched first, at most 40 Testudo requests per run), the rest against the seats file, sends web pushes. |

Both require two things on every call: the Supabase JWT (the anon key, checked by the gateway) and `x-cron-secret` equal to the `CRON_SECRET` secret (checked by the function).

## Owner steps

Run from the repo root. Replace `<project-ref>` with the project's reference id (Supabase dashboard, Project Settings, General).

1. **Log in and link.**
   ```
   npx supabase login
   npx supabase link --project-ref <project-ref>
   ```
2. **Set the function secrets** (names only here; use the same values as Vercel for the first four; `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided by the Edge runtime, don't set them):
   ```
   npx supabase secrets set CRON_SECRET=<value>
   npx supabase secrets set VAPID_PUBLIC_KEY=<value>
   npx supabase secrets set VAPID_PRIVATE_KEY=<value>
   npx supabase secrets set VAPID_SUBJECT=<value>
   ```
   `CRON_SECRET` must stay equal to the Vercel one: it also signs the "I got it" tokens that the web app verifies.
3. **Deploy both functions.** The code imports shared files from `packages/` and `apps/web/lib/`, outside `supabase/functions`, so deploy from the repo root; if the Docker bundler can't see those files, add `--use-api`.
   ```
   npx supabase functions deploy soc-seats
   npx supabase functions deploy seat-alerts
   ```
   Keep JWT verification on (the default). Don't pass `--no-verify-jwt`.
4. **Create the Vault secrets the migration reads** (SQL editor; `cron_secret` already exists from 0003). Run once, never commit the values:
   ```sql
   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
   select vault.create_secret('<the project anon key>', 'anon_key');
   ```
   The anon key is under Project Settings, API. If a secret already exists, update it with `vault.update_secret`.
5. **Test each function once by hand (before the migration)**, with the same three values:
   ```
   curl -i -X POST "https://<project-ref>.supabase.co/functions/v1/soc-seats" \
     -H "Authorization: Bearer <anon key>" -H "x-cron-secret: <CRON_SECRET>" \
     -H "Content-Type: application/json" -d '{"chunk": 0}'
   curl -i -X POST "https://<project-ref>.supabase.co/functions/v1/seat-alerts" \
     -H "Authorization: Bearer <anon key>" -H "x-cron-secret: <CRON_SECRET>" \
     -H "Content-Type: application/json" -d '{}'
   ```
   Expect HTTP 200 and a JSON report (`soc-seats`: `done: true`, `failed: 0`, `ms` about 80000 for a full chunk; `seat-alerts`: `requests <= 40`). 401 means a wrong secret, 503 a missing secret. After all four chunks (`chunk` 0 to 3) have run once, the whole `schedule/<term>/seats` file is rebuilt. A chunk called again within 4.5 minutes answers `skipped: "not due"`.
6. **Apply the migration.** Paste `supabase/migrations/0016_edge_jobs.sql` into the SQL editor (or `npx supabase db push` if you use migrations that way). It is re-runnable. It removes the old `turboterp-soc-seats` and `turboterp-seat-alerts` jobs (which pointed at Vercel) and schedules `turboterp-soc-seats-0` to `-3` and `turboterp-seat-alerts`. Check:
   ```sql
   select jobname, schedule from cron.job order by jobname;
   select status_code, created from net._http_response order by created desc limit 10;
   ```
7. **Read logs.** Dashboard, Edge Functions, pick the function, Logs (each run prints one JSON line; failures print `soc-seats chunk N: DEPT: error`). From the CLI: `npx supabase functions logs soc-seats` is not available in every CLI version, so use the dashboard if the command is missing. Cron history: `select * from cron.job_run_details order by start_time desc limit 20;`.

## Running the tests locally

Needs Deno 2 (`deno test` downloads `npm:` packages on first run):
```
deno test -A supabase/functions/soc-seats/handler_test.ts
deno test -A supabase/functions/seat-alerts/
```
`soc-seats/handler_test.ts` ends with a CPU measurement using the real HTML fixture; it prints one JSON line. `seat-alerts/testdata/` holds a throwaway self-signed certificate for the local mock push endpoint (test only, protects nothing).

## Notes

- Invocation budget: 4 x 8,640 + 43,200 about 78k a month of Supabase's 500k.
- The Vercel `soc-sections` (nightly) and campus jobs are unchanged. Vercel no longer serves `soc-seats` or `seat-alerts`; `lib/cron.ts` rejects those names.
- The `seat_alert_cursor` table is no longer read (priority order replaced the alphabetical cursor); it can be dropped later.
