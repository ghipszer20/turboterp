# Prerequisite precedence diff (P1)

Parser before: `origin/feat/course-data`; after: `feat/prereq-precedence`. Both merged snapshots (202608 + 202701, `mergeSnapshots`).

**53 changed trees: 51 prerequisite, 2 corequisite** (PLSC201 and PLSC271, listed below, ended up unchanged after the parallel-pairs rule). Rule applied: "or" binds tighter than "and" at sentence, ";" clause and comma-list level (docs/project/prereq-audit-verdicts.md, P1).

## AGST275 (prerequisite)

- Text: Minimum grade of C- in CHEM131 and CHEM132; and minimum grade of C- in (PLSC110 and PLSC11) or (PLSC112 and PLSC113) or (BSCI160 and BSCI180 or BSCI161) or (BSCI170 and BSCI180 or BSCI171).
- Old: ALL of [ALL of [CHEM131 (min C-); CHEM132 (min C-)]; ANY of [PLSC110 (min C-); ALL of [PLSC112 (min C-); PLSC113 (min C-)]; ANY of [ALL of [BSCI160 (min C-); BSCI180 (min C-)]; BSCI161 (min C-)]; ANY of [ALL of [BSCI170 (min C-); BSCI180 (min C-)]; BSCI171 (min C-)]]]
- New: ALL of [ALL of [CHEM131 (min C-); CHEM132 (min C-)]; ANY of [PLSC110 (min C-); ALL of [PLSC112 (min C-); PLSC113 (min C-)]; ALL of [BSCI160 (min C-); ANY of [BSCI180 (min C-); BSCI161 (min C-)]]; ALL of [BSCI170 (min C-); ANY of [BSCI180 (min C-); BSCI171 (min C-)]]]]

## AGST400 (prerequisite)

- Text: (PLSC110 and PLSC111) OR (PLSC112 and PLSC113), BSCI160 and (BSCI180 or BSCI161), and MATH113 or higher.
- Old: ANY of [ALL of [PLSC110; PLSC111]; ALL of [ALL of [PLSC112; PLSC113]; BSCI160; ANY of [BSCI180; BSCI161]; any MATH 113+]]
- New: ALL of [ANY of [ALL of [PLSC110; PLSC111]; ALL of [PLSC112; PLSC113]]; BSCI160; ANY of [BSCI180; BSCI161]; any MATH 113+]

## ARCH465 (prerequisite)

- Text: ARCH464 and PHYS121; and MATH120 or MATH140, or equivalent; or permission of the ARCH-Architecture Program.
- Old: ANY of [ALL of [ALL of [ARCH464; PHYS121]; ANY of [ANY of [MATH120; MATH140]; manual: "equivalent"]]; manual: "permission of the ARCH-Architecture Program"]
- New: ANY of [ALL of [ALL of [ARCH464; PHYS121]; ANY of [MATH120; MATH140; manual: "equivalent"]]; manual: "permission of the ARCH-Architecture Program"]

## BCHM461 (prerequisite)

- Text: Minimum grade of C- in CHEM271 and CHEM272; or minimum grade of C- in CHEM276 and CHEM277; and minimum grade of C- in (CHEM241 and CHEM242) or CHEM247.
- Old: ANY of [ALL of [CHEM271 (min C-); CHEM272 (min C-)]; ALL of [ALL of [CHEM276 (min C-); CHEM277 (min C-)]; ANY of [ALL of [CHEM241 (min C-); CHEM242 (min C-)]; CHEM247 (min C-)]]]
- New: ALL of [ANY of [ALL of [CHEM271 (min C-); CHEM272 (min C-)]; ALL of [CHEM276 (min C-); CHEM277 (min C-)]]; ANY of [ALL of [CHEM241 (min C-); CHEM242 (min C-)]; CHEM247 (min C-)]]

## BCHM463 (prerequisite)

- Text: Minimum grade of C- in CHEM271 and CHEM272; or minimum grade of C- in CHEM276 and CHEM277; and minimum grade of C- in (CHEM241 and CHEM242) or CHEM247.
- Old: ANY of [ALL of [CHEM271 (min C-); CHEM272 (min C-)]; ALL of [ALL of [CHEM276 (min C-); CHEM277 (min C-)]; ANY of [ALL of [CHEM241 (min C-); CHEM242 (min C-)]; CHEM247 (min C-)]]]
- New: ALL of [ANY of [ALL of [CHEM271 (min C-); CHEM272 (min C-)]; ALL of [CHEM276 (min C-); CHEM277 (min C-)]]; ANY of [ALL of [CHEM241 (min C-); CHEM242 (min C-)]; CHEM247 (min C-)]]

