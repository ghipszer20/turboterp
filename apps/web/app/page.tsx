import { Suspense } from "react";
import Link from "next/link";
import { SeatAlertsCard } from "@/app/SeatAlertsCard";
import { DiningTiles, GymTiles, Hero, LibraryTiles, TodayDate } from "@/app/TodayParts";
import { Page, Section, SkeletonCard, TileGrid } from "@/components/ui";
import { getAcademicCalendar, getLibraryHours, getRecWellAreas, getStampVenues, safe } from "@/lib/campus";
import { getDiningBundle } from "@/lib/campus-bundles";

// Cached: no per-visit render. The data below comes from cached snapshots (rebuilt when the refresh
// job revalidates them); the date, current meal and open/closed are worked out in the browser (TodayParts).
export default function TodayPage() {
  return (
    <Page title="Today" subtitle={<TodayDate />}>
      <SeatAlertsCard />
      <Suspense fallback={<SkeletonCard rows={2} />}>
        <CalendarHero />
      </Suspense>
      <Section
        title="Dining"
        action={
          <Link href="/campus/dining" style={sectionLink}>
            All menus
          </Link>
        }
      >
        <Suspense fallback={<SkeletonGrid />}>
          <Dining />
        </Suspense>
      </Section>
      <Section title="Study">
        <Suspense fallback={<SkeletonGrid />}>
          <Libraries />
        </Suspense>
      </Section>
      <Section title="Fitness">
        <Suspense fallback={<SkeletonGrid />}>
          <Gyms />
        </Suspense>
      </Section>
    </Page>
  );
}

const sectionLink = { color: "var(--accent)", font: "var(--t-sub)", textDecoration: "none" } as const;

function SkeletonGrid() {
  return (
    <TileGrid>
      {Array.from({ length: 4 }, (_, i) => (
        <SkeletonCard key={i} rows={2} />
      ))}
    </TileGrid>
  );
}

async function CalendarHero() {
  const res = await safe(getAcademicCalendar);
  return <Hero events={res.ok ? res.data : null} />;
}

async function Dining() {
  const [bundle, stamp] = await Promise.all([getDiningBundle(), safe(getStampVenues)]);
  return <DiningTiles bundle={bundle} stamp={stamp.ok ? stamp.data : null} />;
}

async function Libraries() {
  const res = await safe(getLibraryHours);
  return <LibraryTiles libraries={res.ok ? res.data : null} />;
}

async function Gyms() {
  const res = await safe(getRecWellAreas);
  return <GymTiles areas={res.ok ? res.data : null} />;
}
