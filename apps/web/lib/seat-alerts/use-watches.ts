"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { addWatch, finishWatch, listWatches, removeWatch, subscribe } from "./client";
import { mockAllowed, mockWatches } from "./mock";
import { MAX_WATCHES, type WatchesResponse, type WatchRow } from "@turboterp/app-core/seat-alerts/view";

const EMPTY: WatchesResponse = { term: "", watches: [], done: [], ended: 0 };

/** True for `?mock=1` in development only (see mock.ts); the watches are then local example data. */
function useMock(): boolean {
  return useSyncExternalStore(
    () => () => undefined,
    () => mockAllowed(window.location.search),
    () => false,
  );
}

export type WatchesState = {
  /** "needs-setup": this device has no credential yet (alerts not turned on); "unavailable": the API failed. */
  phase: "loading" | "needs-setup" | "ready" | "unavailable";
  data: WatchesResponse;
  mock: boolean;
  /** Returns an error code ("open-now", "limit", ...) or null. */
  add: (courseId: string, sectionId: string | null) => Promise<string | null>;
  done: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  /** Turn alerts on for this device (permission, subscription, device token), then load its watches. Returns an error text or null. */
  enable: () => Promise<string | null>;
};

export function useWatches(): WatchesState {
  const mock = useMock();
  const [remote, setRemote] = useState<{ phase: "ready" | "needs-setup" | "unavailable"; data: WatchesResponse } | null>(null);
  const [mockData, setMockData] = useState<WatchesResponse | null>(null);
  const mockInitial = useMemo(() => (mock ? mockWatches() : EMPTY), [mock]);

  useEffect(() => {
    if (mock) return;
    let live = true;
    listWatches().then((r) => {
      if (!live) return;
      setRemote(r.ok ? { phase: "ready", data: r.data } : { phase: r.status === 401 ? "needs-setup" : "unavailable", data: EMPTY });
    });
    return () => {
      live = false;
    };
  }, [mock]);

  const phase: WatchesState["phase"] = mock
    ? "ready"
    : (remote?.phase ?? "loading");
  const data = mock ? (mockData ?? mockInitial) : (remote?.data ?? EMPTY);
  const setData = useCallback(
    (f: (d: WatchesResponse) => WatchesResponse) =>
      mock ? setMockData((m) => f(m ?? mockInitial)) : setRemote((r) => ({ phase: "ready", data: f(r?.data ?? EMPTY) })),
    [mock, mockInitial],
  );

  const reload = useCallback(async () => {
    const r = await listWatches();
    if (r.ok) setRemote({ phase: "ready", data: r.data });
  }, []);
  const enable = useCallback(async () => {
    const problem = await subscribe().catch(() => "Couldn't turn on alerts. Try again.");
    if (!problem) await reload();
    return problem;
  }, [reload]);

  const add = useCallback(
    async (courseId: string, sectionId: string | null) => {
      if (mock) {
        if (data.watches.length >= MAX_WATCHES) return "limit";
        const w: WatchRow = { id: `m-${Date.now()}`, term: data.term, courseId, sectionId, lastAlertAt: null, doneAt: null, status: null };
        setData((d) => ({ ...d, watches: [...d.watches, w] }));
        return null;
      }
      const r = await addWatch(courseId, sectionId);
      if (r.ok) await reload();
      return r.ok ? null : r.error;
    },
    [mock, data, reload, setData],
  );
  const gone = useCallback(
    async (id: string, call: typeof finishWatch, toDone: boolean) => {
      if (mock) {
        setData((d) => {
          const w = d.watches.find((x) => x.id === id);
          return { ...d, watches: d.watches.filter((x) => x.id !== id), done: toDone && w ? [{ ...w, doneAt: new Date().toISOString() }, ...d.done] : d.done };
        });
        return;
      }
      await call(id);
      await reload();
    },
    [mock, reload, setData],
  );

  return {
    phase,
    data,
    mock,
    add,
    done: (id) => gone(id, finishWatch, true),
    remove: (id) => gone(id, removeWatch, false),
    enable,
  };
}
