"use client";

// MapLibre is heavy and touches `window`/WebGL, so it's loaded only in the
// browser (dynamic import, ssr: false) and only on this page -- it must
// never end up in another route's bundle.
//
// This file owns the trip-planner state (the card and the map both need it, and MapView is
// loaded dynamically) -- see TripPlanner.tsx for the card UI and MapView.tsx for how a selected
// itinerary gets drawn.

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import type { Itinerary, Place } from "@turboterp/campus-data";
import { Card } from "@/components/ui";
import styles from "./map.module.css";
import { emptyField, TripPlanner, type Building, type PickMode } from "./TripPlanner";

export type MapRoute = {
  id: string;
  shortName: string;
  longName: string;
  color: string;
  textColor: string;
  /** One or more disconnected lines (e.g. each direction), as [lon, lat] pairs. */
  lines: [number, number][][];
  stopIds: string[];
};
export type MapStop = { id: string; name: string; lat: number; lon: number };

const MapView = dynamic(() => import("./MapView").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => (
    <Card className={styles.mapCard}>
      <div className={styles.mapLoading}>Loading map…</div>
    </Card>
  ),
});

type FieldState = { text: string; place: Place | null };
// Tagged with the from/to pair it was fetched for, the same way MapView tags `board` with the
// stop it was fetched for: lets "loading" and "stale from a previous pair" be read straight from
// state shape at render time, instead of a separate setState call at the top of the effect.
type PlanState = { key: string; itineraries: Itinerary[]; noNearbyStops: boolean } | null;
type PlanErrorState = { key: string; message: string } | null;

function requestKey(from: Place, to: Place): string {
  return `${from.lat},${from.lon}|${to.lat},${to.lon}`;
}

export function TransportMap(props: {
  routes: MapRoute[];
  stops: MapStop[];
  stopRoutes: Record<string, string[]>;
  buildings: Building[];
}) {
  const [from, setFrom] = useState<FieldState>(emptyField);
  const [to, setTo] = useState<FieldState>(emptyField);
  const [pickMode, setPickMode] = useState<PickMode>(null);
  const [locatingField, setLocatingField] = useState<"from" | "to" | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanState>(null);
  const [planError, setPlanError] = useState<PlanErrorState>(null);
  const [selected, setSelected] = useState(0);

  const fromPlace = from.place;
  const toPlace = to.place;
  const key = fromPlace && toPlace ? requestKey(fromPlace, toPlace) : null;

  useEffect(() => {
    if (!key || !fromPlace || !toPlace) return;
    let cancelled = false;
    const params = new URLSearchParams({
      fromLat: String(fromPlace.lat),
      fromLon: String(fromPlace.lon),
      fromLabel: fromPlace.label,
      toLat: String(toPlace.lat),
      toLon: String(toPlace.lon),
      toLabel: toPlace.label,
    });
    fetch(`/api/buses/plan?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json: { itineraries: Itinerary[]; noNearbyStops: boolean }) => {
        if (cancelled) return;
        setPlan({ key, itineraries: json.itineraries, noNearbyStops: json.noNearbyStops });
        setSelected(0);
      })
      .catch(() => {
        if (!cancelled) setPlanError({ key, message: "Couldn't reach Shuttle-UM schedules. Try again in a few minutes." });
      });
    return () => {
      cancelled = true;
    };
    // fromPlace/toPlace are recomputed from `from`/`to` above; `key` already reflects any change
    // to either, so it's the only dependency that should re-trigger the fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const activePlan = key && plan?.key === key ? plan : null;
  const activeError = key && planError?.key === key ? planError.message : null;
  const planLoading = key !== null && activePlan === null && activeError === null;

  const onSwap = useCallback(() => {
    setFrom(to);
    setTo(from);
  }, [from, to]);

  const onTogglePick = useCallback((field: "from" | "to") => {
    setPickMode((cur) => (cur === field ? null : field));
  }, []);

  const onMapPick = useCallback(
    (place: Place) => {
      if (pickMode === "from") setFrom({ text: place.label, place });
      else if (pickMode === "to") setTo({ text: place.label, place });
      setPickMode(null);
    },
    [pickMode],
  );

  const onUseLocation = useCallback((field: "from" | "to") => {
    if (!("geolocation" in navigator)) {
      setLocError("Location isn't available in this browser.");
      return;
    }
    setLocatingField(field);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const place: Place = { lat: pos.coords.latitude, lon: pos.coords.longitude, label: "My location" };
        if (field === "from") setFrom({ text: place.label, place });
        else setTo({ text: place.label, place });
        setLocatingField(null);
      },
      () => {
        setLocError("Couldn't get your location.");
        setLocatingField(null);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  const selectedItinerary = activePlan?.itineraries[selected] ?? null;

  return (
    <>
      <TripPlanner
        buildings={props.buildings}
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        onSwap={onSwap}
        pickMode={pickMode}
        onTogglePick={onTogglePick}
        locatingField={locatingField}
        onUseLocation={onUseLocation}
        locError={locError}
        plan={activePlan?.itineraries ?? null}
        planLoading={planLoading}
        planError={activeError}
        noNearbyStops={activePlan?.noNearbyStops ?? false}
        selected={selected}
        onSelect={setSelected}
      />
      <MapView
        {...props}
        pickMode={pickMode}
        onMapPick={onMapPick}
        from={from.place}
        to={to.place}
        itinerary={selectedItinerary}
      />
    </>
  );
}
