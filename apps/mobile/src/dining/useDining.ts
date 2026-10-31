import { useCallback, useEffect, useRef, useState } from "react";
import { fetchV1, V1_PATHS } from "@turboterp/app-core/api-v1/client";
import type { StampVenue } from "@turboterp/campus-data";
import { config } from "../config";
import { isOfflineError } from "../today/model";
import { fixtureBundle, fixtureStamp, FIXTURES_ON } from "./fixtures";
import { isDiningPayload, isFoodIndex, isStampPayload, type DiningBundle } from "./model";

export type LoadState<T> = {
  status: "loading" | "ready" | "offline" | "error";
  data: T | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
};

/** Loads a v1 path once, then on demand. A failed refresh keeps the data already on screen. */
function useV1<T>(path: string, check: (x: unknown) => x is T, fixture: () => T): LoadState<T> {
  const [data, setData] = useState<T | null>(null);
  const [failure, setFailure] = useState<"offline" | "error" | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const live = useRef(true);

  const load = useCallback(async () => {
    if (FIXTURES_ON) {
      if (live.current) {
        setData(fixture());
        setLoading(false);
      }
      return;
    }
    const res = await fetchV1<T>(path, { baseUrl: config.apiBaseUrl, accessToken: config.accessToken ?? undefined, check });
    if (!live.current) return;
    if (res.ok) {
      setData(res.data);
      setFailure(null);
    } else {
      setFailure(isOfflineError(res.error) ? "offline" : "error");
    }
    setLoading(false);
  }, [path, check, fixture]);

  useEffect(() => {
    live.current = true;
    void Promise.resolve().then(load);
    return () => {
      live.current = false;
    };
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    if (live.current) setRefreshing(false);
  }, [load]);

  return { status: data ? "ready" : loading ? "loading" : (failure ?? "error"), data, refreshing, refresh };
}

const diningFixture = () => ({ halls: [], bundle: fixtureBundle() });
const bundleFixture = () => fixtureBundle();
const stampFixture = () => fixtureStamp();

/** Today's halls and menus (GET /api/v1/dining). */
export function useDining() {
  return useV1(V1_PATHS.dining, isDiningPayload, diningFixture);
}

/** Stamp venue hours (GET /api/v1/dining/stamp). */
export function useStamp(): LoadState<StampVenue[]> {
  return useV1(V1_PATHS.stamp, isStampPayload, stampFixture);
}

/** The menus Find a food searches on the device (GET /api/v1/dining/search-index). */
export function useFoodIndex(): LoadState<DiningBundle> {
  return useV1(V1_PATHS.foodSearch, isFoodIndex, bundleFixture);
}
