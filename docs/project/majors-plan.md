# Majors plan (majors session, owner-approved 2026-09-28)

Scope: every unencoded major (College Park first, then Shady Grove / Southern Maryland versions). No minors or certificates (other sessions). Builders: general-purpose + Sonnet with `.claude/agents/major-builder.md` as the standing brief (the `major-builder` agent type loads from the next session on), **3 at once**, branch `feat/<id>`. Owner rulings 2026-09-28: tiny same-college majors (sources under ~8 KB) may share one builder; location versions after the College Park majors. Approving the plan approved these dispatches (section 18). A college's shared-core builder runs before its siblings, never alongside them. Individual Studies is skipped (no requirements in the catalog; flagged).

College keys `PLCY` (School of Public Policy) and `USG` (Universities at Shady Grove) added 2026-09-28.

**Split 2026-09-28 (owner):** Half A (AGNR, ARCH, BMGT, SPHL, INFO, Shady Grove/Southern Maryland) = majors session A, merging in `.claude/worktrees/majors-merge`. Half B (EDUC, PLCY, JOUR, CMNS AI, ARHU OCR re-check) = majors session B, merging in `.claude/worktrees/majors-merge-b`. Each session edits only its own half's rows.

## Half A (majors session A)

| # | id | majors | notes | status |
|---|---|---|---|---|
| 1 | agnr-ensp (resume) | ENSP: 8 remaining concentrations + 3 flagged narrowings | `ensp-shared-2026-27.ts` | merged (114k; all 12 concentrations) |
| 2 | educ-elem | Elementary Education | creates `educ-shared-2026-27.ts` if the catalog shows a teacher-prep core | merged (87k; educ-shared created) |
| 3 | bmgt-omba-scm | Operations Mgmt & Business Analytics + Supply Chain | import `bmgt-core-2026-27.ts` | merged (84k) |
| 4 | agnr-ferm-nfsc | Fermentation Science + Nutrition & Food Science | | merged (99k) |
| 5 | arch-pair | Architecture + Real Estate & Built Environment | | merged (94k) |
| 6 | sphl-kine | Kinesiology | creates `sphl-shared` if SPHL majors share a core | merged (84k; sphl-shared created) |
| 7 | agnr-enst | Environmental Science & Technology | | merged (90k; 4 tracks) |
| 18 | agnr-plsc | Plant Sciences | | merged (84k; 3 tracks) |
| 19 | agnr-larc | Landscape Architecture | | merged |
| 22 | info-infosci | Information Science | | merged (`infosci-shared` created) |
| 23 | info-tid | Technology & Information Design | | merged (37k; half 1 session; catalog vs department elective credits flagged) |
| 24–27 | sphl-* | Family Health; Global Health; PH Practice (+ PH Science if both small) | after #6 merged | all merged: Family Health (73k), Global Health (42k), PH Practice + PH Science (49k) |
| 31–34 | usg-* | Fermentation (identical: thin re-export) + Info Science + PH Science; Shady Grove Accounting/Management/Marketing; Communication; Southern Maryland EE + ME | college USG; patterns `biocomp-major`, `mechatronics-major`; diff only `## Catalog requirements` first | handed off (owner, 2026-09-28): half 1 = Fermentation merged (thin re-export `ferm-usg-major`, main session), Shady Grove InfoSci (40k) + PH Science (29k; catalog marks it Discontinued) merged; half 2 = all merged: Accounting/Management/Marketing at Shady Grove + Southern Maryland EE/ME as thin re-exports (33k; Accounting's catalog track differs, Smith page wins; EE/ME college ENGR), Communication at Shady Grove (50k; own curriculum) |




## Half B (majors session B)

| # | id | majors | notes | status |
|---|---|---|---|---|
| 8 | educ-a | Early Childhood / Early Childhood Special Ed | 2 tracks; import `educ-shared`, never edit it | merged (73k) |
| 9 | educ-b | Elementary/Middle Special Ed | 2 tracks | merged (79k) |
| 10 | educ-c | Middle School Ed | | merged (43k) |
| 11 | educ-d | Secondary Ed: Mathematics | | merged (40k; catalog lists education courses only, Terrapin Teachers) |
| 12 | educ-e | Secondary Ed: English | | merged (52k; Element 3 open 3 credits split out as OPEN SLOT by main session) |
| 13 | educ-f | Secondary Ed: Science | | merged (35k; education component only, content areas are double majors) |
| 14 | educ-g | Secondary Ed: Social Studies | | merged (78k; 3 tracks: History default, Geography, Government & Politics) |
| 15 | educ-h | Secondary Ed: World Language | | merged (43k; education component only, language area OPEN SLOT) |
| 16 | educ-i | Secondary Ed: Art | | merged (57k) |
| 17 | educ-hdev | Human Development | not teacher-prep | merged (58k; C- assumed from COE statement, flagged) |
| 20 | cmns-ai | AI: Computational Structures for AI Systems | | skipped (not yet published; owner 2026-09-28) |
| 21 | jour | Journalism | default (no specialization) + Broadcast, Investigative, Sports tracks | merged (75k; 4 programs, all plans constructed) |
| 28 | plcy-pp | Public Policy | college PLCY | merged (71k; STAT row widened by main session) |
| 29 | plcy-gfp | Global & Foreign Policy | college PLCY; thematic tracks | merged (61k; 3 tracks, elective lists not in source: OPEN SLOT) |
| 30a | ocr-comm | OCR re-check: Communication (5 plans) | read only the OCR plan section | merged (52k; Health & Science plan official, other 4 still illegible) |
| 30b | ocr-musc | OCR re-check: Music (Jazz, Perf/Comp) + Composition BM track | | merged (29k; both plans still illegible, no Composition or BA Jazz track) |
| 30c | ocr-a | OCR re-check: Chinese, Cinema ×2, Dance | | merged (44k; all plans still illegible) |
| 30d | ocr-b | OCR re-check: Global Culture, HCAI, Immersive Media Design | | done (plans kept constructed: OCR unreadable) |
| 30e | ocr-c | OCR re-check: Theatre, WGSS | | done (plans kept constructed: OCR unreadable) |