## BCHM485 (prerequisite)

- Text: Minimum grade of C- in CHEM135; or minimum grade of C- in (CHEM271 or CHEM276) and in (CHEM272 or CHEM277); and minimum grade of C- in MATH141; and minimum grade of C- in (PHYS260 and PHYS261) or C- in PHYS142.
- Old: ANY of [CHEM135 (min C-); ALL of [ALL of [ANY of [CHEM271 (min C-); CHEM276 (min C-)]; ANY of [CHEM272 (min C-); CHEM277 (min C-)]]; MATH141 (min C-); ANY of [ALL of [PHYS260 (min C-); PHYS261 (min C-)]; PHYS142 (min C-)]]]
- New: ALL of [ANY of [CHEM135 (min C-); ALL of [ANY of [CHEM271 (min C-); CHEM276 (min C-)]; ANY of [CHEM272 (min C-); CHEM277 (min C-)]]]; MATH141 (min C-); ANY of [ALL of [PHYS260 (min C-); PHYS261 (min C-)]; PHYS142 (min C-)]]

## BIOE411 (prerequisite)

- Text: Minimum grade of C- in BIOE120 and either BSCI330 or (BSCI331 and BSCI332); and must have earned a minimum of 60 credits.
- Old: ALL of [ANY of [ALL of [BIOE120 (min C-); BSCI330 (min C-)]; ALL of [BSCI331 (min C-); BSCI332 (min C-)]]; manual: "must have earned a minimum of 60 credits"]
- New: ALL of [ALL of [BIOE120 (min C-); ANY of [BSCI330 (min C-); ALL of [BSCI331 (min C-); BSCI332 (min C-)]]]; manual: "must have earned a minimum of 60 credits"]

## BSCI207 (prerequisite)

- Text: BSCI160 and BSCI170; and must have completed or be concurrently enrolled in CHEM131 and either BSCI180 or (BSCI161 and BSCI171).
- Old: ALL of [ALL of [BSCI160; BSCI170]; ANY of [ALL of [CHEM131 (concurrent ok); BSCI180 (concurrent ok)]; ALL of [BSCI161 (concurrent ok); BSCI171 (concurrent ok)]]]
- New: ALL of [ALL of [BSCI160; BSCI170]; ALL of [CHEM131 (concurrent ok); ANY of [BSCI180 (concurrent ok); ALL of [BSCI161 (concurrent ok); BSCI171 (concurrent ok)]]]]

## BSCI222 (prerequisite)

- Text: BSCI170 and (BSCI180 or BSCI171); or (BIOE120 and BIOE121); and CHEM131 and CHEM132; and either (CHEM231 and CHEM232) or (BSCI160 and BSCI161 or BSCI180) .
- Old: ANY of [ALL of [BSCI170; ANY of [BSCI180; BSCI171]]; ALL of [ALL of [BIOE120; BIOE121]; ALL of [CHEM131; CHEM132]; ANY of [ALL of [CHEM231; CHEM232]; ANY of [ALL of [BSCI160; BSCI161]; BSCI180]]]]
- New: ALL of [ANY of [ALL of [BSCI170; ANY of [BSCI180; BSCI171]]; ALL of [BIOE120; BIOE121]]; ALL of [CHEM131; CHEM132]; ANY of [ALL of [CHEM231; CHEM232]; ALL of [BSCI160; ANY of [BSCI161; BSCI180]]]]

## BSCI401 (prerequisite)

- Text: Minimum grade of C- in BSCI160 and (BSCI180 or BSCI161) and CHEM237 or both CHEM231 and CHEM232.
- Old: ANY of [ALL of [BSCI160 (min C-); ANY of [BSCI180 (min C-); BSCI161 (min C-)]; CHEM237 (min C-)]; ALL of [CHEM231 (min C-); CHEM232 (min C-)]]
- New: ALL of [BSCI160 (min C-); ANY of [BSCI180 (min C-); BSCI161 (min C-)]; ANY of [CHEM237 (min C-); ALL of [CHEM231 (min C-); CHEM232 (min C-)]]]

## BSCI410 (prerequisite)

- Text: Minimum grade of C- in (BSCI222 or HLSC322) and either CHEM237 or both CHEM231 and CHEM232.
- Old: ANY of [ALL of [ANY of [BSCI222 (min C-); HLSC322 (min C-)]; CHEM237 (min C-)]; ALL of [CHEM231 (min C-); CHEM232 (min C-)]]
- New: ALL of [ANY of [BSCI222 (min C-); HLSC322 (min C-)]; ANY of [CHEM237 (min C-); ALL of [CHEM231 (min C-); CHEM232 (min C-)]]]

