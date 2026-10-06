"use client";

import type { Weekday } from "@turboterp/course-data/schedules";
import { DAY_SHORT, dayBlocks, hourLabel, pct, WEEKDAYS, type BlockInput, type TimeScale } from "@/lib/schedule/calendar";
import { blockLabel, type BlockLabel } from "@/lib/schedule/block-items";
import type { FilterState } from "@/lib/schedule/filters";
import styles from "./calendar.module.css";

export type BlockData = BlockLabel;

type Size = "mini" | "zoom" | "large";
/**
 * One week, Monday to Friday, on the shared time scale with an hour label every hour.
 * Blocks always show two lines (course, then room or section) and scale the font to fit.
 * Ghosts (previews) are striped and dashed.
 */
export function WeekCalendar({
  size,
  scale,
  items,
  height,
  days,
  outlined,
  onBlockClick,
}: {
  size: Size;
  scale: TimeScale;
  items: BlockInput<BlockData>[];
  /** Column height in px. */
  height: number;
  /** Workday filters, shaded on gallery cards. */
  days?: FilterState["days"];
  /** Course whose blocks get the red outline (the class the side panel is for). */
  outlined?: string | null;
  onBlockClick?: (courseId: string) => void;
}) {
  const byDay = dayBlocks(items, scale);
  return (
    <div className={styles.grid} data-size={size}>
      <div className={styles.hours} style={{ height }} aria-hidden="true">
        {scale.hours.map((t) => (
          <span key={t} style={{ top: `${pct(scale, t)}%` }}>
            {hourLabel(t)}
          </span>
        ))}
      </div>
      {WEEKDAYS.map((d: Weekday) => {
        const rule = days?.[d];
        return (
          <div key={d} className={styles.colWrap}>
            <div className={styles.dayHead}>{DAY_SHORT[d]}</div>
            <div className={styles.col} style={{ height }} data-off={rule === "off" || undefined}>
              {rule && rule !== "off" ? (
                <div
                  className={styles.window}
                  style={{ top: `${pct(scale, rule.from)}%`, height: `${pct(scale, rule.to) - pct(scale, rule.from)}%` }}
                />
              ) : null}
              {scale.hours.map((t) => (
                <div key={t} className={styles.line} style={{ top: `${pct(scale, t)}%` }} />
              ))}
              {byDay[d].map((b) => {
                const label = blockLabel(b, size === "large" ? "week" : "gallery");
                const data = b.data!;
                const clickable = onBlockClick && !b.ghost;
                return (
                  <div
                    key={`${b.id}-${d}`}
                    className={styles.block}
                    data-color={data.color}
                    data-ghost={b.ghost || undefined}
                    data-outlined={(outlined === data.courseId && !b.ghost) || undefined}
                    role={clickable ? "button" : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    aria-label={clickable ? `${data.courseId} section ${data.sectionId}` : undefined}
                    onClick={clickable ? () => onBlockClick(data.courseId) : undefined}
                    onKeyDown={
                      clickable
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onBlockClick(data.courseId);
                            }
                          }
                        : undefined
                    }
                    style={{
                      top: `${b.top}%`,
                      height: `${b.height}%`,
                      left: `calc(${(b.lane / b.lanes) * 100}% + ${size === "mini" ? 2 : 3}px)`,
                      width: `calc(${100 / b.lanes}% - ${size === "mini" ? 4 : 6}px)`,
                    }}
                  >
                    <span className={styles.label}>
                      <span className={styles.labelMain}>{label.top}</span>
                      <span className={styles.labelSub}>{label.bottom}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
