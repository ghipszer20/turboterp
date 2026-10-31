// Size decision for transcript photos. The engine rejects images over LIMITS.maxImagePixels, and a
// 48 MP phone photo is over it, so long edges are capped before OCR. 3000 px keeps small transcript
// text readable and a 3000 x 4000 page is 12 MP, well under the cap.

export const MAX_LONG_EDGE = 3000;

export type ResizeTarget = { width: number } | { height: number } | null;

export function planResize(width: number, height: number, maxEdge: number = MAX_LONG_EDGE): ResizeTarget {
  if (!(width > 0) || !(height > 0)) return null;
  if (Math.max(width, height) <= maxEdge) return null;
  return width >= height ? { width: maxEdge } : { height: maxEdge };
}
