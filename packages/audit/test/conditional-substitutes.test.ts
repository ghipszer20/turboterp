// Requirement.substitutes: a course counts in place of another only when the student is also
// auditing a qualifying program (derived from the programs passed to auditStudent).

import { describe, expect, it } from "vitest";
import { auditStudent, type Program, type StudentCourse } from "../src/audit.ts";
import { hdevMajor } from "../programs/hdev-major-2026-27.ts";
import { edhdMinor } from "../programs/edhd-minor-2026-27.ts";
import { bmgtMinorBusinessAnalytics } from "../programs/bmgt-minors-2026-27.ts";

const done = (id: string): StudentCourse => ({ id, credits: 3, status: "completed", grade: "A" });
const stub = (id: string): Program => ({ id, name: id, requirements: [] });

/** Status of one requirement of the first program, audited alongside `others`. */
async function status(program: Program, reqId: string, ids: string[], others: string[] = []) {
  const { results } = await auditStudent([program, ...others.map(stub)], ids.map(done));
  return results[0]!.requirements.find((r) => r.id === reqId)!.status;
}

describe("engine", () => {
  const sub = { course: "BBBB100", onlyFor: ["maj"], reason: "r" };
  const tiny = (kind: "course" | "choose"): Program => ({
    id: "tiny",
    name: "Tiny",
    requirements: [
      kind === "course"
        ? { kind, id: "r", name: "R", options: ["AAAA100"], substitutes: [sub] }
        : { kind, id: "r", name: "R", count: 1, from: { courses: ["AAAA100"] }, substitutes: [sub] },
    ],
  });
  for (const kind of ["course", "choose"] as const) {
    it(`${kind}: counts with the qualifying program, not without`, async () => {
      expect(await status(tiny(kind), "r", ["BBBB100"], ["maj"])).toBe("satisfied");
      expect(await status(tiny(kind), "r", ["BBBB100"])).toBe("missing");
      expect(await status(tiny(kind), "r", ["BBBB100"], ["other"])).toBe("missing");
      expect(await status(tiny(kind), "r", ["AAAA100"])).toBe("satisfied");
    });
  }

  it("choose: the substitute and the replaced course count as one (alternatives)", async () => {
    const p: Program = {
      id: "t",
      name: "T",
      requirements: [{ kind: "choose", id: "r", name: "R", count: 2, from: { courses: ["AAAA100", "CCCC100"] }, substitutes: [{ ...sub, replaces: "AAAA100" }] }],
    };
    expect(await status(p, "r", ["AAAA100", "BBBB100"], ["maj"])).toBe("partial");
    expect(await status(p, "r", ["CCCC100", "BBBB100"], ["maj"])).toBe("satisfied");
  });
});

describe("posted conditional substitutes", () => {
  const rows: [string, Program, string, string, string[], string[]][] = [
    ["hdev PSYC300/EDHD306", hdevMajor, "edhd306", "PSYC300", ["psyc-major-ba", "psyc-major-bs"], ["econ-major-ba"]],
    ["hdev PSYC200/QMMS251", hdevMajor, "qmms251", "PSYC200", ["psyc-major-ba", "psyc-major-bs"], ["econ-major-ba"]],
    ["hdev FMSC302/EDHD306", hdevMajor, "edhd306", "FMSC302", ["fmsc-major"], ["psyc-major-ba"]],
    ["edhd-minor FMSC302", edhdMinor, "edhd306", "FMSC302", ["fmsc-major"], ["psyc-major-ba"]],
    ["edhd-minor PSYC300", edhdMinor, "edhd306", "PSYC300", ["psyc-major-ba", "psyc-major-bs", "neur-major"], ["fmsc-major"]],
    ["bmgt ECON422/BMGT430", bmgtMinorBusinessAnalytics, "bmgt430", "ECON422", ["econ-major-ba", "econ-major-bs"], ["cmsc-major"]],
    ["bmgt ECON424/BMGT430", bmgtMinorBusinessAnalytics, "bmgt430", "ECON424", ["econ-major-ba", "econ-major-bs"], ["cmsc-major"]],
    ["bmgt CMSC320/BMGT404", bmgtMinorBusinessAnalytics, "electives-list-a", "CMSC320", ["cmsc-major"], ["econ-major-ba"]],
  ];
  for (const [label, program, req, course, yes, no] of rows) {
    it(`${label}: counts for a qualifying major`, async () => {
      for (const major of yes) expect(await status(program, req, [course], [major])).toBe("satisfied");
    });
    it(`${label}: doesn't count without one`, async () => {
      expect(await status(program, req, [course])).not.toBe("satisfied");
      for (const major of no) expect(await status(program, req, [course], [major])).not.toBe("satisfied");
    });
  }
});
