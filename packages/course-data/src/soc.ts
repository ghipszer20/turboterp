// Testudo Schedule of Classes (app.testudo.umd.edu/soc).
//
// Pages (observed 2026-09-24):
//   /soc/                         → term <select> and one .course-prefix per department
//   /soc/{term}/{DEPT}            → one div.course per course (title, credits, Gen Ed, texts)
//   /soc/{term}/sections?courseIds=A,B,…
//                                 → div#{COURSE} > .section per section (instructors, seats,
//                                   meetings with days/times/building/room/type)
// Term ids are YYYYMM: 01 spring, 05 summer, 08 fall, 12 winter.

import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import { fetchText, SourceError } from "@turboterp/campus-data/http";

const SOC = "https://app.testudo.umd.edu/soc";

export type Term = { id: string; name: string; current: boolean };
export type Department = { code: string; name: string };

export type CourseTexts = {
  prerequisite: string | null;
  corequisite: string | null;
  restriction: string | null;
  /** "Credit only granted for: …" */
  creditOnlyGrantedFor: string | null;
  /** Every other labeled line ("Recommended", "Cross-listed with", "Formerly", …). */
  other: Record<string, string>;
};

export type Course = {
  id: string;
  department: string;
  title: string;
  credits: { min: number; max: number };
  /** Gen Ed codes this course carries, e.g. ["DSHU", "DVUP"]. */
  genEd: string[];
  /** Gen Ed as Testudo writes it, e.g. "DSHS or DSSP, DVUP" (the "or" matters for audits). */
  genEdText: string;
  /** Testudo marks some lab-science lectures DSNL only together with their lab ("DSNL (if taken with CHEM132)"). */
  labPair?: { code: "DSNL"; with: string };
  permissionRequired: boolean;
  texts: CourseTexts;
  description: string;
};

export type Meeting = {
  /** "M", "Tu", "W", "Th", "F", "Sa", "Su" */
  days: string[];
  /** Minutes after midnight; null for online/asynchronous or TBA meetings. */
  start: number | null;
  end: number | null;
  building: string | null;
  room: string | null;
  /** "Lecture" unless Testudo labels it (e.g. "Discussion", "Lab"). */
  type: string;
};

export type Section = {
  id: string;
  courseId: string;
  instructors: string[];
  seats: { total: number; open: number; waitlist: number; holdfile: number };
  /** "f2f" | "blended" | "online" and so on, from Testudo's delivery class. */
  delivery: string;
  meetings: Meeting[];
};

const text = (s: string | undefined) => (s ?? "").replace(/\s+/g, " ").trim();
const int = (s: string | undefined) => {
  const n = Number.parseInt(text(s), 10);
  return Number.isFinite(n) ? n : 0;
};

/** "1:00pm" → 780 */
export function parseClock(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})\s*([ap])m$/i.exec(value.trim());
  if (!m) return null;
  return ((Number(m[1]) % 12) + (m[3]!.toLowerCase() === "p" ? 12 : 0)) * 60 + Number(m[2]);
}

/** "MWF" → ["M","W","F"], "TuTh" → ["Tu","Th"] */
export function parseDays(value: string): string[] {
  return value.match(/Tu|Th|Sa|Su|M|W|F/g) ?? [];
}

// ---- landing page ----

export function parseTerms(html: string): Term[] {
  const $ = cheerio.load(html);
  const terms = $("option")
    .toArray()
    .map((o) => ({ id: $(o).attr("value") ?? "", name: text($(o).text()), current: $(o).is("[selected]") }))
    .filter((t) => /^\d{6}$/.test(t.id));
  if (terms.length === 0) throw new SourceError("soc", "page layout changed: no terms");
  return terms;
}

export function parseDepartments(html: string): Department[] {
  const $ = cheerio.load(html);
  const depts = $(".course-prefix a")
    .toArray()
    .map((a) => ({ code: text($(a).find(".prefix-abbrev").text()), name: text($(a).find(".prefix-name").text()) }))
    .filter((d) => /^[A-Z]{4}$/.test(d.code));
  if (depts.length === 0) throw new SourceError("soc", "page layout changed: no departments");
  return depts;
}

/**
 * Prefixes the Academic Catalog's approved-courses index lists but Testudo's department index
 * omits, although their pages exist (e.g. /soc/202608/CMNS has CMNS100/210/211). Checked 2026-09-29.
 * A prefix whose page has no courses just contributes nothing.
 */
export const EXTRA_DEPARTMENT_PREFIXES: readonly string[] = [
  "ARHX", "ARTX", "ARUX", "CINX", "CLAX", "CMLX", "CMNS", "COMX", "CPSD", "EDCI",
  "EDPS", "ENGX", "HEIP", "HISX", "ITAX", "IVSP", "LASX", "LGBX", "MLSC", "MUET",
  "MUSP", "OURS", "PHIX", "PHPX", "PSIT", "RELX", "SLLX", "SPAX", "THEX", "WMSX",
];

/** The index's departments plus the hidden prefixes above (the index's own entries win). */
export function withExtraDepartments(departments: Department[]): Department[] {
  const seen = new Set(departments.map((d) => d.code));
  const extra = EXTRA_DEPARTMENT_PREFIXES.filter((code) => !seen.has(code)).map((code) => ({ code, name: code }));
  return [...departments, ...extra];
}

// ---- department page ----

