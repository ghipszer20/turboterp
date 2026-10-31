import { describe, expect, it, vi } from "vitest";
import { encodeCatalogFile } from "@turboterp/plan/catalog-file";
import { createAdvisorData } from "../src/advisor/data-core";

const ok = (body: unknown) => ({ ok: true, json: async () => body });
const catalogFile = encodeCatalogFile(new Map(), { term: "Fall 2026", generatedAt: "x" });
const index = { v: 1, term: "Fall 2026", catalog: "catalog.json" };

describe("advisor data loader", () => {
  const make = (fetch: unknown) =>
    createAdvisorData({ fetch: fetch as never, url: (p) => `https://api.test${p}`, headers: () => ({ "x-turboterp-access": "k" }) });

  it("loads from /data/advisor with the lock header and caches per session", async () => {
    const fetch = vi.fn(async (url: string) => (url.endsWith("index.json") ? ok(index) : ok(catalogFile)));
    const data = make(fetch);
    expect((await data.loadCatalog()).status).toBe("ready");
    await data.loadCatalog();
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0]).toEqual(["https://api.test/data/advisor/index.json", { headers: { "x-turboterp-access": "k" } }]);
    expect(fetch.mock.calls[1]![0]).toBe("https://api.test/data/advisor/catalog.json");
  });

  it("reports offline on a network error and retries next time", async () => {
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("net"))
      .mockResolvedValueOnce(ok(index))
      .mockResolvedValueOnce(ok(catalogFile));
    const data = make(fetch);
    expect((await data.loadCatalog()).status).toBe("offline");
    expect((await data.loadCatalog()).status).toBe("ready");
  });

  it("reports missing when the server has no data", async () => {
    const data = make(vi.fn(async () => ({ ok: false, json: async () => null })));
    expect((await data.loadCatalog()).status).toBe("missing");
  });
});
