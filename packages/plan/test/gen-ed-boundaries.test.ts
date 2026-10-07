// Boundary tests for the Gen Ed audit, end to end: invented students (plan terms + exam credit)
// go through planCourses and then auditProgram(genEd). Each rule sits exactly at its limit: one
// student just passes, one just fails. Rules and quotes: program-sources/gen-ed.md.
// Test-only: where the audit gets a rule wrong the test is an it.fails with a comment.

import { describe, expect, it } from "vitest";
import { auditProgram } from "@turboterp/audit";
import { genEd } from "../../audit/programs/gen-ed-2026-27.ts";
import { creditForAp, toStudentCourses } from "@turboterp/credit";
import type { CatalogCourse, PlanCatalog } from "../src/catalog.ts";
import type { Plan, PlanCourse, PriorCredit } from "../src/check.ts";
import { planCourses } from "../src/notices.ts";

const c = (id: string, credits: number, genEdCodes: string[] = [], extra: Partial<CatalogCourse> = {}): CatalogCourse => ({
  id,
  title: id,
  credits: { min: credits, max: credits },
  genEd: genEdCodes,
  prerequisite: null,
  corequisite: null,
  repeat: { kind: "unknown" },
  ...extra,
});

/** Distributive Studies course of `credits` credits: "HSXX301" is a 3-credit DSHS; n tells copies apart. */
const dsId = (code: string, credits: number, n = 1) => `${code.slice(2)}XX${credits}0${n}`;
const catalogList: CatalogCourse[] = [
  c("WRIT100", 3, ["FSAW"]),
  c("PROF100", 3, ["FSPW"]),
  c("ORAL100", 3, ["FSOC"]),
  c("MATH101", 3, ["FSMA"]),
  c("ANAL100", 3, ["FSAR"]),
  c("ANAL102", 2, ["FSAR"]),
  c("MAFA100", 3, ["FSMA", "FSAR"]),
  // Lab science: the lecture is DSNL only with its lab in the same term.
  c("LABL100", 3, ["DSNL", "DSNS"], { labPair: { code: "DSNL", with: "LABX101" } }),
  c("LABX101", 1),
  c("NSAA100", 3, ["DSNS"]),
  c("NSBB100", 3, ["DSNS"]),
  c("NSCC100", 4, ["DSNS"]),
  c("NSDD100", 4, ["DSNS"]),
  // Big Question and Diversity
  c("BQHS100", 3, ["DSHS", "SCIS"]),
  c("BQHU100", 3, ["DSHU", "SCIS"]),
  c("BQXX100", 3, ["SCIS"]),
  c("DVUP100", 3, ["DVUP"]),
  c("DVUP200", 3, ["DVUP"]),
  c("DVCC100", 3, ["DVCC"]),
  c("DVCC200", 3, ["DVCC"]),
  c("DVBO100", 3, ["DVUP", "DVCC"]),
  c("DUHS100", 3, ["DSHS", "DVUP"]),
  c("DUHS200", 3, ["DSHS", "DVUP"]),
  c("BOTH100", 3, ["DSHS", "DSHU"]),
  ...["DSHS", "DSHU", "DSSP"].flatMap((code) => [1, 2, 3, 6].flatMap((cr) => [1, 2].map((n) => c(dsId(code, cr, n), cr, [code])))),
];
const catalog: PlanCatalog = new Map(catalogList.map((x) => [x.id, x]));

type Status = "satisfied" | "partial" | "missing";
const done = (id: string, grade = "A"): PlanCourse => ({ id, status: "completed", grade });
const planned = (id: string): PlanCourse => ({ id });
const plan = (terms: PlanCourse[][], priorCredit?: PriorCredit[]): Plan => ({
  terms: terms.map((courses, i) => ({ name: `Term ${i + 1}`, courses })),
  ...(priorCredit ? { priorCredit } : {}),
});
/** One completed term of the given ids. */
const student = (ids: string[], priorCredit?: PriorCredit[]) => plan([ids.map((id) => done(id))], priorCredit);

async function audit(p: Plan): Promise<Record<string, Status>> {
  const result = await auditProgram(genEd, planCourses(p, catalog));
  return Object.fromEntries(result.requirements.map((r) => [r.id, r.status]));
}
const satisfied = (s: Record<string, Status>) => Object.entries(s).filter(([, v]) => v === "satisfied").map(([k]) => k);
const unmet = (s: Record<string, Status>) => Object.entries(s).filter(([, v]) => v !== "satisfied").map(([k]) => k);

