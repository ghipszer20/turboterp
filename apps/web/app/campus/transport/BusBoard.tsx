"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Route } from "@turboterp/campus-data";
import { formatMinutes } from "@turboterp/campus-data/hours";
import { LocationIcon } from "@/components/icons";
import { Card, EmptyState, Section } from "@/components/ui";
import { useCampusMinutes } from "@/lib/useCampusMinutes";
import styles from "./buses.module.css";

type Stop = { id: string; name: string; lat: number; lon: number };
type Departure = {
  tripId: string;
  route: string;
  routeName: string;
  color: string;
  textColor: string;
  headsign: string;
  minutes: number;
};
type Board = { stopId: string; departures: Departure[] }[];

function meters(aLat: number, aLon: number, bLat: number, bLon: number) {
  const rad = Math.PI / 180;
  const h =
    Math.sin(((bLat - aLat) * rad) / 2) ** 2 +
    Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(((bLon - aLon) * rad) / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

function walk(m: number) {
  return m < 1000 ? `${Math.round(m / 10) * 10} m away` : `${(m / 1609).toFixed(1)} mi away`;
}

export function BusBoard({ stops, routes, initialMinutes }: { stops: Stop[]; routes: Route[]; initialMinutes: number }) {
  const now = useCampusMinutes(initialMinutes);
  const [here, setHere] = useState<{ lat: number; lon: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [failed, setFailed] = useState(false);

  // Nearest stops if we know where you are; otherwise the busiest stops.
  const shown = useMemo(() => {
    if (picked) return stops.filter((s) => s.id === picked).map((s) => ({ ...s, distance: null as number | null }));
    const list = here
      ? stops.map((s) => ({ ...s, distance: meters(here.lat, here.lon, s.lat, s.lon) })).sort((a, b) => a.distance - b.distance)
      : stops.map((s) => ({ ...s, distance: null as number | null }));
    return list.slice(0, 3);
  }, [stops, here, picked]);

  const ids = shown.map((s) => s.id).join(",");

  const load = useCallback(async () => {
    if (!ids) return;
    try {
      const res = await fetch(`/api/buses/departures?stops=${encodeURIComponent(ids)}`);
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as { departures: Board };
      setBoard(json.departures);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [ids]);

  useEffect(() => {
    // Refresh once a minute; the countdowns tick in between.
    const first = setTimeout(load, 0);
    const id = setInterval(load, 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [load]);

  function locate() {
    if (!("geolocation" in navigator)) {
      setLocError("Location isn't available in this browser.");
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setHere({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setPicked(null);
        setLocating(false);
      },
      () => {
        setLocError("Couldn't get your location. You can search for a stop instead.");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  }

  const matches = query.trim()
    ? stops.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6)
    : [];

  return (
    <>
      <div className={styles.toolbar}>
        <button type="button" className={styles.locate} onClick={locate} disabled={locating}>
          <LocationIcon />
          {locating ? "Locating…" : here ? "Update location" : "Stops near me"}
        </button>
        <div className={styles.search}>
          <input
            type="search"
            placeholder="Search stops"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search stops"
          />
          {matches.length > 0 ? (
            <ul className={styles.results}>
              {matches.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setPicked(s.id);
                      setQuery("");
                    }}
                  >
                    {s.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      {locError ? <p className={styles.hint}>{locError}</p> : null}
      {!here && !picked ? <p className={styles.hint}>Showing the busiest stops. Tap “Stops near me” for yours.</p> : null}
      {picked ? (
        <button type="button" className={styles.clear} onClick={() => setPicked(null)}>
          ← Back to {here ? "nearby" : "busiest"} stops
        </button>
      ) : null}

      {shown.map((stop) => {
        const deps = board?.find((b) => b.stopId === stop.id)?.departures.filter((d) => d.minutes >= now) ?? null;
        return (
          <Section
            key={stop.id}
            title={stop.name}
            action={stop.distance !== null ? <span className={styles.distance}>{walk(stop.distance)}</span> : null}
          >
            <Card>
              {deps === null ? (
                failed ? (
                  <EmptyState title="Schedules unavailable">Try again in a minute.</EmptyState>
                ) : (
                  <div className={styles.loading}>Loading departures…</div>
                )
              ) : deps.length === 0 ? (
                <EmptyState title="No more buses today" />
              ) : (
                deps.map((d) => {
                  const inMin = d.minutes - now;
                  return (
                    <div key={`${d.tripId}-${d.minutes}`} className={styles.dep}>
                      <span className={styles.badge} style={{ background: d.color, color: d.textColor }}>
                        {d.route}
                      </span>
                      <span className={styles.depText}>
                        <span className={styles.depName}>{d.routeName}</span>
                        <span className={styles.depSub}>
                          {d.headsign ? `To ${d.headsign} · ` : ""}
                          {formatMinutes(d.minutes)} · Scheduled
                        </span>
                      </span>
                      <span className={styles.eta}>
                        {inMin <= 0 ? (
                          "Now"
                        ) : inMin < 60 ? (
                          <>
                            <strong>{inMin}</strong> min
                          </>
                        ) : (
                          formatMinutes(d.minutes)
                        )}
                      </span>
                    </div>
                  );
                })
              )}
            </Card>
          </Section>
        );
      })}

      <Section title="Running today">
        {routes.length === 0 ? (
          <Card>
            <EmptyState title="No Shuttle-UM service today" />
          </Card>
        ) : (
          <div className={styles.routes}>
            {routes.map((r) => (
              <span key={r.id} className={styles.routeChip}>
                <span className={styles.badge} style={{ background: r.color, color: r.textColor }}>
                  {r.shortName}
                </span>
                {r.longName}
              </span>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
