import type { Snapshot, SnapshotStore } from "@turboterp/campus-data/snapshots";

/** An in-memory SnapshotStore for tests. Values round-trip through JSON like the Storage-backed store. */
export class MemoryStore implements SnapshotStore {
  readonly files = new Map<string, string>();
  gets = 0;
  /** Every store call (get, put, list, delete): what a Storage or PostgREST request costs in Supabase logs. */
  requests = 0;
  puts = 0;

  get<T>(key: string): Promise<Snapshot<T> | null> {
    this.gets++;
    this.requests++;
    const raw = this.files.get(key);
    return Promise.resolve(raw === undefined ? null : (JSON.parse(raw) as Snapshot<T>));
  }
  put<T>(key: string, snapshot: Snapshot<T>): Promise<void> {
    this.puts++;
    this.requests++;
    this.files.set(key, JSON.stringify(snapshot));
    return Promise.resolve();
  }
  list(prefix: string): Promise<string[]> {
    this.requests++;
    return Promise.resolve([...this.files.keys()].filter((k) => k.startsWith(`${prefix}/`)));
  }
  delete(key: string): Promise<void> {
    this.requests++;
    this.files.delete(key);
    return Promise.resolve();
  }
  /** Convenience for tests: the data of a key, or undefined. */
  async data<T>(key: string): Promise<T | undefined> {
    return (await this.get<T>(key))?.data;
  }
  seed(key: string, data: unknown): Promise<void> {
    return this.put(key, { updatedAt: "2026-10-01T00:00:00Z", data });
  }
}
