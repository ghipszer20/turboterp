// Parsers tested against trimmed snapshots of real Testudo pages (test/fixtures).

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SourceError } from "@turboterp/campus-data/http";
import { parseClock, parseCourses, parseDays, parseDepartments, parseSections, parseTerms } from "../src/soc.ts";

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

describe("landing page", () => {
  const html = fixture("soc-home.html");

  it("lists terms and marks the current one", () => {
    const terms = parseTerms(html);
    expect(terms.map((t) => t.id)).toEqual(["202605", "202608", "202612", "202701"]);
    expect(terms.find((t) => t.current)).toMatchObject({ id: "202701", name: "Spring 2027" });
  });

  it("lists departments by code and name", () => {
    expect(parseDepartments(html)[0]).toEqual({ code: "AAAS", name: "African American and Africana Studies" });
  });

  it("fails loudly when the layout changes", () => {
    expect(() => parseDepartments("<html></html>")).toThrow(SourceError);
  });
});

describe("department page", () => {
  const cmsc = parseCourses(fixture("soc-cmsc.html"), "CMSC");
  const hist = parseCourses(fixture("soc-hist.html"), "HIST");

  it("reads course basics", () => {
    expect(cmsc.map((c) => c.id)).toEqual(["CMSC131", "CMSC351"]);
    expect(cmsc[1]).toMatchObject({
      id: "CMSC351",
      department: "CMSC",
      title: "Algorithms",
      credits: { min: 3, max: 3 },
      permissionRequired: true,
    });
  });

  it("separates prerequisite, restriction and description text", () => {
    const algo = cmsc[1]!;
    expect(algo.texts.prerequisite).toBe("Minimum grade of C- in CMSC250 and CMSC216.");
    expect(algo.texts.restriction).toMatch(/^Must be in a major within the CMNS-Computer Science department/);
    expect(algo.description).toMatch(/^A systematic study of the complexity/);
    expect(algo.description).not.toMatch(/Prerequisite/);
  });

  it("reads Gen Ed codes and keeps Testudo's wording", () => {
    expect(hist[0]).toMatchObject({ id: "HIST111", genEd: ["DSHS", "DVUP"], genEdText: "DSHS, DVUP" });
    expect(hist[1]!.genEd).toEqual(["DSHU", "SCIS"]);
  });

  it("keeps the lab condition on lab-science lectures, leaving genEd flat", () => {
    const page = (genEd: string) =>
      `<div id="courses-page"><div class="course" id="CHEM131"><span class="course-min-credits">3</span><div class="course-title">X</div>` +
      `<div class="gen-ed-codes-group"><span class="course-subcategory">${genEd}</span></div></div></div>`;
    const one = (genEd: string) => parseCourses(page(genEd), "CHEM")[0]!;
    expect(one("DSNL (if taken with CHEM132)")).toMatchObject({ genEd: ["DSNL"], labPair: { code: "DSNL", with: "CHEM132" } });
    expect(one("DSNL (if taken with PHYS261), DSNS")).toMatchObject({ genEd: ["DSNL", "DSNS"], labPair: { code: "DSNL", with: "PHYS261" } });
    expect(one("DSNL (if taken with CHEM132), DSNS, SCIS")).toMatchObject({ genEd: ["DSNL", "DSNS", "SCIS"], labPair: { code: "DSNL", with: "CHEM132" } });
    expect(one("DSNL, DSNS")).not.toHaveProperty("labPair");
  });

  it("reads variable credits", () => {
    expect(hist.find((c) => c.id === "HIST299")!.credits).toEqual({ min: 1, max: 3 });
  });
});

describe("sections", () => {
  const sections = parseSections(fixture("soc-sections.html"));

  it("reads sections per course", () => {
    expect(sections.map((s) => `${s.courseId}-${s.id}`)).toEqual(["CMSC216-0101", "CMSC216-0102", "ENGL101-0001"]);
  });

  it("reads instructors, seats and meetings, including discussions", () => {
    expect(sections[0]).toEqual({
      id: "0101",
      courseId: "CMSC216",
      instructors: ["Christopher Kauffman"],
      seats: { total: 28, open: 0, waitlist: 0, holdfile: 0 },
      delivery: "f2f",
      meetings: [
        { days: ["Tu", "Th"], start: 570, end: 645, building: "CSI", room: "1115", type: "Lecture" },
        { days: ["M", "W"], start: 660, end: 710, building: "CSI", room: "1121", type: "Discussion" },
      ],
    });
  });

  it('reports a section with no instructor as "TBA", without Testudo\'s "Instructor:" label', () => {
    const html = `<!doctype html><html><body>
<div id="MATH140" class="course-sections"><div class="sections-container"><div class="sections sixteen colgrid">
  <div class="section delivery-f2f">
    <div class="section-info-container"><div class="row">
      <div class="section-id-container two columns"><span class="section-id"> 0111 </span></div>
      <div class="section-instructors-container five columns">
        <span class="section-instructors">
          <span class="section-instructor">Instructor: TBA</span>
        </span>
      </div>
    </div></div>
  </div>
</div></div></div>
</body></html>`;
    expect(parseSections(html)[0]!.instructors).toEqual(["TBA"]);
  });
});

describe("helpers", () => {
  it("parses clock times and day codes", () => {
    expect(parseClock("1:00pm")).toBe(780);
    expect(parseClock("12:30pm")).toBe(750);
    expect(parseClock("12:00am")).toBe(0);
    expect(parseClock("TBA")).toBeNull();
    expect(parseDays("MWF")).toEqual(["M", "W", "F"]);
    expect(parseDays("TuTh")).toEqual(["Tu", "Th"]);
    expect(parseDays("SaSu")).toEqual(["Sa", "Su"]);
  });
});
