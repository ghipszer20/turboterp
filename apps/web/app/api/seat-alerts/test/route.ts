import { connection } from "next/server";
import { handleTestAlert } from "@/lib/seat-alerts/api";
import { notConfigured, seatApiDeps } from "@/lib/seat-alerts/deps";

export async function POST(request: Request) {
  await connection();
  const deps = seatApiDeps();
  return deps ? handleTestAlert(request, deps) : notConfigured();
}
