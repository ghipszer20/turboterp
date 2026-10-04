"use client";

import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Building } from "@turboterp/campus-data/buildings";
import type { Section } from "@turboterp/course-data/schedules";
import { sectionBlocks } from "@/lib/schedule/block-items";
import type { TimeScale } from "@/lib/schedule/calendar";
import { courseColor } from "@/lib/schedule/colors";
import type { FilterState } from "@/lib/schedule/filters";
import { tightWalkLine } from "@/lib/schedule/conflicts";
import { useBuildings } from "@/lib/schedule/use-buildings";
import { columnsFor, decodeLayout, visibleRows, type EncodedLayouts } from "@/lib/schedule/gallery";
import { pickSection } from "@/lib/schedule/sections";
import { WeekCalendar } from "./WeekCalendar";
import { TeacherStrip } from "./TeacherStrip";
import styles from "./builder.module.css";

const MIN_CARD = 250;
const MINI_COL = 170;
const ZOOM_COL = 360;
const HOVER_DELAY = 300; // owner: a short pause before the enlarged preview
const PRESS_DELAY = 350;
/** Card height: padding, day heads, the columns, and one strip row per course (18 px; 33 px with a Recommended reason line). */
const cardHeight = (courses: number, reasons = false) => 228 + (reasons ? 33 : 18) * courses;

export type GalleryData = {
  layouts: EncodedLayouts;
  scale: TimeScale;
  sectionByKey: ReadonlyMap<string, Section>;
  ratings: Readonly<Record<string, number>>;
  courseIds: string[];
  /** Set only for the Recommended sort: the strip then explains each pick. */
  gpas?: Readonly<Record<string, number>>;
};

/** The sections a card shows: for each interchangeable group, the best-rated instructor's. */
function cardSections(d: GalleryData, i: number): { picks: Section[]; groups: Section[][] } {
  const groups = decodeLayout(d.layouts, i, d.sectionByKey);
  return { groups, picks: groups.map((g) => pickSection(g, d.ratings)) };
}

const Card = memo(function Card({
  data,
  index,
  size,
  days,
  buildings,
}: {
  data: GalleryData;
  index: number;
  size: "mini" | "zoom";
  days: FilterState["days"];
  buildings: Building[];
}) {
  const { picks, groups } = cardSections(data, index);
  const items = picks.flatMap((s) => sectionBlocks(s, { color: courseColor(data.courseIds, s.courseId), size }));
  const walk = tightWalkLine(picks, buildings);
  return (
    <>
      <WeekCalendar size={size} scale={data.scale} items={items} height={size === "mini" ? MINI_COL : ZOOM_COL} days={days} />
      <TeacherStrip picks={picks} groups={groups} courseIds={data.courseIds} ratings={data.ratings} gpas={data.gpas} size={size} />
      {walk ? (
        <p className={styles.cardWalk} title={walk}>
          {walk}
        </p>
      ) : null}
    </>
  );
});

/**
 * The vertical gallery of mini week-calendars, one per distinct layout. Only the rows on
 * screen are rendered, so 100k+ layouts scroll like 10. Hovering a card for 300 ms (or
 * pressing and holding on touch) pops up a larger version; tapping opens the editor.
 */
export function Gallery({
  data,
  days,
  onOpen,
}: {
  data: GalleryData;
  days: FilterState["days"];
  onOpen: (picks: Section[]) => void;
}) {
  const buildings = useBuildings();
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [range, setRange] = useState({ first: 0, last: 3 });
  const [zoom, setZoom] = useState<{ index: number; rect: DOMRect } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pressed = useRef(false);

  const phone = width > 0 && width < 600;
  const colGap = phone ? 16 : 40;
  const rowGap = phone ? 28 : 44;
  const columns = width ? columnsFor(width, MIN_CARD, colGap) : 1;
  const rowHeight = cardHeight(data.courseIds.length, !!data.gpas) + rowGap;
  const rows = Math.ceil(data.layouts.count / columns);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setWidth(r.width);
      const next = visibleRows({
        scrollTop: window.scrollY,
        viewportHeight: window.innerHeight,
        listTop: r.top + window.scrollY,
        rowHeight,
        rowCount: rows,
        overscan: 2,
      });
      setRange((prev) => (prev.first === next.first && prev.last === next.last ? prev : next));
    };
    const frame = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [rowHeight, rows]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const hide = () => {
    clearTimeout(timer.current);
    setZoom(null);
  };
  const showLater = (index: number, el: HTMLElement, delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setZoom({ index, rect: el.getBoundingClientRect() }), delay);
  };

  const cards = useMemo(() => {
    const out: number[] = [];
    for (let r = range.first; r <= Math.min(range.last, rows - 1); r++) {
      for (let c = 0; c < columns; c++) {
        const i = r * columns + c;
        if (i < data.layouts.count) out.push(i);
      }
    }
    return out;
  }, [range, rows, columns, data.layouts.count]);

  return (
    <>
      <div ref={box} className={styles.gallery} style={{ height: Math.max(0, rows * rowHeight - rowGap) }}>
        <div
          className={styles.galleryRows}
          style={{
            transform: `translateY(${range.first * rowHeight}px)`,
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: `${rowGap}px ${colGap}px`,
          }}
        >
          {cards.map((i) => (
            <div
              key={i}
              className={styles.card}
              style={{ height: cardHeight(data.courseIds.length, !!data.gpas) }}
              role="button"
              tabIndex={0}
              aria-label={`Layout ${i + 1} of ${data.layouts.count}: open in the editor`}
              data-layout={i}
              onMouseEnter={(e) => showLater(i, e.currentTarget, HOVER_DELAY)}
              onMouseLeave={hide}
              onTouchStart={(e) => {
                pressed.current = false;
                const el = e.currentTarget;
                clearTimeout(timer.current);
                timer.current = setTimeout(() => {
                  pressed.current = true;
                  setZoom({ index: i, rect: el.getBoundingClientRect() });
                }, PRESS_DELAY);
              }}
              onTouchMove={hide}
              onTouchEnd={hide}
              onContextMenu={(e) => {
                if (pressed.current) e.preventDefault();
              }}
              onClick={() => {
                if (pressed.current) {
                  pressed.current = false;
                  return; // a press-and-hold was a preview, not a tap
                }
                hide();
                onOpen(cardSections(data, i).picks);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpen(cardSections(data, i).picks);
                }
              }}
            >
              <Card data={data} index={i} size="mini" days={days} buildings={buildings} />
            </div>
          ))}
        </div>
      </div>
      {zoom ? <Zoom data={data} days={days} index={zoom.index} rect={zoom.rect} buildings={buildings} /> : null}
    </>
  );
}

function Zoom({ data, days, index, rect, buildings }: { data: GalleryData; days: FilterState["days"]; index: number; rect: DOMRect; buildings: Building[] }) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(520, vw - 16);
  const h = ZOOM_COL + 80 + 22 * data.courseIds.length;
  const left = rect.right + 16 + w < vw ? rect.right + 16 : rect.left - w - 16 >= 8 ? rect.left - w - 16 : (vw - w) / 2;
  const top = Math.min(Math.max(8, rect.top - 40), vh - h - 8);
  return (
    <div className={styles.zoom} style={{ left, top, width: w }} aria-hidden="true">
      <div className={styles.zoomCard}>
        <Card data={data} index={index} size="zoom" days={days} buildings={buildings} />
      </div>
    </div>
  );
}
