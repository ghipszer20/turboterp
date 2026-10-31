import { getStudyRoomsToday } from "@/lib/campus-bundles";
import { v1Response } from "@/lib/api-v1/respond";

// GET /api/v1/rooms -> study rooms (catalog and availability) for the date it was built. Prerendered; tag campus:rooms.
export function GET() {
  return v1Response(getStudyRoomsToday);
}
