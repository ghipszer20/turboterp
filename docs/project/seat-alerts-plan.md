# Seat Alerts: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. PROJECT_MEMORY section 18 overrides that skill's defaults: one Sonnet builder per task, no reviewer subagents, at most 2 at once.

**Goal:** students watch full sections (or any section of a class) on a Seat Alerts page in the Schedule tab and get a web push notification within about a minute of a seat opening.

**Architecture:**
- Supabase pg_cron calls `/api/cron/seat-alerts` every minute. The route loads active watches, fetches only the watched courses' sections from Testudo (40 per request), detects 0 → more-than-0 openings against `seat_state`, and sends Web Push (VAPID, `web-push`) to the matching students' devices.
- Pure logic lives in `apps/web/lib/seat-alerts/`. Supabase is reached with the service role over REST, like `lib/account/delete.ts`, with every dependency injected.
- API routes resolve the student from the Supabase access token, as `/api/account/delete` does.
- The UI has a Schedule sub-nav, the `/schedule/alerts` page, a push-only service worker, bells in the section panel, and a Today card.

**Tech stack:** Next.js 16 (read `apps/web/node_modules/next/dist/docs/` before new APIs), TypeScript, Vitest, Supabase (Postgres, pg_cron, pg_net), `web-push` npm package.

**Spec:** `docs/project/seat-alerts.md`

## Global constraints

- Push only, no email. Watches stay on until "I got it" or Remove. At most 1 alert per watch every 15 minutes. Up to 20 active watches per student. Section watches plus "any section" watches.
- Polite to Testudo:
  - only watched courses;
  - 40 courses per request, one request at a time, 300 ms apart;
  - one retry for a failed batch;
  - a 50-second run budget with a cursor.
- A section seen for the first time sets a baseline and never alerts.
- Never touch Testudo logins or register anyone. The footer copy is exact: "Alerts are best-effort and can be a minute or two late. TurboTerp checks Testudo; it never registers you or uses your UMD login."
- Notification wording is exact:
  - title: `"<COURSE> <SECTION> has <n> open seat(s)"` (`seat` when n = 1);
  - body with waitlist 0: `"Register on Testudo now. Waitlist: 0."`;
  - body with waitlist > 0: `"Waitlisted students may get it first. Waitlist: <w>."` (Registrar: waitlisted students have priority, and an opened seat goes to the next eligible waitlisted student; registrar.umd.edu "Waitlist & Hold file").
