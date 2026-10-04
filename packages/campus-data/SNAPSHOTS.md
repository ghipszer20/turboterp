# Campus data snapshots

Pages never scrape UMD sites per request. Two jobs fetch the data ahead of time and write JSON snapshots. The web app reads those snapshots and fetches live only when a snapshot doesn't exist yet (for example, a fresh checkout).

## Jobs

| Job | Schedule | What it refreshes |
| --- | --- | --- |
| `buildSnapshots` (`daily`) | once a day, ~5:00am campus time | room catalog, today's room availability, today's menus for every hall, library hours (2 weeks), RecWell hours (14 days from today), Shuttle-UM GTFS feed, UMD building locations, registrar academic calendar, then `pruneSnapshots` |
| `refreshFast` (`fast`) | every 5 minutes | room availability for today; each hall's menu once its snapshot is 30+ minutes old (so menus are re-checked every ~30 min), or right away when the date rolls over |
| `pruneSnapshots` (`prune`) | run automatically at the end of `daily`; also available on its own | removes dated snapshots (and their matching `status/` entries) outside the keep window |

Run them with the CLI (from `packages/campus-data`):

```sh
npm run snapshots -- daily          # the 5am build (prunes old snapshots at the end)
npm run snapshots -- fast           # the 5-minute refresh
npm run snapshots -- fast --dir D:/snaps
npm run snapshots -- prune          # remove old dated snapshots on their own
```

The CLI prints one line per snapshot and exits 1 if any source failed, so a scheduler flags the run.

**Scheduling:** Supabase cron (`pg_cron` + `pg_net`, set up by `supabase/migrations/0003_cron_refresh.sql`) calls two protected endpoints on the site:
- `/api/cron/fast` every 3 minutes (`*/3 * * * *`): study-room availability, and menus once 30 minutes old.
- `/api/cron/daily` at `0 9 * * *` UTC (5am EDT, 4am EST): everything, plus the prune.
- Both need `Authorization: Bearer <secret>`. The `CRON_SECRET` env var on Vercel and the Supabase Vault secret `cron_secret` must hold the same value; without `CRON_SECRET` the endpoints answer 503.
- Every 3 minutes is as often as we dare: rooms change constantly, but the Libraries' booking site should be fetched politely, not hammered.
- An endpoint answers 200 even when some sources failed (the failures are listed in the JSON, and the store keeps the last good data); 500 means the job itself threw. A skipped run is harmless because pages keep serving the last snapshot.

## Failure behavior

- A source that throws never overwrites its last good snapshot. The error is written to `status/<key>` as `{ lastAttemptAt, lastSuccessAt, error }`, and the snapshot's `updatedAt` keeps meaning "when this data was fetched".
- Each dining hall and each room category is a separate key, so one failing hall or category doesn't affect the others.
- A GTFS feed that doesn't parse, or an empty room catalog, counts as a failure.
- A hall that posted no menu is valid data (an empty menu), not a failure.
- If the catalog fetch fails, the daily build computes availability from the last good catalog. `refreshFast` never scrapes the catalog; with no catalog snapshot, it reports an error.
- Pages serve a snapshot however old it is, and fetch live only when none exists.

## Store

```ts
interface SnapshotStore {
  get<T>(key: string): Promise<{ updatedAt: string; data: T } | null>;
  put<T>(key: string, snapshot: { updatedAt: string; data: T }): Promise<void>;
  list(prefix: string): Promise<string[]>;
  delete(key: string): Promise<void>;
}
```

`FileSnapshotStore` stores each key as a JSON file: `dining/2026-09-25/19` is saved as `<dir>/dining/2026-09-25/19.json`. Each file is wrapped in `{ schema, key, updatedAt, data }`. Writes go to a temp file first and are then renamed into place. A file with a different `schema` number, or one that won't parse, reads as missing. Bump `SNAPSHOT_SCHEMA` whenever a data shape changes.

The directory is `$TURBOTERP_SNAPSHOT_DIR`, or `<repo root>/.cache/snapshots` by default. That folder is gitignored, and the CLI and `next dev`/`next start` both resolve to it. `SupabaseSnapshotStore` keeps the same `{ schema, key, updatedAt, data }` wrapper as `<key>.json` objects in a Supabase Storage bucket (default name `snapshots`), through the Storage REST API with plain `fetch`. `openSnapshotStore()` picks the store from the environment: Supabase when `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`) are both set, otherwise the file store above.

The bucket must be private. Only server code and the build scripts hold the service-role key; never import the Supabase store or `openSnapshotStore` from a `"use client"` file, and never give the key a `NEXT_PUBLIC_` name. An explicit `--dir` on a build script still means the file store.

Keys:

| Key | Data |
| --- | --- |
| `rooms/catalog` | `{ locations, rooms }` |
| `rooms/<date>/<locationId>-<categoryId>` | `RoomAvailability[]` for one study category |
| `dining/<date>/<hallId>` | `DiningMenu` |
| `libraries/hours` | `LibraryHours[]` |
| `recwell/areas` | `RecWellArea[]` (14-day window) |
| `buses/gtfs` | unzipped GTFS text files (about 7 MB); the web parses them once per server instance |
| `buildings` | `Building[]` (umd.io map buildings: id, name, lat, lon) for the trip planner's place search |
| `calendar/academic` | `AcademicEvent[]` (registrar dates for the current and next two terms: registration, schedule adjustment, drop with W, derived pass/fail, apply to graduate, finals) |
| `status/<key>` | the last refresh attempt for `<key>` |

## Cleanup

Dated keys (`rooms/<date>/...`, `dining/<date>/...`) add about 12 small files a day. `pruneSnapshots(store, now, { keepDays })` removes any dated snapshot — and its matching `status/<key>` entry — whose date falls outside `now`'s campus date ± `keepDays`. `keepDays` defaults to 1, keeping yesterday, today, and tomorrow (the extra day on each side is slack for timezone edges around midnight). Undated keys (`rooms/catalog`, `libraries/hours`, `recwell/areas`, `buses/gtfs`, `buildings`, `calendar/academic`) are never touched.

The daily build runs `pruneSnapshots` automatically after refreshing everything else. It can also be run on its own with `npm run snapshots -- prune`.
