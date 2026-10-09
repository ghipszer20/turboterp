# Lab pairs: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. PROJECT_MEMORY section 18 overrides that skill's defaults: one Sonnet builder per task, no reviewer subagents, at most 2 at once.

**Goal:** Every UMD lab course is linked to its lecture (or marked standalone), and plan checks warn when a planned lecture has no lab in the same term.

**Architecture:** `@turboterp/course-data` gets a `lab-pairs.ts` module that derives lecture→lab links from Testudo text (corequisites, "DSNL (if taken with X)") plus a hand-written, sourced list, and reports labs that are still unclassified. `@turboterp/plan`'s `buildCatalog` stores the links as `CatalogCourse.labs` (catalog-file key `lb`), and `checkPlan` adds a `lab-missing` warning. The UI already shows any `PlanIssue` by severity, so it needs no change.

**Tech Stack:** TypeScript (Node 24, run directly with `node file.ts`), Vitest.

**Spec:** `docs/project/lab-pairs.md`

## Global Constraints

- Lab test: a course is a lab when its title has "Lab" or "Laboratory" as a word: `/\blab(oratory)?\b/i`.
- Warning: `kind: "lab-missing"`, `severity: "warning"`. Message `"<LECTURE> is usually taken with its lab, <LAB>, in the same term."`, or `"... with one of its labs, A or B, in the same term."` (three or more: `"A, B or C"`). `short`: `"Usually taken with <LAB>"` / `"Usually taken with A or B"`.
- Only labs in the catalog are named. If no lab option is in the catalog, the message names the first one listed.
- Every hand-written pair or standalone lab cites a UMD source (Testudo course text, the UMD catalog, or a department page). The owner is never asked (rulings: "The owner does not adjudicate academic requirements").
- Builders don't research: they read only `program-sources/labs.md` for course text. No WebFetch, no PDFs.
- Quiet output: while iterating, run only the touched package's tests with `-- --reporter=dot`, and pipe long output through `tail -n 30`. Run the full test, typecheck, lint and build once at the end. Push after the first passing test and after each green step.
- Navigate with `graphify query/explain/affected --graph "$(git rev-parse --git-common-dir)/../graphify-out/graph.json"`, then read only the files being changed.

**Change from the spec, by the main session (2026-10-09):** the check covers **planned** lectures only. `checkPlan` already skips completed courses for prerequisite and corequisite checks, and a warning about a finished term gives the student nothing to do. The spec's test "a failed or withdrawn lecture doesn't warn" is covered, since a completed lecture never warns.

## Review Focus

1. **Section-variant labs** (CHEM132S, CHEM132C, BSCI180S): a lecture planned with a variant of its lab must not warn. → Task 1 `sameOrVariant` test; Task 4 variant test.
2. **Lab as AP/IB credit** (CHEM132 from AP Chemistry 5) with the lecture planned: no warning. → Task 4 prior-credit test.
3. **The same course in both cached terms**: no duplicate labs in the list. → Task 1 de-duplication test.
4. **A lecture whose UMD corequisite already names the lab** (CHEM131 → CHEM132): exactly one issue, the corequisite one. → Task 4 test.
5. **Old snapshots and catalog files without `lb`**: decode to no `labs`, and nothing crashes. → Task 1 decode test.

## Files

- Create `packages/course-data/src/lab-pairs.ts`: lab test, variant match, lecture→lab derivation, the hand-written lists, and the unclassified-lab report.
- Create `packages/course-data/test/lab-pairs.test.ts`.
- Create `packages/course-data/scripts/lab-coverage.ts`: report, fixture writer and sources writer.
- Create `packages/course-data/test/fixtures/lab-courses.json`: written by the script.
- Create `program-sources/labs.md`: written by the script; the course text the classifier reads.
- Modify `packages/course-data/package.json`: export `./lab-pairs`, script `lab-coverage`.
- Modify `packages/plan/src/catalog.ts`: add `labs` to `CatalogCourse` and fill it in `buildCatalog`.
- Modify `packages/plan/src/catalog-file.ts`: key `lb`.
- Modify `packages/plan/src/check.ts`: `"lab-missing"` kind and the check.
- Create `packages/plan/test/lab-missing.test.ts`; extend `packages/plan/test/lab-pairs.test.ts` (catalog file).

---

### Task 1: Lab-pair module, catalog field, file key, coverage script (Builder A, branch `feat/lab-pairs-data`)