/** Exam credit as plan prior credit, keeping source and genEdCredits. */
function apCredit(exams: [string, number][], choices: Record<string, string> = {}): PriorCredit[] {
  const { courses } = toStudentCourses(exams.map(([e, s]) => creditForAp(e, s)), choices);
  return courses.map((x) => ({
    id: x.id,
    credits: x.credits,
    genEd: x.genEd ?? [],
    source: x.source,
    ...(x.genEdCredits === undefined ? {} : { genEdCredits: x.genEdCredits }),
  }));
}
/** Invented exam credit: `kind` is "AP" or "IB" (the label planCourses reads from the source). */
const exam = (kind: "AP" | "IB", id: string, credits: number, genEdCodes: string[]): PriorCredit => ({ id, credits, genEd: genEdCodes, source: `${kind} Invented ${id} (4)` });

describe("Academic Writing: 'FSAW 3 credits'; needs C- or better (minGrade C-)", () => {
  it("passes with a C-", async () => {
    expect((await audit(plan([[done("WRIT100", "C-")]]))).fsaw).toBe("satisfied");
  });
  it("fails with a D+", async () => {
    expect((await audit(plan([[done("WRIT100", "D+")]]))).fsaw).not.toBe("satisfied");
  });
  it("passes with AP English Language and Composition 4 (FSAW)", async () => {
    expect((await audit(plan([[]], apCredit([["English Language and Composition", 4]])))).fsaw).toBe("satisfied");
  });
  it("fails with AP English Language and Composition 3 (elective only)", async () => {
    expect((await audit(plan([[]], apCredit([["English Language and Composition", 3]])))).fsaw).not.toBe("satisfied");
  });
});

describe("Math and Analytic Reasoning: 'Courses designated as both FSMA and FSAR will satisfy both'; each row 3 credits", () => {
  it("a course tagged FSMA and FSAR fills both rows", async () => {
    const s = await audit(student(["MAFA100"]));
    expect(s.fsma).toBe("satisfied");
    expect(s.fsar).toBe("satisfied");
  });
  it("an FSMA-only course leaves FSAR unmet, and a separate FSAR course fills it", async () => {
    expect((await audit(student(["MATH101"]))).fsar).not.toBe("satisfied");
    const s = await audit(student(["MATH101", "ANAL100"]));
    expect(s.fsma).toBe("satisfied");
    expect(s.fsar).toBe("satisfied");
  });
  it("a 3-credit FSAR passes and a 2-credit FSAR fails (each row needs 3 credits)", async () => {
    expect((await audit(student(["ANAL100"]))).fsar).toBe("satisfied");
    expect((await audit(student(["ANAL102"]))).fsar).not.toBe("satisfied");
  });
});

describe("one course meets only one Distributive Studies category", () => {
  const rest = [dsId("DSHS", 3), dsId("DSHU", 3)];
  it("a DSHS+DSHU course plus one DSHS and one DSHU course can't complete both areas", async () => {
    const s = await audit(student(["BOTH100", ...rest]));
    expect(satisfied(s).filter((r) => r === "dshs" || r === "dshu")).toHaveLength(1);
  });
  it("one more course in the short area completes both", async () => {
    const s = await audit(student(["BOTH100", ...rest, dsId("DSHU", 3, 2)]));
    expect(s.dshs).toBe("satisfied");
    expect(s.dshu).toBe("satisfied");
  });
});

describe.each([
  ["DSHS", "dshs"],
  ["DSHU", "dshu"],
  ["DSSP", "dssp"],
])("%s: '2 courses must be from each area', 6 credits", (code, row) => {
  const at = async (...ids: string[]) => (await audit(student(ids)))[row];
  it("3+3 credits passes", async () => {
    expect(await at(dsId(code, 3), dsId(code, 3, 2))).toBe("satisfied");
  });
  it("1+2 credits fails (two courses, too few credits)", async () => {
    expect(await at(dsId(code, 1), dsId(code, 2))).not.toBe("satisfied");
  });
  it("1+2+3 credits passes (6 credits across three courses)", async () => {
    expect(await at(dsId(code, 1), dsId(code, 2), dsId(code, 3))).toBe("satisfied");
  });
  it("a single 6-credit course fails (needs two courses)", async () => {
    expect(await at(dsId(code, 6))).not.toBe("satisfied");
  });
  it("two courses of 3+2 credits fail (5 credits)", async () => {
    expect(await at(dsId(code, 3), dsId(code, 2))).not.toBe("satisfied");
  });
});

