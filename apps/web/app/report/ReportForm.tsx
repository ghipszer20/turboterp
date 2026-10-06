"use client";

import { useState, type FormEvent } from "react";
import { reportOutcome } from "@/lib/email/report-messages";
import styles from "./report.module.css";

/**
 * A short "report an issue" form. Send posts to /api/report, which emails the
 * owner from the server. Typed text is kept when sending fails.
 */
export function ReportForm({ issuesUrl }: { issuesUrl: string | null }) {
  const [what, setWhat] = useState("");
  const [page, setPage] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [website, setWebsite] = useState(""); // hidden trap field: real people never fill it
  const [state, setState] = useState<{ phase: "idle" | "sending" | "sent" | "error"; message?: string }>({ phase: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!what.trim() || state.phase === "sending") return;
    setState({ phase: "sending" });
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ what, page, replyTo: replyEmail.trim() || undefined, website }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      const out = reportOutcome(res.status, data?.error ?? null);
      if (out.ok) {
        setWhat("");
        setPage("");
        setReplyEmail("");
      }
      setState({ phase: out.ok ? "sent" : "error", message: out.message });
    } catch {
      setState({ phase: "error", message: reportOutcome(0, null).message });
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span className={styles.label}>What happened</span>
        <textarea
          className={styles.textarea}
          value={what}
          onChange={(e) => setWhat(e.target.value)}
          placeholder="Describe what went wrong"
          maxLength={5000}
          required
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Which page</span>
        <input
          className={styles.input}
          type="text"
          value={page}
          onChange={(e) => setPage(e.target.value)}
          placeholder="e.g. Schedule builder"
          maxLength={200}
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Your email (optional, so we can reply)</span>
        <input
          className={styles.input}
          type="email"
          value={replyEmail}
          onChange={(e) => setReplyEmail(e.target.value)}
          placeholder="jdoe@example.com"
        />
      </label>
      <div className={styles.trap} aria-hidden="true">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>
      <div className={styles.formFoot}>
        <button type="submit" className={styles.sendButton} disabled={!what.trim() || state.phase === "sending"}>
          {state.phase === "sending" ? "Sending…" : "Send"}
        </button>
        {state.message ? (
          <p className={styles.comingSoon} role="status">
            {state.message}
            {state.phase === "error" && issuesUrl ? " You can use GitHub Issues below instead." : ""}
          </p>
        ) : null}
      </div>
    </form>
  );
}
