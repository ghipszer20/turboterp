import { readFileSync } from "node:fs";
import type { Course } from "@turboterp/course-data";
import { buildCatalog } from "@turboterp/plan/catalog";
import { checkPlan } from "@turboterp/plan/check";
import { describe, expect, it } from "vitest";
import { runAnalysis } from "../advisor/analysis";
import { checkerPlan } from "../advisor/checker";
import { computePriorCredit } from "../advisor/prior-credit";
import { seedFromUrl } from "../advisor/seed";

const COURSES = (
  JSON.parse(readFileSync(new URL("../../../../packages/plan/test/fixtures/courses-202701.json", import.meta.url), "utf8")) as {
    courses: Course[];
  }
).courses;
const catalog = buildCatalog(COURSES);
const plan = seedFromUrl("?seed=owner", { NODE_ENV: "development" })!.plan!;
const prior = computePriorCredit(plan.prior, (id) => catalog.get(id)?.genEd ?? []);

describe("checkerPlan", () => {
  it("gives the plan checker the terms and the counted prior credit", () => {
    const p = checkerPlan(plan, prior.courses);
    expect(p.terms.map((t) => t.name)).toEqual(plan.terms.map((t) => t.name));
    expect(p.terms[0]!.courses[0]).toEqual({ id: "CMSC131" });
    expect(p.priorCredit!.map((c) => c.id)).toEqual(["MATH140", "MATH141"]);
  });

  it("makes the owner's plan check clean of errors", () => {
    const issues = checkPlan(checkerPlan(plan, prior.courses), catalog);
    expect(issues.filter((i) => i.severity === "error")).toEqual([]);
  });
});

