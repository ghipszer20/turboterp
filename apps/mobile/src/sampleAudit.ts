// The one real audit the spike runs everywhere: the CS major, complete plan (same as packages/audit's golden test).
import { auditProgram, type StudentCourse } from "@turboterp/audit";
import { cmscMajor } from "@turboterp/audit/programs/cmsc-major-2026-27.ts";

const c = (id: string, credits = 3): StudentCourse => ({ id, credits, status: "completed", grade: "B" });

export const samplePlan: StudentCourse[] = [
  c("MATH140", 4), c("MATH141", 4), c("CMSC131", 4), c("CMSC132", 4), c("CMSC216", 4), c("CMSC250", 4),
  c("CMSC330"), c("CMSC351"), c("STAT400"), c("MATH240", 4),
  c("CMSC412"), c("CMSC414"), c("CMSC421"), c("CMSC422"), c("CMSC451"),
  c("CMSC320"), c("CMSC433"),
  c("MATH310"), c("MATH401"), c("MATH403"), c("MATH410"),
];

/** Returns requirement id -> status. */
export async function runSampleAudit(): Promise<Record<string, string>> {
  const result = await auditProgram(cmscMajor, samplePlan);
  return Object.fromEntries(result.requirements.map((r) => [r.id, r.status]));
}
