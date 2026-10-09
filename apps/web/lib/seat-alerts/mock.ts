// Development-only example watches for screenshots and local checks: /schedule/alerts?mock=1 (and
// /schedule?mock=1 for the bells) skips sign-in and the API. Inert in production builds unless
// NEXT_PUBLIC_TURBOTERP_SEED=1, like lib/advisor/seed.ts.

import { seedAllowed } from "@/lib/advisor/seed";
import type { WatchesResponse } from "./view";

export function mockAllowed(search: string): boolean {
  const env = { NODE_ENV: process.env.NODE_ENV, NEXT_PUBLIC_TURBOTERP_SEED: process.env.NEXT_PUBLIC_TURBOTERP_SEED };
  if (!seedAllowed(env)) return false;
  // The builder rewrites the query string, so remember the flag for this tab.
  try {
    if (new URLSearchParams(search).get("mock") === "1") sessionStorage.setItem("seat-alerts-mock", "1");
    return sessionStorage.getItem("seat-alerts-mock") === "1";
  } catch {
    return new URLSearchParams(search).get("mock") === "1";
  }
}

const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

export function mockWatches(): WatchesResponse {
  return {
    term: "202608",
    ended: 2,
    watches: [
      { id: "m1", term: "202608", courseId: "CMSC351", sectionId: "0201", lastAlertAt: null, doneAt: null, status: { open: 0, waitlist: 4, checkedAt: ago(1) } },
      { id: "m2", term: "202608", courseId: "MATH241", sectionId: null, lastAlertAt: ago(190), doneAt: null, status: { open: 0, waitlist: 11, checkedAt: ago(1) } },
      { id: "m3", term: "202608", courseId: "BMGT220", sectionId: "0103", lastAlertAt: ago(6), doneAt: null, status: { open: 1, waitlist: 0, checkedAt: ago(0) } },
    ],
    done: [{ id: "m4", term: "202608", courseId: "ENGL393", sectionId: "0101", lastAlertAt: ago(2900), doneAt: ago(2800), status: null }],
  };
}
