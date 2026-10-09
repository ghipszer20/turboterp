"use client";

// Group fitness classes: a day picker, kind and place filters, and one "Sign up"
// link per class that opens the class's ActiveTerp page in a new tab.
//
// Hard rules (owner/legal): ActiveTerp is only LINKED to, never fetched,
// scraped or automated, and the app never asks for or handles UMD credentials.

import { useEffect, useState } from "react";
import type { ClassKind, ClassPlace, FitnessClass } from "@turboterp/campus-data";
import { Chip, Segmented } from "@/components/Segmented";
import { Card, EmptyState, Row } from "@/components/ui";
import { useCampusMinutes } from "@/lib/useCampusMinutes";
import {
  CLASS_KINDS,
  CLASS_PLACES,
  clockLabel,
  filterClasses,
  signupNote,
  weekdayOf,
  WEEKDAYS,
} from "@/lib/fitness-classes";
import styles from "./classes.module.css";

const FIRST_TIME_KEY = "turboterp-fitness-first-time-dismissed";
const ACTIVETERP = "https://activeterp.umd.edu/";

export function ClassesSection({
  classes,
  todayIso,
  initialMinutes,
}: {
  classes: FitnessClass[];
  todayIso: string;
  initialMinutes: number;
}) {
  const today = weekdayOf(todayIso);
  const minutes = useCampusMinutes(initialMinutes);
  const [day, setDay] = useState(today);
  const [kind, setKind] = useState<ClassKind | null>(null);
  const [place, setPlace] = useState<ClassPlace | null>(null);
  // Hidden until the device's choice is read, so a dismissed card never flashes.
  const [showFirstTime, setShowFirstTime] = useState(false);

  useEffect(() => {
    try {
      setShowFirstTime(localStorage.getItem(FIRST_TIME_KEY) !== "1");
    } catch {
      setShowFirstTime(true);
    }
  }, []);

  function dismiss() {
    setShowFirstTime(false);
    try {
      localStorage.setItem(FIRST_TIME_KEY, "1");
    } catch {
      // Private mode: the card just comes back next visit.
    }
  }

  // Start the week at today so "Today" is first and the rest follow in order.
  const todayIdx = WEEKDAYS.indexOf(today as (typeof WEEKDAYS)[number]);
  const days = Array.from({ length: 7 }, (_, i) => WEEKDAYS[(todayIdx + i) % 7]!);
  const rows = filterClasses(classes, { day, kind, place });

  return (
    <>
      {showFirstTime ? (
        <div className={styles.firstTime} role="note">
          <p className={styles.firstTimeText}>
            <strong>First time?</strong> Add the free Group Fitness Membership on{" "}
            <a href={ACTIVETERP} target="_blank" rel="noreferrer">
              ActiveTerp
            </a>{" "}
            and sign the waiver.
          </p>
          <button type="button" className={styles.dismiss} onClick={dismiss} aria-label="Dismiss">
            Got it
          </button>
        </div>
      ) : null}
      <Segmented
        label="Day"
        options={days.map((d, i) => ({ value: d, label: i === 0 ? "Today" : d.slice(0, 3) }))}
        value={day}
        onChange={setDay}
      />
      <div className={styles.chips} role="group" aria-label="Class type">
        {CLASS_KINDS.map((k) => (
          <Chip key={k} pressed={kind === k} onClick={() => setKind(kind === k ? null : k)}>
            {k}
          </Chip>
        ))}
      </div>
      <div className={styles.chips} role="group" aria-label="Place">
        {CLASS_PLACES.map((p) => (
          <Chip key={p} pressed={place === p} onClick={() => setPlace(place === p ? null : p)}>
            {p}
          </Chip>
        ))}
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No classes match">Try another day or clear a filter.</EmptyState>
      ) : (
        <Card>
          {rows.map((c, i) => {
            const note = signupNote(c, todayIso, minutes);
            const when = c.end === undefined ? clockLabel(c.start) : `${clockLabel(c.start)} – ${clockLabel(c.end)}`;
            return (
              <Row
                key={`${c.day}-${c.start}-${c.name}-${c.location}-${i}`}
                title={c.name}
                subtitle={
                  <>
                    {when} · {c.location}
                    {c.instructor ? ` · ${c.instructor}` : ""}
                    {note && day === c.day ? <span className={styles.note}>{note}</span> : null}
                  </>
                }
                trailing={
                  c.signupUrl ? (
                    <a className={styles.signUp} href={c.signupUrl} target="_blank" rel="noreferrer">
                      Sign up
                    </a>
                  ) : null
                }
              />
            );
          })}
        </Card>
      )}
    </>
  );
}
