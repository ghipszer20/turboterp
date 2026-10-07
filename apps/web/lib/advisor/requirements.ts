// What would satisfy an unmet Requirement (a Gap), in words, with example courses. Used by the
// audit view, which loads with the solver, so importing @turboterp/audit here is fine.

import { earnsCredit, inArea, matchesFilter, rangeTakesGraduateCourses, type Area, type Requirement, type RequirementResult, type SetMember, type StudentCourse } from "@turboterp/audit";
import { filterText, listing } from "./words";

export { filterText, genEdName, prerequisiteText } from "./words";

/** `note`: an extra line for the student, e.g. that the requirement's list isn't closed. */
export type Gap = { need: string; suggestions: string[]; note?: string };

const ADVISOR_NOTE = "Other courses may count with advisor approval.";

export type GapContext = {
  /** The student's courses (prior credit, completed and planned). */
  courses: StudentCourse[];
  /** Courses in the catalog, to suggest from. */
  catalog: { id: string; genEd: string[] }[];
  /** Exam awards that offer a choice of courses, to hint at an option that would count here. */
  choiceAwards?: ChoiceAward[];
};

const MAX_SUGGESTIONS = 6;
const more = (n: number, one: string, many: string) => `${n} more ${n === 1 ? one : many}`;

function memberText(m: SetMember): string {
  return typeof m === "string" ? m : `${m.count} ${filterText(m.from, m.count)}`;
}

/** An exam award offering "this course or that one": its source label, the pick (if made) and the options. */
export type ChoiceAward = { source: string; picked: string | null; options: { id: string; genEd: string[] }[] };

/** Says when another option of a choice award would count toward `req` and the pick doesn't. */
function choiceHints(req: Requirement, awards: ChoiceAward[]): string[] {
  const filters = "from" in req ? [req.from] : req.kind === "sets" ? req.options.flat().flatMap((m) => (typeof m === "string" ? [] : [m.from])) : [];
  const codes = filters.flatMap((f) => f.genEd ?? []);
  const listed = req.kind === "course" ? req.options : req.kind === "sets" ? req.options.flat().filter((m): m is string => typeof m === "string") : [];
  return awards.flatMap((award) => {
    const pick = award.options.find((o) => o.id === award.picked);
    // Unpicked, only what every option shares counts, so an option offering more is worth naming.
    const base = pick ? pick.genEd : award.options.reduce<string[]>((s, o, i) => (i === 0 ? [...o.genEd] : s.filter((g) => o.genEd.includes(g))), []);
    const better = award.options.filter(
      (o) => o.id !== award.picked && ((!pick || !listed.includes(pick.id)) && listed.includes(o.id) || o.genEd.some((g) => codes.includes(g) && !base.includes(g))),
    );
    if (better.length === 0) return [];
    return [`Your ${award.source} credit could be ${listing(better.map((o) => o.id), "or")}, which also counts here. Check which course UMD posted.`];
  });
}

export function describeGap(req: Requirement, result: RequirementResult, ctx: GapContext): Gap | null {
  if (result.status === "satisfied") return null;
  const gap = gapFor(req, result, ctx);
  const hints = choiceHints(req, ctx.choiceAwards ?? []);
  const note = [...hints, ...(req.advisorMayApprove ? [ADVISOR_NOTE] : [])].join(" ");
  return note ? { ...gap, note } : gap;
}

