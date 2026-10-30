# Security follow-up plan: two sessions

Drafted 2026-10-30 for the owner: "make a plan to do this such that i can split the work up between two sessions and do it faster". "This" is the security work left after the 2026-10-30 hardening (`docs/project/security.md`, merged into `feat/ui-rework` as `abac0e53`). **Status: proposal; waiting on the owner's go.**

## 1. What's left

| # | Work | Severity | Session |
|---|---|---|---|
| 1 | **Bot check (Cloudflare Turnstile) on email sign-in.** Today anyone can script sign-in requests and use up the 300/day Brevo quota for everyone. | High | A |
| 2 | Turnstile on the Report form (server-verified), next to the existing trap field. | Medium | A |
| 3 | CSP violation reports sent to Sentry, so a blocked script or a missed host shows up. | Low | A |
| 4 | Rate limits counted and recorded in one database step, so a burst of parallel requests can't slip past them. | Low | B |
| 5 | A `server-only` guard on server modules, so a key-holding module can never end up in the browser bundle. | Low | B |
| 6 | External links from scraped data (dining labels, RecWell sign-ups, room booking, library and PlanetTerp links) open only if they're `https:`. | Low | B |
| 7 | `npm run security`: a production-dependency audit plus a secret scan of the working tree and the full history (`secretlint`, no Actions). | Low | B |
| 8 | Three doc fixes left from 2026-10-30. The `security.md` secret-scan wording should match the patterns actually checked. The Monitoring owner item needs a step to test Sentry under the CSP. The PROJECT_MEMORY branch line is out of date. | Housekeeping | B |

## 2. Sessions

Each session is a main session for its lane. It dispatches Sonnet builders (at most 3 at once, one per task, no reviewer agents; PROJECT_MEMORY section 18), reviews their work and merges its lane. The two lanes touch no files in common, so they run fully in parallel.

| | Session A: Bot checks | Session B: Lead and depth |
|---|---|---|
| Tasks | A1 (items 1 and 3), A2 (item 2) | B1 (item 8, done in-session), B2 (item 4), B3 (item 5), B4 (item 6), B5 (item 7, done in-session) |
| Owns | `apps/web/lib/security-headers.ts` (+ test), `app/advisor/SignInGate.tsx`, a new `lib/auth/turnstile*`, `app/report/**`, `lib/email/report.ts` (+ test), the privacy/terms text, and `docs/project/security-sessions/A-owner-steps.md` | PROJECT_MEMORY.md, owner-review.md, security.md, the status log, `package.json` and the lockfile, `supabase/migrations/**`, `lib/email/rate-limit.ts`, every other server module (for `server-only`), the link components listed in B4, `vitest.config.mts` |
| Builders at peak | 2 | 3 |
| Model | Sonnet builders; the session itself on the owner's usual model | same |

**Why two and not more:** the work fits in about half a day per lane. A third session would split B's three small builders and save maybe an hour, but it would add another merge into `feat/ui-rework` and more coordination for you.

## 3. Rules for both sessions (these exist because of the 2026-10-30 clash)
- **Never work in the main checkout** (`C:\Users\24GHi\Code\SuperTerp`), and never switch its branch. Each session and each builder works in its own worktree under `.claude/worktrees/`.
- **Stage by explicit path.** Never `git commit -a`, `git add -A` or `git add .`. Never use bare `git stash`; the stash is shared across worktrees.
- **Merging** (the session does this after reviewing its builders):
  1. In the session's own worktree: `git fetch`, then merge `origin/feat/ui-rework` into the lane branch.
  2. Run the full suite, typecheck, lint and build.
  3. Push the lane branch and fast-forward `feat/ui-rework` to it (`git push origin <lane>:feat/ui-rework`).
  4. If the push is refused because the other session pushed first, repeat steps 1–3. Never force-push.
- **Only B** edits PROJECT_MEMORY.md, owner-review.md, security.md and the status log. A writes its owner steps to `docs/project/security-sessions/A-owner-steps.md`. B links that file from owner-review.md when A says it's done.
- **Migrations:** B uses **0014**. 0011 is reserved for the iOS Expo push tokens, and 0012 and 0013 are taken.
- **Deploy:** neither session deploys. You deploy from the main checkout once both lanes are merged (section 5 gives the order).

## 4. Task briefs

