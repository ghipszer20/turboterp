import type { NextRequest } from "next/server";
import { connection } from "next/server";
import { addDays, campusDate, DINING_HALLS } from "@turboterp/campus-data";
import { getDiningMenu } from "@/lib/campus";
import { diningSlice } from "@/lib/dining";

// GET /api/dining?date=YYYY-MM-DD&hall=19&meal=Lunch → that hall's meal names
// and one meal's stations. The dining page loads other halls and meals from
// here when tapped. Served from snapshots, so it's CDN-cacheable by URL.
export async function GET(request: NextRequest) {
  await connection();
  const params = request.nextUrl.searchParams;
  const hallId = Number(params.get("hall"));
  const meal = params.get("meal") ?? "";
  const date = params.get("date") ?? "";
  const today = campusDate();
  if (!DINING_HALLS.some((h) => h.id === hallId) || ![addDays(today, -1), today, addDays(today, 1)].includes(date)) {
    return Response.json({ error: "Pass ?date=<today>&hall=<id>&meal=<name>" }, { status: 400 });
  }

  try {
    const slice = diningSlice(await getDiningMenu(hallId, date), meal);
    return Response.json(
      { hallId, date, ...slice },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=1800" } },
    );
  } catch (err) {
    console.error(err);
    return Response.json({ error: "UMD Dining didn't respond." }, { status: 502 });
  }
}
