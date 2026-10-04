# Credit caps by college and term (researched 2026-09-26)

Owner ruling (`docs/project/rulings.md`, "Credit caps per term"): the cap depends on the
student's college and the term; find the official limits online and cite a source for each;
don't guess. Researched from umd.edu only: the Undergraduate Catalog's registration policy, the
Extended Studies (winter/summer) office, and each college's own advising/policy pages. Where no
college-specific statement was found, the cell says "not found" and the campus-wide default
applies in code (marked `sourceIsDefault: true`, see `packages/plan/src/credit-caps.ts`).

**Trap avoided (owner note for future readers):** several colleges advertise a lower number
(commonly 16 or 17) that is a *pre-registration* / Testudo self-service ceiling, not the actual
per-term maximum — the catalog and each college's own overload process still measure the real
term cap and dean's-exception threshold separately. Where a source clearly meant the
registration-period number, it's recorded only in Notes, not in Max. Where a college's own page
literally calls a lower number "the maximum credit limit" for the term (CMNS, ENGR), that number
is used as Max.

**Summer:** UMD's own Summer Session office (exst.umd.edu) states an explicit total (16 credits
across Session I + II) as well as the per-session limits, so the campus default's Summer Total
row is a stated figure, not a derived sum. No college overrides Summer or Winter; only Fall/Spring
have college-specific overrides (CMNS, ENGR).

## Campus-wide default (applies unless a college states otherwise)

| Term | Max | Hard cap or approval | Source | Quote |
|---|---|---|---|---|
| Fall | 20 | Approval of the student's **Advising College** above 20 (16 before the first day of classes) | [UMD Undergraduate Catalog — Registration](https://academiccatalog.umd.edu/undergraduate/registration-academic-requirements-regulations/registration/) | "Undergraduates may not exceed the following maximum credit loads without the prior approval of their Advising College: Fall and Spring: 20 credits (16 credits before the First Day of Classes)" |
| Spring | 20 | Same as Fall | Same as Fall | Same as Fall |
| Winter | 4 | **College dean's** prior approval above 4 | [UMD Extended Studies — Winter Session University Policies](https://exst.umd.edu/current-incoming-former-umd-students/winter-session/university-policies) | "Undergraduate and graduate students may register for up to four credits maximum. ... Course loads exceeding these maximums require prior approval of the college dean." |
| Summer Session I (6-week, incl. I-A/I-B) | 8 (4 for a 3-week sub-session) | College dean's prior approval above these | [UMD Extended Studies — Summer Session University Policies](https://exst.umd.edu/current-incoming-former-umd-students/summer-session/university-policies) | "Undergraduate and graduate students may register for a maximum of 16 credits total across Sessions I and II with a maximum of eight credits per six-week Session and a maximum of four credits per three-week session." |
| Summer Session II (6-week, incl. II-C/II-D) | 8 (4 for a 3-week sub-session) | Same | Same | Same |
| **Summer Total** (both sessions combined) | **16** | College dean's prior approval above 16 | Same (exst.umd.edu, stated directly, not derived) | Same quote as above |

