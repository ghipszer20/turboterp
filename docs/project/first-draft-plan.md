# TurboTerp: plan to the first draft (MVP, deployed)

## Context
The owner asked for a plan covering everything from now until the first draft of the project. Scope agreed on 2026-09-27:
- **MVP only:** Campus tab, schedule builder, Advisor (audit + 4-year planner), transcript import, what-if, and section recommendations. No reviews, LLM advisor, optimizer or iOS in the first draft.
- **All ~270 programs encoded:** every major, minor and certificate, checked against its department page. Owner verification comes after the draft.
- **Deployed:** Vercel + Supabase, with umd.edu sign-in (legal.md: the planner needs a typed-name clickwrap tied to a umd.edu account).

Already built (docs/project/built.md): the Campus tab (dining, libraries, study rooms, gyms, buses/transport map, trip planner), the schedule builder linked to the plan, and an Advisor with disclaimer, setup, credit caps, what-if, AP/IB/dual credit, plan grid, checks, audit and 14 tracks. Programs encoded so far: CS, Math Traditional, Math Applied, Gen Ed and 61 special programs. `apps/web/lib/advisor/programs.ts` hard-codes only the 4 core programs; the other ~267 are partial catalog drafts (`packages/catalog`, 66% of rule rows drafted).

## How work runs (unchanged rules)
- One Sonnet builder per task, in its own worktree and branch off `feat/course-data`, test-first, briefs of 20–40 lines (PROJECT_MEMORY section 18). At most 2 builders at once. Outside overtime mode, **ask the owner before starting each builder**.
- The main session reviews each diff and its screenshots, merges into `feat/course-data`, and CI checks the result. Major UI changes need owner approval.
- Use Opus for a builder only when the task needs new audit-engine semantics (marked ⚙ below).

## Wave 0: finish what's in flight (now)
1. **Transcript import** (`feat/transcript-import`, running before plan mode paused it). Its builder wrote a plan (`~/.claude/plans/lexical-coalescing-fairy-agent-a9d85cc0c5778b5f0.md`): pure parser modules, self-hosted tesseract.js (~4 MB, lazy-loaded from `/vendor/tesseract/`, the same way `copy-maplibre-worker.mjs` self-hosts the map worker), and an "Import transcript" button in the plan view. Resume it once this plan is approved.
2. **Trip dropdown fix** (`feat/trip-planner-2`). Plan: a `clipNone` prop on `Card` (`components/ui.tsx`, `ui.module.css`), used only by `TripPlanner.tsx`. Resume it.
3. **Older AP chart:** resolved 2026-09-27; the pre-May-2023 policy is identical to the current chart, so no work is needed (rulings.md).

