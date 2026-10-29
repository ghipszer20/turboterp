"use client";

import { useState } from "react";
import { getAuthClient } from "@/lib/auth/client";
import { emailProblem, sendProblem } from "@/lib/auth/email";
import { useCodeEntry } from "@/lib/auth/use-code-entry";
import styles from "./alerts.module.css";

/** The Advisor's sign-in (Google or an emailed link), coming back to Seat Alerts. */
export function SignInCard() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const entry = useCodeEntry(sent ?? "", setError);
  const redirectTo = () => `${window.location.origin}/schedule/alerts`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = emailProblem(email);
    if (problem) return setError(problem);
    const address = email.trim().toLowerCase();
    setBusy(true);
    try {
      const client = await getAuthClient();
      const { error: failed } = await client.auth.signInWithOtp({ email: address, options: { emailRedirectTo: redirectTo() } });
      if (failed) setError(sendProblem(failed));
      else setSent(address);
    } catch (thrown) {
      setError(sendProblem(thrown));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    setError(null);
    try {
      const client = await getAuthClient();
      const { error: failed } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
      if (failed) setError(sendProblem(failed));
    } catch (thrown) {
      setError(sendProblem(thrown));
    } finally {
      setBusy(false);
    }
  };

  if (sent)
    return (
      <section className={styles.tile} aria-label="Sign in">
        <h2 className={styles.title}>Check your email</h2>
        <p className={styles.sub}>
          We sent a sign-in link to <strong>{sent}</strong>. Open the link, or enter the code from the email:
        </p>
        <form onSubmit={entry.verify} noValidate>
          <input
            className={styles.input}
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label="Sign-in code"
            value={entry.code}
            onChange={(e) => entry.change(e.target.value)}
          />
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className={styles.primary} disabled={entry.busy}>
            Sign in
          </button>
        </form>
        <div className={styles.actions}>
          <button type="button" className={styles.link} onClick={() => (setSent(null), setError(null))}>
            Use a different address
          </button>
        </div>
      </section>
    );

  return (
    <form className={styles.tile} onSubmit={submit} noValidate aria-label="Sign in">
      <h2 className={styles.title}>Sign in to get seat alerts</h2>
      <p className={styles.sub}>Alerts belong to your account, so they reach every device you turn them on for.</p>
      <button type="button" className={styles.primary} disabled={busy} onClick={google}>
        Continue with Google
      </button>
      <input
        className={styles.input}
        type="email"
        inputMode="email"
        autoComplete="email"
        aria-label="Email address"
        placeholder="jdoe@example.com"
        value={email}
        onChange={(e) => (setEmail(e.target.value), setError(null))}
      />
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className={styles.ghost} disabled={busy}>
        Email me a sign-in link
      </button>
    </form>
  );
}
