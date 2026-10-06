import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { addDays, campusDate, campusMinutes, DINING_HALLS, orderLibraries, recWellOnDate } from "@turboterp/campus-data";
import { BusIcon, DiningIcon, GymIcon, LibraryIcon, RoomIcon, SearchIcon } from "@/components/icons";
import { NextClassHero, type UpNext } from "@/app/NextClassHero";
import { RegistrationCountdown } from "@/app/RegistrationCountdown";
import { HeroRow, Page, Section, SkeletonCard, Tile, TileGrid } from "@/components/ui";
import {
  getAcademicCalendar,
  getAllDiningMenus,
  getLibraryHours,
  getRecWellAreas,
  getRoutesOn,
  getStampVenues,
  safe,
} from "@/lib/campus";
import { eventTitle, formatEventDate, nextEvent } from "@/lib/calendar";
import { stampSummary } from "@/lib/stamp";
import { gymRowTitle, MAIN_GYMS } from "@/lib/gyms";
import { compactLibraryName, MAIN_LIBRARIES } from "@/lib/libraries";
import { currentMealName, hoursStatus, mealFoods } from "@/lib/status";

export default function TodayPage() {
  return (
    <Suspense fallback={<TodaySkeleton />}>
      <Today />
    </Suspense>
  );
}

function TodaySkeleton() {
  return (
    <Page title="Today">
      <SkeletonCard rows={2} />
      <Section>
        <TileGrid>
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonCard key={i} rows={2} />
          ))}
        </TileGrid>
      </Section>
    </Page>
  );
}

const sectionLink = { color: "var(--accent)", font: "var(--t-sub)", textDecoration: "none" } as const;

async function Today() {
  await connection();
  const now = new Date();
  const today = campusDate(now);
  const minutes = campusMinutes(now);
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now);

  return (
    <Page title="Today" subtitle={dateLabel}>
      <Suspense fallback={<SkeletonCard rows={2} />}>
        <Hero today={today} />
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
          <Dining today={today} minutes={minutes} />
        </Suspense>
      </Section>
      <Section title="Study">
        <Suspense fallback={<SkeletonGrid />}>
          <Libraries today={today} minutes={minutes} />
        </Suspense>
      </Section>
      <Section title="Fitness">
        <Suspense fallback={<SkeletonGrid />}>
          <Gyms today={today} minutes={minutes} />
        </Suspense>
      </Section>
      <Section title="Transport">
        <Suspense fallback={<SkeletonCard rows={1} />}>
          <Buses today={today} />
        </Suspense>
      </Section>
    </Page>
  );
}

function SkeletonGrid() {
  return (
    <TileGrid>
      {Array.from({ length: 4 }, (_, i) => (
        <SkeletonCard key={i} rows={2} />
      ))}
    </TileGrid>
  );
}

async function Hero({ today }: { today: string }) {
  const res = await safe(getAcademicCalendar);
  const event = res.ok ? nextEvent(res.data, today) : undefined;
  const upNext: UpNext | null = event ? { title: eventTitle(event), sub: formatEventDate(event) } : null;
  return (
    <HeroRow>
      <NextClassHero upNext={upNext} />
      <RegistrationCountdown />
    </HeroRow>
  );
}

async function Dining({ today, minutes }: { today: string; minutes: number }) {
  const [menus, stamp] = await Promise.all([getAllDiningMenus(today), safe(getStampVenues)]);
  const meal = currentMealName(minutes);
  return (
    <TileGrid row>
      {DINING_HALLS.map((hall, i) => {
        const r = menus[i]!;
        const m = r.ok ? (r.data.meals.find((x) => x.name === meal) ?? r.data.meals[0]) : undefined;
        return (
          <Tile
            key={hall.id}
            href={`/campus/dining?hall=${hall.id}`}
            icon={<DiningIcon />}
            area="dining"
            title={hall.short}
            sub={!r.ok ? "Menu unavailable" : m ? mealFoods(m) : "No menu posted today"}
          />
        );
      })}
      {stamp.ok && (
        <Tile
          href="/campus/dining"
          icon={<DiningIcon />}
          area="dining"
          title="Stamp"
          sub={stampSummary(stamp.data, today, minutes)}
        />
      )}
      <Tile
        href="/campus/dining/search"
        icon={<SearchIcon />}
        area="dining"
        title="Find a food"
        sub="Search every hall by meal"
        accent
      />
    </TileGrid>
  );
}

async function Libraries({ today, minutes }: { today: string; minutes: number }) {
  const res = await safe(getLibraryHours);
  // The three main libraries (owner-approved mock); "All hours" lists the rest.
  const libs = res.ok ? pickMain(orderLibraries(res.data.filter((l) => l.kind === "library")), MAIN_LIBRARIES, (l) => l.name) : [];
  return (
    <TileGrid>
      {libs.map((lib) => {
        const s = hoursStatus(lib.days[today], minutes, lib.days[addDays(today, 1)]);
        return (
          <Tile
            key={lib.id}
            href="/campus/libraries"
            icon={<LibraryIcon />}
            area="study"
            title={compactLibraryName(lib.name)}
            sub={s.text}
            status={s.status}
          />
        );
      })}
      <Tile
        href="/campus/rooms"
        icon={<RoomIcon />}
        area="study"
        title="Find a study room"
        sub="Open rooms at every library"
        accent
      />
    </TileGrid>
  );
}

async function Gyms({ today, minutes }: { today: string; minutes: number }) {
  const res = await safe(getRecWellAreas);
  const buildings = res.ok
    ? pickMain(recWellOnDate(res.data, today), MAIN_GYMS, (a) => `${a.group} | ${a.name}`)
    : [];
  return (
    <TileGrid>
      {buildings.length === 0 ? (
        <Tile href="/campus/gym" icon={<GymIcon />} area="fitness" title="Gyms & Rec" sub="See today's hours" />
      ) : (
        buildings.map((b) => {
          const s = hoursStatus(b.hours, minutes, b.tomorrow);
          return (
            <Tile
              key={`${b.group}-${b.name}`}
              href="/campus/gym"
              icon={<GymIcon />}
              area="fitness"
              title={gymRowTitle(b.group, b.name)}
              sub={s.text}
              status={s.status}
            />
          );
        })
      )}
    </TileGrid>
  );
}

async function Buses({ today }: { today: string }) {
  const res = await safe(() => getRoutesOn(today));
  const count = res.ok ? res.data.routes.length : null;
  return (
    <Tile
      wide
      href="/campus/transport"
      icon={<BusIcon />}
      area="transport"
      title="Shuttle-UM"
      sub={count === null ? "Departures near you" : `${count} routes running today · departures near you`}
    />
  );
}

function pickMain<T>(items: T[], patterns: RegExp[], key: (item: T) => string, count = 3): T[] {
  const picked = patterns.flatMap((p) => items.filter((i) => p.test(key(i))).slice(0, 1));
  return picked.length > 0 ? picked.slice(0, count) : items.slice(0, count);
}