**Interfaces produced:**
- `@turboterp/course-data/lab-pairs`:
  - `isLabCourse(c: { title: string }): boolean`
  - `sameOrVariant(id: string, lab: string): boolean`
  - `labsByLecture(courses: readonly Course[], pairs?: readonly LabPair[]): Map<string, string[]>`
  - `unclassifiedLabs(courses: readonly Course[], pairs?: readonly LabPair[], standalone?: readonly StandaloneLab[]): Course[]`
  - `LAB_PAIRS: LabPair[]`, `STANDALONE_LABS: StandaloneLab[]`
  - types `LabPair = { lecture: string; labs: string[]; source: string }` and `StandaloneLab = { id: string; reason: string; source: string }`
- `CatalogCourse.labs?: string[]`, catalog-file `CompactCourse.lb?: string[]`.

- [ ] **Step 1: Write the failing tests** in `packages/course-data/test/lab-pairs.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { isLabCourse, labsByLecture, sameOrVariant, unclassifiedLabs, type LabPair } from "../src/lab-pairs.ts";
import type { Course } from "../src/soc.ts";

const c = (id: string, title: string, extra: { coreq?: string; genEdText?: string } = {}): Course => ({
  id,
  department: id.slice(0, 4),
  title,
  credits: { min: 1, max: 1 },
  genEd: [],
  genEdText: extra.genEdText ?? "",
  permissionRequired: false,
  texts: { prerequisite: null, corequisite: extra.coreq ?? null, restriction: null, creditOnlyGrantedFor: null, other: {} },
  description: "",
});

describe("isLabCourse", () => {
  it("matches Lab or Laboratory as a word", () => {
    expect(isLabCourse({ title: "General Chemistry I Laboratory" })).toBe(true);
    expect(isLabCourse({ title: "Optoelectronics Lab" })).toBe(true);
    expect(isLabCourse({ title: "Labor Economics" })).toBe(false);
    expect(isLabCourse({ title: "Principles of Molecular & Cellular Biology" })).toBe(false);
  });
});

describe("sameOrVariant", () => {
  it("accepts the lab or a one-letter section variant", () => {
    expect(sameOrVariant("CHEM132", "CHEM132")).toBe(true);
    expect(sameOrVariant("CHEM132S", "CHEM132")).toBe(true);
    expect(sameOrVariant("CHEM133", "CHEM132")).toBe(false);
    expect(sameOrVariant("CHEM1320", "CHEM132")).toBe(false);
  });
});

describe("labsByLecture", () => {
  it("links a lab that names its lecture as a corequisite", () => {
    const m = labsByLecture([c("CHEM131", "Chemistry I"), c("CHEM132", "General Chemistry I Laboratory", { coreq: "CHEM131." })]);
    expect(m.get("CHEM131")).toEqual(["CHEM132"]);
  });

  it("links a lecture that names its lab as a corequisite", () => {
    const m = labsByLecture([c("PHYS999", "Physics Lecture", { coreq: "PHYS998." }), c("PHYS998", "Physics Laboratory")]);
    expect(m.get("PHYS999")).toEqual(["PHYS998"]);
  });

  it("ignores a corequisite between two lectures", () => {
    const m = labsByLecture([c("MATH001", "Calculus", { coreq: "MATH002." }), c("MATH002", "Calculus Workshop")]);
    expect(m.size).toBe(0);
  });

  it("links a DSNL lab-science lecture to its lab", () => {
    const m = labsByLecture([c("BSCI170", "Principles of Molecular & Cellular Biology", { genEdText: "DSNL (if taken with BSCI180), DSNS" }), c("BSCI180", "Principles of Biology Laboratory")]);
    expect(m.get("BSCI170")).toEqual(["BSCI180"]);
  });

  it("adds hand-written pairs, de-duplicates, and puts labs in the course list first", () => {
    const pairs: LabPair[] = [{ lecture: "BSCI170", labs: ["BSCI171", "BSCI180"], source: "test" }];
    const courses = [
      c("BSCI170", "Principles of Molecular & Cellular Biology", { genEdText: "DSNL (if taken with BSCI180)" }),
      c("BSCI180", "Principles of Biology Laboratory"),
      c("BSCI180", "Principles of Biology Laboratory"),
    ];
    expect(labsByLecture(courses, pairs).get("BSCI170")).toEqual(["BSCI180", "BSCI171"]);
  });
});

describe("unclassifiedLabs", () => {
  it("lists labs that are neither paired nor standalone, once each", () => {
    const courses = [
      c("CHEM131", "Chemistry I"),
      c("CHEM132", "General Chemistry I Laboratory", { coreq: "CHEM131." }),
      c("CHEM132S", "General Chemistry I Laboratory"),
      c("ENEE445", "Computer Laboratory"),
      c("ENEE445", "Computer Laboratory"),
      c("NAVY108", "Naval Science Leadership Lab"),
    ];
    const standalone = [{ id: "NAVY108", reason: "leadership lab, no lecture", source: "test" }];
    expect(unclassifiedLabs(courses, [], standalone).map((x) => x.id)).toEqual(["ENEE445"]);
  });
});
```

