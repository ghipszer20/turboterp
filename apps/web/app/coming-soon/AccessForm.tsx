"use client";

import { useState } from "react";
import styles from "./coming-soon.module.css";

/** A quiet "I have a code" link that opens a one-field form; the right code opens the site. */
export function AccessForm() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [state, setState] = useState<"idle" | "checking" | "wrong">("idle");

  if (!open) {
    return (
      <button type="button" className={styles.link} onClick={() => setOpen(true)}>
        I have an access code
      </button>
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState("checking");
    const res = await fetch("/api/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    }).catch(() => null);
    if (res?.ok) window.location.assign("/");
    else setState("wrong");
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <input
        className={styles.input}
        type="password"
        autoComplete="off"
        autoFocus
        aria-label="Access code"
        placeholder="Access code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button type="submit" className={styles.button} disabled={state === "checking" || code.trim() === ""}>
        {state === "checking" ? "Checking…" : "Open"}
      </button>
      {state === "wrong" ? (
        <p className={styles.wrong} role="alert">
          That code did not work.
        </p>
      ) : null}
    </form>
  );
}
