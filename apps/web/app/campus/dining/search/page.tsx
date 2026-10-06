import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { campusDate, DINING_HALLS } from "@turboterp/campus-data";
import { Notice, Page, SkeletonCard } from "@/components/ui";
import { getAllDiningMenus } from "@/lib/campus";
import { mealsServed } from "@/lib/dining";
import { FoodSearch } from "./FoodSearch";

export const metadata: Metadata = { title: "Find a food" };

// Today's "Find a food" tile lands here: search every hall's menu for today, or one hall and one meal.
export default function FoodSearchPage() {
  return (
    <Page title="Find a food" subtitle="Dining">
      <Suspense fallback={<SkeletonCard rows={3} />}>
        <Search />
      </Suspense>
      <Notice>Menus from UMD Dining (nutrition.umd.edu) and can change.</Notice>
    </Page>
  );
}

async function Search() {
  await connection();
  const today = campusDate();
  const menus = (await getAllDiningMenus(today)).map((m) => (m.ok ? m.data : null));
  return <FoodSearch date={today} halls={DINING_HALLS.map((h) => ({ id: h.id, name: h.short }))} meals={mealsServed(menus)} />;
}
