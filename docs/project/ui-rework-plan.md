# UI rework: implementation plan

> **For agentic workers:** one builder per task (Sonnet, own worktree and branch, test-first, push early);
> at most two builders at once; no reviewer subagents (PROJECT_MEMORY section 18). The main session
> reviews each branch with screenshots, merges into `feat/ui-rework`, then into `feat/course-data`.

**Goal:** rebuild TurboTerp's web UI in the owner-approved "Widgets" direction without changing data or logic.

**Architecture:** tokens are already in `apps/web/app/globals.css` (Task 0, done). Task 1 builds the shell
and the shared tile primitives; every later task restyles one tab on top of them. Logic that decides
*what* to show (foods line, block label sizing, plan-row category) lives in `lib/` with vitest tests; the
paint lives in CSS modules and is checked with `npm run ui-check` screenshots.

**Tech stack:** Next.js 16 app router, React 19, CSS modules, vitest (node, pure logic; no DOM tests),
`scripts/ui-check.mjs` (headless Edge screenshots), `next/font` for Plus Jakarta Sans.

**Spec:** `docs/project/ui-rework.md` (read it; section numbers below refer to it). Mock reference:
`docs/design/ui-rework/option-final.css` and `docs/screenshots/ui-rework/final-*.png`.

## Global constraints

- Tokens only: no raw hex in components; new colors go in `globals.css` first.
- Every card/tile: `1px solid var(--tile-border)`, `border-radius: var(--r-tile)`, **no box-shadow**.
- Dark mode: tiles are `var(--surface)`, never tinted; icon chips use `--chip-*`.
- Block and tile text never wraps, clips or hides; blocks scale their font (spec §6).
- Touch targets ≥ 44px; keep focus rings; keep `prefers-reduced-motion`.
- Icons from `components/icons.tsx` only (add `SearchIcon`); no emoji.
- Each builder: quiet output (`--reporter=dot`, `tail -n 30`), tests → typecheck → lint → build once at
  the end, two `ui-check` screenshots of its main page (phone light, desktop `--dark`), ≤ 40 tool calls,
  push at every green step. Navigate with the graphify graph; read only files you change.

## Review focus (main session checks these at merge; builders add the named test)

1. A meal whose main stations have no items (only filler) → foods line falls back to station names, never
   "Lunch: " with nothing after it (Task 2 `mealFoods` test).
2. A 25-minute block or a 50px-wide gallery column → both label lines still render at the floor size,
   never empty (Task 4: screenshot of a phone gallery card; `blockLabel` test for the section fallback).
3. A course the audit assigns to no requirement → plan row uses `other`, legend shows "Other" only when
   present (Task 5 `rowCategory` test).
4. Dark mode with Dark Reader-style flattening → every tile still outlined (border, not shadow): check
   the `--dark` desktop screenshot of each task.
5. Phone at 375px: four tiles per Today section wrap to two columns, floating tab bar never covers the
   last tile or a bottom button (Task 1/2 phone screenshots scrolled to the bottom: `--full`).

---

### Task 0: tokens, font, logo (done by the main session, 2026-10-05)

`globals.css` tokens (spec §1), Plus Jakarta Sans via `next/font` in `app/layout.tsx`, logo centered at 110%
(`app/icon.svg`, `lib/logo.ts`, `lib/__tests__/logo.test.ts`), spec and this plan. Branch `feat/ui-rework`.

### Task 1: shell and shared primitives — branch `feat/ui-shell`

**Files:** modify `components/Nav.tsx`, `Nav.module.css`, `components/ui.tsx`, `ui.module.css`,
`components/Segmented.tsx` (+css), `components/icons.tsx`; test `lib/__tests__/tiles.test.ts` (new) for
`lib/tiles.ts` (new).
**Produces:** `Tile`, `TileGrid`, `Hero`, `HeroStat`, `SearchField` exports from `components/ui.tsx`
(props in spec §3); `SubTabs` styling via the existing `Segmented` (active solid accent); `Card` with the
tile border and no shadow; `SearchIcon`.
**Logic to test first** (`lib/tiles.ts`): `tileStatusTone(status: Status): "open" | "soon" | "closed"`
(maps `unknown` → `closed`) and `clampSub(text: string, max = 72): string` (cuts at a word boundary and adds
"…" so a sub line never exceeds two lines on a 160px tile). Tests: open/soon/closed/unknown mapping; a 90-char
sub is cut to ≤ 72 ending in "…" at a space; a short sub is unchanged.
**Steps:** write the two tests → fail → implement → pass → push. Then: Nav desktop active pill, phone floating
pill tab bar, page bottom padding (spec §2) → `Tile`/`TileGrid`/`Hero`/`HeroStat`/`SearchField` (spec §3)
→ `Card`/`Segmented` restyle → wrap the existing Today rows in `TileGrid`? **No**: Today is Task 2; leave
`app/page.tsx` as is. Verify with a throwaway page? **No**: screenshot `/` (old content in the new shell) and
`/campus/libraries` instead.
**Done:** tests green; typecheck, lint, build green; `ui-check /` phone light and `--desktop --dark`; the
floating tab bar clears the page's last row (`--full`).

