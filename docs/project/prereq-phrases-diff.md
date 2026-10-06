# Prerequisite phrase fixes P2-P10: parse diff

Every course whose parsed prerequisite or corequisite tree changed against `feat/prereq-precedence`, across both merged snapshots (202608, 202701). **52 changed trees** (P2: 14, P3: 8, P4: 3, P5: 10, P6: 5, P7: 6, P8: 1, P9: 1, P10: 4, Unsure: 0).

## P2 (14)

### BIOE221 (prerequisite)

- Text: Minimum grade of C- in BIOE120 and (BIOE121 or a minimum of 60 credits).
- Old: ALL of [BIOE120 (min C-); BIOE121 (min C-)]
- New: ALL of [BIOE120 (min C-); ANY of [BIOE121 (min C-); manual: "a minimum of 60 credits"]]

### ENBC342 (prerequisite)

- Text: Minimum grade of C- in ENBC341; and minimum grade of C- in BIOE241 or approved prior study in Matlab; and must have earned a minimum grade of C- or be concurrently enrolled in ENBC331.
- Old: ALL of [ENBC341 (min C-); BIOE241 (min C-); ENBC331 (min C-) (concurrent ok)]
- New: ALL of [ENBC341 (min C-); ANY of [BIOE241 (min C-); manual: "approved prior study in Matlab"]; ENBC331 (min C-) (concurrent ok)]

### ENCE401 (prerequisite)

- Text: ENCE203 or experience with a programming language (e.g., Python, R, MATLAB); ENCE303 or another course that provides the relevant probability/statistics required content; and permission of the ENGR-Civil and Environmental Engineering department.
- Old: ALL of [ENCE203; ENCE303; manual: "permission of the ENGR-Civil and Environmental Engineering department"]
- New: ALL of [ANY of [ENCE203; manual: "experience with a programming language (e.g., Python, R, MATLAB)"]; ANY of [ENCE303; manual: "another course that provides the relevant probability/statistics required content"]; manual: "permission of the ENGR-Civil and Environmental Engineering department"]

### ENCE451 (prerequisite)

- Text: ENCE353 or another course that provides the relevant structure analysis required content; and permission of the ENGR-Civil and Environmental Engineering department.
- Old: ALL of [ENCE353; manual: "permission of the ENGR-Civil and Environmental Engineering department"]
- New: ALL of [ANY of [ENCE353; manual: "another course that provides the relevant structure analysis required content"]; manual: "permission of the ENGR-Civil and Environmental Engineering department"]

### INST751 (prerequisite)

- Text: INFM603, INST733, or other programming and database courses, or Permission of the instructor.
- Old: ANY of [ANY of [INFM603; INST733]; manual: "Permission of the instructor"]
- New: ANY of [ANY of [INFM603; INST733; manual: "other programming and database courses"]; manual: "Permission of the instructor"]

### MLAW325 (prerequisite)

- Text: MLAW315 or by permission of the department.
- Old: MLAW315
- New: ANY of [MLAW315; manual: "by permission of the department"]

### MUSC240 (prerequisite)

- Text: MUSC 140, or by permission of instructor.
- Old: MUSC140
- New: ANY of [MUSC140; manual: "by permission of instructor"]

### PHYS375 (prerequisite)

- Text: PHYS273, PHYS276, and (PHYS265, CMSC106, CMSC131, or another acceptable computer programming course with approval from the Physics Department).
- Old: ALL of [PHYS273; PHYS276; ANY of [PHYS265; CMSC106; CMSC131]]
- New: ALL of [PHYS273; PHYS276; ANY of [PHYS265; CMSC106; CMSC131; manual: "another acceptable computer programming course with approval from the Physics Department"]]

### RDEV450 (prerequisite)

- Text: Must have completed RDEV270 or an approved accounting course with a grade of C- or better; and minimum grade of C- in RDEV350.
- Old: ALL of [RDEV270 (min C-); RDEV350 (min C-)]
- New: ALL of [ANY of [RDEV270 (min C-); manual: "an approved accounting course"]; RDEV350 (min C-)]

### SURV750 (prerequisite)

- Text: SURV626, or course in applied sampling.
- Old: SURV626
- New: ANY of [SURV626; manual: "course in applied sampling"]

