# UI rework: design spec (owner-approved 2026-10-05)

The owner approved this direction from mockups in `docs/design/ui-rework/` (open `option-final.html` or
`option-final-dark.html` in a browser; screenshots in `docs/screenshots/ui-rework/final-*.png`). Builders
build **from this file and their brief**; the mock CSS (`option-final.css`, layered on `option-b.css` and
`base.css`) is the reference for exact values when this file is silent.

Owner picks, in order: direction **B "Widgets"**; tiles from **B1** (area tint) and **B2** (flat hairline
border, no shadow); class blocks **S1**; block text **scales to fit, never hidden or cut**; dining must
**not look brown**; Today dining tiles list **foods**, not stations; **"Search for a food"** on Today and
Dining; Browse-layouts blocks **always labelled** (course + section); logo centered at 110% (done).
Desktop keeps the full labelled sidebar (Claude's assumption, shown to the owner, not objected to).

## 1. Tokens (already in `apps/web/app/globals.css`)

- `--font-display`: Plus Jakarta Sans (next/font, self-hosted) with `ui-rounded` fallback. Use for page
  titles (`h1`), section titles, tile names, hero text and big numbers. Body text stays `--font`.
- `--r-tile: 22px`, `--tile-border`: every tile/card in the rework is `background` + `1px solid
  var(--tile-border)` + `border-radius: var(--r-tile)` + **no box-shadow** (owner: cards must stay distinct
  under dark-mode extensions, so borders, not shadows).
- Area tints: `--tint-dining/study/fitness/transport` (light fills), `--ink-*` (icon color on the tint),
  `--chip-*` (solid icon chip color, used in dark mode). **Dark mode: tiles are `var(--surface)` graphite,
  never tinted**; the icon sits in a solid `--chip-*` circle/rounded square with white glyph.
- `--hero-bg`: the next-class hero widget gradient (white text).
- `--course-N-solid` / `--course-N-deep` (N = 0..7): S1 class blocks. The old `--course-N-bg/fg` pastels
  stay for swatches, teacher strips and panels.
- `--cat-<category>-bg/fg`: plan-row pastels (major, gened, college, elective, other).
- Accent, surfaces, text, status colors, radii `--r-lg/md/sm`, `--spring`, `--fast`: unchanged.

## 2. Shell (`components/Nav.tsx`, `Nav.module.css`, `layout.tsx`)

- **Desktop sidebar** (≥ 900px): unchanged structure. Active tab: `var(--surface)` pill with
  `1px solid var(--tile-border)`, accent text and icon, `border-radius: 14px`; hover `var(--surface-2)`.
  Brand and tab labels use `--font-display`.
- **Phone tab bar**: a **floating pill**: `margin: 0 14px calc(10px + env(safe-area-inset-bottom))`,
  `padding: 8px 6px`, `border-radius: 28px`, `background: rgb(255 255 255 / .92)` (dark: `rgb(28 28 30 /
  .92)`), `1px solid var(--tile-border)`, `backdrop-filter: blur(20px)`, soft shadow in light only
  (`0 8px 30px rgb(20 24 40 / .14)`). Active tab accent with stroke 2.25. Pages keep bottom padding so content
  clears the bar (`ui.module.css .page`: ≥ 104px + safe area).
- The phone top bar is unchanged (wordmark + About/Report/Donate/theme icons).

## 3. Shared primitives (`components/ui.tsx`, `ui.module.css`)

Add, keep the old ones working for pages not yet reworked:

- `Tile({ href, icon, area, title, sub, status?, accent? })`: the B1/B2 tile. Column layout: 32px icon
  box (`border-radius: 10px`, `background: var(--surface)` on a tinted tile, light; dark: `--chip-*`
  solid, white glyph), name (`--font-display` 600 15px), sub line (12.5px, up to 2 lines, ellipsis,
  `color: rgb(29 29 31 / .62)` light / `rgb(245 245 247 / .66)` dark), `min-height: 112px`, `padding:
  14px 14px 12px`. `status` renders the sub as colored text with a 7px dot: open green, soon amber, closed
  gray. `accent` makes the tile solid `var(--accent)` with white text (e.g. "Find a study room").
  Area tint from `area` (`dining|study|fitness|transport`); light only.
- `TileGrid`: 4 columns on desktop, 2 on phones, `gap: 12px` (10px phones). A single full-width variant
  for one-item groups (transport): row layout, `min-height: 0`.
- `Hero({ label, title, sub, href })` on `--hero-bg`, and `HeroStat({ number, text, small })`: white
  (`--surface`) tile with the number in `--accent`, 36px display 700, tabular numerals. Hero row: desktop
  `grid-template-columns: 1fr 240px; gap: 12px`; phones stack.
- `SearchField({ placeholder, href | onSubmit })`: 44px, `border-radius: 14px`, surface, tile border,
  magnifier icon left, placeholder in `--text-3`.
- `Card` gains the tile border and loses its shadow (same radius `--r-lg`); `SubTabs` (the Plan / Prior
  credit / Audit / What if switch) becomes a surface pill with the **active segment solid accent, white
  text** (`border-radius: 14px`, inner 11px).
- Buttons: unchanged shapes; primary stays accent.

## 4. Today (`app/page.tsx`)

Order: Hero row → Dining → Study → Fitness → Transport. Section title (`--font-display` 17px) with a
trailing accent link ("All menus", "All hours", "All gyms", "Map").

- **Hero**: "NEXT CLASS" label, `CMSC132 · 2:00 PM`, sub "Iribe Center 0324 · leave by 1:46 from
  McKeldin" (from the saved plan + walk estimate, as the Transport leave-by card does; if no plan or no class
  left today, the hero shows the next academic date instead). Beside it `HeroStat` with the registration
  countdown (replaces `RegistrationCountdown`'s card; keep its data code).
- **Dining**: `SearchField` "Search for a food across all dining halls" (opens `/campus/dining?q=`),
  then tiles for the three halls + Stamp. **Sub line = foods**: "Lunch: Orange chicken, Margherita pizza,
  Chicken shawarma": the current meal name, then the first three *items* (not station names) from the
  meal's main stations in menu order, skipping condiment/beverage/bread stations. Stamp: "11 of 14 open ·
  Panda Express, Chick-fil-A, Subway until 7pm".
- **Study**: McKeldin, STEM, Hornbake (status sub) + accent tile "Find a study room" / "N rooms open
  right now" (count from the rooms data; "Open rooms at every library" if unavailable).
- **Fitness**: three main gyms (status). **Transport**: one full-width tile "Shuttle-UM" / "12 routes
  running · next departures near you".
- Skeletons: tile-shaped.

## 5. Campus (`app/campus/*`)

- Sub-nav (`CampusNav`): the `SubTabs` pill (active solid accent).
- **Dining**: `SearchField` at the top (wired to the existing `searchMenus` / `/api/dining/search`;
  results list foods with hall, meal and station), hall **chips** (active solid accent), meal `SubTabs`,
  an "Open · lunch until 2pm, dinner from 4:30pm" line in `--open`, then stations as small uppercase
  headers over a peach (`--tint-dining`; dark: surface) bordered card of food rows with muted diet tags.
  Keep the single 680px column.
- **Libraries, Gyms, Rooms, Transport**: lists become `TileGrid`s of `Tile`s with status; detail panels
  (hours tables, room grid, map) keep their layout but take the tile border/no-shadow treatment.

## 6. Schedule builder (`app/schedule/*`)

- **Class blocks (S1)** in the week calendar, the layout editor and the gallery: `background:
  var(--course-N-solid)`, `color: #fff`, `border: 1.5px solid var(--course-N-deep)`, `border-radius: 7px`
  (gallery 4px, 1px border), `box-shadow: var(--block-shadow)`. Grid lines lighter (`rgb(60 60 67 / .09)`,
  dark `rgb(235 235 245 / .1)`).
- **Block text**: two centered lines, course number (bold) over room (week view) or section (gallery).
  Both lines **always show**; `white-space: nowrap; overflow: hidden`, `line-height: 1.12`, no ellipsis
  needed because the font scales: `font-size: min(clamp(6px, 30cqh, 9.5px), 15cqw)` for the course line
  and `min(clamp(5.5px, 25cqh, 8.5px), 14cqw)` for the second (`container-type: size` on the block;
  gallery: `min(clamp(5px, 34cqh, 8px), 15cqw)` / `min(clamp(4.5px, 28cqh, 7px), 16cqw)`). Ghost previews
  keep the dashed/faded look on top of this.
- **Browse layouts**: every mini block labelled (course + section) at all times. Desktop grid 3 columns;
  **phones 1 column** so labels stay readable. Card: surface, tile border, 16px radius, "Layout N" +
  "15 cr · no Fridays" header, mini week, teacher strip (2 columns, color square + surname + rating).
- Teacher strip squares use `--course-N-solid`.

## 7. Advisor (`app/advisor/*`)

- Header actions unchanged; `SubTabs` pill. Summary becomes a tile: credits planned, "N to fix" badge,
  a thin green meter and "62% of the degree audit met" (from the audit result).
- Term cards: tile treatment (22px radius, border, no shadow); a term with an error gets a 2px accent
  ring (`box-shadow: 0 0 0 2px rgb(186 12 47 / .25)`).
- **Course rows**: `border-radius: 12px`, fill `--cat-<category>-bg`, course number in
  `--cat-<category>-fg` 600, title and credits at 62% ink. Category = the audit's requirement category
  the course satisfies in this plan (major, gened, college, elective, other); unassigned → `other`.
  Legend row under the plan (dot + label per category present).
- "Must fix" block: 12px radius, accent tint, no left bar. "+ Add course": surface-2 pill, no dashes.

## 8. Calendar, About, Report, Donate, Terms, Privacy, Coming soon

Cards take the tile treatment (border, no shadow, 22px); titles use `--font-display`. No layout changes.

## 9. Rules that apply everywhere

- Light and dark both checked, with screenshots (`npm run ui-check` phone and `--desktop`, `--dark`).
- No emoji icons; the existing `components/icons.tsx` set (add `SearchIcon`).
- Touch targets ≥ 44px; focus rings kept; `prefers-reduced-motion` honored.
- Nothing wraps or clips in blocks, tiles or chips; wrap chips before shrinking labels.
- Keep the course-color assignment logic; only the paint changes.
