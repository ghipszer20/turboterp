import { useCallback, useEffect, useRef, useState } from "react";
import { fetchV1, V1_PATHS } from "@turboterp/app-core/api-v1/client";
import { clockAt, type CampusClock } from "@turboterp/app-core/campus-clock";
import { config } from "../config";
import { isOfflineError, isTodayPayload, type TodayPayload } from "./model";

export type TodayState = {
  status: "loading" | "ready" | "offline" | "error";
  data: TodayPayload | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
};

/** Loads /api/v1/today once, then on demand. A failed refresh keeps the data already on screen. */
export function useToday(): TodayState {
  const [data, setData] = useState<TodayPayload | null>(null);
  const [failure, setFailure] = useState<"offline" | "error" | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const live = useRef(true);

  const load = useCallback(async () => {
    const res = await fetchV1<TodayPayload>(V1_PATHS.today, {
      baseUrl: config.apiBaseUrl,
      accessToken: config.accessToken ?? undefined,
      check: isTodayPayload,
    });
    if (!live.current) return;
    if (res.ok) {
      setData(res.data);
      setFailure(null);
    } else {
      setFailure(isOfflineError(res.error) ? "offline" : "error");
    }
    setLoading(false);
  }, []);

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

  const status = data ? "ready" : loading ? "loading" : (failure ?? "error");
  return { status, data, refreshing, refresh };
}

/** The campus clock from the device, ticking each minute. */
export function useMinuteClock(): { clock: CampusClock; now: Date } {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return { clock: clockAt(now), now };
}
