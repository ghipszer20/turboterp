"use client";

// The buildings list (positions + Testudo codes) from the cached /api/campus/buildings, fetched
// at most once per page session. Empty until it arrives, or if it can't be loaded -- features
// that need it simply show nothing (unknown buildings mean "no walk time", never an error).

import { useEffect, useState } from "react";
import type { Building } from "@turboterp/campus-data/buildings";

let cached: Promise<Building[]> | null = null;

function loadBuildings(): Promise<Building[]> {
  cached ??= fetch("/api/campus/buildings")
    .then((res) => (res.ok ? (res.json() as Promise<Building[]>) : []))
    .catch(() => {
      cached = null;
      return [] as Building[];
    });
  return cached;
}

export function useBuildings(): Building[] {
  const [buildings, setBuildings] = useState<Building[]>([]);
  useEffect(() => {
    let live = true;
    loadBuildings().then((b) => {
      if (live) setBuildings(b);
    });
    return () => {
      live = false;
    };
  }, []);
  return buildings;
}
