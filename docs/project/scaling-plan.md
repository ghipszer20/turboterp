# Scaling plan: no more paused deployments, up to tens of thousands of users

Written 2026-10-30, after Vercel paused turboterp.com for **Fluid Active CPU** ("Your team exceeded the Hobby fair use limits"). On Hobby, a paused feature stays off until 30 days have passed, unless the team upgrades to Pro.

## 1. Goal and the rule that gets us there
- Nothing a visitor does may cost server CPU per visit. Pages and data files are served from the CDN; the server only renders when the data changes.
- Background jobs cost the same at 1 user or 30,000. Their cost is set by how often they run, not by traffic.
- Every limit on every provider has a written estimate at 30k users, and a design ships only when each estimate is under half its limit (section 5).

## 2. Limits (fetched 2026-10-30)
**Vercel Hobby, per month** (vercel.com/docs/plans/hobby): Active CPU 4 CPU-hours; provisioned memory 360 GB-hours; function invocations 1M; CDN requests 1M; Fast Data Transfer 100 GB; Fast Origin Transfer 10 GB. Function max duration 300 s. Going over pauses the feature for 30 days.
**Supabase Free** (supabase.com/pricing, docs/guides/functions/limits): database 500 MB (shared CPU); egress 5 GB uncached + 5 GB cached; Edge Functions 500,000 invocations, **2 s of CPU per call** (async I/O not counted), 150 s wall clock, 256 MB; Auth 50,000 MAU; storage 1 GB. There's no monthly CPU-hours meter for Edge Functions. What happens when a Free quota is exceeded isn't stated on the pricing page: treat every limit as a hard stop.

## 3. Measurements (Task 0, 2026-10-30, owner's PC, local production build, file snapshot store)
Scripts in the session scratchpad (`measure/seats.ts`, `measure/scan.ts`, `measure/server.ps1`); not committed.

| What | CPU | Notes |
|---|---|---|
| One full `soc-seats` run (199 departments, 232 Testudo requests) | **15.3 s** (script) / **20.7 s** (through the Next route) | 101–171 s wall. Parse 10.4 s, store reads 2.9 s (`loadRatings` reads every department file back: 1.5 MB per run), network + decode 0.9 s, the rest 0.8 s. Testudo sent 37.4 MB of HTML. |
| Seats-only string scanner on the same pages | **0.09 s per full run** (vs 12.6 s cheerio on the same sample) | 983 sections in 6 departments, 0 mismatches against `parseSections`. Seats-only data for the whole term: 154 KB of JSON. |
| `soc-seats` call that isn't due | ~0–60 ms | |
| `fast` (study rooms + due menus, live sources) | 0.8–1.6 s | Runs every 3 min = 480 calls a day. |
| `seat-alerts` with no watches (early exit) | 0 ms warm, 1.45 s on the route's first call | Not the production path. With watches, a 40-course batch costs about 45 ms of cheerio plus Supabase calls; estimate ~0.1 s warm per run. |
| Server cold start | 1.7 s | Each Vercel cold start pays something like this. |
| Today page `/` | 47–78 ms warm, outliers 516 and 875 ms | Rendered for every visit (`connection()`). |
| Dining page | 63–250 ms | Same. Libraries 31–78 ms. |
| Schedule and Advisor pages, schedule data files | ~0 after the first request | Already static or CDN-cached. |
| Testudo headers | no `ETag`, no `Last-Modified`, no compression | Conditional requests can't skip unchanged departments. |

**Calibration (owner, 2026-10-30):** Vercel's Usage page showed Fluid Active CPU at **over 12 hours of the 4-hour limit** (no per-route breakdown available). The local numbers predict about 41 min a day (seat refresh 20.7 s × 96 runs ≈ 33 min, plus `fast` ≈ 8 min), so 12+ hours is about 17–18 days of these jobs, consistent with the seat refresh being live since about 2026-10-04, some runs failing or stopping early, and Vercel pausing some time after the 4-hour mark. **The local numbers match production**: treat them as realistic, not pessimistic. The budget in section 5 keeps its 50% headroom on these numbers.

