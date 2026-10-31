"use client";

import { recWellOnDate, type RecWellArea, type RecWellAreaToday } from "@turboterp/campus-data";
import { GymIcon } from "@/components/icons";
import { Section, SkeletonCard, SubHeading, Tile, TileGrid } from "@/components/ui";
import { EPPLEY_SUBSECTION_FALLBACK, regroupEppleyAreas, type RegroupedArea } from "@/lib/gyms";
import { hoursStatus } from "@turboterp/app-core/status";
import { useCampusClock } from "@/lib/useCampusClock";

/** Facility hours with open/closed worked out by the browser's clock, so the page itself can be cached. */
export function GymList({ areas: all }: { areas: RecWellArea[] }) {
  const clock = useCampusClock();
  if (!clock) return <SkeletonCard rows={6} />;
  const { today, minutes } = clock;

  // Fold the Natatorium, Outdoor Aquatic Center, outdoor Climbing Wall and
  // Eppley Tennis & Pickleball Courts tabs into Eppley Recreation Center as
  // sub-sections (see apps/web/lib/gyms.ts) -- they're physically part of
  // the same ERC complex, and the ask was one Eppley tab, not five.
  const areas = regroupEppleyAreas(recWellOnDate(all, today));
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
