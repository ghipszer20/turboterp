# Sources for `@turboterp/credit`

Fetched on 2026-09-25 with TurboTerp's User-Agent. The Registrar page, the catalog page, the current AP and IB charts, and the unlinked 2024 AP chart were each downloaded once (plus one HEAD request per PDF for its `Last-Modified` date). The Transfer Course Database took five requests: the start page, the search page, the institution search twice (the first used `countryCode=USA` and returned nothing), and one institution page. The older charts and the database help page were only found as links and never fetched. No code in this package touches the network.

## Where UMD publishes it

| What | URL | Contains | Date / edition |
|---|---|---|---|
| Registrar: Prior Learning Credit | https://registrar.umd.edu/transfer-credit/prior-learning-credit | Policy summary and links to the AP, IB, A-Level and CLEP charts, grouped by exam date. The AP and IB charts are PDFs, not HTML tables. | Current page (the newest linked file was uploaded 2026-06) |
| **AP chart** ("AP Chart 2023-2026" on the page above) | https://registrar.umd.edu/sites/default/files/2023-03/ap-gen-ed.pdf | "Advanced Placement Exams (AP) for General Education (Effective for May 2023-2026 exams)". 43 exams, with required score, credits and UMD equivalency (course and Gen Ed), plus notes. 3 pages. | Exams May 2023 – May 2026. The file sits under a 2023-03 path but was last modified 2026-06-11 (HTTP `Last-Modified`). SHA-256 `e67243dd49e80ebe7908acfc0c63af00fa05feea5270e82b65c23f6e0a3dcf4e` |
| **IB chart** ("IB Chart 2023-2026") | https://registrar.umd.edu/sites/default/files/2024-07/ib-gen-ed-may-2024.pdf | "International Baccalaureate (IB) Exams for November 2023 – May 2026". 51 exams by subject, level (Standard/Higher), score, related course(s), per-course credits and per-course Gen Ed. 3 pages. | Exams Nov 2023 – May 2026. Path says 2024-07; last modified 2026-04-10. SHA-256 `685938a0471d229cb8fdb9155b24cd2ff57ae9b467fc72e931216ec53a7d3a84` |
| Academic Catalog: Prior Learning Credit | https://academiccatalog.umd.edu/undergraduate/registration-academic-requirements-regulations/prior-learning/ | Policy only, with no tables. PLC is usually capped at 60 credits (30 of them CLEP). No duplicate credit for an exam and an equivalent course. A UMD grade in a course supersedes exam credit. No credit for exams repeated or taken after matriculating. The score must meet the minimum in force when the exam was taken. | 2026-2027 Catalog |
| Transfer Course Database (Transfer Credit Services) | https://app.transfercredit.umd.edu/ (help page: https://registrar.umd.edu/transfer-credit/transfer-course-database) | Every course UMD has evaluated from other institutions: UMD equivalent, Gen Ed, footnotes, and the terms each evaluation is valid for. | Live database |

Older charts are linked from the Registrar page but not transcribed: AP May 2021–May 2022 (`/sites/default/files/2026-06/AP-Chart-May2021-May2022.pdf`), AP May 2018–May 2020 (`/sites/default/files/2023-03/ap-gen-ed-2018-2020.pdf`), IB Nov 2022–May 2023 (`/sites/default/files/2024-01/ib-gen-ed-may-2023.pdf`), and IB through May 2022 (`/sites/default/files/2023-03/ib-gen-ed.pdf`). An unlinked `/sites/default/files/2024-04/ap-gen-ed-may-2024.pdf` ("May 2023-2024 exams") is an earlier version of the current AP chart. The only differences are that it lacks Cybersecurity and Networking and says "Foreign" where the current one says "World". **No chart covers exams from May 2027 on yet**, so a student taking exams in 2027 must be checked again once UMD publishes one.

## How the data was produced

Both charts are PDFs, so the data was **transcribed by hand into typed files**; there is no parser.

