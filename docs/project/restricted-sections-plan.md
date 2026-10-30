# Program-Restricted Sections Warning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The schedule builder warns when a course or section is limited to a special program the student may not be in (Science in the Evening, Honors, College Park Scholars, Living-Learning Programs, FIRE, Freshman Connection, QUEST, Shady Grove, ...).

**Architecture:** Testudo already states these limits in text: a course-level "Restriction" line (e.g. CPBE101 "Students must be matriculated into the College Park Scholars Business, Society & Entrepreneurship program.") and a section-level note under the section (e.g. BSCI160 SES1 "Must be in the Science in the Evening (SIE) Program or the Scientific Foundations of Health and Disease Certificate."). The scraper keeps the course line but drops the section note. Task 1 scrapes the section note, carries both texts into the schedule data files, and classifies them with one pure function. Task 2 shows the warning in the builder.

**Tech Stack:** TypeScript, cheerio (scraper), Vitest, Next.js (apps/web).

**Spec:** this file (owner request 2026-10-30: "you should be warned for adding classes in programs you might not qualify for (ex. honors college, college park scholars, FIRE, LLP's, science in the evening, freshman connection, etc.)").

## Global Constraints

- Warn, never block: the student may be in the program. Restricted sections stay selectable and stay in generated layouts.
- Only **program** limits warn (special programs, LLPs, Scholars, Honors, off-campus sites). Plain major, college or class-standing limits ("Must be in Computer Science") do not warn here.
- The warning names the program in plain words, taken from Testudo's text: "Only for students in Science in the Evening". If no program name can be pulled out, use "Only for students in a special program" and show Testudo's sentence below it.
- Section-number fallbacks, used only when there is no note: `SES*`/`SEF*` → Science in the Evening, `FC*` → Freshman Connection, `ESG*` → Universities at Shady Grove.
- Data format change is additive and **does not bump `SCHEDULE_FILE_VERSION`**: the new fields are optional, and decoders read a file without them as "no notes, no restriction". Otherwise every stored file would be rejected after the deploy and the builder would show no sections until the refresh rewrote all ~200 departments.
- Run tests per package while iterating; at the end `npm test`, `npx tsc --noEmit`, `npm run lint` in apps/web and the course-data tests. No GitHub Actions.

## Review Focus

1. **A section with a note but a course with no restriction** (BSCI160: only SES1 is limited): only SES1 warns; 0101 etc. don't. Test in Task 1 and Task 2.
2. **A course-level program restriction** (CPBE101): every section of it warns, and the course chip warns as soon as it is added, before any section is picked. Test in Task 2.
3. **Restriction text that names a major, not a program** ("Must be in a major within the BSOS-Economics department"): no warning. Test in Task 1.
4. **Stored files written before this change** (no `rs`, 8-element section rows): they decode fine with `notes: null` and `restriction: null`, and the builder works without warnings until the refresh rewrites them. Test in Task 1.
5. **Very long Testudo sentences** on a phone: the program name line stays short; the full sentence wraps under it, never cut off sideways. Checked in Task 2's screenshot.

---

### Task 1: Scrape section notes, carry restriction text, classify programs

**Files:**
- Modify: `packages/course-data/src/soc.ts` (`Section` gets `notes: string | null`; parse `.section-texts-container .section-text` inside each `.section`, joined with a space)
- Modify: `packages/course-data/src/schedule-files.ts` (per course: `"rs"` = the course restriction text or omitted; per section row: append the note as an optional 9th element; same version; decoders treat both as optional; update `SCHEDULE_FILES.md`)
- Create: `packages/course-data/src/program-restriction.ts`
- Test: `packages/course-data/test/program-restriction.test.ts`, the existing soc parse and schedule-files tests (fixture: save Testudo's `https://app.testudo.umd.edu/soc/202701/BSCI/BSCI160` page as `test/fixtures/soc-bsci160.html`; the main session can fetch it if the builder can't)