## BSCI420 (prerequisite)

- Text: (BSCI331 or BSCI330) and (BSCI222 or HLSC322) and CHEM237 or (CHEM231 and CHEM232).
- Old: ANY of [ALL of [ANY of [BSCI331; BSCI330]; ANY of [BSCI222; HLSC322]; CHEM237]; ALL of [CHEM231; CHEM232]]
- New: ALL of [ANY of [BSCI331; BSCI330]; ANY of [BSCI222; HLSC322]; ANY of [CHEM237; ALL of [CHEM231; CHEM232]]]

## BSCI436 (prerequisite)

- Text: Minimum grade of C- in BSCI330 OR (BSCI331 and BSCI332) and minimum grade of C- (BSCI222 or HLSC322).
- Old: ANY of [BSCI330 (min C-); ALL of [ALL of [BSCI331 (min C-); BSCI332 (min C-)]; ANY of [BSCI222 (min C-); HLSC322 (min C-)]]]
- New: ALL of [ANY of [BSCI330 (min C-); ALL of [BSCI331 (min C-); BSCI332 (min C-)]]; ANY of [BSCI222 (min C-); HLSC322 (min C-)]]

## BSCI442 (prerequisite)

- Text: Minimum grade of C- in BSCI170 and (BSCI180 or BSCI171); or minimum grade of C- in PLSC201 and PLSC206; and minimum grade of C- in CHEM231 and CHEM232; or minimum grade of C- in CHEM237.
- Old: ANY of [ALL of [BSCI170 (min C-); ANY of [BSCI180 (min C-); BSCI171 (min C-)]]; ALL of [ALL of [PLSC201 (min C-); PLSC206 (min C-)]; ALL of [CHEM231 (min C-); CHEM232 (min C-)]]; CHEM237 (min C-)]
- New: ALL of [ANY of [ALL of [BSCI170 (min C-); ANY of [BSCI180 (min C-); BSCI171 (min C-)]]; ALL of [PLSC201 (min C-); PLSC206 (min C-)]]; ANY of [ALL of [CHEM231 (min C-); CHEM232 (min C-)]; CHEM237 (min C-)]]

## CMSC132 (prerequisite)

- Text: Minimum grade of C- in CMSC131 or CMSC133; or must have earned a score of 5 on the A Java AP exam; or must have earned a satisfactory score on the departmental placement exam; and minimum grade of C- in MATH140.
- Old: ANY of [ANY of [CMSC131 (min C-); CMSC133 (min C-)]; manual: "must have earned a score of 5 on the A Java AP exam"; ALL of [manual: "must have earned a satisfactory score on the departmental placement exam"; MATH140 (min C-)]]
- New: ALL of [ANY of [ANY of [CMSC131 (min C-); CMSC133 (min C-)]; manual: "must have earned a score of 5 on the A Java AP exam"; manual: "must have earned a satisfactory score on the departmental placement exam"]; MATH140 (min C-)]

## EDHD431 (corequisite)

- Text: EDSP423 and EDSP315; and TRACK I: Must be concurrently enrolled in EDSP430, EDSP433; or TRACK 2: Must be concurrently enrolled in EDHD415, EDHD424.
- Old: ANY of [ALL of [ALL of [EDSP423; EDSP315]; ALL of [EDSP430 (concurrent ok); EDSP433 (concurrent ok)]]; ALL of [EDHD415 (concurrent ok); EDHD424 (concurrent ok)]]
- New: ALL of [ALL of [EDSP423; EDSP315]; ANY of [ALL of [EDSP430 (concurrent ok); EDSP433 (concurrent ok)]; ALL of [EDHD415 (concurrent ok); EDHD424 (concurrent ok)]]]

## EDSP315 (corequisite)

- Text: EDSP423 and EDHD431; and track 1: Must be concurrently enrolled in EDSP430 and EDSP433; OR Track 2: Must be concurrently enrolled in EDHD415 and EDHD424.
- Old: ANY of [ALL of [ALL of [EDSP423; EDHD431]; ALL of [EDSP430 (concurrent ok); EDSP433 (concurrent ok)]]; ALL of [EDHD415 (concurrent ok); EDHD424 (concurrent ok)]]
- New: ALL of [ALL of [EDSP423; EDHD431]; ANY of [ALL of [EDSP430 (concurrent ok); EDSP433 (concurrent ok)]; ALL of [EDHD415 (concurrent ok); EDHD424 (concurrent ok)]]]

