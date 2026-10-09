# Seat Alerts: design spec (owner-approved design, 2026-10-09)

## Goal

Students pick classes and full sections of those classes to watch. TurboTerp checks Testudo **every
minute**, and when a watched section gets an open seat, the student gets a **push notification**
("CMSC351 0201 has 1 open seat").

## Owner decisions (2026-10-09)

- **Push only.** No seat-alert emails, because Brevo's free plan is 300 emails a day, shared with
  sign-in.
- **A watch stays on until the student taps "I got it"** (or removes it). If the seat fills and opens
  again, they get another alert, at most one per section every 15 minutes.
- **Watch scope:** specific sections, plus "any section of <course>". Up to **20** active watches per
  student.
- **Name and place:** "**Seat Alerts**", inside the **Schedule** tab, which gets a sub-nav like Campus:
  Builder · Seat Alerts. The four main tabs stay as they are.
- **How it runs:** option A, Supabase cron every minute calling a protected site endpoint.
- **iPhone:** web push needs TurboTerp installed with Add to Home Screen (iOS 16.4 and later; Safari
  tabs can't get push). Students in a Safari tab see a short guide. A future App Store app would use
  Apple's native push, with the same back end.
- This supersedes PROJECT_MEMORY section 2 "Seat alerts were NOT requested" and the email spec's "out:
  seat alerts".

## 1. Student experience

- **Signed-in students only:** watches and push subscriptions belong to the account. Signed-out
  students see a "Sign in to get seat alerts" card.
- **Adding watches:**
  - In the schedule builder's section popover, a full section (0 open seats) shows a bell, **Notify
    me**. The course header offers **Any section of CMSC351**.
  - On the Seat Alerts page, a course search ("Add a class") lists the course's sections with seats,
    waitlist, instructor and times, and offers the same choices. Open sections can't be watched; the
    row says "Open now: register on Testudo".
- **The Seat Alerts page** (`/schedule/alerts`):
  - At the top, a notification status line:
    - "Alerts are on for this device";
    - "Turn on notifications" (one button that asks the browser for permission);
    - iPhone in a Safari tab: "Add TurboTerp to your Home Screen to get alerts" with the two steps;
    - notifications blocked in browser settings: how to unblock them.
  - Then one row per watch:
    - course, section (or "Any section"), instructor and times;
    - live status: "Full · waitlist 4" or "1 open · waitlist 0", plus the minutes since TurboTerp
      last checked;
    - "Last alert 2:41 PM";
    - actions: **I got it** (ends the watch) and **Remove** (one tap: easy to redo, per the
      two-tap ruling).
  - A count, "7 of 20 watches".
  - A finished watch (I got it) moves to a collapsed "Done" list for the term.
- **The notification:** title "CMSC351 0201 has 1 open seat". Body "Register on Testudo now. Waitlist:
  0." or "Waitlisted students may get it first. Waitlist: 3."
  - Tapping it opens Seat Alerts with that watch highlighted.
  - On Android and desktop it also has an **I got it** action button. iOS doesn't show action buttons,
    so there the student uses the button in the app.
- **Today:** while any watch is active, a small "Seat Alerts: 3 watching" card links to the page.
- **The term:** watches are for the term whose sections the Schedule tab shows (the current Schedule
  of Classes term). When the term moves on, last term's watches end automatically and the page says
  so.

## 2. Checking (every minute)

- **Cron:** Supabase migration `0009_seat_alerts.sql` adds the tables (section 4) and a pg_cron job
  `turboterp-seat-alerts` at `* * * * *`. The job calls `POST https://turboterp.com/api/cron/seat-alerts`
  with the existing `cron_secret` bearer header (`authorizeCron`; add `seat-alerts` to `JOBS`).
- **Each run:**
  1. Load the active watches (not done, for the current term). With none, stop: no Testudo request.
  2. Take the distinct watched courses and fetch their sections with the existing `fetchSections`,
     **40 courses per request, one request at a time, 300 ms apart** (snapshot.ts politeness). A
     failed batch is retried once. If it fails again, that batch is skipped this minute; the run
     never fails as a whole.
  3. Compare each section's open seats with `seat_state`. An **opening** is a section going from
     0 open to more than 0. A section seen for the first time only sets its baseline and never
     alerts. Save the new counts and `checked_at`.
  4. For each opening, find the watches it matches: section watches for that section, and
     "any section" watches for its course. Skip a watch whose `last_alert_at` is less than 15 minutes
     ago.
  5. Send a push to each subscription of each matched student. Set `last_alert_at`. Delete a
     subscription when the push service answers 404 or 410 (expired).
- **Time budget:** 50 seconds. If the watched courses don't fit, save a cursor and continue next
  minute. A section checked later is still checked within about 2 minutes.
- **Load:** one request per 40 watched courses each minute (e.g. 500 watched courses means 13
  requests a minute). That's lighter than the existing full-term seat refresh, which makes about 110
  requests per run every 5 to 15 minutes.
- **Hosting cost:** about 43,000 short calls a month on Vercel's free tier. Runs with no watches
  return at once.
- **Lag:** the existing 5- or 15-minute schedule-builder seat refresh is unchanged and separate.
  Seat Alerts keeps its own per-minute state.

## 3. Push

- **Standard Web Push** (VAPID) with the `web-push` npm package on the server.
  - Keys: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` and `VAPID_SUBJECT` (`mailto:` the support address).
  - They live only in Vercel env vars and `apps/web/.env.local`, never in the repo. The owner creates
    them with `npx web-push generate-vapid-keys`, guided in the plan.
- **Service worker** `public/sw.js`, registered only when a student turns on alerts:
  - it only handles `push` (shows the notification) and `notificationclick` (opens or focuses Seat
    Alerts; the "I got it" action calls the API);
  - **no fetch handler and no caching**, so pages and data never go stale.
- **Subscribing:** `POST /api/seat-alerts/subscription` (signed-in) stores the browser's subscription
  (endpoint and keys), one row per device. Turning alerts off on a device deletes its row.
- A test notification button, "Send a test alert", confirms a device works.

## 4. Data (`0009_seat_alerts.sql`)

- `seat_watches`:
  - columns: `id`, `user_id` → auth.users (cascade delete), `term`, `course_id`, `section_id` (null =
    any section), `created_at`, `done_at` (null = active), `last_alert_at`;
  - unique (`user_id`, `term`, `course_id`, `coalesce(section_id, '')`) among active rows;
  - the limit of 20 active watches per user is enforced by a trigger (and checked in the API for a
    friendly message).
- `push_subscriptions`: `id`, `user_id` (cascade), `endpoint` (unique), `p256dh`, `auth`,
  `user_agent`, `created_at`, `last_success_at`.
- `seat_state`: `term`, `section_id` (primary key together), `course_id`, `open`, `waitlist`,
  `holdfile`, `checked_at`. Server only (no RLS read policy for students; the page reads statuses
  through the API).
- `seat_alert_cursor`: a single row for a run that overruns its budget.
- **RLS:** students select, insert and update only their own `seat_watches` and `push_subscriptions`.
  The cron uses the service role.
- **Privacy and Delete account:** account deletion already cascades `user_id` rows. Add a privacy-page
  line: "Seat Alerts: the classes you watch and, if you turn on notifications, your browser's push
  address (from Apple, Google or Mozilla). Deleted with your account."

## 5. Safety and honesty

- The page footer says: "Alerts are best-effort and can be a minute or two late. TurboTerp checks
  Testudo; it never registers you or uses your UMD login."
- No Testudo credentials, ever (legal.md).
- **Waitlists:** at UMD, open seats in a section with a waitlist generally go to waitlisted students
  first (to confirm from the Registrar's waitlist page while building, and cite it). So the alert
  always shows the waitlist count, and the wording changes when the waitlist is greater than 0.

## 6. Testing (test-first)

- **Pure logic:** opening detection, including the first-check baseline; matching section and
  any-section watches; the 15-minute limit; done and other-term watches ignored; the 20-watch limit;
  batching courses by 40 with the cursor; notification text with and without a waitlist; pruning
  expired subscriptions (404 and 410).
- **API:** watch create, list, I got it and remove (auth, ownership, limit, open-section refusal);
  subscription save and delete; the cron route (auth, no-watch fast path). Supabase, Testudo and
  `web-push` are injected and mocked.
- **UI:** unit tests for the status line (supported, permission state, iPhone-not-installed), plus
  screenshots for owner approval.
- **Live check** (main session): with a throwaway account, watch a real full section and confirm a
  test alert arrives on Android or desktop and on an iPhone with TurboTerp on its Home Screen. Then
  confirm that a real opening, or a simulated one with `seat_state` set to 0, sends exactly one alert.
