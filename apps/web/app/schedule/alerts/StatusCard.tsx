"use client";

import { useEffect, useState } from "react";
import {
  alertsStatus,
  currentPushEnv,
  currentSubscription,
  permissionStatus,
  pushSupport,
  sendTestAlert,
  subscribe,
  unsubscribe,
  type PermissionState,
  type PushSupport,
} from "@/lib/seat-alerts/client";
import styles from "./alerts.module.css";

/** The status line for this device (on, off, blocked, unavailable) with its one action. */
export function StatusCard({ mock }: { mock: boolean }) {
  const [support, setSupport] = useState<PushSupport>("supported");
  const [permission, setPermission] = useState<PermissionState>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (mock) return;
    let live = true;
    Promise.resolve().then(async () => {
      const s = pushSupport(currentPushEnv());
      const sub = s === "supported" ? await currentSubscription() : null;
      if (!live) return;
      setSupport(s);
      if (s === "supported") {
        setPermission(permissionStatus());
        setSubscribed(!!sub);
      }
    });
    return () => {
      live = false;
    };
  }, [mock]);

  const status = mock ? alertsStatus("supported", "granted", true) : alertsStatus(support, permission, subscribed);

  const turnOn = async () => {
    setBusy(true);
    setNote(null);
    const problem = await subscribe().catch(() => "Couldn't turn on alerts. Try again.");
    setPermission(permissionStatus());
    setSubscribed(!problem);
    setNote(problem);
    setBusy(false);
  };
  const test = async () => {
    setBusy(true);
    if (mock) setNote("Test alert sent to 1 device.");
    else {
      const r = await sendTestAlert();
      setNote(r.ok ? (r.data.sent > 0 ? `Test alert sent to ${r.data.sent} device${r.data.sent === 1 ? "" : "s"}.` : "No device is registered yet. Turn alerts on first.") : "Couldn't send the test alert.");
    }
    setBusy(false);
  };
  const turnOff = async () => {
    setBusy(true);
    await unsubscribe();
    setSubscribed(false);
    setNote(null);
    setBusy(false);
  };

  return (
    <section className={styles.tile} aria-label="Alerts on this device">
      <p className={styles.statusLine} role="status">
        <span className={styles.dot} data-kind={status.kind} aria-hidden />
        {status.text}
      </p>
      {status.guide ? (
        <ol className={styles.guide}>
          <li>In Safari, tap Share, then Add to Home Screen.</li>
          <li>Open TurboTerp from your Home Screen, come back to Seat Alerts and turn alerts on.</li>
        </ol>
      ) : null}
      {status.kind === "blocked" ? (
        <p className={styles.sub}>Allow notifications for turboterp.com in your browser&apos;s site settings, then come back.</p>
      ) : null}
      <div className={styles.actions}>
        {status.kind === "off" ? (
          <button type="button" className={styles.primary} disabled={busy} onClick={turnOn}>
            Turn on alerts
          </button>
        ) : null}
        {status.kind === "on" ? (
          <>
            <button type="button" className={styles.ghost} disabled={busy} onClick={test}>
              Send a test alert
            </button>
            <button type="button" className={styles.link} disabled={busy} onClick={turnOff}>
              Turn off on this device
            </button>
          </>
        ) : null}
      </div>
      {note ? (
        <p className={styles.fine} role="status">
          {note}
        </p>
      ) : null}
    </section>
  );
}
