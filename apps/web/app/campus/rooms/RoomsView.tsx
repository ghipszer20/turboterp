"use client";

import { useMemo, useState } from "react";
import { formatMinutes } from "@turboterp/campus-data/hours";
import { Chip, Segmented } from "@/components/Segmented";
import { RoomIcon } from "@/components/icons";
import { Card, EmptyState, Section, Tile, TileGrid } from "@/components/ui";
import { roomFitsSize } from "@/lib/rooms";
import { useCampusMinutes } from "@/lib/useCampusMinutes";
import styles from "./rooms.module.css";

export type RoomRow = {
  id: number;
  name: string;
  capacity: number | null;
  library: string;
  locationId: number;
  category: string;
  bookingUrl: string;
  open: { start: string; end: string }[];
};

const SIZES = [1, 2, 4, 6, 8] as const;

/** "2026-09-25 14:30:00" → minutes after midnight, relative to `today` (can exceed 1440). */
function toMinutes(stamp: string, today: string): number {
  const [date, time] = stamp.split(" ");
  const [h, m] = time!.split(":").map(Number);
  const dayOffset = date === today ? 0 : Math.round((Date.parse(date!) - Date.parse(today)) / 86_400_000);
  return dayOffset * 1440 + h! * 60 + m!;
}

export function RoomsView({
  rooms,
  libraries,
  today,
  initialMinutes,
  partial,
}: {
  rooms: RoomRow[];
  libraries: { id: number; name: string }[];
  today: string;
  initialMinutes: number;
  partial: boolean;
}) {
  const now = useCampusMinutes(initialMinutes);
  const [library, setLibrary] = useState(0);
  const [size, setSize] = useState<number>(1);
  const [nowOnly, setNowOnly] = useState(false);

  const list = useMemo(() => {
    return rooms
      .filter((r) => (library === 0 || r.locationId === library) && roomFitsSize(r.capacity, size))
      .map((r) => {
        const windows = r.open
          .map((w) => ({ start: toMinutes(w.start, today), end: toMinutes(w.end, today) }))
          .filter((w) => w.end > now);
        const current = windows.find((w) => w.start <= now);
        const next = current ?? windows[0];
        return { ...r, current, next };
      })
      .filter((r) => r.next && (!nowOnly || r.current))
      .sort((a, b) => (a.current ? 0 : 1) - (b.current ? 0 : 1) || a.next!.start - b.next!.start);
  }, [rooms, library, size, nowOnly, now, today]);

  return (
    <>
      <div className={styles.controls}>
        <Segmented
          label="Library"
          options={[{ value: 0, label: "All" }, ...libraries.map((l) => ({ value: l.id, label: l.name }))]}
          value={library}
          onChange={setLibrary}
        />
        <div className={styles.chips}>
          <Chip pressed={nowOnly} onClick={() => setNowOnly(!nowOnly)}>
            Free now
          </Chip>
          {SIZES.map((s) => (
            <Chip key={s} pressed={size === s} onClick={() => setSize(s)}>
              {s === 1 ? "1 person" : `${s}+ people`}
            </Chip>
          ))}
        </div>
      </div>

      {partial ? <p className={styles.partial}>Some rooms couldn&apos;t be loaded right now.</p> : null}

      <Section>
        {list.length === 0 ? (
          <Card>
            <EmptyState title="No open rooms">Try another library, a smaller group, or later today.</EmptyState>
          </Card>
        ) : (
          <TileGrid>
            {list.map((r) => (
              <Tile
                key={r.id}
                href={r.bookingUrl}
                icon={<RoomIcon />}
                area="study"
                title={r.capacity ? `${r.name} · ${r.capacity} ${r.capacity === 1 ? "seat" : "seats"}` : r.name}
                sub={
                  r.current
                    ? `Free until ${formatMinutes(r.current.end)} · ${r.library}`
                    : `Free ${formatMinutes(r.next!.start)}–${formatMinutes(r.next!.end)} · ${r.library}`
                }
                status={r.current ? "open" : "closed"}
              />
            ))}
          </TileGrid>
        )}
      </Section>
    </>
  );
}
