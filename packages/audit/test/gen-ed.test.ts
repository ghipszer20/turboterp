// Golden tests for UMD General Education and university-wide rules (2026–27).
// Rules from academiccatalog.umd.edu/undergraduate/general-education-requirements/.

import { describe, expect, it } from "vitest";
import { auditProgram, type StudentCourse } from "../src/audit.ts";
import { genEd, university } from "../programs/gen-ed-2026-27.ts";

const g = (id: string, codes: string[], grade = "B"): StudentCourse => ({ id, credits: 3, status: "completed", grade, genEd: codes });

const complete: StudentCourse[] = [
  g("ENGL101", ["FSAW"]),
  g("ENGL393", ["FSPW"]),
  g("COMM107", ["FSOC"]),
  g("MATH140", ["FSMA", "FSAR"]),
  g("MATH141", ["FSAR"]),
  g("HIST110", ["DSHU", "SCIS"]),
  g("PHIL100", ["DSHU"]),
  g("HIST111", ["DSHS", "DVUP"]),
  g("ECON200", ["DSHS"]),
  g("BSCI105", ["DSNL"]),
  g("ASTR100", ["DSNS", "SCIS"]),
  g("CMSC100", ["DSSP"]),
  g("ARTT100", ["DSSP"]),
  g("ANTH222", ["DVCC"]),
];

const statusOf = async (courses: StudentCourse[]) =>
  Object.fromEntries((await auditProgram(genEd, courses)).requirements.map((r) => [r.id, r.status]));
const without = (...ids: string[]) => complete.filter((x) => !ids.includes(x.id));

describe("General Education 2026–27", () => {
  it("passes a complete set", async () => {
    for (const [id, status] of Object.entries(await statusOf(complete))) expect(`${id}: ${status}`).toBe(`${id}: satisfied`);
  });

  it("requires C- or better in Academic Writing", async () => {
    const plan = complete.map((x) => (x.id === "ENGL101" ? { ...x, grade: "D" } : x));
    expect((await statusOf(plan)).fsaw).toBe("missing");
  });

  it("lets a Diversity course also count toward Distributive Studies", async () => {
    // HIST111 is both DSHS and DVUP.
    const statuses = await statusOf(complete);
    expect([statuses.dshs, statuses.dvup]).toEqual(["satisfied", "satisfied"]);
  });

  it("doesn't let one course meet two Distributive Studies categories", async () => {
    // Only HIST110 carries DSHU after removing PHIL100; a DSHU+DSHS course can't fill both.
    const plan = [...without("PHIL100", "ECON200"), g("GVPT170", ["DSHU", "DSHS"])];
    const statuses = await statusOf(plan);
    const both = [statuses.dshu, statuses.dshs];
    expect(both.filter((s) => s === "satisfied")).toHaveLength(1);
  });

  it("lets one FSMA+FSAR course fill both Mathematics and Analytic Reasoning", async () => {
    const statuses = await statusOf([g("MATH140", ["FSMA", "FSAR"])]);
    expect([statuses.fsma, statuses.fsar]).toEqual(["satisfied", "satisfied"]);
  });

  it("accepts a second lab science in place of the non-lab one", async () => {
    const plan = [...without("ASTR100"), g("CHEM131", ["DSNL", "SCIS"])];
    expect((await statusOf(plan)).natsci).toBe("satisfied");
  });

  it("requires two Big Question courses", async () => {
    const plan = [...without("ASTR100"), g("GEOL100", ["DSNS"])];
    expect((await statusOf(plan)).scis).toBe("partial");
  });

  it("requires at least one Understanding Plural Societies course in the Diversity pair", async () => {
    const plan = [...without("HIST111"), g("ECON201", ["DSHS"]), g("ANTH240", ["DVCC"])];
    expect((await statusOf(plan)).dvup).not.toBe("satisfied");
  });
});

const ds = [
  g("HIST111", ["DSHS"]),
  g("ECON200", ["DSHS"]),
  g("PHIL100", ["DSHU"]),
  g("ENGL200", ["DSHU"]),
  g("BSCI105", ["DSNL"]),
  g("GEOL100", ["DSNS"]),
  g("CMSC100", ["DSSP"]),
  g("ARTT100", ["DSSP"]),
];

