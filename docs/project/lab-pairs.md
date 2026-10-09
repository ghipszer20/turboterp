# Lab pairs: design spec (owner-approved 2026-10-09)

## Goal

The advisor knows the lab for every UMD lecture that has one. When a student plans or takes a
lecture without its lab, the plan checks say so. Example: BSCI170 is almost always taken with
BSCI180 in the same term. A biochemistry major with AP Chemistry credit still takes CHEM146 with
CHEM177.

The owner picked only "warn if the lab is missing" (2026-10-09). Out of scope: auto-adding labs,
listing labs in audit suggestions or auto-filled plans, and recognizing discontinued labs as catalog
courses. Recognizing discontinued labs is a separate idea; BSCI171 and BSCI161 aren't in the Fall 2026
or Spring 2027 Schedule of Classes because UMD replaced them with BSCI180.

## What exists today

- **Corequisites UMD lists** (`CatalogCourse.corequisite`, from the Schedule of Classes text) are
  checked in `packages/plan/src/check.ts`. For example, CHEM131 requires CHEM132, so CHEM131 without
  CHEM132 is already an error.
- **DSNL lab links** (`CatalogCourse.labPair`, parsed by `labPairOf` in
  `packages/course-data/src/gen-ed.ts` from "DSNL (if taken with X)") are used only for Gen Ed credit
  (`labScience()` in `packages/plan/src/notices.ts`). Today there are 20 such lectures.
- **The gap:** lectures with a usual lab that UMD doesn't list as a corequisite (BSCI160, BSCI170,
  CHEM146, PHYS161 and others) get no warning, and nothing checks that every UMD lab is linked to a
  lecture.

## 1. Data: lab options for every lecture

New field on `CatalogCourse` (`packages/plan/src/catalog.ts`):

```ts
/** Labs usually taken in the same term as this lecture, current lab first, e.g. ["BSCI180", "BSCI171"]. */
labs?: string[];
```

`buildCatalog` fills it by merging three sources, removing duplicates, and putting the current lab
first:

1. **Corequisites on the Schedule of Classes:** if lecture L lists lab B as a corequisite, or lab B
   lists lecture L, then B is one of L's labs. B counts as a lab when the lab test below says so. A
   corequisite between two lectures, such as MATH with MATH, is not a lab pair.
2. **DSNL links:** `labPair.with`.
3. **Hand-written pairs:** `packages/course-data/src/lab-pairs.ts`. Each entry is
   `{ lecture, labs, source }`, where `source` is the UMD catalog or department page that states the
   pairing. Entries may name former labs, such as BSCI171 for BSCI170 and BSCI161 for BSCI160, so a
   student who took the old lab gets no warning. A lab doesn't have to be in the catalog to be listed.
   Pairings come from UMD's published sources only, never from the owner (rulings: "The owner does not
   adjudicate academic requirements").

**What counts as a lab:** a course whose title contains "Lab" or "Laboratory" as a word (124 courses in
the 2026-10-08 data).

**Catalog file:** short key `lb: string[]` in `packages/plan/src/catalog-file.ts`, written only when the
list is non-empty, and round-trip tested like `nl`.

### Coverage: every lab is accounted for

The same file also exports `standaloneLabs: { id, reason, source }[]`: lab courses with no separate
lecture. These are lab-only courses, combined lecture-and-lab courses, and research or teaching labs.

- **Script:** `npm run lab-coverage -w @turboterp/course-data` reads the cached Schedule of Classes
  snapshots. It prints every lab course that is neither some lecture's lab nor in `standaloneLabs`.
  Run it after each term refresh.
- **Test:** coverage is complete for the current snapshot fixture, and every hand-written entry has a
  non-empty `source`.

## 2. Check: lab missing (`packages/plan/src/check.ts`)

New `IssueKind` `"lab-missing"`, severity **warning**.

The check fires for a course in a term when all of these are true:

- the course has `labs`;
- the course is planned, not completed (changed 2026-10-09 while planning: `checkPlan` already skips
  completed courses, and a warning about a finished term gives the student nothing to do);
- no lab option in the same term earns credit;
- no lab option is already credited: completed in an earlier term with credit, or in
  `plan.priorCredit` (AP, IB or transfer, e.g. CHEM132 from AP Chemistry 5);
- the course's UMD corequisite doesn't already name one of its labs (the corequisite check covers
  that, so the student doesn't get two messages).

A lab planned in a later term still triggers the warning, because the warning is about taking them
together.

**Message:** "BSCI170 is usually taken with its lab, BSCI180, in the same term." With more than one
current lab: "... with one of its labs, A or B, ...". Former labs (lab options not in the catalog)
aren't named in the message. If none is current, the message names the first one listed. `short`:
"Usually taken with BSCI180".

The warning shows wherever plan checks already show (Advisor checks panel, course cards). There is no
new UI component. Wording is a UI change, so the owner sees a screenshot before merge.

## 3. Testing (test-first, strict TDD)

- `buildCatalog`: corequisite-derived labs (both directions), a lecture-to-lecture corequisite is
  ignored, DSNL-derived labs, hand-written labs, de-duplication and ordering.
- Catalog file: `lb` round-trip; absent when empty.
- Check: lab in the same term means no warning; lecture alone warns; lab in another term warns; lab
  completed earlier means no warning; lab as prior credit means no warning; withdrawn or failed lab
  warns; a failed or withdrawn lecture doesn't warn; a corequisite already naming the lab gives only
  the corequisite issue; a former lab (BSCI171) completed in the same term means no warning; the
  message wording for one lab and for two.
- Coverage test against the snapshot fixture; existing tests stay green (`lab-pairs.test.ts`,
  `check-plan.test.ts`, the test-student and owner-plan tests). If a sample plan now warns, fix the
  plan data only when the program source shows the lab; otherwise record it.
- After merging: `npm run advisor-data -w @turboterp/web`, then the full local test, typecheck, lint
  and build (no CI).

## 4. Work split (PROJECT_MEMORY section 18)

Superseded by `docs/project/lab-pairs-plan.md`: three Sonnet builders, because the code and the
classification of about 71 labs are split into separate tasks. Original split: two Sonnet builders, one after the other, each in its own worktree and branch:

- **A, `feat/lab-pairs-data`:** the `labs` field, `buildCatalog` merge, `lb` key, `lab-pairs.ts` with
  sourced pairs and standalone labs, the coverage script and test. Builders don't do research: the
  main session first runs the coverage script on the derived pairs. If labs remain unclassified, the
  main session fetches their Testudo and catalog text into `program-sources/labs.md` for the builder.
- **B, `feat/lab-missing-check`:** the `lab-missing` check and message, then one screenshot of the
  checks panel for owner approval.
