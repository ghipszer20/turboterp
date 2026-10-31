# TurboTerp — Project Memory

> Single source of truth for project context. Update this file whenever a decision changes.
> Last updated: 2026-10-31 (Vercel pause fixed: scaling work deployed; site locked; Supabase secrets pending).
> Read by the main session at the start of every session (builders don't read it; CLAUDE.md), so keep it under ~20 KB (section 18).

## 1. Vision
An all-in-one iOS app + website for UMD students. It combines:
- Coursicle-style schedule planning
- UMD degree audit
- The UMD Schedule of Classes
- PlanetTerp and Reddit course/professor info
- Advising, campus life info (dining, libraries, gyms) and study-room booking (no buses: Transit does that better)

What sets it apart from Jupiterp, Coursicle and PlanetTerp is the **degree audit + 4-year planner + advising**, all in one app.

## 2. Owner decisions and preferences (do not re-litigate)
- **Open source, no LLC** (owner, 2026-09-24): TurboTerp is open source, with no LLC unless it is absolutely necessary. The code license (MIT or Apache-2.0, not yet chosen) disclaims warranty on the code. The hosted app relies on the clickwrap terms. Secrets (API keys, LibCal/DOTS credentials) stay out of the repo.
- **Name:** "TurboTerp" (owner, 2026-10-04; formerly "SuperTerp"). The local folder is still `SuperTerp` (renaming it breaks worktrees, the code graph and Claude's memory folder; only between sessions, on purpose). Backup name: "Scute". **The project will never make money** (owner, 2026-09-24): no ads, no paid tier; donations only to cover running costs (owner, 2026-09-26). So the Trademarks email is optional, and Reddit, PlanetTerp and Libraries/DOTS data requests stay non-commercial.
- **No lawyer review** (owner, 2026-09-24): a disclaimer is enough; Claude drafts plain-language disclaimer, terms and privacy text. Team: solo owner + Claude.
- **Every major must work**, not only CS. Every minor, specialization and special program with course requirements must also be included: Honors College LLPs, Gemstone, College Park Scholars, CIVICUS, other LLPs, citations, certificates, notations, departmental honors, combined BS/MS, ROTC, and **every pre-professional track with its requirements** (pre-med, pre-law, pre-dental, pre-PA, pre-vet, pre-pharmacy, pre-nursing, and others; see module 1).
- **No student-correction button or review queue.** Requirement data is verified before launch by comparing each program with its department's requirements page (owner, 2026-09-26; the review tool was dropped). **The owner does not adjudicate academic requirements** (owner, 2026-10-04: "i'm not a umd advisor - if its online at a umd resource, its a better reference than me"): flagged readings are settled from UMD's own published sources, never by asking the owner; where sources conflict or are silent, take the reading that cannot mark a requirement met wrongly and tell the student to confirm with their advisor. No 🧪 labels in production. After launch, a support email is fine.
- **Seat Alerts (owner, 2026-10-09; supersedes "not requested"):** students watch full sections (or any section of a class) and get a push notification within about a minute of a seat opening. Push only (no email). Its own main tab at `/alerts`, no sign-in (watches belong to the device). Specs: `docs/project/seat-alerts-tab.md`, `seat-alerts.md`; scale rules: `scaling-plan.md` 4.3 and rulings.md "Refresh intervals and seat freshness". Left: owner UI approval.
- **The UI must be incredibly sleek and easy to understand, Apple-style quality.** 4-year plan grid styled like the UMD CS 4-year plan, but with lighter, friendlier colors.
- Grade upload is wanted so the LLM can give personalized course-selection feedback.
- Dining hall menus, library hours, all RecWell gym schedules, and booking any study room at any library are all wanted.
- **Transport removed (owner, 2026-10-29):** no bus features; Transit covers them better. Walking "leave by" kept. Detail in rulings.md.
- Changes in the schedule builder must update the 4-year plan (two-way sync; see module 3).
- The 4-year plan feature requires a signed liability agreement (typed-name clickwrap) before first use (see section 11).
- Must handle switching majors, grad courses as an undergrad, double majors, double degrees, and adding or dropping majors and minors (see module 1).

## 3. Feature modules
Moved to `docs/project/feature-modules.md`. Read it before designing or building any feature.

## 4. Verified data sources (checked 2026-09-24)
Moved to `docs/project/data-sources.md`. Read it before touching a scraper or data source.

## 5. Study-room booking plan
- **Level 1 (no permission needed):** a unified availability grid plus smart search. Each slot deep-links to the exact room and date on LibCal.
- **Level 2 (needs UMD Libraries to issue credentials):** in-app one-tap booking through LibCal's official API, plus "My bookings".
- **Never** automate LibCal's public booking form without permission.

## 6. Requirements pipeline (every program)
1. Scrape the catalog.
2. Parse the tables with ordinary code.
3. Use an LLM to extract footnotes and prose into the rule format, with confidence flags.
4. Validate: official plans must pass, and mutation tests (plans broken on purpose) must fail.
5. Compare with the department's requirements page (department page wins); flagged items are settled from UMD's published sources, not by the owner (section 2).
6. Re-scrape the catalog each year and diff the changes.

Scale: about 200–300+ programs, roughly 200–300 hours of owner review. Launching in waves by college is an open option.

## 7. Tech stack
See the package.json files: Next.js web app (apps/web), TypeScript packages, HiGHS for the audit. Decisions behind the stack are in section 13.

## 8. UI / design
- **Principles:** show the answer, not the data; one main action per screen; plain language (e.g. "Humanities (DSHU)"); color only when it means something (white and gray, one accent, a pastel for each requirement category); an instant feel (cached data, skeleton loading, springs, haptics); accessibility (Dynamic Type, VoiceOver, dark mode, AA contrast).
- **Navigation (owner decision, 2026-09-24; owner 2026-10-29: Seat Alerts replaced the Calendar tab, rulings.md "Calendar tab out"):** FOUR main tabs: **Campus · Schedule · Seat Alerts · Advisor** (deployed 2026-10-30). Academic dates stay on Today and the Advisor; `/calendar` redirects to `/`.
  - **Campus** has a sub-nav: Dining · Libraries (hours + study rooms) · Fitness (Transport removed 2026-10-29, section 2).
  - **Schedule**: the schedule builder, plus course and professor info (replaces the old Explore idea). No sub-nav now.
  - **Advisor**: the 4-year plan / degree audit plus LLM advising. The what-if view is labeled **Explore**, heading "Try a different major or minor" (owner, 2026-10-30).
  - **Today** summary is the home page (`/`), reached from the TurboTerp logo; it's not a tab.
- **Onboarding** in under 60 seconds: major and year → transcript → audit.
- Don't use Testudo or UMD logos. **Logo (owner pick, 2026-10-04):** a small solid white terrapin in profile, mid-stride, with two bold speed lines, on the red tile (`apps/web/app/icon.svg`, `lib/logo.ts`). The owner rejected detailed top-down terrapins (scutes, rings, diamonds, claws, speckles, eyes): keep it minimal.
- The website gets a desktop layout, not a stretched phone app.

## 9. Phases and time estimate
Moved to `docs/project/roadmap.md` (phases 0–6, MVP recommendation, estimates, launch schedule).

## 9b. First-draft plan (owner-approved 2026-09-27)
`docs/project/first-draft-plan.md` is the build order to the first draft: MVP scope (Campus, Schedule, Advisor audit/planner, transcript import, what-if, section recommendations; no reviews, LLM advisor, optimizer or iOS), all ~270 programs encoded, deployed on Vercel + Supabase. Waves: 0 in-flight → 1 program infrastructure → 2 program batches by college → 3 MVP gaps → 4 deployment. Queue follows it.

## 10. Open to-dos and questions
- [ ] Optional: a courtesy email to UMD Trademarks & Licensing (required only if the project makes money).
- [ ] Email UMD Libraries requesting LibCal API credentials.
- [ ] Email UMD RecWell asking for API access (Innosoft Fusion for ActiveTerp classes and courts, Planyo for tennis) so students can sign up inside TurboTerp (`docs/project/recwell-signups.md`).
- [ ] Claim a domain (turboterp.com was unregistered on 2026-10-04, per Verisign RDAP), the App Store name and social handles.
- [ ] Decide whether to reuse or partner with Jupiterp (open source; check license).
- [ ] iOS app: Expo approved by the owner 2026-10-30 (rulings.md "iOS App Store decisions"); plan and status in `docs/project/ios-plan.md`. Waiting on the owner's yes (plan section 6, O1).
- [ ] Decide: launch everything at once, or in waves by college.
- [ ] Before making the repo public: scrub personal details from PROJECT_MEMORY.md (owner's program plans, personal notes) and review git history.

## 11. Legal and trust notes
Moved to `docs/project/legal.md`. Read it before building the disclaimer, accounts, exports or scrapers. The essentials: the 4-year plan / audit needs a typed-name clickwrap agreement first (so the planner was given a umd.edu account requirement; superseded 2026-10-04: accounts use any email, see legal.md); every audit result cites its catalog rule and year; no UMD marks and "Not affiliated with the University of Maryland" everywhere; never ask for or store Testudo credentials; scrape politely.

## 13. Build decisions (owner, 2026-09-24): locked for the start
- **Platform:** website first. Next.js installable web app (PWA). The rules engine, scrapers and data are separate packages, so an iOS app can reuse them later.
- **Repo:** github.com/ghipszer20/turboterp (renamed from `superterp` 2026-10-04; GitHub redirects the old URL). The plan was private until launch, but the repo was found PUBLIC on 2026-10-04 (owner to confirm). License **Apache-2.0**. Local: the `Code/SuperTerp` folder in the owner's user folder (never write the Windows user folder name into tracked files: owner, 2026-10-04). Git uses HTTPS with the gh credential helper (no SSH host key in this shell).
- **Hosting:** Vercel **Pro** since 2026-10-30 (bought to end the Hobby pause; $5 Spend Management budget that pauses production), Supabase Free (DB, auth, Edge Functions). Design target stays the free-tier limits (`docs/project/scaling-plan.md`). The owner creates the accounts when deployment needs them. **No GitHub Actions** (owner, 2026-09-28): it stopped running jobs because of billing, and the owner doesn't need it, so the CI workflow is disabled. Where the scheduled scrapers run is decided at deployment (Vercel Cron, Supabase scheduled functions, or Actions once the repo is public).
- **Workflow (updated 2026-09-24):** NO PR reviews. Claude works autonomously on long-running branches with draft PRs; the owner merges whenever they like, without reviewing (Claude can never push or merge to main). Check in with the owner ONLY for: (1) any **major UI change**, which the owner must approve (show screenshots or a local preview first); (2) design or functionality changes the owner wants; (3) problems or blockers; (4) something turning out infeasible; (5) a good new idea. Everything else: decide, note the assumption, keep going. PRs still explain web-specific choices, since the owner knows Python and less web.
- **Design:** Apple-style design system, approved visually by the owner. Accent **`#BA0C2F`** ((PRODUCT)RED, owner approved 2026-09-24): full strength only on buttons, active tabs and highlights; pale tints for backgrounds; brighter in dark mode. Soft whites and grays, light and dark mode.
- **Owner profile:** Math major, CS minor. **First verification target: Math + CS double major.** Also build a Math + CS double-degree test student.
- **Transcript:** the owner will provide their unofficial transcript during the Phase 2 parser work. It stays local only and is never committed (gitignored).
- **Tooling on the owner's PC:** git, gh (logged in as ghipszer20), Node 24, npm, Python 3.13 via `py` (no `python` or `python3` on PATH), no Docker (so use hosted Supabase, not local).

## 14. Current state (replace in place, never append; dated narrative goes in `docs/project/status-log.md`)
- **Branches:** `feat/ui-rework` is the working branch and what's live; PR #12 was merged earlier; `main` is 88 commits behind (2026-10-31) with no open PR, and merging is the owner's call. **Next steps: `docs/project/next-steps-2026-11.md`** (Spring 2027 registration is open until Dec 10). Everything built so far is merged into `feat/ui-rework` (security hardening `abac0e53`; scaling work 2026-10-30/31). Full local suite, typecheck, lint (0 errors) and build pass on `c3e0aa5c`. History up to 2026-10-30 (deploy IDs, sync, Seat Alerts, Google sign-in setup, lab pairs, monitoring): status log, "Moved from PROJECT_MEMORY §14".
- **Live (2026-10-31):** turboterp.com from `ee8685ee` (`dpl_5wwcizFA7s3QLjawKiCdGp1ojQSN`). **Site locked again** (owner, 2026-10-30): Vercel Production `SITE_ACCESS_CODE` is set, so visitors see Coming soon; the owner gets in with the code. Commits after `ee8685ee` (build guardrail, cursor cleanup, docs) aren't deployed yet; nothing in them is urgent.
- **Outage and scaling (2026-10-30/31):** Vercel Hobby paused the project for Active CPU (12 h of 4), almost all from the 5-minute seats job. The owner bought **Vercel Pro**, with a $5 Spend Management budget that pauses production at 100%. The redesign is in `docs/project/scaling-plan.md` (measurements, 5b log budget, 5c later items) and rulings.md "Refresh intervals and seat freshness". Live now: seats-only scanner and nightly full parse; cached Today/Campus pages; Apple-only calendar download; seats and Seat Alerts as Supabase Edge Functions behind SQL-gated pg_cron jobs; hot data in the `snapshot_hot` table; rooms every 30 min (7:00–01:00), dining twice a day; cron history trimmed nightly; the proxy skips static files; a postbuild check fails on per-visit pages.
- **Supabase:** migrations 0001–0010 and 0014–0016 applied (0011 is reserved for iOS push); **0012, 0013 and 0017 are not** (checked live 2026-10-31; owner-review.md has the paste-ready SQL). Without 0012 the Seat Alerts device limit stays off; nothing breaks. Edge Functions `soc-seats` and `seat-alerts` are deployed. **Blocked on the owner:** the four function secrets (`CRON_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`) were saved as the literal placeholder `...`, so the seats call gets 401 and seat counts stay nightly-only until they're set. Claude may not pull credentials to disk (auto-mode classifier), so the owner sets them.
- **Connectors (2026-10-31):** Supabase MCP (read-only, scoped to project `fwzttszitxlomopuswvj`) and Vercel MCP, both local scope for this folder. Use them to read logs, usage and SQL state instead of asking the owner for screenshots. The Vercel MCP can't reach team `hippy-io` without `authorize_team_access`; the Vercel CLI works (e.g. `vercel budgets`).
- **Deploys:** the owner runs `npx.cmd vercel deploy --prod --yes` **from the main checkout only**. A `!` command runs in Claude's shell's current folder: before suggesting one, `cd` the shell to the main checkout. A deploy from a worktree creates a stray Vercel project (happened twice on 2026-10-31 as `plan-docs`; the owner deleted it). On the owner's PowerShell, `npx` is blocked by the execution policy: use `npx.cmd`.
- **Waiting on the owner:** see `docs/project/owner-review.md` (include it in every progress report; add new items there).
- **Known to-dos:** see `docs/project/roadmap.md` "Known to-dos" (add new ones there); launch items in `docs/project/prelaunch-checklist.md` "At launch".

## 15. Working notes for Claude
Shell and tooling gotchas (Git Bash path rewriting, never kill Node by image name, ui-check for screenshots, Next 16 docs, long worktree paths): `docs/project/working-notes.md`. Read it before running shell-heavy work.

## 16. Overtime mode (owner, 2026-09-24/25)
Only when the owner says to turn on overtime mode; the owner's next message (usually "progress report") ends it. While on: never ask the owner anything, build continuously, dispatch builders without asking, build UI changes on branches with screenshots for approval afterwards, keep section 14 and the status log current. Full rules: `docs/project/overtime-mode.md` (read it when overtime is turned on).

## 17. Owner rulings (cross-cutting only; full text in `docs/project/rulings.md`)
Feature-specific rulings (schedule builder design, plan checker, tracks, campus pages, theme, AP/IB credit, pre-warmed data, grade distributions) live only in `docs/project/rulings.md`. Read the relevant part before designing or reviewing that feature, and quote it in builder briefs. New feature rulings go there; only rulings that apply to all work go here.
Code comments that cite "PROJECT_MEMORY section 17" (e.g. "open question 1") refer to the same text, now in `docs/project/rulings.md`.
- **Superpowers TDD applies strictly** (owner, 2026-09-25), including deleting code written before a failing test and redoing it test-first. Exception: code written before the superpowers plugin was installed (e.g. the SOC course parser) is kept and fixed. Outside that rule, don't rebuild working code unless absolutely necessary; fix it first.
- **Scale:** the site must support thousands of simultaneous users. Heavy work (schedule generation) runs in the browser; campus and course data are pre-built, CDN-cached snapshots; servers do no per-request scraping.
- **Degree rules confirmed by the owner:** CMSC141 counts for CMSC131 and CMSC142 for CMSC132. CS gateway: Fall 2024+ entrants need B- in gateway courses and a 3.0 GPA, earlier entrants C- and 2.7. The owner is in Math **Applied** (verification target: Math Applied + CS; Traditional is the default track); C- minimum for Math major courses; CMSC131 may count for both the programming requirement and Sequence Four. A course may be retaken only after an F or a W. **Grad courses (600–897, not 799) count toward any 400-level or upper-level range in every program** when the student has permission (owner, 2026-10-07; rulings.md).
- **Cross-listed courses count under every code** in every program (owner, 2026-10-07; rulings.md); "credit only granted for" twins never do.
- **Posted alternatives are encoded; unposted advisor exceptions are a dead end** (owner, 2026-10-07; rulings.md "Posted alternatives only").
- **Deleting something important takes two taps** (owner, 2026-10-04): a confirmation first, worded "Are you sure you want to delete ...?" and naming what is deleted (account data, a saved plan, a term with courses). Small, easily redone removals (one course, one filter) stay one tap.
- **Verification is local only** (owner, 2026-09-28; GitHub Actions CI disabled): the full test, typecheck, lint and build run locally after every merge into the working branch. The web `typecheck` script runs `next typegen` first.

## 18. How work is split (owner rules 2026-09-25/26/27; token rules 2026-09-28)
- **Ask the owner before starting any subagent** (owner, 2026-09-27): name the task, model and branch and wait for a yes. Not in overtime mode: there, dispatch without asking (section 16).
- **Builders do real tasks; the main session does tiny edits itself** (owner, 2026-09-28). A tiny edit (about 20 lines or less, in files already known: a rename, a one-line fix, wording) is done directly by the main session, since a builder's brief, startup and review cost more than the edit. Everything else goes to a builder in its own worktree and branch, test-first, pushing to its branch.
- **The main session talks with the owner, reviews and merges.** Review = read the diff, check screenshots for UI work, check the work against this file and `docs/project/rulings.md`, merge into the working branch, push, then run `graphify update .` (free, no LLM).
- **Main session model (owner, 2026-09-28):** Sonnet by default; the owner switches to Opus (`/model`) for design discussions and tricky reviews (e.g. audit-engine semantics). `/clear` between groups of work, after updating section 14, so history doesn't pile up.
- **Verification:** the builder runs the full suite (tests, typecheck, lint, build) once on its branch; the main session runs it again after each merge, before pushing (no CI).
- **Builder budget** (full rules: `docs/project/builder-budget.md`; read it before dispatching): Sonnet, one agent per task, **at most 3 at once per session**, no reviewer or second-opinion subagents, one feature or one program per brief, no research inside builders, about 40 tool calls and under 100k tokens each, short briefs (20-40 lines) with the quiet-output rules, resume existing worktrees, push early.
- **Keep this file small (owner, 2026-09-26).** The main session carries it in every request. Keep it under ~20 KB: section 14 is replaced in place, never appended to; dated history goes to `docs/project/status-log.md`; feature rulings to `docs/project/rulings.md`; detail to `docs/project/`. If it grows past ~20 KB, move content out before continuing.
