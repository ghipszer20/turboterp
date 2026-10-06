import type { Status } from "../components/ui";

export type TileTone = "open" | "soon" | "closed";

/** Tone for a tile's status line; an unknown status reads as closed (gray). */
export function tileStatusTone(status: Status): TileTone {
  return status === "unknown" ? "closed" : status;
}

/** Cut a tile sub line at a word boundary with "…" so it stays within two lines on a 160px tile. */
export function clampSub(text: string, max = 72): string {
  if (text.length <= max) return text;
  const head = text.slice(0, max - 1);
  const cut = head.lastIndexOf(" ");
  const base = cut > 0 ? head.slice(0, cut) : head;
  return `${base.replace(/[\s,;:.-]+$/, "")}…`;
}
