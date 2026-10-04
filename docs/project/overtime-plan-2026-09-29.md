# Overtime run 2026-09-29: three parallel sessions

## Context
The owner is turning on overtime mode for tonight, with **3 parallel main sessions** (down from the 5 in `docs/project/next-steps-plan.md`). The last run was cut off mid-task, and three builders stopped with work pushed but not merged:

| Branch | State at the stop | Worktree |
|---|---|---|
| `feat/advising-export` (old S5) | 7 commits. Takeout, xlsx and pdf redone test-first and green. The Export menu (ee9bf6f) predates the test-first redo. No screenshots and no full suite yet. | `.claude/worktrees/agent-ac8672cf16af2b722` (clean) |
| `feat/walk-leave-by` (old S3) | 8 commits: building codes, arrive-by, walk times, leave-by card, screenshots, and the owner's TMH coordinates. Looks complete; needs review, the full suite and a merge. | `agent-ab953ea6f717a6f9e` (clean) |
| `feat/minors-fixes` (old S1) | 1 commit (10 files): minors follow-up 1 rulings applied. Needs review, a registry regeneration and a merge. | `agent-a9d71bfb029463e13` (clean) |

`feat/credit-older-charts` is also unmerged, but first-draft-plan.md item 3 says the pre-2023 AP chart is identical to the current one, so no work is needed. It stays unmerged and goes on the cleanup list.

Still not started: eligibility gates (old S2), registration prep (old S5), test students and Wave 4 prep (old S1), plus two roadmap to-dos: GPA rules in other programs, and PlanetTerp grades in the published Advisor data. Sessions 2 (open slots, distinct areas) and 4 (grades, difficulty) are done. PROJECT_MEMORY.md is 21.9 KB, over the ~20 KB cap.

## Setup (done 2026-09-29 by the planning session, before the 3 sessions started)
1. Save this plan as `docs/project/overtime-plan-2026-09-29.md`, and point `next-steps-plan.md`'s header at it ("superseded for remaining work").
2. PROJECT_MEMORY section 14: replace the five session bullets with three (A, B, C), each pointing to the plan doc. Move the finished S2/S4/S5 detail to the status log, which brings the file back under 20 KB.
3. Commit and push to `feat/course-data`.
4. Hand the owner three kickoff lines, one per fresh session: "Turn on overtime mode. You are Session A (or B, or C) of docs/project/overtime-plan-2026-09-29.md."

