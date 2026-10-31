// Loads the Advisor's static data (built by scripts/advisor-data.mts and served at /data/advisor/)
// the way the web does, and keeps it in memory for the session. Fetch is injected for tests.
import { decodeCatalogFile } from "@turboterp/plan/catalog-file";
import type { PlanCatalog } from "@turboterp/plan/catalog";

type Index = { v: number; term: string; terms?: string[]; catalog: string };

export type CatalogData = {
  catalog: PlanCatalog;
  term: string;
  terms: string[];
  list: { id: string; title: string; credits: number; genEd: string[] }[];
};

export type CatalogResult = { status: "ready"; data: CatalogData } | { status: "offline" } | { status: "missing" };

type FetchLike = (url: string, init?: { headers?: Record<string, string> }) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

export function createAdvisorData(deps: { fetch: FetchLike; url: (path: string) => string; headers: () => Record<string, string> }) {
  let cached: Promise<CatalogResult> | null = null;
  const getJson = async (path: string) => {
    const res = await deps.fetch(deps.url(`/data/advisor/${path}`), { headers: deps.headers() });
    return res.ok ? res.json() : null;
  };

  async function load(): Promise<CatalogResult> {
    let index: Index | null;
    try {
      index = (await getJson("index.json")) as Index | null;
    } catch {
      return { status: "offline" };
    }
    if (!index) return { status: "missing" };
    try {
      const file = await getJson(index.catalog);
      if (!file) return { status: "missing" };
      const { catalog, term } = decodeCatalogFile(file as Parameters<typeof decodeCatalogFile>[0]);
      const list = [...catalog.values()].map((c) => ({ id: c.id, title: c.title, credits: c.credits.min, genEd: c.genEd }));
      return { status: "ready", data: { catalog, term, terms: index.terms ?? [term], list } };
    } catch {
      return { status: "offline" };
    }
  }

  return {
    /** Cached per session; only a successful load is kept, so Retry re-fetches after a failure. */
    loadCatalog(): Promise<CatalogResult> {
      cached ??= load().then((r) => {
        if (r.status !== "ready") cached = null;
        return r;
      });
      return cached;
    },
  };
}
