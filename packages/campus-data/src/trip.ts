// The trip planner's pure search: given two real places (not just stops), find the fastest
// ways between them on foot and via Shuttle-UM, using only scheduled GTFS times (nextDepartures)
// and the trip patterns already parsed onto the Feed (buses.ts). No fetching, no DOM, no React --
// this runs equally well in a test, an API route, or (someday) the iOS app.
//
// Owner ruling: "the start and end shouldn't just be stops - they should be actual locations.
// the trip planner should calculate not only time on bus but also time walking to that start
// stop and from that end stop to the area." This module is the "calculate" half; apps/web wires
// it to real places (umd.io buildings, a map tap, geolocation) and to the map/UI.

import type { Feed, Route, Stop } from "./buses.ts";
import { distanceMeters, nextDepartures } from "./buses.ts";

/** A real point a student might start or end at -- a building, a map tap, or "my location". */
export type Place = { lat: number; lon: number; label: string };

export type WalkLeg = {
  kind: "walk";
  /** Estimated walking time, rounded up (see walkMinutes) -- always labeled an estimate in the UI. */
  minutes: number;
  meters: number;
  from: Place;
  to: Place;
};

export type BusLeg = {
  kind: "bus";
  route: Route;
  tripId: string;
  boardStopId: string;
  boardStopName: string;
  boardLat: number;
  boardLon: number;
  /** Scheduled departure, minutes after midnight of the requested date (can exceed 1440). */
  departMinutes: number;
  alightStopId: string;
  alightStopName: string;
  alightLat: number;
  alightLon: number;
  /** Scheduled arrival, same clock as departMinutes. */
  arriveMinutes: number;
};

export type Leg = WalkLeg | BusLeg;

export type Itinerary = {
  kind: "walk" | "transit";
  legs: Leg[];
  /** The requested start time. */
  departMinutes: number;
  arriveMinutes: number;
  totalMinutes: number;
};

export type PlanTripOptions = {
  /** How far a student will walk to a boarding stop or from an alighting stop. Owner ruling: ~800m. */
  maxWalkMeters?: number;
  /** How many of the closest stops to each place are tried as boarding/alighting candidates. */
  maxBoardCandidates?: number;
  maxAlightCandidates?: number;
  /** How far ahead (in minutes) departures are considered, from when a stop becomes reachable. */
  windowMinutes?: number;
  /** Cap on departures examined per candidate stop, before the time window narrows it further. */
  maxDeparturesPerStop?: number;
  /** Cap on how many stops along a boarded trip's own pattern are tried as a transfer point. */
  maxTransferStopsPerTrip?: number;
  /** How many distinct transit itineraries to keep, ranked by earliest arrival. */
  maxOptions?: number;
};

export type PlanTripResult = {
  /**
   * Walking-the-whole-way, plus up to `maxOptions` distinct transit itineraries, already ordered
   * for display: walking sorts first when it's at least as fast as the best transit option.
   */
  itineraries: Itinerary[];
  /** No stop is within walking distance of the start or the end -- distinct from "no service". */
  noNearbyStops: boolean;
};

const DEFAULTS: Required<PlanTripOptions> = {
  maxWalkMeters: 800,
  maxBoardCandidates: 6,
  maxAlightCandidates: 6,
  windowMinutes: 120,
  maxDeparturesPerStop: 12,
  maxTransferStopsPerTrip: 25,
  maxOptions: 3,
};

// Owner ruling: "straight-line (haversine) distance x1.3 detour factor at 1.3 m/s". Kept as two
// named constants (rather than folded together) so a change to either -- they aren't meant to
// be the same number, they just are right now -- is a one-line edit, not a re-derivation.
const WALK_DETOUR_FACTOR = 1.3;
const WALK_SPEED_MPS = 1.3;

/** Estimated walking minutes for a straight-line distance, per the owner's detour-factor ruling. */
export function walkMinutes(meters: number): number {
  return (meters * WALK_DETOUR_FACTOR) / WALK_SPEED_MPS / 60;
}

export type NearbyStop = Stop & { meters: number; minutes: number };

