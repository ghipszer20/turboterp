"use client";

import { useMemo, useState } from "react";
import { formatMinutes } from "@turboterp/campus-data/hours";
import { Chip, Segmented } from "@/components/Segmented";
import { RoomIcon } from "@/components/icons";
import { Card, EmptyState, Section, Tile, TileGrid } from "@/components/ui";
import {
  dayChoices,
  daysWithOpenRooms,
  pickWindow,
  roomFitsSize,
  roomTypeKey,
  roomTypes,
  timeOptions,
} from "@/lib/rooms";
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
  const [day, setDay] = useState(today);
  const [type, setType] = useState<string | null>(null);
  const [from, setFrom] = useState<number | null>(null);
  const [to, setTo] = useState<number | null>(null);

  const isToday = day === today;
  const days = useMemo(() => dayChoices(today), [today]);
  const openDays = useMemo(() => daysWithOpenRooms(rooms), [rooms]);
  const types = useMemo(() => roomTypes(rooms, library), [rooms, library]);
  const fromOptions = timeOptions(isToday ? now : null).filter((m) => m < 1440);
  const toOptions = timeOptions(isToday ? now : null).filter((m) => m > (from ?? -1));
  // A time picked on another day may now be in the past (back on Today).
  const lo = from !== null && isToday && !fromOptions.includes(from) ? null : from;
  const hi = to !== null && (!toOptions.includes(to) || (lo !== null && to <= lo)) ? null : to;

  const list = useMemo(() => {
    return rooms
      .filter(
        (r) =>
          (library === 0 || r.locationId === library) &&
          (type === null || roomTypeKey(r) === type) &&
          roomFitsSize(r.capacity, size),
      )
      .map((r) => ({ ...r, pick: pickWindow(r.open, { day, today, now, from: lo, to: hi }) }))
      .filter((r) => r.pick && (!nowOnly || !isToday || r.pick.current))
      .sort(
        (a, b) =>
          (a.pick!.current ? 0 : 1) - (b.pick!.current ? 0 : 1) || a.pick!.window.start - b.pick!.window.start,
      );
  }, [rooms, library, type, size, nowOnly, now, today, day, isToday, lo, hi]);

  return (
    <>
      <div className={styles.controls}>
        <div className={styles.chips} role="group" aria-label="Day">
          {days.map((d) => (
            <Chip key={d.date} pressed={day === d.date} disabled={!openDays.has(d.date)} onClick={() => setDay(d.date)}>
              {d.label}
            </Chip>
          ))}
        </div>
        <Segmented
          label="Library"
          options={[{ value: 0, label: "All" }, ...libraries.map((l) => ({ value: l.id, label: l.name }))]}
          value={library}
          onChange={(v) => {
            setLibrary(v);
            setType(null);
          }}
        />
        {types.length > 1 ? (
          <div className={styles.chips} role="group" aria-label="Room type">
            {types.map((t) => (
              <Chip key={t.key} pressed={type === t.key} onClick={() => setType(type === t.key ? null : t.key)}>
                {t.label}
              </Chip>
            ))}
          </div>
        ) : null}
        <div className={styles.times}>
          <label className={styles.time}>
            From
            <select value={lo ?? ""} onChange={(e) => setFrom(e.target.value === "" ? null : Number(e.target.value))}>
              <option value="">Any time</option>
              {fromOptions.map((m) => (
                <option key={m} value={m}>
                  {formatMinutes(m)}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.time}>
            To
            <select value={hi ?? ""} onChange={(e) => setTo(e.target.value === "" ? null : Number(e.target.value))}>
              <option value="">Any time</option>
              {toOptions.map((m) => (
                <option key={m} value={m}>
                  {formatMinutes(m)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.chips}>
          {isToday ? (
            <Chip pressed={nowOnly} onClick={() => setNowOnly(!nowOnly)}>
              Free now
            </Chip>
          ) : null}
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
            <EmptyState title="No open rooms">Try another day, library, room type or time, or a smaller group.</EmptyState>
          </Card>
        ) : (
          <TileGrid>
            {list.map((r) => (
              <Tile
                key={r.id}
                href={r.bookingUrl.replace("{date}", day)}
                external
                icon={<RoomIcon />}
                area="study"
                title={r.capacity ? `${r.name} · ${r.capacity} ${r.capacity === 1 ? "seat" : "seats"}` : r.name}
                sub={
                  r.pick!.current
                    ? `Free until ${formatMinutes(r.pick!.window.end)} · ${r.library}`
                    : `Free ${formatMinutes(r.pick!.window.start)}–${formatMinutes(r.pick!.window.end)} · ${r.library}`
                }
                status={r.pick!.current ? "open" : "closed"}
              />
            ))}
          </TileGrid>
        )}
      </Section>
    </>
  );
}
