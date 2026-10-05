"use client";

import { useState } from "react";
import { authConfigured, getAuthClient } from "@/lib/auth/client";
import { emailProblem, sendProblem } from "@/lib/auth/email";
import { accountControl } from "@/lib/auth/session-state";
import { useSession } from "@/lib/auth/use-session";
import styles from "./advisor.module.css";

/** Optional sign-in by emailed link, opened from the Advisor header. Any email address works. */
function SignInCard({ onClose }: { onClose: () => void }) {
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
    <section className={styles.gate} aria-label="Sign in">
      {sent ? (
        <>
          <h2 className={styles.gateTitle}>Check your email</h2>
          <p className={styles.gateIntro}>
            We sent a sign-in link to <strong>{sent}</strong>. Open it on this device to continue. If it isn&apos;t there in a minute, check your spam folder.
          </p>
          <button type="button" className={styles.ghostButton} onClick={() => (setSent(null), setError(null))}>
            Use a different address
          </button>
        </>
      ) : (
        <form className={styles.gate} onSubmit={submit} noValidate>
          <h2 className={styles.gateTitle}>Sign in</h2>
          <p className={styles.gateIntro}>An account is optional. Syncing your plan between devices is coming soon.</p>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Email address</span>
            <input
              className={styles.input}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="jdoe@example.com"
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
      <button type="button" className={styles.linkButton} onClick={onClose}>
        {sent ? "Done" : "Not now"}
      </button>
    </section>
  );
}

/** Advisor header account UI: a quiet "Sign in" (opens the card below) or the signed-in address and "Sign out". */
export function AccountLine() {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const control = accountControl(authConfigured(), session.status);
  if (control === "none") return null;
  if (control === "account") {
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
  return open ? (
    <SignInCard onClose={() => setOpen(false)} />
  ) : (
    <p className={styles.fine}>
      <button type="button" className={styles.linkButton} onClick={() => setOpen(true)}>
        Sign in
      </button>
    </p>
  );
}
