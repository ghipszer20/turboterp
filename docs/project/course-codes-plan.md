# Program course codes cleanup: plan

> For builders: each task below is one brief. Work test-first in your own worktree and branch, push early. Builder budget: PROJECT_MEMORY §18 (Sonnet, one agent per task, at most 2 at once, no reviewer subagents).

**Goal:** every course code a program requirement names resolves to a real course in the Advisor catalog, so no requirement option is one a student can never satisfy.

**Depends on:** `feat/catalog-fallback` (dispatched 2026-10-29). It adds the UMD Academic Catalog (`packages/course-data/.cache/catalog-courses.json`) under the Testudo snapshots in the Advisor catalog, and writes `docs/project/unknown-courses.md`: course ids used in program requirements that are in neither source, by program, with hints (Formerly twin, suffix-stripped base code). That report is this plan's work list. Nothing here starts until that branch is merged.

**Size (`feat/catalog-fallback` merged 2026-10-29, `379c7fcc`):** 3,666 distinct course ids in 417 programs; 1,040 were missing from the Advisor catalog, 502 are now covered by the Academic Catalog fallback, 538 are left (`docs/project/unknown-courses.md`; per-program lines: 94 with a Formerly hint, 341 with a suffix-base hint). Three kinds:

| Kind | Example | Already credited by the audit? | Fix |
|---|---|---|---|
| A. Old "Formerly" code | AASP100 → AAAS100 | Yes: `namedCodes` in `packages/audit/src/audit.ts` matches a requirement's old code against the new course's Renumbered Twins. But the planner shows the old code with no title or credits. | Replace with the new code (Task 1) |
| B. Topic code with a letter suffix | BIOE489G, PSYC489G, MUSP119B | No: not in either catalog (the catalog lists only the base course) | Catalog entry built from the base course (Task 2) |
| C. Unknown: typo, retired with no successor, or new | HCAI100, PSYC465? | No | Program-by-program check against `program-sources/` (Tasks 3+) |

## Rulings that apply (quote in every brief)
- Department page beats the catalog; flagged readings are settled from UMD's published sources, never by asking the owner. Where sources conflict or are silent, take the reading that cannot mark a requirement met wrongly and flag it (`advisorMayApprove` or a note) (owner, 2026-10-04).
- "Formerly" numbers count only where a requirement names the course; cross-listed courses count under every code; "credit only granted for" twins never (owner, 2026-10-07).
- Posted alternatives only: unposted advisor exceptions are a dead end (owner, 2026-10-07).
- No research inside builders: no WebFetch, no PDFs. If `program-sources/<program>.md` is missing or doesn't settle a code, leave the code, add a `reviewNotes` line, list it in the report.
- Don't regenerate course sets or rewrite registry-wide tests (the main session regenerates once after merging).

## Task 1: Replace old Formerly codes (one builder, all programs)
Mechanical: the source is Testudo's own "Formerly" line, so no program pages need reading.
- Test first: a registry-wide check (`packages/audit/test/`, next to existing registry tests) that no requirement names a code that is some catalog course's Renumbered Twin, with an allowlist for codes kept on purpose. Red before the edits.
- Write a one-off codemod script (`packages/audit/scripts/replace-formerly.ts`) that reads the twins from the catalog and rewrites program files. Where the new code is already listed next to the old one, drop the old one rather than duplicating. Run it, review the diff by hand, keep the script for future renumberings.
- Skip and report any old code whose new code is already a different option in the same requirement with a different meaning (e.g. a requirement listing both as separate picks).
- Done: the check is green, the report lists every program touched, the full suite passes.

## Task 2: Topic codes with a suffix (one builder, code change, no program edits)
A department naming `BIOE489G` means that specific topic, which is real but not offered in the cached terms. Program files stay as written.
- Test first, in `packages/plan` next to the fallback tests: a code `XXXX489G` whose base `XXXX489` is in the catalog (snapshot or catalog file) and that isn't itself present gets an entry with the base course's credits, no Gen Eds (topic Gen Eds vary, so claiming none can't mark a Gen Ed met wrongly), title `"<base title> (topic <suffix>)"`, `notScheduled: true`. A suffix code that is in a snapshot keeps its snapshot data. Only codes that program files name get entries (pass the set in), so the catalog doesn't grow by every possible suffix.
- Wire it into `apps/web/scripts/advisor-data.mts` after the catalog fallback.
- Done: rerun the unknown-courses report; kind B drops to the codes whose base course is also unknown (those join Task 3+).

## Tasks 3+: Unknown codes, by college (several builders)
After Tasks 1 and 2 merge, rerun the report. Each brief gets one batch: the programs and their unknown codes, copied from the report.
- For each code, read `program-sources/<program>.md` and decide one of:
  1. **Typo:** the page shows a different code (e.g. a transposed digit) → fix it.
  2. **Renamed without a Formerly line:** the page names a current course in that slot → use the page's code.
  3. **Gone:** the page no longer lists it → remove the option. If that empties a requirement or changes its count, stop on that requirement and report it (that is a requirement change, not a code fix).
  4. **Real but unscheduled and uncatalogued** (e.g. a course for a program starting later) → keep it, add a `reviewNotes` line.
  5. **Not settled by the source** → keep it, `reviewNotes`, list it in the report.
- Test first: one test per program touched, asserting the fixed requirement accepts the corrected code (pattern: that program's existing test file).
- Batches are split by college from the report, about 40 unknown codes or about 10 programs per builder, whichever comes first (the largest clusters in the scan were MUSP, PSYC, AASP, BSCI, GEOG, RUSS).
- Done per batch: every code in the batch is fixed or listed with a reason; the full suite passes.

## Final step (main session)
Rerun `unknown-courses` and the equivalence audit; regenerate course sets once; full suite, typecheck, lint, build; update `docs/project/unknown-courses.md`. Add to roadmap "Known to-dos": rerun `unknown-courses` after every catalog refresh. The next production deploy needs `advisor-data` rebuilt in the main checkout (the catalog cache is gitignored).

## Sessions
- **Session 1 (this one):** review and merge `feat/catalog-fallback`, then dispatch Tasks 1 and 2 in parallel (different files: program files vs `packages/plan` + advisor-data). Review and merge both, rerun the report, write the Task 3+ batch list into this file.
- **Session 2 onward (fresh session per §16, or overtime):** Tasks 3+ two builders at a time, then the final step. Starting fresh keeps the program-file diffs out of a long context.
