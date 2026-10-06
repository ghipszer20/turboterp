"use client";

// "Leave by 9:42 to make CMSC351 in IRB": the student's next class today (from the schedule saved
// on this device) and the latest way to get there on time -- walking, or a Shuttle-UM bus.
// Owner rulings: "my location" only when the student taps it (never requested automatically);
// estimates are labeled; Shuttle-UM only. With no saved schedule or no class left today, nothing shows.

import { useEffect, useMemo, useState } from "react";
import { buildingByCode, type Building } from "@turboterp/campus-data/buildings";
import { campusDate, campusMinutes } from "@turboterp/campus-data/dates";
import { formatMinutes } from "@turboterp/campus-data/hours";
import type { ArriveByOption } from "@turboterp/campus-data/trip";
import { decodeDepartmentSections } from "@turboterp/course-data/schedule-files";
import type { Section } from "@turboterp/course-data/schedules";
import { LocationIcon } from "@/components/icons";
import { Card } from "@/components/ui";
import { nextClassToday, pickedForToday, weekdayOf } from "@/lib/schedule/leave-by";
import { parseSaved, SAVED_KEY } from "@/lib/schedule/saved";
import { useBuildings } from "@/lib/schedule/use-buildings";
import { searchBuildings } from "./TripPlanner";
import styles from "./trip.module.css";

const ORIGIN_KEY = "turboterp-leave-origin";

type Origin = { label: string; lat: number; lon: number };

function readOrigin(): Origin | null {
  try {
    const o = JSON.parse(localStorage.getItem(ORIGIN_KEY) ?? "null") as Origin | null;
    return o && typeof o.label === "string" && Number.isFinite(o.lat) && Number.isFinite(o.lon) ? o : null;
  } catch {
    return null;
  }
}