## Wave 1: program infrastructure (before the program batches)
4. **Program registry:** merged 2026-09-27 (`packages/programs`: registry + lazy loaders, `ProgramPicker.tsx`, sample-plan harness `src/harness.ts`, guide `docs/project/program-batches.md`). No official CS sample plan exists; the CS plan file comes from the department's tracking sheet (`official: false`).
4b. ✅ **Registry follow-ups** (merged 2026-09-27) (from the registry review, before batches grow): the double-major notice audits the plan against every unchosen major (about 100 audits per analysis at full scale); pre-filter candidates cheaply (e.g. majors whose required courses the plan already mostly covers) and cap the count. Fix "No major chosen" showing when only a minor is picked. Small Sonnet task.
5. ✅ **Multi-program rules** ⚙ (merged 2026-09-27, follow-up merged) (the builder checks the engine first and adds only what's missing): double degree (150 credits, 18 credits unique to each degree), sharing limits (`max_shared_with`), the declaration-deadline warning, adding or dropping a minor showing freed credits.
6. ✅ **Grad courses as an undergrad:** courses 600–897 (not 799) can be planned, each with a "needs advisor permission" warning (owner ruling 2026-09-27). Also: credit tags (undergrad / graduate-only up to 9 credits / double-counted in a BS/MS), a badge on the plan grid, and the BS/MS 35% double-count cap with B- or better.
7. **Honors retry** (fresh worktree): the 4 unreachable Departmental Honors sites, with URLs in roadmap Queue notes.
8. **CS specializations:** Cybersecurity, Data Science, Machine Learning, Quantum (owner-review CS item e).

## Wave 2: program batches (the biggest chunk)
One builder per batch, run 2 at a time, in order: **CMNS → ENGR → BSOS → ARHU → BMGT → AGNR → SPHL → INFO → EDUC → JOUR → ARCH → PLCY → UGST/other.** Split CMNS, ARHU and BSOS into 2–3 batches of about 10–15 programs each.
- Per program: start from the catalog draft, fill the gaps from the department's requirements page (the department page wins), and run the validation harness (official plan passes, broken plans fail). Anything that can't be decided goes into `docs/project/owner-review.md` as a flag. No 🧪 labels in production.
- Each batch adds its programs to the registry and a line to the status log.
- Estimate: about 20 batches × 1 builder session each.

## Wave 3: MVP feature gaps
9. **Section recommendations** (roadmap Phase 3 MVP piece): for a planned term, suggest sections ranked by grade distribution / professor rating / open seats and the workday filters, reusing the builder's generator.
10. **Schedule builder leftovers:** `.ics` export, share link, walking time between buildings, and class-aware "leave by" times on Transport (feature modules 3 and 9).
11. **Grades in the audit:** imported grades checked against minimum-grade and GPA rules, including science GPA (BCPM) on track cards. Also the CS ULC 1.7 GPA. The builder checks what already exists first.
11b. **Advising export** (owner ruling 2026-09-27): 4-year plan as a formatted `.xlsx` that opens in Google Sheets, plus a PDF "advising takeout" (plan, audit with citations, flags, prior credit, tracks), generated in the browser. No "questions for my advisor" box.
11c. **Registration prep + academic deadlines** (owner approved 2026-09-27). When the next term's Schedule of Classes is published, turn the plan's next term into a ready-to-register checklist: chosen sections with backups if a section is full, open seats, the student's registration appointment (entered by hand) with a reminder, and "advising required first" and hold reminders. Add key dates from the UMD academic calendar to Today and the plan: registration opens, schedule adjustment, the last day to drop or take a W, the pass/fail deadline, applying to graduate, and finals. About 2 builder tasks (calendar data + scraper, registration-prep view).
11d. **Semester difficulty** (owner ruling 2026-09-27, rulings.md): each planned term gets a difficulty score out of 10, personalized by the student's transcript (grades vs PlanetTerp course averages by subject area) plus course difficulty (average GPA, W/F rate) and credit load, with one short sentence on why (no bullet points). Builds on item 11's imported grades; uses `packages/ratings`. One Sonnet task.
12. **Owner's test students:** a sophomore major switch, a double major, a double degree, a BS/MS student, a dropped minor, and Math Applied + CS as both a double major and a double degree. Kept as fixtures, and all must pass.

## Wave 4: deployment (the owner creates the Vercel and Supabase accounts when this wave starts)
13. **Supabase auth:** umd.edu / terpmail magic-link sign-in. Only the Advisor requires it; Campus and Schedule stay open without an account.
14. **Server storage:** plans (currently in browser storage, `lib/advisor/storage.ts`) sync to the database, with the device copy as a fallback. Signed clickwrap agreements are stored and a copy is emailed to the owner's records address (env var). Delete with a confirmation step (owner, 2026-10-04).
15. **Data pipeline:** GitHub Actions scheduled scrapers write snapshots; the CDN pre-warms them; the last good data is shown when a source is down; a GTFS expiry warning and scheduled check (the feed ends 2026-12-24).
16. **Vercel deploy** of `apps/web`, secrets in env vars, a domain (turboterp.app if still free), clickwrap terms and privacy pages (Claude drafts them; no lawyer, per ruling), "Not affiliated with UMD" on every page.
17. **Pre-public checks:** GTFS license, scrub personal details from PROJECT_MEMORY.md and the git history, Apache-2.0 LICENSE, secret scan.

## Owner inputs needed along the way
- Answer the flagged items in `owner-review.md` as batches produce them (not blocking; builders keep going).
- Vercel and Supabase accounts, the domain, and the records email address (Wave 4).
- The UI approvals already pending (schedule builder, trip planner, Transport on phones).

## Verification
- Per task: the builder runs tests, typecheck, lint and build once, plus `ui-check` screenshots (at most 2) for UI changes. The main session reviews the diff and screenshots, then CI runs on the merged branch.
- Per program batch: the validation harness passes (official plans pass, broken plans fail), and flags are logged.
- First-draft acceptance: on the deployed site, a new student signs in with umd.edu, signs the agreement, imports a transcript (text PDF, paste and OCR paths), picks any of the ~270 programs plus a minor, sees a correct audit and a 4-year plan, runs a what-if, builds a schedule with section recommendations, exports `.ics`, the `.xlsx` plan and the PDF advising takeout, and sees the registration checklist and upcoming academic deadlines. Campus pages load from pre-built snapshots. All of the owner's test students pass.
