import type { Metadata } from "next";
import { Suspense } from "react";
import { Notice, Page, SkeletonCard } from "@/components/ui";
import { getDiningBundle } from "@/lib/campus-bundles";
import { FoodSearchLoader } from "./FoodSearchLoader";

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
  return <FoodSearchLoader bundle={await getDiningBundle()} />;
}
