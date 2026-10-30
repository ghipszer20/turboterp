# iOS app plan

Drafted 2026-10-29 by the main session for the owner's request: "plan the transfer of this project to iOS app form", with timelines, steps agents can run in parallel, and the owner's own steps in detail. **Status: proposal.** The stack choice (section 1) needs the owner's yes. 4 builders at once: owner, 2026-10-29. This moves iOS up from the roadmap's "Spring 2028" (roadmap.md).

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
| Node-only package code (`cheerio` scrapers, `@napi-rs/canvas` in `catalog`) | Can't run on a phone | Never imported by the app. S0 checks the import graph; a lint rule in `apps/mobile` blocks it. |

### How agents verify work without a Mac
- **Logic:** Vitest, as now. Shared code keeps its tests.
- **Layout screenshots:** the app also runs as an Expo **web** export, so the existing `ui-check` script can screenshot it (close, not exact).
- **Real-device check (owner):** a **development build** on the owner's iPhone. Builders publish each change with **EAS Update** to a review branch, and the owner opens it in the dev build. No rebuild is needed unless native config changes.
- **Cloud build budget:** the Expo free plan allows about **15 iOS builds a month** (lowered in 2026; check expo.dev/pricing). Budget: about 3 dev-client builds and 6–8 TestFlight builds for the first release. Only the main session starts builds.

## 2. Tasks

Every task is one builder (Sonnet), test-first, in its own worktree and branch (`feat/ios-<id>`). It merges into `feat/ios` (cut from `feat/ui-rework`), which merges into the working branch after review. Rough size is in builder-days. **UI** means a major UI change that needs owner approval on the iPhone.

Tasks are split so 4 builders can run at once (owner ruling 2026-10-29). Lanes are in section 3. Parallel tasks touch separate files; where two touch the same area, the brief lists exactly which files each one owns.