### ENAE472 (prerequisite)

- Text: ENAE311 or enrolled in hypersonics graduate certificate program.
- Old: ENAE311
- New: ANY of [ENAE311; manual: "enrolled in hypersonics graduate certificate program"]

### ENBC311 (prerequisite)

- Text: Minimum grade of C- in MATH241; and minimum grade of C- in BIOE241 or approved prior study in Matlab.
- Old: ALL of [MATH241 (min C-); BIOE241 (min C-)]
- New: ALL of [MATH241 (min C-); ANY of [BIOE241 (min C-); manual: "approved prior study in Matlab"]]

### ENBC331 (prerequisite)

- Text: Minimum grade of C- in BIOE241 or approved prior study in Matlab.
- Old: BIOE241 (min C-)
- New: ANY of [BIOE241 (min C-); manual: "approved prior study in Matlab"]

### ENBC332 (prerequisite)

- Text: Minimum grade of C- in BIOE241 or approved prior study in Matlab.
- Old: BIOE241 (min C-)
- New: ANY of [BIOE241 (min C-); manual: "approved prior study in Matlab"]

## P3 (8)

### BIOE461 (prerequisite)

- Text: Minimum grade of C- in BIOE120, must have earned a minimum of 60 credits.
- Old: BIOE120 (min C-)
- New: ALL of [BIOE120 (min C-); manual: "must have earned a minimum of 60 credits"]

### ECON321 (prerequisite)

- Text: Minimum grade of C- in ECON200 and ECON201; and minimum grade of C- in ECON300 or (MATH241 and any statistics course).
- Old: ALL of [ALL of [ECON200 (min C-); ECON201 (min C-)]; ANY of [ECON300 (min C-); MATH241 (min C-)]]
- New: ALL of [ALL of [ECON200 (min C-); ECON201 (min C-)]; ANY of [ECON300 (min C-); ALL of [MATH241 (min C-); manual: "any statistics course"]]]

### ECON325 (prerequisite)

- Text: Minimum grade of C- in ECON200 and ECON201; and minimum grade of C- in ECON300 or (MATH241 and any statistics course).
- Old: ALL of [ALL of [ECON200 (min C-); ECON201 (min C-)]; ANY of [ECON300 (min C-); MATH241 (min C-)]]
- New: ALL of [ALL of [ECON200 (min C-); ECON201 (min C-)]; ANY of [ECON300 (min C-); ALL of [MATH241 (min C-); manual: "any statistics course"]]]

### ECON326 (prerequisite)

- Text: Minimum grade of C- in ECON200 and ECON201; and minimum grade of C- in ECON300 or (MATH241 and any statistics course).
- Old: ALL of [ALL of [ECON200 (min C-); ECON201 (min C-)]; ANY of [ECON300 (min C-); MATH241 (min C-)]]
- New: ALL of [ALL of [ECON200 (min C-); ECON201 (min C-)]; ANY of [ECON300 (min C-); ALL of [MATH241 (min C-); manual: "any statistics course"]]]

### ENES440 (prerequisite)

- Text: Students must receive a B- or better in ENES240 and take 2 courses from the STEP minor elective list.
- Old: ENES240 (min B-)
- New: ALL of [ENES240 (min B-); manual: "take 2 courses from the STEP minor elective list"]

### HLSC322 (prerequisite)

- Text: CHEM131, CHEM132, BSCI160, BSCI170, and either BSCI180 or (BSCI161 and BSCI171); or must have completed BSCI170, (BSCI180 or BSCI171), and two semesters of Chemistry.
- Old: ANY of [ALL of [CHEM131; CHEM132; BSCI160; BSCI170; ANY of [BSCI180; ALL of [BSCI161; BSCI171]]]; ALL of [BSCI170; ANY of [BSCI180; BSCI171]]]
- New: ANY of [ALL of [CHEM131; CHEM132; BSCI160; BSCI170; ANY of [BSCI180; ALL of [BSCI161; BSCI171]]]; ALL of [BSCI170; ANY of [BSCI180; BSCI171]; manual: "two semesters of Chemistry"]]

### ENPM631 (prerequisite)

