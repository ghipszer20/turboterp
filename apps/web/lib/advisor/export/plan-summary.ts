import { earnsCredit } from "@turboterp/audit";

// Plain-text summary lines for the "Email my plan" message, from numbers the Advisor already shows.
// Caps match the server's limits (40 lines, 200 characters each).

export type PlanSummaryInput = {
  creditsEarned: number;
  creditsPlanned: number;
  programs: { name: string; satisfied: number; total: number }[];
};

const MAX_LINES = 40;
const MAX_CHARS = 200;

export function planSummaryLines(input: PlanSummaryInput): string[] {
  const lines = [`Credits earned: ${input.creditsEarned}`, `Credits planned: ${input.creditsPlanned}`];
  for (const p of input.programs) {
    lines.push(`${p.name}: ${p.satisfied} of ${p.total} requirements met, ${Math.max(0, p.total - p.satisfied)} left`);
  }
  return lines.slice(0, MAX_LINES).map((l) => (l.length > MAX_CHARS ? `${l.slice(0, MAX_CHARS - 1)}…` : l));
}

type SummaryCourse = { status?: "planned" | "completed"; grade?: string };

/** Credits on completed plan courses that earn credit (F and W don't; see earnsCredit). */
export function earnedCredits<C extends SummaryCourse>(terms: { courses: C[] }[], creditsOf: (c: C) => number): number {
  let total = 0;
  for (const t of terms)
    for (const c of t.courses) if (c.status === "completed" && earnsCredit({ status: c.status, grade: c.grade })) total += creditsOf(c);
  return total;
}