Secondary confirmation of the Fall/Spring/Winter/Summer numbers (identical wording, campus-wide,
not college-specific): [Student Success Office — Advising Policies](https://studentsuccess.umd.edu/advising-policies)
("15 week semester: 20 credits (16 credits prior to the first day of classes)"; "6 Week Summer
Term: 8 credits"; "3 Week Term (Summer or Winter): 4 credits").

**Modeling note (owner: model summer per session only if the plan grid distinguishes sessions):**
`apps/web/lib/advisor/terms.ts` names summer terms as a single "Summer YYYY" entry — the plan
grid does not split Session I / Session II. So the code uses the stated Summer Total (16) as the
`Summer` season's cap, not a per-session figure. This is UMD's own stated total, so it is not
labeled "derived" — but it is documented here as an assumption in case the plan grid later adds
per-session terms, at which point 8/4 per session should be used instead.

## By college (undergraduate, Fall/Spring only — Winter and Summer are un-overridden; see below)

| College | Fall | Spring | Hard cap or approval | Source | Quote / notes |
|---|---|---|---|---|---|
| AGNR — Agriculture and Natural Resources | not found | not found | — | [AGNR — Policy Exception FAQs](https://agnr.umd.edu/undergraduate/current-students/academic-advising-support/exceptions-academic-policy/policy) | No page states an AGNR-specific term maximum. The FAQ describes a process to register above 17 credits (advisor support + curricular need, e.g. double major, study abroad) and says a student ineligible for that exception "can self-register for up to 19 credits on your own during the drop/add period" — a registration-process detail, not a stated term cap. Campus default (20) applies. |
| ARCH — Architecture, Planning and Preservation | not found | not found | — | [ARCH — Degree Planning](https://arch.umd.edu/student-experience/student-resources/undergraduate-advising/degree-planning) | Page only recommends 14–16 credits/semester to graduate on time; no overload or maximum-credit policy found. Campus default (20) applies. |
| ARHU — Arts and Humanities | not found | not found | — | [ARHU — Credit overload exception request](https://arhu.umd.edu/credit-overload-exceeding-number-allowable-credits-semesterterm-limit) | Page describes the Dean's Exception process for a credit overload but states no specific numeric limit itself. Campus default (20) applies. |
| BSOS — Behavioral and Social Sciences | 20 | 20 | Advising College above 20; a pre-registration step at 17 needs the advisor's sign-off first | [Feller Center (BSOS advising) — Expectations and Policies](https://fellercenter.umd.edu/academic-advising/expectations-and-policies-bsos-students) | "Students can register up to 17 credits during pre-registration and would need permission for a credit overload to register for more than 17 credits prior to the first day of class... Students can register up to 20 credits beginning the first day of classes." Confirms the campus default; 17 is a pre-registration ceiling, not the term cap. |
| BMGT — Robert H. Smith School of Business | 20 | 20 | Advising College above 20; advisor can raise the pre-registration ceiling to 17, appeal needed above that (and again above 20) | [Smith School — Undergraduate Advising Handbook](https://www.rhsmith.umd.edu/programs/undergraduate/academics/advising-handbook) | "The Registrar sets a 16 credit limit on all students until the first day of classes when the limit is automatically raised to 20. If you ask your BMGT advisor, we can raise your limit up to 17 credits. Anything beyond 17 credits would require an appeal... If you're requesting more than 20 credits: [submit a weekly schedule too]." Confirms the campus default; 16/17 are pre-registration figures. |
| CMNS — Computer, Mathematical, and Natural Sciences | **17** | **17** | CMNS's own stated term maximum; above it needs "Request a High Credit Load" (advisor support + minimum cumulative UMD GPA: 2.70 for AOSC/ASTR/GEOL/CMSC/MATH/PHYS/ENSP:GEO/IMDM, 3.00 for BSCI/CHEM/BCHM/NEUR/ENSP:BIOD/NURS; not available first semester) | [CMNS — Academic Policies](https://cmns.umd.edu/undergraduate/current-students/advising-academic-planning/academic-policies) | "CMNS Maximum credit limit: Students may take a maximum of 17 credits per fall or spring semester, 4 credits per winter semester, and 8 credits in a single summer session." (Winter/Summer here match the campus default, so only Fall/Spring are an override.) |
| EDUC — Education | not found | not found | — | education.umd.edu (no policy page found) | No credit-load or overload policy page found on the College of Education's site. Campus default (20) applies. |
| ENGR — A. James Clark School of Engineering | **18** | **18** | ENGR's own stated term maximum ("established college policy"); above it needs a Credit Overload Request approved by the Associate Dean, minimum cumulative GPA 3.0 | [Clark School of Engineering — Academic Policies](https://eng.umd.edu/services/academic-policies) | "After their first semester, students may enroll in: Up to 18 credits during the fall semester; Up to 18 credits during the spring semester... The credit limits listed above are established college policies... Students must have a GPA of 3.0 or higher to be considered for a credit overload." Incoming (first-semester) students are capped at 17 and may not petition for more. Winter (4) and Summer per-session (8) match the campus default. |
| INFO — College of Information | not found | not found | — | [INFO — Handbook, Policies & Forms](https://info.umd.edu/academics/bachelors-programs/handbook-policies-forms/) | Handbook covers major requirements and benchmark/exception policies but states no credit-load or overload maximum. Campus default (20) applies. |
| JOUR — Philip Merrill College of Journalism | not found | not found | — | [Merrill College — Bachelor's Curriculum](https://merrill.umd.edu/degrees-programs/bachelors-degree) | Page notes only that "the number of courses a student may take is limited by time and course load," without a number. No dedicated overload policy page found. Campus default (20) applies. |
| SPHL — School of Public Health | 20 | 20 | Advising College above 20 (Dean's Exception process); confirms the campus default | [SPH — Academic Policies: UMD and SPH](https://sph.umd.edu/academics/advising-resources/undergraduate-center-academic-success-and-achievement/academic-policies-umd-and-sph) | "Undergraduates may not exceed 20 credits in a 15-week semester (Fall and Spring) without permission... During summer, you may register for a maximum of 16 credits total across Sessions I and II with a maximum of eight credits per six-week session and a maximum of four credits per three-week session." Matches the campus default exactly; no SPH-specific override. |
| Undergraduate Studies (Office of Undergraduate Studies / exploratory & letters-and-sciences students) | not found | not found | — | No dedicated advising-policy page found under academiccatalog.umd.edu/undergraduate/colleges-schools/undergraduate-studies/ or a separate site | Campus default (20) applies. |

Winter and Summer are not overridden by any college found in this research (CMNS's and ENGR's own
pages restate the campus Winter/Summer numbers verbatim), so every college uses the campus
default for those two terms.

## Conditional limits noted but not modeled (owner ruling: list as assumptions, don't encode)

- **First-semester students** cannot get a high-credit-load exception at all (CMNS, ENGR, AGNR
  all say this explicitly) — TurboTerp doesn't model "which semester is this," so this isn't
  encoded; the checker just reports the flat cap for that college.
- **GPA thresholds for a CMNS/ENGR overload exception** (2.70/3.00 for CMNS by major grouping,
  3.00 for ENGR) are not modeled — TurboTerp doesn't know the student's live GPA reliably enough
  (the plan only optionally has `gpa`), and the point of `checkPlan`'s message is to tell the
  student an overage needs approval, not to pre-judge whether they'd get it.
- **Registration-period-only ceilings** (16/17-credit Testudo pre-registration limits at BSOS,
  BMGT, AGNR, and the university-wide 16-before-first-day rule) are not modeled as caps; they
  resolve to the same or a higher number once schedule adjustment starts, so they aren't a
  meaningful "the plan is over the limit" signal for a 4-year plan tool.

## "Not found" cells, summarized

AGNR, ARCH, ARHU, EDUC, INFO, JOUR, and Undergraduate Studies have no college-specific
Fall/Spring override on record; all fall back to the campus default (20/20/4/16). This was a
genuine "not found" in each case (the relevant page loaded and was read; it simply states no
override), not a fetch failure — each is cited above with the page that was checked.