## ENCE215 (prerequisite)

- Text: CHEM135; or students who have taken courses with comparable content may contact the department; and permission of ENGR-Civil & Environmental Engineering Department.
- Old: ANY of [CHEM135; ALL of [manual: "students who have taken courses with comparable content may contact the department"; manual: "permission of ENGR-Civil & Environmental Engineering Department"]]
- New: ALL of [ANY of [CHEM135; manual: "students who have taken courses with comparable content may contact the department"]; manual: "permission of ENGR-Civil & Environmental Engineering Department"]

## ENEE222 (prerequisite)

- Text: Minimum grade of C- in ENEE140; or minimum grade of C- in CMSC131; and permission of ENGR- Electrical & Computer Engineering department.
- Old: ANY of [ENEE140 (min C-); ALL of [CMSC131 (min C-); manual: "permission of ENGR- Electrical & Computer Engineering department"]]
- New: ALL of [ANY of [ENEE140 (min C-); CMSC131 (min C-)]; manual: "permission of ENGR- Electrical & Computer Engineering department"]

## ENST453 (prerequisite)

- Text: MATH120 or MATH140, ENST200, GEOG306 or BIOM301.
- Old: ANY of [MATH120; MATH140; ENST200; GEOG306; BIOM301]
- New: ALL of [ANY of [MATH120; MATH140]; ENST200; ANY of [GEOG306; BIOM301]]

## ENTE601 (prerequisite)

- Text: ENME472 or equivalent (undergraduate engineering capstone course), basic programming course (Python preferred), ENAE202/ENME202, or equivalent.
- Old: ANY of [ANY of [ENME472; manual: "equivalent"; ENAE202; ENME202]; manual: "equivalent"]
- New: ANY of [ENME472; manual: "equivalent"; ENAE202; ENME202; manual: "equivalent"]

## EPIB684 (prerequisite)

- Text: A minimum grade of B- in EPIB610; or equivalent; and a minimum grade of B- in EPIB697; or previous programming experience in SAS through other courses and/or activities with permission from the instructor.
- Old: ANY of [EPIB610 (min B-); ALL of [manual: "equivalent"; EPIB697 (min B-)]; manual: "previous programming experience in SAS through other courses and/or activities with permission from the instructor"]
- New: ALL of [ANY of [EPIB610 (min B-); manual: "equivalent"]; ANY of [EPIB697 (min B-); manual: "previous programming experience in SAS through other courses and/or activities with permission from the instructor"]]

## HLSC322 (prerequisite)

- Text: CHEM131, CHEM132, BSCI160, BSCI170, and either BSCI180 or (BSCI161 and BSCI171); or must have completed BSCI170, (BSCI180 or BSCI171), and two semesters of Chemistry.
- Old: ANY of [ANY of [ALL of [CHEM131; CHEM132; BSCI160; BSCI170; BSCI180]; ALL of [BSCI161; BSCI171]]; ALL of [BSCI170; ANY of [BSCI180; BSCI171]]]
- New: ANY of [ALL of [CHEM131; CHEM132; BSCI160; BSCI170; ANY of [BSCI180; ALL of [BSCI161; BSCI171]]]; ALL of [BSCI170; ANY of [BSCI180; BSCI171]]]

## JWST427 (prerequisite)

- Text: JWST225, RELS225, HIST219I, or permission of the instructor.
- Old: ANY of [ALL of [JWST225; RELS225; HIST219I]; manual: "permission of the instructor"]
- New: ANY of [JWST225; RELS225; HIST219I; manual: "permission of the instructor"]

## LARC454 (prerequisite)

- Text: PLSC253 and LARC220 or LARC620; or permission of instructor.
- Old: ANY of [ANY of [ALL of [PLSC253; LARC220]; LARC620]; manual: "permission of instructor"]
- New: ANY of [ALL of [PLSC253; ANY of [LARC220; LARC620]]; manual: "permission of instructor"]

## MATH107 (prerequisite)

- Text: Must have math eligibility of MATH107 or higher; and math eligibility is based on Math Placement Exam or successful completion of MATH003 with appropriate eligibility.
- Old: ALL of [manual: "Must have math eligibility of MATH107 or higher"; manual: "math eligibility is based on Math Placement Exam or successful completion of MATH003 with appropriate eligibility"]
- New: manual: "Must have math eligibility of MATH107 or higher; and math eligibility is based on Math Placement Exam or successful completion of MATH003 with appropriate eligibility"

## MATH113 (prerequisite)

