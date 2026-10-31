// One shared Seat Alerts store for the tab, the schedule bells and the Today card.
import { useEffect, useSyncExternalStore } from "react";
import { createSeatAlertsApi } from "@turboterp/app-core/seat-alerts/client";
import { registerIosDevice, type TokenStore } from "@turboterp/app-core/seat-alerts/device";
import { MAX_WATCHES, type WatchesResponse } from "@turboterp/app-core/seat-alerts/view";
import { apiHeaders, apiUrl } from "../config";
import { tokenStore } from "./deviceToken";
import { enablePush, existingPushToken, pushAvailability } from "./push";
import type { Availability } from "./decisions";

export type AlertsState = {
  /** needs-setup: no device yet (alerts off); unavailable: the API failed. */
  phase: "loading" | "needs-setup" | "ready" | "unavailable";
  data: WatchesResponse;
  availability: Availability;
  /** Set when permission was denied; "settings" means iOS won't ask again. */
  permission: "ok" | "denied" | "settings";
  notice: string | null;
};

const EMPTY: WatchesResponse = { term: "", watches: [], done: [], ended: 0 };

export function createAlertsStore(deps: { api: ReturnType<typeof createSeatAlertsApi>; tokens: TokenStore; availability: () => Availability }) {
  let state: AlertsState = { phase: "loading", data: EMPTY, availability: deps.availability(), permission: "ok", notice: null };
  const listeners = new Set<() => void>();
  const set = (p: Partial<AlertsState>) => {
    state = { ...state, ...p };
    listeners.forEach((l) => l());
  };

  async function refresh(): Promise<void> {
    const r = await deps.api.listWatches();
    if (r.ok) return set({ phase: "ready", data: r.data });
    set({ phase: r.status === 401 ? "needs-setup" : "unavailable", data: EMPTY });
  }

  return {
    getState: () => state,
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => void listeners.delete(l);
    },
    refresh,
    /** On launch: load watches; if permission was already granted, refresh the push token quietly. */
    async start() {
      await refresh();
      if (state.phase === "ready") {
        const t = await existingPushToken();
        if (t) await registerIosDevice(deps.api, deps.tokens, t);
      }
    },
    /** The student turned alerts on: permission, push token, device registration, then the list. */
    async enable(): Promise<boolean> {
      const r = await enablePush();
      if (!r.ok) {
        if (r.reason === "unavailable") set({ availability: deps.availability() });
        else
          set({
            permission: r.reason === "settings" ? "settings" : r.reason === "denied" ? "denied" : "ok",
            notice: r.reason === "error" ? "Couldn't turn on alerts. Try again." : null,
          });
        return false;
      }
      const reg = await registerIosDevice(deps.api, deps.tokens, r.expoToken);
      if (!reg.ok) {
        set({ notice: "Couldn't turn on alerts. Try again." });
        return false;
      }
      set({ permission: "ok", notice: null });
      await refresh();
      return true;
    },
    /** Returns an error code ("open-now", "limit", ...) or null. */
    async add(courseId: string, sectionId: string | null): Promise<string | null> {
      if (state.data.watches.length >= MAX_WATCHES) return "limit";
      const r = await deps.api.addWatch(courseId, sectionId);
      if (r.ok) await refresh();
      return r.ok ? null : r.error;
    },
    async done(id: string) {
      await deps.api.finishWatch(id);
      await refresh();
    },
    async remove(id: string) {
      await deps.api.removeWatch(id);
      await refresh();
    },
  };
}

export const alertsStore = createAlertsStore({
  api: createSeatAlertsApi({ baseUrl: apiUrl("/").replace(/\/$/, ""), headers: () => apiHeaders(), fetch: (url, init) => fetch(url, init), getToken: () => tokenStore.get() }),
  tokens: tokenStore,
  availability: pushAvailability,
});

let started = false;
function ensureStarted() {
  if (started) return;
  started = true;
  void alertsStore.start();
}
/** Loads the watches once per app session; screens call it on mount. */
export function useAlerts() {
  useEffect(ensureStarted, []);
  const s = useSyncExternalStore(alertsStore.subscribe, alertsStore.getState, alertsStore.getState);
  return { ...s, enable: alertsStore.enable, add: alertsStore.add, done: alertsStore.done, remove: alertsStore.remove, refresh: alertsStore.refresh };
}
