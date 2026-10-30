# Seat Alerts Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seat Alerts becomes a main tab at `/alerts` in place of Calendar, with no sign-in: watches belong to the device, and a device gets one automatic test notification when it turns alerts on.

**Architecture:** A new `alert_devices` table replaces `push_subscriptions`; a device is one push subscription plus a random secret the browser keeps in `localStorage` and sends as `Authorization: Device <deviceId>.<secret>`. `seat_watches.user_id` becomes `device_id`. The API handlers in `lib/seat-alerts/api.ts` swap Supabase-user auth for device auth; the client drops the session. The page moves from `app/schedule/alerts/` to `app/alerts/` and opens with a summary and only this device's setup step.

**Tech Stack:** Next.js (apps/web), TypeScript, Vitest, Supabase REST (service role), Web Push (`web-push`).

**Spec:** `docs/project/seat-alerts-tab.md` (changes `docs/project/seat-alerts.md`). Read both.

## Global Constraints

- Name stays "Seat Alerts". Nav: Campus · Schedule · Seat Alerts · Advisor.
- No sign-in anywhere in Seat Alerts. Sign-in elsewhere in TurboTerp is untouched.
- 20 active watches per device (`MAX_WATCHES`, unchanged). Cooldown 5 minutes, alert wording and the Drop/Add link unchanged.
- Never say the setup is temporary or "until the app".
- Test notification: title `Test: this is what a Seat Alert looks like`, body `When a seat opens in a class you watch, you'll get one like this.`, url `/alerts`. Sent once, when a device is first created. No test button, no `/api/seat-alerts/test`.
- No per-IP limit on new devices (owner: campus Wi-Fi shares IPs). Push endpoints must be `https://` on a known push service host: `web.push.apple.com`, `fcm.googleapis.com`, `updates.push.services.mozilla.com`, or a host ending in `.notify.windows.com`; anything else → 400 `bad-request`.
- Existing watches and subscriptions are dropped by the migration (owner is the only user).
- Run from `apps/web`: `npx vitest run <file>`; at the end `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- Don't use GitHub Actions; verify locally.

## Review Focus

1. **Browser storage cleared or unavailable** (private mode, deleted Home Screen app): the browser re-registers with an endpoint the server already has; the old device row (and its unreachable watches) is replaced, not a 409 or a crash. Test in Task 1.
2. **Push service rotates the subscription endpoint:** re-registering with a valid token updates that device's endpoint and keys, keeps its watches, and sends no second test. Test in Task 1.
3. **Forged or another device's token:** `Device x.y` with a wrong secret, a malformed header, or a real device id with someone else's secret gets 401 and never reads or changes watches. Test in Task 1.
4. **`localStorage` throws** (Safari private mode, blocked storage): `loadDeviceToken` returns null and `saveDeviceToken` fails silently; the page still renders. Test in Task 2.
5. **iPhone Safari tab** taps a bell in the Schedule tab: it links to `/alerts` and never asks for permission (Safari tabs can't get push). Test in Task 2 (`bellMode`).

---

### Task 1: Device identity on the server

**Files:**
- Create: `supabase/migrations/0010_seat_alert_devices.sql`
- Create: `apps/web/app/api/seat-alerts/device/route.ts`
- Delete: `apps/web/app/api/seat-alerts/subscription/route.ts`, `apps/web/app/api/seat-alerts/test/route.ts`
- Modify: `apps/web/lib/seat-alerts/logic.ts`, `store.ts`, `api.ts`, `deps.ts`, `run.ts`
- Test: `apps/web/lib/__tests__/seat-alerts-api.test.ts`, `seat-alerts-store.test.ts`, `seat-alerts-store-api.test.ts`, `seat-alerts-run.test.ts`, `seat-alerts-logic.test.ts`

**Interfaces:**
- Produces (HTTP, used by Task 2):
  - `POST /api/seat-alerts/device`, body `{ endpoint, keys: { p256dh, auth } }`, optional `Authorization: Device <token>`.
    - Valid token → updates that device's endpoint/keys → `200 { token }` (same token), no test push.
    - No or invalid token → creates a device, sends the test push → `201 { token, test: "ok" | "failed" }`. If another device row has this endpoint, delete that row first (cascade removes its watches).
    - Endpoint not on a known push service host → `400 { error: "bad-request" }`. VAPID not configured → `503 { error: "not-configured" }` before anything is written.
  - `DELETE /api/seat-alerts/device` with the token → deletes the device and its watches → `200 { ok: true }`.
  - `GET/POST /api/seat-alerts/watches`, `POST .../watches/[id]/done`, `DELETE .../watches/[id]`: same bodies and responses as today, but authorized by `Authorization: Device <token>` (401 `{ error: "unauthorized" }` otherwise). The signed `?token=` path for "I got it" is unchanged.
- Produces (TS): `Watch.deviceId: string` (replaces `userId`); `DeviceSub = { deviceId: string; endpoint: string; p256dh: string; auth: string }`; `parseDeviceToken(header: string | null): { deviceId: string; secret: string } | null` in `api.ts`; `TEST_ALERT = { title, body, url }` exported from `api.ts`.

- [ ] **Step 1: Write the migration** `0010_seat_alert_devices.sql`:
  - `delete from public.seat_watches;` then `drop table public.push_subscriptions;`
  - `create table public.alert_devices (id uuid primary key default gen_random_uuid(), secret_hash text not null, endpoint text not null unique check (endpoint ~ '^https://'), p256dh text not null, auth text not null, created_at timestamptz not null default now(), last_success_at timestamptz);` RLS on, no policies.
  - `seat_watches`: drop `user_id` (and its unique index), add `device_id uuid not null references public.alert_devices(id) on delete cascade`; recreate `seat_watches_one_active` on `(device_id, term, course_id, coalesce(section_id, ''))` where `done_at is null`; replace `seat_watches_limit()` to count by `device_id`.
  - Header comment: deploy this together with the code (the old code reads `user_id`).

- [ ] **Step 2: Write failing tests** in `seat-alerts-api.test.ts` (rewrite the fakes around a device store; drop `getUser`):
  - `device create: no token → 201 with "<uuid>.<secret>" token, one test push with TEST_ALERT, secret stored only as sha256`
  - `device create: endpoint already on another device → that device deleted, new one created` (Review Focus 1)
  - `device re-register: valid token + new endpoint → 200 same token, endpoint and keys updated, no push` (Review Focus 2)
  - `device create: endpoints on web.push.apple.com, fcm.googleapis.com, updates.push.services.mozilla.com and wns2-par02p.notify.windows.com accepted; http://, https://evil.example and https://web.push.apple.com.evil.example → 400`
  - `device create: vapid not configured → 503, nothing written`
  - `device create: test push fails → 201 with test "failed"; test push gone → device deleted, 201 test "failed"`
  - `auth: missing header, "Bearer x", "Device nodot", unknown id, wrong secret → 401 on GET watches` (Review Focus 3)
  - `watches: device A's token can't done/delete device B's watch → 404`
  - existing watch tests (create, open-now, limit 20, already watched, done via signed token) ported from `userId` to `deviceId`.
  - `device delete: valid token → device deleted`
  - Store tests: URLs use `alert_devices` and `seat_watches?device_id=eq.`; run tests: subscriptions looked up by device id, a `gone` push deletes that device.

