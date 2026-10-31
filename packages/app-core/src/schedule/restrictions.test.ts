import { describe, expect, it } from "vitest";
import type { Section } from "@turboterp/course-data/schedules";
import { courseRestrictionLine, layoutRestrictions, restrictionLine, restrictionNote, sectionRestriction } from "./restrictions";

const sec = (courseId: string, id: string, notes: string | null = null): Section => ({
  id,
  courseId,
  notes,
  instructors: [],
  seats: { total: 30, open: 3, waitlist: 0, holdfile: 0 },
  delivery: "f2f",
  meetings: [],
});
const SIE = "Must be in the Science in the Evening (SIE) Program or the Scientific Foundations of Health and Disease Certificate.";
const CPS = "Students must be matriculated into the College Park Scholars Business, Society & Entrepreneurship program.";

describe("sectionRestriction / restrictionNote", () => {
  it("warns on the section with the note only", () => {
    expect(restrictionNote(sectionRestriction(sec("BSCI160", "SES1", SIE), null)!)).toBe("Only for students in Science in the Evening");
    expect(sectionRestriction(sec("BSCI160", "0101"), null)).toBeNull();
  });
  it("warns on every section of a course-level program restriction", () => {
    for (const id of ["0101", "0201"]) {
      expect(restrictionNote(sectionRestriction(sec("CPBE101", id), CPS)!)).toBe("Only for students in College Park Scholars");
    }
  });
  it("uses the section-number fallback when there is no text", () => {
    expect(restrictionNote(sectionRestriction(sec("BSCI160", "SES1"), null)!)).toBe("Only for students in Science in the Evening");
  });
  it("does not warn for a major restriction", () => {
    expect(sectionRestriction(sec("ECON200", "0101"), "Must be in a major within the BSOS-Economics department.")).toBeNull();
  });
  it("falls back to a special program when no name is known", () => {
    expect(restrictionNote({ program: null, text: "x" })).toBe("Only for students in a special program");
  });
});

describe("layoutRestrictions", () => {
  it("lists only restricted sections", () => {
    const out = layoutRestrictions([sec("BSCI160", "SES1", SIE), sec("MATH140", "0101")], {});
    expect(out).toEqual([{ courseId: "BSCI160", sectionId: "SES1", note: "Only for students in Science in the Evening" }]);
  });
});

describe("lines", () => {
  it("builds the sentences", () => {
    const r = { program: "Science in the Evening", text: null };
    expect(restrictionLine("BSCI160", "SES1", r)).toBe("BSCI160 SES1 is only for students in Science in the Evening.");
    expect(courseRestrictionLine("CPBE101", { program: "College Park Scholars", text: null })).toBe(
      "CPBE101 is only for students in College Park Scholars.",
    );
  });
});
