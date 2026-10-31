// Each course gets one pastel (fill + ink) for its blocks, strip swatch and panel; the
// colors themselves are CSS variables (--c0-bg … in app/schedule/schedule.module.css) with
// light and dark variants.

export const COURSE_COLORS = 8;

export function courseColor(courseIds: readonly string[], courseId: string): number {
  const i = courseIds.indexOf(courseId);
  return i < 0 ? 0 : i % COURSE_COLORS;
}
