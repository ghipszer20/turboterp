# Lab pairs: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. PROJECT_MEMORY section 18 overrides that skill's defaults: one Sonnet builder per task, no reviewer subagents, at most 2 at once.

**Goal:** Every UMD lab is linked to its lecture or marked standalone. Plan checks warn when a planned lecture has no lab in the same term (`lab-missing`), and when a planned lab has no lecture in the same term and no prior credit for it (`lecture-missing`).

**Architecture:** `@turboterp/course-data/lab-pairs` decides what a lab is and links lectures to labs. The links come from Testudo text, from derived pairs generated out of every source (current and past Testudo terms, plus the UMD undergraduate and graduate catalogs), and from hand-classified pairs. A coverage script reports any lab not yet accounted for. `buildCatalog` stores the links as `CatalogCourse.labs` (catalog-file key `lb`), and `checkPlan` adds the two warnings. The UI already shows any `PlanIssue` by severity, so it needs no change.

**Tech Stack:** TypeScript (Node 24, run directly with `node file.ts`), Vitest, cheerio (already a course-data dependency).

**Spec:** `docs/project/lab-pairs.md`

## Global Constraints

- A **lab course** has "Lab" or "Laboratory" as a word in its title (`/\blab(oratory)?\b/i`), or every meeting of every section in a Testudo term is typed "Lab" (`labOnly`).
- `STANDALONE_RULES` apply only to `labOnly` courses whose title doesn't say lab. A lab-titled course is always classified individually.
- Section variant: `CHEM132S` counts as `CHEM132` (one trailing letter; see `sameOrVariant`).
- Every pair, standalone lab and rule cites a UMD source (a Testudo term's course text, or a UMD catalog page). The owner is never asked. When a source is silent or unclear, classify the lab as standalone.
- Warnings use `severity: "warning"` and apply to **planned** courses only.
  - `lab-missing`: `"<LECTURE> is usually taken with its lab, <LAB>, in the same term."`, or `"... with one of its labs, A or B, in the same term."` `short`: `"Usually taken with <LAB>"`.
  - `lecture-missing`: `"<LAB> is a lab, usually taken in the same term as its lecture, <LECTURE>."`, or `"... as one of its lectures, A or B."` `short`: `"Usually taken with <LECTURE>"`.
  - Lists read `"A or B"` and `"A, B or C"`. Only advisor-catalog courses are named; if none is, name the first one listed.
- Past Testudo terms go in `packages/course-data/.cache/history/soc-<term>.json`, and catalog courses in `.cache/catalog-courses.json`. Only `lab-coverage` reads them. The advisor catalog and the schedule builder don't change.
- Builders don't research: no WebFetch, no PDFs. Fetch scripts are run by the main session (Task 3).
- Quiet output: while iterating, run only the touched package's tests with `-- --reporter=dot`, and pipe long output through `tail -n 30`. Run the full test, typecheck, lint and build once at the end. Push after the first passing test and after each green step.
- Navigate with `graphify query/explain/affected --graph "$(git rev-parse --git-common-dir)/../graphify-out/graph.json"`, then read only the files being changed.

## Review Focus

1. **A section variant** (CHEM132S, BSCI180S) planned with its lecture: no warning either way. → Task 1 `sameOrVariant` test; Task 5 variant tests.
2. **A lecture or lab as AP/IB credit** (CHEM132 from AP Chemistry 5): no warning. → Task 5 prior-credit tests.
3. **Lecture in fall, lab in spring:** one warning on the lecture (lab-missing), not a second on the lab. → Task 5 test.
4. **A lab whose prerequisite or corequisite already names the lecture** (ANSC103, CHEM132): only the existing prerequisite or corequisite issue. → Task 5 tests.
5. **A course in several sources** (both terms and the catalog): one fixture entry and no duplicate labs. → Task 1 de-duplication test; Task 2 merge test.

## Files

- `packages/course-data/src/lab-pairs.ts` (create): lab tests, rules, derivation, unclassified report.
- `packages/course-data/src/lab-pairs-a-l.ts`, `lab-pairs-m-z.ts` (create): hand-classified pairs and standalone labs, split by department so two builders don't touch the same file.
- `packages/course-data/src/lab-pairs.generated.ts` (create; written by the coverage script).
- `packages/course-data/src/catalog-courses.ts` (create): parses a UMD catalog course page into `Course[]`.
- `packages/course-data/scripts/catalog-courses.ts` (create): fetches every catalog department page into `.cache/catalog-courses.json`.
- `packages/course-data/scripts/snapshot.ts` (modify): `--history` writes to `.cache/history/`.
- `packages/course-data/scripts/lab-coverage.ts` (create): report, fixture, generated pairs and sources.
- `packages/course-data/test/lab-pairs.test.ts`, `test/catalog-courses.test.ts` (create); fixtures `test/fixtures/catalog-bsci.html`, `test/fixtures/catalog-grad.html` (Task 0) and `test/fixtures/lab-courses.json` (Task 3).
- `packages/course-data/package.json` (modify): exports `./lab-pairs` and `./catalog-courses`; scripts `lab-coverage` and `catalog-courses`.
- `packages/plan/src/catalog.ts`, `catalog-file.ts`, `check.ts` (modify).
- `packages/plan/test/catalog.test.ts`, `lab-pairs.test.ts` (extend), `lab-checks.test.ts` (create).
- `program-sources/labs.md` (created in Task 3).

---

### Task 0: Fixtures (main session, before dispatching)

- [ ] Save two catalog pages as parser fixtures (trimmed to about 15 course blocks each, keeping BSCI124, BSCI125, BSCI170, BSCI171 and one block with a credit range):

```bash
curl -sL https://academiccatalog.umd.edu/undergraduate/approved-courses/bsci/ > packages/course-data/test/fixtures/catalog-bsci.html
curl -sL https://academiccatalog.umd.edu/graduate/courses/chem/ > packages/course-data/test/fixtures/catalog-grad.html
```

- [ ] Commit them on `feat/ui-rework` (`Lab pairs: catalog page fixtures`).

---

### Task 1: Lab-pair module, catalog field, file key (Builder A, branch `feat/lab-pairs-data`)

**Produces** (`@turboterp/course-data/lab-pairs`):
- `type LabSourceCourse = Course & { labOnly?: boolean }`
- `type LabPair = { lecture: string; labs: string[]; source: string }`
- `type StandaloneLab = { id: string; reason: string; source: string }`
- `type StandaloneRule = { prefix: string; reason: string; source: string }`
- `isLabCourse(c: { title: string; labOnly?: boolean }): boolean`
- `sameOrVariant(id: string, lab: string): boolean`
- `ruleFor(c: { id: string; title: string; labOnly?: boolean }, rules?): StandaloneRule | undefined`
- `labsByLecture(courses: readonly LabSourceCourse[], pairs?: readonly LabPair[]): Map<string, string[]>`
- `unclassifiedLabs(courses: readonly LabSourceCourse[], opts?: { pairs?; standalone?; rules? }): LabSourceCourse[]`
- `LAB_PAIRS`, `STANDALONE_LABS`, `STANDALONE_RULES`; `DERIVED_PAIRS` (from `lab-pairs.generated.ts`)
- `CatalogCourse.labs?: string[]`, `CompactCourse.lb?: string[]`

- [ ] **Step 1: Write the failing tests** in `packages/course-data/test/lab-pairs.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { isLabCourse, labsByLecture, ruleFor, sameOrVariant, unclassifiedLabs, type LabPair, type LabSourceCourse } from "../src/lab-pairs.ts";

const c = (id: string, title: string, extra: { coreq?: string; genEdText?: string; labOnly?: boolean } = {}): LabSourceCourse => ({
  id,
  department: id.slice(0, 4),
  title,
  credits: { min: 1, max: 1 },
  genEd: [],
  genEdText: extra.genEdText ?? "",
  permissionRequired: false,
  texts: { prerequisite: null, corequisite: extra.coreq ?? null, restriction: null, creditOnlyGrantedFor: null, other: {} },
  description: "",
  ...(extra.labOnly ? { labOnly: true } : {}),
});

describe("isLabCourse", () => {
  it("matches Lab or Laboratory as a word, or lab-only meetings", () => {
    expect(isLabCourse({ title: "General Chemistry I Laboratory" })).toBe(true);
    expect(isLabCourse({ title: "Optoelectronics Lab" })).toBe(true);
    expect(isLabCourse({ title: "Labor Economics" })).toBe(false);
    expect(isLabCourse({ title: "Experimental Physics I: Mechanics and Waves", labOnly: true })).toBe(true);
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

describe("ruleFor", () => {
  const rules = [{ prefix: "KNES1", reason: "activity class", source: "test" }];
  it("applies to lab-only courses whose title doesn't say lab", () => {
    expect(ruleFor({ id: "KNES156", title: "Pickleball", labOnly: true }, rules)?.reason).toBe("activity class");
  });
  it("never applies to a lab-titled course or a course outside the prefix", () => {
    expect(ruleFor({ id: "KNES155", title: "Exercise Laboratory", labOnly: true }, rules)).toBeUndefined();
    expect(ruleFor({ id: "KNES360", title: "Physiology", labOnly: true }, rules)).toBeUndefined();
  });
});

describe("labsByLecture", () => {
  it("links a lab that names its lecture as a corequisite", () => {
    expect(labsByLecture([c("CHEM131", "Chemistry I"), c("CHEM132", "General Chemistry I Laboratory", { coreq: "CHEM131." })]).get("CHEM131")).toEqual(["CHEM132"]);
  });
  it("links a lecture that names its lab as a corequisite", () => {
    expect(labsByLecture([c("BSCI124", "Plant Biology", { coreq: "BSCI125." }), c("BSCI125", "Plant Biology Laboratory")]).get("BSCI124")).toEqual(["BSCI125"]);
  });
  it("links a lab-only course found by meeting type", () => {
    expect(labsByLecture([c("PHYS161", "Physics", { coreq: "PHYS275." }), c("PHYS275", "Experimental Physics I", { labOnly: true })]).get("PHYS161")).toEqual(["PHYS275"]);
  });
  it("ignores a corequisite between two lectures", () => {
    expect(labsByLecture([c("MATH001", "Calculus", { coreq: "MATH002." }), c("MATH002", "Calculus Workshop")]).size).toBe(0);
  });
  it("links a DSNL lab-science lecture to its lab", () => {
    expect(labsByLecture([c("BSCI170", "Molecular Biology", { genEdText: "DSNL (if taken with BSCI180), DSNS" }), c("BSCI180", "Principles of Biology Laboratory")]).get("BSCI170")).toEqual(["BSCI180"]);
  });
  it("adds given pairs, de-duplicates, and puts labs in the course list first", () => {
    const pairs: LabPair[] = [{ lecture: "BSCI170", labs: ["BSCI171", "BSCI180"], source: "test" }];
    const courses = [c("BSCI170", "Molecular Biology", { genEdText: "DSNL (if taken with BSCI180)" }), c("BSCI180", "Principles of Biology Laboratory"), c("BSCI180", "Principles of Biology Laboratory")];
    expect(labsByLecture(courses, pairs).get("BSCI170")).toEqual(["BSCI180", "BSCI171"]);
  });
});

describe("unclassifiedLabs", () => {
  it("lists labs that are neither paired, standalone, nor covered by a rule, once each", () => {
    const courses = [
      c("CHEM131", "Chemistry I"),
      c("CHEM132", "General Chemistry I Laboratory", { coreq: "CHEM131." }),
      c("CHEM132S", "General Chemistry I Laboratory"),
      c("ENEE445", "Computer Laboratory"),
      c("ENEE445", "Computer Laboratory"),
      c("NAVY108", "Naval Science Leadership Lab"),
      c("KNES156", "Pickleball", { labOnly: true }),
      c("PHYS276", "Experimental Physics II", { labOnly: true }),
    ];
    const opts = {
      pairs: [],
      standalone: [{ id: "NAVY108", reason: "leadership lab", source: "test" }],
      rules: [{ prefix: "KNES1", reason: "activity class", source: "test" }],
    };
    expect(unclassifiedLabs(courses, opts).map((x) => x.id)).toEqual(["ENEE445", "PHYS276"]);
  });
});
```

- [ ] **Step 2: Run them to see them fail.** Run `npm test -w @turboterp/course-data -- lab-pairs --reporter=dot 2>&1 | tail -n 30`. Expected: FAIL (module missing).

- [ ] **Step 3: Implement.** Create `packages/course-data/src/lab-pairs-a-l.ts` and `lab-pairs-m-z.ts`, each:

```ts
// Hand-classified labs for departments A–L (lab-pairs-m-z.ts has M–Z), from the UMD text in
// program-sources/labs.md. See lab-pairs.ts.
import type { LabPair, StandaloneLab, StandaloneRule } from "./lab-pairs.ts";

export const PAIRS: LabPair[] = [];
export const STANDALONE: StandaloneLab[] = [];
export const RULES: StandaloneRule[] = [];
```

Create `packages/course-data/src/lab-pairs.generated.ts`:

```ts
// Written by `npm run lab-coverage -w @turboterp/course-data -- --write`; do not edit by hand.
import type { LabPair } from "./lab-pairs.ts";

export const DERIVED_PAIRS: LabPair[] = [];
```

Create `packages/course-data/src/lab-pairs.ts`:

```ts
// Which lab goes with which lecture, for the plan checker's lab-missing and lecture-missing
// warnings (docs/project/lab-pairs.md). Links come from Testudo and UMD catalog text: a
// corequisite between a lab and a lecture, or "DSNL (if taken with X)". DERIVED_PAIRS holds those
// found in sources the app doesn't load (past terms, the catalogs); LAB_PAIRS adds the ones the
// text doesn't state outright. STANDALONE_LABS and STANDALONE_RULES list labs with no lecture.
// `npm run lab-coverage -w @turboterp/course-data` lists any lab in none of these.

import { labPairOf } from "./gen-ed.ts";
import * as al from "./lab-pairs-a-l.ts";
import { DERIVED_PAIRS } from "./lab-pairs.generated.ts";
import * as mz from "./lab-pairs-m-z.ts";
import type { Course } from "./soc.ts";

export type LabSourceCourse = Course & { labOnly?: boolean };
export type LabPair = { lecture: string; labs: string[]; source: string };
export type StandaloneLab = { id: string; reason: string; source: string };
/** Marks lab-only courses standalone by id prefix ("ARTT", "KNES1"). */
export type StandaloneRule = { prefix: string; reason: string; source: string };

export const LAB_PAIRS: LabPair[] = [...al.PAIRS, ...mz.PAIRS];
export const STANDALONE_LABS: StandaloneLab[] = [...al.STANDALONE, ...mz.STANDALONE];
export const STANDALONE_RULES: StandaloneRule[] = [...al.RULES, ...mz.RULES];
export { DERIVED_PAIRS };

const LAB_TITLE = /\blab(oratory)?\b/i;
const CODE = /[A-Z]{4}\d{3}[A-Z]?/g;

/** A lab course: "Lab" or "Laboratory" as a word in its title, or only lab meetings. */
export const isLabCourse = (c: { title: string; labOnly?: boolean }): boolean => LAB_TITLE.test(c.title) || c.labOnly === true;

/** The lab itself, or a one-letter section variant of it (CHEM132S for CHEM132). */
export function sameOrVariant(id: string, lab: string): boolean {
  return id === lab || (id.length === lab.length + 1 && id.startsWith(lab) && /[A-Z]$/.test(id));
}

/** The bulk rule covering a lab-only course whose title doesn't say lab. */
export function ruleFor(c: { id: string; title: string; labOnly?: boolean }, rules: readonly StandaloneRule[] = STANDALONE_RULES): StandaloneRule | undefined {
  if (!c.labOnly || LAB_TITLE.test(c.title)) return undefined;
  return rules.find((r) => c.id.startsWith(r.prefix));
}

/** Each lecture's labs: from corequisites, DSNL pairs, then `pairs`; labs in `courses` first. */
export function labsByLecture(courses: readonly LabSourceCourse[], pairs: readonly LabPair[] = []): Map<string, string[]> {
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

/** Lab courses that are neither some lecture's lab (or a variant of one), standalone, nor ruled standalone. */
export function unclassifiedLabs(
  courses: readonly LabSourceCourse[],
  opts: { pairs?: readonly LabPair[]; standalone?: readonly StandaloneLab[]; rules?: readonly StandaloneRule[] } = {},
): LabSourceCourse[] {
  const paired = [...labsByLecture(courses, opts.pairs ?? [...DERIVED_PAIRS, ...LAB_PAIRS]).values()].flat();
  const alone = new Set((opts.standalone ?? STANDALONE_LABS).map((s) => s.id));
  const rules = opts.rules ?? STANDALONE_RULES;
  const seen = new Set<string>();
  return courses.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return isLabCourse(c) && !alone.has(c.id) && !ruleFor(c, rules) && !paired.some((lab) => sameOrVariant(c.id, lab));
  });
}
```

`lab-pairs.generated.ts` and the two hand-classified files import only *types* from `lab-pairs.ts`, so there's no runtime import cycle.

In `packages/course-data/package.json`, add `"./lab-pairs": "./src/lab-pairs.ts"` and `"./catalog-courses": "./src/catalog-courses.ts"` to `exports` (the second file arrives in Task 2), and add `"lab-coverage": "node scripts/lab-coverage.ts"` and `"catalog-courses": "node scripts/catalog-courses.ts"` to `scripts`.

- [ ] **Step 4: Run the tests to see them pass**, then commit (`Lab pairs: lab tests, rules and lecture-to-lab derivation`) and push.

- [ ] **Step 5: Write the failing plan tests.** In `packages/plan/test/catalog.test.ts` (it already has `const catalog = buildCatalog(SPRING_2027)`), add:

```ts
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

- [ ] **Step 6: Run them to see them fail.** Run `npm test -w @turboterp/plan -- catalog lab-pairs --reporter=dot 2>&1 | tail -n 30`.

- [ ] **Step 7: Implement.**
  - In `packages/plan/src/catalog.ts`:
    - import `import { DERIVED_PAIRS, LAB_PAIRS, labsByLecture } from "@turboterp/course-data/lab-pairs";`
    - add the field to `CatalogCourse` after `labPair`: `/** Labs usually taken in the same term as this lecture, current lab first, e.g. ["BSCI180", "BSCI171"]. */ labs?: string[];`
    - in `buildCatalog`, before the loop: `const labs = labsByLecture(lists.flat(), [...DERIVED_PAIRS, ...LAB_PAIRS]);`
    - in each entry, after the `labPair` spread: `...(labs.get(course.id)?.length ? { labs: labs.get(course.id)! } : {}),`
  - In `packages/plan/src/catalog-file.ts`:
    - add `/** labs usually taken in the same term, e.g. ["BSCI180", "BSCI171"] */ lb?: string[];` to `CompactCourse` after `nl`
    - encode: `if (course.labs?.length) out.lb = course.labs;`
    - decode, after the `nl` spread: `...(c.lb?.length ? { labs: c.lb } : {}),`
    - The version stays 1: old files decode without `labs`.

- [ ] **Step 8: Run them to see them pass**, then run the whole plan package (`npm test -w @turboterp/plan -- --reporter=dot 2>&1 | tail -n 30`). Commit (`Lab pairs: CatalogCourse.labs and catalog-file key lb`) and push. Run the full suite once at the root (test, typecheck, lint, build, each through `tail -n 30`) and report pass or fail.

---

### Task 2: Sources and coverage script (Builder A2, branch `feat/lab-pairs-data`, after Task 1)

**Consumes:** Task 1's module. **Produces:** `parseCatalogCourses(html: string): Course[]`; `.cache/history/`; the `lab-coverage` script with `--write`.

- [ ] **Step 1: Write the failing parser test** in `packages/course-data/test/catalog-courses.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseCatalogCourses } from "../src/catalog-courses.ts";

