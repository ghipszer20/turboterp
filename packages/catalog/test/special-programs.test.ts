// Invariants for every hand-transcribed living-learning and special program
// (special-programs/). pdftotext splits tokens ("C PSA 201", "A AAS202"), so a
// malformed course code or department would silently match nothing: check them.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { CourseFilter, Program, Requirement } from "@turboterp/audit";
import { specialPrograms } from "../special-programs/registry.ts";

const COURSE = /^[A-Z]{4}\d{3}[A-Z]?$/;
const DEPARTMENT = /^[A-Z]{4}$/;

function filterCodes(f: CourseFilter): { courses: string[]; departments: string[] } {
  return { courses: [...(f.courses ?? []), ...(f.exclude ?? [])], departments: f.departments ?? [] };
}

function codes(r: Requirement): { courses: string[]; departments: string[] } {
  switch (r.kind) {
    case "course":
      return { courses: r.options, departments: [] };
    case "choose":
      return { courses: [...filterCodes(r.from).courses, ...(r.alternatives ?? []).flat()], departments: filterCodes(r.from).departments };
    case "distribution":
      return { courses: r.areas.flatMap((a) => a.courses ?? []), departments: [] };
    case "concentration":
      return { courses: [], departments: r.excludeDepartments ?? [] };
    case "sets": {
      const members = r.options.flat();
      const filters = members.flatMap((m) => (typeof m === "string" ? [] : [filterCodes(m.from)]));
      return {
        courses: [...members.filter((m): m is string => typeof m === "string"), ...filters.flatMap((f) => f.courses)],
        departments: filters.flatMap((f) => f.departments),
      };
    }
    case "openSlot":
      return { courses: [], departments: [] };
  }
}

const drafted = specialPrograms.filter((e): e is typeof e & { program: Program } => e.program !== undefined);

describe("special programs registry", () => {
  it("has an entry for every kind of program", () => {
    const kinds = new Set(specialPrograms.map((e) => e.kind));
    expect([...kinds].sort()).toEqual(["departmental", "honors", "llp", "scholars", "special"]);
  });

  it("has unique program ids and entry names across the whole registry", () => {
    const ids = drafted.map((e) => e.program.id);
    expect(new Set(ids).size).toBe(ids.length);
    const names = specialPrograms.map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("gives every entry a source URL, and a reason when nothing is drafted", () => {
    for (const e of specialPrograms) {
      expect(e.source, e.name).toMatch(/^https:\/\//);
      if (e.drafting === "hand") expect(e.program, e.name).toBeDefined();
      else expect(e.why, e.name).toBeTruthy();
    }
  });

  it("lists every program named in SOURCES.md", () => {
    const sources = readFileSync(new URL("../special-programs/SOURCES.md", import.meta.url), "utf8");
    // Table rows: | Name | Kind | …
    const names = sources
      .split("\n")
      .filter((l) => /^\| [^-|][^|]*\| (Scholars|Honors|Other LLP|Other special program|Departmental Honors) \|/.test(l))
      .map((l) => l.split("|")[1]!.trim());
    expect(names.length).toBeGreaterThan(0);
    expect(names.sort()).toEqual(specialPrograms.map((e) => e.name).sort());
  });

  describe.each(drafted.map((e) => [e.name, e.program] as const))("%s", (_, program) => {
    it("is an unverified draft with a source, catalog year and review notes", () => {
      expect(program.verified).toBe(false);
      expect(program.source).toMatch(/https:\/\//);
      expect(program.catalogYear).toBe("2026-27");
      expect(program.reviewNotes?.length).toBeGreaterThan(0);
      expect(program.requirements.length).toBeGreaterThan(0);
    });

    it("has unique requirement ids", () => {
      const ids = program.requirements.map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("uses well-formed course codes and departments", () => {
      for (const r of program.requirements) {
        const { courses, departments } = codes(r);
        for (const c of courses) expect(c, `${r.id}: ${c}`).toMatch(COURSE);
        for (const d of departments) expect(d, `${r.id}: ${d}`).toMatch(DEPARTMENT);
      }
    });
  });
});