describe("Big Question courses must be among the Distributive Studies courses", () => {
  it("doesn't count a Big Question course the Distributive Studies slots have no room for", async () => {
    // Only one natsci slot: of two DSNS+SCIS courses, one is outside the eight DS courses.
    const plan = [...ds.filter((x) => x.id !== "GEOL100"), g("ASTR100", ["DSNS", "SCIS"]), g("AOSC123", ["DSNS", "SCIS"])];
    const result = await auditProgram(genEd, plan);
    expect(result.requirements.find((r) => r.id === "scis")!.status).toBe("partial");
  });

  it("only assigns Big Question to courses that fill a Distributive Studies category", async () => {
    const plan = [...ds, g("GVPT170", ["DSHS", "SCIS"])];
    const result = await auditProgram(genEd, plan);
    const assigned = (id: string) => result.requirements.find((r) => r.id === id)!.assigned;
    const inDs = ["dshs", "dshu", "dsnl", "natsci", "dssp"].flatMap(assigned);
    for (const id of assigned("scis")) expect(inDs).toContain(id);
  });

  it("moves Big Question courses into the Distributive Studies slots when it can", async () => {
    const plan = [...ds, g("GVPT170", ["DSHS", "SCIS"]), g("ANTH323", ["DSHS", "SCIS"])];
    expect((await statusOf(plan)).scis).toBe("satisfied");
  });
});

const ap = (x: StudentCourse): StudentCourse => ({ ...x, exam: true });

describe("AP and IB credit limits", () => {
  it("allows six Distributive Studies courses from AP or IB", async () => {
    const plan = [...ds.slice(0, 6).map(ap), ...ds.slice(6)];
    for (const [id, status] of Object.entries(await statusOf(plan))) {
      if (["dshs", "dshu", "dsnl", "natsci", "dssp"].includes(id)) expect(`${id}: ${status}`).toBe(`${id}: satisfied`);
    }
  });

  it("leaves a Distributive Studies category short when seven courses are AP or IB", async () => {
    const plan = [...ds.slice(0, 7).map(ap), ...ds.slice(7)];
    const statuses = await statusOf(plan);
    const short = ["dshs", "dshu", "dsnl", "natsci", "dssp"].filter((id) => statuses[id] !== "satisfied");
    expect(short.length).toBeGreaterThanOrEqual(1);
  });

  it("doesn't let AP or IB credit satisfy Big Question", async () => {
    const plan = [...ds.slice(0, 4), ap(g("ASTR100", ["DSNS", "SCIS"])), ap(g("HIST110", ["DSHU", "SCIS"]))];
    expect((await statusOf(plan)).scis).not.toBe("satisfied");
    const umd = [...ds.slice(0, 4), g("ASTR100", ["DSNS", "SCIS"]), g("HIST110", ["DSHU", "SCIS"])];
    expect((await statusOf(umd)).scis).toBe("satisfied");
  });
});

