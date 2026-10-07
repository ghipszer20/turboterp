import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { addDays, campusDate, campusMinutes, orderLibraries } from "@turboterp/campus-data";
import { LibraryIcon, RoomIcon } from "@/components/icons";
import { Notice, Page, Section, SkeletonCard, SourceError, Tile, TileGrid } from "@/components/ui";
import { getLibraryHours, safe } from "@/lib/campus";
import { compactLibraryName } from "@/lib/libraries";
import { hoursStatus } from "@/lib/status";

export const metadata: Metadata = { title: "Libraries" };

export default function LibrariesPage() {
  return (
    <Page title="Libraries" subtitle="Campus">
      <TileGrid>
        <Tile href="/campus/rooms" icon={<RoomIcon />} area="study" title="Study rooms" sub="Find an open room and book it" accent />
      </TileGrid>
      <Suspense fallback={<SkeletonCard rows={6} />}>
        <LibraryList />
      </Suspense>
      <Notice>
        Hours from UMD Libraries.
      </Notice>
    </Page>
  );
}

async function LibraryList() {
  await connection();
  const today = campusDate();
  const tomorrow = addDays(today, 1);
  const minutes = campusMinutes();
  const res = await safe(getLibraryHours);
  if (!res.ok) return <SourceError source="UMD Libraries" />;

  const groups = [
    { title: "Libraries", items: orderLibraries(res.data.filter((l) => l.kind === "library")) },
    { title: "Collections & spaces", items: res.data.filter((l) => l.kind === "department") },
  ];

  return groups.map((g) =>
    g.items.length === 0 ? null : (
      <Section key={g.title} title={g.title}>
        <TileGrid>
          {g.items.map((lib) => {
            const s = hoursStatus(lib.days[today], minutes, lib.days[tomorrow]);
            return (
              <Tile
                key={lib.id}
                href={lib.url}
                external
                icon={<LibraryIcon />}
                area="study"
                title={compactLibraryName(lib.name)}
                sub={s.text}
                status={s.status}
              />
            );
          })}
        </TileGrid>
      </Section>
    ),
  );
}
