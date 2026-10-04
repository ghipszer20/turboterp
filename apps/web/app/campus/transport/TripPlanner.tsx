"use client";

// The "Plan a trip" card: From/To search boxes (real places, not just stops), a swap button,
// and the resulting itineraries. Owner rulings: the start/end are real locations (a building, a
// map tap, or "my location" -- never fetched or requested until the student asks), and the
// planner accounts for walking to the boarding stop and from the alighting stop, not just time
// on the bus. Selecting an itinerary is reported up to TransportMap, which draws it on the map.

import { useId, useMemo, useState } from "react";
import { formatMinutes } from "@turboterp/campus-data/hours";
import type { Itinerary, Place } from "@turboterp/campus-data";
import { LocationIcon, MapPinIcon, SwapIcon } from "@/components/icons";
import { Card, EmptyState } from "@/components/ui";
import styles from "./trip.module.css";

export type Building = { id: string; name: string; lat: number; lon: number };
export type PickMode = "from" | "to" | null;

type FieldState = { text: string; place: Place | null };
export const emptyField: FieldState = { text: "", place: null };

export function searchBuildings<T extends { name: string }>(buildings: T[], query: string, limit = 6): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return buildings.filter((b) => b.name.toLowerCase().includes(q)).slice(0, limit);
}

