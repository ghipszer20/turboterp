# Prerequisite audit verdicts (2026-10-06, session A main session)

Reviewed against `docs/project/prereq-audit.md` (generated at `292f18e`): every one of the 715 prerequisite
and 34 corequisite templates was read (Testudo example text vs parsed tree). A scratch check confirmed every
course in a template parses to the same tree shape (codes abstracted), so one example covers the template.

**Verdict for every template not listed below: correct.** Listed templates are wrong, grouped by fix class.
"Lenient" = the app can say met when it isn't; "strict" = it can say unmet when the student qualifies.

## Fix classes

### P1. and/or precedence (lenient; the biggest class)
Unparenthesized mixes are read with "and" binding first, so one branch alone satisfies the whole.
Conservative reading (and the intended one in every reviewed case): **"or" binds tighter than "and"** at each
level, with the levels nested and never flattened: **sentences** (`. And` / `. Or`) contain **`;` clauses**, which
contain **comma lists**, which contain items. Or-first applies among sentences, among the `;` clauses of one
sentence, and inside a clause. So "A and B; and permission. Or must be in the CS graduate program" stays
ANY[ALL[A, B, permission], program] (CMSC417/451), and "X and Y. Or permission of dept; and permission of
instructor" stays ANY[ALL[X, Y], ALL[dept, instructor]] (ENAE631/633, ENMA464). With these rules:
- **Comma lists:** the conjunction before the last item sets the list operator: "A, B, and C or D" =
  ALL[A, B, ANY[C, D]]; "A, B, or C" = ANY; "A and B, or C" = ANY[ALL[A, B], C]; no final conjunction:
  ALL (unless every non-last item is a bare code: "A, B or C" = ANY).
- **"either A or B" / "both A and B"** are one group.
- **A trailing waiver** ("; or permission of …", "or by permission", "students who have taken courses with
  comparable content may contact …") is an alternative to everything before it **in its own sentence only**
  (as today). A later required sentence stays required: "MUSC453; or … may contact the department. And
  permission of the School of Music" = ALL[ANY[MUSC453, waiver], permission] (MUSC454, THET325, THET440, CHIN302,
  CHIN411).
- **Grouping phrases keep their own "or"/"and":** "1 course (with a minimum grade of C-) from (A, B)", "1 of the
  following (…)", "one of (…)" are ANY lists; "must have completed or be concurrently enrolled in", "C- or
  better/higher", "X or higher" are phrases, not logic.
- **"one of the following:" semicolon lists** stay lists (GFPL492, as today).
- **Explanatory sentences** ("and math eligibility is based on the Math Placement Test/Exam …") merge into the
  preceding manual item, never become a separate required item (MATH107/113/115/120/135/140, DATA100).
Wrong today: PHYS131, PHYS400, BSCI222, BSCI401, BSCI410, BSCI420, BSCI436, BSCI442, BCHM461, BCHM485,
BIOE411, AGST275, AGST400, HLSC322, CMSC132 (MATH140 only required on the placement branch), EPIB684,
EDHD322/431/441/442/444, EDSP315/321 (TRACK I / TRACK 2), SDSI492, SDSI496, INST427, GEOL460, COMM363,
ENST453 (flat ANY), JWST427 and TLPL425 ("A, B, C, or permission" read as ALL: strict), ENMA437.
Ambiguous-precedence detector: 209 templates / 274 course-kind flags; every changed tree gets reviewed.

### P2. Dropped "or <prose>" alternatives (strict)
Keep as a manual alternative: BIOE221 "(BIOE121 or a minimum of 60 credits)", ENBC311/331/332/342 "or approved
prior study in Matlab", RDEV450 "or an approved accounting course", ENCE401/451 "or another course that provides
…", ENAE472 "or enrolled in hypersonics graduate certificate program", SURV750 "or course in applied sampling",
PHYS375 "or another acceptable computer programming course …", INST751 "or other programming and database
courses", ENST650; MUSC240/MLAW325 "or by permission …" (dropped entirely).

### P3. Dropped requirements (lenient)
Keep as a manual item: ECON321/325/326 "(MATH241 and any statistics course)", KNES386 "at least one KNES core
class", ENES440 "take 2 courses from the STEP minor elective list", HLSC322 "two semesters of Chemistry",
BIOE461 ", must have earned a minimum of 60 credits", ENPM631 "and ability to write code …".

### P4. Counted lists read as one-of (lenient)
"2 courses from (…)", "two 400-level MATH courses": CMSC456, MATH456, ENEE456 (and AMST340/MATH436, already
manual). No count kind exists; encode as a manual item (confirm), not an any.

### P5. Sentence split on abbreviations (junk manual items)
"Robert H. Smith School of Business" split at "H.": BMGT302, BMGT843, BMSO600–603, BUFN710/741, BULM701,
BUMO790 (BMGT302's split makes BMGT301 alone "confirm"). Don't split after a single capital letter or
"e.g."/"i.e."/"ex.".

### P6. Concurrent phrasing missed (strict)
"must be completed or in progress", "enrolled or completed", "or concurrently be enrolled in": NFSC380, ENST415,
ENST462, ENVH414, ENFP440 → `concurrentOk`.

### P7. Conditional corequisite (strict)
"AFROTC cadets must also register for ARSC059" (ARSC100/101/200/201/300/301) applies to cadets only → manual.

### P8. Examples read as requirements (strict)
ENTM797 "Introductory entomology course (ex. BSCI337)" requires BSCI337 → the clause is manual.

### P9. Course ranges
FMSC485 "1 course from PSYC300-499 course range" → PSYC300 exactly; should be `dept-level` PSYC ≥ 300 (the kind
has no maximum; 300+ is the conservative-enough reading for an undergraduate).

### P10. Non-requirement sentences
"Repeatable to 12 credits (if content differs)" in ENGL388P/V/W, SPAN388W prerequisite text becomes a required
manual item → drop it.

## Kept as is (reviewed, conservative or harmless)
- CMNS-majors-only grade sentences (CHEM231/237/242/271/272, BCHM464/465) stay a manual item, so these show
  "confirm"; the prereq check doesn't know the student's college.
- Program/major-only conditions read as everyone's (JOUR652 "Master of Journalism students …", CHIN302/411
  "for Non-majors", ENAE472 coreq "if not enrolled in …"): stricter than Testudo, but the course sheet shows the
  text.
- Testudo typos left as printed: AGST275 "PLSC11", CHIN301 "CHN204", ENEE630 "ENEE620l".
- LATN102 "LATN101 at University of Maryland", BIOE486 "in the immediately preceding semester": the timing/place
  condition isn't modeled.