### Task 2: Today — branch `feat/ui-today` (after Task 1 merges)

**Files:** modify `app/page.tsx`, `app/RegistrationCountdown.tsx`, `lib/status.ts`, `lib/__tests__/status.test.ts`
(create if missing); new `lib/next-class.ts` + `lib/__tests__/next-class.test.ts`.
**Consumes:** Task 1 primitives. `getLeaveBy`-style helpers in `lib/schedule/leave-by.ts` and the saved plan
reader used by `app/campus/transport/LeaveByCard.tsx` (reuse, don't copy).
**Logic to test first:**
- `mealFoods(meal, count = 3): string` in `lib/status.ts`: "Lunch: Orange chicken, Margherita pizza, Chicken
  shawarma" = meal name + first `count` *item names* from non-`FILLER` stations in menu order (breakfast rule
  as `mealHighlights`); no items anywhere → fall back to `mealHighlights`; never ends in ": ". Tests: three
  items across two stations; a filler-only meal; an empty meal → "Lunch: No menu posted".
- `nextClass(plan, now)` in `lib/next-class.ts`: returns `{ courseId, start, room, leaveBy? } | null` for the
  next meeting today after `now`, null when none left. Tests: morning → first class; after last class → null;
  no plan → null.
**UI (spec §4):** hero row (`Hero` from `nextClass`, else the next academic date from `lib/calendar.ts`;
`HeroStat` registration countdown), Dining `SearchField` → `/campus/dining?q=` + four tiles with `mealFoods`,
Study tiles + accent "Find a study room" with the open-room count, Fitness tiles, Transport full-width tile.
Tile-shaped skeletons.
**Done:** tests green; full suite green; `ui-check /` phone light `--full` and `--desktop --dark`.

### Task 3: Campus — branch `feat/ui-campus` (after Task 1 merges; may run beside Task 2)

**Files:** modify `components/CampusNav.tsx` (+css), `app/campus/dining/DiningView.tsx` (+css),
`app/campus/libraries/page.tsx`, `app/campus/gym/page.tsx`, `app/campus/rooms/RoomsView.tsx` (+css),
`app/campus/transport/*.module.css` (border/no-shadow only); test `lib/__tests__/dining-search.test.ts`.
**Logic to test first:** `parseDiningQuery(searchParams): string | null` (trims, drops < 2 chars) and the
results grouping `groupSearchHits(hits): { hall, meal, station, items[] }[]` over the existing
`searchMenus` output. Tests: "  orange chicken " → "orange chicken"; "a" → null; hits from two halls group
by hall then meal.
**UI (spec §5):** `SearchField` at the top of Dining bound to `?q=` (results replace the menu while a query
is set; "No foods match" empty state), hall chips (active solid accent), meal `SubTabs`, open line, station
headers over the peach food card; Libraries/Gyms/Rooms lists as `TileGrid`s of `Tile`s with status.
**Done:** tests green; full suite green; `ui-check /campus/dining` phone light and `--desktop --dark`;
`/campus/dining?q=chicken` checked through the page text in the ui-check output.

### Task 4: Schedule builder blocks and gallery — branch `feat/ui-schedule` (may run beside Task 1)

**Files:** modify `app/schedule/calendar.module.css`, `builder.module.css`, `Gallery.tsx`,
`WeekCalendar.tsx`, `TeacherStrip.tsx`, `lib/schedule/gallery.ts` (label), tests in
`lib/schedule/__tests__/gallery.test.ts` and `block-items.test.ts`.
**Logic to test first:** `blockLabel(item, view: "week" | "gallery"): { top: string; bottom: string }`:
week → `{ "CMSC132", "IRB 0324" }` (room; "TBA" when none), gallery → `{ "CMSC132", "0101" }` (section id;
"" never). Tests: both views; missing room → "TBA"; discussion meeting uses the same course number.
**UI (spec §6):** S1 blocks with `--course-N-solid/deep`, `--block-shadow`, lighter grid lines; two centered
nowrap lines with the container-unit font scaling (exact values in spec §6); gallery blocks always labelled;
gallery 3 columns desktop, 1 column phones; gallery card styling; teacher strip squares solid. Ghost previews
keep dashed/faded on top. **Do not** touch generation, conflicts or saving.
**Done:** tests green; full suite green; `ui-check /schedule` with `UI_CHECK_EVAL` opening Browse layouts
(see the script header) phone light and `--desktop --dark`; no label clipped at 393px.

