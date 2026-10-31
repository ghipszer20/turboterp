import { describe, expect, it, vi } from "vitest";
import { createScheduleLoader, type FetchLike } from "../src/schedule/loader";

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body });
const status = (n: number) => ({ ok: n < 400, status: n, json: async () => ({}) });
const urlOf = (p: string) => `https://x.test${p}`;

const indexFile = { v: 1, term: "202701", generatedAt: "t", courses: [["CMSC131", "Object-Oriented Programming I", 4, 4, 12]] };

describe("schedule loader", () => {
  it("loads the current term's index with the lock header and caches it", async () => {
    const f = vi.fn<FetchLike>(async (url) => (url.endsWith("/current") ? ok({ term: "202701" }) : ok(indexFile)));
    const loader = createScheduleLoader(f, urlOf, { "x-turboterp-access": "k" });
    const idx = await loader.index();
    expect(idx?.term).toBe("202701");
    expect(idx?.courses[0]).toMatchObject({ id: "CMSC131", credits: { min: 4, max: 4 }, sections: 12 });
    await loader.index();
    expect(f).toHaveBeenCalledTimes(2);
    expect(f).toHaveBeenCalledWith("https://x.test/api/schedule/202701/index", { headers: { "x-turboterp-access": "k" } });
  });

  it("returns null when there is no current term or the file is a 404", async () => {
    const none = createScheduleLoader(async () => status(404), urlOf, {});
    expect(await none.index()).toBeNull();
    expect(await none.sections("202701", "CMSC")).toBeNull();
    expect(await none.seats("202701")).toBeNull();
  });

  it("reports offline for a network failure and http for a bad status, and retries after either", async () => {
    let n = 0;
    const f: FetchLike = async (url) => {
      n++;
      if (n === 1) throw new TypeError("Network request failed");
      if (n === 2) return status(500);
      return url.endsWith("/current") ? ok({ term: "202701" }) : ok(indexFile);
    };
    const loader = createScheduleLoader(f, urlOf, {});
    await expect(loader.index()).rejects.toMatchObject({ kind: "offline" });
    await expect(loader.index()).rejects.toMatchObject({ kind: "http" });
    expect((await loader.index())?.term).toBe("202701");
  });
});