- [ ] **Step 3: Run** `npx vitest run lib/__tests__/seat-alerts-api.test.ts lib/__tests__/seat-alerts-store.test.ts lib/__tests__/seat-alerts-store-api.test.ts lib/__tests__/seat-alerts-run.test.ts`. Expected: FAIL.

- [ ] **Step 4: Implement.**
  - `logic.ts`: `Watch.userId` → `deviceId`; `matchWatches` collapses per device (rename `perUser`).
  - `store.ts`: replace the `push_subscriptions` methods with `createDevice({ secretHash, sub }): Promise<string>` (returns id), `getDevice(id): Promise<{ id; secretHash } | null>`, `updateDeviceSub(id, sub)`, `deleteDevice(id)`, `deleteDeviceByEndpoint(endpoint)`, `subscriptionsFor(deviceIds): Promise<DeviceSub[]>`. `listWatches(deviceId)`, `createWatch(deviceId, ...)`.
  - `api.ts`: `authenticate` resolves `Device <id>.<secret>` → compares `hashKey(secret)` (from `lib/email/rate-limit.ts`) to `secretHash` with `timingSafeEqual`. Secret = 32 random bytes, base64url. Add `handleDeviceRegister` and `handleDeviceDelete`; delete `handleTestAlert`, `handleSubscriptionSave/Delete`. `SeatApiDeps` loses `getUser`, gains nothing else.
  - `deps.ts`: drop `getUser`.
  - `run.ts`: subscriptions by `watch.deviceId`; on `gone` call `store.deleteDevice(sub.deviceId)`.
  - `app/api/seat-alerts/device/route.ts`: `POST` and `DELETE`, same shape as the old subscription route.

