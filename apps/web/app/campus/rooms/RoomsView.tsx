"use client";

import { useMemo, useState } from "react";
import { formatMinutes } from "@turboterp/campus-data/hours";
import { Chip, Segmented } from "@/components/Segmented";
import { Card, EmptyState, Section, StatusPill } from "@/components/ui";
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
          <Card>
            {list.map((r) => (
              <div key={r.id} className={styles.room}>
                <div className={styles.roomText}>
                  <p className={styles.roomName}>
                    {r.name}
                    {r.capacity ? <span className={styles.cap}> · {r.capacity} {r.capacity === 1 ? "seat" : "seats"}</span> : null}
                  </p>
                  <p className={styles.roomSub}>
                    {r.library} · {r.category.replace(/^.*?Library\s*/i, "") || "Study space"}
                  </p>
                  <div className={styles.status}>
                    {r.current ? (
                      <StatusPill status="open">Free until {formatMinutes(r.current.end)}</StatusPill>
                    ) : (
                      <StatusPill status="closed">
                        Free {formatMinutes(r.next!.start)}–{formatMinutes(r.next!.end)}
                      </StatusPill>
                    )}
                  </div>
                </div>
                <a className={styles.book} href={r.bookingUrl} target="_blank" rel="noreferrer">
                  Book
                </a>
              </div>
            ))}
          </Card>
        )}
      </Section>
    </>
  );
}