- [ ] **Step 2: Run them to see them fail.** Run `npm test -w @turboterp/course-data -- lab-pairs --reporter=dot 2>&1 | tail -n 30`. Expected: FAIL, because `../src/lab-pairs.ts` doesn't exist.

- [ ] **Step 3: Implement** `packages/course-data/src/lab-pairs.ts`:

```ts
// Which lab goes with which lecture, for the plan checker's "lab missing" warning
// (docs/project/lab-pairs.md). Most pairs come from Testudo's own text: a corequisite between a lab
// and a lecture, or "DSNL (if taken with X)". LAB_PAIRS adds the ones Testudo doesn't state, each
// citing the UMD page that does; STANDALONE_LABS lists lab courses with no separate lecture.
// `npm run lab-coverage -w @turboterp/course-data` lists any lab course that is in neither.

import { labPairOf } from "./gen-ed.ts";
import type { Course } from "./soc.ts";

export type LabPair = { lecture: string; labs: string[]; source: string };
export type StandaloneLab = { id: string; reason: string; source: string };

/** Lecture→lab pairs Testudo's text doesn't state. A lab may be one UMD no longer offers (BSCI171). */
export const LAB_PAIRS: LabPair[] = [];

/** Lab courses with no separate lecture: lab-only, combined lecture and lab, research or practicum. */
export const STANDALONE_LABS: StandaloneLab[] = [];

const LAB_TITLE = /\blab(oratory)?\b/i;
const CODE = /[A-Z]{4}\d{3}[A-Z]?/g;

/** A lab course: "Lab" or "Laboratory" as a word in its title. */
export const isLabCourse = (c: { title: string }): boolean => LAB_TITLE.test(c.title);

/** The lab itself, or a one-letter section variant of it (CHEM132S for CHEM132). */
export function sameOrVariant(id: string, lab: string): boolean {
  return id === lab || (id.length === lab.length + 1 && id.startsWith(lab) && /[A-Z]$/.test(id));
}

/** Each lecture's labs: from corequisites, DSNL pairs, then `pairs`; labs in `courses` first. */
export function labsByLecture(courses: readonly Course[], pairs: readonly LabPair[] = LAB_PAIRS): Map<string, string[]> {
  const byId = new Map(courses.map((c) => [c.id, c]));
  const out = new Map<string, string[]>();
  const add = (lecture: string, lab: string) => {
    const labs = out.get(lecture) ?? [];
    if (lab !== lecture && !labs.includes(lab)) labs.push(lab);
    out.set(lecture, labs);
  };
  for (const c of courses) {
    const pair = c.labPair ?? labPairOf(c.genEdText ?? "").labPair;
    if (pair) add(c.id, pair.with);
    for (const id of c.texts.corequisite?.match(CODE) ?? []) {
      const other = byId.get(id);
      if (!other) continue;
      if (isLabCourse(c) && !isLabCourse(other)) add(other.id, c.id);
      else if (!isLabCourse(c) && isLabCourse(other)) add(c.id, other.id);
    }
  }
  for (const p of pairs) for (const lab of p.labs) add(p.lecture, lab);
  for (const [lecture, labs] of out) out.set(lecture, [...labs.filter((l) => byId.has(l)), ...labs.filter((l) => !byId.has(l))]);
  return out;
}

/** Lab courses that are neither some lecture's lab (or a variant of one) nor standalone. */
export function unclassifiedLabs(
  courses: readonly Course[],
  pairs: readonly LabPair[] = LAB_PAIRS,
  standalone: readonly StandaloneLab[] = STANDALONE_LABS,
): Course[] {
  const paired = [...labsByLecture(courses, pairs).values()].flat();
  const alone = new Set(standalone.map((s) => s.id));
  const seen = new Set<string>();
  return courses.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return isLabCourse(c) && !alone.has(c.id) && !paired.some((lab) => sameOrVariant(c.id, lab));
  });
}
```

In `packages/course-data/package.json`, add `"./lab-pairs": "./src/lab-pairs.ts"` to `exports` and `"lab-coverage": "node scripts/lab-coverage.ts"` to `scripts`.

