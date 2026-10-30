import { connection } from "next/server";
import { handleWatchCreate, handleWatchesGet } from "@/lib/seat-alerts/api";
import { notConfigured, seatApiDeps } from "@/lib/seat-alerts/deps";

export async function GET(request: Request) {
  await connection(); // never prerendered or cached
  const deps = seatApiDeps();
  return deps ? handleWatchesGet(request, deps) : notConfigured();
}

export async function POST(request: Request) {
  await connection();
  const deps = seatApiDeps();
  return deps ? handleWatchCreate(request, deps) : notConfigured();
}
