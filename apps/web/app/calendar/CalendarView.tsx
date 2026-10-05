"use client";

import { useState } from "react";
import type { AcademicEvent } from "@turboterp/campus-data";
import { Segmented } from "@/components/Segmented";
import { Card, Row, Section } from "@/components/ui";
import { eventTitle, formatEventDate, groupByMonth, isHighlighted, isKeyEvent, isPast, nextEvent } from "@/lib/calendar";
import { allDayIcs } from "@/lib/schedule/ics";
import styles from "./calendar.module.css";

type Mode = "key" | "all";

function download(e: AcademicEvent) {
  const title = eventTitle(e);
  const ics = allDayIcs({ title, start: e.start, end: e.end, description: e.term });
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `turboterp-${e.start}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function DateRow({ e, today }: { e: AcademicEvent; today: string }) {
  const past = isPast(e, today);
  return (
    <div className={`${styles.item} ${isHighlighted(e) ? styles.highlight : ""} ${past ? styles.past : ""}`}>
      <Row
        title={eventTitle(e)}
        subtitle={`${formatEventDate(e)} · ${e.term}`}
        trailing={
          <button type="button" className={styles.add} onClick={() => download(e)} aria-label={`Add ${eventTitle(e)} to my calendar`}>
            Add
          </button>
        }
      />
    </div>
  );
}

export function CalendarView({ events, today }: { events: AcademicEvent[]; today: string }) {
  const [mode, setMode] = useState<Mode>("key");
  // Dates already behind us stay out of the way until asked for.
  const [earlier, setEarlier] = useState(false);
  const inMode = mode === "key" ? events.filter(isKeyEvent) : events;
  const hasEarlier = inMode.some((e) => isPast(e, today));
  const shown = earlier ? inMode : inMode.filter((e) => !isPast(e, today));
  const next = nextEvent(inMode, today);
  return (
    <>
      <Segmented
        label="Which dates to show"
        options={[
          { value: "key", label: "Key dates" },
          { value: "all", label: "All dates" },
        ]}
        value={mode}
        onChange={setMode}
      />
      {next ? (
        <Section title="Next up">
          <Card>
            <DateRow e={next} today={today} />
          </Card>
        </Section>
      ) : null}
      {hasEarlier ? (
        <button type="button" className={styles.earlier} onClick={() => setEarlier(!earlier)}>
          {earlier ? "Hide earlier dates" : "Show earlier dates"}
        </button>
      ) : null}
      {groupByMonth(shown).map((g) => (
        <Section key={g.key} title={g.title}>
          <Card>
            {g.events.map((e) => (
              <DateRow key={`${e.term}-${e.kind}-${e.label}-${e.start}`} e={e} today={today} />
            ))}
          </Card>
        </Section>
      ))}
    </>
  );
}
