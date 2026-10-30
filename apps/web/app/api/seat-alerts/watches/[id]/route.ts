import { connection } from "next/server";
import { handleWatchDelete } from "@/lib/seat-alerts/api";
import { notConfigured, seatApiDeps } from "@/lib/seat-alerts/deps";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connection();
  const deps = seatApiDeps();
  return deps ? handleWatchDelete(request, (await params).id, deps) : notConfigured();
}
