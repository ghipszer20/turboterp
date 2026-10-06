# Course equivalence: Formerly, cross-listed, credit only granted for (UMD sources)

Fetched 2026-10-06 by session B of the course-data audit. Quotes are verbatim.

## Sources
- **Repeat policy:** University of Maryland Undergraduate Student Course Repeat Policy, III-1.50(A), approved May 3,
  2019, amended March 4, 2020: https://policies.umd.edu/academic-affairs/university-of-maryland-undergraduate-student-course-repeat-policy
- **VPAC course policies:** https://www.provost.umd.edu/vpac/course-policies
- **Catalog repeat text:** https://academiccatalog.umd.edu/undergraduate/registration-academic-requirements-regulations/academic-records-regulations/

## What counts as the same course (repeat policy, section IV)
A course is considered a repeat if it is:
> - The same course with the same course number
> - The same course offered under a new number (indicated in the Schedule of Classes as "Formerly")
> - The same course offered using a cross-listed number (indicated in the Schedule of Classes as "Also offered as" or
>   "Credit only granted for")
> - A different course in which content and learning objectives overlap sufficiently with those of the original
>   course, such that course credit should not be earned for both courses

## Credit counts once
Repeat policy:
> Students earn credit for only one Attempt of a course.

When attempts carry different credits, "the highest number of earned credits will be used." The policy also says
"A maximum of 18 attempted credits may be repeated." Catalog: "they cannot be registered (after the schedule
adjustment period) for any given course more than twice."

## Cross-listed vs jointly offered (VPAC)
> Cross-listing refers to having one course offered under two or more different course prefixes, such as ENGL444 and
> WGSS444

> Cross-listed courses must have the same information (description, prerequisites, restrictions, etc.)

> Jointly-offered refers to the practice of allowing two or more independent courses to meet at the same time in the
> same location.

"Jointly offered with" (e.g. ANTH454/ANTH654) is **not** an equivalence: they are independent courses.

## Readings for TurboTerp (session B, 2026-10-06)
The sources are silent on prerequisites and on which attempt fills a degree requirement. Where they are silent, the
reading is the one that can't mark something met wrongly (owner rule, PROJECT_MEMORY section 2).

| Testudo line | Same course? | Credit | Satisfies a prerequisite naming the twin? |
|---|---|---|---|
| "Formerly: X" | Yes, the same course under a new number | Once | **Yes**: it is the same course |
| "Cross-listed with: X" / "Also offered as: X" | Yes, the same course under another prefix (VPAC: same prerequisites) | Once | **Yes** |
| "Credit only granted for: A or B" | A repeat. It may be a cross-list or only overlapping content | Once | **No**: it may be a different course, so counting it could mark a prerequisite met wrongly |
| "Jointly offered with: X" | No | Both count | No |

- **Groups are symmetric:** two courses are equivalent if either one's Testudo line names the other. Testudo lists
  aren't always complete: STAT426 says "STAT426 or CMSC320", while CMSC320 says "CMSC320, DATA320 or STAT426".
- **Which one counts:** a twin taken after the other counts once. The plan keeps the first attempt and drops the
  later one from the audit, the same as a same-number repeat. The exception is when the first attempt was an F or W:
  then both stay, and the audit can use the passing one (owner ruling, rulings.md: a course may be retaken only after an F
  or W). The plan checker warns that the later one adds no credits.
- **Requirement matching is not widened:** a requirement that names only one twin isn't changed globally. Each program
  is fixed from its department's sources (`alternatives` / options in the program file), because a department can
  treat a cross-list differently (CS: STAT426 is "credit only granted for" with CMSC320 but not a CMSC course; owner
  ruling, rulings.md "CS department-page answers").
