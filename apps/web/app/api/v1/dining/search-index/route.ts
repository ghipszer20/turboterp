import { getDiningBundle } from "@/lib/campus-bundles";
import { v1Response } from "@/lib/api-v1/respond";

// GET /api/v1/dining/search-index -> the menus the app searches on-device for "Find a food"
// (the same bundle the web search page reads). Prerendered; tag campus:dining.
export function GET() {
  return v1Response(getDiningBundle);
}
