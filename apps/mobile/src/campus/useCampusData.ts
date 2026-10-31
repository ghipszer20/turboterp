import { useCallback, useEffect, useRef, useState } from "react";
import { fetchV1, V1_PATHS } from "@turboterp/app-core/api-v1/client";
import type { LibraryHours } from "@turboterp/campus-data";
import { config } from "../config";
import { isOfflineError } from "../today/model";
import { fixtureGyms, fixtureLibraries, fixtureRooms, FIXTURES_ON } from "./fixtures";
import { isGymsPayload, isLibrariesPayload, isRoomsPayload, type GymsPayload, type RoomsPayload } from "./model";

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

/** GET /api/v1/libraries */
export const useLibraries = (): LoadState<LibraryHours[]> => useV1(V1_PATHS.libraries, isLibrariesPayload, fixtureLibraries);
/** GET /api/v1/rooms */
export const useRooms = (): LoadState<RoomsPayload> => useV1(V1_PATHS.rooms, isRoomsPayload, fixtureRooms);
/** GET /api/v1/gyms */
export const useGyms = (): LoadState<GymsPayload> => useV1(V1_PATHS.gyms, isGymsPayload, fixtureGyms);
