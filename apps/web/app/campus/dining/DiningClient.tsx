"use client";

// The dining page's browser half. The page is cached and shared by every visitor, so the date, the
// current meal, the hall/search choice in the URL and "open now" are all worked out here.

import { useSearchParams } from "next/navigation";
import { DINING_HALLS, type StampVenue } from "@turboterp/campus-data";
import { LiveStatus } from "@/components/LiveStatus";
import { Card, Row, Section, SkeletonCard } from "@/components/ui";
import { pickDay } from "@turboterp/app-core/campus-clock";
import type { DiningBundle } from "@/lib/campus-bundles";
import { diningSlice, hallFromQuery, mealFromQuery, mealsServed, parseDiningQuery } from "@/lib/dining";
import { OTHER_STAMP_VENUES } from "@turboterp/app-core/stamp";
import { currentMealName, hoursLabel } from "@turboterp/app-core/status";
import { useCampusClock } from "@/lib/useCampusClock";
import { DiningView } from "./DiningView";

// One hall's current meal ships with the page: the hall a link asked for (?hall=16, from Today's
// rows), else the first. Other halls and meals load from /api/dining when tapped.
export function Menus({ bundle }: { bundle: DiningBundle }) {
  const clock = useCampusClock();
  const params = useSearchParams();
  if (!clock) return <SkeletonCard rows={8} />;

  const query = parseDiningQuery(params.get("q") ?? undefined);
  const asked = hallFromQuery(params.get("hall") ?? undefined, DINING_HALLS.map((h) => h.id));
  const index = Math.max(0, DINING_HALLS.findIndex((h) => h.id === asked));
  const picked = pickDay(bundle.days, clock.today);
  const results = picked?.value ?? DINING_HALLS.map(() => ({ ok: false as const, error: "No menu" }));
  const preferredMeal = currentMealName(clock.minutes);
  const halls = DINING_HALLS.map((h, i) => {
    const r = results[i]!;
    return { id: h.id, name: h.short, meals: r.ok ? r.data.meals.map((m) => m.name) : null };
  });
  const searchMeal = mealFromQuery(params.get("meal") ?? undefined, mealsServed(results.map((r) => (r.ok ? r.data : null))));
  const first = results[index]!;
  const initial = { hallId: DINING_HALLS[index]!.id, ...diningSlice(first.ok ? first.data : null, preferredMeal) };
  return (
    <DiningView
      date={clock.today}
      halls={halls}
      initial={initial}
      preferredMeal={preferredMeal}
      query={query}
      searchHallId={asked}
      searchMeal={searchMeal}
    />
  );
}

// Food places in the Stamp Student Union, with today's hours from UMD Dining Services.
export function StampSection({ venues }: { venues: StampVenue[] }) {
  const clock = useCampusClock();
  if (!clock) return <SkeletonCard rows={4} />;
  const { today, tomorrow, minutes } = clock;
  return (
    <Section title="Stamp Student Union">
      <Card>
        {venues.map((v) => (
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
