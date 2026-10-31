# iOS app plan

Drafted 2026-10-29 by the main session for the owner's request: "plan the transfer of this project to iOS app form", with timelines, steps agents can run in parallel, and the owner's own steps in detail. **Status: stack approved (owner, 2026-10-30): Expo / React Native, built in the cloud.** **Pay Apple last (owner, 2026-10-30):** the app is built and reviewed for free in Expo Go, and the $99 Apple Developer fee is paid only when the app is ready for TestFlight (section 1, "Paying Apple only at the end"). Bundle ID **`com.turboterp.app` confirmed** (owner, 2026-10-30). Still waiting on the owner: the Expo account (O3), Expo Go (O4), then "set up the sessions". **Review-risk pass (2026-10-30):** section 8 lists everything that could get the app rejected, crash in real use or open a security hole. Its fixes are also written into the task rows below. Runs as 5 owner-coordinated sessions with up to 3 subagents each (owner, 2026-10-29; section 2). This moves iOS up from the roadmap's "Spring 2028" (roadmap.md).

## 1. Approach (recommended)

**A native React Native app built with Expo (`apps/mobile`), sharing the TypeScript packages with the web app.**

- **Why Expo:**
  - The owner is on Windows with no Mac. EAS Build compiles iOS apps in the cloud and EAS Submit uploads them to App Store Connect, so neither Xcode nor a Mac is ever needed.
  - Native screens meet the "Apple-style quality" ruling, which a wrapped website can't.
  - The framework-free packages (`audit`, `plan`, `credit`, `tracks`, `course-data`, `programs`, `ratings`, parts of `campus-data`) were written to be reused.
  - It closes the open to-do "Confirm Expo's native-component support".
- **Rejected: a Capacitor wrapper around turboterp.com.**
  - It's faster to ship, but App Review often rejects a near-wrapper under guideline 4.2 (minimum functionality).
  - It still needs a cloud Mac to build (Codemagic or similar).
  - It gives the Home Screen web app's feel, not a native one.
  - Keep it only as a fallback if the spike (S0) finds the shared code can't run natively at all.
- **The web app stays.** Both apps use the same packages and the same backend (Vercel API + Supabase).

