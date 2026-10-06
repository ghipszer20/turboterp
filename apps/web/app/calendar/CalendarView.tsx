"use client";

import { useState } from "react";
import type { AcademicEvent } from "@turboterp/campus-data";
import { Segmented } from "@/components/Segmented";
import { Card, Row, Section } from "@/components/ui";
import { calendarTitle, formatEventDate, groupByMonth, isHighlighted, isKeyEvent, isPast, nextEvent } from "@/lib/calendar";
import { allDayIcs } from "@/lib/schedule/ics";
import styles from "./calendar.module.css";

type Mode = "key" | "all";

function download(e: AcademicEvent) {
  const title = calendarTitle(e);
  const ics = allDayIcs({ title, start: e.start, end: e.end, description: e.description ? `${e.term}. ${e.description}` : e.term });
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `turboterp-${e.start}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const LONG_DESCRIPTION = 110;

function Description({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > LONG_DESCRIPTION;
  return (
    <div className={styles.desc}>
      <p className={`${styles.descText} ${long && !open ? styles.clamp : ""}`}>{text}</p>
      {long ? (
        <button type="button" className={styles.more} onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? "Less" : "More"}
        </button>
      ) : null}
    </div>
  );
}

function DateRow({ e, today }: { e: AcademicEvent; today: string }) {
  const past = isPast(e, today);
  const title = calendarTitle(e);
  return (
    <div className={`${styles.item} ${isHighlighted(e) ? styles.highlight : ""} ${past ? styles.past : ""}`}>
      <Row
        title={title}
        subtitle={`${formatEventDate(e)} · ${e.term}`}
        trailing={
          <button type="button" className={styles.add} onClick={() => download(e)} aria-label={`Add ${title} to my calendar`}>
            Add
          </button>
        }
      />
      {e.description ? <Description text={e.description} /> : null}
    </div>
  );
}

export function CalendarView({ events, today }: { events: AcademicEvent[]; today: string }) {
  const [mode, setMode] = useState<Mode>("all");
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
          { value: "all", label: "All dates" },
          { value: "key", label: "Key dates" },
        ]}
        value={mode}
        onChange={setMode}
      />
      {next ? (
        <Section title="Next up">
          <Card className={styles.card}>
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
          <Card className={styles.card}>
            {g.events.map((e) => (
              <DateRow key={`${e.term}-${e.kind}-${e.label}-${e.start}`} e={e} today={today} />
            ))}
          </Card>
        </Section>
      ))}
    </>
  );
}
