// Substitutions UMD pages post next to a required or listed course count wherever that page posts
// them (owner, 2026-10-07: "if there are any alternatives for any course at umd posted online, the
// advisor should account for that"). Inventory: docs/project/posted-substitutions.md.

import { describe, expect, it } from "vitest";
import { auditProgram, type Program, type StudentCourse } from "../src/audit.ts";
import { bioeMajorBiomechanics, bioeMajorBiotech, bioeMajorInstrumentation, bioeMajorPreHealth } from "../programs/bioe-major-tracks-2026-27.ts";
import { eeMajor } from "../programs/ee-major-2026-27.ts";
import { finMajor } from "../programs/fin-major-2026-27.ts";
import { infsMajor } from "../programs/infs-major-2026-27.ts";
import { intbMajor } from "../programs/intb-major-2026-27.ts";
import { meMajor } from "../programs/me-major-2026-27.ts";
import { ombaMajor } from "../programs/omba-major-2026-27.ts";

const took = (...ids: string[]): StudentCourse[] => ids.map((id) => ({ id, credits: 3, status: "completed", grade: "B" }));

async function assigned(program: Program, requirementId: string, courses: StudentCourse[]) {
  const r = await auditProgram(program, courses);
  return r.requirements.find((x) => x.id === requirementId)?.assigned ?? [];
}

const requirement = (program: Program, id: string) => program.requirements.find((r) => r.id === id);

describe("posted substitutions", () => {
  it("ME: ENME414 may be substituted in place of ENME272", async () => {
    expect(await assigned(meMajor, "enme272", took("ENME414"))).toEqual(["ENME414"]);
  });

  it("ME: ENME202 is required unless acceptable programming credit has been earned (advisor decides)", () => {
    expect(requirement(meMajor, "enme202")?.advisorMayApprove).toBe(true);
  });

  it("Bioengineering tracks: HLSC322 can stand in place of BSCI222 as a breadth or lower-level biosci elective", async () => {
    for (const track of [bioeMajorBiotech, bioeMajorBiomechanics, bioeMajorInstrumentation, bioeMajorPreHealth]) {
      for (const r of track.requirements) {
        if (r.kind === "choose" && r.from.courses?.includes("BSCI222")) expect(r.from.courses, `${track.id}/${r.id}`).toContain("HLSC322");
      }
    }
    expect(await assigned(bioeMajorPreHealth, "bio-science-elective-1", took("HLSC322"))).toEqual(["HLSC322"]);
    expect(await assigned(bioeMajorPreHealth, "bio-science-elective-1", took("BSCI222", "HLSC322"))).toHaveLength(1);
  });

  it("EE: a second Capstone Design course may substitute for the Advanced Theory and Applications course", async () => {
    // MATH410 fills the General Technical Elective, which would otherwise take a capstone just as well.
    const r = await auditProgram(eeMajor, took("ENEE408A", "ENEE408C", "MATH410"));
    const status = (id: string) => r.requirements.find((x) => x.id === id)?.status;
    expect([status("tech-elective-a"), status("tech-elective-c")]).toEqual(["satisfied", "satisfied"]);
  });

  it("Information Systems: INST377 can substitute for BMGT406 (List A)", async () => {
    expect(await assigned(infsMajor, "infs-list-a-minimum", took("INST377"))).toEqual(["INST377"]);
  });

  it("Information Systems: a course and its posted substitute count once between them", async () => {
    expect(await assigned(infsMajor, "infs-list-a-or-b", took("BMGT406", "INST377", "BMGT485", "INST453"))).toHaveLength(2);
    const r = await auditProgram(infsMajor, took("BMGT406", "INST377"));
    expect(r.requirements.find((x) => x.id === "infs-list-a-or-b")?.status).not.toBe("satisfied");
  });

  it("International Business: INST453 can substitute for BMGT485", async () => {
    expect(await assigned(intbMajor, "intb-electives", took("INST453"))).toEqual(["INST453"]);
  });

  it("International Business: BMGT485 and INST453 count once between them", async () => {
    expect(await assigned(intbMajor, "intb-electives", took("BMGT485", "INST453"))).toHaveLength(1);
  });

  it("Operations Management & Business Analytics: CMSC320 for BMGT404 and INST453 for BMGT485", async () => {
    expect(await assigned(ombaMajor, "omba-electives", took("CMSC320", "INST453"))).toEqual(["CMSC320", "INST453"]);
  });

  it("Finance: BMGT394H (formerly BMGT438A) is an approved substitute", async () => {
    expect(await assigned(finMajor, "fin-select-one", took("BMGT394H"))).toEqual(["BMGT394H"]);
  });
});