- Text: ENPM694 or ENPM818O and ability to write code in one programming language and/or Undergraduate coursework in a programming language; or permission of instructor.
- Old: ANY of [ANY of [ENPM694; ENPM818O]; manual: "permission of instructor"]
- New: ANY of [ALL of [ANY of [ENPM694; ENPM818O]; manual: "ability to write code in one programming language and/or Undergraduate coursework in a programming language"]; manual: "permission of instructor"]

### KNES386 (prerequisite)

- Text: Must have completed at least one KNES core class with a C- or better and must have completed SPHL100 with a C- or better.
- Old: SPHL100 (min C-)
- New: ALL of [manual: "at least one KNES core class"; SPHL100 (min C-)]

## P4 (3)

### CMSC456 (prerequisite)

- Text: (CMSC106, CMSC131, or ENEE150; or equivalent programming experience); and (2 courses from (CMSC330, CMSC351, ENEE324, or ENEE382); or any one of these courses and a 400-level MATH course, or two 400-level MATH courses); and Permission of CMNS-Mathematics department or permission of instructor.
- Old: ALL of [ANY of [ANY of [CMSC106; CMSC131; ENEE150]; manual: "equivalent programming experience"]; ANY of [ANY of [CMSC330; CMSC351; ENEE324; ENEE382]; any MATH 400+]; manual: "Permission of CMNS-Mathematics department or permission of instructor"]
- New: ALL of [ANY of [ANY of [CMSC106; CMSC131; ENEE150]; manual: "equivalent programming experience"]; manual: "2 courses from (CMSC330, CMSC351, ENEE324, or ENEE382); or any one of these courses and a 400-level MATH course, or two 400-level MATH courses"; manual: "Permission of CMNS-Mathematics department or permission of instructor"]

### ENEE456 (prerequisite)

- Text: (CMSC106, CMSC131, or ENEE150; or equivalent programming experience); and (2 courses from (CMSC330, CMSC351, ENEE324, or ENEE382); or any one of these courses and a 400-level MATH course, or two 400-level MATH courses); and Permission of CMNS-Mathematics department or permission of instructor.
- Old: ALL of [ANY of [ANY of [CMSC106; CMSC131; ENEE150]; manual: "equivalent programming experience"]; ANY of [ANY of [CMSC330; CMSC351; ENEE324; ENEE382]; any MATH 400+]; manual: "Permission of CMNS-Mathematics department or permission of instructor"]
- New: ALL of [ANY of [ANY of [CMSC106; CMSC131; ENEE150]; manual: "equivalent programming experience"]; manual: "2 courses from (CMSC330, CMSC351, ENEE324, or ENEE382); or any one of these courses and a 400-level MATH course, or two 400-level MATH courses"; manual: "Permission of CMNS-Mathematics department or permission of instructor"]

### MATH456 (prerequisite)

- Text: (CMSC106, CMSC131, or ENEE150; or equivalent programming experience); and (2 courses from (CMSC330, CMSC351, ENEE324, or ENEE382); or any one of these courses and a 400-level MATH course, or two 400-level MATH courses); and Permission of CMNS-Mathematics department or permission of instructor.
- Old: ALL of [ANY of [ANY of [CMSC106; CMSC131; ENEE150]; manual: "equivalent programming experience"]; ANY of [ANY of [CMSC330; CMSC351; ENEE324; ENEE382]; any MATH 400+]; manual: "Permission of CMNS-Mathematics department or permission of instructor"]
- New: ALL of [ANY of [ANY of [CMSC106; CMSC131; ENEE150]; manual: "equivalent programming experience"]; manual: "2 courses from (CMSC330, CMSC351, ENEE324, or ENEE382); or any one of these courses and a 400-level MATH course, or two 400-level MATH courses"; manual: "Permission of CMNS-Mathematics department or permission of instructor"]

## P5 (10)

### BMGT302 (prerequisite)

- Text: BMGT301; or permission of BMGT-Robert H. Smith School of Business.
- Old: ALL of [ANY of [BMGT301; manual: "permission of BMGT-Robert H"]; manual: "Smith School of Business"]
- New: ANY of [BMGT301; manual: "permission of BMGT-Robert H. Smith School of Business"]

### BMGT843 (prerequisite)

- Text: Permission of BMGT-Robert H. Smith School of Business.
- Old: ALL of [manual: "Permission of BMGT-Robert H"; manual: "Smith School of Business"]
- New: manual: "Permission of BMGT-Robert H. Smith School of Business"

