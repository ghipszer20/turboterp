// Classifies Testudo restriction sentences (course "Restriction" line or a section note) as
// special-program limits. Sentences are the real ones from the Spring 2027 / Fall 2026 snapshots;
// Science in the Evening is the BSCI160 section note (test/fixtures/soc-bsci160.html), and
// Freshman Connection has no sentence this term (it is only caught by its section number).

import { describe, expect, it } from "vitest";
import { programRestriction } from "../src/program-restriction.ts";

const program = (text: string | null, sectionId?: string) => programRestriction(text, sectionId)?.program;

describe("programRestriction", () => {
  const named: [string, string][] = [
    ["Must be in the Science in the Evening (SIE) Program or the Scientific Foundations of Health and Disease Certificate.", "Science in the Evening"],
    ["Students must be matriculated into the College Park Scholars Business, Society & Entrepreneurship program.", "College Park Scholars"],
    ["Must be in College Park Scholars - Civic Engagement for Social Good (CPCV).", "College Park Scholars"],
    ["Must be in the QUEST Program (TQMP).", "QUEST"],
    ["Must be in the Quest program.", "QUEST"],
    ["Restricted to Communication Majors at the Universities at Shady Grove.", "Universities at Shady Grove"],
    ["Must be enrolled at The Universities at Shady Grove; and must be in the Criminal Justice minor; or by permission of department; and must not be in the Criminology and Criminal Justice major.", "Universities at Shady Grove"],
    ["Must be in the Gemstone program.", "Gemstone"],
    ["Must be a second-semester student in the ACES (Advanced Cybersecurity Experience for Students) Living-Learning Program.", "ACES"],
    ["Must be a first-semester student in The First-Year Innovation & Research Experience (FIRE) program.", "FIRE"],
    ["Must be in the Design Cultures and Creativity Honors College Living/Learning program.", "Design Cultures & Creativity"],
    ["Must be in the Honors College Integrated Life Sciences program.", "Integrated Life Sciences"],
    ["Must be in a major in UGST-HCOL-Integrated Life Sciences Program.", "Integrated Life Sciences"],
    ["Must be in the Honors Humanities Program.", "Honors Humanities"],
    ["Must have matriculated in University Honors starting in Fall 2020 or later.", "University Honors"],
    ["Permission of BSOS-Anthropology department; and must be in Anthropology program; and must be admitted to University Honors Program or Anthropology Honors Program.", "University Honors"],
    ["Students must be participants in the Virtus Living and Learning Community.", "Virtus Living and Learning Community"],
    ["Must be in the Flexus Living-Learning Program.", "Flexus Living-Learning Program"],
    ["Must be an entering freshman in the Honors Global Challenges & Solutions living-learning program.", "Honors Global Challenges & Solutions living-learning program"],
  ];
  it.each(named)("names the program in %s", (text, expected) => {
    expect(programRestriction(text)).toEqual({ program: expected, text });
  });

  it("returns program null (with the text) for an unnamed 'enrolled in the X program' limit", () => {
    const text = "Students must be enrolled in the Terrapin Teaching Fellows program.";
    expect(programRestriction(text)).toEqual({ program: null, text });
  });

  it.each([
    "Must be in a major within the BSOS-Economics department.",
    "Must be in Computer Science program.",
    "Senior standing; and must be in American Studies program.",
    "Must be in the Master of Architecture program.",
    "Must be in one of the following programs (American Studies (Master's); American Studies (Doctoral)) . Or permission of ARHU-American Studies department.",
    "Permission of ENGR-Fire Protection Engineering department.",
    "Must be in Engineering: Fire Protection program.",
    "Permission of Museum Scholarship Program required.",
    "Must be a candidate for honors in economics.",
    "Freshman standing; or sophomore standing.",
    null,
  ])("is not a program limit: %s", (text) => {
    expect(programRestriction(text)).toBeNull();
  });

  it("falls back to the section number when there is no text", () => {
    expect(program(null, "SES1")).toBe("Science in the Evening");
    expect(program(null, "SEF2")).toBe("Science in the Evening");
    expect(program(null, "FC02")).toBe("Freshman Connection");
    expect(program(null, "ESG1")).toBe("Universities at Shady Grove");
    expect(programRestriction(null, "0101")).toBeNull();
  });

  it("prefers the program in the text over the section number", () => {
    expect(program("Must be in the QUEST Program (TQMP).", "SES1")).toBe("QUEST");
  });

  it("uses the section number when the text names only a major", () => {
    expect(program("Must be in Computer Science program.", "FC01")).toBe("Freshman Connection");
  });
});
