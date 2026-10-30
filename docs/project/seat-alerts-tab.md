# Seat Alerts as a main tab: design (owner, 2026-10-29)

Changes `docs/project/seat-alerts.md` (the 2026-10-09 spec). Everything there still holds unless this
document says otherwise.

## Why

Seat Alerts is the idea that started TurboTerp and the part people love, but it sits inside the
Schedule tab. The Calendar tab, meanwhile, is a reformatted copy of the Registrar's dates page that
Google already answers. So Calendar goes and Seat Alerts takes its place.

Setup is the problem. On iPhone, push only works from TurboTerp added to the Home Screen, and a Home
Screen web app keeps its own storage: signing in on the website doesn't carry over to the Home Screen
app. The owner, who built it, got confused setting it up, so every student will. The fix is to remove
sign-in from Seat Alerts and to show each device only the step that applies to it. (A real iOS app
would fix this properly; it is not part of this work.)

## Goals

1. **Navigation:** Campus · Schedule · **Seat Alerts** · Advisor. The name stays "Seat Alerts". The
   Calendar tab is removed.
2. **The tab opens with a short summary:** what Seat Alerts does and how to set it up, followed by
   the setup step for this device, then the watch list.
3. **No sign-in for Seat Alerts:** watches belong to the device (its push subscription), not an
   account.
4. **One automatic test notification** when a device first turns alerts on, so the student sees what
   an alert looks like. The "Send a test alert" button is removed.

## Non-goals

- An iOS app.
- Finals times and a calendar subscription in the Schedule tab. That's a separate follow-up, and its
  first step is checking how UMD publishes final exam times.
- Changing alert wording, the 5-minute cooldown, the tap → Testudo Drop/Add link, or the per-minute
  checker. The owner is happy with all of these.

## Anti-goals (a failure even if it works)

- Any path where a student signs in in one place and finds they're signed out in another.
- Telling the student this setup is a stopgap until the app. The owner doesn't want that said.
- A setup screen that shows every device's steps at once.

## 1. The tab

- **Route:** `/alerts` becomes the tab's route; `/schedule/alerts` redirects there. The Home Screen
  manifest's start URL becomes `/alerts`.
- **Top of the tab:** a short summary, roughly: "Full class? Seat Alerts watches it and sends a
  notification to your phone the moment a seat opens, so you can grab it on Testudo." Then "How it
  works" as a few numbered steps written for this device (below). The final wording is the
  builder's to draft and the owner's to approve.
- **Setup step, chosen by where the page is open:**
  - **iPhone or iPad in Safari** (not running from the Home Screen): only "Add TurboTerp to your Home
    Screen, then open it from there", with the existing short visual guide. No watch list, no add
    class, no notification button here. Nothing to sign in to.
  - **Running from the Home Screen** (`display-mode: standalone`), **Android, or a computer:** a
    "Turn on alerts" button that asks for notification permission. After permission, the test
    notification is sent and the status line reads "Alerts are on for this device".
  - **Notifications blocked:** how to unblock them (existing copy).
  - **Browser without push support:** says so plainly.
- **Below the setup:** the existing watch list, Add a class, "I got it", Remove and Done list, shown
  once alerts are on for this device.
- **The Calendar tab:** remove the nav item, `app/calendar/` and its sitemap entry; `/calendar`
  redirects to `/`. Keep `lib/calendar.ts` and the campus-data scraper: Today, the Advisor plan and
  the Advisor export still use them.

## 2. Watches belong to the device

- **Identity:** a device is its push subscription. When alerts are turned on, the server creates a
  device record and returns a random device secret; the client keeps it where both the page and the
  service worker can read it (IndexedDB), and sends it with every Seat Alerts API call. The builder
  chooses the exact mechanism; the requirement is that only that device can read or change its
  watches.
- **Limit:** 20 active watches per device (the existing number). Add a modest per-IP limit on
  creating device records so nobody can flood the table.
- **Losing the device:** if the student deletes the Home Screen app or clears site data, the watches
  are gone and the device record expires once pushes to it fail (404/410, as today). This is
  accepted.
- **Accounts:** Seat Alerts no longer reads or needs the account. Sign-in for the rest of TurboTerp
  (Advisor sync etc.) is unchanged. The sign-in card in Seat Alerts goes away.
- **Existing data:** the owner is the only current user, so the existing account-based watches and
  subscriptions may be dropped by the migration rather than converted (Claude's call).
- **Data:** a new migration (next number after `0009`) moves `seat_watches` and
  `push_subscriptions` from `user_id` to a device id. The checker (`lib/seat-alerts/run.ts`) sends
  each opening to the subscription of the device that owns the watch.

## 3. The test notification

- Sent once, automatically, right after a device's alerts are turned on (permission granted and
  subscription saved). Not sent again for that device.
- Looks like a real alert but is clearly a test, e.g. title "Test: this is what a Seat Alert looks
  like", body "When a seat opens in a class you watch, you'll get one like this." Tapping it opens
  the Seat Alerts tab.
- The "Send a test alert" button and `/api/seat-alerts/test` are removed.

## 4. The bell in the Schedule tab

- On a device that can get notifications (computer, Android, Home Screen app): the bell adds the
  watch to this device. If alerts aren't on yet, it turns them on first (permission prompt, then the
  test notification).
- In Safari on an iPhone: the bell links to the Seat Alerts tab, which shows only the Home Screen
  step.
- The Today card ("Seat Alerts: N watching") stays and links to `/alerts`; it counts this device's
  watches.

## Left to the builder

- The exact device-secret storage and API shape.
- Summary and step wording (drafts; the owner approves the UI).
- Visual layout of the tab within the existing UI rework styles.
- Detecting iPhone Safari versus standalone versus other browsers.

## Done when

- Full local suite, typecheck, lint and build pass.
- On an iPhone: Safari shows only the Home Screen step; the Home Screen app turns alerts on with no
  sign-in, gets the test notification, adds a watch, and gets a real alert on an opening.
- On a computer browser: the same flow without the Home Screen step.
- `/calendar` and `/schedule/alerts` redirect; the nav shows four tabs with Seat Alerts third.
- The owner approves the UI.
