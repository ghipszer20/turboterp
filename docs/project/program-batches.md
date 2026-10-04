# Adding programs (batch builders)

One batch = one college, 10–15 programs. For each program:

1. **Program file**: `packages/audit/programs/<id>-2026-27.ts`, exporting one `Program` (copy the shape of
   `cmsc-major-2026-27.ts`). `id` is `<subject>-major|minor|cert[-<track>]`; `source` cites the catalog page
   AND the department page with fetch date; `verified: false`; every department-vs-catalog difference goes in
   `reviewNotes`, citing both. The department page wins where they disagree (owner ruling).
2. **Registry metadata**: next to your `Program` export (say it's `export const fooMajor: Program = ...`),
   add a sibling `export const fooMajorMeta: ProgramMeta = { ... }` (the `Meta` suffix on the Program's own
   export name is how the generator pairs them; `ProgramMeta` is exported from `@turboterp/audit`, imported
   the same way you import `Program`). Fill `kind`, `college` (from the catalog URL's `colleges-schools/<slug>/`),
   `short` if the name is long, `major` + `track` only for tracks of one major, `defaultTrack: true` on
   exactly one track when the major has more than one (the registry lists it first for that major -- e.g.
   which track an undeclared-major notice offers), and `sources.catalog` / `sources.department`. `id`,
   `name`, `catalogYear` and `verified` aren't repeated here -- the generator reads them off the Program.
   Then run `npm run build:registry -w @turboterp/programs` to regenerate
   `packages/programs/src/registry.generated.ts`; `packages/programs/test/registry-generated.test.ts` fails
   if you forget. **Majors only**: also run `npm run build:course-sets -w @turboterp/programs` to regenerate
   `packages/programs/src/course-sets.generated.ts` (the double-major notice pre-filter's per-major course
   list) after adding or changing a major's requirements; `packages/programs/test/course-sets.test.ts` fails
   if you forget that one.
3. **Sample plan fixture**: `packages/programs/sample-plans/<id>.json` (see `math-major-applied.json`).
   Majors: the 4-year plan reached from https://4yearplans.umd.edu (college page, then department page),
   term by term, Gen Ed slots left out, credits listed for non-3-credit courses. Placeholder slots
   ("MATH 4**", "Supporting sequence I") are filled with real courses and each fill is written in `notes`.
   No plan published (always true for minors and certificates): build one from the department's
   requirements page, set `"official": false`, and flag it (step 5).
4. **Harness**: nothing to write. `packages/programs/test/sample-plans.test.ts` runs every fixture: the plan
   must satisfy every requirement, and for each requirement a drop mutant and a replace mutant must make
   the audit fail on that requirement. `packages/programs/test/registry.test.ts` checks your metadata
   against the loaded Program.
5. **Flags**: when a sample plan fails because the site is stale or disagrees with the department page, do
   NOT bend the encoding. Add the program and failing requirement ids to `KNOWN_FAILURES` in
   `sample-plans.test.ts`, and add one line to `docs/project/owner-review.md` naming the program, the
   requirement and both sources. Same for constructed plans and anything else the owner must decide.

Rules:

- Special programs (honors, LLPs, Scholars) stay in `packages/catalog/special-programs/`; only their
  ProgramMeta lives here.
- No 🧪 labels (or any test/debug marker) in production code or UI text. "Unverified" is the only label.
- No student-correction button; the owner decides flagged items.
- Sharing limits (`max_shared_with`): when the catalog caps overlap with other programs, set
  `maxSharedWith` on the Program, e.g. a minor's "no more than 2 courses may also count toward the
  major" is `maxSharedWith: [{ courses: 2 }]`; a credit cap is `[{ credits: 6 }]`; a cap toward
  named programs only is `[{ programs: ["cmsc-major"], courses: 0 }]`. Omitted `programs` means every
  other program; Gen Ed, university and college layers never count. The audit enforces it across all
  programs at once. Put nothing there when the catalog is silent (sharing is then unlimited).
- Run `npm test -w @turboterp/programs -- --reporter=dot` while working; the package must stay green.

## Encode what the source says, never narrower (main session, 2026-09-28)
- Never narrow a requirement (split number bands, one area's course numbers, a single example course) to make the sample plan or the mutation tests work. A narrower rule wrongly fails real students. Example: "12 PHIL courses, 4 at 3xx+, 2 at 4xx+" is one 12-course PHIL `choose` plus `overlay: true` chooses for each minimum (see `phil-major-2026-27.ts`); overlapping filters are fine.
- When the source names only one area's or one instrument's courses for a slot that applies to everyone, accept the whole department range (see the MUSP lessons in `musc-major-*`) and flag it.
- When a plan slot has no named course, fill it with a real course from the Academic Catalog's approved-course list rather than leaving a KNOWN_FAILURE.
