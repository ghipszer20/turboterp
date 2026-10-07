// Prior credit form inputs → what each exam or course earns at UMD, using @turboterp/credit.
// Owner ruling: overlapping credit counts once; a second source for the same course is shown as
// "overkill", never as an error. Each row is looked up on its own, so one bad row can't blank the rest.

import {
  CreditError,
  creditForAp,
  creditForIb,
  dualEnrollmentToStudentCourses,
  IB_EXAMS,
  mergeCreditCourses,
  toStudentCourses,
  type CreditAward,
  type CreditCourse,
  type IbLevel,
  type PendingChoice,
} from "@turboterp/credit";
import type { PriorInputs } from "./plan-state";
import type { ChoiceAward } from "./requirements";

export type Earn =
  | { kind: "course"; id: string; credits: number; genEd: string[] }
  | { kind: "choice"; credits: number; options: { id: string; genEd: string[] }[]; picked: string | null }
  | { kind: "generic"; label: string; credits: number; genEd: string[] };

type EntryStatus = "counted" | "no-credit" | "not-counted" | "overkill" | "error";

export type PriorEntry = {
  key: string;
  kind: "ap" | "ib" | "dual";
  /** "AP Calculus BC (5)", "IB Psychology HL (6)" or "Montgomery College MATH181". */
  source: string;
  status: EntryStatus;
  /** What the chart (or the course) is worth, before overlaps. */
  credits: number;
  earns: Earn[];
  notes: string[];
  error?: string;
};

type NotCountedItem = { source: string; kind: "overkill" | "not-counted"; reason: string };

export type PriorCreditResult = {
  entries: PriorEntry[];
  /** What counts, each course once: goes into the plan as prior credit and into the audit. */
  courses: CreditCourse[];
  needsChoice: PendingChoice[];
  notCounted: NotCountedItem[];
  totalCredits: number;
};

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

function earnsOf(award: CreditAward, choices: Record<string, string>): Earn[] {
  return award.parts.map((part): Earn => {
    if (part.kind === "course") return { kind: "course", id: part.id, credits: part.credits, genEd: part.genEd };
    if (part.kind === "choice") {
      const options = part.options.map((o) => ({ id: o.id, genEd: o.genEd }));
      const picked = choices[award.source];
      return { kind: "choice", credits: part.credits, options, picked: picked && options.some((o) => o.id === picked) ? picked : null };
    }
    return { kind: "generic", label: part.label === "Lower Level Elective" ? "Elective credit" : `${part.label}`, credits: part.credits, genEd: part.genEd };
  });
}

/** Course ids an award puts on the record (fixed courses and a made pick). */
const courseIdsOf = (earns: Earn[]) =>
  earns.flatMap((e) => (e.kind === "course" ? [e.id] : e.kind === "choice" && e.picked ? [e.picked] : []));

