import type { Metadata } from "next";
import { Suspense } from "react";
import { roomBookingUrl } from "@turboterp/campus-data";
import { Notice, Page, SkeletonCard, SourceError } from "@/components/ui";
import { safe } from "@/lib/campus";
import { getStudyRoomsToday } from "@/lib/campus-bundles";
import { shortLibraryName } from "@/lib/rooms";
import { RoomsView, type RoomRow } from "./RoomsView";
import { UpdatedAgeText } from "./UpdatedAgeText";

export const metadata: Metadata = { title: "Study Rooms" };

export default function RoomsPage() {
  return (
    <Page title="Study Rooms" subtitle="Libraries">
      <Suspense fallback={<SkeletonCard rows={8} />}>
        <Rooms />
      </Suspense>
      <Notice>
        Availability from UMD Libraries&apos; booking system, refreshed every half hour
        <Suspense fallback={null}>
          <UpdatedAge />
        </Suspense>
        . You book on the Libraries&apos;
        site with your UMD email; TurboTerp never books for you.
      </Notice>
    </Page>
  );
}

// Cached with the page and rebuilt when the refresh job writes new availability; "now" is the browser's.
async function Rooms() {
  const res = await safe(getStudyRoomsToday);
  if (!res.ok) return <SourceError source="UMD Libraries" />;

  const { catalog, rooms, failed } = res.data;
  const rows: RoomRow[] = rooms.map((room) => ({
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    library: catalog.locations.find((l) => l.id === room.locationId)?.name ?? "",
    locationId: room.locationId,
    category: room.categoryName,
    // Built from the room's own id, not the snapshotted bookingUrl; the
    // view fills {date} with the day the student is looking at.
    bookingUrl: roomBookingUrl(room.id, "{date}"),
    open: room.open,
  }));

  return (
    <RoomsView
      rooms={rows}
      libraries={catalog.locations.map((l) => ({ id: l.id, name: shortLibraryName(l.name) }))}
      partial={failed > 0}
    />
  );
}

/** " (updated 3 min ago)" when the rooms come from a snapshot. */
async function UpdatedAge() {
  const res = await safe(getStudyRoomsToday);
  if (!res.ok || !res.data.updatedAt) return null;
  return <UpdatedAgeText updatedAt={res.data.updatedAt} />;
}