- Text: Must have math eligibility of MATH113 or higher; and math eligibility is based on the Math Placement Exam or the successful completion of MATH 003 with appropriate eligibility.
- Old: ALL of [manual: "Must have math eligibility of MATH113 or higher"; manual: "math eligibility is based on the Math Placement Exam or the successful completion of MATH 003 with appropriate eligibility"]
- New: manual: "Must have math eligibility of MATH113 or higher; and math eligibility is based on the Math Placement Exam or the successful completion of MATH 003 with appropriate eligibility"

## MATH115 (prerequisite)

- Text: Must have math eligibility of MATH115 or higher; and math eligibility is based on the Math Placement Exam or the successful completion of MATH003 with appropriate eligibility. Or MATH113.
- Old: ANY of [ALL of [manual: "Must have math eligibility of MATH115 or higher"; manual: "math eligibility is based on the Math Placement Exam or the successful completion of MATH003 with appropriate eligibility"]; MATH113]
- New: ANY of [manual: "Must have math eligibility of MATH115 or higher; and math eligibility is based on the Math Placement Exam or the successful completion of MATH003 with appropriate eligibility"; MATH113]

## MATH120 (prerequisite)

- Text: 1 course with a minimum grade of C- from (MATH113, MATH115). Or must have math eligibility of MATH120 or higher; and math eligibility is based on the Math Placement Test.
- Old: ANY of [ANY of [MATH113 (min C-); MATH115 (min C-)]; ALL of [manual: "must have math eligibility of MATH120 or higher"; manual: "math eligibility is based on the Math Placement Test"]]
- New: ANY of [ANY of [MATH113 (min C-); MATH115 (min C-)]; manual: "must have math eligibility of MATH120 or higher; and math eligibility is based on the Math Placement Test"]

## MATH135 (prerequisite)

- Text: Minimum grade of C- in MATH113 or MATH115; or must have math eligibility of MATH120 or higher; and math eligibility is based on the Math Placement Test.
- Old: ANY of [ANY of [MATH113 (min C-); MATH115 (min C-)]; ALL of [manual: "must have math eligibility of MATH120 or higher"; manual: "math eligibility is based on the Math Placement Test"]]
- New: ANY of [ANY of [MATH113 (min C-); MATH115 (min C-)]; manual: "must have math eligibility of MATH120 or higher; and math eligibility is based on the Math Placement Test"]

## MATH140 (prerequisite)

- Text: Minimum grade of C- in MATH115; or must have math eligibility of MATH140; and math eligibility is based on the Math Placement Test.
- Old: ANY of [MATH115 (min C-); ALL of [manual: "must have math eligibility of MATH140"; manual: "math eligibility is based on the Math Placement Test"]]
- New: ANY of [MATH115 (min C-); manual: "must have math eligibility of MATH140; and math eligibility is based on the Math Placement Test"]

## NEUR305 (prerequisite)

- Text: Minimum grade of C- in MATH120 or higher MATH course; and a minimum grade of C- in NEUR200 or BSCI353; or equivalent.
- Old: ANY of [ALL of [any MATH 120+ (min C-); ANY of [NEUR200 (min C-); BSCI353 (min C-)]]; manual: "equivalent"]
- New: ALL of [any MATH 120+ (min C-); ANY of [ANY of [NEUR200 (min C-); BSCI353 (min C-)]; manual: "equivalent"]]

## PHYS131 (prerequisite)

- Text: CHEM131; and (MATH136 or MATH140); and BSCI160, BSCI170, and either BSCI180 or (BSCI161 and BSCI171).
- Old: ALL of [CHEM131; ANY of [MATH136; MATH140]; ANY of [ALL of [BSCI160; BSCI170; BSCI180]; ALL of [BSCI161; BSCI171]]]
- New: ALL of [CHEM131; ANY of [MATH136; MATH140]; ALL of [BSCI160; BSCI170; ANY of [BSCI180; ALL of [BSCI161; BSCI171]]]]

## PHYS400 (prerequisite)

- Text: Grades of A- or higher in PHYS272, PHYS273, MATH241, and MATH243 or MATH246, and permission of CMNS-Physics Department.
- Old: ALL of [ANY of [ALL of [PHYS272 (min A-); PHYS273 (min A-); MATH241 (min A-); MATH243 (min A-)]; MATH246 (min A-)]; manual: "permission of CMNS-Physics Department"]
- New: ALL of [ALL of [PHYS272 (min A-); PHYS273 (min A-); MATH241 (min A-); ANY of [MATH243 (min A-); MATH246 (min A-)]]; manual: "permission of CMNS-Physics Department"]

## PLSC271 (prerequisite)

