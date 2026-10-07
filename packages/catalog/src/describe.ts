// A Requirement in plain language: "One of: CMSC131, CMSC133", "Choose 2 of: …,
// at most one of CMSC460 / CMSC466". Framework-free.

import { rangeTakesGraduateCourses, type CourseFilter, type Requirement, type SetMember } from "@turboterp/audit";

export type Described = {
  /** The rule in one line. */
  text: string;
  /** Its parts, one per line: a distribution's areas, or the sets to choose from. */
  details: string[];
  /** Modifiers: minimum grade, overlay. */
  notes: string[];
};

const list = (codes: string[]) => codes.join(", ");
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function numberRange(min?: number, max?: number, noGraduateCourses?: boolean): string | null {
  const grad = max !== undefined && max < 999 && rangeTakesGraduateCourses(min, max, noGraduateCourses) ? " or 600+" : "";
  if (min !== undefined && max !== undefined) return `${min}–${max}${grad}`;
  if (min !== undefined) return `${min}+`;
  if (max !== undefined) return `up to ${max}`;
  return null;
}

/** Which courses a filter matches, e.g. "MATH/AMSC/STAT 240+", "courses with Gen Ed DSHU". */
export function describeFilter(filter: CourseFilter): string {
  if (filter.anyCourse) return "any course";
  const parts: string[] = [];
  if (filter.courses?.length) parts.push(list(filter.courses));
  // Graduate courses only match through a department (audit's matchesFilter), so a department-free range doesn't mention them.
  const range = numberRange(filter.minNumber, filter.maxNumber, filter.noGraduateCourses || !filter.departments?.length);
  if (filter.departments?.length) parts.push([filter.departments.join("/"), range].filter(Boolean).join(" "));
  else if (range) parts.push(`any department ${range}`);
  if (filter.genEd?.length) parts.push(`courses with Gen Ed ${filter.genEd.join(" or ")}`);
  const except = filter.exclude?.length ? `, except ${list(filter.exclude)}` : "";
  return parts.join(" or ") + except;
}

const member = (m: SetMember) => (typeof m === "string" ? m : `${plural(m.count, "course")} from ${describeFilter(m.from)}`);

function describeRule(r: Requirement): Pick<Described, "text" | "details"> {
  switch (r.kind) {
    case "course":
      return { text: r.options.length === 1 ? r.options[0]! : `One of: ${list(r.options)}`, details: [] };
    case "choose": {
      const isList = r.from.courses !== undefined && Object.keys(r.from).length === 1;
      const atMostOne = (r.alternatives ?? []).map((g) => `, at most one of ${g.join(" / ")}`).join("");
      let text: string;
      if (isList && r.count === 1 && r.credits === undefined) text = `One of: ${list(r.from.courses!)}`;
      else if (isList && r.count !== undefined) text = `Choose ${r.count} of: ${list(r.from.courses!)}`;
      else if (isList) text = `${r.credits} credits from: ${list(r.from.courses!)}`;
      else {
        const amount = r.count !== undefined ? plural(r.count, "course") : `${r.credits} credits`;
        const which = describeFilter(r.from);
        text = which.startsWith("courses with ") && r.count !== undefined ? `${amount} ${which.slice("courses ".length)}` : `${amount} from ${which}`;
      }
      return { text: text + atMostOne, details: [] };
    }
    case "distribution": {
      const cap = r.maxPerArea < r.count ? `, at most ${r.maxPerArea} per area` : "";
      return {
        text: `${plural(r.count, "course")} from at least ${plural(r.minAreas, "area")}${cap}`,
        details: r.areas.map((a) => `${a.name}: ${[...(a.courses?.length ? [list(a.courses)] : []), ...(a.from ? [describeFilter(a.from)] : [])].join("; ")}`),
      };
    }
    case "concentration": {
      const not = r.excludeDepartments?.length ? ` (not ${r.excludeDepartments.join(", ")})` : "";
      return { text: `${r.credits} credits of ${numberRange(r.minNumber, r.maxNumber, r.noGraduateCourses)} courses, all from one department${not}`, details: [] };
    }
    case "sets": {
      if (r.options.length === 1) return { text: `All of: ${r.options[0]!.map(member).join(", ")}`, details: [] };
      const count = r.count ?? 1;
      return {
        text: count === 1 ? "One of these sets:" : `${count} of these sets:`,
        details: r.options.map((set) => set.map(member).join(" + ")),
      };
    }
    case "openSlot": {
      const amount = r.credits !== undefined ? `${r.credits} credits` : "Courses";
      return { text: `${amount} from an approved list that isn't published: confirm with your advisor`, details: r.note ? [r.note] : [] };
    }
  }
}

export function describeRequirement(r: Requirement): Described {
  const notes: string[] = [];
  if (r.minGrade) notes.push(`${r.minGrade} or better`);
  if (r.overlay) notes.push("Overlay: its courses also count toward other requirements");
  return { ...describeRule(r), notes };
}