### A1. Turnstile on email sign-in, plus CSP reports (Session A, builder 1, about 3 hours)
- **Goal:** the "Email me a sign-in link" request carries a Turnstile token, so Supabase can reject scripted requests once you turn its CAPTCHA on.
- **Sign-in:**
  - Add a small `lib/auth/turnstile.ts` (load the script, render the widget, return a token) and use it in `app/advisor/SignInGate.tsx`. Pass `options.captchaToken` to `signInWithOtp`. `verifyOtp` (the typed code) and Google sign-in don't need it.
  - Load Cloudflare's script directly (`https://challenges.cloudflare.com/turnstile/v0/api.js`), with no npm dependency, so B owns `package.json` alone.
  - Show the widget only when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set. Without the key, sign-in works exactly as it does today.
  - Use "managed" mode. The widget sits under the email field, matches the light and dark theme, and gets a fresh token after each send.
- **CSP** (`lib/security-headers.ts`, test first):
  - Add `https://challenges.cloudflare.com` to `script-src` and `frame-src`.
  - Add `report-uri` / `report-to` pointing at Sentry's security endpoint, derived from `NEXT_PUBLIC_SENTRY_DSN`. Leave it out when the DSN is unset.
- **Privacy text:** add a line that sign-in and the report form run an automated bot check, which reads basic browser and device signals. Name the data, not the provider: `legal.test.ts` fails on provider names (rulings.md "Privacy names data, not providers"). Bump the policy date.
- **Tests:**
  - the widget only renders when the key is set
  - the token is passed to `signInWithOtp`
  - the CSP hosts and the report directive appear only when configured
- **Check:**
  - Run it locally with Cloudflare's always-pass test key `1x00000000000000000000AA` and confirm the token reaches the request.
  - Run the CSP probe from 2026-10-30 again: production build, headless Edge, zero violations on `/advisor` with the widget showing.
- **Done:** tests, typecheck, lint and build pass, and screenshots (light and dark) are in `docs/screenshots/turnstile/` for your approval. **UI** item.

### A2. Turnstile on the Report form (Session A, builder 2, about 2 hours, parallel with A1)
- **Goal:** a report is sent only with a valid Turnstile token, checked on the server.
- **Form:** `app/report/ReportForm.tsx` renders the widget when the site key is set, using A1's `lib/auth/turnstile.ts`. Builder 2 writes that module first if A1 hasn't merged yet, and the two branches merge it once in review.
- **Server:**
  - `lib/email/report.ts` verifies the token with `https://challenges.cloudflare.com/turnstile/v0/siteverify`, using `TURNSTILE_SECRET_KEY`, before the rate limit.
  - Inject the verify function, as the other dependencies are.
  - Bad or missing token returns 400 `captcha`. Turnstile unreachable returns 503. When the secret is unset, skip the check (as today).
  - Keep the trap field.
- **Tests:** valid, invalid, missing and unreachable tokens; secret unset.
- **Done:** tests, typecheck, lint and build pass. **UI** item (screenshot in the same folder).

### B1. Doc fixes (Session B itself, first, 15 minutes)
Make the three item-8 edits, then link `security-plan.md` from PROJECT_MEMORY section 14.

### B2. Atomic rate limits (Session B, builder 1, about 2 hours)
- **Goal:** checking and recording a send happen in one database step.
- **Migration** `supabase/migrations/0014_rate_limit_rpc.sql`:
  - `public.rate_limit_hit(p_kind text, p_key text, p_max int, p_window_seconds int) returns boolean`
  - It takes `pg_advisory_xact_lock(hashtext(p_kind || ':' || p_key))`, counts the rows inside the window, inserts a row when the count is under `p_max`, deletes rows older than a day, and returns whether the request is allowed.
  - `security definer`, `set search_path = ''`. Revoke it from public, anon and authenticated, and grant it to service_role only.
- **Code:**
  - `supabaseSendStore` gets a `hit()` that calls `/rest/v1/rpc/rate_limit_hit`.
  - `checkAndRecord` uses `hit()` when it's there, and keeps the old count-then-record path as a fallback when the RPC returns 404 (migration not applied yet), so deploy order doesn't matter.
  - Behavior stays the same: fail closed for report, plan and consent, and fail open for device.
- **Tests:** the existing rate-limit and route tests stay green. Add new ones for the RPC path, the 404 fallback and the limits.
- **Done:** the migration runs cleanly on a scratch database if one is available. If not, B checks the SQL in review.

### B3. `server-only` guard (Session B, builder 2, about 1 hour)
- Add `import "server-only"` to every module that reads a server secret or uses the service role:
  - `lib/email/*` except pure helpers
  - `lib/consent/record.ts` and `digest.ts`
  - `lib/seat-alerts/api.ts`, `store.ts`, `deps.ts`, `push.ts` and `run.ts`
  - `lib/account/delete.ts`, `lib/cron.ts` and `lib/schedule-data.ts`
