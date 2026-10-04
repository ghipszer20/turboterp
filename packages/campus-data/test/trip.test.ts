// A tiny hand-written GTFS feed (not real Shuttle-UM data) laid out so each test case is
// isolated by the time of day queried:
//
//   R1: A ---- B ---- C (a northwest loop, away from D/E)     A(08:00->08:05->08:10), A(08:30->08:35->08:40)
//   R2:                        C ------------------ D -- E   C(08:15) -> D(08:20) -> E(08:25): the transfer leg
//   R3: A ------------------------------------------------ D                          A(09:00) -> D(09:20) direct
//   R9: H (±25 min from query) -------- I                     two stops far from everything above
//
// B and C sit far enough from D/E (see the coordinates) that boarding R1 and just walking the
// rest of the way is never faster than actually transferring to R2 -- otherwise the "one
// transfer" case would be defeated by a shortcut through the fixture's own geometry.

import { describe, expect, it } from "vitest";
import { parseGtfs } from "../src/buses.ts";
import { planArriveBy, planTrip, walkMinutes, type Place } from "../src/trip.ts";

const feed = parseGtfs({
  "routes.txt": [
    "route_id,route_short_name,route_long_name,route_color,route_text_color",
    "R1,R1,Gold,FFD200,000000",
    "R2,R2,Blue,3399FF,000000",
    "R3,R3,Express,00AA00,FFFFFF",
    "R9,R9,Slow Loop,888888,FFFFFF",
  ].join("\n"),
  "stops.txt": [
    "stop_id,stop_name,stop_lat,stop_lon",
    "A,Stop A,38.98800,-76.94500",
    "B,Stop B,38.99200,-76.94900",
    "C,Stop C,38.99600,-76.95300",
    "D,Stop D,38.98500,-76.93900",
    "E,Stop E,38.98495,-76.93895",
    "H,Stop H,38.99500,-76.93000",
    "I,Stop I,38.99860,-76.93000",
  ].join("\n"),
  "trips.txt": [
    "route_id,service_id,trip_id,trip_headsign",
    "R1,WEEKDAY,r1a,C via B",
    "R1,WEEKDAY,r1b,C via B",
    "R2,WEEKDAY,r2a,E via D",
    "R3,WEEKDAY,r3a,D express",
    "R9,WEEKDAY,r9early,I",
    "R9,WEEKDAY,r9late,I",
  ].join("\n"),
  "stop_times.txt": [
    "trip_id,arrival_time,departure_time,stop_id,stop_sequence",
    "r1a,08:00:00,08:00:00,A,1",
    "r1a,08:05:00,08:05:00,B,2",
    "r1a,08:10:00,08:10:00,C,3",
    "r1b,08:30:00,08:30:00,A,1",
    "r1b,08:35:00,08:35:00,B,2",
    "r1b,08:40:00,08:40:00,C,3",
    "r2a,08:15:00,08:15:00,C,1",
    "r2a,08:20:00,08:20:00,D,2",
    "r2a,08:25:00,08:25:00,E,3",
    "r3a,09:00:00,09:00:00,A,1",
    "r3a,09:20:00,09:20:00,D,2",
    "r9early,23:00:00,23:00:00,H,1",
    "r9early,23:25:00,23:25:00,I,2",
    "r9late,23:40:00,23:40:00,H,1",
    "r9late,00:05:00,00:05:00,I,2",
  ].join("\n"),
  "calendar.txt": [
    "service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date",
    "WEEKDAY,1,1,1,1,1,1,1,20260101,20261231",
  ].join("\n"),
  "feed_info.txt": "feed_publisher_name,feed_end_date\nTest,20261231",
});

const DATE = "2026-09-25";

const near = (lat: number, lon: number, label: string): Place => ({ lat, lon, label });

// Right on top of stop A / stop D respectively (a few meters off).
const START_NEAR_A = near(38.98801, -76.94501, "Near Stop A");
const END_NEAR_D = near(38.98501, -76.93901, "Near Stop D");

describe("walkMinutes", () => {
  it("is the haversine distance x1.3 detour, at 1.3 m/s", () => {
    // 1.3x detour / 1.3 m/s cancels to ~1 second per meter -- still computed via both factors,
    // not hardcoded, so a change to either constant would be caught here.
    expect(walkMinutes(600)).toBeCloseTo(600 / 60, 5);
  });
});

describe("planTrip: direct trip", () => {
  it("finds the express route with no transfer", () => {
    const result = planTrip(feed, DATE, 8 * 60 + 55, START_NEAR_A, END_NEAR_D);
    expect(result.noNearbyStops).toBe(false);
    const transit = result.itineraries.filter((i) => i.kind === "transit");
    expect(transit.length).toBeGreaterThan(0);
    const best = transit[0]!;
    expect(best.legs.filter((l) => l.kind === "bus")).toHaveLength(1);
    const bus = best.legs.find((l) => l.kind === "bus")!;
    expect(bus.route.shortName).toBe("R3");
    expect(bus.boardStopId).toBe("A");
    expect(bus.alightStopId).toBe("D");
    expect(bus.departMinutes).toBe(9 * 60);
    expect(bus.arriveMinutes).toBe(9 * 60 + 20);
    expect(best.arriveMinutes).toBeGreaterThanOrEqual(9 * 60 + 20);
  });
});

