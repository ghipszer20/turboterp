"use client";

import { dataAge } from "@turboterp/app-core/age";
import { useCampusClock } from "@/lib/useCampusClock";

/** " (updated 3 min ago)", measured by the browser's clock so the cached page doesn't go stale. */
export function UpdatedAgeText({ updatedAt }: { updatedAt: string }) {
  const clock = useCampusClock();
  if (!clock) return null;
  return <> ({dataAge(updatedAt, new Date())})</>;
}
