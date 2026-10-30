# 3. Feature modules

Moved out of PROJECT_MEMORY.md (section 3) so it loads only when needed. Update it here when a decision changes.

1. **Degree audit and 4-year planner.**
   - Layered rules: University → Gen Ed → College → Major → Specialization → Minor, second major and special programs.
   - Matching-based assignment that respects double-count rules. Flags missing requirements (with courses that satisfy them), prerequisite and ordering errors, and credit caps. (Total credits beyond the degree minimum are NOT flagged; owner ruling 2026-09-25.)
   - Manual ☐ items for things it can't check (thesis, auditions).
   - Catalog-year versioning. Handles AP/transfer credit and the CS limited-enrollment gateway.
   - **Program changes (owner requirement):** switching majors, grad courses as an undergrad, double majors, double degrees, adding and dropping majors and minors.
     - **Data model:** a Student holds Degrees, and each Degree holds Programs (major, minor, certificate, LLP, and so on). Each Program has its own catalog year and a status (declared / planned / what-if / dropped). Gen Ed and university rules apply once; college rules apply per degree.
     - **Double major:** 1 degree, 2 majors, 120-credit minimum. Courses may count toward both majors unless a program's rules limit sharing.
     - **Double degree:** 2 degrees, **150-credit minimum**, and **at least 18 credits in each degree not used for the other**. Satisfies both degrees' requirements in full, including college rules.
     - **Declaration deadline:** a double major or double degree must be declared at least 1 full academic year before graduation. The app warns ahead of it.
     - **Sharing limits** between programs are part of the rule format (e.g. `max_shared_with`). The matching step (ILP) enforces them across every program at once.
     - **Switching majors:** always run it as a what-if first. Show how existing credits apply to the new major (count / become electives / unused), the change in graduation date, the catalog year for the new major, and the internal-transfer requirements (gateway courses and GPA) for limited-enrollment majors. Then commit, with undo.
     - **Adding or dropping a program:** re-run matching. Show freed credits ("drop the minor → graduate a semester early?") and courses that now count toward nothing.
     - **Grad courses as an undergrad:**
       - 600–897 (not 799) are allowed, subject to the offering department's rules.
       - Each grad course is tagged by how its credit counts: undergrad credit / graduate-only (max 9 credits, a petition can add up to 3) / double-counted in a combined BS/MS.
       - A combined BS/MS double-counts up to 35% of the master's credits, only 600+ courses with a grade of B- or better.
       - Grad courses need advisor permission (owner ruling 2026-09-27, rulings.md): they can be planned, with a "needs advisor permission" warning.
       - Grad courses get a badge on the plan grid. Permission-only prerequisites become manual ☐ items.
     - The owner's hand-built test students must include: a major switch in sophomore year, a double major, a double degree, a BS/MS student, and a dropped minor.
   - **Pre-professional tracks (owner requirement):** pre-med (MD/DO), pre-dental, pre-PA, pre-vet, pre-pharmacy, pre-optometry, pre-PT, pre-OT, pre-nursing, pre-law, and others. They're a separate layer type called a "track": prerequisites for applying to a professional school, **not** degree requirements. Tracks can be added to any major, and what-if audits cover them.
     - **Course categories map to UMD courses.** HPAO's medicine list: 8 cr general chem + lab, 8 cr organic chem + lab, biochem, 8–12 cr bio + lab, calculus, statistics, 8 cr physics + lab, 6 cr English. HPAO publishes categories, not UMD codes, so the owner builds the category → UMD course mapping from 4yearplans.umd.edu pre-health plans and HPAO pages, then verifies it.
     - **Optional target-school layer:** add specific schools with their own extra requirements (e.g. a PA school that needs anatomy and physiology; pharmacy from AACP's school table). A later addition; the generic HPAO list comes first.
     - **Transfer tracks** (pre-nursing = 2 years at UMD, then apply to a BSN program elsewhere) get requirements from the UMD catalog's Pre-Health Professions page.
     - **Pre-law:** there are no required courses. The track shows milestones (LSAT timing, application cycle), suggested skill-building courses, and **GPA protection**: it warns when a planned semester's predicted grades could hurt GPA.
     - **Things that aren't courses** become milestone ☐ items on the plan timeline: MCAT/DAT/OAT/GRE/LSAT, clinical, shadowing, research and volunteer hours, and the HPAO committee letter and application cycle. Use HPAO's timeline and dates, verified by the owner.
     - **Timing:** the optimizer gets a deadline rule, e.g. finish MCAT content courses before the planned MCAT term. Gap-year plans are supported.
     - **GPA:** compute overall and **science GPA (BCPM: biology, chemistry, physics, math, AMCAS-style)** from the transcript.
     - **Warnings:** AP credit or pass/fail used for a professional-school prerequisite (many schools won't accept these), and grades below the usual C minimum.
     - Disclaimer: "Confirm with HPAO and each target school."
2. **Prerequisite graph.**
   - Prose from Testudo parsed into AND/OR trees, with corequisites kept separate.
   - A hand-edited overrides file.
   - Which terms each course is offered.
3. **Schedule builder (Coursicle-style).**
   - Week grid, section switching, conflict and gap detection, walking time between buildings.
   - Auto-generator with filters (no 8am classes, days off), ranked by professor rating, GPA or open seats.
   - Plan A/B/C, .ics export, sharing.
   - **Two-way sync with the 4-year plan (owner requirement).** There is one plan model. The builder for a term is a view of that term in the 4-year plan, plus the chosen sections, so there are no copies to keep in sync.
     - **Plan → builder:** a term's planned courses pre-load in the builder with their sections.
     - **Builder → plan:** adding, removing or swapping a course edits that term in the plan immediately.
     - Only the **active** schedule (A/B/C) writes to the plan. The alternatives are sandboxes, and switching the active one applies the difference.
     - Every change re-runs the audit and the prerequisite check for later terms. If something breaks (e.g. dropping CMSC351 breaks 3 later courses), show one-tap fixes from the optimizer (move to summer, shift later courses). Show a change summary ("Plan updated · audit still ✅") and allow undo.
     - Each course in the builder shows what it counts toward (e.g. "DSHU") and what happens to the audit if it's swapped. If a planned course has no sections this term, or they're all full, suggest alternatives that satisfy the same requirement.
     - Past terms are locked (from the transcript). The current term is marked "registered" by the student, since there's no Testudo login. Section-level building works only for terms whose Schedule of Classes is published; later terms are course-level only.
4. **Advising.**
   - 4-year level: what-if audits (minor, major switch, graduate early, abroad), timeline warnings, optimizer.
   - Semester level: which courses to take, which sections, a registration-day priority plan, workload check.
   - Rule: **the rules engine is the source of truth, and the LLM only explains** (via tool use).
5. **Grades and personalization.**
   - Import from the unofficial transcript PDF, pasted Testudo text, or manual entry, with a confirmation screen.
   - Imported grades auto-fill the audit and are checked against minimum-grade and GPA rules.
   - Strength profile = grade relative to the course's PlanetTerp average, grouped by skill area. Grade predictions are shown as ranges. Difficulty scores are personalized.
   - LLM feedback: encouraging tone and honest about how little data it's based on.
   - Privacy: stored on the device by default, explicit consent before anything goes to the LLM, no name or UID sent, one-tap delete.
6. **Difficulty and professors.**
   - Course score from PlanetTerp average GPA, W/F rate and review sentiment. Semester score from total difficulty and credit load. Shown as a score out of 10 with one short sentence on why, no bullet points (owner ruling 2026-09-27; first draft).
   - LLM professor summaries cached each term and linked to the current Schedule of Classes.
7. **Reviews (student-written).**
   - Sign-in limited to umd.edu/terpmail addresses; reviews displayed anonymously.
   - One review per course, professor and term for each account.
   - LLM pre-screen, report, block and contact options, as Apple Guideline 1.2 requires.
   - Terms of service covering defamation.
8. **Campus tab.**
   - Dining menus, library hours, RecWell hours and fitness classes.
   - A study-room availability grid covering every library and room type.
9. **Buses: removed 2026-10-29 (PROJECT_MEMORY section 2). Only the walking "leave by" survives, on Today.**
   - Opens to nearby stops, with large countdowns and a clear "live" vs "scheduled" label.
   - Favorite routes, service alerts, and route colors and shapes drawn on the map.
   - Event routes (football, Maryland Day, Commencement) appear only on the days they run.
   - **Class-aware "leave by" times:** "Leave by 9:42 to make CMSC351 in IRB."
   - iOS Live Activity and Dynamic Island countdown for the next bus, plus a widget. Link out to Transit for extras.
10. **Seat and waitlist (spike).**
   - Monitor tracked sections during one registration window.
   - Ship waitlist check-in reminders regardless of the spike's outcome.
