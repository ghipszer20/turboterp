// Golden tests for the CS major (2026–27 catalog): a complete, realistic
// plan must pass, and each deliberate break must show the matching gap.
// The plan is hand-built from the catalog's rules; the owner verifies it.

import { describe, expect, it } from "vitest";
import { auditProgram, type StudentCourse } from "../src/audit.ts";
import { cmscMajor } from "../programs/cmsc-major-2026-27.ts";

const c = (id: string, credits = 3): StudentCourse => ({ id, credits, status: "completed", grade: "B" });

const completePlan: StudentCourse[] = [
  // Lower level
  c("MATH140", 4), c("MATH141", 4), c("CMSC131", 4), c("CMSC132", 4), c("CMSC216", 4), c("CMSC250", 4),
  // Additional required
  c("CMSC330"), c("CMSC351"), c("STAT400"), c("MATH240", 4),
  // Five 400-level CMSC from three areas (Systems ×2, Info Processing ×2, Theory ×1)
  c("CMSC412"), c("CMSC414"), c("CMSC421"), c("CMSC422"), c("CMSC451"),
  // Two upper-level CMSC electives (6 credits)
  c("CMSC320"), c("CMSC433"),
  // Concentration: 12 credits of 300–400 level in one department outside CMSC
  c("MATH310"), c("MATH401"), c("MATH403"), c("MATH410"),
];

const statusOf = async (courses: StudentCourse[]) =>
  Object.fromEntries((await auditProgram(cmscMajor, courses)).requirements.map((r) => [r.id, r.status]));
const without = (...ids: string[]) => completePlan.filter((x) => !ids.includes(x.id));