describe("runAnalysis", () => {
  it("checks the owner plan as a double major by default, and as a double degree when chosen", async () => {
    const a = await runAnalysis({ plan, catalog, priorCourses: prior.courses });
    expect(a.degrees?.mode).toBe("double-major");
    expect(a.degrees?.issues.filter((i) => i.kind !== "declaration-deadline")).toEqual([]);
    const b = await runAnalysis({ plan: { ...plan, degreeMode: "double-degree" }, catalog, priorCourses: prior.courses });
    expect(b.degrees?.mode).toBe("double-degree");
    expect(b.degrees?.issues.map((i) => i.kind)).toContain("double-degree-credits");
  });

  it("doesn't contradict a chosen double degree with a double-major or dual-degree notice about the chosen pair", async () => {
    // The owner plan is under 150 credits (double-degree-credits above), so neither notice should
    // appear for the chosen pair -- Checks (a.degrees.issues) already owns that shortfall.
    const b = await runAnalysis({ plan: { ...plan, degreeMode: "double-degree" }, catalog, priorCourses: prior.courses });
    const aboutChosenPair = b.notices.filter(
      (n) => (n.kind === "double-major" || n.kind === "dual-degree") && n.programs.every((id) => ["math-major-applied", "cmsc-major"].includes(id)),
    );
    expect(aboutChosenPair).toEqual([]);
  });

  it("agrees with Checks: the Audit tab uses checkDegrees' own solve, not a second one, for a double degree", async () => {
    const a = await runAnalysis({ plan: { ...plan, degreeMode: "double-degree" }, catalog, priorCourses: prior.courses });
    expect(a.audits.map((x) => x.program.id)).toEqual(["math-major-applied", "cmsc-major", "gen-ed", "university", "college-intro-cmns"]);
    for (const programAudit of a.audits) {
      const degreeAudit = a.degrees!.audits.find((x) => x.program.id === programAudit.program.id)!;
      programAudit.requirements.forEach((req, r) => {
        expect(req.result).toBe(degreeAudit.result.requirements[r]);
      });
    }
  });

  it("also uses checkDegrees' own solve for the Audit tab under the default double-major mode", async () => {
    const a = await runAnalysis({ plan, catalog, priorCourses: prior.courses });
    expect(a.audits.map((x) => x.program.id)).toEqual(["math-major-applied", "cmsc-major", "gen-ed", "university", "college-intro-cmns"]);
    for (const programAudit of a.audits) {
      const degreeAudit = a.degrees!.audits.find((x) => x.program.id === programAudit.program.id)!;
      programAudit.requirements.forEach((req, r) => {
        expect(req.result).toBe(degreeAudit.result.requirements[r]);
      });
    }
  });

  it("has no degree check with one major", async () => {
    const a = await runAnalysis({ plan: { ...plan, programs: ["cmsc-major"] }, catalog, priorCourses: prior.courses });
    expect(a.degrees).toBeNull();
  });

  it("finds the double major, audits every layer and checks the CS gateway", async () => {
    const a = await runAnalysis({ plan, catalog, priorCourses: prior.courses });
    expect(a.notices.map((n) => n.message)).toContain(
      "Your plan completes both the Mathematics Major (Applied Mathematics Track) and the Computer Science Major: a double major.",
    );
    expect(a.audits.map((x) => x.program.id)).toEqual(["math-major-applied", "cmsc-major", "gen-ed", "university", "college-intro-cmns"]);
    const cs = a.audits.find((x) => x.program.id === "cmsc-major")!;
    expect(cs.requirements.every((r) => r.result.status === "satisfied")).toBe(true);
    expect(a.gateway?.rule.name).toBe("fall-2024-or-later");
    expect(a.gateway?.courses.map((c) => c.id)).toEqual(["MATH140", "CMSC131", "CMSC132"]);
  });

  it("describes what's missing when a course leaves the plan", async () => {
    const without = { ...plan, terms: plan.terms.map((t) => ({ ...t, courses: t.courses.filter((c) => c.id !== "CMSC351") })) };
    const a = await runAnalysis({ plan: without, catalog, priorCourses: prior.courses });
    const req = a.audits.find((x) => x.program.id === "cmsc-major")!.requirements.find((r) => r.requirement.id === "cmsc351")!;
    expect(req.result.status).toBe("missing");
    expect(req.gap).toEqual({ need: "Take CMSC351.", suggestions: ["CMSC351"] });
  });

  it("skips the gateway when CS isn't chosen", async () => {
    const a = await runAnalysis({ plan: { ...plan, programs: ["math-major-applied"] }, catalog, priorCourses: prior.courses });
    expect(a.gateway).toBeNull();
  });

  it("gives a program with a minimum GPA its program-gpa row, counted in the total", async () => {
    const a = await runAnalysis({ plan: { ...plan, programs: ["aaas-major-general"] }, catalog, priorCourses: prior.courses });
    const aaas = a.audits.find((x) => x.program.id === "aaas-major-general")!;
    expect(aaas.gpa?.id).toBe("program-gpa");
    expect(aaas.total).toBe(aaas.program.requirements.length + 1);
    const math = await runAnalysis({ plan: { ...plan, programs: ["phys-major"] }, catalog, priorCourses: prior.courses });
    const m = math.audits.find((x) => x.program.id === "phys-major")!;
    expect(m.gpa).toBeNull();
    expect(m.total).toBe(m.program.requirements.length);
  });
});