const page = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

describe("parseCatalogCourses", () => {
  const courses = parseCatalogCourses(page("catalog-bsci.html"));
  const byId = new Map(courses.map((c) => [c.id, c]));

  it("reads id, title and credits from each course block", () => {
    expect(byId.get("BSCI171")).toMatchObject({ department: "BSCI", title: "Principles of Molecular & Cellular Biology Laboratory", credits: { min: 1, max: 1 } });
  });

  it("reads the labeled lines into texts", () => {
    const bsci125 = byId.get("BSCI125")!;
    expect(bsci125.texts.corequisite).toBe("BSCI124.");
    expect(bsci125.texts.restriction).toMatch(/^For non-science majors only/);
    expect(bsci125.texts.other["Additional Information"]).toMatch(/only when taken concurrently with BSCI124/);
    expect(bsci125.description).toMatch(/^An introduction to the biology of plants/);
  });

  it("reads a credit range", () => {
    expect(courses.some((c) => c.credits.min < c.credits.max)).toBe(true);
  });

  it("parses a graduate catalog page the same way", () => {
    expect(parseCatalogCourses(page("catalog-grad.html")).length).toBeGreaterThan(5);
  });
});
```

Adjust the expected strings to the fixture's exact text if they differ (whitespace is collapsed).

- [ ] **Step 2: Run it to see it fail.** Run `npm test -w @turboterp/course-data -- catalog-courses --reporter=dot 2>&1 | tail -n 30`.

- [ ] **Step 3: Implement** `packages/course-data/src/catalog-courses.ts` with cheerio, following `soc.ts`'s parsing style:
  - Each `.courseblock` becomes one `Course`.
  - `.courseblocktitle strong` text is `"<ID> <Title> (<n> Credit[s])"` or `"(<a>-<b> Credits)"`. Parse it with `/^([A-Z]{4}\d{3}[A-Z]?)\s+(.*)\s+\((\d+)(?:-(\d+))?\s+Credits?\)$/`. `department` is the first 4 letters.
  - `.courseblockdesc` is the `description`, with whitespace collapsed.
  - For each `.courseblockextra`, `<strong>Label:</strong> text` goes to `prerequisite`, `corequisite`, `restriction` or `creditOnlyGrantedFor` ("Credit only granted for"); any other label goes to `other[label]`.
  - `genEd: []`, `genEdText: ""`, `permissionRequired: false`.

  Then run the test to see it pass, commit (`Lab pairs: UMD catalog course page parser`) and push.

- [ ] **Step 4: Fetch script** `packages/course-data/scripts/catalog-courses.ts` (written, not run, by the builder):

```ts
// Downloads every course in the UMD Undergraduate and Graduate Catalogs into
// .cache/catalog-courses.json, for lab-coverage.ts (the catalogs list courses not offered in
// recent terms). Polite: one request at a time with a pause. Run by hand:
//
//   npm run catalog-courses -w @turboterp/course-data

