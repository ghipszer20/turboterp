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

export function cronJob(name: string): "fast" | "daily" | null {
  return name === "fast" || name === "daily" ? name : null;
}