describe("Natural Sciences: '7 credits; at least one course must have lab component'", () => {
  const inTerms = (...terms: string[][]) => plan(terms.map((t) => t.map((id) => done(id))));
  it("lab lecture + lab in the same term plus a 3-credit DSNS passes (4 + 3 = 7)", async () => {
    const s = await audit(inTerms(["LABL100", "LABX101", "NSAA100"]));
    expect(s.natsci).toBe("satisfied");
    expect(s.dsnl).toBe("satisfied");
  });
  it("the lab pair alone is 4 credits and one course: DSNL is met, Natural Sciences isn't", async () => {
    const s = await audit(inTerms(["LABL100", "LABX101"]));
    expect(s.dsnl).toBe("satisfied");
    expect(s.natsci).not.toBe("satisfied");
  });
  it("the lab in a different term means no DSNL", async () => {
    const s = await audit(inTerms(["LABL100", "NSCC100"], ["LABX101"]));
    expect(s.natsci).toBe("satisfied"); // 3 + 4 = 7 as two DSNS courses
    expect(s.dsnl).not.toBe("satisfied");
  });
  it("a withdrawn lab means no DSNL", async () => {
    const s = await audit(plan([[done("LABL100"), done("LABX101", "W"), done("NSCC100")]]));
    expect(s.natsci).toBe("satisfied");
    expect(s.dsnl).not.toBe("satisfied");
  });
  it("two DSNS courses (4+4 credits) fill Natural Sciences but not the lab row", async () => {
    const s = await audit(student(["NSCC100", "NSDD100"]));
    expect(s.natsci).toBe("satisfied");
    expect(s.dsnl).not.toBe("satisfied");
  });
  it("two DSNS courses of 3+3 credits fail on credits (6 < 7)", async () => {
    expect((await audit(student(["NSAA100", "NSBB100"]))).natsci).not.toBe("satisfied");
  });
  it("AP Chemistry 4 (CHEM131 + CHEM132) plus a 3-credit DSNS course passes", async () => {
    const s = await audit(student(["NSAA100"], apCredit([["Chemistry", 4]])));
    expect(s.natsci).toBe("satisfied");
    expect(s.dsnl).toBe("satisfied");
  });
  it("prior credit for a lab lecture with no explicit Gen Ed (dual enrollment) gets no DSNL", async () => {
    const dual: PriorCredit = { id: "LABL100", credits: 3, source: "Dual enrollment" };
    const s = await audit(student(["NSCC100"], [dual]));
    expect(s.natsci).toBe("satisfied"); // DSNS 3 + 4
    expect(s.dsnl).not.toBe("satisfied");
  });
});

describe("Big Question: 'Big Question courses must also fulfill a Distributive Studies category'; AP can't satisfy it", () => {
  it("two SCIS courses that fill DS categories pass", async () => {
    expect((await audit(student(["BQHS100", "BQHU100"]))).scis).toBe("satisfied");
  });
  it("one SCIS course fails", async () => {
    expect((await audit(student(["BQHS100"]))).scis).not.toBe("satisfied");
  });
  it("a SCIS course with no DS code doesn't count", async () => {
    expect((await audit(student(["BQHS100", "BQXX100"]))).scis).not.toBe("satisfied");
  });
  it("two exam-credit SCIS courses never count, though they still fill their DS area", async () => {
    const prior = [exam("AP", "BQEX101", 3, ["DSHS", "SCIS"]), exam("IB", "BQEX102", 3, ["DSHS", "SCIS"])];
    const s = await audit(student([], prior));
    expect(s.dshs).toBe("satisfied");
    expect(s.scis).not.toBe("satisfied");
  });
  it("one exam and one regular SCIS course is still one short", async () => {
    const s = await audit(student(["BQHU100"], [exam("AP", "BQEX101", 3, ["DSHS", "SCIS"])]));
    expect(s.scis).not.toBe("satisfied");
  });
});