- **Data access is service-role only.** There are no RLS policies on the new tables, the same as `consent_records`, and the API routes enforce ownership. This deviates from the spec's "RLS own rows", because every read and write already goes through the server.
- Secrets `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` and `VAPID_SUBJECT` live only in Vercel and `.env.local`. `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is the public key for the browser.
- Builders: test-first (strict TDD); quiet output; navigate with graphify; no WebFetch; at most about 40 tool calls; about 2 screenshots; push early. If a push is denied, keep committing locally and report it.

## Review focus

1. **A seat that flickers** (open, then full a minute later, then open again within 15 minutes): one alert, not two. → Task 1 `shouldAlert` cooldown test.
2. **A student with "any section" and a section watch on the same course**, where that section opens: one notification per device, not two. → Task 1 `matchWatches` de-duplication test.
3. **An expired push subscription** (404 or 410): deleted, and the run carries on with the other devices. → Task 1 sender test.
4. **The term moves on:** watches from an old term are never checked and are shown as ended. → Task 1 `activeForTerm` test; Task 2 list test.
5. **Testudo returns nothing for a batch** (an outage): no seat state is overwritten with zeros, which would cause false openings later, and no alerts are sent. → Task 1 `detectOpenings` test (sections missing from the response keep their old state).

## Files

- `supabase/migrations/0009_seat_alerts.sql` (Task 1)
- `apps/web/lib/seat-alerts/logic.ts` with `logic.test.ts` (Task 1): detection, matching, cooldown, batching, wording
- `apps/web/lib/seat-alerts/store.ts` (Task 1): Supabase REST adapters
- `apps/web/lib/seat-alerts/push.ts` (Task 1): the `web-push` sender with pruning
- `apps/web/lib/seat-alerts/run.ts` (Task 1): one cron run, with injected dependencies
- `apps/web/lib/cron.ts`, `apps/web/app/api/cron/[job]/route.ts` (Task 1): the `seat-alerts` job
- `apps/web/app/api/seat-alerts/watches/route.ts`, `subscription/route.ts`, `test/route.ts`, and `apps/web/lib/seat-alerts/api.ts` (Task 2)
- `apps/web/app/schedule/layout.tsx`, `components/ScheduleNav.tsx`, `apps/web/app/schedule/alerts/page.tsx` and its client components, `apps/web/public/sw.js`, `apps/web/lib/seat-alerts/client.ts` (Task 3)
- `apps/web/app/schedule/SectionPanel.tsx` bells, the Today card, `lib/legal.ts` privacy line, `app/sitemap.ts` (Task 3)

---

### Task 1: Core logic, data, push sender and the cron job (Builder P1, branch `feat/seat-alerts-core`)

**Produces** (types in `apps/web/lib/seat-alerts/logic.ts`):

```ts
export type Watch = { id: string; userId: string; term: string; courseId: string; sectionId: string | null; lastAlertAt: string | null; doneAt: string | null };
export type SeatCount = { courseId: string; sectionId: string; open: number; waitlist: number; holdfile: number };
export type SeatState = SeatCount & { checkedAt: string };
export type Opening = SeatCount; // a section that went from 0 open to > 0
export const MAX_WATCHES = 20;
export const ALERT_COOLDOWN_MINUTES = 15;
export const COURSES_PER_REQUEST = 40;
export function activeForTerm(watches: Watch[], term: string): Watch[];
export function watchedCourses(watches: Watch[]): string[]; // sorted, unique
export function batches<T>(items: T[], size?: number): T[][];
/** New states to save and the openings. Sections absent from `fetched` keep their old state (outage-safe); first sightings are baselines. */
export function detectOpenings(prev: ReadonlyMap<string, SeatState>, fetched: SeatCount[], now: Date): { save: SeatState[]; openings: Opening[] };
export function shouldAlert(w: Watch, now: Date): boolean; // active and lastAlertAt older than 15 min (or null)
/** Watches to alert per opening; one entry per watch; a user's any-section + section watches for the same opening collapse to the section watch. */
export function matchWatches(openings: Opening[], watches: Watch[], now: Date): { watch: Watch; opening: Opening }[];
export function alertText(o: Opening): { title: string; body: string };
```

`store.ts`: `seatAlertStore(env, fetchFn)` returns:
- `listActiveWatches(term)`
- `getStates(term, sectionIds)`
- `saveStates(term, states)`
- `markAlerted(watchIds, at)`
- `subscriptionsFor(userIds)`
- `deleteSubscription(endpoint)`
- `getCursor()` and `setCursor(c)`

`push.ts`: `sendPush(sub, payload, send = webpush.sendNotification)` returns `"ok" | "gone" | "failed"`, where "gone" means 404 or 410. `run.ts`: `runSeatAlerts(deps, now)` returns `{ watches, courses, requests, openings, alerts, gone, failedBatches, cursor? }`.

- [ ] **Step 1: Write the failing logic tests** in `apps/web/lib/__tests__/seat-alerts-logic.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { activeForTerm, alertText, batches, detectOpenings, matchWatches, shouldAlert, watchedCourses, type SeatState, type Watch } from "../seat-alerts/logic";

const now = new Date("2026-10-09T18:00:00Z");
const w = (p: Partial<Watch>): Watch => ({ id: "w1", userId: "u1", term: "202701", courseId: "CMSC351", sectionId: "0201", lastAlertAt: null, doneAt: null, ...p });
const st = (sectionId: string, open: number, extra: Partial<SeatState> = {}): SeatState => ({ courseId: "CMSC351", sectionId, open, waitlist: 0, holdfile: 0, checkedAt: "2026-10-09T17:59:00Z", ...extra });

describe("detectOpenings", () => {
  it("finds 0 -> >0 and saves every fetched section", () => {
    const prev = new Map([["CMSC351-0201", st("0201", 0)], ["CMSC351-0101", st("0101", 2)]]);
    const r = detectOpenings(prev, [{ courseId: "CMSC351", sectionId: "0201", open: 1, waitlist: 0, holdfile: 0 }, { courseId: "CMSC351", sectionId: "0101", open: 3, waitlist: 0, holdfile: 0 }], now);
    expect(r.openings.map((o) => o.sectionId)).toEqual(["0201"]);
    expect(r.save).toHaveLength(2);
  });
  it("treats a first sighting as a baseline, not an opening", () => {
    expect(detectOpenings(new Map(), [{ courseId: "CMSC351", sectionId: "0201", open: 4, waitlist: 0, holdfile: 0 }], now).openings).toEqual([]);
  });
  it("leaves sections missing from the response untouched (Testudo outage)", () => {
    const prev = new Map([["CMSC351-0201", st("0201", 0)]]);
    expect(detectOpenings(prev, [], now)).toEqual({ save: [], openings: [] });
  });
});

