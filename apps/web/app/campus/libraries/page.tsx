import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { addDays, campusDate, campusMinutes, orderLibraries } from "@turboterp/campus-data";
import { LiveStatus } from "@/components/LiveStatus";
import { RoomIcon } from "@/components/icons";
import { Card, IconTile, Notice, Page, Row, Section, SkeletonCard, SourceError } from "@/components/ui";
import { getLibraryHours, safe } from "@/lib/campus";
import { compactLibraryName } from "@/lib/libraries";
import { hoursLabel } from "@/lib/status";

export const metadata: Metadata = { title: "Libraries" };

export default function LibrariesPage() {
  return (
    <Page title="Libraries" subtitle="Campus">
      <Card>
        <Row
          href="/campus/rooms"
          leading={
            <IconTile>
              <RoomIcon />
            </IconTile>
          }
          title="Study rooms"
          subtitle="Find an open room at any library and book it"
        />
      </Card>
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
        <Card>
          {g.items.map((lib) => (
            <Row
              key={lib.id}
              title={compactLibraryName(lib.name)}
              subtitle={<LiveStatus hours={lib.days[today]} tomorrow={lib.days[tomorrow]} initialMinutes={minutes} inline />}
              trailing={hoursLabel(lib.days[today], lib.days[tomorrow])}
              href={lib.url}
              external
            />
          ))}
        </Card>
      </Section>
    ),
  );
}