describe("planTrip: one transfer", () => {
  it("rides R1 to the transfer stop then R2 to the destination", () => {
    const result = planTrip(feed, DATE, 7 * 60 + 55, START_NEAR_A, END_NEAR_D);
    const transit = result.itineraries.filter((i) => i.kind === "transit");
    expect(transit.length).toBeGreaterThan(0);
    const best = transit[0]!;
    const busLegs = best.legs.filter((l) => l.kind === "bus");
    expect(busLegs).toHaveLength(2);
    expect(busLegs[0]).toMatchObject({ route: { shortName: "R1" }, boardStopId: "A", alightStopId: "C", departMinutes: 8 * 60 });
    expect(busLegs[1]).toMatchObject({ route: { shortName: "R2" }, boardStopId: "C", alightStopId: "D", departMinutes: 8 * 60 + 15 });
    // Arrives well before the express (which doesn't leave until 9:00).
    expect(best.arriveMinutes).toBeLessThan(9 * 60);
  });

  it("never offers a transfer back onto the same route", () => {
    const result = planTrip(feed, DATE, 7 * 60 + 55, START_NEAR_A, END_NEAR_D);
    for (const it of result.itineraries) {
      const routes = it.legs.filter((l) => l.kind === "bus").map((l) => l.route.id);
      expect(new Set(routes).size).toBe(routes.length);
    }
  });
});

describe("planTrip: walking wins", () => {
  it("puts walking first when it beats waiting for the slow route", () => {
    // H and I are ~500m apart by air but R9's next trip is nearly an hour away.
    const start = near(38.99500, -76.93000, "Near Stop H");
    const end = near(38.99860, -76.93000, "Near Stop I");
    const result = planTrip(feed, DATE, 21 * 60, start, end); // 9:00pm: next R9 trip is 23:00
    expect(result.itineraries[0]!.kind).toBe("walk");
    const walkOnly = result.itineraries.find((i) => i.kind === "walk")!;
    expect(walkOnly.totalMinutes).toBeLessThan(result.itineraries.find((i) => i.kind === "transit")?.totalMinutes ?? Infinity);
  });
});

describe("planTrip: no service", () => {
  it("says so plainly instead of returning an empty crash", () => {
    // Well after the last trip of the day (R9's 00:05 arrival is the latest scheduled event).
    const start = near(38.99500, -76.93000, "Near Stop H");
    const end = near(38.99860, -76.93000, "Near Stop I");
    const result = planTrip(feed, DATE, 2 * 60, start, end); // 2am: nothing running
    expect(result.noNearbyStops).toBe(false); // stops exist nearby
    const transit = result.itineraries.filter((i) => i.kind === "transit");
    expect(transit).toHaveLength(0);
    expect(result.itineraries).toHaveLength(1); // just the walk option
    expect(result.itineraries[0]!.kind).toBe("walk");
  });

  it("flags no nearby stops separately from no service", () => {
    const farAway = near(39.5, -77.5, "Nowhere near campus");
    const result = planTrip(feed, DATE, 8 * 60, START_NEAR_A, farAway);
    expect(result.noNearbyStops).toBe(true);
    expect(result.itineraries.filter((i) => i.kind === "transit")).toHaveLength(0);
  });
});

describe("planTrip: start and end near the same stop", () => {
  it("never rides a bus from a stop back to itself", () => {
    const start = near(38.98800, -76.94500, "Right at Stop A");
    const end = near(38.98805, -76.94505, "Also right at Stop A");
    const result = planTrip(feed, DATE, 8 * 60, start, end);
    for (const it of result.itineraries) {
      const busLegs = it.legs.filter((l) => l.kind === "bus");
      for (const leg of busLegs) expect(leg.boardStopId).not.toBe(leg.alightStopId);
    }
    // Walking the ~7m gap is essentially instant (rounded up to a whole minute for display) and
    // should win over riding anywhere and back.
    expect(result.itineraries[0]!.kind).toBe("walk");
    expect(result.itineraries[0]!.totalMinutes).toBeLessThanOrEqual(1);
  });
});

describe("planArriveBy", () => {
  const startA = near(38.988, -76.945, "Stop A");
  const nearC = near(38.99601, -76.95301, "Near Stop C");

  it("leaves in time for the last bus that still arrives by the target", () => {
    const r = planArriveBy(feed, DATE, 8 * 60 + 45, startA, nearC);
    const best = r.options[0]!;
    expect(best.itinerary.kind).toBe("transit");
    const bus = best.itinerary.legs.find((l) => l.kind === "bus")!;
    expect(bus.departMinutes).toBe(8 * 60 + 30); // the 08:30 trip, not the 08:00 one
    expect(best.itinerary.arriveMinutes).toBeLessThanOrEqual(8 * 60 + 45);
    expect(best.leaveMinutes).toBeLessThanOrEqual(8 * 60 + 30);
    expect(best.itinerary.departMinutes).toBe(best.leaveMinutes);
  });

  it("falls back to an earlier bus when the later one would be late", () => {
    const r = planArriveBy(feed, DATE, 8 * 60 + 12, startA, nearC);
    const bus = r.options[0]!.itinerary.legs.find((l) => l.kind === "bus")!;
    expect(bus.departMinutes).toBe(8 * 60);
  });

  it("offers walking the whole way and prefers it when comparable", () => {
    const r = planArriveBy(feed, DATE, 9 * 60 + 30, START_NEAR_A, END_NEAR_D);
    expect(r.options[0]!.itinerary.kind).toBe("walk");
    expect(r.options[0]!.leaveMinutes).toBe(9 * 60 + 30 - r.options[0]!.itinerary.totalMinutes);
  });
});