describe("'Only 6 courses can be from AP or IB credit' of the 8 Distributive Studies courses", () => {
  const areas = ["dshs", "dshu", "dssp", "natsci"];
  const lab = ["LABL100", "LABX101", "NSAA100"]; // a regular Natural Sciences set: lab course + DSNS
  const six = (kind: "AP" | "IB" = "AP") => [
    exam(kind, "AHS101", 3, ["DSHS"]), exam(kind, "AHS102", 3, ["DSHS"]),
    exam(kind, "AHU101", 3, ["DSHU"]), exam(kind, "AHU102", 3, ["DSHU"]),
    exam(kind, "ASP101", 3, ["DSSP"]), exam(kind, "ASP102", 3, ["DSSP"]),
  ];
  it("6 AP courses plus 2 regular courses pass every area", async () => {
    const s = await audit(student(lab, six()));
    expect(areas.filter((a) => s[a] !== "satisfied")).toEqual([]);
    expect(s.dsnl).toBe("satisfied");
  });
  it("3 AP and 3 IB courses plus 2 regular courses pass (the limit covers both)", async () => {
    const s = await audit(student(lab, [...six("AP").slice(0, 3), ...six("IB").slice(3)]));
    expect(areas.filter((a) => s[a] !== "satisfied")).toEqual([]);
  });
  it("7 exam courses (a seventh AP Natural Sciences) plus a regular lab pair leave an area unmet", async () => {
    const s = await audit(student(["LABL100", "LABX101"], [...six(), exam("AP", "ANS101", 3, ["DSNS"])]));
    expect(areas.some((a) => s[a] !== "satisfied")).toBe(true);
  });
  it("7 exam courses (3 AP + 4 IB) leave an area unmet", async () => {
    const prior = [...six("AP").slice(0, 3), ...six("IB").slice(3), exam("IB", "ANS101", 3, ["DSNS"])];
    const s = await audit(student(["LABL100", "LABX101"], prior));
    expect(areas.some((a) => s[a] !== "satisfied")).toBe(true);
  });
  it("7 AP Distributive Studies courses and nothing else leave an area unmet", async () => {
    const s = await audit(student([], [...six(), exam("AP", "ANS101", 3, ["DSNS"])]));
    expect(areas.some((a) => s[a] !== "satisfied")).toBe(true);
  });
  it("8 AP courses fail too", async () => {
    const prior = [...six(), exam("AP", "ANL101", 4, ["DSNL", "DSNS"]), exam("AP", "ANS101", 3, ["DSNS"])];
    const s = await audit(student([], prior));
    expect(areas.some((a) => s[a] !== "satisfied")).toBe(true);
  });
});

describe("Diversity: '2 Understanding Plural Societies courses or 1 UP course AND 1 Cultural Competence course'", () => {
  it("2 DVUP passes", async () => {
    expect((await audit(student(["DVUP100", "DVUP200"]))).diversity).toBe("satisfied");
  });
  it("DVUP + DVCC passes", async () => {
    expect((await audit(student(["DVUP100", "DVCC100"]))).diversity).toBe("satisfied");
  });
  it("2 DVCC fails", async () => {
    expect((await audit(student(["DVCC100", "DVCC200"]))).diversity).not.toBe("satisfied");
  });
  it("1 DVUP fails", async () => {
    expect((await audit(student(["DVUP100"]))).diversity).not.toBe("satisfied");
  });
  it("one course tagged DVUP and DVCC counts once", async () => {
    expect((await audit(student(["DVBO100"]))).diversity).not.toBe("satisfied");
    expect((await audit(student(["DVBO100", "DVCC100"]))).diversity).toBe("satisfied");
  });
  it("a DVUP course also fills a Distributive Studies area", async () => {
    const s = await audit(student(["DUHS100", "DUHS200"]));
    expect(s.diversity).toBe("satisfied");
    expect(s.dshs).toBe("satisfied");
  });
});

describe("exam credit with a choice: AP US History 4 is 'HIST 200 (DSHS or DSHU) or HIST 201 (DSHS or DSHU and DVUP)'", () => {
  const exams: [string, number][] = [["United States History", 4]];
  const source = "AP United States History (4)";
  it("unpicked, it fills DSHS but not DVUP", async () => {
    const prior = apCredit(exams);
    expect((await audit(student([dsId("DSHS", 3)], prior))).dshs).toBe("satisfied");
    expect((await audit(student(["DVUP100"], prior))).diversity).not.toBe("satisfied");
  });
  it("unpicked, it fills DSHU as well", async () => {
    expect((await audit(student([dsId("DSHU", 3)], apCredit(exams)))).dshu).toBe("satisfied");
  });
  it("picking HIST201 gives DVUP", async () => {
    const prior = apCredit(exams, { [source]: "HIST201" });
    expect(prior[0]?.id).toBe("HIST201");
    expect((await audit(student(["DVUP100"], prior))).diversity).toBe("satisfied");
  });
  it("picking HIST200 does not give DVUP", async () => {
    const prior = apCredit(exams, { [source]: "HIST200" });
    expect((await audit(student(["DVUP100"], prior))).diversity).not.toBe("satisfied");
  });
});