/** Stops within `maxMeters` of a point, closest first -- candidate boarding or alighting stops. */
export function stopsWithinWalk(feed: Feed, point: { lat: number; lon: number }, maxMeters = DEFAULTS.maxWalkMeters): NearbyStop[] {
  return [...feed.stops.values()]
    .map((s): NearbyStop => {
      const meters = distanceMeters(point.lat, point.lon, s.lat, s.lon);
      return { ...s, meters, minutes: walkMinutes(meters) };
    })
    .filter((s) => s.meters <= maxMeters)
    .sort((a, b) => a.meters - b.meters);
}

function toPlace(stop: Stop): Place {
  return { lat: stop.lat, lon: stop.lon, label: stop.name };
}

function walkLeg(from: Place, to: Place): WalkLeg {
  const meters = distanceMeters(from.lat, from.lon, to.lat, to.lon);
  return { kind: "walk", minutes: Math.ceil(walkMinutes(meters)), meters, from, to };
}

function walkOnlyItinerary(from: Place, to: Place, departMinutes: number): Itinerary {
  const leg = walkLeg(from, to);
  return { kind: "walk", legs: [leg], departMinutes, arriveMinutes: departMinutes + leg.minutes, totalMinutes: leg.minutes };
}

type TimelineEntry = { stopId: string; sequence: number; minutes: number };

// buses.ts's stopTimesByStop already carries every timed stop_time row, including each trip's
// final stop (it's only excluded from *departure boards* -- nextDepartures -- since nothing
// departs from a last stop; the raw time is still there). Rebuilding each trip's own timeline
// from it gives arrival times at any stop along the route, not just where a bus would depart.
const timelineCache = new WeakMap<Feed, Map<string, TimelineEntry[]>>();

function tripTimelines(feed: Feed): Map<string, TimelineEntry[]> {
  const cached = timelineCache.get(feed);
  if (cached) return cached;
  const timelines = new Map<string, TimelineEntry[]>();
  for (const [stopId, times] of feed.stopTimesByStop) {
    for (const st of times) {
      const list = timelines.get(st.tripId) ?? [];
      list.push({ stopId, sequence: st.sequence, minutes: st.departure });
      timelines.set(st.tripId, list);
    }
  }
  for (const list of timelines.values()) list.sort((a, b) => a.sequence - b.sequence);
  timelineCache.set(feed, timelines);
  return timelines;
}

/** The timeline entry a `nextDepartures` result boarded at: matches on raw minutes, allowing for its yesterday-service -1440 shift. */
function findBoardEntry(timeline: TimelineEntry[], stopId: string, departMinutes: number): TimelineEntry | undefined {
  return timeline.find((e) => e.stopId === stopId && (e.minutes === departMinutes || e.minutes - 1440 === departMinutes));
}

/** The first later stop in the pattern matching `stopId` (loops can repeat a stop; the first occurrence after boarding is the one you'd actually ride to). */
function findAlightEntry(timeline: TimelineEntry[], afterSequence: number, stopId: string): TimelineEntry | undefined {
  return timeline.find((e) => e.sequence > afterSequence && e.stopId === stopId);
}

function busLeg(
  route: Route,
  tripId: string,
  board: NearbyStop,
  departMinutes: number,
  alight: NearbyStop,
  arriveMinutes: number,
): BusLeg {
  return {
    kind: "bus",
    route,
    tripId,
    boardStopId: board.id,
    boardStopName: board.name,
    boardLat: board.lat,
    boardLon: board.lon,
    departMinutes,
    alightStopId: alight.id,
    alightStopName: alight.name,
    alightLat: alight.lat,
    alightLon: alight.lon,
    arriveMinutes,
  };
}

function shapeKey(legs: Leg[]): string {
  return legs
    .filter((l): l is BusLeg => l.kind === "bus")
    .map((l) => `${l.boardStopId}>${l.route.id}>${l.alightStopId}`)
    .join("|");
}

