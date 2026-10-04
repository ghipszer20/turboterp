"use client";

import { useState } from "react";
import type { Weekday } from "@turboterp/course-data/schedules";
import type { SortKey } from "@turboterp/course-data/sort";
import { clock, DAY_NAME, WEEKDAYS } from "@/lib/schedule/calendar";
import {
  applySameHours,
  SORT_OPTIONS,
  setDayOff,
  setWindow,
  type FilterState,
} from "@/lib/schedule/filters";
import styles from "./builder.module.css";

// The hours a student can pick for a workday window: 7am to 10pm.
const FIRST = 7 * 60;
const LAST = 22 * 60;
const TIMES = Array.from({ length: (LAST - FIRST) / 60 + 1 }, (_, i) => FIRST + i * 60);
const pos = (t: number) => ((t - FIRST) / (LAST - FIRST)) * 100;

function TimeSelect({ value, onChange, label }: { value: number; onChange: (t: number) => void; label: string }) {
  return (
    <select className={styles.time} value={value} aria-label={label} onChange={(e) => onChange(Number(e.target.value))}>
      {TIMES.map((t) => (
        <option key={t} value={t}>
          {clock(t)}
        </option>
      ))}
    </select>
  );
}

/**
 * "Your week": each weekday is either a day off (the "Day off" button, filled red with ✓ when
 * on; its label never changes) or has the hours you want class in. Then the same-hours
 * shortcut and the sort.
 */
export function WeekFilters({ filters, onChange }: { filters: FilterState; onChange: (f: FilterState) => void }) {
  const [allFrom, setAllFrom] = useState(9 * 60);
  const [allTo, setAllTo] = useState(17 * 60);

  return (
    <section className={styles.panel} aria-label="Your week">
      <div className={styles.panelHead}>
        <h2>Your week</h2>
        <span>Tap “Day off”, or choose the hours you want class</span>
      </div>
      <div className={styles.week}>
        {WEEKDAYS.map((d: Weekday) => {
          const rule = filters.days[d];
          const off = rule === "off";
          const from = rule && rule !== "off" ? rule.from : FIRST;
          const to = rule && rule !== "off" ? rule.to : LAST;
          return (
            <div key={d} className={styles.day} data-off={off || undefined}>
              <div className={styles.dayTop}>
                <span className={styles.dayName}>
                  <span className={styles.long}>{DAY_NAME[d]}</span>
                  <span className={styles.short}>{DAY_NAME[d].slice(0, 3)}</span>
                </span>
                <button
                  type="button"
                  className={styles.dayOff}
                  aria-pressed={off}
                  onClick={() => onChange(setDayOff(filters, d, !off))}
                >
                  Day off
                </button>
              </div>
              <div className={styles.times} aria-hidden={off || undefined}>
                <TimeSelect
                  label={`${DAY_NAME[d]} earliest class`}
                  value={from}
                  onChange={(t) => onChange(setWindow(filters, d, Math.min(t, LAST - 60), Math.max(to, t + 60)))}
                />
                <span>–</span>
                <TimeSelect
                  label={`${DAY_NAME[d]} latest class ends`}
                  value={to}
                  onChange={(t) => onChange(setWindow(filters, d, Math.min(from, Math.max(t, FIRST + 60) - 60), Math.max(t, FIRST + 60)))}
                />
              </div>
              <div className={styles.band} aria-hidden="true">
                {off ? null : <i style={{ left: `${pos(from)}%`, width: `${pos(to) - pos(from)}%` }} />}
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.row2}>
        <span className={styles.row2Label}>Same hours every day:</span>
        <TimeSelect label="Every day earliest class" value={allFrom} onChange={setAllFrom} />
        <span>–</span>
        <TimeSelect label="Every day latest class ends" value={allTo} onChange={setAllTo} />
        <button type="button" className={styles.apply} onClick={() => onChange(applySameHours(filters, allFrom, allTo))}>
          Apply to all days
        </button>
        {Object.keys(filters.days).length ? (
          <button type="button" className={styles.linkButton} onClick={() => onChange({ ...filters, days: {} })}>
            Reset week
          </button>
        ) : null}
        <label className={styles.sort}>
          <span className="visually-hidden">Sort</span>
          <select value={filters.sort} onChange={(e) => onChange({ ...filters, sort: e.target.value as SortKey })}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                Sort: {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