describe("F and W grades earn nothing; planned courses", () => {
  it("an F in Academic Writing doesn't count", async () => {
    expect((await audit(plan([[done("WRIT100", "F")]]))).fsaw).not.toBe("satisfied");
  });
  it("a W in a Distributive Studies course doesn't count (1 of 2 courses)", async () => {
    const s = await audit(plan([[done(dsId("DSHS", 3)), done(dsId("DSHS", 3, 2), "W")]]));
    expect(s.dshs).not.toBe("satisfied");
  });
  it("an F leaves the row unmet even next to a passing course (1 of 2)", async () => {
    const s = await audit(plan([[done(dsId("DSHS", 3), "F"), done(dsId("DSHS", 3, 2))]]));
    expect(s.dshs).not.toBe("satisfied");
  });
  it("a planned course is reported by the audit as satisfied (the audit has no 'in progress' status)", async () => {
    // RequirementResult.status is satisfied | partial | missing; planned courses count toward it
    // like completed ones (the plan view tells them apart by the course's own status).
    expect((await audit(plan([[planned("WRIT100")]]))).fsaw).toBe("satisfied");
  });
  it("planCourses keeps a planned course as planned and a completed one as completed", () => {
    const courses = planCourses(plan([[planned("WRIT100"), done("PROF100")]]), catalog);
    expect(courses.find((x) => x.id === "WRIT100")?.status).toBe("planned");
    expect(courses.find((x) => x.id === "PROF100")?.status).toBe("completed");
  });
});

describe("a complete student and 12 variants each missing exactly one piece", () => {
  // Rows: fsaw fspw fsoc fsma fsar dshs dshu natsci dsnl dssp scis diversity.
  const rows = ["fsaw", "fspw", "fsoc", "fsma", "fsar", "dshs", "dshu", "natsci", "dsnl", "dssp", "scis", "diversity"];
  const base = {
    term1: [
      "WRIT100", "PROF100", "ORAL100", "MATH101", "ANAL100",
      "BQHS100", dsId("DSHS", 3), // Distributive Studies: HS (one Big Question)
      "BQHU100", dsId("DSHU", 3), // HU (one Big Question)
      dsId("DSSP", 3), dsId("DSSP", 3, 2),
      "LABL100", "LABX101", "NSCC100", // Natural Sciences: lab pair (4) + a 4-credit DSNS
      "DVUP100", "DVCC100", // Diversity
    ],
    term2: [] as string[],
  };
  type Shape = typeof base;
  const without = (s: Shape, ...ids: string[]): Shape => ({ term1: s.term1.filter((x) => !ids.includes(x)), term2: s.term2 });
  const toPlan = (s: Shape) => plan([s.term1.map((id) => done(id)), s.term2.map((id) => done(id))]);

  const variants: [string, (s: Shape) => Shape][] = [
    ["fsaw", (s) => without(s, "WRIT100")],
    ["fspw", (s) => without(s, "PROF100")],
    ["fsoc", (s) => without(s, "ORAL100")],
    ["fsma", (s) => without(s, "MATH101")],
    ["fsar", (s) => without(s, "ANAL100")],
    ["dshs", (s) => without(s, dsId("DSHS", 3))],
    ["dshu", (s) => without(s, dsId("DSHU", 3))],
    ["natsci", (s) => without(s, "NSCC100")],
    // The lab moves to the next term: the lecture stays DSNS, 3 + 4 = 7 credits still fills Natural Sciences.
    ["dsnl", (s) => ({ term1: s.term1.filter((x) => x !== "LABX101"), term2: ["LABX101"] })],
    ["dssp", (s) => without(s, dsId("DSSP", 3, 2))],
    // Swap one Big Question course for a plain course in the same area: only Big Question changes.
    ["scis", (s) => ({ term1: [...without(s, "BQHU100").term1, dsId("DSHU", 3, 2)], term2: s.term2 })],
    ["diversity", (s) => without(s, "DVCC100")],
  ];

  it("the complete student satisfies all 12 rows", async () => {
    const s = await audit(toPlan(base));
    expect(Object.keys(s).sort()).toEqual([...rows].sort());
    expect(unmet(s)).toEqual([]);
  });
  it.each(variants)("missing only %s changes only %s", async (row, change) => {
    const s = await audit(toPlan(change(base)));
    expect(unmet(s)).toEqual([row]);
  });
  it("removing a Big Question course also drops Big Question (a dependent row), and its own area", async () => {
    const s = await audit(toPlan(without(base, "BQHS100")));
    expect(unmet(s).sort()).toEqual(["dshs", "scis"]);
  });
});
