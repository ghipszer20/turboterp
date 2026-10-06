import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { addDays, campusDate, campusMinutes, DINING_HALLS } from "@turboterp/campus-data";
import { LiveStatus } from "@/components/LiveStatus";
import { Card, Notice, Page, Row, Section, SkeletonCard } from "@/components/ui";
import { getAllDiningMenus, getStampVenues, safe } from "@/lib/campus";
import { diningSlice, hallFromQuery, parseDiningQuery } from "@/lib/dining";
import { OTHER_STAMP_VENUES } from "@/lib/stamp";
import { currentMealName, hoursLabel } from "@/lib/status";
import { DiningView } from "./DiningView";

export const metadata: Metadata = { title: "Dining" };

export default function DiningPage({ searchParams }: { searchParams: Promise<{ hall?: string | string[]; q?: string | string[] }> }) {
  return (
    <Page title="Dining" subtitle="Campus">
      <Suspense fallback={<SkeletonCard rows={8} />}>
        <Menus searchParams={searchParams} />
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

// Food places in the Stamp Student Union, with today's hours from UMD Dining Services.
async function Stamp() {
  await connection();
  const today = campusDate();
  const tomorrow = addDays(today, 1);
  const minutes = campusMinutes();
  const res = await safe(getStampVenues);
  if (!res.ok) return null;
  return (
    <Section title="Stamp Student Union">
      <Card>
        {res.data.map((v) => (
          <Row
            key={v.id}
            title={v.name}
            subtitle={<LiveStatus hours={v.days[today]} tomorrow={v.days[tomorrow]} initialMinutes={minutes} inline />}
            trailing={hoursLabel(v.days[today], v.days[tomorrow])}
          />
        ))}
        {OTHER_STAMP_VENUES.map((name) => (
          <Row key={name} title={name} subtitle="Hours not published by UMD Dining" />
        ))}
      </Card>
    </Section>
  );
}

// One hall's current meal ships with the page: the hall a link asked for (?hall=16, from Today's
// rows), else the first. Other halls and meals load from /api/dining when tapped.
async function Menus({ searchParams }: { searchParams: Promise<{ hall?: string | string[]; q?: string | string[] }> }) {
  await connection();
  const params = await searchParams;
  const query = parseDiningQuery(params.q);
  const asked = hallFromQuery(params.hall, DINING_HALLS.map((h) => h.id));
  const index = Math.max(0, DINING_HALLS.findIndex((h) => h.id === asked));
  const today = campusDate();
  const preferredMeal = currentMealName(campusMinutes());
  const results = await getAllDiningMenus(today);
  const halls = DINING_HALLS.map((h, i) => {
    const r = results[i]!;
    return { id: h.id, name: h.short, meals: r.ok ? r.data.meals.map((m) => m.name) : null };
  });
  const first = results[index]!;
  const initial = { hallId: DINING_HALLS[index]!.id, ...diningSlice(first.ok ? first.data : null, preferredMeal) };
  return <DiningView date={today} halls={halls} initial={initial} preferredMeal={preferredMeal} query={query} />;
}
