// What the Advisor shows for a requirement. The audit says satisfied / partial / missing; the
// display splits "satisfied" in two: every counted course completed (Satisfied) or some still
// planned (In progress, on track). "partial" is short of courses or credits (Partly met).

import { earnsCredit, type RequirementResult, type StudentCourse } from "@turboterp/audit";

export type DisplayStatus = "satisfied" | "in-progress" | "partial" | "missing";

export const REQ_STATUS_LABEL: Record<DisplayStatus, string> = {
  satisfied: "Satisfied",
  "in-progress": "In progress",
  partial: "Partly met",
  missing: "Missing",
};

export function displayStatus(result: Pick<RequirementResult, "status" | "assigned">, courses: StudentCourse[]): DisplayStatus {
  if (result.status !== "satisfied") return result.status;
  // A failed or withdrawn attempt (earnsCredit) isn't done: a planned retake keeps the row in progress.
  const done = new Set(courses.filter((c) => c.status === "completed" && earnsCredit(c)).map((c) => c.id));
  const planned = new Set(courses.filter((c) => c.status === "planned").map((c) => c.id));
  return result.assigned.some((id) => !done.has(id) && planned.has(id)) ? "in-progress" : "satisfied";
}

export function metText(satisfied: number, total: number, inProgress: number): string {
  return `${satisfied} of ${total} requirements met${inProgress > 0 ? ` · ${inProgress} in progress` : ""}`;
}
