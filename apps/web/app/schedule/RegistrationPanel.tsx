"use client";

// "Get ready to register": the checklist for the next registration term. Appointments are typed
// in by hand and holds are a manual check-off; TurboTerp never asks for Testudo credentials.

import { useMemo, useSyncExternalStore } from "react";
import type { Section } from "@turboterp/course-data/schedules";
import { Card } from "@/components/ui";
import { eventTitle, formatEventDate } from "@/lib/calendar";
import { meetingSummary } from "@/lib/schedule/sections";
import {
  appointmentIcs,
  parsePrep,
  registrationChecklist,
  setAppointment,
  toggleChecked,
  type Checklist,
  type ChecklistInput,
} from "@/lib/schedule/registration";
import { prepStore } from "@/lib/schedule/registration-store";
import styles from "./registration.module.css";

type Props = Omit<ChecklistInput, "prep" | "now"> & { titles: Record<string, string> };

const sectionLabel = (s: Section) => `${s.id} · ${meetingSummary(s)}`;

export function RegistrationPanel(props: Props) {
  const raw = useSyncExternalStore(prepStore.subscribe, prepStore.getSnapshot, prepStore.getServerSnapshot);
  const prep = useMemo(() => parsePrep(raw)[props.term], [raw, props.term]);
  const list = registrationChecklist({ ...props, prep, now: new Date() });
  const { term, termName } = props;

  const download = (appointment: string) => {
    const url = URL.createObjectURL(new Blob([appointmentIcs(termName, appointment)], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `turboterp-registration-${term}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section id="register" className={styles.panel} aria-label="Get ready to register">
      <h2 className={styles.title}>Get ready to register</h2>
      {list.status === "wrong-term" ? (
        <p className={styles.note}>{list.message}</p>
      ) : list.status === "no-courses" ? (
        <p className={styles.note}>Add your courses above and your registration checklist for {termName} appears here.</p>
      ) : list.status === "not-published" ? (
        <p className={styles.note}>{termName}’s Schedule of Classes isn’t published yet. Check back once it is.</p>
      ) : (
        <Body list={list} term={term} termName={termName} titles={props.titles} download={download} />
      )}
    </section>
  );
}

function Body({
  list,
  term,
  termName,
  titles,
  download,
}: {
  list: Extract<Checklist, { status: "ready" }>;
  term: string;
  termName: string;
  titles: Record<string, string>;
  download: (appointment: string) => void;
}) {
  return (
    <>
      {list.windows.length ? (
        <p className={styles.note}>{list.windows.map((w) => `${eventTitle(w)}: ${formatEventDate(w)}`).join(" · ")}</p>
      ) : null}
      <Card>
        <ul className={styles.list}>
          {list.courses.map((c) => (
            <li key={c.courseId} className={styles.item}>
              <div>
                <strong>{c.courseId}</strong>
                {titles[c.courseId] ? <span className={styles.muted}> {titles[c.courseId]}</span> : null}
              </div>
              {c.chosen ? (
                <>
                  <div>{sectionLabel(c.chosen)}</div>
                  {c.seat?.kind === "open" ? (
                    <div className={styles.muted}>{c.seat.open} open seats</div>
                  ) : c.seat ? (
                    <div className={styles.full}>{c.seat.note}</div>
                  ) : null}
                  <div className={styles.muted}>
                    {c.backups.length ? `Backups: ${c.backups.map(sectionLabel).join(" · ")}` : "No backup section available"}
                  </div>
                </>
              ) : (
                <div className={styles.muted}>Pick a section (a saved plan or Build my own) to prepare this one.</div>
              )}
            </li>
          ))}
        </ul>
        {list.asOf ? (
          <p className={styles.asOf}>Seat data as of {new Date(list.asOf).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
        ) : null}
      </Card>
      <Card>
        <ul className={styles.list}>
          {list.manual.map((m) => (
            <li key={m.id} className={styles.item}>
              <label className={styles.check}>
                <input type="checkbox" checked={m.done} onChange={() => prepStore.update((p) => toggleChecked(p, term, m.id))} />
                {m.label}
              </label>
            </li>
          ))}
          <li className={styles.item}>
            <label className={styles.check} htmlFor="reg-appointment">
              Your registration appointment
            </label>
            <div className={styles.appt}>
              <input
                id="reg-appointment"
                type="datetime-local"
                value={list.appointment ?? ""}
                onChange={(e) => prepStore.update((p) => setAppointment(p, term, e.target.value || null))}
              />
              {list.appointment ? (
                <button type="button" className={styles.primary} onClick={() => download(list.appointment!)}>
                  Add to calendar
                </button>
              ) : null}
            </div>
            <p className={styles.muted}>
              Find it in Testudo and type it here (Eastern time). The calendar file reminds you 1 day and 15 minutes before for {termName}.
            </p>
          </li>
        </ul>
      </Card>
    </>
  );
}
