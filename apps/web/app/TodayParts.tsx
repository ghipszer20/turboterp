"use client";

// Today's time-dependent parts. The page is cached and shared by every visitor, so the date, the
// current meal and "open until" are worked out here from the browser's clock.

import {
  addDays,
  DINING_HALLS,
  orderLibraries,
  recWellOnDate,
  type AcademicEvent,
  type LibraryHours,
  type RecWellArea,
  type StampVenue,
} from "@turboterp/campus-data";
import { DiningIcon, GymIcon, LibraryIcon, RoomIcon, SearchIcon } from "@/components/icons";
import { NextClassHero, type UpNext } from "@/app/NextClassHero";
import { HeroRow, SkeletonCard, Tile, TileGrid } from "@/components/ui";
import { pickDay } from "@/lib/campus-clock";
import type { DiningBundle } from "@/lib/campus-bundles";
import { eventTitle, formatEventDate, nextEvent } from "@/lib/calendar";
import { stampSummary } from "@/lib/stamp";
import { gymRowTitle, MAIN_GYMS } from "@/lib/gyms";
import { compactLibraryName, MAIN_LIBRARIES } from "@/lib/libraries";
import { currentMealName, hoursStatus, mealFoods } from "@/lib/status";
import { useCampusClock } from "@/lib/useCampusClock";

function SkeletonGrid() {
  return (
    <TileGrid>
      {Array.from({ length: 4 }, (_, i) => (
        <SkeletonCard key={i} rows={2} />
      ))}
    </TileGrid>
  );
}

export function TodayDate() {
  const clock = useCampusClock();
  if (!clock) return null;
  // Noon avoids a day shift: the campus date is a calendar day, not an instant.
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" }).format(
    new Date(`${clock.today}T12:00:00Z`),
  );
}

export function Hero({ events }: { events: AcademicEvent[] | null }) {
  const clock = useCampusClock();
  if (!clock) return <SkeletonCard rows={2} />;
  const event = events ? nextEvent(events, clock.today) : undefined;
  const upNext: UpNext | null = event ? { title: eventTitle(event), sub: formatEventDate(event) } : null;
  return (
    <HeroRow>
      <NextClassHero upNext={upNext} />
    </HeroRow>
  );
}

export function DiningTiles({ bundle, stamp }: { bundle: DiningBundle; stamp: StampVenue[] | null }) {
  const clock = useCampusClock();
  if (!clock) return <SkeletonGrid />;
  const menus = pickDay(bundle.days, clock.today)?.value ?? [];
  const meal = currentMealName(clock.minutes);
  return (
    <TileGrid row>
      {DINING_HALLS.map((hall, i) => {
        const r = menus[i];
        const m = r?.ok ? (r.data.meals.find((x) => x.name === meal) ?? r.data.meals[0]) : undefined;
        return (
          <Tile
            key={hall.id}
            href={`/campus/dining?hall=${hall.id}`}
            icon={<DiningIcon />}
            area="dining"
            title={hall.short}
            sub={!r?.ok ? "Menu unavailable" : m ? mealFoods(m) : "No menu posted today"}
          />
        );
      })}
      {stamp && (
        <Tile
          href="/campus/dining"
          icon={<DiningIcon />}
          area="dining"
          title="Stamp"
          sub={stampSummary(stamp, clock.today, clock.minutes)}
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

export function LibraryTiles({ libraries }: { libraries: LibraryHours[] | null }) {
  const clock = useCampusClock();
  if (!clock) return <SkeletonGrid />;
  const { today, minutes } = clock;
  // The three main libraries (owner-approved mock); "All hours" lists the rest.
  const libs = libraries ? pickMain(orderLibraries(libraries.filter((l) => l.kind === "library")), MAIN_LIBRARIES, (l) => l.name) : [];
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

export function GymTiles({ areas }: { areas: RecWellArea[] | null }) {
  const clock = useCampusClock();
  if (!clock) return <SkeletonGrid />;
  const { today, minutes } = clock;
  const buildings = areas ? pickMain(recWellOnDate(areas, today), MAIN_GYMS, (a) => `${a.group} | ${a.name}`) : [];
  return (
    <TileGrid>
      {buildings.length === 0 ? (
        <Tile href="/campus/gym" icon={<GymIcon />} area="fitness" title="Fitness" sub="See today's hours" />
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

function pickMain<T>(items: T[], patterns: RegExp[], key: (item: T) => string, count = 3): T[] {
  const picked = patterns.flatMap((p) => items.filter((i) => p.test(key(i))).slice(0, 1));
  return picked.length > 0 ? picked.slice(0, count) : items.slice(0, count);
}
