import { getBuildings } from "@/lib/campus";

// GET /api/campus/buildings -> the umd.io buildings list (id, name, Testudo code, position),
// read from the campus snapshot, never from umd.io per request. Same for every student, so
// CDNs and browsers cache it; the schedule builder and Transport's "leave by" card use it.
export async function GET() {
  try {
    const buildings = await getBuildings();
    return Response.json(
      buildings.map(({ id, name, code, lat, lon }) => ({ id, name, code: code ?? "", lat, lon })),
      { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Buildings are unavailable right now." }, { status: 500 });
  }
}