- **AP**: `src/ap-2023-2026.ts`, transcribed from the PDF's text (`pdftotext -raw`). That text is saved as `test/fixtures/ap-chart-may2023-may2026.txt`. `test/charts.test.ts` checks that every row, meaning its scores, credits and equivalency text, appears word for word in that file, ignoring whitespace; that each course id appears in its own row's text; that the credits of a row's parts add up to the chart's Credits column; and that score bands don't overlap. To check a row by hand, open the PDF next to the file: the rows are in chart order.
- **IB**: `src/ib-2023-2026.ts`. The PDF's extracted text separates exam titles from their rows, so the rows were **read from the rendered page images**. The extracted text is saved as `test/fixtures/ib-chart-nov2023-may2026.txt`, The tests check every row's text and course ids against that file, and check that credits add up. For rows with a single course, the extracted text keeps the row on one line (scores, course, credits, and usually the level word), so the tests check the scores and credits of those rows too. Rows with several courses and the exam each row belongs to **cannot** be checked mechanically, because the extracted text loses that link. Check those against the PDF: exams are in chart order, and "Standard" is `SL`, "Higher" is `HL`.
- Exam names: `name` is College Board's current name for AP and the chart's exam title for IB. The chart's own spelling is kept as an alias, and lookups ignore case, punctuation, "&"/"and" and an "AP "/"IB " prefix. An IB "(All Exam Types)" language also matches its A, B and ab initio exams (e.g. "Spanish B").

### Choices made while transcribing (owner: please confirm)

1. **Per-course credit splits in the AP chart.** The AP chart gives only a total per row. Splits were taken from the IB chart, which prints per-course credits, where it could. That covers BSCI160/161/170/171 = 3/1/3/1; CHEM131/132/271 = 3/1/2; MATH140 = 4, so MATH141 = 8 − 4 = 4; GERS203/204 = 4/3; HIST200, HIST201, HIST112 and HIST113 = 3 each; FREN204 = 3, so French 5 also gets a 3-credit elective; SPAN204 = 3, SPAN207 = 3. **Not in either chart, assumed:**
   - AP Physics C: Mechanics 4/5 → PHYS161 = 3 + PHYS261 = 1.
   - AP Physics C: E&M 4/5 → PHYS260 = 3 + PHYS271 = 1.
   - AP English Literature 4/5 → ENGL278 = 3 + elective 3.
2. **Where a row's Gen Ed goes.** "CHEM 131 and CHEM 132 (DSNL)", "BSCI 160, BSCI 161 (DSNL)…" and "PHYS 161 and PHYS 261 (DSNL)" put the Gen Ed code on the lecture course only, as the IB chart does for BSCI and CHEM. For "HIST 112 and HIST 113 (DSHS)", only HIST113 gets DSHS, as in the IB chart. For "MATH 140 (FSMA and FSAR) and MATH 141", only MATH140 gets Gen Ed.
3. **"DSHS or DSHU" and "DSHS or DSNS".** The course is given both codes, and the audit decides which requirement it fills. The chart's exact wording is kept in `chartText`.
4. **"X or Y" awards** (AP Art History 4/5, AP US History 4, IB French SL 5, IB History Africa/Americas/Europe HL 5) are a `choice`. `toStudentCourses` holds these back in `needsChoice` until the student picks one; it never guesses.
5. **Credit with no UMD course** ("Lower Level Elective"/L1, "Lab Science (DSNL)", "History/Social Science (DSHS)", "Academic Writing (FSAW)", "Non-Lab Science (DSNS)", IB "No Direct Equivalent") becomes a placeholder such as `L1:AP Computer Science A` or `DSNL:AP Biology`. It never matches the audit's course-id pattern, so it counts toward Gen Ed (through its code) and total credits, but never toward a course, department or level requirement. `L1` is UMD's own code for lower-level elective credit (the Transfer Course Database uses it too). How the Registrar actually posts these on a transcript was not checked.

### Things in the charts that look odd but were copied as printed

