"use client";

import { useEffect, useState } from "react";
import { SkeletonCard } from "@/components/ui";
import { currentPushEnv, pushSupport, type PushSupport } from "@/lib/seat-alerts/client";
import { useWatches } from "@/lib/seat-alerts/use-watches";
import { endedNote, setupSteps, watchCount, watchRowView, type WatchRow } from "@/lib/seat-alerts/view";
import { AddClass } from "./AddClass";
import { AddSquareIcon, ShareIcon, StatusCard } from "./StatusCard";
import styles from "./alerts.module.css";

const FOOTER =
  "Alerts are best-effort and can be a minute or two late. TurboTerp checks Testudo; it never registers you or uses your UMD login.";

/** What Seat Alerts does and how to use it on this device. Final wording is the owner's to approve. */
function Intro({ support }: { support: PushSupport }) {
  const steps = setupSteps(support);
  return (
    <section className={styles.tile} aria-label="About Seat Alerts">
      <h2 className={styles.title}>Get a notification when a seat opens</h2>
      <p className={styles.sub}>
        Watch a full class or section. TurboTerp checks Testudo every minute and notifies this device the moment a seat opens, so you can grab it.
      </p>
      {steps.length ? (
        <>
          <h3 className={styles.title}>How it works</h3>
          <ol className={styles.guide}>
            {steps.map((t, i) =>
              support === "ios-needs-home-screen" && i === 0 ? (
                // The same step with Safari's Share and Add to Home Screen icons (owner likes them, 2026-10-30).
                <li key={t}>
                  In Safari&apos;s toolbar, tap <strong>Share</strong> <ShareIcon />, then <strong>Add to Home Screen</strong>{" "}
                  <AddSquareIcon />.
                </li>
              ) : (
                <li key={t}>{t}</li>
              ),
            )}
          </ol>
        </>
      ) : (
        <p className={styles.sub}>
          This browser can&apos;t get notifications. Try Safari on iPhone (from the Home Screen), or Chrome on Android or a computer.
        </p>
      )}
    </section>
  );
}

export function AlertsApp() {
  const state = useWatches();
  const [support, setSupport] = useState<PushSupport>("supported");
  useEffect(() => {
    // Read after mount so the server and first client render agree.
    Promise.resolve().then(() => setSupport(pushSupport(currentPushEnv())));
  }, []);
  const mockSupport = state.phase === "ready" && state.mock ? "supported" : support;

  if (state.phase === "loading") return <SkeletonCard rows={3} />;
  if (state.phase === "unavailable")
    return (
      <div className={styles.stack}>
        <section className={styles.tile}>
          <h2 className={styles.title}>Seat Alerts aren&apos;t available right now</h2>
          <p className={styles.sub}>Try again in a little while.</p>
        </section>
        <p className={styles.fine}>{FOOTER}</p>
      </div>
    );

  const now = new Date();
  const { watches, done, ended } = state.data;
  const note = endedNote(ended);

  return (
    <div className={styles.stack}>
      <Intro support={mockSupport} />
      {state.phase === "needs-setup" ? (
        // iPhone Safari: the intro's steps already say to add TurboTerp to the Home Screen (owner, 2026-10-30).
        mockSupport === "ios-needs-home-screen" ? null : <StatusCard mock={false} onTurnOn={state.enable} />
      ) : (
        <>
          <StatusCard mock={state.mock} onTurnOn={state.enable} />
          <AddClass state={state} />
          <section aria-label="Your watches">
            <div className={styles.countRow}>
              <h2 className={styles.title}>Watching</h2>
              <span className={styles.fine}>{watchCount(watches.length)}</span>
            </div>
            {watches.length ? (
              <ul className={styles.list}>
                {watches.map((w) => (
                  <WatchItem key={w.id} w={w} now={now} onDone={() => state.done(w.id)} onRemove={() => state.remove(w.id)} />
                ))}
              </ul>
            ) : (
              <div className={styles.tile}>
                <p className={styles.sub}>Nothing yet. Add a full class above and we&apos;ll tell you when a seat opens.</p>
              </div>
            )}
            {note ? <p className={styles.fine}>{note}</p> : null}
          </section>
          {done.length ? (
            <details className={styles.details}>
              <summary>Done ({done.length})</summary>
              <ul className={styles.list}>
                {done.map((w) => (
                  <li key={w.id} className={styles.row}>
                    <div className={styles.rowText}>
                      <span className={styles.rowTitle}>{watchRowView(w, now).title}</span>
                    </div>
                    <button type="button" className={styles.link} onClick={() => state.remove(w.id)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </>
      )}
      <p className={styles.fine}>{FOOTER}</p>
    </div>
  );
}

function WatchItem({ w, now, onDone, onRemove }: { w: WatchRow; now: Date; onDone: () => void; onRemove: () => void }) {
  const v = watchRowView(w, now);
  return (
    <li className={styles.row}>
      <div className={styles.rowText}>
        <span className={styles.rowTitle}>{v.title}</span>
        <span className={styles.rowSub}>
          <span className={v.isOpen ? styles.open : undefined}>{v.status}</span>
          {v.checked ? ` · ${v.checked}` : ""}
        </span>
        {v.lastAlert ? <span className={styles.rowSub}>{v.lastAlert}</span> : null}
      </div>
      <div className={styles.rowActions}>
        <button type="button" className={styles.ghost} onClick={onDone}>
          I got it
        </button>
        <button type="button" className={styles.link} onClick={onRemove}>
          Remove
        </button>
      </div>
    </li>
  );
}
