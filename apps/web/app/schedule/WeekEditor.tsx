"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Section } from "@turboterp/course-data/schedules";
import type { CourseGrades } from "@turboterp/ratings";
import { sectionBlocks } from "@/lib/schedule/block-items";
import { untimed, type TimeScale } from "@/lib/schedule/calendar";
import { courseColor } from "@/lib/schedule/colors";
import { overlapNote, saveBlockedBy } from "@/lib/schedule/conflicts";
import { overlapsWith, sectionChoices } from "@/lib/schedule/sections";
import { useBuildings } from "@/lib/schedule/use-buildings";
import { dayWalks, formatWalk, walkNote } from "@/lib/schedule/walks";
import { SectionPanel } from "./SectionPanel";
import { TeacherStrip } from "./TeacherStrip";
import { WeekCalendar } from "./WeekCalendar";
import cal from "./calendar.module.css";
import styles from "./builder.module.css";

const PHONE = "(max-width: 899px)";
function subscribeMedia(onChange: () => void) {
  const mq = window.matchMedia(PHONE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const usePhone = () =>
  useSyncExternalStore(
    subscribeMedia,
    () => window.matchMedia(PHONE).matches,
    () => false,
  );

/**
 * A week you can edit: the large calendar, the teacher strip, and the section panel for
 * the class you click (red outline on its blocks). Used by the editor ("layout") and by
 * Build my own ("own", where courses can be unplaced and overlaps are allowed but flagged).
 */
export function WeekEditor({
  mode,
  courseIds,
  sectionsByCourse,
  picks,
  onPick,
  ratings,
  titles,
  scale,
  gradesFor,
  loadGrades,
  seatsUpdatedAt,
  header,
  initialOpen = null,
}: {
  mode: "layout" | "own";
  courseIds: string[];
  sectionsByCourse: ReadonlyMap<string, Section[]>;
  picks: Readonly<Record<string, Section>>;
  onPick: (courseId: string, s: Section | null) => void;
  ratings: Readonly<Record<string, number>>;
  titles: Readonly<Record<string, string>>;
  scale: TimeScale;
  gradesFor: (courseId: string) => Record<string, CourseGrades> | null | undefined;
  loadGrades: (courseId: string) => void;
  seatsUpdatedAt?: (courseId: string) => string | null;
  header: ReactNode;
  initialOpen?: string | null;
}) {
  const [open, setOpen] = useState<string | null>(initialOpen);
  const [preview, setPreview] = useState<Section | null>(null);
  const phone = usePhone();

  useEffect(() => {
    if (open) loadGrades(open);
  }, [open, loadGrades]);

  const placed = useMemo(() => courseIds.flatMap((c) => (picks[c] ? [picks[c]] : [])), [courseIds, picks]);
  const items = useMemo(() => {
    const out = placed.flatMap((s) => sectionBlocks(s, { color: courseColor(courseIds, s.courseId), size: "large" }));
    if (preview) out.push(...sectionBlocks(preview, { color: courseColor(courseIds, preview.courseId), size: "large", ghost: true }));
    return out;
  }, [placed, preview, courseIds]);
  const offGrid = untimed(items.filter((i) => !i.ghost));
  const conflicts = mode === "own" ? saveBlockedBy(placed) : [];
  const buildings = useBuildings();
  const walks = useMemo(() => dayWalks(placed, buildings), [placed, buildings]);
  const tightWalks = walks.filter((w) => w.tight);

  const openPanel = (courseId: string) => {
    setPreview(null);
    setOpen(courseId);
  };
  const close = () => {
    setPreview(null);
    setOpen(null);
  };
  const height = phone ? (open ? 300 : 420) : 520;
  const current = open ? (picks[open] ?? null) : null;

  return (
    <div className={styles.editor} data-panel={open ? "open" : undefined}>
      {header}
      <div className={styles.editorBody}>
        <div className={styles.editorMain}>
          <div className={styles.bigCard}>
            <WeekCalendar size="large" scale={scale} items={items} height={height} outlined={open} onBlockClick={openPanel} />
            {offGrid.length ? (
              <p className={styles.offGrid}>
                Not on the grid:{" "}
                {offGrid.map((i) => `${i.data!.courseId} ${i.data!.sub ?? ""} (${i.meeting.start === null ? "time TBA" : i.meeting.days.join("")})`).join("; ")}
              </p>
            ) : null}
            {walks.length ? (
              <ul className={styles.walkList} aria-label="Walking between classes (estimates)">
                {walks.map((w) => (
                  <li key={`${w.day}-${w.fromCourse}-${w.toCourse}`}>{formatWalk(w)}</li>
                ))}
              </ul>
            ) : null}
          </div>
          {tightWalks.length ? (
            <p className={styles.conflictNote} role="status">
              {tightWalks.map((w, i) => (
                <span key={`${w.day}-${w.fromCourse}-${w.toCourse}`}>
                  {i ? " " : ""}
                  <b>{walkNote(w)}</b> ({w.day} {w.from} → {w.to}).
                </span>
              ))}
            </p>
          ) : null}
          {conflicts.length ? (
            <p className={styles.conflictNote} role="status">
              <b>Overlap:</b> {overlapNote(conflicts)} You can’t register for overlapping sections; tap one to pick another
              time.
            </p>
          ) : null}
          {placed.length ? (
            <TeacherStrip picks={placed} courseIds={courseIds} ratings={ratings} size="large" />
          ) : null}
          {mode === "own" ? (
            <ul className={styles.ownList} aria-label="Your courses">
              {courseIds.map((c) => {
                const s = picks[c];
                return (
                  <li key={c} className={cal.course} data-color={courseColor(courseIds, c)}>
                    <span className={styles.swatch} />
                    <b>{c}</b>
                    <span className={styles.ownState}>{s ? `Section ${s.id}` : "Not placed yet"}</span>
                    <button
                      type="button"
                      className={s ? styles.linkButton : styles.apply}
                      onClick={() => openPanel(c)}
                      data-own-course={c}
                    >
                      {s ? "Change" : "Choose a section"}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.hint}>Click a class to see its other sections.</p>
          )}
        </div>
        {open ? (
          <SectionPanel
            key={open}
            courseId={open}
            title={titles[open] ?? ""}
            courseIds={courseIds}
            choices={sectionChoices(sectionsByCourse.get(open) ?? [], current)}
            current={current}
            preview={preview}
            ratings={ratings}
            grades={gradesFor(open)}
            seatsUpdatedAt={seatsUpdatedAt?.(open) ?? null}
            allSections={sectionsByCourse.get(open) ?? []}
            overlaps={mode === "own" ? (s) => overlapsWith(s, placed) : undefined}
            onPreview={(s) => setPreview(s && s.id !== current?.id ? s : null)}
            onCommit={(s) => {
              onPick(open, s);
              setPreview(null);
            }}
            onClose={close}
            onRemove={
              mode === "own"
                ? () => {
                    onPick(open, null);
                    setPreview(null);
                  }
                : undefined
            }
          />
        ) : null}
      </div>
    </div>
  );
}