- AP Italian: a score of 5 earns ITAL204 for **3** credits, while a 4 earns ITAL203 for 4 credits.
- AP French 3 earns a **4**-credit elective.
- IB Chemistry "SL" 6, 7 reads "CHEM131 and CHEM132 and", with no third course (4 credits, matching two courses). The chart also says "SL" there where every other row says "Standard".
- IB French SL 5: "FREN203 or FREN204" for 4 credits, although FREN204 is 3 credits elsewhere in the chart.
- IB Swahili HL awards 6 credits of L1 (SL: 3).
- IB Hebrew lists only Standard level. History: Africa, Americas, Europe and Asia & Oceania list only Higher. At an unlisted level, `creditForIb` returns no credit.
- The chart spells "Applications/Intepretation" (kept as an alias).
- AP Calculus: credit is for AB or BC, not both; the "BC w/AB Subscore" row has its own rule, which is kept in `notes`. `toStudentCourses` counts a course once if two awards give it.

## Transfer Course Database (dual enrollment): not scraped yet

The database has no JSON API. It is server-rendered HTML driven by three GET URLs:

1. Find the institution: `https://app.transfercredit.umd.edu/inst-select.html?searchType=master&searchString=Montgomery&countryCode=US&stateCode=MD`. It returns a table (`table#univlist`) with state, institution code and name, each linking to step 2. `countryCode` must be `US` (from the search form's `<select>`); `USA` returns no rows. The start page is `inst-search.html?searchType=master`.
2. Every evaluated course at that institution: `https://app.transfercredit.umd.edu/display-inst-courses.html?instCode=52431A` (Montgomery College). One HTML table with the columns *Transfer From: Course ID, Course Title* and *UMD Equiv: Course ID, Gen Ed, Core, Footnotes, Start Term, End Term*. The UMD column reads like "Accepted MATH140", "Accepted L1", "Not Accepted" or "Pending". One transfer course can have several rows, one per UMD course (Montgomery College BIOL150 → BSCI170 with DSNL, plus BSCI171) or one per term range. **Montgomery College's page is 8.7 MB with about 4,240 rows**, so a scraper should cache per institution and filter by term.
3. Footnotes: `https://app.transfercredit.umd.edu/footnote-info-code.html?code=24`.

Sample rows (Montgomery College, fetched 2026-09-25):

| Course | Title | UMD equivalent | Gen Ed | Valid terms |
|---|---|---|---|---|
| MATH181 | CALCULUS I | Accepted MATH140 | FSAR, FSMA | Fall 2014 – Summer II 2029 |
| MATH182 | CALCULUS II | Accepted MATH141 | | Fall 2020 – Summer II 2027 |
| CMSC203 | COMPUTER SCIENCE I | Accepted CMSC131 | | Fall 2018 – Summer II 2029 |
| CMSC201 | JAVA PROGRAMMING LANG | Accepted L1 | | Fall 2014 – Summer II 2027 |
| BIOL150 | PRINCIPLES OF BIOLOGY I | Accepted BSCI170 / Accepted BSCI171 | DSNL / – | Fall 2022 – Summer II 2031 |

For now the student types in what they found (`DualEnrollmentEntry`), and `dualEnrollmentToStudentCourses` converts it. The database gives no per-course credits when one course maps to several UMD courses, so the student supplies the split, and the converter checks that it adds up.

## Overlapping credit (owner: please confirm)

- **Calculus AB or BC, not both.** `toStudentCourses` keeps only the calculus award (AB, BC, or BC's AB subscore) worth the most credits; on a tie it prefers BC, then the subscore, then AB. So BC 3 with AB subscore 5 counts only MATH140 (4 credits), matching the chart's "If Calculus BC score is 3 or below, the subscore is processed as the AB exam". The dropped award is returned in `notCounted` with the reason.
- **The same course from two places (owner ruling, 2026-09-25).** A student who has credit for a course has it, whatever the source (AP, IB, dual enrollment or a mix); it counts once, and any further credit for the same course is overkill. `mergeCreditCourses(examCourses, dualEnrollmentCourses)` does this: each UMD course (e.g. MATH140 from AP and from Montgomery College MATH181) appears once, and the redundant copies are listed in `notCounted` so the app can show them as overkill. Which copy is kept doesn't matter. Elective and Gen Ed-only placeholders are each their own credit and are never merged.
