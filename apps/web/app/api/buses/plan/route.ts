import type { NextRequest } from "next/server";
import { connection } from "next/server";
import { campusDate, campusMinutes } from "@turboterp/campus-data";
import { planArriveByBetween, planTripBetween } from "@/lib/campus";

function place(params: URLSearchParams, prefix: "from" | "to") {
  const lat = Number(params.get(`${prefix}Lat`));
  const lon = Number(params.get(`${prefix}Lon`));
  const label = params.get(`${prefix}Label`) ?? (prefix === "from" ? "Start" : "Destination");
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { lat, lon, label };
}

// GET /api/buses/plan?fromLat=&fromLon=&fromLabel=&toLat=&toLon=&toLabel=&at=<minutes>
// → walking-the-whole-way plus up to 3 Shuttle-UM itineraries between two real places.
// The map/feed live only on the server, so the "Plan a trip" card calls this instead of
// shipping the parsed GTFS feed to the client.
export async function GET(request: NextRequest) {
  await connection();
  const params = request.nextUrl.searchParams;
  const from = place(params, "from");
  const to = place(params, "to");
  if (!from || !to) {
    return Response.json({ error: "Pass ?fromLat=&fromLon=&toLat=&toLon=" }, { status: 400 });
  }

  const now = new Date();
  const atParam = params.get("at");
  const at = atParam !== null && Number.isFinite(Number(atParam)) ? Number(atParam) : campusMinutes(now);

  try {
    // ?arriveBy=<minutes>: arrive-by mode (the "leave by" card) instead of depart-at.
    const arriveByParam = params.get("arriveBy");
    if (arriveByParam !== null && Number.isFinite(Number(arriveByParam))) {
      const result = await planArriveByBetween(campusDate(now), Number(arriveByParam), from, to);
      return Response.json({ arriveBy: Number(arriveByParam), ...result }, { headers: { "Cache-Control": "private, max-age=30" } });
    }
    const result = await planTripBetween(campusDate(now), at, from, to);
    return Response.json({ at, ...result }, { headers: { "Cache-Control": "private, max-age=30" } });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Shuttle-UM schedules are unavailable right now." }, { status: 502 });
  }
}
