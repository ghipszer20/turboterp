// A section's meetings as calendar blocks (labels per calendar size).

import type { Section } from "@turboterp/course-data/schedules";
import type { BlockInput } from "./calendar";

export type BlockLabel = { courseId: string; sectionId: string; color: number; label: string; sub?: string };

export function sectionBlocks(
  s: Section,
  o: { color: number; size: "mini" | "zoom" | "large"; ghost?: boolean },
): BlockInput<BlockLabel>[] {
  const label = o.size === "mini" ? s.courseId.slice(4) : o.ghost ? `${s.courseId} · ${s.id}` : s.courseId;
  return s.meetings.map((m, i) => {
    const room = [m.building, m.room].filter(Boolean).join(" ");
    const sub = [room, m.type === "Lecture" ? "" : m.type].filter(Boolean).join(" · ");
    return {
      id: `${s.courseId}/${s.id}/${i}`,
      meeting: m,
      ghost: o.ghost,
      data: { courseId: s.courseId, sectionId: s.id, color: o.color, label, sub: sub || undefined },
    };
  });
}
