"use client";

import { useEffect, useState } from "react";
import { campusMinutes } from "@turboterp/campus-data/dates";

/**
 * Minutes after midnight in campus time, ticking every 30 seconds.
 * Starts from the server's value so the first render matches (no hydration flash).
 */
export function useCampusMinutes(initial: number): number {
  const [minutes, setMinutes] = useState(initial);
  useEffect(() => {
    const tick = () => setMinutes(campusMinutes());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return minutes;
}
