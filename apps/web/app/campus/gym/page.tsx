import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { campusDate, campusMinutes, recWellOnDate, type RecWellAreaToday } from "@turboterp/campus-data";
import { GymIcon } from "@/components/icons";
import { Notice, Page, Section, SkeletonCard, SourceError, SubHeading, Tile, TileGrid } from "@/components/ui";
import { ClassesSection } from "./ClassesSection";
import { ReserveSection } from "./ReserveSection";
import { getGroupFitness, getRecWellAreas, safe } from "@/lib/campus";
import { EPPLEY_SUBSECTION_FALLBACK, regroupEppleyAreas, type RegroupedArea } from "@/lib/gyms";
import { hoursStatus } from "@/lib/status";

export const metadata: Metadata = { title: "Fitness" };

export default function GymPage() {
  return (
    <Page title="Fitness" subtitle="Campus">
      <Suspense fallback={<SkeletonCard rows={6} />}>
        <GymList />
      </Suspense>
      <Section title="Classes">
        <Suspense fallback={<SkeletonCard rows={4} />}>
          <Classes />
        </Suspense>
      </Section>
      <Section title="Reserve">
        <ReserveSection />
      </Section>
      <Notice>
        Hours from UMD RecWell. Closures can happen on short notice; check{" "}
        <a href="https://recwell.umd.edu/facility-alerts" target="_blank" rel="noreferrer">
          facility alerts
        </a>
        .
      </Notice>
    </Page>
  );
}

async function Classes() {
  await connection();
  const res = await safe(getGroupFitness);
  if (!res.ok) return <SourceError source="RecWell group fitness" />;
  return <ClassesSection classes={res.data} todayIso={campusDate()} initialMinutes={campusMinutes()} />;
}

async function GymList() {
  await connection();
  const today = campusDate();
  const minutes = campusMinutes();
  const res = await safe(getRecWellAreas);
  if (!res.ok) return <SourceError source="RecWell" />;

  // Fold the Natatorium, Outdoor Aquatic Center, outdoor Climbing Wall and
  // Eppley Tennis & Pickleball Courts tabs into Eppley Recreation Center as
  // sub-sections (see apps/web/lib/gyms.ts) -- they're physically part of
  // the same ERC complex, and the ask was one Eppley tab, not five.
  const areas = regroupEppleyAreas(recWellOnDate(res.data, today));
  // Group by facility, keeping sheet order but putting Eppley first.
  const groups = new Map<string, RegroupedArea[]>();
  for (const a of areas) groups.set(a.group, [...(groups.get(a.group) ?? []), a]);
  const ordered = [...groups.entries()].sort(([a], [b]) => Number(b.startsWith("Eppley")) - Number(a.startsWith("Eppley")));

  return ordered.map(([group, items]) => {
    const base = items.filter((a) => !a.subsection);
    const bySubsection = new Map<string, RegroupedArea[]>();
    for (const a of items) {
      if (a.subsection) bySubsection.set(a.subsection, [...(bySubsection.get(a.subsection) ?? []), a]);
    }
    return (
      <Section key={group} title={group}>
        {base.length > 0 ? <TileGrid>{base.map((a) => areaRow(a, group, minutes))}</TileGrid> : null}
        {group === "Eppley Recreation Center"
          ? Object.entries(EPPLEY_SUBSECTION_FALLBACK).map(([label, fallback]) => {
              const subItems = bySubsection.get(label);
              return (
                <div key={label}>
                  <SubHeading>{label}</SubHeading>
                  <TileGrid>
                    {subItems && subItems.length > 0 ? (
                      subItems.map((a) => areaRow(a, group, minutes))
                    ) : (
                      // No hours for this sub-section in today's sheet -- don't invent them,
                      // just point to the official page.
                      <Tile href={fallback.url} icon={<GymIcon />} area="fitness" title={label} sub={fallback.description} />
                    )}
                  </TileGrid>
                </div>
              );
            })
          : null}
      </Section>
    );
  });
}

function areaRow(a: RecWellAreaToday, group: string, minutes: number) {
  const s = hoursStatus(a.hours, minutes, a.tomorrow);
  return (
    <Tile
      key={`${a.group}-${a.name}`}
      href={a.url ?? "https://recwell.umd.edu"}
      icon={<GymIcon />}
      area="fitness"
      title={a.name === group ? "Building" : a.name}
      sub={s.text}
      status={s.status}
    />
  );
}