export function planTrip(
  feed: Feed,
  isoDate: string,
  fromMinutes: number,
  from: Place,
  to: Place,
  options: PlanTripOptions = {},
): PlanTripResult {
  const opts = { ...DEFAULTS, ...options };
  const walkOnly = walkOnlyItinerary(from, to, fromMinutes);

  const boardCandidates = stopsWithinWalk(feed, from, opts.maxWalkMeters).slice(0, opts.maxBoardCandidates);
  const alightCandidates = stopsWithinWalk(feed, to, opts.maxWalkMeters).slice(0, opts.maxAlightCandidates);
  if (boardCandidates.length === 0 || alightCandidates.length === 0) {
    return { itineraries: [walkOnly], noNearbyStops: true };
  }

  const timelines = tripTimelines(feed);
  const found = new Map<string, Itinerary>(); // shape key -> earliest instance

  const consider = (legs: Leg[], arriveMinutes: number) => {
    const key = shapeKey(legs);
    const itinerary: Itinerary = { kind: "transit", legs, departMinutes: fromMinutes, arriveMinutes, totalMinutes: arriveMinutes - fromMinutes };
    const existing = found.get(key);
    if (!existing || itinerary.arriveMinutes < existing.arriveMinutes) found.set(key, itinerary);
  };

  for (const board of boardCandidates) {
    const reachableAt = fromMinutes + Math.ceil(board.minutes);
    const departures = nextDepartures(feed, board.id, isoDate, reachableAt, opts.maxDeparturesPerStop).filter(
      (d) => d.minutes <= reachableAt + opts.windowMinutes,
    );
    const leadingWalk = walkLeg(from, toPlace(board));

    for (const dep of departures) {
      const timeline = timelines.get(dep.tripId);
      if (!timeline) continue;
      const boardEntry = findBoardEntry(timeline, board.id, dep.minutes);
      if (!boardEntry) continue;

      // Direct: alight at any candidate stop this same trip visits after boarding.
      for (const alight of alightCandidates) {
        if (alight.id === board.id) continue;
        const alightEntry = findAlightEntry(timeline, boardEntry.sequence, alight.id);
        if (!alightEntry) continue;
        const arriveAtAlight = dep.minutes + (alightEntry.minutes - boardEntry.minutes);
        const trailingWalk = walkLeg(toPlace(alight), to);
        consider([leadingWalk, busLeg(dep.route, dep.tripId, board, dep.minutes, alight, arriveAtAlight), trailingWalk], arriveAtAlight + trailingWalk.minutes);
      }

      // One transfer: get off partway through this trip's own pattern, then ride a different route.
      const laterStops = timeline.filter((e) => e.sequence > boardEntry.sequence).slice(0, opts.maxTransferStopsPerTrip);
      for (const transferPoint of laterStops) {
        const transferStop = feed.stops.get(transferPoint.stopId);
        if (!transferStop) continue;
        const arriveAtTransfer = dep.minutes + (transferPoint.minutes - boardEntry.minutes);
        const transferReachableAt = Math.ceil(arriveAtTransfer); // GTFS times are whole minutes; no extra walk between routes at the same stop.
        const secondDepartures = nextDepartures(feed, transferStop.id, isoDate, transferReachableAt, opts.maxDeparturesPerStop).filter(
          (d2) => d2.minutes <= transferReachableAt + opts.windowMinutes && d2.route.id !== dep.route.id,
        );

        for (const dep2 of secondDepartures) {
          const timeline2 = timelines.get(dep2.tripId);
          if (!timeline2) continue;
          const boardEntry2 = findBoardEntry(timeline2, transferStop.id, dep2.minutes);
          if (!boardEntry2) continue;

          for (const alight of alightCandidates) {
            if (alight.id === transferStop.id) continue;
            const alightEntry2 = findAlightEntry(timeline2, boardEntry2.sequence, alight.id);
            if (!alightEntry2) continue;
            const arriveAtAlight = dep2.minutes + (alightEntry2.minutes - boardEntry2.minutes);
            const transferStopAsNearby: NearbyStop = { ...transferStop, meters: 0, minutes: 0 };
            const trailingWalk = walkLeg(toPlace(alight), to);
            consider(
              [
                leadingWalk,
                busLeg(dep.route, dep.tripId, board, dep.minutes, transferStopAsNearby, arriveAtTransfer),
                busLeg(dep2.route, dep2.tripId, transferStopAsNearby, dep2.minutes, alight, arriveAtAlight),
                trailingWalk,
              ],
              arriveAtAlight + trailingWalk.minutes,
            );
          }
        }
      }
    }
  }

  const transitOptions = [...found.values()]
    .sort((a, b) => a.arriveMinutes - b.arriveMinutes || a.legs.length - b.legs.length)
    .slice(0, opts.maxOptions);

  const bestTransit = transitOptions[0];
  const itineraries =
    !bestTransit || walkOnly.totalMinutes <= bestTransit.totalMinutes ? [walkOnly, ...transitOptions] : [...transitOptions, walkOnly];

  return { itineraries, noNearbyStops: false };
}

