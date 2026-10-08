// The header's save-status line: derived from what is still unsaved plus the last save errors.
import type { DocKind } from "./decide";

export type SaveStatus = "saved" | "saving" | "error";

export const statusText = (s: SaveStatus) =>
  s === "saved" ? "Saved to your account" : s === "saving" ? "Saving…" : "Couldn't save to your account. It's still on this device.";

export function createSaveStatus(loadDirty: () => readonly DocKind[]) {
  const errors = new Set<DocKind>();
  const subs = new Set<() => void>();
  const emit = () => subs.forEach((s) => s());
  const get = (): SaveStatus => {
    if (errors.size) return "error";
    return loadDirty().length ? "saving" : "saved";
  };
  return {
    get,
    subscribe(fn: () => void) {
      subs.add(fn);
      return () => void subs.delete(fn);
    },
    notify: emit,
    onError(kind: DocKind) {
      errors.add(kind);
      emit();
    },
    localChanged(kind: DocKind) {
      errors.delete(kind);
      emit();
    },
    reset() {
      errors.clear();
      emit();
    },
  };
}
