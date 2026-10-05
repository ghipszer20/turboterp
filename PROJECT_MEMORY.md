# TurboTerp — Project Memory

> Single source of truth for project context. Update this file whenever a decision changes.
> Last updated: 2026-10-04 (renamed SuperTerp to TurboTerp; schedule screenshots).
> Read by the main session at the start of every session (builders don't read it; CLAUDE.md), so keep it under ~20 KB (section 18).

## 1. Vision
An all-in-one iOS app + website for UMD students. It combines:
- Coursicle-style schedule planning
- UMD degree audit
- The UMD Schedule of Classes
- PlanetTerp and Reddit course/professor info
- Advising, campus life info (dining, libraries, gyms) and study-room booking

What sets it apart from Jupiterp, Coursicle and PlanetTerp is the **degree audit + 4-year planner + advising**, all in one app.

## 2. Owner decisions and preferences (do not re-litigate)
- **Open source, no LLC** (owner, 2026-09-24): TurboTerp is open source, with no LLC unless it is absolutely necessary. The code license (MIT or Apache-2.0, not yet chosen) disclaims warranty on the code. The hosted app relies on the clickwrap terms. Secrets (API keys, LibCal/DOTS credentials) stay out of the repo.
- **Name:** "TurboTerp" (owner, 2026-10-04; renamed from "SuperTerp", decided 2026-09-24). The code, docs and GitHub repo use the new name; the local folder is still named `SuperTerp` (in the owner's `Code` folder; renaming it would break the worktrees, the code graph paths and Claude's memory folder; do it only between sessions, on purpose). It's free, open-source and a student project, the same pattern as PlanetTerp and Jupiterp, so trademark risk is low. Backup: "Scute". **The project will never make money** (owner, 2026-09-24): no ads and no paid tier (donations allowed, only to cover running costs: owner 2026-09-26), so the Trademarks email is optional, and Reddit, PlanetTerp and Libraries/DOTS data requests stay non-commercial.
- **No lawyer review** (owner, 2026-09-24): a disclaimer is enough; Claude drafts plain-language disclaimer, terms and privacy text. Team: solo owner + Claude.
- **Every major must work**, not only CS. Every minor, specialization and special program with course requirements must also be included: Honors College LLPs, Gemstone, College Park Scholars, CIVICUS, other LLPs, citations, certificates, notations, departmental honors, combined BS/MS, ROTC, and **every pre-professional track with its requirements** (pre-med, pre-law, pre-dental, pre-PA, pre-vet, pre-pharmacy, pre-nursing, and others; see module 1).
- **No student-correction button or review queue.** Requirement data is verified before launch by comparing each program with its department's requirements page (owner, 2026-09-26: the owner decides only flagged items; the review tool was dropped). No 🧪 labels in production. After launch, a support email is fine.
- **Seat alerts were NOT requested by the owner.** Claude suggested them. They're treated as an investigation spike only.
- **The UI must be incredibly sleek and easy to understand, Apple-style quality.** 4-year plan grid styled like the UMD CS 4-year plan, but with lighter, friendlier colors.
- Grade upload is wanted so the LLM can give personalized course-selection feedback.
- Dining hall menus, library hours, all RecWell gym schedules, and booking any study room at any library are all wanted.
- Shuttle-UM bus schedules are wanted, with the Transit app as the design inspiration.
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
5. Compare with the department's requirements page (department page wins); the owner decides only flagged items.
6. Re-scrape the catalog each year and diff the changes.

Scale: about 200–300+ programs, roughly 200–300 hours of owner review. Launching in waves by college is an open option.

## 7. Tech stack
See the package.json files: Next.js web app (apps/web), TypeScript packages, HiGHS for the audit. Decisions behind the stack are in section 13.

## 8. UI / design
- **Principles:** show the answer, not the data; one main action per screen; plain language (e.g. "Humanities (DSHU)"); color only when it means something (white and gray, one accent, a pastel for each requirement category); an instant feel (cached data, skeleton loading, springs, haptics); accessibility (Dynamic Type, VoiceOver, dark mode, AA contrast).
- **Navigation (owner decision, 2026-09-24):** THREE main tabs: **Campus · Schedule · Advisor**.
  - **Campus** has a sub-nav: Dining · Transit (Shuttle-UM) · Libraries (hours + study rooms) · Gyms.
  - **Schedule**: the schedule builder, plus course and professor info (replaces the old Explore idea).
  - **Advisor**: the 4-year plan / degree audit plus LLM advising.
  - **Today** summary is the home page (`/`), reached from the TurboTerp logo; it's not a tab.
- **Onboarding** in under 60 seconds: major and year → transcript → audit.
- Don't use Testudo or UMD logos. **Logo (owner pick, 2026-10-04):** a small solid white terrapin in profile, mid-stride, with three speed lines, on the red tile (`apps/web/app/icon.svg`, `lib/logo.ts`). The owner rejected detailed top-down terrapins (scutes, rings, diamonds, claws, speckles, eyes): keep it minimal.
- The website gets a desktop layout, not a stretched phone app.

## 9. Phases and time estimate
Moved to `docs/project/roadmap.md` (phases 0–6, MVP recommendation, estimates, launch schedule).

## 9b. First-draft plan (owner-approved 2026-09-27)
`docs/project/first-draft-plan.md` is the build order to the first draft: MVP scope (Campus, Schedule, Advisor audit/planner, transcript import, what-if, section recommendations; no reviews, LLM advisor, optimizer or iOS), all ~270 programs encoded, deployed on Vercel + Supabase. Waves: 0 in-flight → 1 program infrastructure → 2 program batches by college → 3 MVP gaps → 4 deployment. Queue follows it.

## 10. Open to-dos and questions
- [ ] Optional: a courtesy email to UMD Trademarks & Licensing (required only if the project makes money).
- [ ] Email UMD Libraries requesting LibCal API credentials.
- [ ] Email UMD DOTS requesting Shuttle-UM real-time data access (a Swiftly GTFS-RT key).
- [ ] Claim a domain (turboterp.com was unregistered on 2026-10-04, per Verisign RDAP), the App Store name and social handles.
- [ ] Decide whether to reuse or partner with Jupiterp (open source; check license).
- [ ] Confirm Expo's native-component support (for the later iOS app).
- [ ] Decide: launch everything at once, or in waves by college.
- [ ] Before making the repo public: scrub personal details from PROJECT_MEMORY.md (owner's program plans, personal notes) and review git history.

## 11. Legal and trust notes
Moved to `docs/project/legal.md`. Read it before building the disclaimer, accounts, exports or scrapers. The essentials: the 4-year plan / audit needs a typed-name clickwrap agreement first (so the planner needs a umd.edu account); every audit result cites its catalog rule and year; no UMD marks and "Not affiliated with the University of Maryland" everywhere; never ask for or store Testudo credentials; scrape politely.

## 13. Build decisions (owner, 2026-09-24): locked for the start
- **Platform:** website first. Next.js installable web app (PWA). The rules engine, scrapers and data are separate packages, so an iOS app can reuse them later.
- **Repo:** github.com/ghipszer20/turboterp (renamed from `superterp` 2026-10-04; GitHub redirects the old URL). The plan was private until launch, but the repo was found PUBLIC on 2026-10-04 (owner to confirm). License **Apache-2.0**. Local: the `Code/SuperTerp` folder in the owner's user folder (never write the Windows user folder name into tracked files: owner, 2026-10-04). Git uses HTTPS with the gh credential helper (no SSH host key in this shell).
- **Hosting:** free tiers only. Vercel (web), Supabase (DB and auth). The owner creates the accounts when deployment needs them. **No GitHub Actions** (owner, 2026-09-28): it stopped running jobs because of billing, and the owner doesn't need it, so the CI workflow is disabled. Where the scheduled scrapers run is decided at deployment (Vercel Cron, Supabase scheduled functions, or Actions once the repo is public).
- **Workflow (updated 2026-09-24):** NO PR reviews. Claude works autonomously on long-running branches with draft PRs; the owner merges whenever they like, without reviewing (Claude can never push or merge to main). Check in with the owner ONLY for: (1) any **major UI change**, which the owner must approve (show screenshots or a local preview first); (2) design or functionality changes the owner wants; (3) problems or blockers; (4) something turning out infeasible; (5) a good new idea. Everything else: decide, note the assumption, keep going. PRs still explain web-specific choices, since the owner knows Python and less web.
- **Design:** Apple-style design system, approved visually by the owner. Accent **`#BA0C2F`** ((PRODUCT)RED, owner approved 2026-09-24): full strength only on buttons, active tabs and highlights; pale tints for backgrounds; brighter in dark mode. Soft whites and grays, light and dark mode.
- **Owner profile:** Math major, CS minor. **First verification target: Math + CS double major.** Also build a Math + CS double-degree test student.
- **Transcript:** the owner will provide their unofficial transcript during the Phase 2 parser work. It stays local only and is never committed (gitignored).
- **Tooling on the owner's PC:** git, gh (logged in as ghipszer20), Node 24, npm, Python 3.13 via `py` (no `python` or `python3` on PATH), no Docker (so use hosted Supabase, not local).

## 14. Current state (replace in place, never append; dated narrative goes in `docs/project/status-log.md`)
- **Branches:** PRs #1 and #2 were merged into main on 2026-09-25; `feat/course-data` is the working branch (420+ commits ahead of main, no open PR). No CI; the full local suite was green at the owner-notes merge on 2026-09-29.
- **Built** (full list in `docs/project/built.md`; all unverified by the owner unless noted): About page; Campus tab (dining, libraries, study rooms, gyms, Transport map + trip planner); Schedule builder linked to the 4-year plan; Advisor tab (disclaimer, setup, credit caps, What-if, AP/IB credit, plan grid, checks, audit, transcript import, grad courses, 22 pre-professional tracks, college intro layer, 4-year plan export PDF/Excel); ~417 programs in the registry. Logged skips: AI major (unpublished), Individual Studies, Global Studies (umbrella).
- **Done 2026-09-29 (owner-notes session; detail in the status log):** UI review folder (`npm run ui-gallery -w @turboterp/web` → gitignored `ui-review/`); workload-based semester difficulty; takeout replaced by a plain plan export; overlaps block saving (no conflict styling); color-only gallery blocks + gallery walk line; phone Advisor header; "Why import?" note; college intro courses (audit layer for CMNS/ARHU/SPHL, first fall of major plans, `entry` + transfer checkbox); new-tracks research (`docs/project/new-tracks-research.md`).
- **Done 2026-10-02 (main session):** snapshot script retries and refuses to save a partial term; `Requirement.advisorMayApprove` shows "other courses may count with advisor approval" on unmet audit rows (45 requirements in 30 program files); stale roadmap to-dos removed.
- **Wave 4 in progress (2026-10-04; detail in the status log):** Vercel project `turboterp` and Supabase project `turboterp` (us-east-1) exist; keys live only in the gitignored `apps/web/.env.local` and in Vercel env vars. Merged: Supabase snapshot store, terpmail-only magic-link sign-in. Live at turboterp.com since 2026-10-04 (first deploy went to production); `--prod` deploys only with the owner's go. The owner runs `npx vercel deploy` (blocked for Claude). Live: scheduled refresh (Supabase cron every 3 minutes and daily), Stamp dining. **Left:** Supabase Auth URL settings and custom SMTP (built-in mail is limited to a few messages an hour); plan and agreement sync with a confirmed delete (on hold: the owner asked why the Advisor needs an account); records email; acceptance run; the owner requests in roadmap "Known to-dos". Before going public again: fresh repo or history rewrite (owner's name and terpmail are in old commits). 22 tracks now (8 added 2026-09-29, all unverified; owner-review lists the numbers to confirm). Reuse `.claude/worktrees/merge-s1` for merges.
- **Waiting on the owner:** see `docs/project/owner-review.md` (include it in every progress report; add new items there).
- **Known to-dos:** see `docs/project/roadmap.md` "Known to-dos" (add new ones there).

## 15. Working notes for Claude
Shell and tooling gotchas (Git Bash path rewriting, never kill Node by image name, ui-check for screenshots, Next 16 docs, long worktree paths): `docs/project/working-notes.md`. Read it before running shell-heavy work.

## 16. Overtime mode (owner, 2026-09-24/25; renamed from "overnight mode" 2026-09-25)
- **Activation:** only when the owner says to turn on overtime mode (any time of day). **Only** the owner's next message (usually "progress report") or the project being finished ends it. When it's off, work normally and check in as usual. The owner turns it on repeatedly until the project is complete.
- **While active, never ask the owner for anything:** no approval requests, no clarifying questions, no waiting. Keep building continuously.
- **"Progress report":** a concise report of everything done since the last report, decisions made (with assumptions), and items for the owner to review.
- **UI changes:** build major UI changes anyway (separate branch/PR when practical, with `npm run ui-check` screenshots) and list them in the progress report for approval after the fact.
- Unclear choices: pick the most reasonable option, record the assumption, keep going. Brainstorming questions go into the progress report.
- Commit and push often to feature branches (never main). Keep section 14 and `docs/project/status-log.md` current so nothing is lost if context is summarized.
- **Usage limits (owner, 2026-09-26):** follow the builder budget in section 18. Start each overtime run in a fresh main session that reads this file, rather than continuing a long session. If a limit stops work, record in section 14 and the status log which builders were running and what they had pushed, so the next run can resume.

## 17. Owner rulings (cross-cutting only; full text in `docs/project/rulings.md`)
Feature-specific rulings (schedule builder design, plan checker, tracks, campus pages, theme, AP/IB credit, pre-warmed data, grade distributions) live only in `docs/project/rulings.md`. Read the relevant part before designing or reviewing that feature, and quote it in builder briefs. New feature rulings go there; only rulings that apply to all work go here.
Code comments that cite "PROJECT_MEMORY section 17" (e.g. "open question 1") refer to the same text, now in `docs/project/rulings.md`.
- **Superpowers TDD applies strictly** (owner, 2026-09-25), including deleting code written before a failing test and redoing it test-first. Exception: code written before the superpowers plugin was installed (e.g. the SOC course parser) is kept and fixed. Outside that rule, don't rebuild working code unless absolutely necessary; fix it first.
- **Scale:** the site must support thousands of simultaneous users. Heavy work (schedule generation) runs in the browser; campus and course data are pre-built, CDN-cached snapshots; servers do no per-request scraping.
- **Degree rules confirmed by the owner:** CMSC141 counts for CMSC131 and CMSC142 for CMSC132. CS gateway: Fall 2024+ entrants need B- in gateway courses and a 3.0 GPA, earlier entrants C- and 2.7. The owner is in Math **Applied** (verification target: Math Applied + CS; Traditional is the default track); C- minimum for Math major courses; CMSC131 may count for both the programming requirement and Sequence Four. A course may be retaken only after an F or a W.
- **Deleting something important takes two taps** (owner, 2026-10-04): a confirmation first, worded "Are you sure you want to delete ...?" and naming what is deleted (account data, a saved plan, a term with courses). Small, easily redone removals (one course, one filter) stay one tap.
- **Verification is local only** (owner, 2026-09-28; GitHub Actions CI disabled): the full test, typecheck, lint and build run locally after every merge into the working branch. The web `typecheck` script runs `next typegen` first.

## 18. How work is split (owner rules 2026-09-25/26/27; token rules 2026-09-28)
- **Ask the owner before starting any subagent** (owner, 2026-09-27): name the task, model and branch and wait for a yes. Not in overtime mode: there, dispatch without asking (section 16).
- **Builders do real tasks; the main session does tiny edits itself** (owner, 2026-09-28). A tiny edit (about 20 lines or less, in files already known: a rename, a one-line fix, wording) is done directly by the main session, since a builder's brief, startup and review cost more than the edit. Everything else goes to a builder in its own worktree and branch, test-first, pushing to its branch.
- **The main session talks with the owner, reviews and merges.** Review = read the diff, check screenshots for UI work, check the work against this file and `docs/project/rulings.md`, merge into the working branch, push, then run `graphify update .` (free, no LLM).
- **Main session model (owner, 2026-09-28):** Sonnet by default; the owner switches to Opus (`/model`) for design discussions and tricky reviews (e.g. audit-engine semantics). `/clear` between groups of work, after updating section 14, so history doesn't pile up.
- **Verification:** the builder runs the full suite (tests, typecheck, lint, build) once on its branch; the main session runs it again after each merge, before pushing (no CI).
- **Builder budget** (overrides superpowers subagent-driven-development / dispatching-parallel-agents defaults and CLAUDE.md where they conflict). Target: **under 100k tokens per builder**; record each builder's reported tokens in the status log.
  - **Model:** Sonnet (`model: sonnet`); Haiku for trivial tasks the main session doesn't do itself; Opus only for hard reasoning (note why in the status log).
  - **One agent per task, at most 2 at once.** No reviewer, advisor or second-opinion subagents or passes. Queue the rest; critical-path work first.
  - **One feature or one program per brief.** Never bundle unrelated fixes. Program work: one program per builder, or at most 3 small minors from one department (owner, 2026-09-28; batches of 5–14 programs cost 200–400k tokens because every fetched page stays in context).
  - **No research inside builders (owner, 2026-09-28).** Program sources (catalog page, department page, sample plan) are fetched beforehand by the source-fetch script (queue item 1) into `program-sources/<program>.md` as trimmed text; PDFs are converted to text, never read as documents. Builders don't use WebFetch or read PDFs; if a source is missing or unclear, they stop and report it. Briefs name the source file, the catalog drafter's output as the starting point, and one already-encoded program as the pattern to copy.
  - **Tool-call cap: about 40 per builder.** At the cap: commit, push, and report what's done and what's left.
  - **Short briefs (20–40 lines):** goal, files involved, the owner rulings that apply (quoted from `docs/project/rulings.md`), done criteria, branch name. Builders don't read this file (CLAUDE.md); they read other `docs/project/` files only when the brief points to them.
  - **Put these in every brief:** quiet output (only the touched package's tests with `-- --reporter=dot` while iterating, long output through `tail -n 30`, the full test/typecheck/lint/build once at the end, report only pass/fail and failures); at most 2 screenshots, of changed pages only, each taken once; don't re-read unchanged files; navigate with the graphify graph (`graphify query/explain/affected --graph "$(git rev-parse --git-common-dir)/../graphify-out/graph.json"`), then read only files being changed; don't regenerate course sets or rewrite registry-wide tests (the main session regenerates once after merging).
  - **Resume, don't restart.** Before dispatching, run `git worktree list`; continue an existing worktree or branch for the task, after checking its CLAUDE.md is current (old ones imported all of this file into every request).
  - **Push early:** after the first passing test and at each green step, so a stopped builder leaves recoverable work.
  - **Fixed starting cost:** measured 2026-09-28 at 44.5k tokens per builder (status log).
- **Keep this file small (owner, 2026-09-26).** The main session carries it in every request. Keep it under ~20 KB: section 14 is replaced in place, never appended to; dated history goes to `docs/project/status-log.md`; feature rulings to `docs/project/rulings.md`; detail to `docs/project/`. If it grows past ~20 KB, move content out before continuing.
