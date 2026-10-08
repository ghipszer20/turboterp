// A tiny seam between the local stores and the sync engine, so the stores never import the engine.
import type { DocKind } from "./decide";

let listener: ((kind: DocKind) => void) | null = null;

export function setLocalChangedListener(fn: ((kind: DocKind) => void) | null): void {
  listener = fn;
}

/** Called by a store after the student (not the account) changed a document. */
export function localChanged(kind: DocKind): void {
  listener?.(kind);
}

let consentListener: (() => void) | null = null;

export function setConsentSavedListener(fn: (() => void) | null): void {
  consentListener = fn;
}

/** Called after the student signs the agreement, so the record can be sent. */
export function consentSaved(): void {
  consentListener?.();
}
