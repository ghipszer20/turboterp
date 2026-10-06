import { connection } from "next/server";
import { scheduleDataKey } from "@/lib/schedule/data-keys";
import { readScheduleFile } from "@/lib/schedule-data";

// GET /api/schedule/current | /<term>/index | /<term>/sections/<DEPT> | /<term>/grades/<DEPT> | /<term>/reviews/<instructor-key>
// Pre-built files (packages/course-data/SCHEDULE_FILES.md), identical for every student,
// so CDNs cache them; schedule generation itself runs in the browser.
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  await connection();
  const found = scheduleDataKey((await params).path);
  if (!found) return Response.json({ error: "Unknown schedule data file" }, { status: 404 });

  try {
    const data = await readScheduleFile(found.key);
    if (data === null) {
      return Response.json(
        { error: "Course data hasn't been built yet (npm run schedule-data -w @turboterp/course-data)." },
        { status: 404, headers: { "Cache-Control": "public, max-age=60" } },
      );
    }
    return Response.json(data, {
      headers: {
        "Cache-Control": `public, max-age=${Math.min(found.maxAge, 3600)}, s-maxage=${found.maxAge}, stale-while-revalidate=${found.maxAge * 7}`,
      },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Course data is unavailable right now." }, { status: 500 });
  }
}
