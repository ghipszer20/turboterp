# Lab pairs: design spec (owner-approved 2026-10-09; expanded by the owner the same day)

## Goal

Every lab UMD offers is accounted for: each one is either linked to its lecture or marked standalone
with a reason. Plan checks warn both ways:

- **Lab missing:** a lecture is planned without its lab in the same term. Example: BSCI170 is almost
  always taken with BSCI180, and a biochemistry major with AP Chemistry credit still takes CHEM146
  with CHEM177.
- **Lecture missing:** a lab is planned without its lecture in the same term, and the student has no
  prior credit for the lecture.

Owner decisions (2026-10-09):

- Warnings only. Out of scope: auto-adding labs, and listing labs in audit suggestions or auto-filled
  plans.
- "Every lab needs to be accounted for": the lab list is not limited to the current terms or to
  titles that say "Lab".
- Add the lecture-missing warning.

Courses that are no longer offered still don't become advisor catalog courses (the advisor catalog stays
the current terms). Old labs are used only to link lectures to labs, so a student who took BSCI171 with
BSCI170 gets no warning.

## What exists today

- **Corequisites UMD lists** (`CatalogCourse.corequisite`, from the Schedule of Classes text) are
  checked in `packages/plan/src/check.ts`. For example, CHEM131 requires CHEM132, so CHEM131 without
  CHEM132 is already an error.
- **DSNL lab links** (`CatalogCourse.labPair`, from "DSNL (if taken with X)") are used only for Gen
  Ed credit.
- The advisor catalog merges only the cached current terms (Fall 2026 and Spring 2027 on 2026-10-09).
  They contain 98 courses with "Lab" or "Laboratory" in the title. Only 27 of them link to a lecture
  through Testudo's text.

## 1. Where the labs come from

Measured 2026-10-09:

| Source | What it adds |
|---|---|
| Testudo Schedule of Classes, current terms (202608, 202701) | 98 lab-titled courses, plus section meeting types |
| Testudo, past terms it still serves (202501 to 202605, including winter and summer; it serves nothing before Spring 2025) | Recently offered labs, such as BSCI161 and BSCI171 |
| UMD Undergraduate Catalog "Approved Courses" (`academiccatalog.umd.edu/undergraduate/approved-courses/<dept>/`, 202 departments, 5,457 courses) | Every approved course, including those not offered recently: 85 lab-titled, 20 of them missing from the current terms (BSCI125, BSCI161, BSCI171, BSCI393, BSCI415, PHYS429, ...) |
| UMD Graduate Catalog courses (`academiccatalog.umd.edu/graduate/courses/<dept>/`, 162 departments) | Graduate labs |

Catalog course blocks have the same labeled lines as Testudo ("Prerequisite:", "Corequisite:",
"Restriction:", "Additional Information:"), so they are parsed into the same `Course` shape.

Past Testudo terms go in `packages/course-data/.cache/history/`, and the catalog courses in
`.cache/catalog-courses.json`. Nothing else reads these files, so the schedule builder and the advisor
catalog don't change.

## 2. What counts as a lab

A course is a **lab course** if either:

1. its title contains "Lab" or "Laboratory" as a word; or
2. in a Testudo term, every meeting of every section is typed "Lab" (on 2026-10-09: 176 courses,
   such as PHYS275 and PHYS276, plus art studios, dance and PE activity classes).

**Bulk rules** (`STANDALONE_RULES`) mark whole groups standalone with one reason and one source. An
example is studio art, dance, music and theatre studios, and KNES activity courses, which meet as labs
but have no lecture. A rule matches a department code, optionally with a level prefix (for example
`KNES1`). Rules apply only to courses that are labs by meeting type alone. A course with "Lab" in its
title is always classified individually.

## 3. Lecture-to-lab links

`CatalogCourse.labs?: string[]` lists a lecture's labs, current labs first. The data comes from:

1. **Derived pairs** (`src/lab-pairs.generated.ts`, written by the coverage script, committed): from
   every source in section 1. A corequisite between a lab and a non-lab course links them, in either
   direction. So does "DSNL (if taken with X)". Each derived pair records its source (term or catalog
   page).
2. **Hand-written pairs** (`LAB_PAIRS`): classified from the UMD text the coverage script collects,
   each with a `source`. For example, "Must have completed or be concurrently enrolled in ANSC101"
   pairs ANSC103 with ANSC101, and the catalog's "only when taken concurrently with X" lines pair a lab
   with X. Former labs are included, such as BSCI171 for BSCI170 and BSCI161 for
   BSCI160.
3. **Standalone** (`STANDALONE_LABS` individually, `STANDALONE_RULES` in bulk): labs with no separate
   lecture, or labs taken after the lecture rather than with it. Examples: a lab whose prerequisite
   requires the lecture to be finished first, a capstone, research, practicum or thesis lab, a
   "Topics" course, or a title that uses "Laboratory" in another sense.

`buildCatalog` fills `labs` from live Testudo text, derived pairs and hand-written pairs. The catalog
file stores it under the key `lb`.

Pairings come from UMD's published sources only, never from the owner (rulings: "The owner does not
adjudicate academic requirements"). When the text is silent or unclear, the lab is **standalone**: a
missing pair means no warning, while a wrong pair means a wrong warning.

