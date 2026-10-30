import { Card } from "@/components/ui";
import type { HallResultGroup } from "@/lib/dining";
import diningStyles from "./dining.module.css";
import styles from "./HallResults.module.css";

/** Food-search results: one bold header and card per dining hall, one row per meal + station. */
export function HallResults({ halls }: { halls: HallResultGroup[] }) {
  return (
    <div className={styles.halls}>
      {halls.map((h) => (
        <section key={h.hall} className={styles.hall}>
          <h2 className={styles.hallName}>{h.hall}</h2>
          <Card className={diningStyles.stationCard}>
            {h.rows.map((r) => (
              <div key={`${r.meal}|${r.station}`} className={styles.row}>
                <p className={styles.where}>
                  {r.meal} · {r.station}
                </p>
                <p className={styles.foods}>{r.items.join(", ")}</p>
              </div>
            ))}
            {h.capped ? <p className={styles.more}>More at this hall. Type more to narrow it down.</p> : null}
          </Card>
        </section>
      ))}
    </div>
  );
}
