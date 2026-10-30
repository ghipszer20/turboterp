import { connection } from "next/server";
import { decodeDepartmentSections } from "@turboterp/course-data/schedule-files";
import { feedResponse } from "@/lib/schedule/feed-response";
import { readScheduleFile } from "@/lib/schedule-data";

// GET /api/calendar/schedule.ics?term=202701&s=CMSC131-0202,MATH141-0121
// The picked sections as a calendar feed (what "Add to calendar" subscribes to). Sections come from the
// pre-built snapshot, never from Testudo; the URL holds everything, so CDNs cache it.
export async function GET(request: Request) {
  await connection();
  const params = new URL(request.url).searchParams;
  try {
    return await feedResponse(params.get("term"), params.get("s"), async (term, dept) => {
      const data = await readScheduleFile(`schedule/${term}/sections/${dept}`);
      return data === null ? null : decodeDepartmentSections(data);
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Course data is unavailable right now." }, { status: 500 });
  }
}