// Pages that post a substitution "with approval" without listing the substitute: the requirement
// carries advisorMayApprove, so the Advisor says another course may count with approval.
describe("posted advisor-approved substitutions", () => {
  const FLAGGED: [string, string[]][] = [
    ["arec-major-ag-resource-econ", ["ag-resource-econ-select-five"]],
    ["arab-major", ["foundation-electives", "remaining-electives"]],
    ["cmsc-minor", ["electives"]],
    ["engl-major-creative-writing", ["track-creative-writing"]],
    ["gtst-minor", ["electives"]],
    ["isrl-minor", ["history", "middle-east"]],
    ["lacs-minor", ["experiential"]],
    ["math-major", ["eight"]],
    ["math-major-applied", ["eight"]],
    ["pers-major", ["foundation-requirements", "electives"]],
    ["pers-minor", ["pers103", "pers104", "pers201", "pers202", "electives"]],
    ["neur-major", ["track"]],
    ["hdev-major", ["hdev-electives"]],
    ["educ-world-language-major", ["educ-wl-primary-area"]],
    ["rame-major", ["language-track"]],
    ["hcai-shared", ["hcai490"]],
    ["enst-major-applied-ecology-natural-resources", ["technical-electives"]],
    ["enst-major-ecological-technology-design", ["technical-electives"]],
    ["enst-major-ecosystem-health", ["concentration-depth", "technical-electives"]],
    ["enst-major-soil-watershed-science", ["technical-electives"]],
    ["geol-major-earth-environmental", ["earth-sciences-elective"]],
    ["geol-major-professional", ["geol-elective"]],
    ["phys-major", ["advanced-elective"]],
    ["phys-major-applied", ["advanced-elective"]],
    ["phys-major-biophysics", ["advanced-elective"]],
    ["phys-major-education", ["advanced-elective"]],
    ["span-minors", ["span206", "span207", "span301"]],
    ["span-shared", ["span207-or-206", "span301-or-306"]],
    ["artt-major-advanced-specialization", ["artt481"]],
    ["me-major", ["enme202"]],
  ];

  // Every exported Program (or Requirement / Requirement[]) in the file, so shared modules count too.
  async function requirementsIn(file: string) {
    const mod: Record<string, unknown> = await import(`../programs/${file}-2026-27.ts`);
    const out: { id: string; advisorMayApprove?: true }[] = [];
    const add = (x: unknown): void => {
      if (Array.isArray(x)) return x.forEach(add);
      if (x && typeof x === "object") {
        const o = x as { id?: unknown; kind?: unknown; requirements?: unknown };
        if (Array.isArray(o.requirements)) return add(o.requirements);
        if (typeof o.id === "string" && typeof o.kind === "string") out.push(o as { id: string });
      }
    };
    Object.values(mod).forEach(add);
    return out;
  }

  it.each(FLAGGED)("%s: %j carry advisorMayApprove", async (file, ids) => {
    const reqs = await requirementsIn(file);
    for (const id of ids) {
      const found = reqs.filter((r) => r.id === id);
      expect(found.length, `${file}/${id}`).toBeGreaterThan(0);
      for (const r of found) expect(r.advisorMayApprove, `${file}/${id}`).toBe(true);
    }
  });
});