- [ ] **Step 5: Run** the same tests, then `npx tsc --noEmit` (errors only in client files are expected until Task 2; list them in the report). Expected: tests PASS.

- [ ] **Step 6: Commit** `Seat Alerts: watches belong to the device, test alert on first setup`.

---

### Task 2: Device credential in the browser

**Files:**
- Create: `apps/web/lib/seat-alerts/device.ts`
- Modify: `apps/web/lib/seat-alerts/client.ts`, `use-watches.ts`, `apps/web/app/schedule/SeatBell.tsx`, `apps/web/app/schedule/alerts/StatusCard.tsx`, `AlertsApp.tsx`, `apps/web/app/SeatAlertsCard.tsx`
- Delete: `apps/web/app/schedule/alerts/SignInCard.tsx`
- Test: `apps/web/lib/__tests__/seat-alerts-client.test.ts`, create `apps/web/lib/__tests__/seat-alerts-device.test.ts`

**Interfaces:**
- Consumes: Task 1's HTTP endpoints.
- Produces (used by Task 3):
  - `device.ts`: `DEVICE_KEY = "turboterp.seatAlerts.device"`; `loadDeviceToken(storage?: Storage): string | null`; `saveDeviceToken(token: string, storage?: Storage): void`; `clearDeviceToken(storage?: Storage): void`. All catch storage errors.
  - `client.ts`: `subscribe(): Promise<string | null>` now posts to `/api/seat-alerts/device` with the saved token (if any) and saves the returned one; `unsubscribe()` calls `DELETE /api/seat-alerts/device` then clears the token. `call()` sends `Authorization: Device <token>`; no token → `{ ok: false, status: 401, error: "no-device" }`. Remove `accessToken` and `sendTestAlert`.
  - `client.ts`: `bellMode(support: PushSupport): "watch" | "link" | "hidden"` → `supported` → `"watch"`, `ios-needs-home-screen` → `"link"`, `unsupported` → `"hidden"`.
  - `use-watches.ts`: `WatchesState.phase: "loading" | "needs-setup" | "ready" | "unavailable"` (no `"signed-out"`); new `enable(): Promise<string | null>` = `subscribe()` then reload. No `useSession`.

- [ ] **Step 1: Write failing tests:**
  - `seat-alerts-device.test.ts`: `round-trips a token`, `load returns null and save/clear don't throw when storage throws` (Review Focus 4).
  - `seat-alerts-client.test.ts`: `bellMode maps supported→watch, ios-needs-home-screen→link, unsupported→hidden` (Review Focus 5); remove tests for `sendTestAlert`/`accessToken`.
