"use client";

import { useEffect, useState } from "react";
import { clockAt, type CampusClock } from "@turboterp/app-core/campus-clock";

/**
 * Campus date and minutes from the browser's clock, ticking every 30 seconds.
 * Null until the page has mounted, so cached (prerendered) HTML and the first client render match.
 */
export function useCampusClock(): CampusClock | null {
  const [clock, setClock] = useState<CampusClock | null>(null);
  useEffect(() => {
    const tick = () => setClock(clockAt(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return clock;
}
