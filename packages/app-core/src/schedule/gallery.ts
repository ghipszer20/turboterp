// Gallery plumbing: how many cards per row, which rows to render (virtualized, so 100k+
// layouts scroll as smoothly as 10), and a compact transfer format for layouts coming
// back from the Web Worker (each interchangeable-section group once, layouts as numbers).

import type { Layout, Section } from "@turboterp/course-data/schedules";

export function columnsFor(width: number, minCard: number, gap: number): number {
  return Math.max(1, Math.floor((width + gap) / (minCard + gap)));
}

export function visibleRows(o: {
  scrollTop: number;
  viewportHeight: number;
  /** Distance from the top of the scrolling page to the first row. */
  listTop: number;
  rowHeight: number;
  rowCount: number;
  overscan: number;
}): { first: number; last: number } {
  if (o.rowCount === 0) return { first: 0, last: -1 };
  const top = o.scrollTop - o.listTop;
  const first = Math.max(0, Math.min(o.rowCount - 1, Math.floor(top / o.rowHeight) - o.overscan));
  const last = Math.max(first, Math.min(o.rowCount - 1, Math.floor((top + o.viewportHeight) / o.rowHeight) + o.overscan));
  return { first, last };
}

export type EncodedLayouts = {
  courseIds: string[];
  count: number;
  /** Section ids of each distinct group, in first-seen order. */
  groups: string[][];
  /** count × courseIds.length group indices, layout by layout. */
  table: Uint32Array;
};

export function encodeLayouts(courseIds: string[], layouts: readonly Layout[]): EncodedLayouts {
  const index = new Map<Section[], number>();
  const groups: string[][] = [];
  const table = new Uint32Array(layouts.length * courseIds.length);
  layouts.forEach((layout, i) => {
    layout.forEach((group, k) => {
      let g = index.get(group);
      if (g === undefined) {
        g = groups.push(group.map((s) => s.id)) - 1;
        index.set(group, g);
      }
      table[i * courseIds.length + k] = g;
    });
  });
  return { courseIds, count: layouts.length, groups, table };
}

/** Layout `i` as section groups, from sections keyed "COURSE/ID". */
export function decodeLayout(enc: EncodedLayouts, i: number, sections: ReadonlyMap<string, Section>): Layout {
  const k = enc.courseIds.length;
  return enc.courseIds.map((courseId, c) =>
    enc.groups[enc.table[i * k + c]!]!.map((id) => sections.get(`${courseId}/${id}`)!),
  );
}