### Task 5: Advisor — branch `feat/ui-advisor` (after Task 1 merges)

**Files:** modify `app/advisor/advisor.module.css`, `PlanView.tsx`, `AdvisorApp.tsx` (summary), new
`lib/advisor/row-category.ts` + `lib/__tests__/advisor-row-category.test.ts`.
**Logic to test first:** `rowCategory(courseId, audit): "major" | "gened" | "college" | "elective" | "other"`
from the audit result's requirement → category mapping already used by the Audit tab (find it with
`graphify explain`); and `legendCategories(rows): Category[]` (present categories in fixed order). Tests:
a CMSC course in the major block → "major"; a DSHU course → "gened"; CMNS100 → "college"; unassigned →
"other"; legend lists only present ones.
**UI (spec §7):** summary tile with meter, term tiles with accent ring on error, category-filled course
rows, legend, "Must fix" and "+ Add course" restyle, `SubTabs` pill. **Do not** change audit logic or plan
state.
**Done:** tests green; full suite green; `ui-check /advisor` (seeded owner plan, see
`docs/screenshots/checks-compact/`) `--desktop` light and phone `--dark`.

### Task 6: Calendar and static pages — branch `feat/ui-pages` (after Task 1 merges)

**Files:** `app/calendar/calendar.module.css`, `app/about/about.module.css`, `app/report/report.module.css`,
`app/donate/donate.module.css`, `app/coming-soon/coming-soon.module.css`, `components/LegalDoc.tsx` (+css if any).
**Logic:** none new; no tests beyond the existing suite.
**UI (spec §8):** tile treatment and display font on titles. **Done:** full suite green; `ui-check /calendar`
phone light and `/about --desktop --dark`.

### Task 7: 4-year plan PDF export — branch `feat/ui-pdf` (owner request 2026-10-05; after the owner picks look A or B)

**Files:** modify `apps/web/lib/advisor/export/pdf.ts`, `pdf.test.ts`, `plan-export.ts` (add `title`, `programs`, `catalogYear`, `creditsPlanned`, per-year `credits` and the course `title` to the export when missing; keep `buildPlanExport` pure), `plan-export.test.ts`.
**Reference:** `docs/screenshots/ui-rework/pdf-mock.png` (A: red bands, B: light with red rules) and `docs/design/ui-rework/pdf-mock.html`; the CS department's plan (Year rows × Fall/Spring blocks with Course / Credit / Grade and a Total row) is the inspiration, not a copy.
**Layout (Letter portrait, jsPDF + autotable, lazy-loaded as today):** title "4-year plan"; line 1 programs in bold + catalog year + credits planned; line 2 name, date, disclaimer. One band per academic year: a 112pt left cell ("Year 1 2026–27", credits that year, key dates when present) and one autotable per term (Fall, Spring, plus Winter/Summer only when the plan has them, in a second row). Each term table: term header, columns COURSE (code bold + category dot) / title (ellipsis, never wraps) / CR (right, tabular) / GRADE (center, blank when hidden or none), zebra rows (A) or hairlines (B), bold Total row. Legend of the categories present; footer with the mark, "TurboTerp · turboterp.com" and "Page N of M" on every page. Brand red `#BA0C2F`; category dots: major red, gen-ed blue `#0B63C7`, college green `#1F8A4C`, elective amber `#B08500`, minor/other purple `#6D28D9`.
**Logic to test first:** `pdfRows(exportData)` → the ordered list of `{ year, term, rows: [{ code, title, credits, grade, category }], total }` with title truncation at 46 chars + "…" and year credit sums; tests: two years with a summer term; grades hidden → "" grades; a 60-char title ends in "…"; totals.
**Done:** tests green; full suite green; the PDF rendered once from the seeded owner plan (`ExportMenu` in a dev server, or call `buildPdf` in a node script and save `plan.pdf`) and its first page screenshotted (Edge opens PDFs: `<embed>` in a local HTML and `scripts/ui-check.mjs`-style capture) into `docs/screenshots/ui-pdf/`.

## Order

1. Tasks 1 and 4 in parallel (Task 4 touches only schedule files).
2. After Task 1 merges: Tasks 2 and 3.
3. Then Tasks 5 and 6.
4. Task 7 (PDF) when a builder slot is free and the owner has picked a look.
5. Main session after each merge: full suite, screenshots of both themes, `graphify update .`, status log.
