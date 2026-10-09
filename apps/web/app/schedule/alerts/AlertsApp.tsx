"use client";

import { SkeletonCard } from "@/components/ui";
import { useWatches } from "@/lib/seat-alerts/use-watches";
import { endedNote, watchCount, watchRowView, type WatchRow } from "@/lib/seat-alerts/view";
import { AddClass } from "./AddClass";
import { SignInCard } from "./SignInCard";
import { StatusCard } from "./StatusCard";
import styles from "./alerts.module.css";

const FOOTER =
  "Alerts are best-effort and can be a minute or two late. TurboTerp checks Testudo; it never registers you or uses your UMD login.";

export function AlertsApp() {
  const state = useWatches();
  const now = new Date();

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

  const { watches, done, ended } = state.data;
  const note = endedNote(ended);

  return (
    <div className={styles.stack}>
      {state.phase === "signed-out" ? (
        <SignInCard />
      ) : (
        <>
          <StatusCard mock={state.mock} />
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