### What doesn't port directly (the spike decides how each is handled)
| Piece | Problem | Plan |
|---|---|---|
| Audit (`highs` WASM solver) | React Native's JS engine (Hermes) only recently got WebAssembly (reported for RN 0.84, Feb 2026; unverified against official docs) | S0 tests it. **If it works:** the audit runs in-app like on the web. **If not:** an "engine bridge", a hidden WebView that runs the bundled audit and answers via `postMessage`. Running the audit on the server is the last resort: it breaks the scale ruling (heavy work runs on the client). |
| Transcript import (`pdfjs-dist`, `tesseract.js`) | WASM and web workers | Engine bridge in v1. Later: iOS PDFKit + Apple Vision OCR (better OCR, smaller app). |
| Plan export (`jspdf`, `exceljs`) | `exceljs` needs Node streams | Generated in the engine bridge, handed to the iOS share sheet (`expo-sharing`). |
| `localStorage` (10 files) | Not available in React Native | A storage adapter over `expo-sqlite/kv-store` (it runs in Expo Go; MMKV doesn't), so shared code doesn't care where data lives. |
| Seat Alerts (web push) | iOS apps use APNs | Expo push service, sent by the cron next to web push. Watches belong to the device and need no sign-in, the same as on the web (`alert_devices`, migration 0010). The app's device row holds an Expo push token in place of a web-push endpoint (migration 0011). |
| Sign-in | Magic-link redirects, OAuth redirect | Accounts stay **optional** (rulings.md "Sync conflicts, simplified"): every tab works signed out, and signing in only syncs. Email **code** (already built) + Google via in-app browser with PKCE to `turboterp://auth/callback` + **Sign in with Apple** (needed under guideline 4.8 because Google is offered). Deleting an account also revokes its Apple tokens (section 8, R-3). |
| Server-rendered data (pages reading snapshots) | The app needs JSON endpoints | `/api/v1/...` JSON routes over the same CDN-cached snapshots. |
| Monitoring (Vercel Web Analytics, Sentry) | Vercel Web Analytics only runs in web pages; `@sentry/nextjs` is web-only | **No usage analytics in the app** (2026-10-30): visit counts stay a website-only figure, and the app's privacy label leaves out "usage data". **Sentry in the app** through `@sentry/react-native` (Expo config plugin): off until `EXPO_PUBLIC_SENTRY_DSN` is set, no tracing or replay, same scrubbing as the web (`scrubEvent` moves into `app-core`). |
| Node-only package code (`cheerio` scrapers, `@napi-rs/canvas` in `catalog`) | Can't run on a phone | Never imported by the app. S0 checks the import graph; a lint rule in `apps/mobile` blocks it. |

### How agents verify work without a Mac
- **Logic:** Vitest, as now. Shared code keeps its tests.
- **Layout screenshots:** the app also runs as an Expo **web** export, so the existing `ui-check` script can screenshot it (close, not exact).
- **Real-device check (owner):** until Apple is paid, the owner reviews in **Expo Go** (free, from the App Store, signed in to the owner's Expo account). Builders publish each change with **EAS Update** to a review branch, and the owner opens its link in Expo Go. After payment, the same links open in a **development build** (O5–O6).
### Paying Apple only at the end (owner, 2026-10-30)
The owner can't spend $99 yet, so everything that doesn't need a paid Apple account comes first.
- **Free until about day 5:** all code, Expo web screenshots, and real-iPhone reviews in Expo Go. Expo Go only opens projects from the owner's own Expo account, so it's for testing only; students keep using the Home Screen web app (turboterp.com) until the App Store release.
- **Expo Go limits:** only modules bundled in Expo Go work there. App code sticks to them (`expo-sqlite/kv-store` for storage, `expo-secure-store`, `expo-notifications`, `expo-web-browser`). Sign in with Apple, native Seat Alerts push and the privacy manifest can't be checked in Expo Go: they're built behind feature checks, tested on the web export and in unit tests, then checked on a real device in **N1** after payment.
- **Pay at about day 4–5** (O2), when the screens are approved. Apple's approval takes hours to a few days, so this adds about 1–3 days to the timeline.
- **Funding:** donations may cover running costs (rulings.md "Running costs"). The Donate page says only that; the owner removed the line naming the Apple fee (2026-10-30).
- **Cloud build budget:** the Expo free plan allows about **15 iOS builds a month** (lowered in 2026; check expo.dev/pricing). Budget: about 3 dev-client builds and 6–8 TestFlight builds for the first release. Only the main session starts builds.

## 2. Sessions and subagents

The owner runs several Claude Code sessions at once and coordinates them (owner, 2026-10-29). Each session is the main session for one lane: it dispatches its own builder subagents, reviews them and merges its lane.

**Recommended: 5 sessions, at most 3 subagents each.** They don't all start together. 3 sessions open on day 0, and the other 2 open on about day 2, when the shell they build on is merged.

| # | Session | Owns (only this session edits these) | Tasks | Model | Opens | Subagents at peak |
|---|---|---|---|---|---|---|
| 1 | **Lead** | `apps/mobile` frame: `app.json`, `eas.json`, root layout, tab bar, `components/ui`, Today, Campus screens. Project docs (PROJECT_MEMORY.md, status log, rulings, owner-review). All EAS builds and the release. | S0, S1, B1, B2, B3a, B3b, R1, R2, R3, H2 | Opus (spike decision, builds, release) | day 0 | 3 (B2, B3a, B3b) |
| 2 | **Core** | `packages/app-core` (new), the `apps/web/lib` files it replaces, the engine bridge (`apps/mobile/engine/`) | A1a, A1b, A5 | Sonnet | day 0 | 3 (day 1) |
| 3 | **Backend** | `apps/web/app/api/**`, `supabase/migrations/**`, privacy/terms text, `apps/mobile/lib/auth/**`, account screens | A2, A4s, A3, H1 | Sonnet | day 0 | 2 |
| 4 | **Schedule** | `apps/mobile/app/(tabs)/schedule/**`, the Seat Alerts screen | B4a1, B4a2, B4b1, B4b2, B5 | Sonnet | about day 2 (B1 merged) | 2 |
| 5 | **Advisor** | `apps/mobile/app/(tabs)/advisor/**` | B6a, B6b, B7a, B7b, B8 | Opus (audit semantics) | about day 2 (B1 and A1a merged) | 3 |

**Why 5 sessions:**
- Each session owns one area of files, so sessions rarely touch the same file, and each reviews only its own lane.
- **4 would be slower:** merging Schedule and Advisor (the two longest screen chains) into one session needs 5 subagents at once, and that session's reviews become the bottleneck. That costs about 1.5 days.
- **6 or more saves nothing:** Lead is free after B1, and Backend is idle after A3. Another session would only add your coordination time, about 45k+ tokens to start it, and more merge clashes on `feat/ios`.

**Why at most 3 subagents per session:**
- 3 is the most any lane can use at once (Core on day 1, Lead on day 2, Advisor on day 3). A 4th would wait.
- 3 is also about as many diffs as one session can review without slowing its own lane.

**Peak load:** about 9 builders and 5 sessions running at once (days 2–3). That's where a usage limit is most likely to hit (section 4, "Cost").

## 3. Tasks

Every task is one builder subagent (Sonnet), test-first, in its own worktree and branch (`ios/<task>`), dispatched and reviewed by the owning session. Rough size is in builder-days. **UI** means a major UI change that needs owner approval on the iPhone.

**Splits for speed:** the extraction (A1a/A1b) and the data API (A2) no longer wait for the spike. They're web-side work and are useful whatever S0 finds. The Schedule, Campus and Advisor screens are split into one-day pieces so a session can run them side by side.

| ID | Session | Task | Depends on | Size |
|---|---|---|---|---|
| **S0** | Lead | **Spike: run the shared code on iOS.** Expo app in `apps/mobile`, npm workspace, Metro resolving the raw-`.ts` ESM packages. Test cases: (a) `highs` + one real audit on Hermes; (b) the same audit through a WebView bridge; (c) `pdfjs` text extraction in the bridge. Also: an import-graph check for Node-only modules. Result in `docs/project/ios-spike.md`; decision recorded in rulings.md. | none | 1 |
| **S1** | Lead | **Scaffold** (keeps S0's working setup): `app.json` (bundle ID `com.turboterp.app`, scheme `turboterp`, `ITSAppUsesNonExemptEncryption: false`, iPhone only), `eas.json` profiles (development / preview / production), expo-router, Expo web export wired to `ui-check`, Vitest, lint (incl. the Node-only import ban). Sentry: `@sentry/react-native` with its config plugin, no-op unless `EXPO_PUBLIC_SENTRY_DSN` is set, `tracesSampleRate: 0`, no replay, `beforeSend` = the web's `scrubEvent` (moved from `apps/web/lib/sentry-scrub` into `app-core`, web still green). Source-map upload only if a `SENTRY_AUTH_TOKEN` EAS secret exists. **Review readiness (section 8):**<br>- EAS build image with Xcode 26 and the iOS 26 SDK (required for uploads since 2026-04-28).<br>- An app privacy manifest (`ios.privacyManifests` in `app.json`) with a required-reason entry for every SDK used (`expo-sqlite`, Sentry, Expo modules), matching the privacy label.<br>- A purpose string for every permission any screen asks for (camera, notifications). None for location unless a screen uses it.<br>- No `NSAllowsArbitraryLoads`.<br>- `expo-dev-client` only in the development profile.<br>- The EAS Update production channel is for fixes only (guideline 2.5.2). | S0 | 0.5 |
| **B1** | Lead | **App shell and design system:** port `lib/theme.ts` tokens and `components/ui.tsx` primitives to React Native. Accent `#BA0C2F`, light and dark mode, Dynamic Type, VoiceOver labels, haptics, skeleton loading. Tab bar (Campus · Schedule · Seat Alerts · Advisor; PROJECT_MEMORY section 8), Today home from the logo. Every screen has a loading state, an offline state and an error state, never a blank screen. A root error boundary reports to Sentry and offers Retry. "Not affiliated with the University of Maryland" on About. The app has no Donate link (section 8, R-4; owner, 2026-10-30). Layouts must not assume a notch or a fixed width, because Apple tests iPhone apps on iPad (R-15). **Creates an empty route file for every screen** so other sessions only fill in their own files. **UI** | S1 | 1 |
| **A1a** | Core | **Extract the advisor logic** from `apps/web/lib/advisor` into a new framework-free `packages/app-core` (creates the package): plan-state, analysis, prior credit, transcript parsing. Storage goes behind an adapter interface (web: `localStorage`, mobile: `expo-sqlite/kv-store`). The web app imports from `app-core`; **the web suite must stay green with no behavior change.** | none | 1 |
| **A1b** | Core | **Extract the rest** (merged after A1a): sync engine, schedule logic, seat-alerts client, calendar, consent and legal text, next-class, campus helpers. Splits the 3 files that import `next`. Same green-suite rule. | none (merges after A1a) | 1 |
| **A5** | Core | **Engine bridge** (only if S0 says the audit and/or transcript can't run natively): a bundled WebView page holding the audit, transcript parsing and exports, a typed `postMessage` API, and a warm-start so the first audit is fast. If the audit runs natively, A5 shrinks to transcript + exports. **Section 8 rules:**<br>- Every worker, WASM and OCR language file is bundled in the app, never fetched from a CDN. Tesseract.js and pdfjs fetch from CDNs by default; downloaded code breaks guideline 2.5.2 and fails offline.<br>- The bridge reloads itself after `onContentProcessDidTerminate`, because iOS kills a heavy WebView under memory pressure.<br>- It caps input size (PDF pages, image pixels) and runs every job with a timeout.<br>- The warm-start runs after the first screen renders, never during launch. | S0 | 1–1.5 |
| **A2** | Backend | **JSON data API for the app:** `/api/v1/` routes for everything the web pages read on the server (campus snapshots, dining, libraries, rooms, gyms, calendar, schedule data, ratings), CDN-cached the same way, plus a typed client (moved into `app-core` by Core once it exists). Add the routes to the `robots.ts` disallow list. Responses are versioned and checked by the client: a shape mismatch shows the error state instead of crashing, so an older app version keeps working after a web deploy. | none | 1 |
| **A4s** | Backend | **Native Seat Alerts push, server side:**<br>- Migration `0011_expo_push.sql`: a device in `alert_devices` holds either a web-push subscription or an Expo token, plus its platform. No link to a user, the same as on the web.<br>- The device route accepts an Expo token.<br>- The cron sends through the Expo push API next to web push, with the same cooldown and logging. It deletes tokens that Expo reports as `DeviceNotRegistered`.<br>- **Per-IP rate limit on device registration**, hashed with the existing `hashKey`. The web route has no such limit today.<br>- Tapping an alert opens Drop/Add.<br>- Privacy text updated: push token, iOS app; visit counts come from the website only. | none | 1 |
| **A3** | Backend | **Auth + sync on iOS:**<br>- Supabase client with the session in `expo-secure-store`.<br>- Sign-in is optional and never blocks a feature.<br>- Email code sign-in.<br>- Google through `expo-web-browser` with PKCE to `turboterp://auth/callback`.<br>- Sign in with Apple (`expo-apple-authentication`, native token to Supabase).<br>- Sync engine wired through `app-core`.<br>- Delete account (two-tap confirm). For an Apple account it asks for Sign in with Apple once more. The server exchanges that fresh authorization code for a token, **revokes it** through Apple's REST API (`/auth/revoke`), then deletes the user. No Apple token is ever stored, so no migration is needed.<br>- The Apple button is the native `expo-apple-authentication` button, at least as large and prominent as Google's.<br>- Sign-in errors (expired code, email limit reached, cancelled Apple sheet) show plain-language messages.<br>**UI** (sign-in and account screens) | A1b, S1, owner O7 | 1.5 |
| **B2** | Lead | **Today** (next-class hero with "leave by", dining tiles, academic dates). **UI** | B1, A2 | 1 |
| **B3a** | Lead | **Dining** (halls, menus, Find a food). **UI** | B1, A2 | 1 |
| **B3b** | Lead | **Libraries and Fitness** (hours, study-room grid with LibCal deep links, gyms, RecWell classes). **UI** | B1, A2 | 1 |
| **B4a1** | Schedule | **Course search and sort.** **UI** | B1, A2 | 1 |
| **B4a2** | Schedule | **Course and professor info** (ratings, grade data, reviews). **UI** | B1, A2 | 1 |
| **B4b1** | Schedule | **Builder grid:** sections panel, schedules A/B/C, overlap blocking. **UI** | B4a1, A1b | 1 |
| **B4b2** | Schedule | **Calendar export and plan sync:** Add to calendar (Apple Calendar or Google, as on the web) and sync with the 4-year plan. **UI** | B4a1, A1b | 1 |
| **B5** | Schedule | **Seat Alerts tab**, no sign-in: watch list, bells in the section panel, "I got it". It asks for notification permission only when the student turns alerts on. If permission is denied, it shows a link to Settings. **UI** | B4b1, A4s | 0.5 |
| **B6a** | Advisor | **Clickwrap and setup** (programs, year, tracks), with a stub signed-in user until A3 merges. **UI** | A1a, B1 | 1 |
| **B6b** | Advisor | **4-year plan grid** with checks and warnings. **UI** | A1a, B1 | 1 |
| **B7a** | Advisor | **Audit and Explore** (what-if). Wires in the optional sign-in and sync from A3; there's no sign-in gate (rulings.md "Sync conflicts, simplified"). Tested for time and memory with the largest real plans (double degree + minors) on an older iPhone. **UI** | B6b, A5, A3 | 1.5 |
| **B7b** | Advisor | **Prior credit (AP/IB), course sheet, credit caps, tracks.** **UI** | B6a, B6b | 1.5 |
| **B8** | Advisor | **Transcript import + exports:** file picker / share-to-app for the PDF, paste and photo (OCR) paths, plan PDF/Excel export, "Email my plan". Photo OCR picks images through the system photo picker, which needs no photo-library permission. The camera path has a purpose string. A transcript leaves the device only when the student exports it. **UI** | B6b, A5 | 1 |
| **R1** | Lead | **Store package:** App Store text (name, subtitle, description with "Not affiliated with the University of Maryland", keywords with no other brand names: no UMD, Testudo, PlanetTerp, Coursicle or Jupiterp; guideline 2.3.7), age-rating answers, privacy-label answers, review notes, 1320×2868 screenshots composed from the owner's iPhone shots, app icon (1024 px, from `app/icon.svg`, no transparency), all in `docs/project/app-store-listing.md`. | none (screenshots after approval) | 0.5 |
| **H1** | Backend | **Security hardening before submission** (section 8, R-10 to R-13). Web-only, so it doesn't need the iOS go. **Do it before "set up the sessions"**, because it changes `package-lock.json` and `next.config`, which no lane owns. A web session had started the headers, the device rate limit and the dependency updates in the main checkout on 2026-10-30; finish or merge that work, then confirm the rest:<br>- Update `next` (critical advisories on 16.3.6), `jspdf` (it pulls in a vulnerable `dompurify`), `sharp`, `cheerio`'s `undici` and `exceljs`'s `uuid`.<br>- Add security headers in `next.config`: HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`.<br>- Add per-IP limits to the write routes that need no sign-in (device registration, report).<br>- Confirm every table has RLS and no write path for the anon key.<br>- The web suite stays green. | none | 0.5 |
| **H2** | Lead | **Real-world crash pass on TestFlight** (section 8, "Crashes in real use"). Cases:<br>- airplane mode and a slow network on every tab<br>- first launch with no cache<br>- signed out everywhere<br>- notifications denied<br>- the largest Dynamic Type size, and dark mode<br>- the biggest audit, and a 20-page transcript PDF<br>- the app killed and reopened mid-sync<br>- an older iPhone, if one is available<br>Sentry must show no crashes before submitting. | R2's first build | 0.5 |
| **N1** | Lead | **Native check after payment** (O5–O6 done): on the development build, check Sign in with Apple end to end (including the revoke on delete), native Seat Alerts push, storage, Sentry and every permission prompt. Fixes go to the owning sessions. | O6 | 0.5 |
| **R2** | Lead | TestFlight build → owner tests 3–7 days → fix list (sent to the owning sessions, or handled by Lead if they've closed) → release build → submit. | everything above | — |
| **R3** | Lead | Widgets (next class, dining) and a Live Activity for Seat Alerts (roadmap phase 6). Swift extension targets through a config plugin; each iteration needs a cloud build. Early start in Lead's free time if the build count allows; otherwise v1.1. | S1 | 1–2 |

## 4. Timeline

Days count from the owner's go. Each task starts as soon as its dependencies are merged into `feat/ios`. Estimates assume overtime mode in every session and owner UI approval within about a day. Apple's review usually takes 1–3 days per submission.

| Days | 1 Lead | 2 Core | 3 Backend | 4 Schedule | 5 Advisor | Owner |
|---|---|---|---|---|---|---|
| **0–1** | S0 spike; R1 text | A1a, A1b | A2, A4s, H1 | not open yet | not open yet | O1, O3, O4; open sessions 1–3 (section 5) |
| **1–2** | S1 → B1 | A5 (to about 2.5) | A3 (to about 3) | not open yet | not open yet | O8 migration 0011; O7 steps 1, 3, 7 (Supabase) |
| **2–3.5** | B2, B3a, B3b | A5 done; fixes to `app-core` on request; then closes | A3 done; then closes | B4a1, B4a2 | B6a, B6b | open sessions 4–5; approve B1, A3 sign-in in Expo Go |
| **3.5–5** | R3 widgets (optional); fixes | | | B4b1, B4b2 → B5 (to about 5) | B7a, B7b, B8 (to about 5) | approve 3–4 screens a day; **O2 pay and enroll at about day 4** |
| **5–7** | O5 dev build when Apple approves, N1; merge to `feat/ui-rework`, first TestFlight build, H2 | | | fixes, then closes | fixes, then closes | O9 store setup |
| **6–12** | fixes from testing | | | | | **O10 TestFlight testing (3–7 days)** |
| **about 10–14** | submit, release | | | | | O11 submit → Apple review → O12 release |

**First App Store release: about 2.5–3 weeks after the go** (paying Apple last adds about 1–3 days of waiting for approval).
- Compared with one session and 6 builders: building takes about 5 days instead of about 7, and the release lands about half a week sooner.
- **Critical path:** S0 → S1 → B1 → B6b → B7a, with the Schedule chain B4a1 → B4b1 → B5 about the same length.
- **What holds things up:**
  - **Apple enrollment:** paid at about day 4 and needed by about day 5 for the dev build, N1 and TestFlight. Until then, reviews use Expo Go and web screenshots, so building doesn't stop.
  - **Your reviews:** about 15 screens arrive over days 2–6.
  - **Your testing time on TestFlight.**

**Cost:** about 27 builders at under 100k Sonnet tokens each, plus the 5 sessions' own context (two on Opus). That's roughly 3M tokens, most of it in days 1–4. This is the most usage-heavy way to run the plan, and a usage limit stops every session at once. If one hits:
- Resume Advisor, Schedule and Lead's S1/B1 work first.
- Lead's Campus subagents and R3 have the most slack and can wait.

**If S0 fails badly** (the shared code can't run in Expo even through a WebView): Lead tells the owner. Hold off opening sessions 4 and 5, and come back with the Capacitor fallback and its 4.2 risk. Core's and Backend's work is still useful for the web app.

## 5. Running the sessions (owner)

### How the sessions coordinate (built into each kickoff file)
- **Integration branch `feat/ios`** (cut from `feat/ui-rework`). Each session has its own worktree folder and lane branch.
  - A session merges its reviewed subagent branches into its lane branch, then into `feat/ios`: fetch, merge in `origin/feat/ios`, run the full suite (test, typecheck, lint, build), push.
  - If the push is refused because another session pushed first, it repeats those steps.
  - Only Lead merges `feat/ios` into `feat/ui-rework`.
- **The board, `docs/project/ios-board.md` on `feat/ios`.** One section per session: doing now, merged, blocked on, **NEEDS OWNER**, requests for other sessions.
  - Each session updates its section when it merges, and reads the board (after `git fetch`) before starting each task.
  - Sessions see each other's progress there, so you don't have to relay it.
- **File ownership** follows the table in section 2. A session that needs a change in another session's files writes a request under that session on the board. It doesn't edit those files itself.
- **Only Lead** edits PROJECT_MEMORY.md, the status log, owner-review.md and rulings.md, and only Lead starts EAS builds and counts them against the monthly quota. Other sessions publish EAS Updates for your reviews, each to its own branch (`review/<session>`).
- **Overtime mode is on in every session**, so they dispatch subagents without asking. UI approvals happen after the fact, on your iPhone.
- **Progress reports:** ask **Lead** for "progress report". It reads the board and git log and reports on all five sessions, including anything waiting on you. Saying "progress report" in another session ends that session's overtime mode (PROJECT_MEMORY section 16).

### Your steps
1. **Day 0, in this session:** finish O1 (section 6), then say "set up the sessions".
   - This session creates `feat/ios`, the board, five worktrees (`.claude/worktrees/ios-lead`, `ios-core`, `ios-backend`, `ios-schedule`, `ios-advisor`) and one kickoff file per session in `docs/project/ios-sessions/` (goal, owned files, task briefs, the rules above).
   - It pushes everything and tells you when it's ready, in about 15 minutes. Then close this session (`/exit`): Lead starts fresh in its own worktree.
2. **Day 0, open Lead, Core and Backend.** For each one:
   1. In Windows Terminal, open a new tab (`Ctrl+Shift+T`). Right-click the tab → **Rename tab** → `Lead` (or `Core`, `Backend`).
   2. Go to its folder, e.g. `cd "$HOME\Code\SuperTerp\.claude\worktrees\ios-core"`.
   3. Run `claude`.
   4. Set the model from the section 2 table: `/model opus` for Lead and Advisor, `/model sonnet` for the others.
   5. Paste: `Read docs/project/ios-sessions/core.md and follow it. Overtime mode is on.` (use that session's file name).
   - **Never open two sessions in the same folder.**
3. **About day 2: open Schedule and Advisor.** Do this when Lead's board section says "B1 merged: open Schedule and Advisor". Same steps, folders `ios-schedule` and `ios-advisor`.
4. **While they run:**
   - Check the tabs 2–3 times a day, or ask Lead for a progress report.
   - A session that needs you writes **NEEDS OWNER** on the board and says so in its tab.
   - Approve screens from the iPhone links (O6). Reply in the tab of the session that built the screen: "approved" or the changes you want.
5. **When a session's board section says "lane done",** type `/exit` in that tab. Lead removes its worktree later. Core and Backend should finish around day 3, Schedule and Advisor around day 6.
6. **If a usage limit stops work:** every session pauses mid-task with its work pushed. When the limit resets, type `continue` in each tab, in the order from section 4 "Cost".

## 6. Owner steps: accounts, builds and the store

Claude can't do these: they need the owner's identity, money, Apple 2FA or devices. Do each one when its row in the timeline comes up. Commands starting with `!` are typed into the Claude Code prompt so the output lands in the session.

### O1. Say yes to the plan (day 0, 5 minutes)
1. Confirm **Expo, native app** (section 1), or ask for the Capacitor fallback.
2. Say "set up the sessions" (section 5, step 1).
3. ~~Confirm the bundle ID~~ Done: **`com.turboterp.app`** (owner, 2026-10-30). It can never change after the first upload.

### O2. Enroll in the Apple Developer Program (about day 4, when the screens are approved; approval takes hours to a few days)
1. On your iPhone, install **Apple Developer** from the App Store. Enrolling in the app is the fastest path for individuals.
2. Sign in with the Apple Account you want to own the app. Two-factor authentication must be on (Settings → your name → Sign-In & Security).
3. Tap **Account → Enroll Now**. Choose **Individual / Sole Proprietor**. Organization enrollment needs a legal entity and a D-U-N-S number, and there's no LLC (PROJECT_MEMORY section 2).
4. Enter your **legal name** exactly as on your ID. **The App Store shows this name as the seller** under the app. That's unavoidable for an individual account; note it alongside the plan to scrub your name from git history.
5. Pay **$99/year**. It's a running cost, so donations can cover it (rulings.md "Running costs").
6. Wait for the "Welcome to the Apple Developer Program" email. Tell Claude when it arrives.

### O3. Create an Expo account (day 0, 5 minutes)
1. Sign up at **expo.dev** (free plan) with the email you use for project accounts.
2. Create an organization or use the personal account; name it `turboterp` if it's free.
3. In this session run `! npx eas-cli login` and sign in.
4. Create a token for Claude's builds: expo.dev → Account settings → **Access tokens** → Create, name it "claude-builds". Paste it into `apps/mobile/.env.local` as `EXPO_TOKEN=...`. That file is gitignored; never paste the token into chat or a tracked file.

### O4. Get your iPhone ready (day 0, 5 minutes)
1. Update to the latest iOS.
2. Install **Expo Go** from the App Store and sign in with your Expo account (O3).
3. **For every review until O6:** Claude sends a link or QR code for an EAS Update ("review/B3", etc.). Open it with your iPhone's camera, and it opens in Expo Go. Reply "approved" or with the changes you want. Sign in with Apple and native push don't work in Expo Go; they're checked in N1.

### O5. First development build (when O2 is approved, about day 5; about 30 minutes plus the build queue). Until then, reviews use Expo Go (O4).
1. Register your iPhone: run `! npx eas-cli device:create` in `apps/mobile`, choose **Website**, and open the link or QR code **on your iPhone in Safari**. Install the profile: Settings → General → VPN & Device Management → the downloaded profile → Install.
2. Start the build: `! npx eas-cli build --profile development --platform ios` in `apps/mobile`. When it asks:
   - "Log in to your Apple account?" → **Yes**, sign in, approve the 2FA prompt.
   - "Generate a new Apple Distribution Certificate?" → **Yes**.
   - "Generate a new Apple Provisioning Profile?" → **Yes**.
   - "Set up Push Notifications?" / "Generate a new Apple Push Notifications service key?" → **Yes**. EAS keeps the key; the Expo push service uses it for Seat Alerts.
   - EAS also registers the bundle ID with the Push Notifications and Sign in with Apple capabilities from `app.json`.
3. Free builds wait in a low-priority queue (sometimes more than an hour). You can close the terminal; the build continues on Expo's servers.

### O6. Install the development build (when O5 finishes)
1. Open the build page on expo.dev on your iPhone (or scan the QR code) and tap **Install**.
2. iOS asks you to turn on **Developer Mode**: Settings → Privacy & Security → Developer Mode → On → restart → confirm.
3. Open TurboTerp. It shows the Expo development menu.
4. **For every review from now on:** the same EAS Update links now open in the dev build instead of Expo Go. Lead runs N1 on it. Reply "approved" or with changes. No rebuild is needed.

### O7. Supabase and Apple settings for the app (steps 1, 3 and 7 when A3 starts; steps 2, 5 and 6 need the paid Apple account, so do them right after O2 is approved)
1. Supabase → **Authentication → URL Configuration → Redirect URLs** → add `turboterp://auth/callback` → Save.
2. Supabase → **Authentication → Providers → Apple** → Enable. In **Client IDs**, enter `com.turboterp.app`. Leave the secret key empty: the native iOS sign-in doesn't use it. Save.
3. Supabase → **Authentication → Emails → Magic Link**: if not done yet, add the `{{ .Token }}` code line (owner-review.md, 2026-10-29). The app signs in by code only.
4. Google sign-in needs nothing new: the app uses the same web OAuth client through the in-app browser.
5. **Sign in with Apple key, to revoke tokens when an account is deleted** (required; section 8, R-3):
   1. developer.apple.com → Certificates, IDs & Profiles → **Keys → +**.
   2. Name it "SIWA revoke", tick **Sign in with Apple**, configure it for `com.turboterp.app`, then **Register**.
   3. Download the `.p8` file (you can download it only once).
   4. In Vercel Production, set `APPLE_SIWA_KEY_ID` (the Key ID), `APPLE_TEAM_ID` (your Team ID) and `APPLE_SIWA_PRIVATE_KEY` (the key text). Never paste these into chat or the repo.
6. **Email to Hide My Email users:** developer.apple.com → Certificates, IDs & Profiles → **Services → Sign in with Apple for Email Communication**. Add `turboterp.com` and the address the sign-in and plan emails are sent from. Without this, email to `@privaterelay.appleid.com` addresses is dropped.
7. **Turn on custom SMTP** (Supabase → Authentication → SMTP, with the Brevo login; already an open item). Supabase's built-in mailer sends only a few emails an hour, so sign-in codes would stop on the first busy day, possibly while Apple is reviewing the app.

### O8. Push tokens migration (when A4s is merged, about day 1)
1. Supabase → **SQL Editor** → paste `supabase/migrations/0011_expo_push.sql` → Run, the same way as 0010.
2. Optional but recommended: expo.dev → project → **Settings → Push security** → turn on "Enhanced security", create a token, set it in Vercel Production as `EXPO_ACCESS_TOKEN`, then deploy.
3. Deploy the web app (`npx vercel deploy --prod` from the main checkout, as usual) so the cron starts sending iOS pushes.

### O9. App Store Connect setup (about day 5, about 45 minutes)
1. **appstoreconnect.apple.com → Apps → + → New App:**
   - Platform **iOS**. Name **TurboTerp** (this claims the name: open to-do in PROJECT_MEMORY section 10). Primary language **English (U.S.)**.
   - Bundle ID **com.turboterp.app** (it appears after O5). SKU `turboterp-ios`. User access **Full Access**.
2. **API key so Claude can upload builds:** Users and Access → **Integrations → App Store Connect API** → Team Keys → **+**. Name "EAS", access **App Manager** → Generate. Download the `.p8` file (one download only). Note the **Key ID** and **Issuer ID**. Run `! npx eas-cli credentials` → iOS → production → App Store Connect API Key → add it with those values. Then delete the `.p8` from Downloads, or keep it in your password manager.
3. **App Information:** Category **Education**, secondary **Productivity**. Content Rights: answer that the app shows third-party content (UMD public data, PlanetTerp), and you have the right to use it where it's public and non-commercial (Claude drafts the wording in R1).
4. **Age Rating:** answer the current questionnaire (Apple updated it in 2026; R1 drafts every answer). v1 has no user-generated content, chat, social features or AI chatbot, so the expected rating is 4+. The answers change if the LLM advisor ships later.
5. **Pricing and Availability:** Free, **United States only** (owner, 2026-10-30). The EU requires either a public trader address and phone number (Digital Services Act) or a non-trader declaration, and the app is only useful at UMD. If App Store Connect asks about trader status, answer **not a trader**: the app earns no income.
6. **App Privacy:** Privacy Policy URL `https://turboterp.com/privacy`. Fill the data-collection labels from the table Claude prepares in R1: email address, name (typed agreement name), user content (plans, courses), identifiers (push token), diagnostics (crash data, only if Sentry's DSN is set for the app). No usage data: the app has no analytics. For each: linked to the user or not, not used for tracking.
7. **Support URL** `https://turboterp.com/support`, **Marketing URL** `https://turboterp.com`.

### O10. TestFlight testing (about days 6–12, 3–7 days of normal use)
1. App Store Connect → your app → **TestFlight → Internal Testing → +** → create group "Owner", add yourself (your Apple Account email).
2. Claude starts the production build and uploads it (`eas build --profile production` + `eas submit`). It appears in TestFlight after Apple processes it (10–30 minutes). Internal testing needs no Apple review.
3. Install the **TestFlight** app on your iPhone, accept the invite, install TurboTerp.
4. Use it as your daily app for 3–7 days: schedule, dining, your real Advisor plan, a Seat Alert. Note anything wrong (screenshot + one line) and send it to Claude in one batch.
5. Optional: add up to 100 friends as **External Testers**. That needs a short beta review by Apple (about a day).

### O11. Screenshots and submission (about days 10–13, about 1 hour)
1. On your iPhone, take 4–6 screenshots Claude lists in R1 (Today, Schedule builder, Audit, 4-year plan, Dining, Seat Alerts). Use a test plan, not your real grades. AirDrop or upload them, and Claude composes the 1320×2868 store images.
2. In App Store Connect → the version page: upload the screenshots, paste the text from `docs/project/app-store-listing.md`, and pick the build Claude uploaded.
3. **App Review Information:** your contact details. Leave **Sign-in required** off: every feature works without an account. In Notes, paste Claude's review notes, which say:
   - All four tabs work signed out. Signing in is optional and only syncs plans between devices; Sign in with Apple creates an account instantly.
   - Account deletion is under Account → Delete account.
   - The Advisor's agreement is a typed-name clickwrap.
   - Seat Alerts needs notifications allowed, and works best on a class that is full.
   - The app isn't affiliated with UMD and shows only public data (PlanetTerp ratings with permission; section 8, R-6).

   If Apple still asks for a demo account, make one with an email you control, give the reviewer the steps to get a code, and reply in Resolution Center the same day.
4. **Version Release:** choose **Manually release this version**.
5. Tap **Add for Review → Submit**. Review usually takes 1–3 days. If Apple rejects it, paste the full message to Claude. Most rejections are fixed in the metadata or in one small build.

### O12. Release (when approved)
1. Tap **Release This Version**. It shows up on the App Store within hours.
2. Tell Claude. Claude adds the App Store badge and a Smart App Banner to turboterp.com (a small web change you deploy), and records the release in PROJECT_MEMORY.

## 7. Rules for this project (beyond PROJECT_MEMORY section 18)
- Only Lead starts EAS builds and keeps a count against the monthly quota (status log). Other sessions and all builders use the Expo web export, tests and EAS Update only.
- App Store submission and release happen only on the owner's go, the same as `--prod` deploys.
- `apps/mobile` must never import Node-only modules (`cheerio`, `@napi-rs/canvas`, server routes). The lint rule enforces it.
- Any change to shared packages runs **both** test suites (web + mobile) before merge.
- Secrets (`EXPO_TOKEN`, App Store Connect key) live only in gitignored `.env.local` files and on EAS/Vercel.
- The web app is still deployed only from the main checkout (PROJECT_MEMORY section 14), never from an iOS worktree.
- Never put a secret in an `EXPO_PUBLIC_` variable. Those ship inside the app, where anyone can read them.
- Nothing ships to App Review with placeholder text, "coming soon" tiles or dead buttons (section 8, R-AI).

## 8. App Review, crash and security risks (review pass 2026-10-30)

These were checked against Apple's App Review Guidelines (fetched 2026-10-30), Apple's SDK requirements page, the current code and `npm audit`. Each fix is in the task named in the "Fix in" column, so it gets built. Items marked **owner** need the owner's yes.

### Rejection risks
| # | Risk | Guideline | Fix | Fix in |
|---|---|---|---|---|
| R-1 | **Login with no demo account.** The old plan set "Sign-in required" and had a sign-in gate on the Advisor. A reviewer can't receive an email code. Apple also rejects apps that force an account for features that don't need one. | 2.1(a), 5.1.1(v) | Accounts stay optional, as on the web (rulings.md "Sync conflicts, simplified"). Every tab works signed out, "Sign-in required" stays off, and the review notes explain this. Sign in with Apple lets the reviewer try sync instantly. | A3, B7a, O11 |
| R-2 | Google sign-in without Sign in with Apple. | 4.8 | Sign in with Apple is in A3 already. | A3 |
| R-3 | **Deleting an account without revoking its Apple tokens.** Apple requires a revoke call to its REST API when an account that used Sign in with Apple is deleted. That call needs a signing key, so O7's old "leave the secret key empty" was not enough. | 5.1.1(v) | The delete route revokes, then deletes. The owner creates the key (O7 step 5). | A3, O7 |
| R-4 | **Donate links to a personal Venmo.** Outside the US storefront, tips to the developer must use In-App Purchase. On the **US storefront**, the guidelines (checked 2026-10-30) allow buttons and external links to other ways of paying (3.1.1(a), 3.1.3). TurboTerp isn't an approved nonprofit, so the charity exception (3.2.2(iv)) doesn't apply, and reviewers still look hard at donation links. **Decided (owner, 2026-10-30): no Donate in the app.** | 3.1.1(a), 3.1.3, 3.2.2(iv) | Donate is left out of the iOS app. The website keeps it. | B1 (About), R1 |
| R-5 | A "repackaged website". | 4.2 | Native screens (section 1). Seat Alerts push, offline cached data and the share sheet are app-only value. The Capacitor fallback carries this risk, so it stays a fallback. | whole plan |
| R-6 | **Third-party content without proof of permission.** Apple can ask for authorization for PlanetTerp ratings, UMD dining and course data, and LibCal links. | 5.2.2, 5.2.1 | The app shows only aggregates: star counts and a link out. `reviewsView` shows no review text today, so no user-generated content rules apply (1.2). Keep it that way. No permission email is needed (owner, 2026-10-30): PlanetTerp is open source (AGPL-3.0) with a public developer API. The app credits PlanetTerp and links to it; if Apple asks, answer with the API docs and the repo (rulings.md "iOS App Store decisions"). UMD data is public; never show UMD or Testudo marks. No Reddit text in v1. | R1 |
| R-7 | Metadata that names other brands, or screenshots that don't match the app. | 2.3.7, 2.3.3 | No UMD, Testudo, PlanetTerp, Coursicle or Jupiterp in keywords. Screenshots come from the real build. The review notes match the four real tabs (Calendar is gone). | R1, O11 |
| R-8 | **Build requirements.** Uploads since 2026-04-28 must be built with Xcode 26 and the iOS 26 SDK. Apple also checks the privacy manifest and required-reason APIs against the privacy label. | SDK requirements, 5.1.1 | Pin an EAS image that has Xcode 26. Write a privacy manifest for the app and its SDKs (`expo-sqlite`, Sentry, Expo modules). The privacy label (O9) lists exactly what the manifest and privacy text say. | S1, R1, O9 |
| R-9 | **Downloaded or changed code.** tesseract.js and pdfjs fetch workers, WASM and language data from a CDN by default. EAS Update can also ship features without review. | 2.5.2 | Bundle every engine file. Use the EAS Update production channel only for fixes. | A5, S1 |
| R-AI | **"AI code flags".** App Review doesn't detect or reject code because AI wrote it. What it rejects is the usual symptoms: placeholder or unfinished screens (2.1), template-like apps (4.3), broken links, and features in the notes that aren't in the build. The **future LLM advisor** is the one AI rule that applies. Before sending grades or a transcript to a third-party AI, the app must say so and get explicit permission. Then the age-rating answers change, and if it chats, 1.2 report and block tools may apply. | 2.1, 4.3, 5.1.2(i) | No placeholder text, "coming soon" tiles or dead buttons in the release build. H2 checks every screen. The LLM advisor is not in v1, and when it comes it gets its own consent screen. | H2, roadmap |
| R-15 | **iPhone app running on iPad.** Reviewers often test iPhone-only apps on an iPad in compatibility mode and reject crashes or broken layouts there. | 2.4.1, 2.1 | No layout assumes a notch, a fixed width or a home indicator. H2 tests on an iPad if one is available; otherwise it checks the smallest no-notch layout (375×667) in the Expo web export. | B1, H2 |
| R-16 | **Name overlaps UMD's "Terp" marks.** Apple can ask for proof of rights to a name (5.2.1). The owner decided on the name (PROJECT_MEMORY section 2); this row doesn't reopen that. | 5.2.1 | Keep "Not affiliated with the University of Maryland" in the description and on About, and use no UMD logos. If Apple objects, the fallback is the backup name "Scute" (section 2). | R1 |
| R-14 | **EU trader status** (Digital Services Act). Selling in the EU needs a public address and phone number, or a non-trader declaration. **Decided (owner, 2026-10-30): US only.** | App Store Connect | Ship to the United States only and declare non-trader. | O9 |

### Crashes and failures in real use
- **Memory.** HiGHS plus a large audit, or OCR on a phone photo, can get the WebView or the app killed on older iPhones. A5 recovers from WebView termination, caps input sizes and uses timeouts. B7a and B8 test the largest cases on device.
- **Launch.** iOS kills apps that hang at launch. The engine warm-start and data fetches run after the first screen, never during launch (A5, B1).
- **Network.** Reviewers test on IPv6-only and flaky networks. All calls use HTTPS hostnames (no IP literals). Every screen has offline and error states, and cached snapshots show with their age (B1, H2).
- **Permission prompts.** A missing purpose string crashes the app. Every permission has one, and nothing asks for permission at launch (S1, B5, B8).
- **Version skew.** A web deploy must not break app versions already installed. `/api/v1` is versioned and the client checks response shapes (A2).
- **Free-tier ceilings on launch day:**
  - Supabase's built-in mailer sends only a few emails an hour, so custom SMTP is required (O7 step 7).
  - Brevo allows 300 emails a day. Sign-in codes and "Email my plan" share that allowance, so the app shows a plain message when the limit is reached (A3).
  - Expo push needs dead tokens removed (A4s).
  - Vercel Hobby and Supabase free tier: read the usage pages the day after release.
- **Hide My Email.** Without the private-relay sender setup, sign-in emails to Apple relay addresses never arrive (O7 step 6).
- **Proof before submitting.** H2's TestFlight pass, plus Sentry showing no crashes.

### Security
| # | Finding (2026-10-30) | Fix | Fix in |
|---|---|---|---|
| R-10 | `npm audit --omit=dev` reports 2 critical and 4 high. The ones that reach production are `next` 16.3.6 (critical; its cache-poisoning advisory is for self-hosted apps only, and the site uses no Draft Mode, but update anyway), `dompurify` through `jspdf` (shipped in plan export), `sharp`, `undici` (through `cheerio`, server-side scrapers) and `uuid` through `exceljs`. `vite` and the dev-server advisories are dev-only and aren't App Store risks. | Update them and run the web suite. | H1 |
| R-11 | `POST /api/seat-alerts/device` creates a device with no sign-in and no rate limit. A script could fill the table or the push queue. Each device's watches are capped. | Per-IP limit, hashed. | H1, A4s |
| R-12 | `next.config` sets no security headers. | HSTS, nosniff, `Referrer-Policy`, `frame-ancestors 'none'`. | H1 |
| R-13 | The Supabase anon key ships inside the app bundle, so RLS is the only guard. RLS is on in every migration: user tables are owner-only, and Seat Alerts and consent tables are service-role only. The snapshot store isn't created by a migration. **Security Advisor run 2026-10-30 (owner): 0 errors.** Its 2 search_path warnings are fixed by migration 0013; the `pg_net`-in-public and leaked-password warnings are accepted (rulings.md "iOS App Store decisions"). The 6 Info items are the intended "RLS Enabled No Policy" on service-role-only tables. With 0 errors, no public table is open to the anon key. | H1 checks that the snapshot store (not a table) can't be written with the anon key. The owner applies 0013. | H1 |
| — | Already sound: device secrets are stored hashed and compared in constant time; "I got it" tokens are HMAC-signed with an expiry; consent names are encrypted; the session is in the Keychain (`expo-secure-store`); OAuth uses PKCE; no Testudo credentials; secrets only in gitignored env files and Vercel/EAS. | Keep these. | section 7 |
