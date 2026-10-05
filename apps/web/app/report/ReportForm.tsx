"use client";

import { useState, type FormEvent } from "react";
import { buildReportMailto } from "@/lib/about";
import styles from "./report.module.css";

/**
 * A short "report an issue" form. There's no server: Send just opens a
 * prefilled mailto: link to the contact address. If the contact email is
 * still a placeholder (owner hasn't set one up), the form has nothing to
 * send to, so it shows "coming soon" instead of a dead Send button.
 */
export function ReportForm({ contactEmail, issuesUrl }: { contactEmail: string | null; issuesUrl: string | null }) {
  const [what, setWhat] = useState("");
  const [page, setPage] = useState("");
  const [replyEmail, setReplyEmail] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contactEmail || !what.trim()) return;
    window.location.href = buildReportMailto(contactEmail, {
      what: what.trim(),
      page: page.trim(),
      replyTo: replyEmail.trim() || undefined,
    });
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
      <div className={styles.formFoot}>
        {contactEmail ? (
          <button type="submit" className={styles.sendButton} disabled={!what.trim()}>
            Send
          </button>
        ) : (
          <p className={styles.comingSoon}>
            Email reporting is coming soon.{issuesUrl ? " Use GitHub Issues below for now." : ""}
          </p>
        )}
      </div>
    </form>
  );
}