- [ ] **Step 4: Run the tests to see them pass.** Run the same command. Expected: PASS. Commit (`Lab pairs: derive lecture-to-lab links from Testudo text`) and push.

- [ ] **Step 5: Write the failing plan tests.** In `packages/plan/test/catalog.test.ts`, add:

```ts
// (uses the file's existing `catalog = buildCatalog(SPRING_2027)`, real Spring 2027 records)
describe("labs", () => {
  it("stores each lecture's labs and leaves the field off other courses", () => {
    expect(catalog.get("CHEM131")!.labs?.[0]).toBe("CHEM132");
    expect(catalog.get("CHEM132")!.labs).toBeUndefined();
    expect(catalog.get("CMSC131")!.labs).toBeUndefined();
  });
});
```

In `packages/plan/test/lab-pairs.test.ts`, inside `describe("lab pair in the catalog file", ...)`, add:

```ts
it("round-trips labs through the short key lb, absent when empty", () => {
  const withLabs: PlanCatalog = new Map([...catalog, ["BSCI170", c("BSCI170", 3, { labs: ["BSCI180", "BSCI171"] })]]);
  const file = encodeCatalogFile(withLabs, { term: "202701", generatedAt: "x" });
  expect(file.courses.find((x) => x.i === "BSCI170")?.lb).toEqual(["BSCI180", "BSCI171"]);
  expect(file.courses.find((x) => x.i === "CHEM132")?.lb).toBeUndefined();
  expect(decodeCatalogFile(file).catalog.get("BSCI170")?.labs).toEqual(["BSCI180", "BSCI171"]);
  expect(decodeCatalogFile(file).catalog.get("CHEM132")?.labs).toBeUndefined();
});
```

- [ ] **Step 6: Run them to see them fail.** Run `npm test -w @turboterp/plan -- catalog lab-pairs --reporter=dot 2>&1 | tail -n 30`. Expected: FAIL (`labs` undefined, `lb` undefined).

- [ ] **Step 7: Implement.**
  - In `packages/plan/src/catalog.ts`:
    - add `import { labsByLecture } from "@turboterp/course-data/lab-pairs";`
    - add the field to `CatalogCourse` after `labPair`: `/** Labs usually taken in the same term as this lecture, current lab first, e.g. ["BSCI180", "BSCI171"]. */ labs?: string[];`
    - in `buildCatalog`, before the loop: `const labs = labsByLecture(lists.flat());`
    - in each entry, after the `labPair` spread: `...(labs.get(course.id)?.length ? { labs: labs.get(course.id)! } : {}),`
  - In `packages/plan/src/catalog-file.ts`:
    - add `/** labs usually taken in the same term, e.g. ["BSCI180", "BSCI171"] */ lb?: string[];` to `CompactCourse` after `nl`
    - in `encodeCatalogFile`: `if (course.labs?.length) out.lb = course.labs;`
    - in `decodeCatalogFile`, after the `nl` spread: `...(c.lb?.length ? { labs: c.lb } : {}),`
    - The version stays 1: `lb` is optional, and old files decode without it.

- [ ] **Step 8: Run them to see them pass.** Run the Step 6 command, then the whole plan package: `npm test -w @turboterp/plan -- --reporter=dot 2>&1 | tail -n 30`. Expected: PASS. Commit (`Lab pairs: CatalogCourse.labs and catalog-file key lb`) and push.

- [ ] **Step 9: Write the coverage script** `packages/course-data/scripts/lab-coverage.ts`:

