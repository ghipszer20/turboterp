# Posted course substitutions (inventory, 2026-10-07)

Owner ruling (rulings.md "Posted alternatives only"): every substitution a UMD page posts is encoded; one-off
substitutions an advisor grants that aren't posted are out of scope.

How the sweep was done: every `program-sources/*.md` sentence matching `substitut|in place of|in lieu of|may
replace|may be replaced` (65 files, about 95 unique sentences), then a second pass for `can stand in|may count
for|can be used for|accepted for|or equivalent` with a course code on both sides. Each sentence went into
one class:

- **A**: unconditional, closed list. Added as an option (`options`, `from.courses`, or a `sets` row), paired
  with its course in `alternatives` where both could otherwise count.
- **B**: allowed with approval, but the substitute isn't a fixed list. The requirement gets `advisorMayApprove`
  (the Advisor tells the student another course may count with approval).
- **C**: only for students in another program. Needs an engine gate (see "Open" below).
- **D**: already encoded, or not a course rule (overlap limits, prerequisites, placement, study-abroad caps,
  generic campus notes): skipped.

Tests: `packages/audit/test/posted-substitutions.test.ts`.

## A: encoded this sweep

| Program | Requirement | Posted sentence (short) | Change |
|---|---|---|---|
| me-major (and me-usmsm) | enme272 | "may substitute ENME 414 in place of ENME 272" | + ENME414 |
| infs-major | infs-list-a-or-b, infs-list-a-minimum | "BMGT406 (INST377 ... can substitute)" | + INST377; pairs 404/320, 406/377, 485/453 |
| intb-major | intb-electives | "BMGT485 (INST453 ... can substitute)" | + INST453, paired |
| omba-major | omba-electives | "BMGT404 (CMSC/DATA320 can substitute)", "BMGT485 (INST453 can substitute)" | + CMSC320, INST453, paired |
| fin-major | fin-select-one | "BMGT394H (formerly BMGT438A) ... approved as course substitutes" | + BMGT394H |
| ee-major | tech-elective-a | "a second Capstone Design course may be used as a substitute for the required Advanced Theory and Applications course" | Category A also accepts Category C |
| bioe-major-tracks (4) | breadth / bio-science electives | "HLSC322 can stand in place of BSCI222 as a breadth or lower level biosci elective" | + HLSC322, paired |
| anth-major-bs | supporting-coursework-bs | "For students taking BSCI160, BSCI161 may count for BSCI180" (and 170/171) | + rows 160&161, 170&171 |

## B: advisorMayApprove added this sweep

arec-major-ag-resource-econ (select-five), arab-major (both elective pools), cmsc-minor (electives: CMSC498
with permission), engl-major-creative-writing (outside workshop), gtst-minor (electives), isrl-minor
(history, middle-east), lacs-minor (experiential: approved study abroad for LACS369), math-major and
math-major-applied (eight: two outside courses for one elective), pers-major (foundation, electives),
pers-minor (language courses, electives), neur-major (track: BSCI399/PSYC489 with permission), hdev-major
(electives: EDHD489/498 at faculty invitation), educ-world-language-major (primary area), rame-major (other
consortium languages), hcai-shared (capstone may be replaced by an internship), enst majors (technical
electives; ecosystem-health concentration depth), geol earth-environmental and professional (electives),
phys majors (advanced elective: a second CMNS/Engineering major's upper-level course), span minors and
span-shared (native speakers start higher), artt advanced specialization (ARTT481: Honors Seminar),
me-major (enme202: "unless acceptable programming course credit has been earned").

## Already encoded before the sweep (D)

Business BMGT230 and CCJS200 substitute lists, CCJS calculus for MATH107/STAT100 (MATH136 per the department
page; MATH130 deliberately left out), ASTR MATH240+246 for MATH243, AERO MATH246+240/461 for MATH243, ARTT498
for ARTT479/448/438, NEUR MATH243, GLBC350, HIST396, the general-business minor's BMGT-for-BMIN courses,
business-analytics minor footnotes, physics minor (PHYS260, PHYS265 list), QSE minor elective, INAG NFSC100
(leadership certificate only, the one table that posts it), HDEV internship electives, PHYS405/407 (the
department page's "or PHYS407" covers the catalog's 406+407), BIOE BSCI330 for 331+332, ENSP BSCI161 for
BSCI180, and requirements that already carried advisorMayApprove (CHIN, CLAS, MUSC, RUSS, SURV, MSE, physics
minor).

Not encoded because they're posted only in another program's section: CMSC132/INST326 for BMGT302 and
CMSC424/INST327 for BMGT402 are posted under Information Systems, not Supply Chain or Accounting.

## C: conditional on another program (open)

These are posted but limited to students in a named program. The engine has no gate for that yet, so the
ones marked "accepted for everyone" over-accept today:

| Program | Substitute | Condition | Today |
|---|---|---|---|
| hdev-major | PSYC300 for EDHD306, PSYC200 for QMMS251 | Psychology double majors | accepted for everyone |
| hdev-major | FMSC302 for EDHD306 | Family Health double majors | not accepted |
| edhd-minor | FMSC302 for EDHD306 | Family Health majors | accepted for everyone |
| edhd-minor | PSYC300 for EDHD306 | Psychology or Neuroscience majors | accepted for everyone |
| bmgt-minors (business analytics) | ECON422/424 for BMGT430 | Economics majors | accepted for everyone |
| bmgt-minors (business analytics) | CMSC320 for BMGT404 | Computer Science majors | accepted for everyone |
| bmgt-core | MATH136 for MATH120/140 | taken for a previous major | accepted for everyone (past majors aren't recorded) |

Plan: a builder adds a per-requirement conditional substitute (course, replaces, `onlyFor` in the same shape
as `ProgramMeta.onlyOpenTo`), the web app passes the student's declared majors into `AuditOptions`, and the
rows above move onto it. MATH136's "previous major" stays as it is (unknowable from the plan).
