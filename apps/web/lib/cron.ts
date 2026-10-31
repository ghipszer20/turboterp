import { createHash, timingSafeEqual } from "node:crypto";

export type CronAuth = "ok" | "unauthorized" | "not-configured";

const digest = (s: string) => createHash("sha256").update(s).digest();

/** Checks a cron request's Authorization header against the shared secret, in constant time. */
export function authorizeCron(authorizationHeader: string | null, secret: string | undefined): CronAuth {
  if (!secret) return "not-configured";
  // Hashing first makes both buffers the same length, so length can't leak.
  const given = digest(authorizationHeader ?? "");
  const wanted = digest(`Bearer ${secret}`);
  return timingSafeEqual(given, wanted) ? "ok" : "unauthorized";
}

// soc-seats and seat-alerts are not here on purpose: they run as Supabase Edge Functions (supabase/functions), since
// Vercel bills CPU and provisioned memory for them. Never add them back (docs/project/scaling-plan.md 4.2).
const JOBS = ["fast", "dining", "daily", "soc-sections", "soc-courses"] as const;
export type CronJob = (typeof JOBS)[number];

export function cronJob(name: string): CronJob | null {
  return (JOBS as readonly string[]).includes(name) ? (name as CronJob) : null;
}
