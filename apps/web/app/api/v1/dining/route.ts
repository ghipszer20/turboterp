import { DINING_HALLS } from "@turboterp/campus-data";
import { getDiningBundle } from "@/lib/campus-bundles";
import { v1Response } from "@/lib/api-v1/respond";

// GET /api/v1/dining -> the dining halls and every hall's menu for today and tomorrow (as of the build).
// Prerendered; tag campus:dining.
export function GET() {
  return v1Response(async () => ({ halls: DINING_HALLS, bundle: await getDiningBundle() }));
}