```ts
// Lists every lab course in the cached Schedule of Classes snapshots that isn't some lecture's lab
// and isn't in STANDALONE_LABS (src/lab-pairs.ts). Run after each term refresh.
//
//   node scripts/lab-coverage.ts [--cache <dir>] [--write-fixture] [--sources]
//
// --write-fixture rewrites test/fixtures/lab-courses.json: every lab course plus every course that
//   names one (as a corequisite or a DSNL pair), trimmed to the fields lab-pairs.ts reads.
// --sources rewrites program-sources/labs.md: each unclassified lab's Testudo text, for the
//   builder who classifies them (builders don't research; docs/project/lab-pairs.md).

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { isLabCourse, unclassifiedLabs } from "../src/lab-pairs.ts";
import type { Course } from "../src/soc.ts";

const arg = (flag: string) => process.argv.includes(flag);
const cacheFlag = process.argv.indexOf("--cache");
const cache = resolve(cacheFlag >= 0 ? process.argv[cacheFlag + 1]! : ".cache");
const files = readdirSync(cache).filter((f) => /^soc-\d{6}\.json$/.test(f)).sort().reverse();
// Newest term first, so its record of a course is the one kept.
const courses = files.flatMap((f) => (JSON.parse(readFileSync(join(cache, f), "utf8")) as { courses: Course[] }).courses);
const unique = [...new Map([...courses].reverse().map((c) => [c.id, c])).values()];

const missing = unclassifiedLabs(unique);
console.log(`lab-coverage: ${files.join(", ")}: ${unique.filter(isLabCourse).length} lab courses, ${missing.length} unclassified`);
for (const c of missing) console.log(`  ${c.id}  ${c.title}`);

if (arg("--write-fixture")) {
  const labIds = new Set(unique.filter(isLabCourse).map((c) => c.id));
  const names = (c: Course) =>
    [...(c.texts.corequisite?.match(/[A-Z]{4}\d{3}[A-Z]?/g) ?? []), c.labPair?.with ?? "", /if taken with\s+([A-Z]{4}\d{3}[A-Z]?)/i.exec(c.genEdText ?? "")?.[1] ?? ""].some((id) => labIds.has(id));
  const keep = unique
    .filter((c) => labIds.has(c.id) || names(c))
    .map((c) => ({
      id: c.id,
      department: c.department,
      title: c.title,
      credits: c.credits,
      genEd: c.genEd,
      genEdText: c.genEdText,
      ...(c.labPair ? { labPair: c.labPair } : {}),
      permissionRequired: false,
      texts: { prerequisite: null, corequisite: c.texts.corequisite, restriction: null, creditOnlyGrantedFor: null, other: {} },
      description: "",
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync("test/fixtures/lab-courses.json", `${JSON.stringify({ terms: files, courses: keep }, null, 1)}\n`);
  console.log(`wrote test/fixtures/lab-courses.json (${keep.length} courses)`);
}

if (arg("--sources")) {
  const out = [
    "# Lab courses to classify",
    "",
    `Generated by \`npm run lab-coverage -w @turboterp/course-data -- --sources\` from ${files.join(", ")}. Testudo's own text for each lab course not yet paired with a lecture or listed as standalone. Source for every entry: "Testudo Schedule of Classes, <term>".`,
    "",
    ...missing.flatMap((c) => [
      `## ${c.id}: ${c.title} (${c.credits.min === c.credits.max ? c.credits.min : `${c.credits.min}-${c.credits.max}`} credits)`,
      "",
      ...(c.texts.prerequisite ? [`- Prerequisite: ${c.texts.prerequisite}`] : []),
      ...(c.texts.corequisite ? [`- Corequisite: ${c.texts.corequisite}`] : []),
      ...(c.texts.restriction ? [`- Restriction: ${c.texts.restriction}`] : []),
      ...(c.texts.creditOnlyGrantedFor ? [`- Credit only granted for: ${c.texts.creditOnlyGrantedFor}`] : []),
      ...Object.entries(c.texts.other).map(([k, v]) => `- ${k}: ${v}`),
      `- Description: ${c.description.replace(/\s+/g, " ").trim()}`,
      "",
    ]),
  ];
  writeFileSync(resolve("../../program-sources/labs.md"), `${out.join("\n")}\n`);
  console.log(`wrote program-sources/labs.md (${missing.length} labs)`);
}
```

- [ ] **Step 10: Run the script** against the main checkout's cache (a worktree has no `.cache`; it's gitignored):

```bash
cd packages/course-data && node scripts/lab-coverage.ts --cache "$(git rev-parse --git-common-dir)/../packages/course-data/.cache" --write-fixture --sources | head -n 5
```

Expected: about `98 lab courses, 71 unclassified` (as of the 2026-10-08 data), plus the two "wrote" lines. Commit the fixture and `program-sources/labs.md` (`Lab pairs: coverage script, lab-course fixture, labs.md sources`) and push.

- [ ] **Step 11: Finish.** Run the full suite once: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` at the repo root, each through `tail -n 30`. Report pass or fail only.

---

### Task 2: Classify every lab (Builder A2, branch `feat/lab-pairs-data`, continuing Task 1's worktree)

**Consumes:** `LAB_PAIRS`, `STANDALONE_LABS`, `unclassifiedLabs` (Task 1); `program-sources/labs.md`; `test/fixtures/lab-courses.json`.

**Brief rulings to quote:** "Pairings come from UMD's published sources only, never from the owner." Where the text is silent or unclear, use **standalone**. A missing pair means no warning, while a wrong pair means a wrong warning, so standalone is the safe reading.

- [ ] **Step 1: Write the failing coverage test** (append to `packages/course-data/test/lab-pairs.test.ts`):