**Interfaces:**
- Produces: `programRestriction(text: string | null, sectionId?: string): { program: string | null; text: string | null } | null` — null when no program limit; `program` is the plain name ("Science in the Evening", "College Park Scholars", "Honors College", "QUEST", "Freshman Connection", "Universities at Shady Grove", "FIRE", or the LLP's own name), or null when the text is a program limit but no name could be pulled out.
- Produces: decoded `Section` (apps/web side, `@turboterp/course-data/schedules`) gains `notes: string | null`; the decoded course gains `restriction: string | null`.

- [ ] **Step 1: Failing tests** for `programRestriction`, with real Testudo sentences:
  - `"Must be in the Science in the Evening (SIE) Program or the Scientific Foundations of Health and Disease Certificate."` → program `"Science in the Evening"`
  - `"Students must be matriculated into the College Park Scholars Business, Society & Entrepreneurship program."` → `"College Park Scholars"`
  - `"Must be in the QUEST Program (TQMP)."` → `"QUEST"`
  - `"Restricted to Communication Majors at the Universities at Shady Grove."` → `"Universities at Shady Grove"`
  - Honors College / University Honors / Gemstone / Design Cultures & Creativity / Integrated Life Sciences / Honors Humanities / Entrepreneurship & Innovation / ACES / FIRE (First-Year Innovation & Research Experience) / CIVICUS / Freshman Connection sentences → their names (the builder finds a real sentence for each in `packages/course-data/.cache/soc-202701.json` / `soc-202608.json` course texts; if one has none this term, say so in the report rather than inventing one)
  - `"Must be in a major within the BSOS-Economics department."` → null; `"Must be in Computer Science program."` → null; `null` → null
  - Section-number fallback: `programRestriction(null, "SES1")` → Science in the Evening; `"FC02"` → Freshman Connection; `"ESG1"` → Universities at Shady Grove; `"0101"` → null
- [ ] **Step 2:** Failing scraper test: parsing the BSCI160 fixture gives SES1 `notes` containing "Science in the Evening" and 0101 `notes === null`. Failing schedule-files test: a round trip keeps `notes` and `restriction`; a file written the old way (no `rs`, 8-element rows) decodes with `notes: null`, `restriction: null`.
- [ ] **Step 3: Run** `npx vitest run --root packages/course-data` (from apps/web, as the existing tests do). Expected: FAIL.
- [ ] **Step 4: Implement.** Keyword table first (one entry per program: name + regex), then a generic "must be (in|enrolled in|matriculated into|admitted to) the <X> program" capture as a last resort that returns `program: null` with the text. Program patterns must not match plain major restrictions.
- [ ] **Step 5: Run** the same tests. Expected: PASS. Then rebuild the local data once (`npm run schedule-data -w @turboterp/course-data` reads the cached SOC snapshot; if section notes need a fresh scrape, say so in the report and the main session runs `npm run snapshot -w @turboterp/course-data -- 202701`).
- [ ] **Step 6: Commit** `Schedule data: section notes and course restrictions; programRestriction classifier`.

---

### Task 2: Warn in the schedule builder

**Files:**
- Create: `apps/web/lib/schedule/restrictions.ts` (+ `apps/web/lib/schedule/__tests__/restrictions.test.ts`)
- Modify: the course chip list (`app/schedule/CoursePicker.tsx`), the section panel (`app/schedule/SectionPanel.tsx`), and the layout notes where the overlap note already shows (`app/schedule/WeekEditor.tsx`; Browse cards in `app/schedule/Gallery.tsx` next to the tight-walk line)

**Interfaces:**
- Consumes: `programRestriction`, `Section.notes`, course `restriction` (Task 1).
- Produces: `sectionRestriction(section: Section, courseRestriction: string | null): { program: string | null; text: string | null } | null`; `restrictionNote(r): string` → `"Only for students in Science in the Evening"` or `"Only for students in a special program"`; `layoutRestrictions(sections, courseRestrictions): { courseId: string; sectionId: string; note: string }[]`.

- [ ] **Step 1: Failing tests** for the three functions: SES1 → "Only for students in Science in the Evening"; a 0101 of the same course → null; any section of a course whose restriction is College Park Scholars → "Only for students in College Park Scholars"; a layout with SES1 lists one entry.
- [ ] **Step 2: Run** `npx vitest run lib/schedule/__tests__/restrictions.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement**, then the UI:
  - Section panel: each restricted section shows a small amber line under its times, "Only for students in Science in the Evening", with Testudo's sentence in smaller gray text beneath.
  - Course chip: a course with a course-level program restriction gets an amber dot and, under the search box, "CPBE101 is only for students in College Park Scholars."
  - Week view (Build my own) and Browse cards: when the shown layout has a restricted section, one amber line in the existing notes area: "BSCI160 SES1 is only for students in Science in the Evening." (several → one line each in the week view; Browse cards show the first, like the tight-walk line).
  - Amber = the existing "soon"/warning color token; no new colors.
- [ ] **Step 4: Run** the test file, then `npm test`, `npx tsc --noEmit`, `npm run lint`. Expected: PASS.
- [ ] **Step 5: Screenshots** (at most 2, phone width): the BSCI160 section panel showing SES1's warning, and a Build-my-own week with BSCI160 SES1 picked. Save to `docs/screenshots/restricted-sections/`.
- [ ] **Step 6: Commit** `Schedule builder: warn on program-restricted courses and sections`.

## After the tasks (main session)

- Merge, run the full suite and build, deploy. The seat refresh (every 5–15 min, one department at a time) rewrites the section files with notes; warnings appear department by department as it goes, and nothing breaks meanwhile.
- Option for the owner later: rank restricted sections last when generating layouts (not in this plan: warn only).