// One row per Gen Ed code combination in docs/project/gen-ed-audit.md (46): [codes, a course with
// them, requirement ids it fills for certain, ids of which it fills exactly one (its Distributive
// Studies category, when it has several or a lab course may go to either natural-science slot)].
// Big Question (scis) is listed as filled because a lone course sits in a DS slot; the within rule
// is tested separately above.
const COMBINATIONS: [string[], string, string[], string[]][] = [
  [["DSSP"], "ANSC255", [], ["dssp"]],
  [["DSHU"], "AAAS200", [], ["dshu"]],
  [["DSHS"], "AAAS101", [], ["dshs"]],
  [["DSHS", "SCIS"], "AGST130", ["scis"], ["dshs"]],
  [["DSHS", "DVUP"], "AAAS100", ["diversity", "dvup"], ["dshs"]],
  [["DSHU", "DVUP"], "AAAS234", ["diversity", "dvup"], ["dshu"]],
  [["DVCC"], "AAST394", ["diversity"], []],
  [["DSSP", "SCIS"], "AGNR230", ["scis"], ["dssp"]],
  [["DSNS"], "AOSC375", [], ["natsci"]],
  [["DVUP"], "AAAS254", ["diversity", "dvup"], []],
  [["DSHU", "SCIS"], "CLAS170", ["scis"], ["dshu"]],
  [["DSNS", "SCIS"], "AOSC123", ["scis"], ["natsci"]],
  [["FSPW"], "ENGL381", ["fspw"], []],
  [["DSNL"], "ASTR101", [], ["dsnl", "natsci"]],
  [["FSAR"], "BIOM301", ["fsar"], []],
  [["DSHU", "DSSP"], "ARHU275", [], ["dshu", "dssp"]],
  [["FSOC"], "ARCH403", ["fsoc"], []],
  [["DSNL", "DSNS"], "BSCI160", [], ["dsnl", "natsci"]],
  [["DSSP", "DVUP"], "AAST351", ["diversity", "dvup"], ["dssp"]],
  [["DSHU", "DVUP", "SCIS"], "ARTH261", ["diversity", "dvup", "scis"], ["dshu"]],
  [["DSHS", "DVUP", "SCIS"], "AAAS187", ["diversity", "dvup", "scis"], ["dshs"]],
  [["DSHS", "DSHU", "DVUP"], "HIST201", ["diversity", "dvup"], ["dshs", "dshu"]],
  [["DSSP", "DVCC"], "EDSP220", ["diversity"], ["dssp"]],
  [["DSHS", "DSSP"], "FMSC302", [], ["dshs", "dssp"]],
  [["DSHU", "DSSP", "SCIS"], "ARTH260", ["scis"], ["dshu", "dssp"]],
  [["DSHS", "DSHU"], "CLAS312", [], ["dshs", "dshu"]],
  [["DSHS", "DVCC"], "CPSP220", ["diversity"], ["dshs"]],
  [["FSAR", "FSMA"], "DATA100", ["fsar", "fsma"], []],
  [["FSAW"], "ENGL101", ["fsaw"], []],
  [["DSHS", "DSSP", "SCIS"], "CCJS225", ["scis"], ["dshs", "dssp"]],
  [["DSHS", "DVCC", "SCIS"], "ANTH266", ["diversity", "scis"], ["dshs"]],
  [["DSNL", "SCIS"], "BSCI135", ["scis"], ["dsnl", "natsci"]],
  [["FSMA"], "MATH107", ["fsma"], []],
  [["DSHS", "DSHU", "DVUP", "SCIS"], "HIST187", ["diversity", "dvup", "scis"], ["dshs", "dshu"]],
  [["DSHU", "DSSP", "DVUP"], "AMST320", ["diversity", "dvup"], ["dshu", "dssp"]],
  [["DSHS", "DSHU", "SCIS"], "PHIL202", ["scis"], ["dshs", "dshu"]],
  [["DSNL", "DVUP"], "ANTH222", ["diversity", "dvup"], ["dsnl", "natsci"]],
  [["DSNL", "DSNS", "SCIS"], "AOSC200", ["scis"], ["dsnl", "natsci"]],
  [["DSNS", "DSSP", "SCIS"], "AREC200", ["scis"], ["natsci", "dssp"]],
  [["DSNS", "DSSP", "DVUP", "SCIS"], "BSCI151", ["diversity", "dvup", "scis"], ["natsci", "dssp"]],
  [["DSSP", "DVUP", "SCIS"], "HDCC105", ["diversity", "dvup", "scis"], ["dssp"]],
  [["DSNS", "DSSP"], "KNES260", [], ["natsci", "dssp"]],
  [["DSHS", "DSNS", "SCIS"], "PHYS235", ["scis"], ["dshs", "natsci"]],
  [["DSHS", "DSNS"], "PSYC100", [], ["dshs", "natsci"]],
  [["DSSP", "DVCC", "SCIS"], "CPSP210", ["diversity", "scis"], ["dssp"]],
  [["DSHU", "DVCC", "SCIS"], "RELS271", ["diversity", "scis"], ["dshu"]],
];

describe("every Gen Ed code combination", () => {
  it("covers all 46 combinations", () => {
    expect(new Set(COMBINATIONS.map(([codes]) => codes.join("+"))).size).toBe(46);
  });

  it.each(COMBINATIONS)("%j (%s) fills only what it should", async (codes, id, fills, oneOf) => {
    const result = await auditProgram(genEd, [g(id, codes)]);
    const filled = result.requirements.filter((r) => r.assigned.includes(id)).map((r) => r.id);
    const expected = [...fills, ...(oneOf.length > 0 ? [oneOf.find((o) => filled.includes(o))!] : [])];
    expect(oneOf.length === 0 || oneOf.some((o) => filled.includes(o))).toBe(true);
    expect([...filled].sort()).toEqual([...expected].sort());
  });
});

describe("University rules", () => {
  it("requires 120 credits", async () => {
    const forty = Array.from({ length: 40 }, (_, i) => g(`XXXX${100 + i}`, []));
    const short = await auditProgram(university, forty.slice(0, 39));
    const full = await auditProgram(university, forty);
    expect(short.requirements.find((r) => r.id === "credits")!.status).toBe("partial");
    expect(full.requirements.find((r) => r.id === "credits")!.status).toBe("satisfied");
  });
});
