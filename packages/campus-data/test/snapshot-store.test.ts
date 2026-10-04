// FileSnapshotStore against a real temp directory (no network, no mocks).

import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { defaultSnapshotDir, FileSnapshotStore, SNAPSHOT_SCHEMA, snapshotOrLive } from "../src/snapshots/store.ts";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "turboterp-store-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("FileSnapshotStore", () => {
  it("returns null for a key that was never written", async () => {
    expect(await new FileSnapshotStore(dir).get("libraries/hours")).toBeNull();
  });

  it("reads back what was put, with its updatedAt", async () => {
    const store = new FileSnapshotStore(dir);
    await store.put("dining/2026-09-25/19", { updatedAt: "2026-09-25T09:00:00.000Z", data: { meals: ["Lunch"] } });
    expect(await store.get("dining/2026-09-25/19")).toEqual({
      updatedAt: "2026-09-25T09:00:00.000Z",
      data: { meals: ["Lunch"] },
    });
  });

  it("stores each key as a JSON file under the directory, one folder per key segment", async () => {
    const store = new FileSnapshotStore(dir);
    await store.put("dining/2026-09-25/19", { updatedAt: "2026-09-25T09:00:00.000Z", data: 1 });
    const file = JSON.parse(readFileSync(join(dir, "dining", "2026-09-25", "19.json"), "utf8"));
    expect(file).toMatchObject({ schema: SNAPSHOT_SCHEMA, key: "dining/2026-09-25/19", data: 1 });
  });

  it("replaces an existing snapshot and leaves no temp files behind", async () => {
    const store = new FileSnapshotStore(dir);
    await store.put("libraries/hours", { updatedAt: "2026-09-25T09:00:00.000Z", data: "old" });
    await store.put("libraries/hours", { updatedAt: "2026-09-25T10:00:00.000Z", data: "new" });
    expect((await store.get("libraries/hours"))?.data).toBe("new");
    expect(readdirSync(join(dir, "libraries"))).toEqual(["hours.json"]);
  });

  it("treats a snapshot written under another schema version as missing", async () => {
    mkdirSync(join(dir, "libraries"));
    writeFileSync(
      join(dir, "libraries", "hours.json"),
      JSON.stringify({ schema: SNAPSHOT_SCHEMA + 1, key: "libraries/hours", updatedAt: "x", data: [] }),
    );
    expect(await new FileSnapshotStore(dir).get("libraries/hours")).toBeNull();
  });

  it("treats an unreadable (corrupt) file as missing", async () => {
    mkdirSync(join(dir, "libraries"));
    writeFileSync(join(dir, "libraries", "hours.json"), "{ not json");
    expect(await new FileSnapshotStore(dir).get("libraries/hours")).toBeNull();
  });

  it("rejects keys that could escape the directory", async () => {
    const store = new FileSnapshotStore(dir);
    await expect(store.put("../evil", { updatedAt: "x", data: 1 })).rejects.toThrow(/invalid snapshot key/i);
    await expect(store.get("a//b")).rejects.toThrow(/invalid snapshot key/i);
  });

  it("lists keys stored under a prefix, without the .json suffix", async () => {
    const store = new FileSnapshotStore(dir);
    await store.put("rooms/2026-09-25/6745-23066", { updatedAt: "x", data: 1 });
    await store.put("rooms/2026-09-26/6745-23066", { updatedAt: "x", data: 1 });
    await store.put("dining/2026-09-25/19", { updatedAt: "x", data: 1 });
    expect((await store.list("rooms")).sort()).toEqual(["rooms/2026-09-25/6745-23066", "rooms/2026-09-26/6745-23066"]);
    expect(await store.list("dining")).toEqual(["dining/2026-09-25/19"]);
  });

  it("lists an empty array for a prefix with nothing stored", async () => {
    const store = new FileSnapshotStore(dir);
    expect(await store.list("rooms")).toEqual([]);
  });

  it("deletes a key so it reads back as missing", async () => {
    const store = new FileSnapshotStore(dir);
    await store.put("dining/2026-09-25/19", { updatedAt: "x", data: 1 });
    await store.delete("dining/2026-09-25/19");
    expect(await store.get("dining/2026-09-25/19")).toBeNull();
    expect(await store.list("dining")).toEqual([]);
  });

  it("deleting a key that was never written does not throw", async () => {
    const store = new FileSnapshotStore(dir);
    await expect(store.delete("dining/2026-09-25/19")).resolves.toBeUndefined();
  });
});

describe("defaultSnapshotDir", () => {
  it("uses TURBOTERP_SNAPSHOT_DIR when set", () => {
    expect(defaultSnapshotDir("/anywhere", { TURBOTERP_SNAPSHOT_DIR: "/data/snaps" })).toBe("/data/snaps");
  });

  it("resolves to <repo root>/.cache/snapshots from any workspace folder", () => {
    writeFileSync(join(dir, "package-lock.json"), "{}");
    mkdirSync(join(dir, "apps", "web"), { recursive: true });
    mkdirSync(join(dir, "packages", "campus-data"), { recursive: true });
    const expected = join(dir, ".cache", "snapshots");
    expect(defaultSnapshotDir(join(dir, "apps", "web"), {})).toBe(expected);
    expect(defaultSnapshotDir(join(dir, "packages", "campus-data"), {})).toBe(expected);
  });
});

describe("snapshotOrLive", () => {
  const live = () => {
    const calls = { n: 0 };
    return { calls, load: async () => (calls.n++, "live data") };
  };

  it("serves a snapshot, however old, without fetching live", async () => {
    const l = live();
    const got = await snapshotOrLive({ updatedAt: "2026-01-01T00:00:00.000Z", data: "snap" }, l.load);
    expect(got).toEqual({ data: "snap", updatedAt: "2026-01-01T00:00:00.000Z" });
    expect(l.calls.n).toBe(0);
  });

  it("fetches live only when there is no snapshot, with no updatedAt", async () => {
    const l = live();
    expect(await snapshotOrLive(null, l.load)).toEqual({ data: "live data", updatedAt: null });
    expect(l.calls.n).toBe(1);
  });
});
