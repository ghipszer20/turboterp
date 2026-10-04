"use client";

import { useState } from "react";
import { getAuthClient } from "@/lib/auth/client";
import { emailProblem, sendProblem } from "@/lib/auth/email";
import { useSession } from "@/lib/auth/use-session";
import styles from "./advisor.module.css";

/** Sign-in by emailed link, shown before the agreement. Terpmail addresses only. */
export function SignInGate() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = emailProblem(email);
    if (problem) return setError(problem);
    const address = email.trim().toLowerCase();
    setBusy(true);
    try {
      const client = await getAuthClient();
      const { error: failed } = await client.auth.signInWithOtp({
        email: address,
        options: { emailRedirectTo: `${window.location.origin}/advisor` },
      });
      if (failed) setError(sendProblem(failed));
      else setSent(address);
    } catch (thrown) {
      setError(sendProblem(thrown));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.eyebrow}>Advisor</p>
          <h1 className={styles.title}>{sent ? "Check your email" : "Sign in"}</h1>
        </div>
      </header>
      {sent ? (
        <div className={styles.gate}>
          <p className={styles.gateIntro}>
            We sent a sign-in link to <strong>{sent}</strong>. Open it on this device to continue. If it isn&apos;t there in a minute, check your spam folder.
          </p>
          <button type="button" className={styles.ghostButton} onClick={() => (setSent(null), setError(null))}>
            Use a different address
          </button>
        </div>
      ) : (
        <form className={styles.gate} onSubmit={submit} noValidate>
          <p className={styles.gateIntro}>Your plan is tied to your UMD account.</p>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Terpmail address</span>
            <input
              className={styles.input}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="jdoe@terpmail.umd.edu"
              value={email}
              onChange={(e) => (setEmail(e.target.value), setError(null))}
            />
          </label>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className={styles.primaryButton} disabled={busy}>
            Email me a sign-in link
          </button>
        </form>
      )}
    </main>
  );
}

/** Small signed-in line for the Advisor header: the address and a quiet sign-out. */
export function AccountLine() {
  const session = useSession();
  if (session.status !== "signed-in") return null;
  const signOut = () => void getAuthClient().then((c) => c.auth.signOut());
  return (
    <p className={styles.fine}>
      {session.email}{" "}
      <button type="button" className={styles.linkButton} onClick={signOut}>
        Sign out
      </button>
    </p>
  );
}
