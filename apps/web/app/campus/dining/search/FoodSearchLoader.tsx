"use client";

import { DINING_HALLS } from "@turboterp/campus-data";
import { SkeletonCard } from "@/components/ui";
import { pickDay } from "@turboterp/app-core/campus-clock";
import type { DiningBundle } from "@/lib/campus-bundles";
import { mealsServed } from "@/lib/dining";
import { useCampusClock } from "@/lib/useCampusClock";
import { FoodSearch } from "./FoodSearch";

/** Picks the menus for the browser's date, so the cached page stays right across midnight. */
export function FoodSearchLoader({ bundle }: { bundle: DiningBundle }) {
  const clock = useCampusClock();
  if (!clock) return <SkeletonCard rows={3} />;
  const picked = pickDay(bundle.days, clock.today);
  const menus = (picked?.value ?? []).map((m) => (m.ok ? m.data : null));
  return <FoodSearch date={clock.today} halls={DINING_HALLS.map((h) => ({ id: h.id, name: h.short }))} meals={mealsServed(menus)} />;
}