import { mkdirSync, writeFileSync } from "node:fs";
import { parseCatalogCourses } from "../src/catalog-courses.ts";
import { fetchEach } from "../src/fetch-each.ts";

const SITE = "https://academiccatalog.umd.edu";
const INDEXES = [
  { index: `${SITE}/undergraduate/approved-courses/`, link: /\/undergraduate\/approved-courses\/[a-z]+\//g },
  { index: `${SITE}/graduate/courses/`, link: /\/graduate\/courses\/[a-z]+\//g },
];
const pause = () => new Promise<void>((r) => setTimeout(r, 300));
const get = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
};

const pages: string[] = [];
for (const { index, link } of INDEXES) pages.push(...new Set((await get(index)).match(link)?.map((p) => SITE + p) ?? []));
console.log(`catalog-courses: ${pages.length} department pages`);
const run = await fetchEach(pages, async (url) => parseCatalogCourses(await get(url)).map((c) => ({ ...c, source: url })), { attempts: 3, pause });
if (run.failed.length > 0) {
  for (const f of run.failed) console.error(`  ${f.key}: ${f.message}`);
  console.error(`${run.failed.length} pages failed; .cache/catalog-courses.json was not written.`);
  process.exit(1);
}
const courses = run.items.flat();
mkdirSync(".cache", { recursive: true });
writeFileSync(".cache/catalog-courses.json", JSON.stringify({ fetchedAt: new Date().toISOString(), courses }));
console.log(`Saved ${courses.length} catalog courses`);
```

  Check `fetchEach`'s item type: if it returns one item per key, `run.items` is `Course[][]`, so `.flat()` is right.

- [ ] **Step 5: `--history` flag in `scripts/snapshot.ts`.** When `process.argv.includes("--history")`, write to `.cache/history/soc-<term>.json` (with `mkdirSync(".cache/history", { recursive: true })`), and take the term from the first argument that isn't a flag. Nothing else changes, so the schedule builder and `advisor-data` never see history files. Commit (`Lab pairs: catalog fetch script; snapshot --history`) and push.

- [ ] **Step 6: Write `scripts/lab-coverage.ts`:**

```ts
// Accounts for every UMD lab course (docs/project/lab-pairs.md). Reads the current Testudo terms
// (.cache/soc-*.json), past terms (.cache/history/soc-*.json) and both UMD catalogs
// (.cache/catalog-courses.json), and lists every lab course that isn't some lecture's lab, standalone,
// or covered by a standalone rule. Run after each term refresh:
//
//   npm run lab-coverage -w @turboterp/course-data -- [--cache <dir>] [--write]
//
// --write rewrites test/fixtures/lab-courses.json (every lab course plus the courses that name one),
// src/lab-pairs.generated.ts (pairs derived from text in every source) and program-sources/labs.md
// (each unclassified lab's text, for the builders who classify them).

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { isLabCourse, labsByLecture, ruleFor, unclassifiedLabs, type LabPair, type LabSourceCourse } from "../src/lab-pairs.ts";
import type { Course, Section } from "../src/soc.ts";

const flag = process.argv.indexOf("--cache");
const cache = resolve(flag >= 0 ? process.argv[flag + 1]! : ".cache");
const socFiles = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter((f) => /^soc-\d{6}\.json$/.test(f)).map((f) => join(dir, f)) : []);

