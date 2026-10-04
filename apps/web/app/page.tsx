import { Suspense } from "react";
import { connection } from "next/server";
import { addDays, campusDate, campusMinutes, DINING_HALLS, orderLibraries, recWellOnDate } from "@turboterp/campus-data";
import { BusIcon, DiningIcon, GymIcon, LibraryIcon, RoomIcon } from "@/components/icons";
import { RegistrationCountdown } from "@/app/RegistrationCountdown";
import { LiveStatus } from "@/components/LiveStatus";
import { Card, IconTile, Page, Row, Section, SkeletonCard } from "@/components/ui";
import { getAcademicCalendar, getAllDiningMenus, getLibraryHours, getRecWellAreas, getRoutesOn, getStampVenues, safe } from "@/lib/campus";
import { stampSummary } from "@/lib/stamp";
import { eventTitle, formatEventDate, upcomingDates } from "@/lib/calendar";
import { gymRowTitle, MAIN_GYMS } from "@/lib/gyms";
import { compactLibraryName } from "@/lib/libraries";
import { currentMealName, mealHighlights } from "@/lib/status";

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
      <SkeletonCard rows={3} />
      <Section>
        <SkeletonCard rows={4} />
      </Section>
    </Page>
  );
}

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
      <RegistrationCountdown />
      <Section title="Dining">
        <Suspense fallback={<SkeletonCard rows={3} />}>
          <Dining today={today} minutes={minutes} />
        </Suspense>
      </Section>
      <Section title="Study">
        <Suspense fallback={<SkeletonCard rows={3} />}>
          <Libraries today={today} minutes={minutes} />
        </Suspense>
      </Section>
      <Section title="Work out">
        <Suspense fallback={<SkeletonCard rows={2} />}>
          <Gyms today={today} minutes={minutes} />
        </Suspense>
      </Section>
      <Section title="Get around">
        <Suspense fallback={<SkeletonCard rows={1} />}>
          <Buses today={today} />
        </Suspense>
      </Section>
      <Suspense fallback={null}>
        <UpcomingDates today={today} />
      </Suspense>
    </Page>
  );
}

async function Dining({ today, minutes }: { today: string; minutes: number }) {
  const [menus, stamp] = await Promise.all([getAllDiningMenus(today), safe(getStampVenues)]);
  const meal = currentMealName(minutes);
  return (
    <Card>
      {DINING_HALLS.map((hall, i) => {
        const r = menus[i]!;
        const m = r.ok ? (r.data.meals.find((x) => x.name === meal) ?? r.data.meals[0]) : undefined;
        return (
          <Row
            key={hall.id}
            href={`/campus/dining?hall=${hall.id}`}
            leading={
              <IconTile>
                <DiningIcon />
              </IconTile>
            }
            title={hall.short}
            subtitle={!r.ok ? "Menu unavailable" : m ? `${m.name}: ${mealHighlights(m)}` : "No menu posted today"}
          />
        );
      })}
      {stamp.ok && (
        <Row
          href="/campus/dining"
          leading={
            <IconTile>
              <DiningIcon />
            </IconTile>
          }
          title="Stamp"
          subtitle={stampSummary(stamp.data, today, minutes)}
        />
      )}
    </Card>
  );
}

async function Libraries({ today, minutes }: { today: string; minutes: number }) {
  const res = await safe(getLibraryHours);
  const libs = res.ok ? orderLibraries(res.data.filter((l) => l.kind === "library")) : [];
  return (
    <Card>
      {libs.map((lib) => (
        <Row
          key={lib.id}
          href="/campus/libraries"
          leading={
            <IconTile tone="neutral">
              <LibraryIcon />
            </IconTile>
          }
          title={compactLibraryName(lib.name)}
          subtitle={<LiveStatus hours={lib.days[today]} tomorrow={lib.days[addDays(today, 1)]} initialMinutes={minutes} inline />}
        />
      ))}
      <Row
        href="/campus/rooms"
        leading={
          <IconTile>
            <RoomIcon />
          </IconTile>
        }
        title="Find a study room"
        subtitle="Open rooms at every library, right now"
      />
    </Card>
  );
}

async function Gyms({ today, minutes }: { today: string; minutes: number }) {
  const res = await safe(getRecWellAreas);
  const buildings = res.ok
    ? pickMain(recWellOnDate(res.data, today), MAIN_GYMS, (a) => `${a.group} | ${a.name}`)
    : [];
  return (
    <Card>
      {buildings.length === 0 ? (
        <Row href="/campus/gym" title="Gyms & Rec" subtitle="See today's hours" />
      ) : (
        buildings.map((b) => (
          <Row
            key={`${b.group}-${b.name}`}
            href="/campus/gym"
            leading={
              <IconTile tone="neutral">
                <GymIcon />
              </IconTile>
            }
            title={gymRowTitle(b.group, b.name)}
            subtitle={<LiveStatus hours={b.hours} initialMinutes={minutes} inline />}
          />
        ))
      )}
    </Card>
  );
}

async function Buses({ today }: { today: string }) {
  const res = await safe(() => getRoutesOn(today));
  const count = res.ok ? res.data.routes.length : null;
  return (
    <Card>
      <Row
        href="/campus/transport"
        leading={
          <IconTile>
            <BusIcon />
          </IconTile>
        }
        title="Shuttle-UM"
        subtitle={count === null ? "Departures near you" : `${count} routes running today · departures near you`}
      />
    </Card>
  );
}

async function UpcomingDates({ today }: { today: string }) {
  const res = await safe(getAcademicCalendar);
  const dates = res.ok ? upcomingDates(res.data, today) : [];
  if (dates.length === 0) return null;
  return (
    <Section title="Upcoming dates">
      <Card>
        {dates.map((e) => (
          <Row key={`${e.term}-${e.kind}-${e.start}`} title={eventTitle(e)} subtitle={`${formatEventDate(e)} · ${e.term}`} />
        ))}
      </Card>
    </Section>
  );
}

function pickMain<T>(items: T[], patterns: RegExp[], key: (item: T) => string, count = 3): T[] {
  const picked = patterns.flatMap((p) => items.filter((i) => p.test(key(i))).slice(0, 1));
  return picked.length > 0 ? picked.slice(0, count) : items.slice(0, count);
}