describe("runAnalysis: tracks", () => {
  it("audits a chosen track's requirements, like a program, without touching majors, notices or the gateway", async () => {
    const withTracks = { ...plan, tracks: ["pre-med"] };
    const [a, b] = await Promise.all([
      runAnalysis({ plan: withTracks, catalog, priorCourses: prior.courses }),
      runAnalysis({ plan, catalog, priorCourses: prior.courses }),
    ]);
    expect(a.audits).toEqual(b.audits);
    expect(a.notices).toEqual(b.notices);
    expect(a.gateway).toEqual(b.gateway);

    const preMed = a.tracks.find((t) => t.track.id === "pre-med")!;
    expect(preMed.requirements.length).toBeGreaterThan(0);
    expect(preMed.requirements.some((r) => r.result.status === "missing")).toBe(true);
    expect(preMed.milestones.length).toBeGreaterThan(0);
    expect(preMed.milestones.some((m) => m.milestone.id === "mcat")).toBe(true);
  });

  it("audits nothing extra when no track is chosen", async () => {
    const a = await runAnalysis({ plan, catalog, priorCourses: prior.courses });
    expect(a.tracks).toEqual([]);
  });

  it("resolves each course's credits from the catalog, so GPA protection (pre-law) actually fires", async () => {
    const withGpaProtection = {
      ...plan,
      programs: [],
      tracks: ["pre-law"],
      terms: [
        { name: "Fall 2026", courses: [{ id: "HIST200", status: "completed" as const, grade: "A" }] },
        { name: "Spring 2027", courses: [{ id: "CHEM131", status: "planned" as const }] },
      ],
      expectedGrades: { "Spring 2027": { CHEM131: "C-" } },
    };
    const a = await runAnalysis({ plan: withGpaProtection, catalog, priorCourses: [] });
    const preLaw = a.tracks.find((t) => t.track.id === "pre-law")!;
    const issue = preLaw.result.issues.find((i) => i.kind === "gpa-protection");
    expect(issue?.message).toContain("Spring 2027");
  });

  it("reports the science (BCPM) GPA when a graded science course exists", async () => {
    const withGrades = {
      ...plan,
      tracks: ["pre-med"],
      terms: [{ name: "Fall 2026", courses: [{ id: "CHEM131", status: "completed" as const, grade: "A" }] }],
    };
    const a = await runAnalysis({ plan: withGrades, catalog, priorCourses: [] });
    expect(a.scienceGpa.gpa).not.toBeNull();
    expect(a.scienceGpa.byCategory.chemistry.gpa).toBe(4.0);
  });

  describe("college intro course layer", () => {
    const collegeAudit = (a: Awaited<ReturnType<typeof runAnalysis>>) => a.audits.find((x) => x.program.layer === "college");
    const noIntro = { ...plan, terms: plan.terms.map((t) => ({ ...t, courses: t.courses.filter((c) => c.id !== "CMNS100") })) };

    it("adds an unmet CMNS layer when the plan has no CMNS100 or UNIV100, and a met one with it", async () => {
      const a = await runAnalysis({ plan: noIntro, catalog, priorCourses: prior.courses });
      expect(collegeAudit(a)?.requirements[0]?.result.status).not.toBe("satisfied");
      const b = await runAnalysis({ plan, catalog, priorCourses: prior.courses });
      expect(collegeAudit(b)?.requirements[0]?.result.status).toBe("satisfied");
    });

    it("skips the layer for a transfer student", async () => {
      const a = await runAnalysis({ plan: { ...noIntro, entry: "transfer" }, catalog, priorCourses: prior.courses });
      expect(collegeAudit(a)).toBeUndefined();
    });

    it("also applies to a double degree", async () => {
      const a = await runAnalysis({ plan: { ...noIntro, degreeMode: "double-degree" }, catalog, priorCourses: prior.courses });
      expect(collegeAudit(a)?.requirements[0]?.result.status).not.toBe("satisfied");
    });
  });
});

// Gen Ed display (program-sources/gen-ed.md): what the Audit tab lists as "Counted" per requirement.
describe("Gen Ed counting in the Audit tab", () => {
  const genEdOf = async (p: typeof plan, c: typeof catalog) => {
    const a = await runAnalysis({ plan: p, catalog: c, priorCourses: computePriorCredit(p.prior, (id) => c.get(id)?.genEd ?? []).courses });
    const audit = a.audits.find((x) => x.program.id === "gen-ed")!;
    return (id: string) => audit.requirements.find((r) => r.requirement.id === id)!.result.assigned;
  };

  it("counts AP MATH140 (FSMA and FSAR) for both Fundamental Studies requirements", async () => {
    const counted = await genEdOf(plan, catalog);
    expect([counted("fsma"), counted("fsar")]).toEqual([["MATH140"], ["MATH140"]]);
  });

  it("shows PHYS235 (DSHS, DSNS, SCIS) under one Distributive Studies category and under Big Question", async () => {
    // PHYS235 isn't in the Spring 2027 fixture; Testudo (Fall 2026) tags it DSHS, DSNS, SCIS.
    const withPhys = new Map(catalog).set("PHYS235", {
      id: "PHYS235",
      title: "Physics for a Changing World",
      credits: { min: 3, max: 3 },
      genEd: ["DSHS", "DSNS", "SCIS"],
      prerequisite: null,
      corequisite: null,
      repeat: { kind: "unknown" },
    });
    const p = { ...plan, terms: plan.terms.map((t, i) => (i === 0 ? { ...t, courses: [...t.courses, { id: "PHYS235" }] } : t)) };
    const counted = await genEdOf(p, withPhys);
    const ds = ["dshs", "natsci"].filter((id) => counted(id).includes("PHYS235"));
    expect(ds).toHaveLength(1);
    expect(counted("scis")).toContain("PHYS235");
  });
});