describe("matching", () => {
  const opening = { courseId: "CMSC351", sectionId: "0201", open: 1, waitlist: 0, holdfile: 0 };
  it("matches section and any-section watches, one per user per opening", () => {
    const watches = [w({ id: "a" }), w({ id: "b", sectionId: null }), w({ id: "c", userId: "u2", sectionId: null }), w({ id: "d", sectionId: "0101" })];
    expect(matchWatches([opening], watches, now).map((m) => m.watch.id).sort()).toEqual(["a", "c"]);
  });
  it("respects the 15-minute cooldown and done watches", () => {
    expect(shouldAlert(w({ lastAlertAt: "2026-10-09T17:50:00Z" }), now)).toBe(false);
    expect(shouldAlert(w({ lastAlertAt: "2026-10-09T17:44:00Z" }), now)).toBe(true);
    expect(shouldAlert(w({ doneAt: "2026-10-09T17:00:00Z" }), now)).toBe(false);
  });
  it("only watches of the current term count", () => {
    expect(activeForTerm([w({}), w({ id: "old", term: "202608" })], "202701").map((x) => x.id)).toEqual(["w1"]);
  });
});

describe("batching and wording", () => {
  it("batches 40 courses per request, sorted and unique", () => {
    const many = Array.from({ length: 85 }, (_, i) => w({ id: String(i), courseId: `CMSC${String(100 + i)}` }));
    expect(watchedCourses([...many, many[0]!])).toHaveLength(85);
    expect(batches(watchedCourses(many)).map((b) => b.length)).toEqual([40, 40, 5]);
  });
  it("words the alert with and without a waitlist", () => {
    expect(alertText({ courseId: "CMSC351", sectionId: "0201", open: 1, waitlist: 0, holdfile: 0 })).toEqual({ title: "CMSC351 0201 has 1 open seat", body: "Register on Testudo now. Waitlist: 0." });
    expect(alertText({ courseId: "CMSC351", sectionId: "0201", open: 2, waitlist: 3, holdfile: 0 })).toEqual({ title: "CMSC351 0201 has 2 open seats", body: "Waitlisted students may get it first. Waitlist: 3." });
  });
});
```

- [ ] **Step 2: Run it and see it fail.** Run `npm test -w @turboterp/web -- seat-alerts-logic --reporter=dot 2>&1 | tail -n 30`.
- [ ] **Step 3: Implement `logic.ts`** to make these pass. Key = `` `${courseId}-${sectionId}` ``. In `matchWatches`, when one user has both a section watch and an any-section watch matching the same opening, keep the section watch. Then run it and see it pass, commit and push.
- [ ] **Step 4: Migration** `supabase/migrations/0009_seat_alerts.sql` (written, not applied: the owner applies it in Task 4):

```sql
-- Seat Alerts (docs/project/seat-alerts.md). Service role only: the API routes enforce ownership.
create table if not exists public.seat_watches (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  term          text not null check (term ~ '^\d{6}$'),
  course_id     text not null check (course_id ~ '^[A-Z]{4}\d{3}[A-Z]?$'),
  section_id    text check (section_id is null or section_id ~ '^[A-Z0-9]{1,6}$'),
  created_at    timestamptz not null default now(),
  done_at       timestamptz,
  last_alert_at timestamptz
);
create unique index if not exists seat_watches_one_active on public.seat_watches (user_id, term, course_id, coalesce(section_id, '')) where done_at is null;
create index if not exists seat_watches_active_term on public.seat_watches (term) where done_at is null;
alter table public.seat_watches enable row level security; -- no policies: service role only

create or replace function public.seat_watches_limit() returns trigger language plpgsql as $$
begin
  if new.done_at is null and (select count(*) from public.seat_watches where user_id = new.user_id and done_at is null) >= 20 then
    raise exception 'seat watch limit' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger seat_watches_limit before insert on public.seat_watches for each row execute function public.seat_watches_limit();

create table if not exists public.push_subscriptions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  endpoint        text not null unique check (endpoint ~ '^https://'),
  p256dh          text not null,
  auth            text not null,
  user_agent      text,
  created_at      timestamptz not null default now(),
  last_success_at timestamptz
);
create index if not exists push_subscriptions_user on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security; -- no policies: service role only

