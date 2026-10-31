// Prior credit and credit caps as plain data for the Credit and Tracks screens. No React Native
// imports, so it is unit-tested in Node. Ported from the web's PriorCreditView and the cap check
// in packages/plan (the cap numbers come from creditCap, never copied here).
import type { PriorInputs } from "@turboterp/app-core/plan-state";
import { creditLabel, type Earn, type PriorEntry } from "@turboterp/app-core/prior-credit";
import { collegeName, creditCap, type College } from "@turboterp/plan/credit-caps";
import type { Season } from "@turboterp/plan/check";

export const ENTRY_STATUS_LABEL: Record<PriorEntry["status"], string> = {
  counted: "Counted",
  "no-credit": "No credit at this score",
  "not-counted": "Not counted",
  overkill: "Overkill",
  error: "Error",
};
/** Counted reads as good news; anything UMD won't add is a quiet notice; only an error is red. */
export const ENTRY_STATUS_TONE: Record<PriorEntry["status"], "open" | "soon" | "closed"> = {
  counted: "open",
  "no-credit": "soon",
  "not-counted": "soon",
  overkill: "soon",
  error: "closed",
};

export const AP_SCORES = [5, 4, 3, 2, 1];
export const IB_SCORES = [7, 6, 5, 4, 3, 2, 1];

/** One line for an award: "MATH140 · 4 cr · FSMA", "2 cr: HIST200 or HIST201", "Elective · 3 cr". */
export function earnText(earn: Earn): string {
  if (earn.kind === "course") return `${creditLabel(earn.id)} · ${earn.credits} cr${earn.genEd.length ? ` · ${earn.genEd.join(", ")}` : ""}`;
  if (earn.kind === "generic") return `${earn.label} · ${earn.credits} cr`;
  return `${earn.credits} cr: ${earn.options.map((o) => o.id).join(" or ")}`;
}

export const addAp = (prior: PriorInputs, key: string, exam: string, score: number): PriorInputs => ({ ...prior, ap: [...prior.ap, { key, exam, score }] });

export const addIb = (prior: PriorInputs, key: string, exam: string, level: "HL" | "SL", score: number): PriorInputs => ({
  ...prior,
  ib: [...prior.ib, { key, exam, level, score }],
});

export type DualDraft = { institution: string; course: string; credits: number; elective: boolean; umd: string };

export function dualValid(d: DualDraft): boolean {
  return d.institution.trim() !== "" && d.course.trim() !== "" && d.credits > 0 && (d.elective || d.umd.trim() !== "");
}

export const addDual = (prior: PriorInputs, key: string, d: DualDraft): PriorInputs => ({
  ...prior,
  dual: [...prior.dual, { key, institution: d.institution.trim(), course: d.course.trim(), credits: d.credits, umd: d.umd.trim().toUpperCase(), elective: d.elective }],
});

/** An empty id returns the award to automatic: the pick is removed. */
export function setChoice(prior: PriorInputs, source: string, id: string): PriorInputs {
  const rest = Object.fromEntries(Object.entries(prior.choices).filter(([k]) => k !== source));
  return { ...prior, choices: id ? { ...rest, [source]: id } : rest };
}

export type CapTerm = {
  name: string;
  credits: number;
  /** Some course's credits are unknown, so `credits` is a lower bound. */
  approx: boolean;
  max: number;
  status: "over" | "at" | "ok";
  text: string;
};
export type CapRule = { season: Season; max: number; approval: string; source: string; isDefault: boolean };
export type CreditCapsView = { collegeLabel: string; rules: CapRule[]; terms: CapTerm[]; usesDefault: boolean };

const SEASONS: Season[] = ["Fall", "Spring", "Winter", "Summer"];
const seasonOfName = (name: string): Season | null => {
  const s = name.split(" ")[0];
  return SEASONS.find((x) => x === s) ?? null;
};
const approvalText = (a: "dean" | "advisor" | null) => (a === "dean" ? "your dean's approval" : a === "advisor" ? "your advisor's approval" : "approval");

/** The college's per-term credit limits and where each planned term stands. `creditsOf` returns null when unknown. */
export function buildCreditCaps(input: {
  college: College | undefined;
  terms: { name: string; courses: { id: string; credits?: number }[] }[];
  creditsOf: (c: { id: string; credits?: number }) => number | null;
}): CreditCapsView {
  const { college, terms, creditsOf } = input;
  const rules = SEASONS.map((season) => {
    const cap = creditCap(college, season);
    return { season, max: cap.max, approval: approvalText(cap.approval), source: cap.source, isDefault: cap.isDefault };
  });
  const capTerms: CapTerm[] = [];
  for (const t of terms) {
    const season = seasonOfName(t.name);
    if (!season) continue;
    let credits = 0;
    let approx = false;
    for (const c of t.courses) {
      const cr = creditsOf(c);
      if (cr === null) approx = true;
      else credits += cr;
    }
    const rule = rules.find((r) => r.season === season)!;
    const status = credits > rule.max ? "over" : credits === rule.max ? "at" : "ok";
    const shown = `${credits}${approx ? "+" : ""}`;
    capTerms.push({
      name: t.name,
      credits,
      approx,
      max: rule.max,
      status,
      text:
        status === "over"
          ? `${shown} of ${rule.max} credits. Over the limit: going over needs ${rule.approval}.`
          : status === "at"
            ? `${shown} of ${rule.max} credits. At the limit.`
            : `${shown} of ${rule.max} credits.`,
    });
  }
  return {
    collegeLabel: college ? collegeName(college) : "UMD campus-wide",
    rules,
    terms: capTerms,
    usesDefault: rules.every((r) => r.isDefault),
  };
}

/** Where each planned course sits: course id to its term name (the first term that lists it). */
export function termOfCourses(terms: { name: string; courses: { id: string }[] }[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const t of terms) for (const c of t.courses) if (!m.has(c.id)) m.set(c.id, t.name);
  return m;
}

/** "MATH140 (Fall 2026), CMSC131" for the courses counted toward a requirement. */
export function countedWhere(counted: string[], where: Map<string, string>): string {
  return counted.map((id) => (where.has(id) ? `${id} (${where.get(id)})` : id)).join(", ");
}
