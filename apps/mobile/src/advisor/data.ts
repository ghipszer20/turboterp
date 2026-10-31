import { useCallback, useEffect, useState } from "react";
import { apiHeaders, apiUrl } from "../config";
import { createAdvisorData, type CatalogResult } from "./data-core";

export const advisorData = createAdvisorData({
  fetch: (url, init) => fetch(url, init),
  url: (path) => apiUrl(path),
  headers: () => apiHeaders(),
});

/** The course catalog; result is null while loading. `retry` re-fetches after offline or missing. */
export function useCatalog(): { result: CatalogResult | null; retry: () => void } {
  const [result, setResult] = useState<CatalogResult | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    advisorData.loadCatalog().then((r) => live && setResult(r));
    return () => {
      live = false;
    };
  }, [tick]);
  const retry = useCallback(() => {
    setResult(null);
    setTick((t) => t + 1);
  }, []);
  return { result, retry };
}
