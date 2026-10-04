// Server-side reads of the schedule builder's pre-built files (packages/course-data/SCHEDULE_FILES.md).
// Each file is read from the snapshot store at most every 5 minutes per server instance;
// CDNs cache the responses far longer (see app/api/schedule/[...path]/route.ts).

import { cacheLife } from "next/cache";
import { openSnapshotStore, type SnapshotStore } from "@turboterp/campus-data/snapshots";

let store: SnapshotStore | null = null;

/** The file's data, or null when it hasn't been built (fresh checkout, CI). */
export async function readScheduleFile(key: string): Promise<unknown | null> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 86400 });
  const snap = await (store ??= openSnapshotStore()).get<unknown>(key);
  return snap?.data ?? null;
}
