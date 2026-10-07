import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { campusDate, campusMinutes, roomBookingUrl } from "@turboterp/campus-data";
import { Notice, Page, SkeletonCard, SourceError } from "@/components/ui";
import { dataAge } from "@/lib/age";
import { getStudyRooms, safe } from "@/lib/campus";
import { shortLibraryName } from "@/lib/rooms";
import { RoomsView, type RoomRow } from "./RoomsView";

export const metadata: Metadata = { title: "Study Rooms" };

export default function RoomsPage() {
  return (
    <Page title="Study Rooms" subtitle="Libraries">
      <Suspense fallback={<SkeletonCard rows={8} />}>
        <Rooms />
      </Suspense>
      <Notice>
        Availability from UMD Libraries&apos; booking system, refreshed every few minutes
        <Suspense fallback={null}>
          <UpdatedAge />
        </Suspense>
        . You book on the Libraries&apos;
        site with your UMD email; TurboTerp never books for you.
      </Notice>
    </Page>
  );
}

async function Rooms() {
  await connection();
  const today = campusDate();
  const res = await safe(() => getStudyRooms(today));
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
      today={today}
      initialMinutes={campusMinutes()}
      partial={failed > 0}
    />
  );
}

/** " (updated 3 min ago)" when the rooms come from a snapshot. */
async function UpdatedAge() {
  await connection();
  const res = await safe(() => getStudyRooms(campusDate()));
  if (!res.ok || !res.data.updatedAt) return null;
  return ` (${dataAge(res.data.updatedAt, new Date())})`;
}
