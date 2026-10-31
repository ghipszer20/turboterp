import { getAcademicCalendar } from "@/lib/campus";
import { v1Response } from "@/lib/api-v1/respond";

// GET /api/v1/calendar -> the academic calendar events. Prerendered; tag campus:calendar.
export function GET() {
  return v1Response(getAcademicCalendar);
}
