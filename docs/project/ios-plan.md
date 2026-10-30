# iOS app plan

Drafted 2026-10-29 by the main session for the owner's request: "plan the transfer of this project to iOS app form", with timelines, steps agents can run in parallel, and the owner's own steps in detail. **Status: proposal.** The stack choice (section 1) needs the owner's yes. Runs as 5 owner-coordinated sessions with up to 3 subagents each (owner, 2026-10-29; section 2). This moves iOS up from the roadmap's "Spring 2028" (roadmap.md).

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
| `localStorage` (10 files) | Not available in React Native | A storage adapter (MMKV), so shared code doesn't care where data lives. |
| Seat Alerts (web push) | iOS apps use APNs | Expo push service, sent by the cron next to web push; new `push_tokens` table. |
| Sign-in | Magic-link redirects, OAuth redirect | Email **code** (already built) + Google via in-app browser to `turboterp://auth/callback` + **Sign in with Apple** (needed under guideline 4.8 because Google is offered). |
| Server-rendered data (pages reading snapshots) | The app needs JSON endpoints | `/api/v1/...` JSON routes over the same CDN-cached snapshots. |
| Monitoring (Vercel Web Analytics, Sentry) | Vercel Web Analytics only runs in web pages; `@sentry/nextjs` is web-only | **No usage analytics in the app** (2026-10-30): visit counts stay a website-only figure, and the app's privacy label leaves out "usage data". **Sentry in the app** through `@sentry/react-native` (Expo config plugin): off until `EXPO_PUBLIC_SENTRY_DSN` is set, no tracing or replay, same scrubbing as the web (`scrubEvent` moves into `app-core`). |
| Node-only package code (`cheerio` scrapers, `@napi-rs/canvas` in `catalog`) | Can't run on a phone | Never imported by the app. S0 checks the import graph; a lint rule in `apps/mobile` blocks it. |

### How agents verify work without a Mac
- **Logic:** Vitest, as now. Shared code keeps its tests.
- **Layout screenshots:** the app also runs as an Expo **web** export, so the existing `ui-check` script can screenshot it (close, not exact).
- **Real-device check (owner):** a **development build** on the owner's iPhone. Builders publish each change with **EAS Update** to a review branch, and the owner opens it in the dev build. No rebuild is needed unless native config changes.
- **Cloud build budget:** the Expo free plan allows about **15 iOS builds a month** (lowered in 2026; check expo.dev/pricing). Budget: about 3 dev-client builds and 6–8 TestFlight builds for the first release. Only the main session starts builds.

## 2. Sessions and subagents

The owner runs several Claude Code sessions at once and coordinates them (owner, 2026-10-29). Each session is the main session for one lane: it dispatches its own builder subagents, reviews them and merges its lane.

**Recommended: 5 sessions, at most 3 subagents each.** They don't all start together. 3 sessions open on day 0, and the other 2 open on about day 2, when the shell they build on is merged.