const LABEL_KEYS: Record<string, keyof Omit<CourseTexts, "other">> = {
  prerequisite: "prerequisite",
  prerequisites: "prerequisite",
  corequisite: "corequisite",
  corequisites: "corequisite",
  restriction: "restriction",
  restrictions: "restriction",
  "credit only granted for": "creditOnlyGrantedFor",
};

function parseTexts($: cheerio.CheerioAPI, course: cheerio.Cheerio<Element>) {
  const texts: CourseTexts = {
    prerequisite: null,
    corequisite: null,
    restriction: null,
    creditOnlyGrantedFor: null,
    other: {},
  };
  const descriptions: string[] = [];

  // Labeled lines look like <div><strong>Prerequisite:</strong> …</div>.
  course.find(".approved-course-text, .course-text").each((_, block) => {
    const labeled = $(block).find("strong");
    if (labeled.length === 0) {
      const t = text($(block).text());
      if (t) descriptions.push(t);
      return;
    }
    labeled.each((_, strong) => {
      const label = text($(strong).text()).replace(/:$/, "");
      const line = text($(strong).parent().text()).replace(/^[^:]*:\s*/, "");
      const key = LABEL_KEYS[label.toLowerCase()];
      if (key) texts[key] = line;
      else if (label) texts.other[label] = line;
    });
  });
  return { texts, description: descriptions.join("\n\n") };
}

/** "DSNL (if taken with CHEM132), DSNS" -> the DSNL condition, kept out of the flat genEd list. */
function labPairOf(genEdText: string): { labPair?: { code: "DSNL"; with: string } } {
  const m = /\bDSNL\s*\(\s*if taken with\s+([A-Z]{4}\d{3}[A-Z]?)\s*\)/i.exec(genEdText);
  return m ? { labPair: { code: "DSNL", with: m[1]!.toUpperCase() } } : {};
}

export function parseCourses(html: string, department: string): Course[] {
  const $ = cheerio.load(html);
  if ($("#courses-page, .courses-container, div.course").length === 0 && !/No courses matched/i.test(html)) {
    throw new SourceError("soc", `page layout changed for ${department}: no course container`);
  }
  return $("div.course")
    .toArray()
    .map((el) => {
      const course = $(el);
      const id = text(course.attr("id"));
      const min = int(course.find(".course-min-credits").first().text());
      const maxText = course.find(".course-max-credits").first().text();
      const genEdText = text(
        course
          .find(".gen-ed-codes-group .course-subcategory")
          .toArray()
          .map((s) => $(s).text())
          .join(", "),
      );
      const { texts, description } = parseTexts($, course);
      return {
        id,
        department,
        title: text(course.find(".course-title").first().text()),
        credits: { min, max: maxText ? int(maxText) : min },
        genEd: [...new Set(genEdText.match(/\b[A-Z]{4}\b/g) ?? [])],
        genEdText,
        ...labPairOf(genEdText),
        permissionRequired: course.find(".perm-req-message").length > 0,
        texts,
        description,
      };
    })
    .filter((c) => /^[A-Z]{4}\d{3}[A-Z]?$/.test(c.id));
}

// ---- sections ----

export function parseSections(html: string): Section[] {
  const $ = cheerio.load(html);
  const out: Section[] = [];
  $("div.course-sections, div.course").each((_, courseEl) => {
    const courseId = text($(courseEl).attr("id"));
    $(courseEl)
      .find("div.section")
      .each((_, secEl) => {
        const sec = $(secEl);
        const delivery = (/delivery-(\w+)/.exec(sec.attr("class") ?? "") ?? [])[1] ?? "unknown";
        const meetings: Meeting[] = sec
          .find(".class-days-container > .row")
          .toArray()
          .map((row) => {
            const r = $(row);
            const days = parseDays(text(r.find(".section-days").text()));
            const start = parseClock(text(r.find(".class-start-time").text()));
            const end = parseClock(text(r.find(".class-end-time").text()));
            const building = text(r.find(".building-code").text()) || null;
            const room = text(r.find(".class-room").text()) || null;
            return { days, start, end, building, room, type: text(r.find(".class-type").text()) || "Lecture" };
          })
          .filter((m) => m.days.length > 0 || m.building !== null || m.start !== null);
        out.push({
          id: text(sec.find(".section-id").first().text()),
          courseId,
          instructors: sec
            .find(".section-instructor")
            .toArray()
            // Unstaffed sections read "Instructor: TBA"; keep just "TBA".
            .map((i) => text($(i).text()).replace(/^Instructor:\s*/i, ""))
            .filter(Boolean),
          seats: {
            total: int(sec.find(".total-seats-count").first().text()),
            open: int(sec.find(".open-seats-count").first().text()),
            waitlist: int(sec.find(".waitlist-count").first().text()),
            holdfile: int(sec.find(".holdfile-count").first().text()),
          },
          delivery,
          meetings,
        });
      });
  });
  return out;
}

// ---- network (callers should pace requests; see scripts/snapshot.ts) ----

export async function fetchTermsAndDepartments(): Promise<{ terms: Term[]; departments: Department[] }> {
  const html = await fetchText("soc", `${SOC}/`);
  return { terms: parseTerms(html), departments: parseDepartments(html) };
}

export async function fetchCourses(term: string, department: string): Promise<Course[]> {
  return parseCourses(await fetchText("soc", `${SOC}/${term}/${department}`), department);
}

export async function fetchSections(term: string, courseIds: string[]): Promise<Section[]> {
  if (courseIds.length === 0) return [];
  return parseSections(await fetchText("soc", `${SOC}/${term}/sections?courseIds=${courseIds.join(",")}`));
}