**Section variants:** a one-letter suffix (CHEM132S, BSCI180S) counts as the lab itself.

### Coverage: every lab is accounted for

`npm run lab-coverage -w @turboterp/course-data` reads every source in section 1. It prints every lab
course that is neither linked to a lecture nor standalone. It also writes:

- `test/fixtures/lab-courses.json`: every lab course from every source, plus the courses that name
  them, with a `labOnly` flag for labs found by meeting type;
- `src/lab-pairs.generated.ts`: the derived pairs;
- `program-sources/labs.md`: the UMD text of each unclassified lab, for the builders who classify
  them.

A test requires that the fixture has no unclassified labs and that every hand-written entry has a
source. Run the script after each term refresh.

## 4. Checks (`packages/plan/src/check.ts`)

Both checks are warnings and apply to **planned** courses only. `checkPlan` already skips completed
courses, and a warning about a finished term gives the student nothing to do.

### lab-missing

A planned lecture with `labs` gets a warning when all of these are true:

- no lab (or a section variant of one) that earns credit is in the same term;
- no lab was completed with credit in an earlier term, and none is in `plan.priorCredit` (AP, IB or
  transfer, e.g. CHEM132 from AP Chemistry 5);
- the lecture's UMD corequisite doesn't already name one of its labs (that check covers it).

The warning fires even when the lab is planned in another term.

**Message:** "BSCI170 is usually taken with its lab, BSCI180, in the same term." With more than one:
"... with one of its labs, A or B, ...". `short`: "Usually taken with BSCI180".

### lecture-missing

A planned lab (any course listed in some lecture's `labs`, or a section variant of one) gets a warning
when all of these are true:

- none of its lectures that earns credit is in the same term;
- none of its lectures is in an earlier term (completed with credit, or planned; a lecture planned
  earlier already gets lab-missing, so the student doesn't get two warnings for one mistake);
- none of its lectures is in `plan.priorCredit`;
- the lab's UMD corequisite or prerequisite doesn't already name one of its lectures (those checks
  cover it).

**Message:** "BSCI180 is a lab, usually taken in the same term as its lecture, BSCI160 or BSCI170." With
one lecture: "... as its lecture, CHEM146." With more than one: "... as one of its lectures, A or B."
`short`: "Usually taken with BSCI160 or BSCI170".

For both messages, only courses in the advisor catalog are named. If none is, the message names the
first one listed.

Both warnings show where plan checks already show (Advisor checks panel, course cards). There is no new
component, but the wording is a UI change, so the owner sees a screenshot before merge.

## 5. Testing (test-first, strict TDD)

- Lab tests (title and meeting type), bulk rules, section variants, derivation from each source,
  de-duplication and ordering.
- Catalog page parser against a saved catalog page fixture.
- `lb` round-trip, and absent when empty.
- lab-missing: lab in the same term, variant, former lab, alone, other term, completed earlier, prior
  credit, failed or withdrawn lab, completed lecture, corequisite overlap, and wording for one, several
  or none in the catalog.
- lecture-missing: lecture in the same term, earlier lecture, prior credit, lab alone, variant lab,
  overlap with a prerequisite or corequisite, completed lab, and wording.
- Coverage against the committed fixture.
- After merging: `npm run advisor-data -w @turboterp/web`, then the full local test, typecheck, lint
  and build (no CI).

## 6. Work split

See `docs/project/lab-pairs-plan.md`.

## 7. Changes made during the build (2026-10-09, overtime mode)

- **Labs that follow the lecture.** UMD's current BSCI180 needs "minimum grade of C- in BSCI160 or
  BSCI170", so it comes *after* the lecture. Its predecessor BSCI171 was a same-term corequisite of
  BSCI170, which is the owner's example. Changes:
  - A lab whose prerequisite needs the lecture finished first doesn't count as a same-term lab, so
    lab-missing doesn't suggest it.
  - For DSNL, such a lab completes the lecture's lab-science credit from a later term
    (`labScience`). Before, a student taking BSCI170 and then BSCI180 never got DSNL for BSCI170.
- **Season-aware names.** Warnings name only labs or lectures a student can take that term:
  - fall or spring: on a current term's Schedule of Classes. The new `CatalogCourse.notScheduled`
    flag (key `ns`) marks courses with no current sections. BSCI171 has none in Fall 2026 or Spring
    2027, though it is still an approved course (owner: "BSCI171 is not a past course").
  - winter or summer: offered in that season. BSCI170 planned for summer names BSCI171, which ran in
    Summer 2025 and Summer 2026.
  - When no lab or lecture qualifies, there's no warning.
- **Derived corequisite pairs stay within one department.** PHYS174's corequisite MATH140 and
  ENST200's CHEM132 had made wrong pairs: every MATH140 student would have been told to add PHYS174.
  PHYS174 is now standalone, and cross-department pairs (BSCI392 with GEOL392) are hand-written.
- **Course cards show their most severe issue** (`cardNote`). Before, a "Confirm" note could hide a
  warning even though the card was already colored as a warning.
- **Final counts:** 388 lab courses: 227 covered by rules, 46 derived pairs, 22 hand-written pairs,
  and the rest standalone. 0 unclassified.