export type ArriveByOption = {
  /** When to set out (minutes after midnight, campus clock) to still arrive by the target. */
  leaveMinutes: number;
  itinerary: Itinerary;
};

export type PlanArriveByResult = {
  /** The latest-leaving option first: walking when it is comparable to the best transit option, else transit. */
  options: ArriveByOption[];
  noNearbyStops: boolean;
};

export type ArriveByOptions = PlanTripOptions & {
  /** How much earlier than the target the search starts looking. Default 120 min. */
  lookbackMinutes?: number;
  /** Walking counts as comparable when it takes at most this many minutes longer than transit door to door. Default 5. */
  walkPreferenceMinutes?: number;
};

/**
 * Arrive-by mode: the itinerary with the latest departure that still arrives by `arriveByMinutes`.
 * Built on planTrip (depart-at is unchanged): search forward from an early start, keep the
 * feasible itineraries, then move the start past the latest feasible departure until none remain.
 */
export function planArriveBy(
  feed: Feed,
  isoDate: string,
  arriveByMinutes: number,
  from: Place,
  to: Place,
  options: ArriveByOptions = {},
): PlanArriveByResult {
  const { lookbackMinutes = 120, walkPreferenceMinutes = 5, ...tripOptions } = options;
  const walkLegOnly = walkLeg(from, to);
  const walkLeave = arriveByMinutes - walkLegOnly.minutes;
  const walkOption: ArriveByOption = {
    leaveMinutes: walkLeave,
    itinerary: { kind: "walk", legs: [walkLegOnly], departMinutes: walkLeave, arriveMinutes: arriveByMinutes, totalMinutes: walkLegOnly.minutes },
  };

  let best: ArriveByOption | undefined;
  let noNearbyStops = false;
  let start = arriveByMinutes - lookbackMinutes;
  for (let i = 0; i < 80; i++) {
    const result = planTrip(feed, isoDate, start, from, to, { ...tripOptions, maxOptions: 20 });
    if (result.noNearbyStops) {
      noNearbyStops = true;
      break;
    }
    let latestLeave = -Infinity;
    for (const it of result.itineraries) {
      if (it.kind !== "transit" || it.arriveMinutes > arriveByMinutes) continue;
      const firstBus = it.legs.find((l): l is BusLeg => l.kind === "bus");
      const lead = it.legs[0];
      if (!firstBus || !lead || lead.kind !== "walk") continue;
      const leave = firstBus.departMinutes - lead.minutes;
      if (leave < start) continue;
      latestLeave = Math.max(latestLeave, leave);
      if (!best || leave > best.leaveMinutes) {
        best = { leaveMinutes: leave, itinerary: { ...it, departMinutes: leave, totalMinutes: it.arriveMinutes - leave } };
      }
    }
    if (latestLeave === -Infinity) break;
    start = latestLeave + 1;
  }

  if (!best) return { options: [walkOption], noNearbyStops };
  const walkComparable = walkLegOnly.minutes <= best.itinerary.totalMinutes + walkPreferenceMinutes;
  return { options: walkComparable ? [walkOption, best] : [best, walkOption], noNearbyStops };
}