- Text: Minimum grade of C- in PLSC110 and PLSC111 or (PLSC112 and PLSC113); or minimum grade of C- in BSCI170 and (BSCI180 or BSCI171).
- Old: ANY of [ANY of [ALL of [PLSC110 (min C-); PLSC111 (min C-)]; ALL of [PLSC112 (min C-); PLSC113 (min C-)]]; ALL of [BSCI170 (min C-); ANY of [BSCI180 (min C-); BSCI171 (min C-)]]]
- New: ANY of [ALL of [PLSC110 (min C-); ANY of [PLSC111 (min C-); ALL of [PLSC112 (min C-); PLSC113 (min C-)]]]; ALL of [BSCI170 (min C-); ANY of [BSCI180 (min C-); BSCI171 (min C-)]]]

## PLSC400 (prerequisite)

- Text: Minimum grade of C- in BSCI170 and (BSCI180 or BSCI171); or minimum grade of C- in PLSC201 and PLSC206; and minimum grade of C- in CHEM231 and CHEM232; or minimum grade of C- in CHEM237.
- Old: ANY of [ALL of [BSCI170 (min C-); ANY of [BSCI180 (min C-); BSCI171 (min C-)]]; ALL of [ALL of [PLSC201 (min C-); PLSC206 (min C-)]; ALL of [CHEM231 (min C-); CHEM232 (min C-)]]; CHEM237 (min C-)]
- New: ALL of [ANY of [ALL of [BSCI170 (min C-); ANY of [BSCI180 (min C-); BSCI171 (min C-)]]; ALL of [PLSC201 (min C-); PLSC206 (min C-)]]; ANY of [ALL of [CHEM231 (min C-); CHEM232 (min C-)]; CHEM237 (min C-)]]

## RELS427 (prerequisite)

- Text: JWST225, RELS225, HIST219I, or permission of the instructor.
- Old: ANY of [ALL of [JWST225; RELS225; HIST219I]; manual: "permission of the instructor"]
- New: ANY of [JWST225; RELS225; HIST219I; manual: "permission of the instructor"]

## SDSI492 (prerequisite)

- Text: Minimum grade of C- in BSOS326 or SDSB326, INST327, INST366, SURV400, INST462, and INST414 or SDSI414.
- Old: ANY of [BSOS326 (min C-); ALL of [SDSB326 (min C-); INST327 (min C-); INST366 (min C-); SURV400 (min C-); INST462 (min C-); INST414 (min C-)]; SDSI414 (min C-)]
- New: ALL of [ANY of [BSOS326 (min C-); SDSB326 (min C-)]; INST327 (min C-); INST366 (min C-); SURV400 (min C-); INST462 (min C-); ANY of [INST414 (min C-); SDSI414 (min C-)]]

## SDSI496 (prerequisite)

- Text: Minimum grade of C- in BSOS326 or SDSB326, INST327, INST366, SURV400 or SDSB340, and INST414 or SDSI414.
- Old: ANY of [BSOS326 (min C-); SDSB326 (min C-); INST327 (min C-); INST366 (min C-); SURV400 (min C-); ALL of [SDSB340 (min C-); INST414 (min C-)]; SDSI414 (min C-)]
- New: ALL of [ANY of [BSOS326 (min C-); SDSB326 (min C-)]; INST327 (min C-); INST366 (min C-); ANY of [SURV400 (min C-); SDSB340 (min C-)]; ANY of [INST414 (min C-); SDSI414 (min C-)]]

## ARCH464 (prerequisite)

- Text: ARCH462, ARCH463, and PHYS121; and MATH120 or MATH140, or equivalent; or permission of the ARCH-Architecture Program.
- Old: ANY of [ALL of [ALL of [ARCH462; ARCH463; PHYS121]; ANY of [ANY of [MATH120; MATH140]; manual: "equivalent"]]; manual: "permission of the ARCH-Architecture Program"]
- New: ANY of [ALL of [ALL of [ARCH462; ARCH463; PHYS121]; ANY of [MATH120; MATH140; manual: "equivalent"]]; manual: "permission of the ARCH-Architecture Program"]

## COMM363 (prerequisite)

- Text: COMM107 or COMM200, COMM130, and COMM250.
- Old: ANY of [COMM107; ALL of [COMM200; COMM130; COMM250]]
- New: ALL of [ANY of [COMM107; COMM200]; COMM130; COMM250]

## EDHD322 (prerequisite)

