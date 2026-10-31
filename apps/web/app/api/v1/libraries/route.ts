import { getLibraryHours } from "@/lib/campus";
import { v1Response } from "@/lib/api-v1/respond";

// GET /api/v1/libraries -> library hours. Prerendered; tag campus:hours.
export function GET() {
  return v1Response(getLibraryHours);
}