/** Sections the saved schedule picked, or null when there is no saved schedule. */
export async function loadPickedSections(): Promise<Section[] | null> {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(SAVED_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  const term = (JSON.parse(raw) as { term?: unknown }).term;
  if (typeof term !== "string") return null;
  const picks = pickedForToday(parseSaved(raw, term));
  const depts = [...new Set(Object.keys(picks).map((c) => c.slice(0, 4)))];
  if (depts.length === 0) return null;
  const files = await Promise.all(
    depts.map((d) =>
      fetch(`/api/schedule/${term}/sections/${d}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => (j ? decodeDepartmentSections(j).sections : []))
        .catch(() => [] as Section[]),
    ),
  );
  return files.flat().filter((s) => picks[s.courseId] === s.id);
}

export function LeaveByCard() {
  const buildings = useBuildings();
  const [sections, setSections] = useState<Section[] | null>(null);
  const [clock, setClock] = useState<{ day: ReturnType<typeof weekdayOf>; now: number; date: string } | null>(null);
  const [saved, setSaved] = useState<Origin | null>(null);
  const [myLocation, setMyLocation] = useState<Origin | null>(null);
  const [changing, setChanging] = useState(false);
  const [query, setQuery] = useState("");
  const [locError, setLocError] = useState<string | null>(null);
  const [result, setResult] = useState<{ key: string; option: ArriveByOption | null } | null>(null);

  useEffect(() => {
    loadPickedSections()
      .catch(() => null)
      .then((picked) => {
        const date = campusDate();
        setClock({ day: weekdayOf(date), now: campusMinutes(), date });
        setSaved(readOrigin());
        setSections(picked);
      });
  }, []);

  const next = useMemo(
    () => (sections && clock?.day ? nextClassToday(sections, clock.day, clock.now) : null),
    [sections, clock],
  );
  const dest: Building | undefined = next ? buildingByCode(buildings, next.building) : undefined;
  const previous = next?.before ? buildingByCode(buildings, next.before.building) : undefined;
  const origin: Origin | null = previous
    ? { label: previous.name, lat: previous.lat, lon: previous.lon }
    : (myLocation ?? saved);
  const chooseOrigin = !previous && (changing || !origin);

  const key = next && dest && origin ? `${next.courseId}|${next.start}|${dest.id}|${origin.lat},${origin.lon}` : null;
  useEffect(() => {
    if (!key || !next || !dest || !origin) return;
    let cancelled = false;
    const params = new URLSearchParams({
      fromLat: String(origin.lat),
      fromLon: String(origin.lon),
      fromLabel: origin.label,
      toLat: String(dest.lat),
      toLon: String(dest.lon),
      toLabel: dest.name,
      arriveBy: String(next.start),
    });
    fetch(`/api/buses/plan?${params}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: { options: ArriveByOption[] }) => !cancelled && setResult({ key, option: j.options[0] ?? null }))
      .catch(() => !cancelled && setResult({ key, option: null }));
    return () => {
      cancelled = true;
    };
    // `key` already reflects every input the request depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!next || !dest) return null;

  const pickOrigin = (b: Building) => {
    const o = { label: b.name, lat: b.lat, lon: b.lon };
    try {
      localStorage.setItem(ORIGIN_KEY, JSON.stringify(o));
    } catch {
      // Not remembered this time; still used for this visit.
    }
    setSaved(o);
    setMyLocation(null);
    setChanging(false);
    setQuery("");
  };

  const useMyLocation = () => {
    setLocError(null);
    if (!("geolocation" in navigator)) return setLocError("Location isn't available in this browser.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyLocation({ label: "My location", lat: pos.coords.latitude, lon: pos.coords.longitude });
        setChanging(false);
      },
      () => setLocError("Couldn't get your location. Search for a building instead."),
    );
  };

  const option = result && result.key === key ? result.option : null;
  const bus = option?.itinerary.legs.find((l) => l.kind === "bus");
  const walkMin = option?.itinerary.kind === "walk" ? option.itinerary.totalMinutes : null;
  const results = chooseOrigin ? searchBuildings(buildings, query) : [];
  const now = clock?.now ?? 0;

  return (
    <Card className={styles.card} clipNone>
      <p className={styles.title}>
        {option
          ? `${option.leaveMinutes <= now ? "Leave now" : `Leave by ${formatMinutes(option.leaveMinutes)}`} to make ${next.courseId} in ${next.building}`
          : `Next class: ${next.courseId} in ${next.building} at ${formatMinutes(next.start)}`}
      </p>
      {option ? (
        <p className={styles.leaveDetail}>
          {walkMin !== null
            ? `Walk from ${origin?.label}: about ${Math.round(walkMin)} min (estimate).`
            : bus && bus.kind === "bus"
              ? `Take ${bus.route.shortName} from ${bus.boardStopName} at ${formatMinutes(bus.departMinutes)}, get off at ${bus.alightStopName} (times are scheduled, not live). Walking legs are estimates.`
              : null}
          {option.leaveMinutes < now ? " You may be late." : ""}
        </p>
      ) : null}
      {chooseOrigin ? (
        <div className={styles.leaveOrigin}>
          <label className={styles.fieldLabel} htmlFor="leave-origin">
            Where are you coming from?
          </label>
          <div className={styles.fieldRow}>
            <input
              id="leave-origin"
              className={styles.input}
              type="text"
              placeholder="Search a building…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className={styles.iconButton} onClick={useMyLocation} aria-label="Use my location" title="Use my location">
              <LocationIcon size={16} />
            </button>
          </div>
          {results.length ? (
            <ul className={styles.leaveResults}>
              {results.map((b) => (
                <li key={b.id}>
                  <button type="button" onClick={() => pickOrigin(b)}>
                    {b.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {locError ? <p className={styles.hint}>{locError}</p> : null}
        </div>
      ) : !previous ? (
        <p className={styles.hint}>
          Starting from {origin?.label}.{" "}
          <button type="button" className={styles.linkButton} onClick={() => setChanging(true)}>
            Change
          </button>
        </p>
      ) : (
        <p className={styles.hint}>Starting from {previous.name}, where your {next.before?.courseId} class is.</p>
      )}
    </Card>
  );
}
