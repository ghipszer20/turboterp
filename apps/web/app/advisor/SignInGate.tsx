"use client";

import { useState } from "react";
import { authConfigured, getAuthClient } from "@/lib/auth/client";
import { emailProblem, sendProblem } from "@/lib/auth/email";
import { accountControl } from "@/lib/auth/session-state";
import { useSession } from "@/lib/auth/use-session";
import { getAppSync } from "@/lib/sync/app-sync";
import { statusText } from "@/lib/sync/status";
import { useSaveStatus } from "@/lib/sync/use-sync";
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

  const google = async () => {
    setBusy(true);
    setError(null);
    try {
      const client = await getAuthClient();
      const { error: failed } = await client.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/advisor` },
      });
      if (failed) setError(sendProblem(failed));
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
          <p className={styles.gateIntro}>An account is optional. Signing in saves your plan and schedules to your account, so they follow you between devices.</p>
          <button type="button" className={styles.primaryButton} disabled={busy} onClick={google}>
            Continue with Google
          </button>
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

/** "Saved to your account" / "Saving…" / the could-not-save note, shown next to the account email. */
function SaveStatusLine() {
  const status = useSaveStatus();
  return (
    <p className={styles.fine} role="status">
      {statusText(status)}
    </p>
  );
}

/** Second tap of "Delete account": names what is deleted, then calls the server and signs this browser out. */
function DeleteConfirm({ onCancel }: { onCancel: () => void }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const remove = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const client = await getAuthClient();
      const { data } = await client.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("no session");
      const res = await fetch("/api/account/delete", { method: "POST", headers: { authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`delete ${res.status}`);
      getAppSync().engine.stop(true);
      // The user no longer exists, so the server-side sign-out can fail; the local session is cleared either way.
      await client.auth.signOut({ scope: "local" }).catch(() => undefined);
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  return (
    <div className={styles.gate} role="alertdialog" aria-label="Delete account">
      <p className={styles.fine}>
        Are you sure you want to delete your account, your saved plan and schedules? Your signed agreement is kept as a record, without your account.
      </p>
      {failed ? (
        <p className={styles.error} role="alert">
          Couldn&apos;t delete your account. Nothing was deleted. Try again later.
        </p>
      ) : null}
      <button type="button" className={styles.dangerButton} disabled={busy} onClick={remove}>
        Delete account
      </button>
      <button type="button" className={styles.linkButton} disabled={busy} onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}

/** Advisor header account UI: a quiet "Sign in" (opens the card below) or the signed-in address and "Sign out". */
export function AccountLine() {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const control = accountControl(authConfigured(), session.status);
  if (control === "none") return null;
  if (control === "account") {
    // The synced copies leave this browser before the session ends (shared computers).
    const signOut = () => void getAppSync().signOutAndClear();
    return (
      <>
        <p className={styles.fine}>
          {session.email}{" "}
          <button type="button" className={styles.linkButton} onClick={signOut}>
            Sign out
          </button>{" "}
          <button type="button" className={styles.linkButton} onClick={() => setConfirming(true)}>
            Delete account
          </button>
        </p>
        {confirming ? <DeleteConfirm onCancel={() => setConfirming(false)} /> : null}
        <SaveStatusLine />
      </>
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
