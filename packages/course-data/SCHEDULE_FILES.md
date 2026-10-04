# Schedule builder data files

The schedule builder generates layouts **in the student's browser** (a Web Worker), so
thousands of students can use it at once without server work. The browser downloads
pre-built, CDN-cacheable files; no page view ever scrapes Testudo or calls PlanetTerp.

## Build (once per Schedule of Classes snapshot)

```sh
npm run snapshot -w @turboterp/course-data -- 202701     # Testudo → packages/course-data/.cache/soc-202701.json
npm run professor-ratings -w @turboterp/ratings          # PlanetTerp /professors → packages/ratings/.cache/professor-ratings.json
npm run grades -w @turboterp/ratings                     # PlanetTerp /grades → packages/ratings/.cache/grades-out/ (see ../ratings/GRADES.md)
npm run schedule-data -w @turboterp/course-data          # everything above → the snapshot store
```

`schedule-data` flags: `--soc <file>`, `--ratings <file>`, `--grades <dir>`, `--dir <snapshot dir>`.
Ratings and grades are optional: without them professors show as unrated and the section
panel says "No grade data". Nothing here is committed; all inputs and outputs are gitignored.

- `professor-ratings` pages through `GET /professors?limit=100&offset=N` (100 is the API's
  maximum; ~145 pages) one at a time with a 500 ms pause, caching each raw page in
  `packages/ratings/.cache/planetterp-professors/` so a rerun resumes. Delete that folder
  to refetch (once per term is plenty). Names are matched to the Schedule of Classes
  spelling: an exact name (ignoring case, accents, punctuation) first, else a unique
  first-and-last-name match; ambiguous names are left unrated.
- `schedule-data` writes into the same snapshot store as the campus data
  (`packages/campus-data/SNAPSHOTS.md`; `<repo>/.cache/snapshots` by default, or
  `$TURBOTERP_SNAPSHOT_DIR`). `schedule/current` is written last, so the app never points
  at a half-written term.

## Keys and URLs

| Snapshot key | URL (apps/web) | Cache | Size (Spring 2027) |
| --- | --- | --- | --- |
| `schedule/current` → `{ term }` | `/api/schedule/current` | 5 min | tiny |
| `schedule/<term>/index` | `/api/schedule/<term>/index` | 1 day, SWR 1 week | 231 KB (≈60 KB gzipped), 3,695 courses |
| `schedule/<term>/sections/<DEPT>` | `/api/schedule/<term>/sections/<DEPT>` | 1 hour, SWR 1 day | 199 files, 978 KB total, largest BMGT 44 KB |
| `schedule/<term>/grades/<DEPT>` | `/api/schedule/<term>/grades/<DEPT>` | 1 day, SWR 1 week | 199 files, 2.1 MB total |

A student picking CMSC351 + STAT400 + ENGL394 downloads the index plus three section
files (≈90 KB before gzip); grade files load only when the section panel opens.

## Formats (`src/schedule-files.ts`; decode with `decodeCourseIndex` / `decodeDepartmentSections`)

```jsonc
// index
{ "v": 1, "term": "202701", "generatedAt": "…",
  "courses": [["CMSC351", "Algorithms", 3, 3, 6], …] }   // id, title, credits min, max, section count

// sections/<DEPT>
{ "v": 1, "term": "202701", "dept": "CMSC", "generatedAt": "…",
  "courses": { "CMSC351": { "t": "Algorithms", "cr": [3, 3],
      "s": [["0101", ["Ting Jiang"], 150, 150, 0, 0, "f2f",      // id, instructors, open, total, waitlist, holdfile, delivery
             [["MWF", 600, 650, "IRB", "0324", "Lecture"]]]] } }, // days, start, end (minutes or null), building, room, type
  "ratings": { "Ting Jiang": 3.1 } }                             // this department's rated instructors only
```

- Only courses with at least one section are in the index.
- `"Instructor: TBA"` is dropped: an empty instructor list means TBA.
- Full sections stay in the files (seat counts change); the builder excludes them.
- Bump `SCHEDULE_FILE_VERSION` when a format changes; decoders reject other versions.