## Shared rules (all three sessions)
- **Overtime (section 16):** never ask the owner anything. Dispatch builders without asking. Build UI anyway and list it for after-the-fact approval in `owner-review.md`. Record assumptions.
- **Merging:** unchanged from next-steps-plan.md "Shared rules": each session merges from its own detached worktree, runs the full local suite, follows the push-race rule, then runs `graphify update .`. Worktrees: A = `merge-s1`, B = `merge-s2` (new), C = `merge-s5`.
- **Builders:** at most 1 per session, so at most 3 at once (above section 18's 2; approving this plan approves it, same precedent as the 5-session plan). Sonnet unless marked Opus. Briefs follow section 18 (20–40 lines, quiet output, graphify navigation, ~40 tool calls, push early, include `npm install`). Record each builder's tokens in the status log.
- **Resume, don't restart:** for a stopped branch, work in its existing worktree. Merge `origin/feat/course-data` into it first and run the touched package's tests. If 20 lines or fewer are left, the main session finishes it; otherwise a builder gets a brief of "finish these items" in that worktree.
- **File ownership:**
  - A: program files plus registry regeneration, test fixtures, legal/prelaunch pages.
  - B: `packages/audit`, `harness.ts`, picker eligibility, grades data.
  - C: `apps/web/app/schedule`, `lib/schedule`, Transport/trip, advisor export, registration and calendar.
  - Cross-area edits: merge the tip first and keep them small.
- **Bookkeeping:** each session replaces only its own section-14 bullet and appends dated lines to the status log. If a limit stops work, record which builders were running and what they pushed.

## Session A: programs, integration, prelaunch
1. **Resume `feat/minors-fixes`** (main session, no builder). Review against rulings.md "Minors" and minors-plan.md follow-up 1: MATH340/341 and ASTR498 unions; C- floors for Climate Change Fluency, Computational Finance and Arts Leadership; Project Management accepts either set; advisor notes. Then regenerate the registry and course sets, merge and run the full suite.
2. **`feat/test-students`** (Sonnet): first-draft item 12. Fixtures for a sophomore major switch, a double major, a double degree, a BS/MS student, a dropped minor, and Math Applied + CS as both a double major and a double degree. All must pass. Open slots are now merged, so the fixtures tick `plan.confirmedSlots` where needed. Put them next to the sample-plan harness tests (the builder finds the spot with graphify).
3. **`feat/prelaunch`** (items 16–17, no accounts needed):
   - Main session: Apache-2.0 `LICENSE`; secret scan of the tree and the history; GTFS license check, recorded in data-sources.md; a list of the personal details to scrub (no history rewrite).
   - One Sonnet builder: plain-language clickwrap terms and privacy pages per legal.md, linked from About and the footer. UI goes on the approval list.
4. **GPA rules in other programs** (`feat/gpa-rules-<college>`, one Sonnet builder per college, the same pattern as the open-slot conversion). Starts only after Session B's task 2 merges. The main session first greps the "GPA" engine-gap notes to size each college.
5. **End of night:**
   - Once B and C mark "done for the night" in section 14, run the full suite at the tip.
   - Write the worktree cleanup list into owner-review.md: merged `agent-*` worktrees, stale merge worktrees and `feat/credit-older-charts`. Remove none.
   - Draft the progress report.

## Session B: engine and Advisor data
1. **`feat/eligibility-gates`** (Opus: new engine and picker semantics).
   - Ruling (rulings.md, "Eligibility restrictions"): "BLOCK the minor for those majors."
   - Add a program-meta field for excluded majors or tracks. The engine marks the minor blocked with the reason, the picker disables it with a one-line why, and the harness gets a mutant that checks the block.
   - Encode 2–3 examples: Astronomy, Neuroscience (not open to BSCI PHNB or NEUR), General Business (not open to business majors).
   - A follow-up Sonnet builder, `feat/eligibility-apply`, applies the gate to the rest. The list comes from grepping program reviewNotes for "not open to", "eligib" and "excluded": Chesapeake Bay, Meteorology, RAS, Economics, Paleobiology, Planetary Sciences, ACES pathways, Jewish Studies and others. Screenshot of the picker.
2. **Program-wide GPA rule** (`feat/program-gpa`, Sonnet; switch to Opus only if `minGpa` can't express it):
   - Many programs flag "2.0 GPA in major courses" as an engine gap. Check whether the requirement-level `minGpa` (added by grades-audit) can wrap a whole program. If not, add a program-level minimum GPA over the program's matched courses, test-first.
   - This unblocks Session A's task 4.
3. **`feat/grades-data`** (Sonnet; roadmap to-do): build the PlanetTerp grade summaries into `apps/web/public/data/advisor/index.json` (currently `grades: null`), so section recommendations and semester difficulty use real distributions.
   - Assumption: this needs no accounts, so it's done now rather than in Wave 4.

## Session C: schedule, exports, registration
1. **Resume `feat/walk-leave-by`** (main session):
   - Review the diff and screenshots against the session-3 brief (building-code override table, walk times in the plan editor, arrive-by in `trip.ts`, leave-by card on Transport).
   - Merge the tip in, run the full suite and merge.
   - Add the Transport leave-by card to the UI-approval list.
2. **Resume `feat/advising-export`** (builder in the existing worktree if more than 20 lines are needed):
   - Give the Export menu test coverage if it has logic; add the "Hide grades" toggle if it's missing.
   - Take 1 screenshot of the Export menu and render 1 PDF page to PNG.
   - Confirm in the build output that ExcelJS and jsPDF are lazy chunks.
   - Run the full suite and merge. Checks: the plan doc resilient-whistling-sprout.md Task 1 and the legal.md footer/citation lines.
3. **`feat/registration-prep`** (Sonnet), per resilient-whistling-sprout.md Task 3:
   - Pure `registrationChecklist` in `lib/schedule/registration.ts`, test-first.
   - `turboterp-registration` localStorage key with a round-trip test.
   - `RegistrationPanel.tsx` in the Schedule builder, with small edits to `ScheduleBuilder.tsx`.
   - Appointment reminder as an `.ics` with alarms, reusing `lib/schedule/ics.ts`, plus a countdown card on Today.
   - Screenshot; add to the approval list.
4. **Stretch:** GTFS expiry warning on Transport (the feed ends 2026-12-24; UI warning part only).

## Verification
- Every merge in every session: full local tests, typecheck, lint and build (CI is disabled), plus the push-race rule.
- Session A: one final full run at the tip after all three sessions finish.
- UI work (eligibility picker, export menu, leave-by card, registration panel, terms and privacy pages): `ui-check` screenshots, listed in owner-review.md for after-the-fact approval.
- Tomorrow's progress report: each session's merges, builder tokens, assumptions, UI to approve, and the cleanup list.