**Where the CPU went (shares are solid even if the absolute numbers aren't):** the seat refresh is the main cost, and 2/3 of it is cheerio building a full DOM to read four numbers. `fast` every 3 minutes is second. Seat Alerts every minute pays per-run overhead 1,440 times a day. Page renders are small today, but at 30k users they'd be the biggest per-visit cost.

## 4. Design
### 4.1 Seats (the big one)
- **Two refreshes instead of one.**
  - **Seats, every 5 min (owner, 2026-10-30):** the string scanner reads only (course, section, total, open, waitlist, holdfile) and writes one small whole-term file `schedule/<term>/seats` (~154 KB JSON, much less gzipped). No meetings, instructors or notes. No `loadRatings`.
  - **Full sections, nightly:** the existing cheerio parse builds the department files (meetings, instructors, notes, ratings), as today, once a day.
- **Scanner guard:** the nightly full run compares its seat counts with the scanner's for every section. If they disagree (Testudo changed its HTML), the seats job falls back to the full parse and logs it to Sentry, so a markup change can't silently break seat counts.
- **Ratings and reviews** stored once under their own key by the nightly run, never read back from every department file (this also removes ~13 GB/month of Supabase egress at a 5-minute cadence).
- The browser loads the department files (daily) and lays the seats file (5 min) over them. Seat Alerts, the builder and the "Seats updated" line all read the same seats file.
- **Cost per seats run:** ~0.9 s fetch and decode + 0.09 s scan + small writes ≈ **1.1 s** (pessimistic), vs 20.7 s today: about **18× cheaper**.

### 4.2 Where the jobs run
- **Seats and Seat Alerts move to Supabase Edge Functions**, triggered by the existing pg_cron jobs. This isn't moving the problem: the job is first made ~18× cheaper (4.1), and Supabase meters Edge Functions by **invocations, not CPU-hours**.
  - Seats split into 4 calls per run (~0.3 s CPU and ~35 s wall each, under the 2 s / 150 s caps): 4 × 8,640 = 34,560 calls a month.
  - Seat Alerts every minute: 43,200 calls a month.
  - Total ~80k of 500k (16%), the same at any number of users.
- **Why not stay on Vercel:** pessimistic seats at 5 min = 1.1 s × 8,640 = 2.6 CPU-hours, plus alerts ~1.2 and campus ~0.4 ≈ 4.2 of 4 CPU-hours. Doesn't fit. (Fallback if the Edge port fails: seats every 15 min on Vercel ≈ 0.9 CPU-hours, every 5 min only during registration and adjustment.)
- **Port check first:** the packages use `.ts` relative imports and `fetch`, so they should run in Deno. `web-push` (VAPID encryption) needs a Deno-compatible library; spike it before the rest.
- **Campus refresh stays on Vercel, much slower:** study rooms every 30 min, dining menus twice a day, library hours and RecWell daily. ~1 s × ~1,500 calls ≈ 0.4 CPU-hours pessimistic. (It could move to Supabase later the same way.)

### 4.3 Seat Alerts at scale
- With the scanner, a 40-course batch costs a few ms of CPU, so checking watched classes every minute is cheap. **The real limit is Testudo load:** at tens of thousands of users, watched classes could reach most of the catalog, i.e. up to ~232 requests a minute.
- Rule: alerts check watched courses every minute, in priority order (most-watched first), with a hard cap on requests per minute (proposed 40, about 1 every 1.5 s). Courses past the cap fall back to the 5-minute seats run, which already reads every section, so openings there trigger alerts within 5 minutes at worst.

### 4.4 Pages: no per-visit rendering
- Today and the Campus pages (`/`, `/campus/dining`, `/campus/dining/search`, `/campus/gym`, `/campus/libraries`, `/campus/rooms`) drop `connection()`. They're cached and rebuilt when their data changes (the refresh job revalidates them by tag), at most every 30 min.
- Anything relative to the current time ("open now", "closes in 20 min", the current meal, the next class) is worked out in the browser. `useCampusMinutes` already exists.
- Cost: ~6 pages × ≤48 rebuilds a day × ≤0.25 s ≈ 0.6 CPU-hours a month at most, the same at any number of visitors.
- **Delete `proxy.ts` and the gate at launch.** It runs on every request. While the site is locked (owner, 2026-10-30), it stays.

### 4.5 Per-user server routes (the only costs that grow with users)
- **Calendar feed `/api/calendar/schedule.ics`:** every subscribed calendar app re-downloads it on its own schedule, often hourly. 10k subscribers could mean millions of CDN requests a month, more than the whole Hobby allowance. Options (owner decision):
  - (a) "Add to calendar" downloads a `.ics` built in the browser: no server cost. It doesn't pick up later room or time changes, but changing sections already means a new feed link.
  - (b) Keep the feed, with `s-maxage` of a day so each subscriber costs at most one render a day, and accept that it counts against CDN requests.
- **Seat Alerts watch list and device routes:** the Alerts tab calls `GET /api/seat-alerts/watches` on every open (dynamic, per device). Move reads and writes to Supabase RPC functions that check the device token (security definer), so Vercel isn't involved. Otherwise, measure the route and budget it.
- **Others** (consent, email plan, report, delete account): rare, one per action. Plan sync already goes straight from the browser to Supabase.

## 5. Budget at 30k users (local CPU numbers, which match production: section 3)
| Limit | After this plan | Share |
|---|---|---|
| Vercel Active CPU (4 h) | campus jobs 0.4 + page rebuilds 0.6 + per-user writes ~0.5 (estimate) ≈ 1.5 h | 38% |
| Vercel invocations (1M) | campus ~1.5k + page rebuilds ~9k + data-file CDN misses ~30k + per-user writes | <10% |
| Vercel CDN requests (1M) | **page views and data files: ~4 requests per visit** | **the wall: ~250k visits/month ≈ 8k a day** |
| Vercel Fast Data Transfer (100 GB) | ~30–40 KB per visit after the first; first visits ~1 MB of JS | depends on visits; check at 5k users |
| Supabase Edge invocations (500k) | ~80k | 16% |
| Supabase Edge CPU per call (2 s) | ~0.3 s | 15% |
| Supabase egress (5 GB) | seats file CDN misses: 8,640 a month × gzipped ~30 KB × ~2 regions ≈ 0.5 GB; daily files small | ~10–20% |
| Supabase database (500 MB) | synced plans (30k × ~15 KB, not yet measured) + watches | **~90%: measure a real plan's size** |
| Supabase Auth MAU (50k) | 30k at most | 60% |
| Brevo email (300/day) | sign-in links at launch | already in roadmap Known to-dos |

**What this plan can't fix on free tiers:** CDN requests. At tens of thousands of active users, page loads alone exceed Hobby's 1M a month, however efficient the server is. The options when weekly users pass ~5,000 (owner decision then, not now):
- (a) Vercel Pro (~$20/month, donations).
- (b) Move the site to a host that doesn't count static requests (e.g. Cloudflare). This is a big migration.

Until then, an alert at 50% of each meter.

## 6. Tasks
0. **Measure (done 2026-10-30, main session; calibrated against the owner's Usage reading).**
1. **Seats scanner + split files** (one builder, `feat/seats-scan`).
   - Test first with the saved real pages as fixtures (scanner = `parseSections` seat counts).
   - Seats-only refresh writes `schedule/<term>/seats`.
   - Nightly full run with the cross-check and the ratings key.
   - Browser overlays seats on the department files.
   - No `loadRatings` on the seats path.
2. **Edge Functions for seats and Seat Alerts** (one builder, `feat/edge-jobs`, after 1). Order:
   - Spike `web-push` in Deno first.
   - Port the seats run in 4 chunks.
   - Port Seat Alerts with the per-minute request cap (4.3).
   - Repoint the pg_cron jobs (a migration for the owner to apply).
   - Remove `soc-seats` and `seat-alerts` from the Vercel cron route.
3. **Cached Today and Campus pages** (one builder, `feat/static-campus`). Drop `connection()`, revalidate by tag from the refresh job, time-relative parts in the browser. Campus refresh intervals: rooms 30 min, menus twice a day.
4. **Per-user routes** (one builder, after the owner picks 4.5 (a) or (b)): calendar feed change; Seat Alerts reads and writes through Supabase RPC.
5. **Guardrails** (main session):
   - A build check that fails if a page outside an allow-list renders per visit, or if `soc-seats` or `seat-alerts` come back to Vercel.
   - Re-run the Task 0 scripts after each task.
   - Usage alerts at 50%.
   - A monthly look at both Usage pages (prelaunch checklist).

Tasks 1 and 3 can run in parallel. 2 waits for 1. 4 waits for the owner.

## 7. Owner decisions
- Calendar: browser-built download (a) or feed with a day's caching (b) (4.5).
- Seat Alerts request cap per minute (proposed 40, 4.3).
- Later, at ~5k weekly users: Vercel Pro or a different host (section 5).
