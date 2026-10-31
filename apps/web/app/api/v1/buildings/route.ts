import { getBuildings } from "@/lib/campus";
import { v1Response } from "@/lib/api-v1/respond";

// GET /api/v1/buildings -> UMD buildings (id, name, Testudo code, position). Prerendered from the snapshot.
export function GET() {
  return v1Response(async () =>
    (await getBuildings()).map(({ id, name, code, lat, lon }) => ({ id, name, code: code ?? "", lat, lon })),
  );
}