- [ ] **Step 2: Run** `npx vitest run lib/__tests__/seat-alerts-device.test.ts lib/__tests__/seat-alerts-client.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** the interfaces above, then the UI:
  - `StatusCard`: remove "Send a test alert" and its handler. After `subscribe()` succeeds the status reads "Alerts are on for this device".
  - `AlertsApp`: `needs-setup` shows `StatusCard` only (no add-class or list); remove `SignInCard`, the email and Sign out line, and `useSession`.
  - `SeatBell`: `bellMode(pushSupport(currentPushEnv()))`; `"link"` → `<Link href="/alerts">`; `"hidden"` → null; `"watch"` with phase `needs-setup` → on tap `await state.enable()` then `state.add(...)`.
  - `SeatAlertsCard`: unchanged logic (counts this device's watches); href set in Task 3.
- [ ] **Step 4: Run** the two test files, then `npm test` and `npx tsc --noEmit`. Expected: PASS, no type errors.
- [ ] **Step 5: Commit** `Seat Alerts: no sign-in, device token in the browser, no test button`.

---

### Task 3: The Seat Alerts tab replaces Calendar

**Files:**
- Move: `apps/web/app/schedule/alerts/*` → `apps/web/app/alerts/*` (`page.tsx`, `AlertsApp.tsx`, `AddClass.tsx`, `StatusCard.tsx`, `alerts.module.css`, `manifest.webmanifest/route.ts`)
- Delete: `apps/web/app/calendar/`, `apps/web/components/ScheduleNav.tsx` (keep its `mockAllowed` effect in `app/schedule/layout.tsx`), `CalendarIcon` if unused
- Modify: `apps/web/components/Nav.tsx`, `components/icons.tsx` (add `BellIcon`), `next.config.*` redirects, `lib/app-manifest.ts`, `public/sw.js`, `app/sitemap.ts`, `app/SeatAlertsCard.tsx`, `app/NextClassHero.tsx`, `lib/seat-alerts/view.ts`, `lib/seat-alerts/mock.ts` (comment path)
- Test: `apps/web/lib/__tests__/app-manifest.test.ts`, `apps/web/lib/__tests__/seat-alerts-view.test.ts` (create if absent)

**Interfaces:**
- Consumes: `PushSupport`, `pushSupport`, `currentPushEnv` (client.ts); `WatchesState` with `needs-setup` (Task 2).
- Produces: `setupSteps(support: PushSupport): string[]` in `lib/seat-alerts/view.ts`; `ALERTS_START_URL = "/alerts"`, `ALERTS_MANIFEST_PATH = "/alerts/manifest.webmanifest"`.

- [ ] **Step 1: Write failing tests:**
  - `app-manifest.test.ts`: start_url `/alerts`, manifest path `/alerts/manifest.webmanifest`.
  - `seat-alerts-view.test.ts`: `setupSteps("ios-needs-home-screen")` equals `["Tap Share, then Add to Home Screen.", "Open TurboTerp from your Home Screen.", "Turn on alerts there and add your classes."]`; `setupSteps("supported")` equals `["Turn on alerts for this device.", "Add a full class, or any section of it.", "When a seat opens, tap the alert to go to Testudo."]`; `setupSteps("unsupported")` equals `[]`.
- [ ] **Step 2: Run** `npx vitest run lib/__tests__/app-manifest.test.ts lib/__tests__/seat-alerts-view.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Move the page to `app/alerts/`; `<Page title="Seat Alerts">` with no "Schedule" subtitle; description metadata unchanged.
  - Top of `AlertsApp`: an intro tile, heading `Get a notification when a seat opens`, text `Watch a full class or section. TurboTerp checks Testudo every minute and notifies this device the moment a seat opens, so you can grab it.`, then "How it works" as a numbered list from `setupSteps(support)`. Unsupported: `This browser can't get notifications. Try Safari on iPhone (from the Home Screen), or Chrome on Android or a computer.` Final wording is a draft for the owner's approval.
  - `ios-needs-home-screen`: intro + the existing Home Screen guide only (no add-class, no list, no turn-on button).
  - `Nav.tsx` TABS: `{ href: "/alerts", label: "Seat Alerts", Icon: BellIcon }` third, Calendar removed; update the comment.
  - Redirects: `/schedule/alerts` → `/alerts`, `/schedule/alerts/:path*` → `/alerts/:path*`, `/calendar` → `/`; all `permanent: false`.
  - `app/schedule/layout.tsx`: drop the sub-nav; keep the dev-only `mockAllowed(window.location.search)` effect.
  - `sw.js`, `SeatAlertsCard`, `sitemap.ts`: `/schedule/alerts` → `/alerts`; remove `/calendar` from the sitemap.
  - `NextClassHero.tsx`: the academic-date hero gets no `href` (Hero renders a plain div).
  - Keep `lib/calendar.ts` and its tests (Today, Advisor, RegistrationPanel use it).
- [ ] **Step 4: Run** `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: all pass, `/alerts` in the build output, no `/calendar` route.
- [ ] **Step 5: Screenshots** with the dev server and `?mock=1`: `/alerts` on a phone and a desktop viewport, saved to `docs/screenshots/seat-alerts-tab/`.
- [ ] **Step 6: Commit** `Seat Alerts tab replaces Calendar`.

---

## After the tasks (main session)

- Owner applies `0010_seat_alert_devices.sql` and deploys in the same window (the old code breaks on the new schema and vice versa).
- Live check on the owner's iPhone per the spec's "Done when"; the old Home Screen icon still opens `/schedule/alerts`, which redirects.
- Update `PROJECT_MEMORY.md` (nav, Seat Alerts state) and `docs/project/seat-alerts.md` (point to the new spec for sign-in, placement and the test alert).
