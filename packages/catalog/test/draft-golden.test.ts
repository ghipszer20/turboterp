// Golden tests: the drafts of the real CS and Math pages against the programs
// encoded by hand in packages/audit/programs/. They must agree on everything a
// requirement table can express; every place they differ is listed below with
// the reason (a footnote rule, an owner ruling, an overlay, prose the drafter
// leaves to review), so a new difference fails the test until it's explained.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { Program, Requirement, SetMember } from "@turboterp/audit";
import { cmscMajor } from "../../audit/programs/cmsc-major-2026-27.ts";
import { mathMajorTraditional } from "../../audit/programs/math-major-2026-27.ts";
import { mathMajorApplied } from "../../audit/programs/math-major-applied-2026-27.ts";
import { draftProgram, type Draft, type ReviewReason } from "../src/draft.ts";
import { parseProgramPage } from "../src/program.ts";

const fixture = (name: string) => parseProgramPage(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8"));
const meta = { catalogYear: "2026-27", source: "UMD Academic Catalog 2026–27" };

/** A set as text, members in order-independent form: "AOSC200&AOSC201&2 of {…}". */
const setKey = (o: SetMember[]) =>
  o
    .map((m) => (typeof m === "string" ? m : `${m.count} of ${JSON.stringify(m.from)}`))
    .sort()
    .join("&");

/** Every k-course subset of `xs`, order-independent (n choose k). */
function chooseFrom<T>(xs: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (xs.length < k) return [];
  const [head, ...rest] = xs;
  return [...chooseFrom(rest, k - 1).map((c) => [head!, ...c]), ...chooseFrom(rest, k)];
}

/**
 * Every fully-expanded set a compact set option could mean: a `{count, from:{courses}}` member
 * (the drafter's compact form for "N more from a list") expands to every course combination it
 * could pick, crossed with the option's other members. A department/number-range filter (e.g.
 * "two 400-level AOSC courses") can't be enumerated into courses and is kept as one opaque member,
 * so it's compared by the filter itself rather than by course. A plain, already-expanded option
 * (the hand encoding's usual style) expands to just itself.
 */
function expandOption(option: SetMember[]): SetMember[][] {
  return option.reduce<SetMember[][]>((acc, m) => {
    if (typeof m === "string" || !m.from.courses) return acc.map((combo) => [...combo, m]);
    const picks = chooseFrom(m.from.courses, m.count);
    return acc.flatMap((combo) => picks.map((p) => [...combo, ...p]));
  }, [[]]);
}

/** setKeys of every set an options list could mean, once compact filter-over-a-list members are expanded. */
const expandedSetKeys = (options: SetMember[][]) => new Set(options.flatMap((o) => expandOption(o).map(setKey)));

/** What a requirement means to the audit, without its id or name. "One of" is the same rule as a course or a choose-one. */
function meaning(r: Requirement): string {
  const sorted = (xs: string[]) => [...xs].sort();
  const overlay = r.overlay ? " overlay" : "";
  switch (r.kind) {
    case "course":
      return `one of ${sorted(r.options)}${overlay}`;
    case "choose": {
      const alternatives = r.alternatives ? ` alternatives ${sorted(r.alternatives.map((g) => sorted(g).join("|")))}` : "";
      if (r.count === 1 && r.from.courses && Object.keys(r.from).length === 1 && !alternatives) return `one of ${sorted(r.from.courses)}${overlay}`;
      return `choose ${r.count ?? `${r.credits} credits`} from ${JSON.stringify(r.from)}${alternatives}${overlay}`;
    }
    case "sets":
      return `sets ${r.count ?? 1} of ${sorted(r.options.map(setKey))}${overlay}`;
    case "distribution":
      return `distribution ${r.count}/${r.minAreas}/${r.maxPerArea} ${r.areas.map((a) => `${a.name}=${sorted(a.courses ?? [])}`)}${overlay}`;
    case "concentration":
      return `concentration ${JSON.stringify({ ...r, id: undefined, name: undefined })}`;
    case "openSlot":
      return `openSlot ${r.credits ?? ""}`;
  }
}

/** A requirement both have, drafted differently. */
type Pair = {
  draft: string;
  hand: string;
  why: string;
  /** Options the hand encoding adds beyond the table (and nothing else differs). */
  extraOptions?: string[];
  /**
   * Options the table has that the hand encoding drops (e.g. the department page overrides the
   * catalog and removes a course; owner ruling: follow the department page).
   */
  missingOptions?: string[];
  /** The hand encoding marks it an overlay; otherwise identical. */
  overlay?: true;
  /** Every draft set is in the hand encoding, which has more (sets requirements): exactly the
   * expanded set keys (see `expandedSetKeys`) the hand encoding has and the draft doesn't. */
  fewerSets?: string[];
};
/** A hand requirement with no drafted counterpart: the table row went to review with this reason, or it isn't in the table at all. */
type Missing = { hand: string; why: string; review: ReviewReason | null; row?: string };

type Golden = {
  draft: Draft;
  hand: Program;
  pairs: Pair[];
  missing: Missing[];
  /** The program's expected program-wide minGrade ("C-" for every program so far), or undefined
   * for a program with no single program-wide floor (e.g. one requirement needs a looser minGrade
   * of its own) -- always set explicitly (never defaulted) so a program can't silently skip this. */
  handMinGrade: string | undefined;
};

const FOOTNOTE_1_HONORS = "footnote 1 (honors MATH340–MATH341) is prose; the table lists only the standard course";
const OWNER_CMSC141 = "owner-confirmed 2026-09-25: CMSC141/CMSC142 substitute for CMSC131/CMSC132; not in the catalog table";
const DEPT_PROGRAMMING_EXTRAS = ["AOSC247", "BIOE241", "ENME202", "ENME351", "ENME489I", "PHYS165", "AOSC358L"];
const DEPT_VS_CATALOG_PROGRAMMING =
  "department-vs-catalog difference (owner ruling: follow the department page): the department page's programming item (4) is " +
  "'CMSC 106, 131, 132, AOSC247, BIOE 241, ENAE 202, ENME202, ENME 351, ENME489I, ENEE150, PHYS 165, PHYS265, AOSC358L', wider than the catalog's row";
const DEPT_MATH240_MATH461 =
  "department-vs-catalog difference (owner ruling: follow the department page): the department page says 'the MATH 240 requirement may be fulfilled by MATH461'; the catalog's footnote 1 doesn't";

const goldens: Record<string, Golden> = {
  "Computer Science Major": {
    draft: draftProgram(fixture("cs-major.html"), { ...meta, id: "cmsc-major", list: 0 }),
    hand: cmscMajor,
    // No single program-wide minGrade: department-vs-catalog difference (owner ruling: follow the
    // department page) -- the department's Upper Level Concentration page allows a D grade in the
    // concentration specifically (GPA >= 1.7), looser than the catalog's blanket "C- or better".
    // Every requirement sets its own minGrade instead ("C-", except the concentration's "D-").
    handMinGrade: undefined,
    pairs: [
      {
        draft: "cmsc131",
        hand: "cmsc131",
        why:
          `${OWNER_CMSC141}; department-vs-catalog difference (owner ruling: follow the department page): the department's main ` +
          "requirements page offers 'CMSC131 or CMSC133' (an accelerated 2-credit alternative); the catalog table lists only CMSC131",
        extraOptions: ["CMSC141", "CMSC133"],
      },
      { draft: "cmsc132", hand: "cmsc132", why: OWNER_CMSC141, extraOptions: ["CMSC142"] },
      {
        draft: "areas-cmsc411",
        hand: "areas",
        why:
          "department-vs-catalog difference (owner ruling: follow the department page): the department's General Track and " +
          "Cybersecurity specialization pages list CMSC431 (Privacy Engineering) under Area 3; the catalog's Area 3 table (and " +
          "its Cybersecurity table) omit it. Added to Area 3 -- not checked further by this golden test, which doesn't diff " +
          "distribution areas course-by-course.",
      },
    ],
    missing: [
      { hand: "stat4xx", why: "'STAT4xx' is an unlinked course pattern; the draft suggests the filter but doesn't guess", review: "course-pattern", row: "STAT4xx" },
      { hand: "mathxxx", why: "'MATH/AMSC/STAT xxx' depends on footnote 2 (prerequisite MATH141 or higher)", review: "unrecognized-rule", row: "MATH/AMSC/STAT xxx" },
      { hand: "electives", why: "the 6 upper-level elective credits come from footnote 3 only; no table row says so", review: null },
      {
        hand: "concentration",
        why: "'Select at least 12 credits … from one discipline outside of CMSC' is prose the drafter doesn't parse (the engine can express it)",
        review: "unrecognized-rule",
        row: "one discipline outside of CMSC",
      },
    ],
  },
  "Mathematics Major (Traditional Track)": {
    draft: draftProgram(fixture("math-major.html"), { ...meta, id: "math-major", list: 0 }),
    hand: mathMajorTraditional,
    handMinGrade: "C-",
    pairs: [
      {
        draft: "math240",
        hand: "math240",
        why: `${FOOTNOTE_1_HONORS}; the hand encoding also makes it an overlay; ${DEPT_MATH240_MATH461}`,
        extraOptions: ["MATH340", "MATH461"],
        overlay: true,
      },
      { draft: "math241", hand: "math241", why: FOOTNOTE_1_HONORS, extraOptions: ["MATH340"] },
      { draft: "one-of-math246", hand: "intro3", why: FOOTNOTE_1_HONORS, extraOptions: ["MATH341"] },
      {
        draft: "one-of-cmsc106",
        hand: "programming",
        why: `${OWNER_CMSC141}; ${DEPT_VS_CATALOG_PROGRAMMING}`,
        extraOptions: ["CMSC141", "CMSC142", ...DEPT_PROGRAMMING_EXTRAS],
      },
      {
        draft: "sequence-phys161",
        hand: "supporting",
        why:
          "owner ruling: CMSC131 may count for programming and Sequence Four, so the sequence is an overlay; " +
          "the hand encoding adds CMSC141/142 to Sequence Four (assumption, PROJECT_MEMORY section 17 open question 4); " +
          "department-vs-catalog difference (owner ruling: follow the department page): the department page's item 5 adds Sequences " +
          "Nine (BSCI/CHEM), Ten (ASTR), Eleven (GEOL) and Twelve (AOSC) beyond the catalog's eight, matching the Applied track",
        overlay: true,
        // Sequence Four's CMSC141/CMSC142 variants (owner-confirmed, not in the catalog table), and
        // Sequences Nine-Twelve (department page only, not in the catalog's eight-sequence table).
        fewerSets: [
          "CMSC131&CMSC142&CMSC216",
          "CMSC132&CMSC141&CMSC216",
          "CMSC141&CMSC142&CMSC216",
          "BSCI160&BSCI161&BSCI170&BSCI171&CHEM131&CHEM132",
          "BSCI160&BSCI161&BSCI170&BSCI171&CHEM146&CHEM177",
          "BSCI160&BSCI170&BSCI180&CHEM131&CHEM132",
          "BSCI160&BSCI170&BSCI180&CHEM146&CHEM177",
          "ASTR130&ASTR131&ASTR232",
          "GEOL100&GEOL110&GEOL322&GEOL340",
          "GEOL100&GEOL110&GEOL322&GEOL341",
          "GEOL100&GEOL110&GEOL322&GEOL375",
          "GEOL100&GEOL110&GEOL340&GEOL341",
          "GEOL100&GEOL110&GEOL340&GEOL375",
          "GEOL100&GEOL110&GEOL341&GEOL375",
          '2 of {"departments":["AOSC"],"minNumber":400,"maxNumber":499}&AOSC200&AOSC201',
        ],
      },
    ],
    missing: [
      { hand: "stat4xx", why: "'Any 400-level STAT course other than STAT464' is prose the drafter doesn't parse", review: "unrecognized-rule", row: "Any 400-level STAT course" },
      { hand: "depth", why: "'Select depth requirement; a one year sequence chosen from the following:' isn't a recognized phrasing, and it's an overlay", review: "unrecognized-rule", row: "Select depth requirement" },
      { hand: "eight", why: "'Select eight courses …; must include:' is an umbrella overlay count, with footnote 4's exclusions", review: "must-include", row: "must include" },
    ],
  },
  "Mathematics Major (Applied Mathematics Track)": {
    draft: draftProgram(fixture("math-major.html"), { ...meta, id: "math-major", list: 1 }),
    hand: mathMajorApplied,
    handMinGrade: "C-",
    pairs: [
      {
        draft: "math240",
        hand: "math240",
        why: `${FOOTNOTE_1_HONORS}; the hand encoding also makes it an overlay; ${DEPT_MATH240_MATH461}`,
        extraOptions: ["MATH340", "MATH461"],
        overlay: true,
      },
      { draft: "math241", hand: "math241", why: FOOTNOTE_1_HONORS, extraOptions: ["MATH340"] },
      {
        draft: "one-of-math246",
        hand: "intro3",
        why:
          `${FOOTNOTE_1_HONORS}; department-vs-catalog difference (owner ruling: follow the department page): the department page's ` +
          "Applied Math Track item (1) offers only 'MATH 246 requirement may be fulfilled by MATH 462 instead', while the catalog's Applied " +
          "table also lists MATH436 for the same slot (as the Traditional track does); MATH436 is dropped here",
        extraOptions: ["MATH341"],
        missingOptions: ["MATH436"],
      },
      {
        draft: "one-of-cmsc106",
        hand: "programming",
        why: `${OWNER_CMSC141}; ${DEPT_VS_CATALOG_PROGRAMMING}`,
        extraOptions: ["CMSC141", "CMSC142", ...DEPT_PROGRAMMING_EXTRAS],
      },
      {
        draft: "one-of-math416",
        hand: "applied",
        why:
          "department-vs-catalog difference (owner ruling: follow the department page): department page items (1) and (3)(f) say a MATH462 " +
          "used for the MATH246 slot may also count as this upper-level requirement; the catalog's footnote 3 is silent, so the hand encoding " +
          "makes this requirement an overlay",
        overlay: true,
      },
      {
        draft: "sequence-phys161",
        hand: "supporting",
        why:
          "overlay (owner ruling on CMSC131); the hand encoding adds CMSC141/142 to Sequence Four (owner) and BSCI171+BSCI161 for BSCI180 (a note in the course title); " +
          "Sequence Eleven's 'Select Two From:' is drafted as a course-count filter part (checked by expansion below, against the hand encoding's six fully expanded sets), " +
          "and Sequence Twelve matches the hand encoding's filter part (two 400-level AOSC) exactly",
        overlay: true,
        // Sequence Four's CMSC141/CMSC142 variants and Sequence Nine's BSCI171+BSCI161 variants (both owner-confirmed, not in the catalog table).
        fewerSets: [
          "BSCI160&BSCI161&BSCI170&BSCI171&CHEM131&CHEM132",
          "BSCI160&BSCI161&BSCI170&BSCI171&CHEM146&CHEM177",
          "CMSC131&CMSC142&CMSC216",
          "CMSC132&CMSC141&CMSC216",
          "CMSC141&CMSC142&CMSC216",
        ],
      },
    ],
    missing: [
      { hand: "stat4xx", why: "'STAT4XX' is an unlinked course pattern (and the hand encoding excludes STAT400, STAT410 and STAT464, matching the catalog row's own text)", review: "course-pattern", row: "STAT4XX" },
      { hand: "depth", why: "'Select depth requirement; …' isn't a recognized phrasing, and it's an overlay", review: "unrecognized-rule", row: "Select depth requirement" },
      { hand: "eight", why: "'Select eight 400-level or higher; must include:' is an umbrella overlay count, with footnote 3's exclusions", review: "must-include", row: "must include" },
    ],
  },
};

describe.each(Object.entries(goldens))("draft of %s vs the hand encoding", (_, { draft, hand, pairs, missing, handMinGrade }) => {
  const draftById = new Map(draft.program.requirements.map((r) => [r.id, r]));
  const handById = new Map(hand.requirements.map((r) => [r.id, r]));
  const handMeanings = new Set(hand.requirements.map(meaning));
  const draftMeanings = new Set(draft.program.requirements.map(meaning));

  it("agrees on every requirement except the documented differences", () => {
    const draftOnly = draft.program.requirements.filter((r) => !handMeanings.has(meaning(r))).map((r) => r.id);
    const handOnly = hand.requirements.filter((r) => !draftMeanings.has(meaning(r))).map((r) => r.id);
    expect(draftOnly.sort()).toEqual(pairs.map((p) => p.draft).sort());
    expect(handOnly.sort()).toEqual([...pairs.map((p) => p.hand), ...missing.map((m) => m.hand)].sort());
  });

  it.each(pairs)("$draft vs $hand differs only as documented: $why", (pair) => {
    const d = draftById.get(pair.draft)!;
    const h = handById.get(pair.hand)!;
    expect(Boolean(h.overlay)).toBe(Boolean(pair.overlay));
    expect(d.overlay).toBeUndefined();
    if (d.kind === "sets" && h.kind === "sets") {
      const handSets = expandedSetKeys(h.options);
      const draftSets = expandedSetKeys(d.options);
      for (const o of d.options) for (const variant of expandOption(o)) expect(handSets).toContain(setKey(variant));
      if (pair.fewerSets) expect([...handSets].filter((k) => !draftSets.has(k)).sort()).toEqual([...pair.fewerSets].sort());
      else {
        expect(d.options.length < h.options.length).toBe(false);
        expect(meaning({ ...h, overlay: undefined })).toBe(meaning(d));
      }
      return;
    }
    const options = (r: Requirement) => (r.kind === "course" ? r.options : r.kind === "choose" ? (r.from.courses ?? []) : []);
    expect(options(h).filter((o) => !options(d).includes(o)).sort()).toEqual([...(pair.extraOptions ?? [])].sort());
    expect(options(d).filter((o) => !options(h).includes(o)).sort()).toEqual([...(pair.missingOptions ?? [])].sort());
  });

  it.each(missing)("$hand is left to review ($review): $why", (m) => {
    if (m.review) expect(draft.review).toContainEqual(expect.objectContaining({ reason: m.review, text: expect.stringContaining(m.row!) }));
  });

  it("is unverified, and leaves program-wide rules from prose (minimum grade) to the owner", () => {
    expect(draft.program.verified).toBe(false);
    expect(draft.program.minGrade).toBeUndefined();
    expect(hand.minGrade).toBe(handMinGrade);
  });
});
