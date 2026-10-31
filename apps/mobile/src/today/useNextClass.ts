import { useEffect, useMemo, useState } from "react";
import type { Building } from "@turboterp/campus-data";
import type { Section } from "@turboterp/course-data/schedules";
import { nextClass, type TodayClass } from "@turboterp/app-core/next-class";
import { apiHeaders, apiUrl, config } from "../config";
import { kvStore } from "../storage";
import { loadBuildings, loadPickedSections, walkBetween } from "./schedule";

async function getJson(path: string): Promise<unknown> {
  const res = await fetch(apiUrl(path), { headers: apiHeaders() });
  return res.ok ? res.json() : null;
}

/** The next class today from the schedule saved on this device, recomputed whenever `now` changes. */
export function useNextClass(now: Date): TodayClass | null {
  const [sections, setSections] = useState<Section[] | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  useEffect(() => {
    let live = true;
    loadPickedSections(kvStore, getJson)
      .catch(() => null)
      .then((s) => live && setSections(s));
    loadBuildings(config.apiBaseUrl, config.accessToken ?? undefined).then((b) => live && setBuildings(b));
    return () => {
      live = false;
    };
  }, []);
  return useMemo(() => (sections ? nextClass(sections, now, walkBetween(buildings)) : null), [sections, buildings, now]);
}
