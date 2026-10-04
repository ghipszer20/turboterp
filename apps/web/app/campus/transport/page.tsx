import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { campusDate, campusMinutes } from "@turboterp/campus-data";
import { Notice, Page, Section, SkeletonCard, SourceError } from "@/components/ui";
import { getBuildings, getBusStops, getCampusMap, getRoutesOn, safe } from "@/lib/campus";
import { feedExpiryNotice } from "@/lib/feed-expiry";
import { BusBoard } from "./BusBoard";
import { LeaveByCard } from "./LeaveByCard";
import { TransportMap } from "./TransportMap";

export const metadata: Metadata = { title: "Transport" };

export default function TransportPage() {
  return (
    <Page title="Transport" subtitle="Shuttle-UM">
      <LeaveByCard />
      <Section title="Map">
        <Suspense fallback={<SkeletonCard rows={1} />}>
          <MapSection />
        </Suspense>
      </Section>
      <Suspense fallback={<SkeletonCard rows={6} />}>
        <Board />
      </Suspense>
      <Notice>
        Times are from the published Shuttle-UM schedule, not live GPS. For live bus locations, use{" "}
        <a href="https://transitapp.com" target="_blank" rel="noreferrer">
          Transit
        </a>
        , UMD&apos;s official shuttle app.
      </Notice>
    </Page>
  );
}

async function MapSection() {
  await connection();
  const today = campusDate();
  const [map, buildings] = await Promise.all([safe(() => getCampusMap(today)), safe(() => getBuildings())]);
  if (!map.ok) return <SourceError source="Shuttle-UM" />;
  return (
    <TransportMap
      routes={map.data.routes}
      stops={map.data.stops}
      stopRoutes={map.data.stopRoutes}
      buildings={buildings.ok ? buildings.data : []}
    />
  );
}

async function Board() {
  await connection();
  const today = campusDate();
  const [stops, routes] = await Promise.all([safe(() => getBusStops(today)), safe(() => getRoutesOn(today))]);
  if (!stops.ok || !routes.ok) return <SourceError source="Shuttle-UM" />;
  const expiry = feedExpiryNotice(routes.data.validUntil, today);
  return (
    <>
      {expiry ? <Notice>{expiry}</Notice> : null}
      <BusBoard
        stops={stops.data.map(({ id, name, lat, lon }) => ({ id, name, lat, lon }))}
        routes={routes.data.routes}
        initialMinutes={campusMinutes()}
      />
    </>
  );
}