export function computePriorCredit(inputs: PriorInputs, genEdOf: (id: string) => string[]): PriorCreditResult {
  const entries: PriorEntry[] = [];
  const awards: { key: string; award: CreditAward }[] = [];

  const exam = (key: string, kind: "ap" | "ib", fallback: string, lookup: () => CreditAward) => {
    try {
      const award = lookup();
      awards.push({ key, award });
      entries.push({
        key,
        kind,
        source: award.source,
        status: award.parts.length === 0 ? "no-credit" : "counted",
        credits: award.credits,
        earns: earnsOf(award, inputs.choices),
        notes: award.notes,
      });
    } catch (e) {
      if (!(e instanceof CreditError)) throw e;
      entries.push({ key, kind, source: fallback, status: "error", credits: 0, earns: [], notes: [], error: message(e) });
    }
  };
  for (const a of inputs.ap) exam(a.key, "ap", `AP ${a.exam} (${a.score})`, () => creditForAp(a.exam, a.score));
  for (const a of inputs.ib) exam(a.key, "ib", `IB ${a.exam} ${a.level} (${a.score})`, () => creditForIb(a.exam, a.level as IbLevel, a.score));

  // Only picks that are still valid options, so a stale pick can't throw.
  const choices: Record<string, string> = {};
  for (const e of entries) for (const earn of e.earns) if (earn.kind === "choice" && earn.picked) choices[e.source] = earn.picked;
  const examCredit = toStudentCourses(
    awards.map((a) => a.award),
    choices,
  );

  const dualLists: CreditCourse[][] = [];
  for (const d of inputs.dual) {
    const source = `${d.institution} ${d.course}`;
    try {
      const courses = dualEnrollmentToStudentCourses([
        {
          institution: d.institution,
          course: d.course,
          credits: d.credits,
          umdEquivalent: d.elective ? "elective credit" : [{ id: d.umd, genEd: genEdOf(d.umd.replace(/\s+/g, "").toUpperCase()) }],
        },
      ]);
      dualLists.push(courses);
      entries.push({
        key: d.key,
        kind: "dual",
        source,
        status: "counted",
        credits: d.credits,
        earns: courses.map((c): Earn =>
          c.id.startsWith("L1:")
            ? { kind: "generic", label: "Elective credit", credits: c.credits, genEd: [] }
            : { kind: "course", id: c.id, credits: c.credits, genEd: c.genEd ?? [] },
        ),
        notes: [],
      });
    } catch (e) {
      if (!(e instanceof CreditError)) throw e;
      entries.push({ key: d.key, kind: "dual", source, status: "error", credits: 0, earns: [], notes: [], error: message(e) });
    }
  }

  const merged = mergeCreditCourses(examCredit.courses, ...dualLists);
  const notCounted: NotCountedItem[] = examCredit.notCounted.map((n) => ({ ...n, kind: "not-counted" }));
  for (const n of examCredit.notCounted) {
    const entry = entries.find((e) => e.source === n.source);
    if (entry) entry.status = "not-counted";
  }

  // A course two exams both award is kept once by toStudentCourses; say so for the later exam.
  const from = new Map(merged.courses.map((c) => [c.id, c.source]));
  for (const { award } of awards) {
    const entry = entries.find((e) => e.source === award.source)!;
    if (entry.status !== "counted") continue;
    for (const id of courseIdsOf(entry.earns)) {
      const owner = from.get(id);
      if (owner && owner !== award.source) notCounted.push({ source: award.source, kind: "overkill", reason: `${id} already comes from ${owner}.` });
    }
  }
  notCounted.push(...merged.notCounted.map((n) => ({ ...n, kind: "overkill" as const })));

  // An entry whose every course comes from somewhere else adds nothing: overkill.
  for (const entry of entries) {
    if (entry.status !== "counted" || entry.earns.length === 0) continue;
    const ids = courseIdsOf(entry.earns);
    const generic = entry.earns.some((e) => e.kind === "generic" || (e.kind === "choice" && !e.picked));
    if (!generic && ids.length > 0 && ids.every((id) => from.get(id) !== entry.source)) entry.status = "overkill";
  }

  return {
    entries,
    courses: merged.courses,
    needsChoice: examCredit.needsChoice,
    notCounted,
    totalCredits: merged.courses.reduce((t, c) => t + c.credits, 0),
  };
}

/** The exam awards that offer a choice of courses, for the audit's "it could be ..." hints. */
export function choiceAwardsOf(entries: PriorEntry[]): ChoiceAward[] {
  return entries.flatMap((e) =>
    e.earns.flatMap((earn) => (earn.kind === "choice" ? [{ source: e.source, picked: earn.picked, options: earn.options }] : [])),
  );
}

export function ibLevelsFor(exam: string): IbLevel[] {
  const found = IB_EXAMS.find((e) => e.name === exam);
  return found ? (["SL", "HL"] as const).filter((l) => found.levels[l] !== undefined) : ["SL", "HL"];
}

/** Removes one AP, IB or dual-enrollment row by its key; choices are left as they are. */
export function removePriorEntry(prior: PriorInputs, kind: "ap" | "ib" | "dual", key: string): PriorInputs {
  if (kind === "ap") return { ...prior, ap: prior.ap.filter((a) => a.key !== key) };
  if (kind === "ib") return { ...prior, ib: prior.ib.filter((a) => a.key !== key) };
  return { ...prior, dual: prior.dual.filter((a) => a.key !== key) };
}

/** A credit record's id for people: placeholder credit ("L1:…", "DSNL:…") in words. */
export function creditLabel(id: string): string {
  const m = /^([A-Z0-9]+):/.exec(id);
  if (!m) return id;
  return m[1] === "L1" ? "Elective credit" : `Gen Ed credit (${m[1]})`;
}