- **Exception:** `lib/consent/name-crypto.ts` stays import-free, because `scripts/read-agreements.mts` loads it directly.
- **Vitest:** add an alias in `vitest.config.mts` mapping `server-only` to an empty module.
- **Done:** the build passes. A deliberate test import of `lib/seat-alerts/api.ts` from a client component fails the build (try it, then revert).

### B4. Safe external links (Session B, builder 3, about 1.5 hours)
- **Goal:** a link taken from scraped data renders only when it's an `https:` URL. Otherwise show plain text, or the existing fallback link.
- **Code:** `lib/safe-url.ts` with `safeHttpsUrl(url): string | null` (test first), applied in:
  - `campus/dining/DiningView.tsx`
  - `campus/gym/ClassesSection.tsx`, `ReserveSection.tsx` and `page.tsx`
  - `campus/libraries/page.tsx`
  - `campus/rooms/RoomsView.tsx` (apply it after the `{date}` substitution)
  - `schedule/InstructorReviews.tsx`
- **Done:** unit tests cover `javascript:`, `data:`, `http:`, relative URLs, look-alike schemes and good URLs. Pages look unchanged in ui-check.

### B5. `npm run security` (Session B itself, after B2–B4 merge, 30 minutes)
- **Script:** a root script that runs `npm audit --omit=dev --audit-level=high` and `secretlint` (dev dependency, recommended preset) over the working tree. Add a `--history` mode that pipes `git log -p --all` through secretlint.
- **Docs:** document it in `security.md`. Run it before every deploy and before the repo goes public.
- **Done:** it runs clean (or the findings are listed in `security.md` as fixed or accepted).

## 5. Your steps

**Before the sessions start (10 minutes, unblocks A's real-key check; the sessions can build with test keys meanwhile):**
1. Go to dash.cloudflare.com and sign up (free).
2. Go to Turnstile → Add widget. Name it "TurboTerp", add the hostname `turboterp.com` (subdomains are covered; local development uses Cloudflare's test keys, not localhost), and choose "Managed" mode.
3. Copy the **Site Key** into Vercel Production as `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
4. Copy the **Secret Key** into Vercel Production as `TURNSTILE_SECRET_KEY`. Keep it in your password manager too, because step 4 of the next list needs it. Never paste it in chat.

**When both lanes are merged (in this order: Supabase's CAPTCHA must come after the deploy, or every email sign-in fails):**
1. Supabase SQL Editor: run `0012_device_signup_limit.sql` (if not yet run), then `0014_rate_limit_rpc.sql`.
2. Deploy from the main checkout.
3. Check email sign-in on turboterp.com: the widget shows, and the code arrives.
4. Go to Supabase → Authentication → Attack Protection (Bot and Abuse Protection). Turn on **Enable CAPTCHA protection**, choose provider **Turnstile** and paste the Secret Key. Save.
5. Check email sign-in again, on your phone too (Home Screen app and Safari).
6. Approve the widget screenshots, or ask for changes.

The rest of the 2026-10-30 list still stands: the email rate limit, the redirect URLs, the `snapshots` bucket check, 2FA, and Dependabot with secret scanning.

## 6. Timeline (from your go)

| Time | Session A | Session B | You |
|---|---|---|---|
| 0:00 | worktree, dispatch A1 and A2 | B1, then dispatch B2, B3 and B4 | Turnstile keys (10 minutes) |
| about 2:00 | review A2, merge A2 | review and merge B3, B4 | |
| about 3:00 | review A1 + screenshots, merge lane | merge B2, run B5, merge lane | |
| about 3:30 | write A-owner-steps.md, done | link A's steps in owner-review.md, update PROJECT_MEMORY, done | section 5 steps 1–6 |

**About 3.5 hours with two sessions, against about 6 hours in one.** The lanes don't wait on each other. The only fixed order is in your own deploy steps.

**iOS note:** the iOS plan's A3 (sign-in on iOS) must pass a captcha token too once Supabase's CAPTCHA is on. Session B adds that line to `ios-plan.md` task A3.

## 7. Starting the sessions
1. Open two Windows Terminal tabs (`Ctrl+Shift+T`) and rename them `Sec-A` and `Sec-B`.
2. In each, run `claude` in `C:\Users\24GHi\Code\SuperTerp`, then paste:
   - **Sec-A:** `You are Session A in docs/project/security-plan.md. Read sections 2-4 (only your tasks, A1 and A2), create your worktree off origin/feat/ui-rework, and start.`
   - **Sec-B:** `You are Session B (Lead) in docs/project/security-plan.md. Read sections 2-4 (B1-B5), create your worktree off origin/feat/ui-rework, and start.`
3. Each session tells you when its lane is merged. Then follow section 5.
