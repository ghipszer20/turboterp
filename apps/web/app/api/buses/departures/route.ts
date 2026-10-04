import type { NextRequest } from "next/server";
import { connection } from "next/server";
import { campusDate, campusMinutes } from "@turboterp/campus-data";
import { getDepartures } from "@/lib/campus";

// GET /api/buses/departures?stops=A,B,C → next scheduled departures per stop.
export async function GET(request: NextRequest) {
  await connection();
  const stops = (request.nextUrl.searchParams.get("stops") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
  if (stops.length === 0) return Response.json({ error: "Pass ?stops=<id>,<id>" }, { status: 400 });

  try {
    const now = new Date();
    const minutes = campusMinutes(now);
    const departures = await getDepartures(stops, campusDate(now), minutes);
    return Response.json({ minutes, departures }, { headers: { "Cache-Control": "private, max-age=30" } });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Shuttle-UM schedules are unavailable right now." }, { status: 502 });
  }
}
