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
