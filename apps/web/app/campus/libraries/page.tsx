import type { Metadata } from "next";
import { Suspense } from "react";
import { RoomIcon } from "@/components/icons";
import { Notice, Page, SkeletonCard, SourceError, Tile, TileGrid } from "@/components/ui";
import { getLibraryHours, safe } from "@/lib/campus";
import { LibraryList } from "./LibraryList";

export const metadata: Metadata = { title: "Libraries" };

export default function LibrariesPage() {
  return (
    <Page title="Libraries" subtitle="Campus">
      <TileGrid>
        <Tile href="/campus/rooms" icon={<RoomIcon />} area="study" title="Study rooms" sub="Find an open room and book it" accent />
      </TileGrid>
      <Suspense fallback={<SkeletonCard rows={6} />}>
        <Libraries />
      </Suspense>
      <Notice>
        Hours from UMD Libraries.
      </Notice>
    </Page>
  );
}

// Cached with the page; open/closed is worked out in the browser (LibraryList).
async function Libraries() {
  const res = await safe(getLibraryHours);
  if (!res.ok) return <SourceError source="UMD Libraries" />;
  return <LibraryList libraries={res.data} />;
}
