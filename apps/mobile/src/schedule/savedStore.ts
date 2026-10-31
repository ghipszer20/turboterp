import { useSyncExternalStore } from "react";
import type { SavedSchedule } from "@turboterp/app-core/schedule/saved";
import { kvStore } from "../storage";
import { createSavedStore } from "./savedStoreCore";

/** The app-wide saved schedule (see savedStoreCore). */
export const savedStore = createSavedStore(kvStore);

export function useSaved(term: string | null): SavedSchedule | null {
  return useSyncExternalStore(
    savedStore.subscribe,
    () => (term ? savedStore.get(term) : null),
    () => null,
  );
}