describe("CS major 2026–27", () => {
  it("passes a complete plan", async () => {
    const statuses = await statusOf(completePlan);
    for (const [id, status] of Object.entries(statuses)) expect(`${id}: ${status}`).toBe(`${id}: satisfied`);
  });

  it("is unverified until the owner signs off", () => {
    expect(cmscMajor.verified).toBe(false);
    expect(cmscMajor.reviewNotes!.length).toBeGreaterThan(0);
  });

  it("flags a missing required course", async () => {
    expect((await statusOf(without("CMSC351"))).cmsc351).toBe("missing");
  });

  it("flags a D in a major course (C- minimum)", async () => {
    const plan = completePlan.map((x) => (x.id === "CMSC330" ? { ...x, grade: "D+" } : x));
    expect((await statusOf(plan)).cmsc330).toBe("missing");
  });

  it("flags upper-level courses from only two areas", async () => {
    // Systems ×3 (412, 414, 416), Information Processing ×2 (421, 422); CMSC388 keeps electives full.
    const plan = [...without("CMSC451", "CMSC433"), c("CMSC416"), c("CMSC388")];
    const statuses = await statusOf(plan);
    expect(statuses.areas).toBe("partial");
    expect(statuses.electives).toBe("satisfied");
  });

  it("accepts CMSC141 and CMSC142 for CMSC131 and CMSC132 (owner-confirmed)", async () => {
    const plan = [...without("CMSC131", "CMSC132"), c("CMSC141", 4), c("CMSC142", 4)];
    const statuses = await statusOf(plan);
    expect(statuses.cmsc131).toBe("satisfied");
    expect(statuses.cmsc132).toBe("satisfied");
  });

  it("flags a concentration split across two departments", async () => {
    // Not MATH+STAT: the department's Upper Level Concentration page lets students "mix and
    // match their courses between MATH and STAT" for the ULC (see the review notes), so that
    // split is department-page-sanctioned, not an error the engine should flag here.
    const plan = [...without("MATH403", "MATH410"), c("ECON300"), c("ECON305")];
    expect((await statusOf(plan)).concentration).toBe("partial");
  });

  // Upper Level Concentration "Things to Note" (program-sources/cmsc-major.md, line ~173 on):
  // "Students using Math or Statistics courses for the ULC are able to mix and match their
  // courses between MATH and STAT" -- a discipline group, not two disciplines.
  it("accepts a MATH+STAT mix for the upper-level concentration", async () => {
    const plan = [...without("MATH403", "MATH410"), c("STAT410"), c("STAT420")];
    expect((await statusOf(plan)).concentration).toBe("satisfied");
  });

  // Same page: no such exception for MATH+ENGL -- a real department split still isn't allowed.
  it("does not accept a MATH+ENGL mix for the upper-level concentration", async () => {
    const plan = [...without("MATH403", "MATH410"), c("ENGL300"), c("ENGL305")];
    expect((await statusOf(plan)).concentration).toBe("partial");
  });

  it("flags a plan 6 upper-level CMSC credits short", async () => {
    // Five 400-level courses can't cover both the area rule and the electives, so
    // exactly one of the two must show as unfinished; either is a correct report.
    const statuses = await statusOf(without("CMSC320", "CMSC433"));
    const unfinished = [statuses.areas, statuses.electives].filter((s) => s !== "satisfied");
    expect(unfinished).toHaveLength(1);
  });

  // Department page (undergrad.cs.umd.edu/degree-requirements-cs-major, Math Requirements /
  // Computer Science Requirements tables): "CMSC131 (4) Object-Oriented Programming I* or
  // CMSC133 (2) Object-Oriented Programming I Beyond Fundamentals" -- the academic catalog's
  // required-courses table lists only CMSC131. Department page wins (docs/project/rulings.md).
  it("accepts CMSC133 for CMSC131 (department page: 'CMSC131 or CMSC133')", async () => {
    const plan = [...without("CMSC131"), c("CMSC133", 2)];
    expect((await statusOf(plan)).cmsc131).toBe("satisfied");
  });

  // Department page (general-track-degree-requirements, Area 3) and the Cybersecurity
  // specialization page both list "CMSC431 (3) Privacy Engineering (formerly CMSC498G)" under
  // Area 3; the academic catalog's Area 3 table (and its Cybersecurity table) omit it.
  // Department page wins. Isolate CMSC431 as the only Area 3 candidate: drop CMSC451 (Theory)
  // and swap the CMSC433 (Area 3) elective for a non-area elective, so only CMSC431 can fill
  // Area 3 -- this must fail before the fix (only 2 areas: Systems, Info Processing).
  it("counts CMSC431 (Privacy Engineering) toward Area 3 (department page addition, missing from the catalog)", async () => {
    const plan = [...without("CMSC451", "CMSC433"), c("CMSC431"), c("CMSC335")];
    const statuses = await statusOf(plan);
    expect(statuses.areas).toBe("satisfied");
  });

  // Footnote 2 (catalog) / Math Requirements table (department page) for the STAT4xx and
  // MATH/AMSC/STAT elective slots: "cannot be cross-listed with CMSC". AMSC460 is cross-listed
  // as CMSC460 (confirmed: the department's Upper Level Concentration page's own worked example
  // is "courses cross-listed with CMSC courses (e.g., AMSC460)"). Neither source disagrees here --
  // this is an engine gap the catalog and department page both call for.
  it("does not accept a CMSC-cross-listed course (AMSC460) for the MATH/AMSC/STAT elective", async () => {
    const plan = [...without("MATH240"), c("AMSC460")];
    const result = await auditProgram(cmscMajor, plan);
    const mathxxx = result.requirements.find((r) => r.id === "mathxxx")!;
    expect(mathxxx.assigned).not.toContain("AMSC460");
  });

  // Owner ruling (CS department-page answers, 2026-09-27): STAT426 is NOT cross-listed with
  // CMSC, so it can fill the STAT4xx slot. It stays ineligible for the Upper Level Concentration
  // (see the concentration test below) -- the department's ULC page lists it as "credit only
  // granted for" a CMSC course, a different requirement than this one.
  it("accepts STAT426 for the STAT4xx requirement", async () => {
    const plan = [...without("STAT400"), c("STAT426")];
    const statuses = await statusOf(plan);
    expect(statuses.stat4xx).toBe("satisfied");
    const result = await auditProgram(cmscMajor, plan);
    const stat4xx = result.requirements.find((r) => r.id === "stat4xx")!;
    expect(stat4xx.assigned).toContain("STAT426");
  });

  // Owner ruling (CS department-page answers, 2026-09-27): STAT426 stays ineligible for the
  // Upper Level Concentration (department ULC page: "credit only granted for" a CMSC course).
  // A STAT-only concentration plan isolates STAT426 as the only possible concentration course,
  // so the solver can't just move a different STAT course in to cover for it.
  it("does not count STAT426 toward the upper-level concentration", async () => {
    // STAT400 (already in the plan, filling stat4xx) plus STAT410/STAT420 give at most 3
    // concentration-eligible STAT courses (9 credits) once STAT426 is excluded -- never enough
    // for the 12-credit concentration, however the solver assigns the four STAT courses.
    const plan = [...without("MATH310", "MATH401", "MATH403", "MATH410"), c("STAT426"), c("STAT410"), c("STAT420")];
    const result = await auditProgram(cmscMajor, plan);
    const concentration = result.requirements.find((r) => r.id === "concentration")!;
    expect(concentration.assigned).not.toContain("STAT426");
    expect(concentration.status).toBe("partial");
  });

  // Footnote 5: no course in or cross-listed with CMSC counts toward the concentration, so the
  // CMSC cross-lists barred from the MATH/AMSC/STAT elective are barred here too.
  it("does not count a CMSC cross-list (MATH456) toward the upper-level concentration", async () => {
    const plan = [...without("MATH410"), c("MATH456")];
    const result = await auditProgram(cmscMajor, plan);
    const concentration = result.requirements.find((r) => r.id === "concentration")!;
    expect(concentration.assigned).not.toContain("MATH456");
    expect(concentration.status).toBe("partial");
  });

  // Footnote 2 (catalog) / Math Requirements table (department page): MATH456 (= CMSC456) is a
  // confirmed CMSC cross-list (Testudo/Coursicle) and stays excluded from the MATH/AMSC/STAT
  // elective. Isolate MATH456 as the only possible mathxxx candidate: drop every other
  // MATH/AMSC/STAT course (including STAT400, which the mathxxx filter also matches) and move
  // the concentration to a non-MATH/STAT department, so the solver can't cover the elective, or
  // the concentration, from elsewhere.
  it("does not accept MATH456 (cross-listed as CMSC456) for the MATH/AMSC/STAT elective", async () => {
    const plan = [
      ...without("MATH240", "MATH310", "MATH401", "MATH403", "MATH410", "STAT400"),
      c("MATH456"),
      c("ECON310"),
      c("ECON401"),
      c("ECON403"),
      c("ECON410"),
    ];
    const statuses = await statusOf(plan);
    expect(statuses.mathxxx).not.toBe("satisfied");
  });

  // Department page (upper-level-concentration, "Not Eligible for ULC"): Data Science (DATA),
  // Honors (HONR/HNUH), Information Science (INST) and College Park Scholars (CPSP) may never
  // be the outside-CMSC concentration discipline. The academic catalog's footnote 5 only says
  // "no course in or cross-listed with CMSC"; it doesn't mention these. Department page wins.
  it("does not accept Data Science (DATA) courses for the upper-level concentration", async () => {
    const plan = [...without("MATH310", "MATH401", "MATH403", "MATH410"), c("DATA310"), c("DATA320"), c("DATA330"), c("DATA340")];
    const statuses = await statusOf(plan);
    expect(statuses.concentration).not.toBe("satisfied");
  });

  // Department page (upper-level-concentration): "Courses with a grade of D can be used for the
  // ULC as long as the cumulative GPA for the ULC is at least 1.7" -- looser than the catalog's
  // blanket "C- or better in all major requirements", and the department page wins. The
  // concentration has zero slack in completePlan (exactly 12 credits), so a D in one of its four
  // courses must not drop it below satisfied.
  it("accepts a D grade in the concentration (department page: D allowed if GPA stays >= 1.7)", async () => {
    const plan = completePlan.map((x) => (x.id === "MATH403" ? { ...x, grade: "D" } : x));
    expect((await statusOf(plan)).concentration).toBe("satisfied");
  });

  // ULC GPA (department page: "cumulative GPA of 1.7 or higher"), computed over the completed
  // letter-graded courses the audit assigns to the concentration.
  const ulc = (grades: Record<string, string>, extra: StudentCourse[] = []) => [
    ...completePlan.map((x) => (grades[x.id] ? { ...x, grade: grades[x.id] } : x)),
    ...extra,
  ];
  const concentrationOf = async (courses: StudentCourse[]) =>
    (await auditProgram(cmscMajor, courses)).requirements.find((r) => r.id === "concentration")!;

  it("passes a D in the ULC when the ULC GPA is at least 1.7", async () => {
    const r = await concentrationOf(ulc({ MATH403: "D" }));
    expect(r.status).toBe("satisfied");
    expect(r.gpa).toEqual({ value: 2.5, min: 1.7 });
  });

  it("fails a completed ULC whose GPA is below 1.7", async () => {
    const r = await concentrationOf(ulc({ MATH310: "D", MATH401: "D", MATH403: "D", MATH410: "D" }));
    expect(r.status).toBe("partial");
    expect(r.gpa).toEqual({ value: 1, min: 1.7 });
  });

  it("picks the best-graded ULC courses when more are eligible than needed", async () => {
    const plan = ulc({ MATH310: "D", MATH401: "D", MATH403: "D", MATH410: "D" }, [
      { id: "MATH411", credits: 3, status: "completed", grade: "A" },
      { id: "MATH404", credits: 3, status: "completed", grade: "A" },
    ]);
    const r = await concentrationOf(plan);
    expect(r.status).toBe("satisfied");
    expect(r.assigned).toEqual(expect.arrayContaining(["MATH411", "MATH404"]));
    expect(r.gpa!.value).toBe(2.5);
  });

  it("marks the ULC GPA at risk when it is below 1.7 but courses are planned for it", async () => {
    const plan = ulc({ MATH310: "D", MATH401: "D", MATH403: "D" }).filter((x) => x.id !== "MATH410");
    plan.push({ id: "MATH410", credits: 3, status: "planned" });
    const r = await concentrationOf(plan);
    expect(r.status).toBe("satisfied");
    expect(r.gpa).toEqual({ value: 1, min: 1.7, atRisk: true });
  });

  it("lists completed courses that miss a requirement's minimum grade", async () => {
    const plan = completePlan.map((x) => (x.id === "CMSC351" ? { ...x, grade: "D+" } : x));
    const r = (await auditProgram(cmscMajor, plan)).requirements.find((q) => q.id === "cmsc351")!;
    expect(r.status).toBe("missing");
    expect(r.belowMinimum).toEqual([{ course: "CMSC351", grade: "D+", minGrade: "C-" }]);
  });

  // Every other requirement keeps the catalog's blanket "C- or better" (only the concentration is
  // looser, per the department page above); a requirement missing this would silently let D
  // grades through everywhere, not just the concentration.
  it("requires C- on every requirement except the concentration", () => {
    for (const r of cmscMajor.requirements) {
      if (r.id === "concentration") {
        expect(r.minGrade).toBe("D-");
        expect(r.minGpa).toBe(1.7);
      }
      else expect(r.minGrade).toBe("C-");
    }
  });
});
