"use client";

import { useState } from "react";
import { acceptConsent, CONSENT_CHECKBOX, CONSENT_POINTS, CONSENT_TITLE } from "@/lib/advisor/consent";
import { saveConsent } from "./store";
import styles from "./advisor.module.css";

/** The typed-name agreement. There is no way past it without signing. */
export function DisclaimerGate() {
  const [name, setName] = useState("");
  const [ticked, setTicked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = acceptConsent(name, ticked, new Date());
    if (result.ok) saveConsent(result.record);
    else setError(result.error);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.eyebrow}>Advisor</p>
          <h1 className={styles.title}>{CONSENT_TITLE}</h1>
        </div>
      </header>
      <form className={styles.gate} onSubmit={submit} aria-labelledby="gate-intro">
        <p id="gate-intro" className={styles.gateIntro}>
          TurboTerp can check a four-year plan against your requirements. Please read this and sign before you start.
        </p>
        <ol className={styles.gatePoints}>
          {CONSENT_POINTS.map((p) => (
            <li key={p.title}>
              <strong>{p.title}.</strong> {p.body}
            </li>
          ))}
        </ol>
        <label className={styles.checkRow}>
          <input type="checkbox" checked={ticked} onChange={(e) => (setTicked(e.target.checked), setError(null))} />
          <span>{CONSENT_CHECKBOX}</span>
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Type your full name to sign</span>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => (setName(e.target.value), setError(null))}
            autoComplete="name"
            placeholder="Full name"
          />
        </label>
        <p className={styles.gateDate}>Date: {today}</p>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className={styles.primaryButton}>
          I agree
        </button>
        <p className={styles.fine}>Saved on this device only. If the wording changes, you&apos;ll be asked to sign again.</p>
      </form>
    </main>
  );
}