create table if not exists public.seat_state (
  term       text not null,
  section_id text not null,
  course_id  text not null,
  open       int not null,
  waitlist   int not null,
  holdfile   int not null,
  checked_at timestamptz not null,
  primary key (term, course_id, section_id)
);
alter table public.seat_state enable row level security; -- no policies: service role only

create table if not exists public.seat_alert_cursor (id int primary key check (id = 1), next_course text, updated_at timestamptz not null default now());
alter table public.seat_alert_cursor enable row level security;

create extension if not exists pg_cron;
create extension if not exists pg_net;
do $$ begin
  if exists (select 1 from cron.job where jobname = 'turboterp-seat-alerts') then perform cron.unschedule('turboterp-seat-alerts'); end if;
end $$;
select cron.schedule('turboterp-seat-alerts', '* * * * *', $job$
  select net.http_post(
    url := 'https://turboterp.com/api/cron/seat-alerts',
    headers := jsonb_build_object('Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')),
    timeout_milliseconds := 60000
  );
$job$);
```

  (`seat_state`'s primary key includes `course_id`, because section numbers like 0101 repeat across courses. Use the key `${courseId}-${sectionId}` everywhere.)

- [ ] **Step 5: Store, sender and run, test-first.**
  - `seat-alerts-store.test.ts` checks the REST requests built (URL, method, headers, body) with a fake `fetch`.
  - `seat-alerts-push.test.ts` checks that 201 gives "ok", 404 and 410 give "gone", and anything else gives "failed".
  - `seat-alerts-run.test.ts` uses fake deps for store, fetchSections, push and a clock. Cases: no watches means no fetch; one opening alerts both of the user's devices once and marks alerted; a "gone" device is deleted; a failed batch retries once, then is skipped without saving state; the budget stops the run and sets the cursor.

  Then implement them:
  - `push.ts` imports `web-push` (add the dependency to `apps/web/package.json`) and sets VAPID details from env once.
  - `run.ts` sorts courses, starts at the cursor, and for each batch calls `fetchSections(term, batch)` (from `@turboterp/course-data`), maps to `SeatCount` (`section.seats.open`, `.waitlist`, `.holdfile`; `sectionId` = `section.id`), calls detect, save, match and push, then marks alerted. It pauses 300 ms between batches and stops at 50 seconds.
  - The term is the current Schedule of Classes term from the snapshot store `schedule/current` (see `soc-refresh.ts` `currentTerm`).
- [ ] **Step 6: Cron job.**
  - Add `"seat-alerts"` to `JOBS` in `lib/cron.ts`, with a test.
  - In `app/api/cron/[job]/route.ts`, `seat-alerts` builds the deps (`supabaseEnv()`; return 503 `not-configured` when Supabase or the VAPID keys are missing) and returns `runSeatAlerts`'s report with `Cache-Control: no-store`.
  - Commit and push.
- [ ] **Step 7: Finish.** Run the full `npm test`, typecheck, lint and build once, and report.

---

### Task 2: Student API (Builder P2, branch `feat/seat-alerts-api`, after Task 1 is merged)

**Consumes:** Task 1's store, logic, push and `MAX_WATCHES`.

**Produces:** JSON routes. All are `no-store`, require the `Authorization: Bearer <supabase access token>` header resolved with `supabaseGetUser`, and return 401 without a valid token and 503 when not configured.
- `GET /api/seat-alerts/watches` returns `{ term, watches: Array<Watch & { status: { open: number; waitlist: number; checkedAt: string } | null }>, done: Watch[] (this term), ended: number (older terms' active watches, now ended) }`.
- `POST /api/seat-alerts/watches` takes `{ courseId, sectionId: string | null }`.
  - It validates the format and that the course and section exist in the current term's snapshot.
  - It refuses a section that's open now: 409 `{ error: "open-now" }`. The open count comes from `seat_state`, else the snapshot's seats.
  - At the limit it returns 409 `{ error: "limit" }`; for a duplicate, 200 with the existing watch.
- `POST /api/seat-alerts/watches/{id}/done` ("I got it") and `DELETE /api/seat-alerts/watches/{id}` (Remove). Both check ownership; another user's watch gets 404.
- `POST /api/seat-alerts/subscription` takes `{ endpoint, keys: { p256dh, auth } }` and upserts on the endpoint, reassigning the user. `DELETE` takes `{ endpoint }`.
- `POST /api/seat-alerts/test` sends "Seat Alerts are on" to the user's devices and returns `{ sent, gone }`.
- The notification click "I got it" action calls `POST /api/seat-alerts/watches/{id}/done` from the service worker. The service worker has no access token, so this route also accepts `?token=<signed watch token>`: an HMAC of the watch id using `CRON_SECRET`, included in the push payload, valid for 7 days. Test it.

- [ ] Test-first in `apps/web/lib/__tests__/seat-alerts-api.test.ts`. The handlers in `lib/seat-alerts/api.ts` take injected deps, as `handleAccountDelete` does. Cover every status code above, ownership, the limit, open-now, duplicates, and the signed token (valid, wrong id, expired).
- [ ] Thin route files under `app/api/seat-alerts/`. Run the full suite once and report.

---

### Task 3: UI (Builder P3, branch `feat/seat-alerts-ui`; can run alongside Task 2 against the contracts above)

- [ ] **Schedule sub-nav:**
  - `app/schedule/layout.tsx` and `components/ScheduleNav.tsx` (copy `CampusNav`'s pattern), with **Builder** → `/schedule` and **Seat Alerts** → `/schedule/alerts`.
  - Add `/schedule/alerts` to `app/sitemap.ts`.
- [ ] **`public/sw.js`:**
  - the `push` event shows the notification from the JSON payload (`title`, `body`, `url`, `watchId`, `token`), with `tag` = watch id so repeats replace each other, and on browsers that support actions an "I got it" action;
  - `notificationclick` focuses or opens `url`, and the "I got it" action POSTs to `/api/seat-alerts/watches/{watchId}/done?token=…`;
  - **no fetch handler**.
- [ ] **`lib/seat-alerts/client.ts`** (pure, unit-tested):
  - `pushSupport(env)` returns `"supported" | "ios-needs-home-screen" | "unsupported"`. For iOS Safari, a standalone display mode means supported, otherwise `ios-needs-home-screen`.
  - `permissionStatus()`.
  - `subscribe()`: register `sw.js`, `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: NEXT_PUBLIC_VAPID_PUBLIC_KEY })`, then POST the subscription.
  - `unsubscribe()`.
- [ ] **`/schedule/alerts` page:**
  - signed out: a "Sign in to get seat alerts" card (reuse the Advisor's sign-in);
  - the status line in four states, with "Send a test alert";
  - an "Add a class" course search for the current term, listing sections with seats, waitlist, instructor and times; a full section has **Notify me**, an open one says "Open now: register on Testudo", and the course has **Any section of <course>**;
  - the watch list (status, minutes since check, last alert, **I got it**, **Remove**), "N of 20 watches", the collapsed "Done" list, and the "ended last term" note;
  - the honesty footer, with the exact copy from Global constraints.
  - Match `docs/project/ui-rework.md` tokens: tiles, one main action per row, Apple-like.
- [ ] **Bells in `SectionPanel.tsx`:** a full section shows a small bell "Notify me"; the course header shows "Any section". When signed out, tapping goes to Seat Alerts' sign-in card. A watched section shows a filled bell.
- [ ] **Today:** while the student has active watches, show "Seat Alerts: N watching", linking to the page.
- [ ] **Privacy:** add the line from the spec, section 4, to `lib/legal.ts`.
- [ ] Unit tests for `pushSupport` and the list view-model. **Two screenshots**, seeding the page with mocked API data in development: the Seat Alerts page with watches, and a section panel with bells. Save them to `docs/screenshots/seat-alerts/`. Run the full suite once and report.

---

### Task 4: Setup, merge and live check (owner + main session)

- [ ] **Owner:**
  - Run `npx web-push generate-vapid-keys`, then set `VAPID_PUBLIC_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (the same public key), `VAPID_PRIVATE_KEY` and `VAPID_SUBJECT=mailto:<support address>` in Vercel Production and `apps/web/.env.local`.
  - Apply `0009_seat_alerts.sql` in the Supabase SQL editor.
  - Deploy.
- [ ] **Main session:**
  - Review and merge Tasks 1–3 into `feat/ui-rework`, run the full suite, and run `graphify update .`.
  - Live check after deploy, with a throwaway account:
    1. Watch a real full section.
    2. "Send a test alert" arrives on desktop or Android and on an iPhone with TurboTerp on its Home Screen.
    3. Set that section's `seat_state.open` to 0, wait for an opening (or confirm none is sent), and confirm exactly one alert and the cooldown.
    4. "I got it" from the notification ends the watch.
    5. Deleting the account removes the watches and subscriptions.
- [ ] Show the owner the screenshots for UI approval. Update PROJECT_MEMORY section 14 and the status log.
