# Winter and summer courses: spec and plan (overtime mode, 2026-10-09)

Owner (2026-10-09): "there are certain courses at umd that are only offered in the winter or only
offered in the summer. I do not believe the advisor accounts for them, that needs to change." Overtime
mode is on, so the main session decided the open points below; they're listed for the owner in the
progress report.

## Problem (measured 2026-10-09)

- The advisor catalog merges only the cached current terms (Fall 2026, Spring 2027).
- Testudo terms from Spring 2025 onward are now cached under `packages/course-data/.cache/history/`
  (lab-pairs work): 202501, 202505, 202508, 202512 (Winter 2026), 202601, 202605. In them:
  - 105 courses ran only in winter;
  - 278 ran only in summer;
  - 39 ran in winter and summer but never in fall or spring.
  - In total, 493 courses offered in a recent winter or summer are missing from the advisor. Planning
    one shows "isn't in the course data", and the course has no credits, prerequisites or Gen Ed.
- Nothing tells a student that a course isn't offered in the season they planned it for. Examples:
  CMSC131 planned for Winter, or a summer-only course planned for Fall.

## Design (main-session decisions)

1. **Know the courses.** `advisor-data` merges every cached term, including `.cache/history/` (newest
   record wins, as now). The advisor's newest term (`index.json` `term`) stays the newest current term.
   History terms only add courses and offering data.
2. **Record when each course is offered.** `CatalogCourse.offered?: Season[]` lists the seasons the
   course appeared in, across the cached terms. Catalog-file key `o`: a string of season letters (`F`
   Fall, `W` Winter, `S` Spring, `U` Summer, e.g. `"U"` or `"FS"`). It's absent when the course came
   from no dated term. `buildCatalog` stays term-agnostic; a new `withOfferings(catalog, snapshots)`
   in `@turboterp/plan/catalog` adds the field from `{ term, courses }[]`. The season comes from the
   term code's month: 01 Spring, 05 Summer, 08 Fall, 12 Winter.
3. **Check** (`checkPlan`, new kind `"term-offering"`, severity **warning**, planned courses only,
   skipped when `offered` is absent):
   - **Winter- or summer-only course planned in Fall or Spring** (`offered` has no F or S):
     "ANTH221 is only offered in summer, based on UMD's recent schedules." Wording by case: "in winter",
     "in summer", "in winter and summer". `short`: "Only offered in summer".
   - **Course planned in Winter or Summer that wasn't offered in that season:**
     "CMSC131 isn't offered in winter, based on UMD's recent schedules." `short`: "Not offered in
     winter".
   - **Not checked:** fall versus spring for regular courses (a fall-only course planned in spring).
     Two years of data is thin for that, and it would add many warnings; listed as an idea for the
     owner.
4. **Keep the window current.** After each new term is published, snapshot it with `--history` (or as a
   current term), then re-run `advisor-data`. Noted in `docs/project/working-notes.md`.

## Tasks

- **Builder W (Sonnet, `feat/term-offerings`), test-first:**
  1. `withOfferings` and `seasonOfTerm` in `packages/plan/src/catalog.ts`, with tests: season
     letters, merging terms, absent when no term.
  2. Catalog-file key `o`: round-trip test, absent when empty.
  3. Check in `packages/plan/src/check.ts`, with tests: summer-only in Fall warns; summer-only in
     Summer is quiet; winter+summer wording; regular course in Winter not offered there warns; a course
     offered in Winter, planned in Winter, is quiet; fall-only course in Spring is quiet (not checked);
     no `offered` means quiet; a completed course is quiet.
     Owner's example: HLTH432 (Medical Terminology) ran in Summer 2025, Winter 2026 and Summer 2026,
     and never in fall or spring, so `offered` is `["Summer", "Winter"]` (in either order). Planned in
     Fall it warns "HLTH432 is only offered in winter and summer, based on UMD's recent schedules.";
     planned in Winter or Summer it's quiet. Add this as a test case.
  4. `apps/web/scripts/advisor-data.mts`: read `.cache/history/soc-*.json` too; apply `withOfferings`
     to every snapshot. Keep `term` as the newest non-history term.
- **Main session:** merge; run `npm run advisor-data -w @turboterp/web`, then check that a summer-only
  course (e.g. ANTH221) is in the catalog with `"o":"U"`; run the full suite; take screenshots of the
  lab and term-offering warnings for the owner.

## Built (2026-10-09)

Merged `feat/term-offerings` (Builder W, about 86k tokens). The advisor catalog now has 9,261
courses, up from 6,852; `catalog.json` is 233 KB gzipped. `withOfferings` also sets `notScheduled`
(see `lab-pairs.md` section 7). Spot checks on real data:

- HLTH432 planned in Fall: "only offered in winter and summer".
- CMSC131 planned in Winter: "isn't offered in winter".
- ANTH221: offered `U` (summer only).