```ts
import { readFileSync } from "node:fs";
import { LAB_PAIRS, STANDALONE_LABS } from "../src/lab-pairs.ts";

const fixture = (JSON.parse(readFileSync(new URL("./fixtures/lab-courses.json", import.meta.url), "utf8")) as { courses: Course[] }).courses;

describe("lab coverage (real Schedule of Classes data)", () => {
  it("pairs or lists as standalone every lab course", () => {
    expect(unclassifiedLabs(fixture).map((x) => `${x.id} ${x.title}`)).toEqual([]);
  });

  it("cites a source for every hand-written entry, with valid course ids", () => {
    const id = /^[A-Z]{4}\d{3}[A-Z]?$/;
    for (const p of LAB_PAIRS) {
      expect(p.source.trim(), p.lecture).not.toBe("");
      expect(p.lecture).toMatch(id);
      for (const lab of p.labs) expect(lab).toMatch(id);
    }
    for (const s of STANDALONE_LABS) {
      expect(s.source.trim(), s.id).not.toBe("");
      expect(s.reason.trim(), s.id).not.toBe("");
      expect(s.id).toMatch(id);
    }
  });

  it("keeps BSCI171 and BSCI161 as former labs of BSCI170 and BSCI160", () => {
    const m = labsByLecture(fixture);
    expect(m.get("BSCI170")).toEqual(["BSCI180", "BSCI171"]);
    expect(m.get("BSCI160")).toEqual(["BSCI180", "BSCI161"]);
  });
});
```

- [ ] **Step 2: Run it to see it fail.** Run `npm test -w @turboterp/course-data -- lab-pairs --reporter=dot 2>&1 | tail -n 30`. Expected: FAIL, listing about 71 labs.

- [ ] **Step 3: Classify.** For each lab in `program-sources/labs.md`, add one entry to `src/lab-pairs.ts`, using these rules from Testudo's text:
  - **Pair** (`LAB_PAIRS`): the lab's prerequisite says "completed or be concurrently enrolled in X" and X is a lecture. Example: `{ lecture: "ANSC101", labs: ["ANSC103"], source: "Testudo Schedule of Classes, 202608: ANSC103 prerequisite 'Must have completed or be concurrently enrolled in ANSC101.'" }`. Merge labs for the same lecture into one entry.
  - **Former labs**, always included: `{ lecture: "BSCI170", labs: ["BSCI171"], source: "Testudo, 202701: BSCI484 prerequisite 'BSCI180 or (BSCI161 and BSCI171)'; BSCI171 is the former BSCI170 lab" }`, and the same for BSCI160 → BSCI161.
  - **Standalone** (`STANDALONE_LABS`): the lab's prerequisite names only finished courses ("Minimum grade of C- in ..."), so it's taken after the lecture, not with it. Also standalone: a self-contained lab or capstone, research, practicum, thesis or leadership lab, a "Topics" course, a graduate course (600+), or a title that uses "Laboratory" in another sense (ANSC260 Laboratory Animal Management). `reason` is a few words; `source` quotes the Testudo line.
  - **Section variants** (CHEM132C, CHEM132S, CHEM232S, BSCI180S) need no entry when their base lab is paired (`sameOrVariant`). If the base lab isn't paired, classify the base.

- [ ] **Step 4: Run it to see it pass.** Run the same command. Expected: PASS. Then run `npm test -w @turboterp/plan -- --reporter=dot 2>&1 | tail -n 30`; it should still pass. Commit (`Lab pairs: classify every UMD lab course from Testudo text`) and push.

- [ ] **Step 5: Finish.** Run the full suite once (see Task 1 Step 11). Report pass or fail, plus how many labs were paired and how many marked standalone.

---

### Task 3: The `lab-missing` check (Builder B, branch `feat/lab-missing-check`)

Can run alongside Task 2 once Task 1 is merged into `feat/ui-rework`; branch from there.

**Consumes:** `CatalogCourse.labs?: string[]` and `sameOrVariant(id, lab)` from Tasks 1 and 2.
**Produces:** `IssueKind` member `"lab-missing"`.

- [ ] **Step 1: Write the failing tests** in `packages/plan/test/lab-missing.test.ts`:

```ts
// A lecture planned without its usual lab in the same term gets a "lab-missing" warning
// (docs/project/lab-pairs.md).

import { describe, expect, it } from "vitest";
import type { CatalogCourse, PlanCatalog } from "../src/catalog.ts";
import { checkPlan, type Plan, type PlanCourse, type PlanIssue } from "../src/check.ts";
import type { Requirement } from "@turboterp/course-data/prereqs";

const c = (id: string, credits: number, extra: Partial<CatalogCourse> = {}): CatalogCourse => ({
  id,
  title: id,
  credits: { min: credits, max: credits },
  genEd: [],
  prerequisite: null,
  corequisite: null,
  repeat: { kind: "unknown" },
  ...extra,
});
const coreq = (course: string): Requirement => ({ kind: "course", course });
const catalog: PlanCatalog = new Map(
  [
    c("BSCI170", 3, { labs: ["BSCI180", "BSCI171"] }), // BSCI171 isn't in the catalog: a former lab
    c("BSCI180", 1),
    c("BSCI180S", 1),
    c("CHEM131", 3, { labs: ["CHEM132", "CHEM177"], corequisite: coreq("CHEM132") }),
    c("CHEM132", 1),
    c("CHEM177", 2),
    c("CHEM135", 3, { labs: ["CHEM136", "CHEM177"] }),
    c("CHEM136", 1),
    c("PHYS999", 3, { labs: ["PHYS998"] }), // its only lab isn't in the catalog
  ].map((x) => [x.id, x]),
);
const term = (name: string, ...courses: (string | PlanCourse)[]) => ({ name, courses: courses.map((x) => (typeof x === "string" ? { id: x } : x)) });
const labIssues = (p: Plan): PlanIssue[] => checkPlan(p, catalog).filter((i) => i.kind === "lab-missing");

describe("lab-missing", () => {
  it("is quiet when the lab is in the same term", () => {
    expect(labIssues({ terms: [term("Fall 2026", "BSCI170", "BSCI180")] })).toEqual([]);
  });

  it("accepts a section variant of the lab", () => {
    expect(labIssues({ terms: [term("Fall 2026", "BSCI170", "BSCI180S")] })).toEqual([]);
  });

  it("accepts a former lab", () => {
    expect(labIssues({ terms: [term("Fall 2026", "BSCI170", "BSCI171")] })).toEqual([]);
  });

  it("warns when the lecture is planned alone, naming only labs in the catalog", () => {
    expect(labIssues({ terms: [term("Fall 2026", "BSCI170")] })).toEqual([
      {
        kind: "lab-missing",
        severity: "warning",
        term: "Fall 2026",
        course: "BSCI170",
        message: "BSCI170 is usually taken with its lab, BSCI180, in the same term.",
        short: "Usually taken with BSCI180",
      },
    ]);
  });

  it("names every current lab when there are several", () => {
    const [issue] = labIssues({ terms: [term("Fall 2026", "CHEM135")] });
    expect(issue?.message).toBe("CHEM135 is usually taken with one of its labs, CHEM136 or CHEM177, in the same term.");
    expect(issue?.short).toBe("Usually taken with CHEM136 or CHEM177");
  });

  it("names the first lab listed when none is in the catalog", () => {
    expect(labIssues({ terms: [term("Fall 2026", "PHYS999")] })[0]?.message).toBe("PHYS999 is usually taken with its lab, PHYS998, in the same term.");
  });

  it("warns when the lab is planned for a different term", () => {
    expect(labIssues({ terms: [term("Fall 2026", "BSCI170"), term("Spring 2027", "BSCI180")] })).toHaveLength(1);
  });

  it("is quiet when the lab was completed in an earlier term", () => {
    const p: Plan = { terms: [term("Fall 2026", { id: "BSCI180", status: "completed", grade: "B" }), term("Spring 2027", "BSCI170")] };
    expect(labIssues(p)).toEqual([]);
  });

  it("is quiet when the lab is prior credit (AP/IB/transfer)", () => {
    const p: Plan = { priorCredit: [{ id: "BSCI180", credits: 1, source: "AP Biology (5)" }], terms: [term("Fall 2026", "BSCI170")] };
    expect(labIssues(p)).toEqual([]);
  });

  it("warns when the earlier lab was failed or withdrawn", () => {
    for (const grade of ["F", "W"]) {
      const p: Plan = { terms: [term("Fall 2026", { id: "BSCI180", status: "completed", grade }), term("Spring 2027", "BSCI170")] };
      expect(labIssues(p), grade).toHaveLength(1);
    }
  });

  it("never warns about a completed lecture", () => {
    const p: Plan = { terms: [term("Fall 2026", { id: "BSCI170", status: "completed", grade: "A" })] };
    expect(labIssues(p)).toEqual([]);
  });

  it("leaves it to the corequisite check when UMD lists the lab as a corequisite", () => {
    const issues = checkPlan({ terms: [term("Fall 2026", "CHEM131")] }, catalog);
    expect(issues.filter((i) => i.kind === "lab-missing")).toEqual([]);
    expect(issues.filter((i) => i.kind === "corequisite")).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run them to see them fail.** Run `npm test -w @turboterp/plan -- lab-missing --reporter=dot 2>&1 | tail -n 30`. Expected: FAIL (no `lab-missing` issues).

- [ ] **Step 3: Implement** in `packages/plan/src/check.ts`:
  - imports: `import { earnsCredit } from "@turboterp/audit";` and `import { sameOrVariant } from "@turboterp/course-data/lab-pairs";`
  - add `| "lab-missing"` to `IssueKind`, after `"corequisite"`.
  - helpers near `courseLeaves`:

```ts
/** A plan course that counts: planned, or completed with a grade that earns credit (not F or W). */
const counts = (c: Pick<PlanCourse, "status" | "grade">) =>
  earnsCredit({ status: c.status === "completed" ? "completed" : "planned", ...(c.grade ? { grade: c.grade } : {}) });