- Text: EDSP423, EDHD431, and EDSP315; and track 1: Must have completed EDSP 430, EDSP 433; OR Track 2: Must have completed EDHD415, EDHD 424.
- Old: ANY of [ALL of [ALL of [EDSP423; EDHD431; EDSP315]; ALL of [EDSP430; EDSP433]]; ALL of [EDHD415; EDHD424]]
- New: ALL of [ALL of [EDSP423; EDHD431; EDSP315]; ANY of [ALL of [EDSP430; EDSP433]; ALL of [EDHD415; EDHD424]]]

## EDHD323 (prerequisite)

- Text: EDSP423, EDHD431, and EDSP315; and track 1: Must have completed EDSP430, EDSP433; or Track 2: Must have completed EDHD415, EDHD424.
- Old: ANY of [ALL of [ALL of [EDSP423; EDHD431; EDSP315]; ALL of [EDSP430; EDSP433]]; ALL of [EDHD415; EDHD424]]
- New: ALL of [ALL of [EDSP423; EDHD431; EDSP315]; ANY of [ALL of [EDSP430; EDSP433]; ALL of [EDHD415; EDHD424]]]

## EDHD442 (prerequisite)

- Text: Minimum grade of C- in EDSP423, EDHD431, and EDSP315; and TRACK I: Must have completed EDSP430 and EDSP 433; or TRACK 2: Must have completed EDHD415 and EDHD 424.
- Old: ANY of [ALL of [ALL of [EDSP423 (min C-); EDHD431 (min C-); EDSP315 (min C-)]; ALL of [EDSP430; EDSP433]]; ALL of [EDHD415; EDHD424]]
- New: ALL of [ALL of [EDSP423 (min C-); EDHD431 (min C-); EDSP315 (min C-)]; ANY of [ALL of [EDSP430; EDSP433]; ALL of [EDHD415; EDHD424]]]

## EDHD443 (prerequisite)

- Text: Minimum grade of C- in EDSP423, EDHD431, and EDSP315; and TRACK I: Must have completed EDSP430 and EDSP 433; or TRACK 2: Must have completed EDHD415 and EDHD 424.
- Old: ANY of [ALL of [ALL of [EDSP423 (min C-); EDHD431 (min C-); EDSP315 (min C-)]; ALL of [EDSP430; EDSP433]]; ALL of [EDHD415; EDHD424]]
- New: ALL of [ALL of [EDSP423 (min C-); EDHD431 (min C-); EDSP315 (min C-)]; ANY of [ALL of [EDSP430; EDSP433]; ALL of [EDHD415; EDHD424]]]

## EDHD444 (prerequisite)

- Text: Minimum grade of C- in EDSP423, EDHD431, and EDSP315; and track 1: Must have completed EDSP430 and EDSP433; OR Track 2: Must have completed EDHD415 and EDHD424.
- Old: ANY of [ALL of [ALL of [EDSP423 (min C-); EDHD431 (min C-); EDSP315 (min C-)]; ALL of [EDSP430; EDSP433]]; ALL of [EDHD415; EDHD424]]
- New: ALL of [ALL of [EDSP423 (min C-); EDHD431 (min C-); EDSP315 (min C-)]; ANY of [ALL of [EDSP430; EDSP433]; ALL of [EDHD415; EDHD424]]]

## EDSP321 (prerequisite)

- Text: EDSP423, EDHD431, and EDSP315; and track 1: Must have completed EDSP430 and EDSP433; OR Track 2: Must have completed EDHD415 and EDHD424.
- Old: ANY of [ALL of [ALL of [EDSP423; EDHD431; EDSP315]; ALL of [EDSP430; EDSP433]]; ALL of [EDHD415; EDHD424]]
- New: ALL of [ALL of [EDSP423; EDHD431; EDSP315]; ANY of [ALL of [EDSP430; EDSP433]; ALL of [EDHD415; EDHD424]]]

## EDSP417 (prerequisite)

- Text: EDSP423, EDHD431, and EDSP315; and track 1: Must have completed EDSP430 and EDSP433; OR Track 2: Must have completed EDHD415 and EDHD424.
- Old: ANY of [ALL of [ALL of [EDSP423; EDHD431; EDSP315]; ALL of [EDSP430; EDSP433]]; ALL of [EDHD415; EDHD424]]
- New: ALL of [ALL of [EDSP423; EDHD431; EDSP315]; ANY of [ALL of [EDSP430; EDSP433]; ALL of [EDHD415; EDHD424]]]

## ENMA401 (prerequisite)

- Text: ENMA362, PHYS270, PHYS271, and MATH246; or equivalent; and ENMA165 or MATH206.
- Old: ANY of [ALL of [ENMA362; PHYS270; PHYS271; MATH246]; ALL of [manual: "equivalent"; ANY of [ENMA165; MATH206]]]
- New: ALL of [ANY of [ALL of [ENMA362; PHYS270; PHYS271; MATH246]; manual: "equivalent"]; ANY of [ENMA165; MATH206]]

