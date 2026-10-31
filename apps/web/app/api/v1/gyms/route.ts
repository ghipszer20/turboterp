import { getGroupFitness, getRecWellAreas, safe } from "@/lib/campus";
import { v1Response } from "@/lib/api-v1/respond";

// GET /api/v1/gyms -> RecWell areas and group fitness classes, each { ok, data } | { ok: false, error }.
// Prerendered; tag campus:recwell.
export function GET() {
  return v1Response(async () => {
    const [areas, classes] = await Promise.all([safe(getRecWellAreas), safe(getGroupFitness)]);
    return { areas, classes };
  });
}
