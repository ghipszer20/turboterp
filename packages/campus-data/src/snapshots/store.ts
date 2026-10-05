// Pre-built campus data snapshots. Pages read these instead of scraping UMD
// sites per request (see ../../SNAPSHOTS.md). The store is deliberately tiny,
// so a durable store (Supabase, the host's data cache) can replace the file
// store at deployment without touching the jobs or the pages.

import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

/** Bump when a snapshot's data shape changes; older snapshots then read as missing. */
export const SNAPSHOT_SCHEMA = 2;

export type Snapshot<T> = {
  /** ISO timestamp of when the data was fetched from the source. */
  updatedAt: string;
  data: T;
};

export interface SnapshotStore {
  get<T>(key: string): Promise<Snapshot<T> | null>;
  put<T>(key: string, snapshot: Snapshot<T>): Promise<void>;
  /** Keys stored under `prefix` (e.g. "rooms" or "dining/2026-09-25"), most-nested first. */
  list(prefix: string): Promise<string[]>;
  /** No-op if the key doesn't exist. */
  delete(key: string): Promise<void>;
}

type Envelope<T> = Snapshot<T> & { schema: number; key: string };

const KEY = /^[a-z0-9][a-z0-9_-]*(?:\/[a-z0-9][a-z0-9_-]*)*$/i;

export function checkKey(key: string): void {
  if (!KEY.test(key)) throw new Error(`Invalid snapshot key: ${JSON.stringify(key)}`);
}

/** Snapshots as JSON files in a directory: key "dining/2026-09-25/19" → <dir>/dining/2026-09-25/19.json. */
export class FileSnapshotStore implements SnapshotStore {
  readonly dir: string;

  constructor(dir: string) {
    this.dir = dir;
  }

  private file(key: string): string {
    checkKey(key);
    return join(this.dir, ...key.split("/")) + ".json";
  }

  async get<T>(key: string): Promise<Snapshot<T> | null> {
    const file = this.file(key);
    let env: Envelope<T>;
    try {
      env = JSON.parse(await readFile(file, "utf8")) as Envelope<T>;
    } catch {
      return null; // missing or corrupt: callers treat both as "no snapshot"
    }
    if (env?.schema !== SNAPSHOT_SCHEMA || typeof env.updatedAt !== "string") return null;
    return { updatedAt: env.updatedAt, data: env.data };
  }

  async put<T>(key: string, snapshot: Snapshot<T>): Promise<void> {
    const file = this.file(key);
    const env: Envelope<T> = { schema: SNAPSHOT_SCHEMA, key, updatedAt: snapshot.updatedAt, data: snapshot.data };
    await mkdir(dirname(file), { recursive: true });
    // Write then rename, so a reader never sees a half-written file.
    const tmp = `${file}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
    await writeFile(tmp, JSON.stringify(env));
    try {
      await renameWithRetry(tmp, file);
    } catch (err) {
      await rm(tmp, { force: true });
      throw err;
    }
  }

  async list(prefix: string): Promise<string[]> {
    checkKey(prefix);
    const keys: string[] = [];
    const walk = async (dir: string, keyPrefix: string): Promise<void> => {
      let entries;
      try {
        entries = await readdir(dir, { withFileTypes: true });
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === "ENOENT") return;
        throw err;
      }
      for (const entry of entries) {
        const entryKey = `${keyPrefix}/${entry.name}`;
        if (entry.isDirectory()) {
          await walk(join(dir, entry.name), entryKey);
        } else if (entry.name.endsWith(".json")) {
          keys.push(entryKey.slice(0, -".json".length));
        }
      }
    };
    await walk(join(this.dir, ...prefix.split("/")), prefix);
    return keys;
  }

  async delete(key: string): Promise<void> {
    await rm(this.file(key), { force: true });
  }
}

// Windows refuses to replace a file another process is reading at that instant.
async function renameWithRetry(from: string, to: string): Promise<void> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await rename(from, to);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (attempt >= 5 || (code !== "EPERM" && code !== "EBUSY" && code !== "EACCES")) throw err;
      await new Promise((r) => setTimeout(r, 50 * (attempt + 1)));
    }
  }
}

/**
 * Where the file store lives: $TURBOTERP_SNAPSHOT_DIR, else <repo root>/.cache/snapshots
 * (the repo root is the nearest folder above `cwd` with a package-lock.json), so the
 * CLI (run from packages/campus-data) and the web app (run from apps/web) share it.
 */
export function defaultSnapshotDir(
  cwd: string = process.cwd(),
  env: Record<string, string | undefined> = process.env,
): string {
  if (env.TURBOTERP_SNAPSHOT_DIR) return env.TURBOTERP_SNAPSHOT_DIR;
  let dir = resolve(cwd);
  for (;;) {
    if (existsSync(join(dir, "package-lock.json"))) return join(dir, ".cache", "snapshots");
    const parent = dirname(dir);
    if (parent === dir) return join(resolve(cwd), ".cache", "snapshots");
    dir = parent;
  }
}

/** Data plus when it was fetched (null when it was just fetched live, with no snapshot). */
export type Fresh<T> = { data: T; updatedAt: string | null };

/**
 * Serve the snapshot if there is one, however old (the jobs keep it fresh);
 * fetch live only when no snapshot exists yet.
 */
export async function snapshotOrLive<T>(snapshot: Snapshot<T> | null, live: () => Promise<T>): Promise<Fresh<T>> {
  if (snapshot) return { data: snapshot.data, updatedAt: snapshot.updatedAt };
  return { data: await live(), updatedAt: null };
}