## ENMA437 (prerequisite)

- Text: MATH461, ENMA300, and ENMA165 or equivalent.
- Old: ANY of [ALL of [MATH461; ENMA300; ENMA165]; manual: "equivalent"]
- New: ALL of [MATH461; ENMA300; ANY of [ENMA165; manual: "equivalent"]]

## GEOL460 (prerequisite)

- Text: GEOL100 or GEOL120, MATH141, and (PHYS141, PHYS161, or PHYS171).
- Old: ANY of [GEOL100; ALL of [GEOL120; MATH141; ANY of [PHYS141; PHYS161; PHYS171]]]
- New: ALL of [ANY of [GEOL100; GEOL120]; MATH141; ANY of [PHYS141; PHYS161; PHYS171]]

## INST427 (prerequisite)

- Text: Minimum grade of C- in INST327, INST326, and INST201 or INST301.
- Old: ANY of [ALL of [INST327 (min C-); INST326 (min C-); INST201 (min C-)]; INST301 (min C-)]
- New: ALL of [INST327 (min C-); INST326 (min C-); ANY of [INST201 (min C-); INST301 (min C-)]]

## PHYS331 (prerequisite)

- Text: CHEM131; and (MATH131 or MATH136); and BSCI160, BSCI170, and either BSCI180 or (BSCI161 and BSCI171).
- Old: ALL of [CHEM131; ANY of [MATH131; MATH136]; ANY of [ALL of [BSCI160; BSCI170; BSCI180]; ALL of [BSCI161; BSCI171]]]
- New: ALL of [CHEM131; ANY of [MATH131; MATH136]; ALL of [BSCI160; BSCI170; ANY of [BSCI180; ALL of [BSCI161; BSCI171]]]]

## PLSC201 (prerequisite)

- Text: Minimum grade of C- in PLSC110 and PLSC111 or (PLSC112 and PLSC113); and minimum grade of C- in CHEM131 and CHEM132.
- Old: ALL of [ANY of [ALL of [PLSC110 (min C-); PLSC111 (min C-)]; ALL of [PLSC112 (min C-); PLSC113 (min C-)]]; ALL of [CHEM131 (min C-); CHEM132 (min C-)]]
- New: ALL of [ALL of [PLSC110 (min C-); ANY of [PLSC111 (min C-); ALL of [PLSC112 (min C-); PLSC113 (min C-)]]]; ALL of [CHEM131 (min C-); CHEM132 (min C-)]]

## TLPL425 (prerequisite)

- Text: TLPL401, TLPL420, or permission of EDUC-Teaching and Learning, Policy and Leadership department.
- Old: ANY of [ALL of [TLPL401; TLPL420]; manual: "permission of EDUC-Teaching and Learning, Policy and Leadership department"]
- New: ANY of [TLPL401; TLPL420; manual: "permission of EDUC-Teaching and Learning, Policy and Leadership department"]

## Notes

Every change above follows a P1 rule. Courses outside the verdict's named list changed because they share its sentence shape:
RELS427 (= JWST427); EDHD323, EDHD443, EDSP417 (= EDHD322 track template); PHYS331 (= PHYS131); BCHM463, PLSC400
(= BCHM461 / BSCI442); ENCE215, ENEE222, ENMA401, LARC454, NEUR305, BSCI207, ANSC453 and similar ("A; or B; and C",
"A and B or C", "either A or B", trailing waivers). Pure shape flattening with identical meaning is not counted as a change.

### Unsure

- PLSC201, PLSC271: settled by the main session from UMD's catalog, which writes the same alternatives for another PLSC course as "PLSC110 and PLSC111; or (PLSC112 and PLSC113)" (lecture + lab pairs). A parallel-pairs rule (a bare "and" run as long as the parenthesized group after "or") now reads (110 and 111) or (112 and 113); only these two courses match it, and BSCI420's unequal run stays strict. Their trees are unchanged from before P1.
- "or equivalent" after a plain (non-comma) clause stays an alternative to the whole clause, as before; only after a comma list
  ("MATH461, ENMA300, and ENMA165 or equivalent", ENMA437) does it bind to the last item. P2 may revisit.
- MATH140 and the MATH107/113/115/120/135 family: the explanation sentence is merged into the preceding manual item (verdict rule),
  so MATH140 is no longer ALL[manual, manual] (the brief pinned it "as today"); checking behavior is unchanged (both confirm).
