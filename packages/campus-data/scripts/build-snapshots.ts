// Runs a snapshot job against the live UMD sites (see ../SNAPSHOTS.md).
//
//   node scripts/build-snapshots.ts daily   # ~5am: everything (also prunes old dated snapshots)
//   node scripts/build-snapshots.ts fast    # every 5 min: rooms; menus once 30 min old
//   node scripts/build-snapshots.ts prune   # remove dated snapshots outside the keep window
//   ... [--dir <path>]                       # default: $TURBOTERP_SNAPSHOT_DIR or <repo>/.cache/snapshots
//
// Exits 1 if any source failed (its last good snapshot is kept), so a
// scheduler marks the run as failed and someone notices.

import { buildSnapshots, FileSnapshotStore, openSnapshotStore, pruneSnapshots, refreshFast, type SnapshotStore } from "../src/snapshots/index.ts";

const args = process.argv.slice(2);
const job = args[0];
const dirFlag = args.indexOf("--dir");
const dir = dirFlag >= 0 ? args[dirFlag + 1] : undefined;

if ((job !== "daily" && job !== "fast" && job !== "prune") || (dirFlag >= 0 && !dir)) {
  console.error("Usage: node scripts/build-snapshots.ts <daily|fast|prune> [--dir <path>]");
  process.exit(2);
}

const store: SnapshotStore = dir ? new FileSnapshotStore(dir) : openSnapshotStore();
const where = dir ?? (store instanceof FileSnapshotStore ? store.dir : "Supabase Storage");
const started = performance.now();

if (job === "prune") {
  const { removed } = await pruneSnapshots(store, new Date());
  for (const key of removed) console.log(`✗ ${key}  removed`);
  console.log(`prune: ${removed.length} removed in ${Math.round(performance.now() - started)} ms → ${where}`);
  process.exit(0);
}

const report = await (job === "daily" ? buildSnapshots : refreshFast)(store, new Date());

for (const r of report.results) console.log(`${r.ok ? "✓" : "✗"} ${r.key}${r.ok ? "" : `  ${r.error}`}`);
const failed = report.results.filter((r) => !r.ok).length;
console.log(
  `${job}: ${report.results.length - failed} ok, ${failed} failed in ${Math.round(performance.now() - started)} ms → ${where}`,
);
process.exit(report.ok ? 0 : 1);