/** "A", "A or B", "A, B or C" */
const orList = (items: string[]) => (items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} or ${items.at(-1)}`);
```

  - inside `checkPlan`'s course loop, right after the `if (info.corequisite) { ... }` block:

```ts
      // A lecture usually taken with a lab (docs/project/lab-pairs.md). Skipped when UMD lists the
      // lab as a corequisite: the corequisite check above already speaks for it.
      const labs = info.labs ?? [];
      const coreqNamesLab = info.corequisite !== null && courseLeaves(info.corequisite).some((l) => l.kind === "course" && labs.includes(l.course));
      if (labs.length > 0 && !coreqNamesLab) {
        const isLab = (id: string) => labs.some((lab) => sameOrVariant(id, lab));
        const together = term.courses.some((x) => isLab(x.id) && counts(x));
        const earlier =
          (plan.priorCredit ?? []).some((x) => isLab(x.id) && counts({ status: "completed", ...(x.grade ? { grade: x.grade } : {}) })) ||
          plan.terms.slice(0, i).some((t) => t.courses.some((x) => isLab(x.id) && x.status === "completed" && counts(x)));
        if (!together && !earlier) {
          const current = labs.filter((lab) => catalog.has(lab));
          const named = current.length > 0 ? current : labs.slice(0, 1);
          issues.push({
            kind: "lab-missing",
            severity: "warning",
            ...at,
            message: `${course.id} is usually taken with ${named.length === 1 ? `its lab, ${named[0]}` : `one of its labs, ${orList(named)}`}, in the same term.`,
            short: `Usually taken with ${orList(named)}`,
          });
        }
      }
```

  (`CourseLeaf` is `course` or `dept-level`; only `kind: "course"` has `.course`, e.g. `{ kind: "course", course: "CHEM132" }`.)

- [ ] **Step 4: Run them to see them pass.** Run the Step 2 command, then the whole plan package and the web app's advisor tests: `npm test -w @turboterp/plan -- --reporter=dot 2>&1 | tail -n 30` and `npm test -w @turboterp/web -- advisor --reporter=dot 2>&1 | tail -n 30`. Expected: PASS.

  If a sample-plan or test-student test now reports a `lab-missing` warning, don't loosen the check. Leave the test data alone unless the program source shows the lab, and report the course and plan.

  Commit (`Plan checks: warn when a lecture is planned without its lab`) and push.

- [ ] **Step 5: Screenshot.** Take one screenshot with `npm run ui-check` (see `docs/project/working-notes.md`) of the Advisor checks panel, using a plan with BSCI170 and no BSCI180. Save it to `docs/screenshots/lab-pairs/checks-panel.png`, then commit and push.

- [ ] **Step 6: Finish.** Run the full suite once (see Task 1 Step 11). Report pass or fail.

---

### Task 4: Merge and verify (main session)

- [ ] Review each builder's diff against `docs/project/lab-pairs.md` and this plan, then merge `feat/lab-pairs-data` and later `feat/lab-missing-check` into `feat/ui-rework` (in `.claude/worktrees/merge-s1`).
- [ ] Run `npm run advisor-data -w @turboterp/web`, then check `apps/web/public/data/advisor/<term>/catalog.json`: BSCI170 has `"lb":["BSCI180","BSCI171"]`.
- [ ] Run the full local test, typecheck, lint and build (no CI), then `graphify update .`.
- [ ] Show the owner the checks-panel screenshot and wait for UI approval before the owner deploys.
- [ ] Update PROJECT_MEMORY section 14, plus the status log with each builder's tokens.