### BMSO600 (prerequisite)

- Text: Permission of BMGT-Robert H. Smith School of Business.
- Old: ALL of [manual: "Permission of BMGT-Robert H"; manual: "Smith School of Business"]
- New: manual: "Permission of BMGT-Robert H. Smith School of Business"

### BMSO601 (prerequisite)

- Text: Permission of BMGT-Robert H. Smith School of Business.
- Old: ALL of [manual: "Permission of BMGT-Robert H"; manual: "Smith School of Business"]
- New: manual: "Permission of BMGT-Robert H. Smith School of Business"

### BMSO602 (prerequisite)

- Text: Permission of BMGT-Robert H. Smith School of Business.
- Old: ALL of [manual: "Permission of BMGT-Robert H"; manual: "Smith School of Business"]
- New: manual: "Permission of BMGT-Robert H. Smith School of Business"

### BUFN710 (prerequisite)

- Text: BUFN610; or permission of BMGT-Robert H. Smith School of Business.
- Old: ALL of [ANY of [BUFN610; manual: "permission of BMGT-Robert H"]; manual: "Smith School of Business"]
- New: ANY of [BUFN610; manual: "permission of BMGT-Robert H. Smith School of Business"]

### BUMO790 (prerequisite)

- Text: Permission of BMGT-Robert H. Smith School of Business.
- Old: ALL of [manual: "Permission of BMGT-Robert H"; manual: "Smith School of Business"]
- New: manual: "Permission of BMGT-Robert H. Smith School of Business"

### BMSO603 (prerequisite)

- Text: Permission of BMGT-Robert H. Smith School of Business.
- Old: ALL of [manual: "Permission of BMGT-Robert H"; manual: "Smith School of Business"]
- New: manual: "Permission of BMGT-Robert H. Smith School of Business"

### BUFN741 (prerequisite)

- Text: BUFN620; or permission of BMGT-Robert H. Smith School of Business.
- Old: ALL of [ANY of [BUFN620; manual: "permission of BMGT-Robert H"]; manual: "Smith School of Business"]
- New: ANY of [BUFN620; manual: "permission of BMGT-Robert H. Smith School of Business"]

### BULM701 (prerequisite)

- Text: BULM700; or permission of BMGT-Robert H. Smith School of Business.
- Old: ALL of [ANY of [BULM700; manual: "permission of BMGT-Robert H"]; manual: "Smith School of Business"]
- New: ANY of [BULM700; manual: "permission of BMGT-Robert H. Smith School of Business"]

## P6 (5)

### ENST415 (prerequisite)

- Text: CHEM131; and PHYS121 must be completed or in progress; or permission of AGNR-Environmental Science & Technology department.
- Old: ANY of [ALL of [CHEM131; PHYS121]; manual: "permission of AGNR-Environmental Science & Technology department"]
- New: ANY of [ALL of [CHEM131; PHYS121 (concurrent ok)]; manual: "permission of AGNR-Environmental Science & Technology department"]

### ENST462 (prerequisite)

- Text: (BSCI160 and BSCI161) and (BSCI170 and BSCI171); and ENST460 must be completed or in progress; or permission of instructor.
- Old: ANY of [ALL of [ALL of [ALL of [BSCI160; BSCI161]; ALL of [BSCI170; BSCI171]]; ENST460]; manual: "permission of instructor"]
- New: ANY of [ALL of [ALL of [ALL of [BSCI160; BSCI161]; ALL of [BSCI170; BSCI171]]; ENST460 (concurrent ok)]; manual: "permission of instructor"]

### ENVH414 (prerequisite)

- Text: SPHL100 and EPIB301 enrolled or completed.
- Old: ALL of [SPHL100; EPIB301]
- New: ALL of [SPHL100 (concurrent ok); EPIB301 (concurrent ok)]

### ENFP440 (prerequisite)

- Text: Must have completed with a C- or better or concurrently be enrolled in ENFP300.
- Old: ENFP300 (min C-)
- New: ENFP300 (min C-) (concurrent ok)

### NFSC380 (prerequisite)

