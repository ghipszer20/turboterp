import type { NextRequest } from "next/server";
import { connection } from "next/server";
import { addDays, campusDate, DINING_HALLS } from "@turboterp/campus-data";
import { getAllDiningMenus } from "@/lib/campus";
import { hallFromQuery, mealFromQuery, mealsServed, searchMenus } from "@/lib/dining";

// GET /api/dining/search?date=YYYY-MM-DD&q=burger[&hall=<id>][&meal=Lunch] → foods matching q across every hall and
// meal that day, each with the hall, meal and station serving it. Served from snapshots, so
// it's CDN-cacheable by URL.
export async function GET(request: NextRequest) {
  await connection();
  const params = request.nextUrl.searchParams;
  const q = (params.get("q") ?? "").slice(0, 80);
  const date = params.get("date") ?? "";
  const today = campusDate();
  if (![addDays(today, -1), today, addDays(today, 1)].includes(date)) {
    return Response.json({ error: "Pass ?date=<today>&q=<food>" }, { status: 400 });
  }

  try {
    const menus = await getAllDiningMenus(date);
    const loaded = menus.map((m) => (m.ok ? m.data : null));
    const hallId = hallFromQuery(params.get("hall") ?? undefined, DINING_HALLS.map((h) => h.id));
    const meal = mealFromQuery(params.get("meal") ?? undefined, mealsServed(loaded));
    const { results, capped } = searchMenus(
      loaded,
      q,
      { hallId, meal },
    );
    if (menus.every((m) => !m.ok)) {
      return Response.json({ error: "UMD Dining didn't respond." }, { status: 502 });
    }
    return Response.json(
      { date, q, results, capped },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=1800" } },
    );
  } catch (err) {
    console.error(err);
    return Response.json({ error: "UMD Dining didn't respond." }, { status: 502 });
  }
}