function Field({
  label,
  field,
  buildings,
  picking,
  locating,
  onChange,
  onPick,
  onTogglePick,
  onUseLocation,
}: {
  label: string;
  field: FieldState;
  buildings: Building[];
  picking: boolean;
  locating: boolean;
  onChange: (field: FieldState) => void;
  onPick: (place: Place) => void;
  onTogglePick: () => void;
  onUseLocation: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const listId = useId();
  const results = useMemo(() => searchBuildings(buildings, field.place ? "" : field.text), [buildings, field]);

  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel} htmlFor={`${listId}-input`}>
        {label}
      </label>
      <div className={styles.fieldRow}>
        <input
          id={`${listId}-input`}
          className={styles.input}
          type="text"
          placeholder={label === "From" ? "Search a building…" : "Search a building…"}
          value={field.text}
          onChange={(e) => onChange({ text: e.target.value, place: null })}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          role="combobox"
          aria-expanded={focused && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label={`${label} location`}
        />
        <button
          type="button"
          className={styles.iconButton}
          data-pressed={picking || undefined}
          onClick={onTogglePick}
          aria-pressed={picking}
          aria-label={`Pick ${label.toLowerCase()} location on the map`}
          title="Pick on map"
        >
          <MapPinIcon />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onUseLocation}
          disabled={locating}
          aria-label={`Use my location for ${label.toLowerCase()}`}
          title="Use my location"
        >
          <LocationIcon size={16} />
        </button>
      </div>
      {focused && results.length > 0 ? (
        <ul className={styles.results} id={listId} role="listbox">
          {results.map((b) => (
            <li key={b.id} role="option" aria-selected={field.place?.label === b.name}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onPick({ lat: b.lat, lon: b.lon, label: b.name })}>
                {b.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

// "walk X min to <stop> -> <route> at <time> -> (transfer at <stop>, <route> at <time>) ->
// get off at <stop> -> walk Y min -> arrive <time>" (owner ruling), one leg per line.
function legLine(leg: Itinerary["legs"][number], index: number, legs: Itinerary["legs"]): string {
  if (leg.kind === "walk") return `Walk ${leg.minutes} min to ${leg.to.label}`;
  const previous = legs[index - 1];
  const boarding = !previous || previous.kind === "walk";
  const verb = boarding ? "Board" : "Transfer to";
  return `${verb} ${leg.route.shortName} at ${leg.boardStopName}, ${formatMinutes(leg.departMinutes)} → get off at ${leg.alightStopName}, ${formatMinutes(leg.arriveMinutes)}`;
}

function ItineraryRow({ itinerary, selected, onSelect }: { itinerary: Itinerary; selected: boolean; onSelect: () => void }) {
  const busLegs = itinerary.legs.filter((l) => l.kind === "bus");
  return (
    <li>
      <button type="button" className={styles.optionButton} data-selected={selected || undefined} onClick={onSelect}>
        <div className={styles.optionHead}>
          <span className={styles.optionTitle}>
            {itinerary.kind === "walk" ? "Walk the whole way" : busLegs.map((l) => l.route.shortName).join(" → ")}
          </span>
          <span className={styles.optionTime}>
            {Math.round(itinerary.totalMinutes)} min · arrive {formatMinutes(itinerary.arriveMinutes)}
          </span>
        </div>
        <ol className={styles.legs}>
          {itinerary.legs.map((leg, i) => (
            <li key={i} data-kind={leg.kind}>
              {legLine(leg, i, itinerary.legs)}
            </li>
          ))}
        </ol>
      </button>
    </li>
  );
}

export function TripPlanner({
  buildings,
  from,
  to,
  onFromChange,
  onToChange,
  onSwap,
  pickMode,
  onTogglePick,
  locatingField,
  onUseLocation,
  locError,
  plan,
  planLoading,
  planError,
  noNearbyStops,
  selected,
  onSelect,
}: {
  buildings: Building[];
  from: FieldState;
  to: FieldState;
  onFromChange: (field: FieldState) => void;
  onToChange: (field: FieldState) => void;
  onSwap: () => void;
  pickMode: PickMode;
  onTogglePick: (field: "from" | "to") => void;
  locatingField: "from" | "to" | null;
  onUseLocation: (field: "from" | "to") => void;
  locError: string | null;
  plan: Itinerary[] | null;
  planLoading: boolean;
  planError: string | null;
  noNearbyStops: boolean;
  selected: number;
  onSelect: (i: number) => void;
}) {
  return (
    <Card className={styles.card} clipNone>
      <p className={styles.title}>Plan a trip</p>
      <div className={styles.fields}>
        <Field
          label="From"
          field={from}
          buildings={buildings}
          picking={pickMode === "from"}
          locating={locatingField === "from"}
          onChange={onFromChange}
          onPick={(place) => onFromChange({ text: place.label, place })}
          onTogglePick={() => onTogglePick("from")}
          onUseLocation={() => onUseLocation("from")}
        />
        <button type="button" className={styles.swap} onClick={onSwap} aria-label="Swap From and To">
          <SwapIcon />
        </button>
        <Field
          label="To"
          field={to}
          buildings={buildings}
          picking={pickMode === "to"}
          locating={locatingField === "to"}
          onChange={onToChange}
          onPick={(place) => onToChange({ text: place.label, place })}
          onTogglePick={() => onTogglePick("to")}
          onUseLocation={() => onUseLocation("to")}
        />
      </div>
      {pickMode ? <p className={styles.hint}>Tap the map to set the {pickMode === "from" ? "From" : "To"} location.</p> : null}
      {locError ? <p className={styles.hint}>{locError}</p> : null}

      {planLoading ? <p className={styles.hint}>Finding routes…</p> : null}
      {planError ? (
        <EmptyState title="Couldn't plan this trip">{planError}</EmptyState>
      ) : noNearbyStops ? (
        <EmptyState title="No stop within walking distance">
          Shuttle-UM doesn&apos;t serve within about half a mile of one of these places.
        </EmptyState>
      ) : plan && plan.filter((i) => i.kind === "transit").length === 0 ? (
        <EmptyState title="No scheduled buses for this trip right now">Walking is the only option at this time.</EmptyState>
      ) : null}

      {plan && plan.length > 0 ? (
        <ul className={styles.options}>
          {plan.map((it, i) => (
            <ItineraryRow key={i} itinerary={it} selected={selected === i} onSelect={() => onSelect(i)} />
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
