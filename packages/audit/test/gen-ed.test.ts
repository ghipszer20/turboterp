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

describe("University rules", () => {
  it("requires 120 credits", async () => {
    const forty = Array.from({ length: 40 }, (_, i) => g(`XXXX${100 + i}`, []));
    const short = await auditProgram(university, forty.slice(0, 39));
    const full = await auditProgram(university, forty);
    expect(short.requirements.find((r) => r.id === "credits")!.status).toBe("partial");
    expect(full.requirements.find((r) => r.id === "credits")!.status).toBe("satisfied");
  });
});
