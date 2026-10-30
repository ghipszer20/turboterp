import type { Metadata } from "next";
import { Suspense } from "react";
import { Notice, Page, SkeletonCard } from "@/components/ui";
import { getStampVenues, safe } from "@/lib/campus";
import { getDiningBundle } from "@/lib/campus-bundles";
import { Menus as MenusView, StampSection } from "./DiningClient";

export const metadata: Metadata = { title: "Dining" };

// Cached: no per-visit render. The browser picks the date, the meal and the ?hall= / ?q= choice (DiningClient).
export default function DiningPage() {
  return (
    <Page title="Dining" subtitle="Campus">
      <Suspense fallback={<SkeletonCard rows={8} />}>
        <Menus />
      </Suspense>
      <Suspense fallback={<SkeletonCard rows={4} />}>
        <Stamp />
      </Suspense>
      <Notice>
        Menus from UMD Dining (nutrition.umd.edu) and can change. Always check allergen labels at the station if you
        have an allergy. Tap an item for its full nutrition label.
      </Notice>
    </Page>
  );
}

async function Stamp() {
  const res = await safe(getStampVenues);
  if (!res.ok) return null;
  return <StampSection venues={res.data} />;
}

async function Menus() {
  return <MenusView bundle={await getDiningBundle()} />;
}
