"use client";

import { useEffect, useState } from "react";
import {
  alertsStatus,
  currentPushEnv,
  currentSubscription,
  onReturnToPage,
  permissionStatus,
  pushSupport,
  subscribe,
  unsubscribe,
  type PermissionState,
  type PushSupport,
} from "@/lib/seat-alerts/client";
import styles from "./alerts.module.css";

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  className: styles.stepIcon,
} as const;

/** The iOS Share button: a square with an arrow leaving the top. */
function ShareIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 15V4M8.5 7.5 12 4l3.5 3.5M8 10H6.5A1.5 1.5 0 0 0 5 11.5v7A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 17.5 10H16" />
    </svg>
  );
}

/** The "Add to Home Screen" row icon: a plus in a rounded square. */
function AddSquareIcon() {
  return (
    <svg {...iconProps}>
      <rect x="4" y="4" width="16" height="16" rx="3.5" />
      <path d="M12 8.5v7M8.5 12h7" />
    </svg>
  );
}

/** The status line for this device (on, off, blocked, unavailable) with its one action. */
export function StatusCard({ mock, onTurnOn }: { mock: boolean; onTurnOn?: () => Promise<string | null> }) {
  const [support, setSupport] = useState<PushSupport>("supported");
  const [permission, setPermission] = useState<PermissionState>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (mock) return;
    let live = true;
    const check = () =>
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
    check();
    // Re-check when the student comes back, e.g. after allowing notifications in site settings.
    const stop = onReturnToPage(check);
    return () => {
      live = false;
      stop();
    };
  }, [mock]);

  const status = mock ? alertsStatus("supported", "granted", true) : alertsStatus(support, permission, subscribed);

  const turnOn = async () => {
    setBusy(true);
    setNote(null);
    const problem = await (onTurnOn ?? subscribe)().catch(() => "Couldn't turn on alerts. Try again.");
    setPermission(permissionStatus());
    setSubscribed(!problem);
    setNote(problem);
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
        <>
          <p className={styles.sub}>Add TurboTerp to your Home Screen. It opens right on Seat Alerts.</p>
          <ol className={styles.guide}>
            <li>
              In Safari&apos;s own toolbar (not on this page), tap <strong>Share</strong> <ShareIcon />. On newer iPhones, it&apos;s under the <strong>•••</strong> button.
            </li>
            <li>
              Tap <strong>Add to Home Screen</strong> <AddSquareIcon />
            </li>
            <li>
              Tap <strong>Add</strong>, then open TurboTerp from your Home Screen.
            </li>
          </ol>
        </>
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
          <button type="button" className={styles.link} disabled={busy} onClick={turnOff}>
            Turn off on this device
          </button>
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
