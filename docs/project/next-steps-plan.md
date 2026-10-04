# TurboTerp next steps: 5 parallel sessions (owner-approved 2026-09-28)

> **Superseded for remaining work (2026-09-29):** the unfinished items now run as 3 sessions in `docs/project/overtime-plan-2026-09-29.md`. This file's "Shared rules" still apply.

## Context
Wave 2 (program encoding) is effectively finished. Majors A and B, minors A and B, certificates and the OCR re-checks have all merged into `origin/feat/course-data`. The registry holds about 410 programs, and the only skips are Individual Studies and CMNS AI (unpublished).

What's left before the first draft (`docs/project/first-draft-plan.md`):
- **Two engine rulings, decided but not built.** Both are confirmed absent from `packages/audit`:
  - Open slots shown as "Confirm with your advisor" with a checkbox (rulings.md). 41 program files carry `OPEN SLOT:` notes, so audits can call those programs complete when they aren't.
  - "At least N different areas" (Entomology and similar).
- **Wave 3 MVP features:** 9, 10, 11, 11b, 11c, 11d and 12.
- **Wave 4 prep** that needs no owner accounts.

**CI is down, and the owner doesn't need it (2026-09-28).** GitHub Actions stopped running jobs around 2026-09-28 23:10 with the message "recent account payments have failed or your spending limit needs to be increased". The last green run was 22:08 that day, and about 58 runs have failed since. Every merge after that is unverified. Per CLAUDE.md, verification is now local only: tests, typecheck, lint and build.

Owner request: split the next steps into **5 sessions that run in parallel**.

## Shared rules (all 5 sessions)
- **Merging.** Each session merges into `feat/course-data` only from its own detached merge worktree, `.claude/worktrees/merge-s<N>`, never from the main checkout:
  - merge without `-q` and commit at once;
  - union any doc conflicts;
  - regenerate the registry and course sets if programs changed;
  - run the **full local verification** (tests, typecheck, lint and build), because CI can't cover it;
  - if the push then loses a race: merge the new `origin/feat/course-data` (already verified by its session), regenerate the registry if programs changed, run the programs tests and typecheck, and push at once (added 2026-09-29, since a full run takes about 10 minutes and nearly always loses the race);
  - push `HEAD:feat/course-data`, retrying on races;
  - run `graphify update .`.
- **Builders:**
  - Sonnet, in `isolation: "worktree"`, one feature per brief, briefs per section 18.
  - **At most 1 builder at a time per session**, so up to 5 run at once across sessions. This exceeds section 18's "2 at once", and approving this plan approves it.
  - Approving this plan also approves the builders it names (majors-plan precedent).
- **Section 14:** each session owns one bullet in PROJECT_MEMORY section 14 and replaces only that bullet. Dated entries go to the status log.
- **Major UI changes** (in sessions 3, 4 and 5) need owner approval, with `ui-check` screenshots first.
- **File ownership, to avoid conflicts:**

  | Session | Owns |
  |---|---|
  | 1 | new or fixed program files in `packages/programs` (and registry regeneration) |
  | 2 | `packages/audit` requirement kinds, `packages/programs/src/harness.ts` and the program picker's eligibility |
  | 3 | `apps/web/app/schedule`, `lib/schedule`, `packages/course-data` and trip code |
  | 4 | grade and GPA code, and `packages/ratings` |
  | 5 | export, registration and calendar code |

  If a session needs another session's area, it merges the latest `feat/course-data` first and keeps the edit small.