| # | Session | Owns (only this session edits these) | Tasks | Model | Opens | Subagents at peak |
|---|---|---|---|---|---|---|
| 1 | **Lead** | `apps/mobile` frame: `app.json`, `eas.json`, root layout, tab bar, `components/ui`, Today, Calendar, Campus screens. Project docs (PROJECT_MEMORY.md, status log, rulings, owner-review). All EAS builds and the release. | S0, S1, B1, B2, B3a, B3b, R1, R2, R3 | Opus (spike decision, builds, release) | day 0 | 3 (B2, B3a, B3b) |
| 2 | **Core** | `packages/app-core` (new), the `apps/web/lib` files it replaces, the engine bridge (`apps/mobile/engine/`) | A1a, A1b, A5 | Sonnet | day 0 | 3 (day 1) |
| 3 | **Backend** | `apps/web/app/api/**`, `supabase/migrations/**`, privacy/terms text, `apps/mobile/lib/auth/**`, account screens | A2, A4s, A3 | Sonnet | day 0 | 2 |
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
| **S1** | Lead | **Scaffold** (keeps S0's working setup): `app.json` (bundle ID `com.turboterp.app`, scheme `turboterp`, `ITSAppUsesNonExemptEncryption: false`, iPhone only), `eas.json` profiles (development / preview / production), expo-router, Expo web export wired to `ui-check`, Vitest, lint (incl. the Node-only import ban). Sentry: `@sentry/react-native` with its config plugin, no-op unless `EXPO_PUBLIC_SENTRY_DSN` is set, `tracesSampleRate: 0`, no replay, `beforeSend` = the web's `scrubEvent` (moved from `apps/web/lib/sentry-scrub` into `app-core`, web still green). Source-map upload only if a `SENTRY_AUTH_TOKEN` EAS secret exists. | S0 | 0.5 |
| **B1** | Lead | **App shell and design system:** port `lib/theme.ts` tokens and `components/ui.tsx` primitives to React Native. Accent `#BA0C2F`, light and dark mode, Dynamic Type, VoiceOver labels, haptics, skeleton loading. Tab bar (Campus · Schedule · Calendar · Advisor), Today home from the logo. "Not affiliated with the University of Maryland" on About. **Creates an empty route file for every screen** so other sessions only fill in their own files. **UI** | S1 | 1 |
| **A1a** | Core | **Extract the advisor logic** from `apps/web/lib/advisor` into a new framework-free `packages/app-core` (creates the package): plan-state, analysis, prior credit, transcript parsing. Storage goes behind an adapter interface (web: `localStorage`, mobile: MMKV). The web app imports from `app-core`; **the web suite must stay green with no behavior change.** | none | 1 |
| **A1b** | Core | **Extract the rest** (merged after A1a): sync engine, schedule logic, seat-alerts client, calendar, consent and legal text, next-class, campus helpers. Splits the 3 files that import `next`. Same green-suite rule. | none (merges after A1a) | 1 |
| **A5** | Core | **Engine bridge** (only if S0 says the audit and/or transcript can't run natively): a bundled WebView page holding the audit, transcript parsing and exports, a typed `postMessage` API, and a warm-start so the first audit is fast. If the audit runs natively, A5 shrinks to transcript + exports. | S0 | 1–1.5 |
| **A2** | Backend | **JSON data API for the app:** `/api/v1/` routes for everything the web pages read on the server (campus snapshots, dining, libraries, rooms, gyms, calendar, schedule data, ratings), CDN-cached the same way, plus a typed client (moved into `app-core` by Core once it exists). Add the routes to the `robots.ts` disallow list. | none | 1 |
| **A4s** | Backend | **Native Seat Alerts push, server side:** migration `0010_push_tokens.sql` (user, Expo token, platform), a token register/unregister route, and the cron sending via the Expo push API next to web push, with the same cooldown and logging. Tapping opens Drop/Add. Privacy text updated (push token, iOS app; visit counts come from the website only). | none | 1 |
| **A3** | Backend | **Auth + sync on iOS:** Supabase client with the session in `expo-secure-store`. Email code sign-in. Google through `expo-web-browser` to `turboterp://auth/callback`. Sign in with Apple (`expo-apple-authentication`, native token to Supabase). Sync engine wired through `app-core`. Delete account (two-tap confirm). Registers the push token after sign-in. **UI** (sign-in and account screens) | A1b, S1, owner O7 | 1.5 |
| **B2** | Lead | **Today + Calendar** (next-class hero with "leave by", registration countdown, dining tiles, academic calendar). **UI** | B1, A2 | 1 |
| **B3a** | Lead | **Dining** (halls, menus, Find a food). **UI** | B1, A2 | 1 |
| **B3b** | Lead | **Libraries and Fitness** (hours, study-room grid with LibCal deep links, gyms, RecWell classes). **UI** | B1, A2 | 1 |
| **B4a1** | Schedule | **Course search and sort.** **UI** | B1, A2 | 1 |
| **B4a2** | Schedule | **Course and professor info** (ratings, grade data, reviews). **UI** | B1, A2 | 1 |
| **B4b1** | Schedule | **Builder grid:** sections panel, schedules A/B/C, overlap blocking. **UI** | B4a1, A1b | 1 |
| **B4b2** | Schedule | **Registration and export:** "Get ready to register" panel, `.ics` export via the share sheet, sync with the 4-year plan. **UI** | B4a1, A1b | 1 |
| **B5** | Schedule | **Seat Alerts screen** (watch list, bells in the section panel, "I got it"). **UI** | B4b1, A3, A4s | 0.5 |
| **B6a** | Advisor | **Clickwrap and setup** (programs, year, tracks), with a stub signed-in user until A3 merges. **UI** | A1a, B1 | 1 |
| **B6b** | Advisor | **4-year plan grid** with checks and warnings. **UI** | A1a, B1 | 1 |
| **B7a** | Advisor | **Audit and what-if**; wires the real sign-in gate from A3. **UI** | B6b, A5, A3 | 1.5 |
| **B7b** | Advisor | **Prior credit (AP/IB), course sheet, credit caps, tracks.** **UI** | B6a, B6b | 1.5 |
| **B8** | Advisor | **Transcript import + exports:** file picker / share-to-app for the PDF, paste and photo (OCR) paths, plan PDF/Excel export, "Email my plan". **UI** | B6b, A5 | 1 |
| **R1** | Lead | **Store package:** App Store text (name, subtitle, description with "Not affiliated with the University of Maryland", keywords), privacy-label answers, review notes, 1320×2868 screenshots composed from the owner's iPhone shots, app icon (1024 px, from `app/icon.svg`, no transparency), all in `docs/project/app-store-listing.md`. | none (screenshots after approval) | 0.5 |
| **R2** | Lead | TestFlight build → owner tests 3–7 days → fix list (sent to the owning sessions, or handled by Lead if they've closed) → release build → submit. | everything above | — |
| **R3** | Lead | Widgets (next class, dining) and a Live Activity for Seat Alerts (roadmap phase 6). Swift extension targets through a config plugin; each iteration needs a cloud build. Early start in Lead's free time if the build count allows; otherwise v1.1. | S1 | 1–2 |

## 4. Timeline

Days count from the owner's go. Each task starts as soon as its dependencies are merged into `feat/ios`. Estimates assume overtime mode in every session and owner UI approval within about a day. Apple's review usually takes 1–3 days per submission.

| Days | 1 Lead | 2 Core | 3 Backend | 4 Schedule | 5 Advisor | Owner |
|---|---|---|---|---|---|---|
| **0–1** | S0 spike; R1 text | A1a, A1b | A2, A4s | not open yet | not open yet | O1–O4; open sessions 1–3 (section 5) |
| **1–2** | S1 → B1 | A5 (to about 2.5) | A3 (to about 3) | not open yet | not open yet | O8 migration 0010; O7 Supabase; O5 dev build as soon as Apple approves |
| **2–3.5** | B2, B3a, B3b | A5 done; fixes to `app-core` on request; then closes | A3 done; then closes | B4a1, B4a2 | B6a, B6b | open sessions 4–5; O6 install; approve B1, A3 sign-in |
| **3.5–5** | R3 widgets (optional); fixes | | | B4b1, B4b2 → B5 (to about 5) | B7a, B7b, B8 (to about 5) | approve 3–4 screens a day |
| **5–6** | merge to `feat/ui-rework`, first TestFlight build | | | fixes, then closes | fixes, then closes | O9 store setup |
| **6–12** | fixes from testing | | | | | **O10 TestFlight testing (3–7 days)** |
| **about 10–14** | submit, release | | | | | O11 submit → Apple review → O12 release |

**First App Store release: about 2–2.5 weeks after the go.**
- Compared with one session and 6 builders: building takes about 5 days instead of about 7, and the release lands about half a week sooner.
- **Critical path:** S0 → S1 → B1 → B6b → B7a, with the Schedule chain B4a1 → B4b1 → B5 about the same length.
- **What holds things up:**
  - **Apple enrollment:** a real-device review needs it by about day 2. Until then, sessions review with Expo web screenshots, so building doesn't stop.
  - **Your reviews:** about 15 screens arrive over days 2–6.
  - **Your testing time on TestFlight.**

**Cost:** about 25 builders at under 100k Sonnet tokens each, plus the 5 sessions' own context (two on Opus). That's roughly 3M tokens, most of it in days 1–4. This is the most usage-heavy way to run the plan, and a usage limit stops every session at once. If one hits:
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
3. Confirm the bundle ID **`com.turboterp.app`**. It can never change after the first upload.

### O2. Enroll in the Apple Developer Program (day 0; approval takes hours to a few days, so start first)
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

### O4. Get your iPhone ready (day 0, 2 minutes)
1. Update to the latest iOS.
2. Keep it close during O5–O6.

### O5. First development build (after O2 is approved and S1 is merged, about day 1.5–2; about 30 minutes plus the build queue). Real-device reviews start once it is installed. Before that, sessions review with Expo web screenshots.
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
4. **For every review from now on:** Claude sends a link or QR code for an EAS Update ("review/B3", etc.). Open it on the iPhone, and the dev build loads that version. Reply "approved" or with changes. No rebuild is needed.

### O7. Supabase settings for the app (when A3 starts)
1. Supabase → **Authentication → URL Configuration → Redirect URLs** → add `turboterp://auth/callback` → Save.
2. Supabase → **Authentication → Providers → Apple** → Enable. In **Client IDs**, enter `com.turboterp.app`. Leave the secret key empty: the native iOS sign-in doesn't use it. Save.
3. Supabase → **Authentication → Emails → Magic Link**: if not done yet, add the `{{ .Token }}` code line (owner-review.md, 2026-10-29). The app signs in by code only.
4. Google sign-in needs nothing new: the app uses the same web OAuth client through the in-app browser.

### O8. Push tokens migration (when A4s is merged, about day 1)
1. Supabase → **SQL Editor** → paste `supabase/migrations/0010_push_tokens.sql` → Run, the same way as 0009.
2. Optional but recommended: expo.dev → project → **Settings → Push security** → turn on "Enhanced security", create a token, set it in Vercel Production as `EXPO_ACCESS_TOKEN`, then deploy.
3. Deploy the web app (`npx vercel deploy --prod` from the main checkout, as usual) so the cron starts sending iOS pushes.

### O9. App Store Connect setup (about day 5, about 45 minutes)
1. **appstoreconnect.apple.com → Apps → + → New App:**
   - Platform **iOS**. Name **TurboTerp** (this claims the name: open to-do in PROJECT_MEMORY section 10). Primary language **English (U.S.)**.
   - Bundle ID **com.turboterp.app** (it appears after O5). SKU `turboterp-ios`. User access **Full Access**.
2. **API key so Claude can upload builds:** Users and Access → **Integrations → App Store Connect API** → Team Keys → **+**. Name "EAS", access **App Manager** → Generate. Download the `.p8` file (one download only). Note the **Key ID** and **Issuer ID**. Run `! npx eas-cli credentials` → iOS → production → App Store Connect API Key → add it with those values. Then delete the `.p8` from Downloads, or keep it in your password manager.
3. **App Information:** Category **Education**, secondary **Productivity**. Content Rights: answer that the app shows third-party content (UMD public data, PlanetTerp), and you have the right to use it where it's public and non-commercial (Claude drafts the wording in R1).
4. **Age Rating:** answer the questionnaire. Everything is "None" or "No" except the questions R1 notes. Expected result: 4+.
5. **Pricing and Availability:** Free, United States (or all countries).
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
3. **App Review Information:** your contact details. Turn **Sign-in required** on. In Notes, paste Claude's review notes: Campus, Schedule and Calendar work without an account; Sign in with Apple creates an account instantly for the Advisor; the agreement is a typed-name clickwrap; the app isn't affiliated with UMD and uses public data only.
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
