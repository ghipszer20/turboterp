// Turn exam credit into the audit's StudentCourse records.

import type { StudentCourse } from "@turboterp/audit";
import { CreditError, type CreditAward } from "./types.ts";

/** A StudentCourse that remembers where the credit came from, e.g. "AP Calculus BC (5)". */
export type CreditCourse = StudentCourse & { source: string };

/** An award offering several courses ("HIST200 or HIST201") that waits for the student's pick. */
export type PendingChoice = { source: string; credits: number; options: string[] };

/** Credit the student entered that UMD won't count, and why, so the app can say so. */
export type NotCounted = { source: string; reason: string };

// "Credit is granted for Calculus AB or BC, not both." Listed by preference when credits tie.
const CALCULUS = ["Calculus BC", "Calculus BC AB Subscore", "Calculus AB"];

/**
 * Keeps only the calculus award worth the most credits. A BC score of 3 or below loses to a
 * better AB subscore, which the chart says is then processed as the AB exam.
 */
function oneCalculusAward(awards: CreditAward[]): { kept: CreditAward[]; notCounted: NotCounted[] } {
  const calculus = awards.filter((a) => a.program === "AP" && CALCULUS.includes(a.exam) && a.parts.length > 0);
  if (calculus.length < 2) return { kept: awards, notCounted: [] };
  const best = calculus.reduce((a, b) =>
    b.credits > a.credits || (b.credits === a.credits && CALCULUS.indexOf(b.exam) < CALCULUS.indexOf(a.exam)) ? b : a,
  );
  const losers = calculus.filter((a) => a !== best);
  return {
    kept: awards.filter((a) => !losers.includes(a)),
    notCounted: losers.map((a) => ({
      source: a.source,
      reason: `UMD grants credit for Calculus AB or BC, not both; ${best.source} counts instead.`,
    })),
  };
}

/**
 * Completed courses, without a letter grade, for every award part.
 * Credit with no UMD course gets a placeholder id such as "L1:AP Computer Science A" or
 * "DSNL:AP Biology": it counts toward Gen Ed (through its codes) and total credits, but can never
 * match a course, department or level requirement. A course two exams both award counts once,
 * and only one calculus award (AB, BC or the BC's AB subscore) counts; `notCounted` lists the rest.
 * `choices` maps an award's source label to the course picked from its options.
 */
export function toStudentCourses(
  allAwards: CreditAward[],
  choices: Record<string, string> = {},
): { courses: CreditCourse[]; needsChoice: PendingChoice[]; notCounted: NotCounted[] } {
  const { kept: awards, notCounted } = oneCalculusAward(allAwards);
  const courses: CreditCourse[] = [];
  const needsChoice: PendingChoice[] = [];
  const add = (id: string, credits: number, genEd: string[], source: string) => {
    if (!courses.some((c) => c.id === id)) courses.push({ id, credits, status: "completed", genEd, source });
  };

  for (const award of awards) {
    const placeholderBase = award.source.replace(/ \(\d+\)$/, "");
    for (const part of award.parts) {
      if (part.kind === "course") add(part.id, part.credits, part.genEd, award.source);
      else if (part.kind === "choice") {
        const picked = choices[award.source];
        if (picked === undefined) {
          needsChoice.push({ source: award.source, credits: part.credits, options: part.options.map((o) => o.id) });
          continue;
        }
        const option = part.options.find((o) => o.id === picked);
        if (!option) throw new CreditError(`${award.source} offers ${part.options.map((o) => o.id).join(" or ")}, not ${picked}`);
        add(option.id, part.credits, option.genEd, award.source);
      } else {
        const base = `${part.genEd[0] ?? "L1"}:${placeholderBase}`;
        let id = base;
        for (let n = 2; courses.some((c) => c.id === id); n++) id = `${base} #${n}`;
        add(id, part.credits, part.genEd, award.source);
      }
    }
  }
  return { courses, needsChoice, notCounted };
}

/**
 * Combines credit lists (exams, dual enrollment) into one, keeping the first copy of any UMD
 * course that more than one source awards. Placeholder credit is never a duplicate.
 */
export function mergeCreditCourses(...lists: CreditCourse[][]): { courses: CreditCourse[]; notCounted: NotCounted[] } {
  const courses: CreditCourse[] = [];
  const notCounted: NotCounted[] = [];
  for (const course of lists.flat()) {
    const first = courses.find((c) => c.id === course.id);
    if (first) notCounted.push({ source: course.source, reason: `${course.id} already comes from ${first.source}.` });
    else courses.push(course);
  }
  return { courses, notCounted };
}
