import { getStampVenues } from "@/lib/campus";
import { v1Response } from "@/lib/api-v1/respond";

// GET /api/v1/dining/stamp -> Stamp venue hours. Prerendered; tag campus:dining.
export function GET() {
  return v1Response(getStampVenues);
}