- Text: Minimum of C- in NFSC315; and BCHM461 must be completed or in progress.
- Old: ALL of [NFSC315 (min C-); BCHM461]
- New: ALL of [NFSC315 (min C-); BCHM461 (concurrent ok)]

## P7 (6)

### ARSC101 (corequisite)

- Text: AFROTC cadets must also register for ARSC059.
- Old: ARSC059
- New: manual: "AFROTC cadets must also register for ARSC059"

### ARSC201 (corequisite)

- Text: AFROTC cadets must also register for ARSC059.
- Old: ARSC059
- New: manual: "AFROTC cadets must also register for ARSC059"

### ARSC301 (corequisite)

- Text: AFROTC cadets must also register for ARSC059; or permission of UGST-AFROTC-Air Science.
- Old: ANY of [ARSC059; manual: "permission of UGST-AFROTC-Air Science"]
- New: ANY of [manual: "AFROTC cadets must also register for ARSC059"; manual: "permission of UGST-AFROTC-Air Science"]

### ARSC100 (corequisite)

- Text: AFROTC cadets must also register for ARSC059.
- Old: ARSC059
- New: manual: "AFROTC cadets must also register for ARSC059"

### ARSC200 (corequisite)

- Text: AFROTC cadets must also register for ARSC059.
- Old: ARSC059
- New: manual: "AFROTC cadets must also register for ARSC059"

### ARSC300 (corequisite)

- Text: AFROTC cadets must also register for ARSC059; or permission of UGST-AFROTC-Air Science.
- Old: ANY of [ARSC059; manual: "permission of UGST-AFROTC-Air Science"]
- New: ANY of [manual: "AFROTC cadets must also register for ARSC059"; manual: "permission of UGST-AFROTC-Air Science"]

## P8 (1)

### ENTM797 (prerequisite)

- Text: Introductory entomology course (ex. BSCI337); a college level understanding of biology is required.
- Old: ALL of [BSCI337; manual: "a college level understanding of biology is required"]
- New: ALL of [manual: "Introductory entomology course (ex. BSCI337)"; manual: "a college level understanding of biology is required"]

## P9 (1)

### FMSC485 (prerequisite)

- Text: FMSC330; or 1 course from PSYC300-499 course range.
- Old: ANY of [FMSC330; PSYC300]
- New: ANY of [FMSC330; any PSYC 300+]

## P10 (4)

### ENGL388P (prerequisite)

- Text: Permission of ARHU-English department. Repeatable to 12 credits if content differs.
- Old: ALL of [manual: "Permission of ARHU-English department"; manual: "Repeatable to 12 credits if content differs"]
- New: manual: "Permission of ARHU-English department"

### ENGL388V (prerequisite)

- Text: Permission of the ARHU-English department. Repeatable to 12 credits.
- Old: ALL of [manual: "Permission of the ARHU-English department"; manual: "Repeatable to 12 credits"]
- New: manual: "Permission of the ARHU-English department"

### ENGL388W (prerequisite)

- Text: Permission of the Writing Center (1205 Tawes Hall). Repeatable to 12 credits.
- Old: ALL of [manual: "Permission of the Writing Center (1205 Tawes Hall)"; manual: "Repeatable to 12 credits"]
- New: manual: "Permission of the Writing Center (1205 Tawes Hall)"

### SPAN388W (prerequisite)

- Text: Permission of the Writing Center (1205 Tawes Hall). Repeatable to 12 credits.
- Old: ALL of [manual: "Permission of the Writing Center (1205 Tawes Hall)"; manual: "Repeatable to 12 credits"]
- New: manual: "Permission of the Writing Center (1205 Tawes Hall)"

## Unsure (0)

Changes not named in the verdicts for P2-P10 (the same parser rule firing on other courses).

## Notes

- Unsure: none. No tree outside the P2-P10 course lists changed.
- ENST650 (listed under P2) did not change: its 'other ecology equivalent' and both permission alternatives already parse correctly on this base.
- ENVH414 'SPHL100 and EPIB301 enrolled or completed': the concurrent flag applies to the whole clause, so both courses are concurrent-ok.
- ENCE401 also gains 'experience with a programming language (e.g., ...)' as a manual alternative to ENCE203 (same P2 shape).
- ENAE472 corequisite '(if not enrolled in hypersonics graduate certificate program)' is unchanged (not in P2-P10).