// Newest record of each course wins: current terms, then past terms newest first, then the catalogs.
type Snapshot = { term: string; courses: Course[]; sections: Section[] };
const snapshots = [...socFiles(cache), ...socFiles(join(cache, "history"))]
  .map((p) => JSON.parse(readFileSync(p, "utf8")) as Snapshot)
  .sort((a, b) => b.term.localeCompare(a.term));
const labOnly = new Set<string>();
for (const s of snapshots) {
  const byCourse = new Map<string, Section[]>();
  for (const x of s.sections) byCourse.set(x.courseId, [...(byCourse.get(x.courseId) ?? []), x]);
  for (const [id, secs] of byCourse) {
    const types = secs.flatMap((x) => x.meetings.map((m) => m.type));
    if (types.length > 0 && types.every((t) => /\blab\b/i.test(t))) labOnly.add(id);
  }
}
const catalogFile = join(cache, "catalog-courses.json");
const catalogCourses: (Course & { source?: string })[] = existsSync(catalogFile) ? JSON.parse(readFileSync(catalogFile, "utf8")).courses : [];
const sourceOf = new Map<string, string>();
const all = new Map<string, LabSourceCourse>();
for (const s of snapshots) for (const c of s.courses) if (!all.has(c.id)) { all.set(c.id, c); sourceOf.set(c.id, `Testudo Schedule of Classes, ${s.term}`); }
for (const c of catalogCourses) if (!all.has(c.id)) { all.set(c.id, c); sourceOf.set(c.id, `UMD catalog, ${c.source ?? ""}`.trim()); }
for (const id of labOnly) { const c = all.get(id); if (c) all.set(id, { ...c, labOnly: true }); }
const courses = [...all.values()];

