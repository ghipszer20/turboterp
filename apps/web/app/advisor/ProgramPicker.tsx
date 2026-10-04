"use client";

// The program picker (Setup and What-if): every registered program, searchable, grouped by kind
// and college. Reads registry metadata only; no Program's requirements load here.

import { useState } from "react";
import type { ProgramKind } from "@turboterp/programs";
import { collegeName } from "@turboterp/plan/credit-caps";
import { Segmented } from "@/components/Segmented";
import { kindTabs, optionState, pickerGroups } from "@/lib/advisor/program-picker";
import { PROGRAM_OPTIONS, type ProgramOption } from "@/lib/advisor/programs";
import styles from "./advisor.module.css";

const KIND_NAME: Record<ProgramKind, string> = { major: "Major", minor: "Minor", certificate: "Certificate", special: "Special program" };
const TABS = kindTabs(PROGRAM_OPTIONS);

const title = (o: ProgramOption) => o.name.replace(/ \(.*\)$/, "");

/** ?q=astronomy starts the picker searching (a deep link; also used by screenshots). */
function initialQuery(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(location.search).get("q") ?? "";
}

export function ProgramPicker({ label, selected, onToggle }: { label: string; selected: string[]; onToggle: (id: string) => void }) {
  const [query, setQuery] = useState(initialQuery);
  const [kind, setKind] = useState<ProgramKind>("major");
  const groups = pickerGroups(PROGRAM_OPTIONS, { kind, query });
  const searching = query.trim() !== "";
  const chosen = selected.map((id) => PROGRAM_OPTIONS.find((o) => o.id === id)).filter((o): o is ProgramOption => o !== undefined);

  return (
    <div className={styles.picker}>
      {chosen.length ? (
        <ul className={styles.chips} aria-label="Chosen">
          {chosen.map((o) => (
            <li key={o.id} className={styles.chip}>
              <span>{o.short ?? title(o)}</span>
              <button type="button" className={styles.chipRemove} aria-label={`Remove ${o.name}`} onClick={() => onToggle(o.id)}>
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <input
        className={styles.input}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search majors, minors and programs"
        aria-label={`Search ${label.toLowerCase()}`}
      />
      {!searching && TABS.length > 1 ? (
        <Segmented<ProgramKind> label="Program type" options={TABS.map((t) => ({ value: t.kind, label: t.label }))} value={kind} onChange={setKind} />
      ) : null}
      {groups.length === 0 ? <p className={styles.panelNote}>No program matches “{query.trim()}”.</p> : null}
      {groups.map((g) => (
        <section key={g.title} className={styles.pickerGroup}>
          <h3 className={styles.pickerGroupTitle}>{g.title}</h3>
          <div className={styles.optionList} role="group" aria-label={`${label}: ${g.title}`}>
            {g.options.map((o) => {
              const { on, disabled, blocked } = optionState(o, selected);
              const base = o.track ? `${o.track} track` : KIND_NAME[o.kind];
              const sub = blocked ?? (searching ? `${base} · ${collegeName(o.college)}` : base);
              return (
                <button
                  key={o.id}
                  type="button"
                  className={styles.option}
                  aria-pressed={on}
                  aria-disabled={disabled || undefined}
                  onClick={disabled ? undefined : () => onToggle(o.id)}
                >
                  <span className={styles.optionCheck} aria-hidden="true">
                    {on ? "✓" : ""}
                  </span>
                  <span className={styles.optionText}>
                    <span className={styles.optionTitle}>{title(o)}</span>
                    <span className={styles.optionSub}>{sub}</span>
                  </span>
                  {!o.verified ? (
                    <span className={styles.unverified} title="The owner hasn't reviewed these requirements against the catalog yet.">
                      Unverified
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
