// UMD Undergraduate and Graduate Catalog course pages (academiccatalog.umd.edu).
//
// Each course is one div.courseblock: p.courseblocktitle > strong "<ID> <Title> (<n> Credits)",
// p.courseblockdesc, then p.courseblockextra lines of "<strong>Label:</strong> text".

import * as cheerio from "cheerio";
import type { Course, CourseTexts } from "./soc.ts";

const TITLE = /^([A-Z]{4}\d{3}[A-Z]?)\s+(.*)\s+\((\d+)(?:-(\d+))?\s+Credits?\)$/;
const clean = (s: string) => s.replace(/\s+/g, " ").trim();

export function parseCatalogCourses(html: string): Course[] {
  const $ = cheerio.load(html);
  const courses: Course[] = [];
  $(".courseblock").each((_, el) => {
    const block = $(el);
    const m = TITLE.exec(clean(block.find(".courseblocktitle strong").first().text()));
    if (!m) return;
    const texts: CourseTexts = { prerequisite: null, corequisite: null, restriction: null, creditOnlyGrantedFor: null, other: {} };
    block.find(".courseblockextra").each((__, extra) => {
      const line = $(extra);
      const label = clean(line.find("strong").first().text()).replace(/:$/, "");
      if (!label) return;
      line.find("strong").first().remove();
      const text = clean(line.text());
      switch (label.toLowerCase()) {
        case "prerequisite":
          texts.prerequisite = text;
          break;
        case "corequisite":
          texts.corequisite = text;
          break;
        case "restriction":
          texts.restriction = text;
          break;
        case "credit only granted for":
          texts.creditOnlyGrantedFor = text;
          break;
        default:
          texts.other[label] = text;
      }
    });
    const min = Number(m[3]);
    courses.push({
      id: m[1]!,
      department: m[1]!.slice(0, 4),
      title: m[2]!,
      credits: { min, max: m[4] ? Number(m[4]) : min },
      genEd: [],
      genEdText: "",
      permissionRequired: false,
      texts,
      description: clean(block.find(".courseblockdesc").first().text()),
    });
  });
  return courses;
}
