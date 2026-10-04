# Grade-distribution files

Pre-built PlanetTerp grade distributions for every course in the current
Schedule of Classes. Students see them in two places:

- **Schedule builder, section panel:** the distribution for *that professor* in *that course*.
- **4-year plan, course detail:** the *course-wide* distribution.

Pages never call PlanetTerp. These files are built offline and served as
static, CDN-cached snapshots. Thousands of students read them.

## Refresh cadence

**Once per term**, after the new Schedule of Classes snapshot exists (PlanetTerp
adds a term's grades some months after it ends, so more often gains nothing):

```sh
npm run snapshot -w @turboterp/course-data -- <term>   # if not already done
npm run grades -w @turboterp/ratings [-- <outDir>] [--soc <path/to/soc-YYYYMM.json>]
```

- Reads the newest `packages/course-data/.cache/soc-*.json` (or `--soc`).
- Fetches `GET https://planetterp.com/api/v1/grades?course=<ID>` for each course,
  **one at a time with a 500 ms pause**, and caches each raw body in
  `packages/ratings/.cache/planetterp-grades/<ID>.json`. PlanetTerp's
  not-found reply (HTTP 400) is cached as `{"error":"course not found"}`.
  Other failures (5xx, timeouts) are not cached and are listed at the end.
- **Resumable:** a rerun skips cached courses. For a new term, delete
  `.cache/planetterp-grades/` to fetch fresh data.
- Writes `<DEPT>.json` for every department plus `index.json` to the output
  directory (default `packages/ratings/.cache/grades-out/`). It also writes a
  professor-name report to `packages/ratings/.cache/grade-name-report.json`.
- Nothing here is committed. Everything is under the gitignored `.cache/`.

## Files

### `<DEPT>.json` (one department, e.g. `CMSC.json`)

```jsonc
{
  "v": 1,                                  // format version
  "dept": "CMSC",
  "term": "202701",                        // SOC term whose course list was used
  "generatedAt": "2026-09-25T20:00:00.000Z",
  "columns": ["A+","A","A-","B+","B","B-","C+","C","C-","D+","D","D-","F","W","Other"],
  "courses": {
    "CMSC351": {
      "c": [ /* 15 counts, in `columns` order: course-wide */ ],
      "t": ["201201", "201208", "…"],      // Testudo terms covered, sorted
      "p": {                               // per professor
        "Clyde Kruskal": { "c": [ /* 15 counts */ ], "t": ["201208", "…"] }
      }
    }
  }
}
```

- **Only counts and terms are stored.** Shares, average GPA and the student
  total follow from the counts. Decode them with `decodeDepartment` (below)
  instead of re-deriving them.
- **Courses PlanetTerp has no data for are left out.** A course missing from
  its department file means "no grade data".
- `Other` is PlanetTerp's catch-all for non-letter marks (P, I, etc.).
- Sections PlanetTerp lists without a professor count toward the course-wide
  `c`, so it can exceed the sum of `p`.
- `p` keeps every professor PlanetTerp has for the course, including past
  ones. When a PlanetTerp name matches a Schedule of Classes instructor, the
  key uses **the SOC's spelling**. A match means the names differ only in
  case, punctuation, accents or a middle name. The section panel can then
  look up `p[section.instructor]` directly.

### `index.json`

```jsonc
{
  "v": 1, "source": "planetterp.com", "term": "202701", "generatedAt": "…",
  "counts": { "offered", "withData", "withoutData", "failed",
              "renamedProfessors", "unmatchedInstructors", "departments", "bytes" },
  "departments": { "CMSC": { "courses": 190, "withData": 120, "bytes": 81234 } }
}
```

## Decoded shape (what the UI works with)

`decodeDepartment(json)` from `@turboterp/ratings` returns
`Record<courseId, CourseGrades>`:

```ts
type CourseGrades = {
  course: string;
  overall: Distribution;                    // 4-year plan course detail
  byProfessor: Record<string, Distribution>; // schedule builder section panel
  terms: string[];
};
type Distribution = {
  counts: Record<"A+"|"A"|…|"F"|"W"|"Other", number>;
  shares: Record<"A"|"B"|"C"|"D"|"F"|"W"|"Other", number>; // fraction of ALL students (W, Other included)
  averageGpa: number | null;  // letter grades only (W and Other excluded); UMD points, A+ = 4.0
  students: number;           // everyone, W and Other included
  terms: string[];
};
```

The build uses `summarizeCourseGrades(course, rows, socInstructors)`. It
returns the same shape plus a `names` report: PlanetTerp names re-keyed to
SOC spellings, and SOC instructors with no PlanetTerp record, each with
same-last-name candidates.

## How the web app should load it

- Load **one department file at a time** when a student opens a course or
  section in that department. Cache it in memory for the session. Never load
  every department at once.
- Serve the files as static assets or from the shared snapshot store, with
  long CDN cache lifetimes. They change once per term. Use `generatedAt` or a
  versioned path to bust caches after a refresh.
- Fetch `index.json` only if you need the counts or the list of departments.
- Missing course → show "No grade data on PlanetTerp". Missing professor in
  `p` → "No grade data for this professor" (common for new instructors).
- Credit PlanetTerp as the source.