### Gate
| ID | Task | Depends on | Size | Done when |
|---|---|---|---|---|
| **S0** | **Spike: run the shared code on iOS.** Expo app in `apps/mobile`, npm workspace, Metro resolving the raw-`.ts` ESM packages. Test cases: (a) `highs` + one real audit on Hermes; (b) the same audit through a WebView bridge; (c) `pdfjs` text extraction in the bridge. Also: an import-graph check for Node-only modules. Throwaway screens. | none | 1 | Written result in `docs/project/ios-spike.md`: which path the audit and transcript use, with timings. Main session records the decision in rulings.md. |
| **S1** | **Scaffold (keeps S0's working setup):** `app.json` (bundle ID `com.turboterp.app`, scheme `turboterp`, `ITSAppUsesNonExemptEncryption: false`, iPhone only), `eas.json` profiles (development / preview / production), expo-router with the 4 tabs + Today, Expo web export wired to `ui-check`, Vitest, lint (incl. the Node-only import ban). | S0 | 0.5 | `npx expo export -p web` and the tests pass; the first dev build is ready to start (owner step O5). |

### Shared logic and backend
| ID | Task | Depends on | Size |
|---|---|---|---|
| **A1a** | **Extract the advisor logic** from `apps/web/lib/advisor` into a new framework-free `packages/app-core` (creates the package): plan-state, analysis, prior credit, transcript parsing. Storage goes behind an adapter interface (web: `localStorage`, mobile: MMKV). The web app imports from `app-core`; **the web suite must stay green with no behavior change.** | S0 | 1 |
| **A1b** | **Extract the rest** into `app-core` (rebased on A1a's package skeleton, merged after it): sync engine, schedule logic, seat-alerts client, calendar, consent and legal text, next-class, campus helpers. Splits the 3 files that import `next`. Same green-suite rule. | S0 (starts with A1a; merges after it) | 1 |
| **A2** | **JSON data API for the app:** `/api/v1/` routes for everything the web pages read on the server (campus snapshots, dining, libraries, rooms, gyms, calendar, schedule data, ratings), CDN-cached the same way. A typed client lives in `apps/web/lib/api-v1/` until `app-core` exists, then the main session moves it (a small move). Add the new routes to the `robots.ts` disallow list. | none | 1 |
| **A3** | **Auth + sync on iOS:** Supabase client with the session in `expo-secure-store`. Email code sign-in. Google through `expo-web-browser` to `turboterp://auth/callback`. Sign in with Apple (`expo-apple-authentication`, native token to Supabase). Sync engine wired through `app-core`. Delete account (two-tap confirm). Registers the Expo push token after sign-in (needs A4s's table). | A1b, S1, owner O7 | 1.5 |
| **A4s** | **Native Seat Alerts push, server side:** migration `0010_push_tokens.sql` (user, Expo token, platform), a token register/unregister route, and the cron sending via the Expo push API next to web push, with the same cooldown and logging. Tapping opens Drop/Add (payload URL). Privacy text updated (push token, iOS app). Web-only work, so no dependency. | none | 1 |
| **A5** | **Engine bridge** (only if S0 says the audit and/or transcript can't run natively): a bundled WebView page holding the audit, transcript parsing and exports, a typed `postMessage` API, and a warm-start so the first audit is fast. If S0 found the audit runs natively, A5 shrinks to transcript + exports. | S0 | 1–1.5 |

### Screens (each one is **UI**)
| ID | Task | Depends on | Size |
|---|---|---|---|
| **B1** | **App shell and design system:** port `lib/theme.ts` tokens and `components/ui.tsx` primitives to React Native. Accent `#BA0C2F`, light and dark mode, Dynamic Type, VoiceOver labels, haptics, skeleton loading. Tab bar (Campus · Schedule · Calendar · Advisor), Today home from the logo. "Not affiliated with the University of Maryland" on About. | S1 | 1 |
| **B2** | **Today + Calendar** (next-class hero with "leave by", registration countdown, dining tiles, academic calendar). | B1, A2 | 1 |
| **B3** | **Campus:** Dining (+ Find a food), Libraries (hours + study-room grid with LibCal deep links), Fitness (gyms, RecWell classes). | B1, A2 | 1.5 |
| **B4a** | **Schedule part 1:** course search, course and professor info, ratings and grade data, sort. | B1, A2 | 1.5 |
| **B4b** | **Schedule part 2:** builder grid, sections panel, schedules A/B/C, overlap blocking, "Get ready to register" panel, `.ics` export via the share sheet, sync with the 4-year plan. | B4a, A1b | 2 |
| **B5** | **Seat Alerts screen** (watch list, bells in the section panel, "I got it"). | B4b, A3, A4s | 0.5 |
| **B6** | **Advisor part 1:** typed-name clickwrap, setup (programs, year, tracks), 4-year plan grid with checks and warnings. Runs with a **stub signed-in user**; the sign-in gate is wired in once A3 merges (a small follow-up in B7a's brief). | A1a, B1 | 2 |
| **B7a** | **Advisor part 2a:** audit view and what-if; wires the sign-in gate from A3. | B6, A5, A3 | 1.5 |
| **B7b** | **Advisor part 2b:** prior credit (AP/IB), course sheet, credit caps, tracks. Separate screens from B7a, so they run in parallel. | B6 | 1.5 |
| **B8** | **Transcript import + exports:** file picker / share-to-app for the PDF, paste and photo (OCR) paths, plan PDF/Excel export, "Email my plan". | B6, A5 | 1 |

### Release (main session + owner)
| ID | Task | Depends on |
|---|---|---|
| **R1** | Store package: App Store text (name, subtitle, description with "Not affiliated with the University of Maryland", keywords), privacy-label answers, review notes, 1320×2868 screenshots composed from the owner's iPhone shots, app icon (1024 px, from `app/icon.svg`, no transparency). Claude drafts all of it in `docs/project/app-store-listing.md`. | B1 |
| **R2** | TestFlight build → owner tests 3–7 days → fix list → (B-lane fixes) → release build → submit. | all of A and B |
| **R3** (v1.1) | Widgets (next class, dining) and Live Activity for Seat Alerts (roadmap phase 6). Swift extension targets through a config plugin; each iteration needs a cloud build. | R2 |

## 3. Order and timeline

**4 builders at once** (owner, 2026-10-29; PROJECT_MEMORY section 18). Four lanes, each a chain of tasks. A lane takes its next task as soon as that task's dependencies are merged.

- **Critical path:** **S0 → A1a → B6 → B7a**, about 5.5 builder-days. The Advisor still finishes last, but it now starts on day 3 instead of week 3. B6 no longer waits for sign-in, and the advisor extraction is split off.
- **Not limited by builders any more:** with 4 lanes, the limits are the owner's Apple enrollment (needed for the first dev build, by about day 3) and how fast UI reviews come back. About **2 screens a day** arrive for approval in week 1.5–2.
- **Main-session review load:** up to 4 branches finish per day. The main session merges in dependency order and runs the full suite after each merge. Expect merges to take part of each day.

Estimates assume overtime runs on most days and the owner approves UI within about a day. Apple's review usually takes 1–3 days per submission.

| When | Lane 1 (app frame) | Lane 2 (Advisor) | Lane 3 (logic) | Lane 4 (data and engine) | Owner (section 4) |
|---|---|---|---|---|---|
| **Day 1** | S0 spike | A2 data API | A4s push server side | (idle until S0; main session drafts R1) | O1–O4: decide, Apple enrollment, Expo account, iPhone |
| **Days 2–3** | S1 scaffold → B1 shell | A1a advisor extraction | A1b other extraction | A5 engine bridge | O8 migration 0010 (A4s done); O5–O6 dev build once Apple approves |
| **Days 4–5** | B2 Today+Calendar | B6 Advisor 1 | A3 auth + sync | B4a Schedule 1 | O7 Supabase (A3 starts); approve B1, B2 |
| **Days 6–8** | B3 Campus | B7a audit + what-if | B7b prior credit, course sheet, tracks | B4b Schedule 2 | approve B6, B4a, B3 |
| **Days 9–10** | B5 Seat Alerts | B8 transcript + exports | accessibility + dark-mode pass | fixes from approvals | approve B7a/b, B4b, B5, B8; O9 store setup |
| **Week 3** | fixes | fixes | | | **O10 TestFlight testing (3–7 days)** |
| **Week 3.5–4** | fixes | | | | O11 submit → Apple review → O12 release |
| **Weeks 4–5** | R3 widgets / Live Activity (v1.1) | | | | approve, update |

**First App Store release: about 3–4 weeks after the go** (was 4.5–5.5 with 2 builders). Building drops from about 3.5 weeks to about 2. TestFlight testing and Apple review don't get shorter.

**Cost:** total work is about the same, plus about 3 extra builder start-ups from the splits (about 45k tokens each, section 18). Usage per day is about **twice** the 2-builder plan. If a usage limit stops work, lanes 3 and 4 pause first: lanes 1 and 2 hold the critical path.

**If S0 fails badly** (the shared code can't run in Expo even through a WebView): stop and come back to the owner with the Capacitor fallback and its 4.2 risk before building more.

## 4. Owner steps, in order

Claude can't do these: they need the owner's identity, money, Apple 2FA or devices. Do each one when its row in the timeline comes up. Commands starting with `!` are typed into the Claude Code prompt so the output lands in the session.

### O1. Say yes to the plan (day 1, 5 minutes)
1. Confirm **Expo, native app** (section 1), or ask for the Capacitor fallback.
2. Give the go for S0, A2 and A4s (day 1 lanes), or turn on overtime mode so builders dispatch without asking each time.
3. Confirm the bundle ID **`com.turboterp.app`**. It can never change after the first upload.

### O2. Enroll in the Apple Developer Program (day 1; approval takes hours to a few days, so start first)
1. On your iPhone, install **Apple Developer** from the App Store. Enrolling in the app is the fastest path for individuals.
2. Sign in with the Apple Account you want to own the app. Two-factor authentication must be on (Settings → your name → Sign-In & Security).
3. Tap **Account → Enroll Now**. Choose **Individual / Sole Proprietor**. Organization enrollment needs a legal entity and a D-U-N-S number, and there's no LLC (PROJECT_MEMORY section 2).
4. Enter your **legal name** exactly as on your ID. **The App Store shows this name as the seller** under the app. That's unavoidable for an individual account; note it alongside the plan to scrub your name from git history.
5. Pay **$99/year**. It's a running cost, so donations can cover it (rulings.md "Running costs").
6. Wait for the "Welcome to the Apple Developer Program" email. Tell Claude when it arrives.

### O3. Create an Expo account (day 1, 5 minutes)
1. Sign up at **expo.dev** (free plan) with the email you use for project accounts.
2. Create an organization or use the personal account; name it `turboterp` if it's free.
3. In this session run `! npx eas-cli login` and sign in.
4. Create a token for Claude's builds: expo.dev → Account settings → **Access tokens** → Create, name it "claude-builds". Paste it into `apps/mobile/.env.local` as `EXPO_TOKEN=...`. That file is gitignored; never paste the token into chat or a tracked file.

### O4. Get your iPhone ready (day 1, 2 minutes)
1. Update to the latest iOS.
2. Keep it close during O5–O6.

### O5. First development build (after O2 is approved and S1 is merged, about day 2–3; about 30 minutes plus the build queue). This is now the main thing that can hold up the screens: B1 is reviewed on the phone.
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

### O8. Push tokens migration (when A4s is merged, about day 2)
1. Supabase → **SQL Editor** → paste `supabase/migrations/0010_push_tokens.sql` → Run, the same way as 0009.
2. Optional but recommended: expo.dev → project → **Settings → Push security** → turn on "Enhanced security", create a token, set it in Vercel Production as `EXPO_ACCESS_TOKEN`, then deploy.
3. Deploy the web app (`npx vercel deploy --prod` from the main checkout, as usual) so the cron starts sending iOS pushes.

### O9. App Store Connect setup (week 3, about 45 minutes)
1. **appstoreconnect.apple.com → Apps → + → New App:**
   - Platform **iOS**. Name **TurboTerp** (this claims the name: open to-do in PROJECT_MEMORY section 10). Primary language **English (U.S.)**.
   - Bundle ID **com.turboterp.app** (it appears after O5). SKU `turboterp-ios`. User access **Full Access**.
2. **API key so Claude can upload builds:** Users and Access → **Integrations → App Store Connect API** → Team Keys → **+**. Name "EAS", access **App Manager** → Generate. Download the `.p8` file (one download only). Note the **Key ID** and **Issuer ID**. Run `! npx eas-cli credentials` → iOS → production → App Store Connect API Key → add it with those values. Then delete the `.p8` from Downloads, or keep it in your password manager.
3. **App Information:** Category **Education**, secondary **Productivity**. Content Rights: answer that the app shows third-party content (UMD public data, PlanetTerp), and you have the right to use it where it's public and non-commercial (Claude drafts the wording in R1).
4. **Age Rating:** answer the questionnaire. Everything is "None" or "No" except the questions R1 notes. Expected result: 4+.
5. **Pricing and Availability:** Free, United States (or all countries).
6. **App Privacy:** Privacy Policy URL `https://turboterp.com/privacy`. Fill the data-collection labels from the table Claude prepares in R1: email address, name (typed agreement name), user content (plans, courses), identifiers (push token), usage data (Vercel Analytics), diagnostics (Sentry). For each: linked to the user or not, not used for tracking.
7. **Support URL** `https://turboterp.com/support`, **Marketing URL** `https://turboterp.com`.

### O10. TestFlight testing (week 4, 3–7 days of normal use)
1. App Store Connect → your app → **TestFlight → Internal Testing → +** → create group "Owner", add yourself (your Apple Account email).
2. Claude starts the production build and uploads it (`eas build --profile production` + `eas submit`). It appears in TestFlight after Apple processes it (10–30 minutes). Internal testing needs no Apple review.
3. Install the **TestFlight** app on your iPhone, accept the invite, install TurboTerp.
4. Use it as your daily app for 3–7 days: schedule, dining, your real Advisor plan, a Seat Alert. Note anything wrong (screenshot + one line) and send it to Claude in one batch.
5. Optional: add up to 100 friends as **External Testers**. That needs a short beta review by Apple (about a day).

### O11. Screenshots and submission (week 5, about 1 hour)
1. On your iPhone, take 4–6 screenshots Claude lists in R1 (Today, Schedule builder, Audit, 4-year plan, Dining, Seat Alerts). Use a test plan, not your real grades. AirDrop or upload them, and Claude composes the 1320×2868 store images.
2. In App Store Connect → the version page: upload the screenshots, paste the text from `docs/project/app-store-listing.md`, and pick the build Claude uploaded.
3. **App Review Information:** your contact details. Turn **Sign-in required** on. In Notes, paste Claude's review notes: Campus, Schedule and Calendar work without an account; Sign in with Apple creates an account instantly for the Advisor; the agreement is a typed-name clickwrap; the app isn't affiliated with UMD and uses public data only.
4. **Version Release:** choose **Manually release this version**.
5. Tap **Add for Review → Submit**. Review usually takes 1–3 days. If Apple rejects it, paste the full message to Claude. Most rejections are fixed in the metadata or in one small build.

### O12. Release (when approved)
1. Tap **Release This Version**. It shows up on the App Store within hours.
2. Tell Claude. Claude adds the App Store badge and a Smart App Banner to turboterp.com (a small web change you deploy), and records the release in PROJECT_MEMORY.

## 5. Rules for this project (beyond section 18)
- Only the main session starts EAS builds and keeps a count against the monthly quota (status log). Builders use the Expo web export, tests and EAS Update only.
- App Store submission and release happen only on the owner's go, the same as `--prod` deploys.
- `apps/mobile` must never import Node-only modules (`cheerio`, `@napi-rs/canvas`, server routes). The lint rule enforces it.
- Any change to shared packages runs **both** test suites (web + mobile) before merge.
- Secrets (`EXPO_TOKEN`, App Store Connect key) live only in gitignored `.env.local` files and on EAS/Vercel.