function gapFor(req: Requirement, result: RequirementResult, ctx: GapContext): Gap {
  // A failed/withdrawn attempt earns no credit, so it's never "have" here -- the student still
  // needs a passing attempt of it, and it shouldn't count toward filling a filter member below.
  const have = new Set(ctx.courses.filter(earnsCredit).map((c) => c.id));
  const credits = new Map(ctx.courses.map((c) => [c.id, c.credits]));
  const fromCatalog = (test: (c: { id: string; genEd: string[] }) => boolean) =>
    ctx.catalog.filter((c) => !have.has(c.id) && test(c)).slice(0, MAX_SUGGESTIONS).map((c) => c.id);

  switch (req.kind) {
    case "course": {
      const suggestions = req.options.filter((id) => !have.has(id));
      const need = req.options.length <= 3 ? `Take ${listing(req.options, "or")}.` : "Take one of the listed courses.";
      return { need, suggestions };
    }
    case "choose": {
      const suggestions = fromCatalog((c) => matchesFilter(req.from, c));
      if (req.credits !== undefined) {
        const done = result.assigned.reduce((t, id) => t + (credits.get(id) ?? 0), 0);
        const n = Math.max(1, req.credits - done);
        const need = req.from.anyCourse ? `${more(n, "credit", "credits")} of any kind.` : `${more(n, "credit", "credits")}: ${filterText(req.from, 2)}.`;
        return { need, suggestions: req.from.anyCourse ? [] : suggestions };
      }
      const n = Math.max(1, (req.count ?? 1) - result.assigned.length);
      return { need: `${n} more ${filterText(req.from, n)}.`, suggestions };
    }
    case "distribution": {
      const n = Math.max(1, req.count - result.assigned.length);
      const used = (area: Area) => result.assigned.filter((id) => inArea(area, { id })).length;
      const open = req.areas.filter((a) => used(a) < req.maxPerArea).sort((a, b) => used(a) - used(b));
      const inCatalog = new Set(ctx.catalog.map((c) => c.id));
      const lists = open.map((a) => (a.courses ?? []).filter((id) => !have.has(id) && inCatalog.has(id)));
      const suggestions: string[] = [];
      for (let i = 0; suggestions.length < MAX_SUGGESTIONS && lists.some((l) => l.length > i); i++) {
        for (const l of lists) if (l[i] && suggestions.length < MAX_SUGGESTIONS) suggestions.push(l[i]!);
      }
      return {
        need: `${more(n, "course", "courses")} from the listed areas, using at least ${req.minAreas} areas and at most ${req.maxPerArea} from any one.`,
        suggestions,
      };
    }
    case "concentration": {
      const done = result.assigned.reduce((t, id) => t + (credits.get(id) ?? 0), 0);
      const n = Math.max(1, req.credits - done);
      const not = req.excludeDepartments?.length ? ` (not ${listing(req.excludeDepartments, "or")})` : "";
      return { need: `${more(n, "credit", "credits")} of courses numbered ${req.minNumber}–${req.maxNumber}${rangeTakesGraduateCourses(req.minNumber, req.maxNumber, req.noGraduateCourses) ? " (grad courses count too)" : ""}, all in one department${not}.`, suggestions: [] };
    }
    case "sets": {
      const gaps = req.options.map((set) => {
        const fixed = new Set(set.filter((m): m is string => typeof m === "string"));
        let size = [...fixed].filter((id) => !have.has(id)).length;
        // What is still needed: missing fixed courses, and filter members with the count left.
        const left: string[] = [];
        for (const m of set) {
          if (typeof m === "string") {
            left.push(m);
            continue;
          }
          const matching = ctx.courses.filter((c) => !fixed.has(c.id) && earnsCredit(c) && matchesFilter(m.from, c)).length;
          const n = Math.max(0, m.count - matching);
          size += n;
          if (n > 0) left.push(matching > 0 ? `${n} more ${filterText(m.from, n)}` : memberText(m));
        }
        return { size, left, missing: [...fixed].filter((id) => !have.has(id)) };
      });
      const best = gaps.reduce((a, b) => (b.size < a.size ? b : a));
      const others = req.options.length > 1 ? " (or another listed set)" : "";
      return { need: `Finish a set: ${listing(best.left, "and")}${others}.`, suggestions: best.missing };
    }
    case "openSlot":
      return { need: "Confirm with your advisor, then tick it below.", suggestions: [] };
  }
}
