import { getAcademicCalendar, getLibraryHours, getRecWellAreas, getStampVenues, safe } from "@/lib/campus";
import { getDiningBundle } from "@/lib/campus-bundles";
import { v1Response } from "@/lib/api-v1/respond";

// GET /api/v1/today -> everything the Today page reads: calendar, dining, Stamp, libraries and gyms, each
// { ok, data } | { ok: false, error } so one broken source doesn't blank the rest. Prerendered.
export function GET() {
  return v1Response(async () => {
    const [calendar, dining, stamp, libraries, gyms] = await Promise.all([
      safe(getAcademicCalendar),
      safe(getDiningBundle),
      safe(getStampVenues),
      safe(getLibraryHours),
      safe(getRecWellAreas),
    ]);
    return { calendar, dining, stamp, libraries, gyms };
  });
}