## Session 1: Integration, verification, Wave 4 prep (this session)
0. Turn off GitHub Actions CI with `gh workflow disable ci.yml`. The owner said on 2026-09-28 that Actions isn't needed. Record in section 13 and section 17's CI rule that testing is local only.
1. Fast-forward the main checkout to `origin/feat/course-data`; it is 10 commits behind.
2. **Blocking for everyone.** Run the full local verification at the tip. Fix anything red before the other sessions start builders. Done 2026-09-28: all green at `83526a4` (tests, typecheck, lint and build).
3. **Wave 2 acceptance gate.** Done 2026-09-28: all 270 catalog sources were diffed against the registry.
   - **Missing:** Video Production and Documentary Filmmaking Minor (the ruling exists; the owner's table is in rulings.md), Criminology and Criminal Justice Major at Shady Grove, and Biological Sciences at Shady Grove.
   - **Logged skips:** AI major (not yet published), Individual Studies, and Global Studies (an umbrella).
   - **Unfinished minors follow-ups** (minors-plan.md "Follow-ups" 1 and 6):
     - the encoding fixes: MATH340/341 and ASTR498 unions; the C- floor for Climate Change Fluency, Computational Finance and Arts Leadership; Project Management accepts either set; the advisor-approval notes;
     - moving `ccjs-minor-shady-grove` into the USG college.
3b. **Program gaps**, Sonnet `major-builder`/`minor-builder` runs, one at a time:
   - Video Production minor (`feat/video-minor`);
   - Criminology & CJ at Shady Grove (`feat/usg-ccjs`; diff it against the College Park CCJS first, and make it a thin re-export if they match);
   - Biological Sciences at Shady Grove (`feat/usg-bsci`);
   - the minors encoding fixes plus the USG college move (`feat/minors-fixes`).
4. **Housekeeping:**
   - Rewrite section 14. Knip is already merged, OCR is done, CI is down, and the 5-session split replaces the queue.
   - Remove the stale "needs an owner UI decision" wording from the open-slots to-do in `roadmap.md`; the ruling exists.
   - Change section 18's "CI covers it" line to say local full verification is required while Actions is down.
   - Copy this plan to `docs/project/next-steps-plan.md`.
5. **Owner's test students (item 12)**, one Sonnet builder, `feat/test-students`. Build these fixtures:
   - a sophomore major switch;
   - a double major;
   - a double degree;
   - a BS/MS student;
   - a dropped minor;
   - Math Applied + CS as both a double major and a double degree.

   All must pass. Wait until session 2 merges open slots, or mark the affected assertions.
6. **Wave 4 prep that needs no accounts** (items 16 and 17), done directly or with one Sonnet builder on `feat/prelaunch`:
   - draft the clickwrap terms and privacy pages;
   - Apache-2.0 `LICENSE`;
   - secret scan;
   - GTFS license check;
   - a list of the personal details to scrub from PROJECT_MEMORY and the git history (don't rewrite the history yet).
7. **Worktree cleanup:** list the `agent-*` worktrees whose branches are merged (`git branch --merged origin/feat/course-data`) and offer to remove them. Remove none without a yes.

## Session 2: Engine rulings (⚙, Opus builders: new audit-engine semantics)
1. **Open-slot requirement kind** (`feat/open-slots`, Opus):
   - The engine adds a "confirm with your advisor" requirement that is unmet until the student ticks it.
   - The audit UI shows the slot with a checkbox. The tick is stored on the plan in `lib/advisor/storage.ts`.
   - The harness (`packages/programs/src/harness.ts`) skips its mutants.
   - UI screenshot for the owner.
2. **Convert the `OPEN SLOT:` notes** (`feat/open-slots-convert`, Sonnet, after step 1 merges). Turn each note in the 41 program files into the new kind, one college per builder run, queued.
3. **Minor eligibility gates** (`feat/eligibility-gates`, Opus; minors-plan follow-up 4): block a minor for excluded majors in the engine and the picker. Examples: Astronomy, Chesapeake Bay, Meteorology, RAS, Economics, Paleobiology, Planetary Sciences, ACES pathways, and others in the review notes.
4. **"At least N different areas" rule** (`feat/distinct-areas`, Opus). Engine rule plus harness support, then apply it to Entomology and any other program flagged with it in owner-review.md.

## Session 3: Schedule (items 9 and 10)
1. **Section recommendations** (`feat/section-recs`, Sonnet). For a planned term, rank sections by grade distribution, professor rating, open seats and the workday filters, reusing the builder's generator (`apps/web/lib/schedule`). Screenshot.
2. **Schedule leftovers**, one builder each, in sequence:
   - `.ics` export (`feat/ics-export`);
   - share link (`feat/schedule-share`);
   - walking time between buildings plus class-aware "leave by" times on Transport (`feat/walk-leave-by`, reusing `packages/campus-data/src/trip.ts`).

## Session 4: Grades and difficulty (items 11 and 11d)
1. **Grades in the audit** (`feat/grades-audit`, Sonnet):
   - Check imported grades against minimum-grade and GPA rules.
   - Show science GPA (BCPM) on track cards, and the CS ULC 1.7 GPA.
   - Check what already exists first (the CS gateway in `packages/audit/src/gateway.ts`).
   - Coordinate with session 2 before touching `packages/audit` requirement kinds.
2. **Semester difficulty** (`feat/semester-difficulty`, Sonnet, after step 1). Each term gets a score out of 10, personalized from transcript grades versus PlanetTerp averages, plus average GPA, the W/F rate and credit load, with one sentence on why (rulings.md "Semester difficulty"). Uses `packages/ratings`. Screenshot.

## Session 5: Exports, registration prep and deadlines (items 11b and 11c)
1. **Advising export** (`feat/advising-export`, Sonnet), generated in the browser (rulings.md "Advising export"):
   - a formatted `.xlsx` plan (terms as columns, category colors);
   - a PDF advising takeout (plan, audit with citations, flags, prior credit, tracks).
2. **Academic calendar data plus scraper** (`feat/academic-calendar`, Sonnet): key UMD dates shown on Today and on the plan.
3. **Registration-prep view** (`feat/registration-prep`, Sonnet, after step 2): a checklist with sections and backups, open seats, the registration appointment entered by hand with a reminder, and advising and hold reminders. Screenshot.

## After all 5
Wave 4 deployment (items 13–16) starts once the owner creates the Vercel and Supabase accounts, gives the domain and records email, and decides where the scrapers run. Item 15 (scheduled scrapers) assumed GitHub Actions. Options: Vercel Cron, Supabase scheduled functions, or Actions again once the repo is public, since public repos usually get free minutes.

## Verification
- Every merge in every session runs the full local suite: tests, typecheck, lint and build.
- Session 1 re-runs the full suite at the tip once all 5 sessions finish.
- UI features: `ui-check` screenshots, and owner approval for major changes.
- First-draft acceptance, as in `first-draft-plan.md`, after Wave 4.