const missing = unclassifiedLabs(courses);
console.log(`lab-coverage: ${snapshots.map((s) => s.term).join(", ")} + ${catalogCourses.length} catalog courses: ${courses.filter(isLabCourse).length} lab courses (${courses.filter((c) => ruleFor(c)).length} by rule), ${missing.length} unclassified`);
for (const c of missing) console.log(`  ${c.id}  ${c.title}`);

if (process.argv.includes("--write")) {
  // Derived pairs: what the text links, cited to the record it came from.
  const derived: LabPair[] = [...labsByLecture(courses)].map(([lecture, labs]) => ({ lecture, labs, source: sourceOf.get(lecture) ?? sourceOf.get(labs[0]!) ?? "" }));
  writeFileSync(
    "src/lab-pairs.generated.ts",
    `// Written by \`npm run lab-coverage -w @turboterp/course-data -- --write\`; do not edit by hand.\nimport type { LabPair } from "./lab-pairs.ts";\n\nexport const DERIVED_PAIRS: LabPair[] = ${JSON.stringify(derived, null, 1)};\n`,
  );

  const labIds = new Set(courses.filter(isLabCourse).map((c) => c.id));
  const names = (c: LabSourceCourse) =>
    [...(c.texts.corequisite?.match(/[A-Z]{4}\d{3}[A-Z]?/g) ?? []), c.labPair?.with ?? "", /if taken with\s+([A-Z]{4}\d{3}[A-Z]?)/i.exec(c.genEdText ?? "")?.[1] ?? ""].some((id) => labIds.has(id));
  const fixture = courses
    .filter((c) => labIds.has(c.id) || names(c))
    .map((c) => ({
      id: c.id, department: c.department, title: c.title, credits: c.credits, genEd: c.genEd, genEdText: c.genEdText,
      ...(c.labPair ? { labPair: c.labPair } : {}), ...(c.labOnly ? { labOnly: true } : {}),
      permissionRequired: false,
      texts: { prerequisite: null, corequisite: c.texts.corequisite, restriction: null, creditOnlyGrantedFor: null, other: {} },
      description: "",
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync("test/fixtures/lab-courses.json", `${JSON.stringify({ sources: [...snapshots.map((s) => s.term), "catalogs"], courses: fixture }, null, 1)}\n`);

  const md = [
    "# Lab courses to classify",
    "",
    "Generated by `npm run lab-coverage -w @turboterp/course-data -- --write`. UMD's own text for each lab course not yet linked to a lecture, standalone, or covered by a rule. Cite the `Source` line in each entry.",
    "",
    ...missing.flatMap((c) => [
      `## ${c.id}: ${c.title} (${c.credits.min === c.credits.max ? c.credits.min : `${c.credits.min}-${c.credits.max}`} credits)${c.labOnly ? " [lab meetings only]" : ""}`,
      "",
      `- Source: ${sourceOf.get(c.id)}`,
      ...(c.texts.prerequisite ? [`- Prerequisite: ${c.texts.prerequisite}`] : []),
      ...(c.texts.corequisite ? [`- Corequisite: ${c.texts.corequisite}`] : []),
      ...(c.texts.restriction ? [`- Restriction: ${c.texts.restriction}`] : []),
      ...(c.texts.creditOnlyGrantedFor ? [`- Credit only granted for: ${c.texts.creditOnlyGrantedFor}`] : []),
      ...Object.entries(c.texts.other).map(([k, v]) => `- ${k}: ${v}`),
      `- Description: ${c.description.replace(/\s+/g, " ").trim()}`,
      "",
    ]),
  ];
  writeFileSync(resolve("../../program-sources/labs.md"), `${md.join("\n")}\n`);
  console.log(`wrote src/lab-pairs.generated.ts (${derived.length} pairs), test/fixtures/lab-courses.json (${fixture.length} courses), program-sources/labs.md (${missing.length} labs)`);
}
```

  Smoke-test it against the main checkout's current cache: `cd packages/course-data && node scripts/lab-coverage.ts --cache "$(git rev-parse --git-common-dir)/../packages/course-data/.cache" | head -n 3`. Expected: a count line. Don't commit `--write` output; Task 3 does that with all sources.

- [ ] **Step 7: Finish.** Commit (`Lab pairs: lab-coverage script`), push, run the full suite once, and report.

---

### Task 3: Fetch every source and generate (main session)

- [ ] Merge `feat/lab-pairs-data` into `feat/ui-rework` (Tasks 1 and 2).
- [ ] Past Testudo terms. Testudo serves 202501 and later; probe winter terms such as 202512, and skip any term that returns the 19 KB empty page:

```bash
cd packages/course-data
for t in 202501 202505 202508 202512 202601 202605; do npm run snapshot -- $t --history || echo "skipped $t"; done
npm run catalog-courses
npm run lab-coverage -- --write
```

- [ ] Append the coverage block from Task 4 Step 1 to `packages/course-data/test/lab-pairs.test.ts`. Merge its imports into the file's existing `../src/lab-pairs.ts` import, and add `import { readFileSync } from "node:fs";`. Mark the two half tests `it.skip`, so `feat/ui-rework` stays green until each half is classified. The source test and the BSCI test should pass now (the derived pairs carry sources; BSCI171 and BSCI161 come from the catalog). If the BSCI test fails, also mark it `it.skip` and note that C1 must enable it.
- [ ] Commit `src/lab-pairs.generated.ts`, `test/fixtures/lab-courses.json`, `program-sources/labs.md` and the test (`Lab pairs: derived pairs, lab fixture and sources from every term and both catalogs`). Record the counts in the status log: lab courses, by rule, derived, unclassified, plus the A–L and M–Z split.

---

### Task 4: Classify every lab (Builders C1 and C2 in parallel: departments A–L and M–Z)

C1 works on branch `feat/lab-classify-a-l` and only touches `src/lab-pairs-a-l.ts`; C2 works on `feat/lab-classify-m-z` and only touches `lab-pairs-m-z.ts`. Both branch from `feat/ui-rework` after Task 3.

**Brief rulings to quote:** "Pairings come from UMD's published sources only, never from the owner. When the text is silent or unclear, the lab is standalone: a missing pair means no warning, while a wrong pair means a wrong warning."

- [ ] **Step 1: Turn on your half's coverage test.** The main session added this block in Task 3 with both half tests marked `it.skip`. Change only your own half to `it` (C1 also enables the BSCI test if it's skipped). The block, for reference:

```ts
import { readFileSync } from "node:fs";
import { DERIVED_PAIRS, LAB_PAIRS, STANDALONE_LABS, STANDALONE_RULES } from "../src/lab-pairs.ts";

const fixture = (JSON.parse(readFileSync(new URL("./fixtures/lab-courses.json", import.meta.url), "utf8")) as { courses: LabSourceCourse[] }).courses;
const unclassifiedIn = (from: string, to: string) => unclassifiedLabs(fixture).filter((x) => x.department >= from && x.department <= to).map((x) => `${x.id} ${x.title}`);

describe("lab coverage (every source)", () => {
  it("accounts for every lab in departments A–L", () => expect(unclassifiedIn("A", "LZZZ")).toEqual([]));
  it("accounts for every lab in departments M–Z", () => expect(unclassifiedIn("M", "ZZZZ")).toEqual([]));

  it("cites a source for every hand-written entry, with valid course ids", () => {
    const id = /^[A-Z]{4}\d{3}[A-Z]?$/;
    for (const p of [...LAB_PAIRS, ...DERIVED_PAIRS]) {
      expect(p.source.trim(), p.lecture).not.toBe("");
      expect(p.lecture).toMatch(id);
      for (const lab of p.labs) expect(lab).toMatch(id);
    }
    for (const s of STANDALONE_LABS) expect([s.source.trim(), s.reason.trim()].every(Boolean), s.id).toBe(true);
    for (const r of STANDALONE_RULES) expect([r.source.trim(), r.reason.trim()].every(Boolean), r.prefix).toBe(true);
  });

  it("keeps BSCI171 and BSCI161 as labs of BSCI170 and BSCI160", () => {
    const m = labsByLecture(fixture, [...DERIVED_PAIRS, ...LAB_PAIRS]);
    expect(m.get("BSCI170")).toEqual(expect.arrayContaining(["BSCI180", "BSCI171"]));
    expect(m.get("BSCI160")).toEqual(expect.arrayContaining(["BSCI180", "BSCI161"]));
  });
});
```

  Each builder runs only its own half: `npm test -w @turboterp/course-data -- lab-pairs -t "A–L" --reporter=dot 2>&1 | tail -n 30` (or `-t "M–Z"`). Expected: FAIL, listing that half's labs.

- [ ] **Step 2: Classify.** Read only your half of `program-sources/labs.md`. For each lab:
  - **Pair** (`PAIRS`): the lab's prerequisite says "completed or be concurrently enrolled in X", the catalog says "only when taken concurrently with X", or the description says it's the lab for lecture X. Merge labs for the same lecture into one entry. `source` quotes the line and its `Source`, e.g. `"Testudo Schedule of Classes, 202608: ANSC103 prerequisite 'Must have completed or be concurrently enrolled in ANSC101.'"`.
  - **Former labs** (C1, BSCI): `{ lecture: "BSCI170", labs: ["BSCI171"], source: <BSCI171's catalog Source line> }` and `{ lecture: "BSCI160", labs: ["BSCI161"], ... }`, unless the derived pairs already link them.
  - **Standalone** (`STANDALONE`): the lab's prerequisite requires the lecture finished first ("Minimum grade of C- in ..."); or it's self-contained (lab-only, capstone, research, practicum, thesis, leadership, "Topics"); or it's a graduate course with no lecture partner; or the title uses "Laboratory" in another sense (ANSC260 Laboratory Animal Management). `reason` is a few words.
  - **Rules** (`RULES`), only for `[lab meetings only]` courses whose title doesn't say lab, where a whole department or level is studio or activity work (ARTT, DANC, MUSC, THET, KNES1, and so on). Example: `{ prefix: "DANC", reason: "dance technique and studio courses meet as labs; no separate lecture", source: "Testudo Schedule of Classes: every DANC section meets as Lab" }`. If a department's lab-only courses aren't all of one kind, classify them individually.
  - Section variants need no entry when the base lab is paired or standalone.

- [ ] **Step 3: Run your half to see it pass**, plus the source test. Commit (`Lab pairs: classify labs, departments A–L` or `M–Z`) and push. Run the full suite once and report pass or fail, plus how many labs you paired, marked standalone, or covered by rules.

---

### Task 5: The two checks (Builder B, branch `feat/lab-checks`, from `feat/ui-rework` after Task 1 is merged; can run alongside Task 4)

**Consumes:** `CatalogCourse.labs` and `sameOrVariant` (Task 1). **Produces:** the `IssueKind` members `"lab-missing"` and `"lecture-missing"`.

- [ ] **Step 1: Write the failing tests** in `packages/plan/test/lab-checks.test.ts`:

```ts
// Lab and lecture planned apart get a warning (docs/project/lab-pairs.md).

import type { Requirement } from "@turboterp/course-data/prereqs";
import { describe, expect, it } from "vitest";
import type { CatalogCourse, PlanCatalog } from "../src/catalog.ts";
import { checkPlan, type Plan, type PlanCourse, type PlanIssue } from "../src/check.ts";

const c = (id: string, credits: number, extra: Partial<CatalogCourse> = {}): CatalogCourse => ({
  id, title: id, credits: { min: credits, max: credits }, genEd: [], prerequisite: null, corequisite: null, repeat: { kind: "unknown" }, ...extra,
});
const req = (course: string, concurrentOk = false): Requirement => ({ kind: "course", course, ...(concurrentOk ? { concurrentOk } : {}) });
const catalog: PlanCatalog = new Map(
  [
    c("BSCI160", 3, { labs: ["BSCI180", "BSCI161"] }),
    c("BSCI170", 3, { labs: ["BSCI180", "BSCI171"] }), // BSCI161 and BSCI171 aren't in the catalog: former labs
    c("BSCI180", 1),
    c("BSCI180S", 1),
    c("CHEM131", 3, { labs: ["CHEM132", "CHEM177"], corequisite: req("CHEM132") }),
    c("CHEM132", 1, { corequisite: req("CHEM131") }),
    c("CHEM135", 3, { labs: ["CHEM136", "CHEM177"] }),
    c("CHEM136", 1),
    c("CHEM146", 3, { labs: ["CHEM177"] }),
    c("CHEM177", 2),
    c("ANSC101", 3, { labs: ["ANSC103"] }),
    c("ANSC103", 1, { prerequisite: req("ANSC101", true) }),
    c("PHYS999", 3, { labs: ["PHYS998"] }), // its only lab isn't in the catalog
  ].map((x) => [x.id, x]),
);
const term = (name: string, ...courses: (string | PlanCourse)[]) => ({ name, courses: courses.map((x) => (typeof x === "string" ? { id: x } : x)) });
const issues = (p: Plan, kind: PlanIssue["kind"]) => checkPlan(p, catalog).filter((i) => i.kind === kind);
const lab = (p: Plan) => issues(p, "lab-missing");
const lecture = (p: Plan) => issues(p, "lecture-missing");
const done = (id: string, grade = "B"): PlanCourse => ({ id, status: "completed", grade });

describe("lab-missing", () => {
  it("is quiet when the lab is in the same term", () => expect(lab({ terms: [term("Fall 2026", "BSCI170", "BSCI180")] })).toEqual([]));
  it("accepts a section variant of the lab", () => expect(lab({ terms: [term("Fall 2026", "BSCI170", "BSCI180S")] })).toEqual([]));
  it("accepts a former lab", () => expect(lab({ terms: [term("Fall 2026", "BSCI170", "BSCI171")] })).toEqual([]));

  it("warns when the lecture is planned alone, naming only labs in the catalog", () => {
    expect(lab({ terms: [term("Fall 2026", "BSCI170")] })).toEqual([
      { kind: "lab-missing", severity: "warning", term: "Fall 2026", course: "BSCI170", message: "BSCI170 is usually taken with its lab, BSCI180, in the same term.", short: "Usually taken with BSCI180" },
    ]);
  });
  it("names every current lab when there are several", () => {
    const [i] = lab({ terms: [term("Fall 2026", "CHEM135")] });
    expect(i?.message).toBe("CHEM135 is usually taken with one of its labs, CHEM136 or CHEM177, in the same term.");
    expect(i?.short).toBe("Usually taken with CHEM136 or CHEM177");
  });
  it("names the first lab listed when none is in the catalog", () =>
    expect(lab({ terms: [term("Fall 2026", "PHYS999")] })[0]?.message).toBe("PHYS999 is usually taken with its lab, PHYS998, in the same term."));
  it("warns when the lab is planned for a different term", () => expect(lab({ terms: [term("Fall 2026", "BSCI170"), term("Spring 2027", "BSCI180")] })).toHaveLength(1));
  it("is quiet when the lab was completed earlier", () => expect(lab({ terms: [term("Fall 2026", done("BSCI180")), term("Spring 2027", "BSCI170")] })).toEqual([]));
  it("is quiet when the lab is prior credit", () =>
    expect(lab({ priorCredit: [{ id: "BSCI180", credits: 1, source: "AP Biology (5)" }], terms: [term("Fall 2026", "BSCI170")] })).toEqual([]));
  it("warns when the earlier lab was failed or withdrawn", () => {
    for (const g of ["F", "W"]) expect(lab({ terms: [term("Fall 2026", done("BSCI180", g)), term("Spring 2027", "BSCI170")] }), g).toHaveLength(1);
  });
  it("never warns about a completed lecture", () => expect(lab({ terms: [term("Fall 2026", done("BSCI170", "A"))] })).toEqual([]));
  it("leaves it to the corequisite check when UMD lists the lab as a corequisite", () => {
    const p = { terms: [term("Fall 2026", "CHEM131")] };
    expect(lab(p)).toEqual([]);
    expect(issues(p, "corequisite")).toHaveLength(1);
  });
});

describe("lecture-missing", () => {
  it("is quiet when a lecture is in the same term", () => expect(lecture({ terms: [term("Fall 2026", "CHEM146", "CHEM177")] })).toEqual([]));
  it("accepts a section variant of the lab", () => expect(lecture({ terms: [term("Fall 2026", "BSCI170", "BSCI180S")] })).toEqual([]));

  it("warns when the lab is planned alone, naming its lectures", () => {
    expect(lecture({ terms: [term("Fall 2026", "BSCI180")] })).toEqual([
      {
        kind: "lecture-missing", severity: "warning", term: "Fall 2026", course: "BSCI180",
        message: "BSCI180 is a lab, usually taken in the same term as one of its lectures, BSCI160 or BSCI170.",
        short: "Usually taken with BSCI160 or BSCI170",
      },
    ]);
  });
  it("lists three lectures as 'A, B or C'", () =>
    expect(lecture({ terms: [term("Fall 2026", "CHEM177")] })[0]?.message).toBe("CHEM177 is a lab, usually taken in the same term as one of its lectures, CHEM131, CHEM135 or CHEM146."));
  it("is quiet with prior credit for a lecture", () =>
    expect(lecture({ priorCredit: [{ id: "BSCI160", credits: 4, source: "AP Biology (5)" }], terms: [term("Fall 2026", "BSCI180")] })).toEqual([]));
  it("is quiet when a lecture was completed earlier", () => expect(lecture({ terms: [term("Fall 2026", done("CHEM146")), term("Spring 2027", "CHEM177")] })).toEqual([]));
  it("warns only once, on the lecture, when the lecture is planned a term before the lab", () => {
    const p = { terms: [term("Fall 2026", "BSCI170"), term("Spring 2027", "BSCI180")] };
    expect(lecture(p)).toEqual([]);
    expect(lab(p)).toHaveLength(1);
  });
  it("warns when the earlier lecture was failed", () => expect(lecture({ terms: [term("Fall 2026", done("CHEM146", "F")), term("Spring 2027", "CHEM177")] })).toHaveLength(1));
  it("never warns about a completed lab", () => expect(lecture({ terms: [term("Fall 2026", done("BSCI180"))] })).toEqual([]));
  it("leaves it to the prerequisite or corequisite check when UMD names the lecture", () => {
    expect(lecture({ terms: [term("Fall 2026", "ANSC103")] })).toEqual([]);
    expect(lecture({ terms: [term("Fall 2026", "CHEM132")] })).toEqual([]);
  });
});
```

- [ ] **Step 2: Run them to see them fail.** Run `npm test -w @turboterp/plan -- lab-checks --reporter=dot 2>&1 | tail -n 30`.

- [ ] **Step 3: Implement** in `packages/plan/src/check.ts`:
  - imports: `import { earnsCredit } from "@turboterp/audit";` and `import { sameOrVariant } from "@turboterp/course-data/lab-pairs";`
  - add `| "lab-missing"` and `| "lecture-missing"` to `IssueKind`, after `"corequisite"`.
  - helpers near `courseLeaves`:

```ts
/** A plan course that counts: planned, or completed with a grade that earns credit (not F or W). */
const counts = (c: Pick<PlanCourse, "status" | "grade">) =>
  earnsCredit({ status: c.status === "completed" ? "completed" : "planned", ...(c.grade ? { grade: c.grade } : {}) });

/** "A", "A or B", "A, B or C" */
const orList = (items: string[]) => (items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} or ${items.at(-1)}`);

/** Whether a requirement names one of these courses. */
const names = (req: Requirement | null, ids: string[]) => req !== null && courseLeaves(req).some((l) => l.kind === "course" && ids.includes(l.course));

/** Each lab's lectures, from every lecture's `labs`; a section variant (BSCI180S) finds its base lab's. */
function lectureIndex(catalog: PlanCatalog): (id: string) => string[] {
  const byLab = new Map<string, string[]>();
  for (const c of catalog.values()) for (const lab of c.labs ?? []) byLab.set(lab, [...(byLab.get(lab) ?? []), c.id]);
  return (id) => byLab.get(id) ?? (/\d[A-Z]$/.test(id) ? byLab.get(id.slice(0, -1)) : undefined) ?? [];
}
```

  - in `checkPlan`, before `plan.terms.forEach`: `const lecturesOf = lectureIndex(catalog);` and

```ts
  /** Prior credit for one of `ids` that earns credit. */
  const priorFor = (has: (id: string) => boolean) =>
    (plan.priorCredit ?? []).some((x) => has(x.id) && counts({ status: "completed", ...(x.grade ? { grade: x.grade } : {}) }));
```

  - in the course loop, right after the `if (info.corequisite) { ... }` block:

```ts
      // Labs and lectures are usually taken together (docs/project/lab-pairs.md). Each check stands
      // down when UMD's own prerequisite or corequisite already names the partner.
      const labs = info.labs ?? [];
      if (labs.length > 0 && !names(info.corequisite, labs)) {
        const isLab = (id: string) => labs.some((l) => sameOrVariant(id, l));
        const together = term.courses.some((x) => isLab(x.id) && counts(x));
        const earlier = priorFor(isLab) || plan.terms.slice(0, i).some((t) => t.courses.some((x) => isLab(x.id) && x.status === "completed" && counts(x)));
        if (!together && !earlier) {
          const current = labs.filter((l) => catalog.has(l));
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

      const lectures = lecturesOf(course.id);
      if (lectures.length > 0 && !names(info.corequisite, lectures) && !names(info.prerequisite, lectures)) {
        const isLecture = (id: string) => lectures.includes(id);
        const together = term.courses.some((x) => isLecture(x.id) && counts(x));
        // A lecture planned earlier already gets lab-missing, so the lab doesn't warn too.
        const earlier = priorFor(isLecture) || plan.terms.slice(0, i).some((t) => t.courses.some((x) => isLecture(x.id) && counts(x)));
        if (!together && !earlier) {
          const current = lectures.filter((l) => catalog.has(l));
          const named = current.length > 0 ? current : lectures.slice(0, 1);
          issues.push({
            kind: "lecture-missing",
            severity: "warning",
            ...at,
            message: `${course.id} is a lab, usually taken in the same term as ${named.length === 1 ? `its lecture, ${named[0]}` : `one of its lectures, ${orList(named)}`}.`,
            short: `Usually taken with ${orList(named)}`,
          });
        }
      }
```

  (`CourseLeaf` is `course` or `dept-level`; only `kind: "course"` has `.course`, e.g. `{ kind: "course", course: "CHEM132" }`.)

- [ ] **Step 4: Run them to see them pass.** Run the Step 2 command, then the whole plan package and the web advisor tests: `npm test -w @turboterp/plan -- --reporter=dot 2>&1 | tail -n 30` and `npm test -w @turboterp/web -- advisor --reporter=dot 2>&1 | tail -n 30`. Expected: PASS.

  If a sample-plan or test-student test now shows a new warning, don't loosen the check. Change the test data only when the program source shows the lab or lecture, otherwise report the course and plan.

  Commit (`Plan checks: warn when a lab and its lecture are planned apart`) and push.

- [ ] **Step 5: Screenshots.** Take two screenshots with `npm run ui-check` (see `docs/project/working-notes.md`) of the Advisor checks panel: one plan with BSCI170 and no lab, and one with BSCI180 and no lecture. Save them to `docs/screenshots/lab-pairs/`, then commit and push.

- [ ] **Step 6: Finish.** Run the full suite once and report pass or fail.

---

### Task 6: Merge and verify (main session)

- [ ] Review each builder's diff against the spec and this plan. Spot-check about 20 classifications against their quoted sources. Merge `feat/lab-classify-a-l`, `feat/lab-classify-m-z` and `feat/lab-checks` into `feat/ui-rework` (in `.claude/worktrees/merge-s1`).
- [ ] Run `npm run lab-coverage -w @turboterp/course-data`. Expected: `0 unclassified`.
- [ ] Run `npm run advisor-data -w @turboterp/web`, then check the BSCI170 entry in `apps/web/public/data/advisor/<term>/catalog.json`: it should have `"lb":["BSCI180","BSCI171"]`.
- [ ] Run the full local test, typecheck, lint and build (no CI), then `graphify update .`.
- [ ] Show the owner the two screenshots and wait for UI approval before the owner deploys.
- [ ] Update PROJECT_MEMORY section 14, plus the status log with each builder's tokens.
