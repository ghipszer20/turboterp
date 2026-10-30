import { connection } from "next/server";
import { handleDeviceDelete, handleDeviceRegister } from "@/lib/seat-alerts/api";
import { notConfigured, seatApiDeps } from "@/lib/seat-alerts/deps";

export async function POST(request: Request) {
  await connection();
  const deps = seatApiDeps();
  return deps ? handleDeviceRegister(request, deps) : notConfigured();
}

export async function DELETE(request: Request) {
  await connection();
  const deps = seatApiDeps();
  return deps ? handleDeviceDelete(request, deps) : notConfigured();
}
