import { RESERVE_CARDS } from "@turboterp/campus-data";
import { Card } from "@/components/ui";
import styles from "./classes.module.css";

// Static booking guidance. Every link goes to the booking site in a new tab;
// the app never fetches ActiveTerp or Planyo and never handles UMD credentials.
export function ReserveSection() {
  return (
    <div className={styles.reserveList}>
      {RESERVE_CARDS.map((c) => (
        <Card key={c.id}>
          <div className={styles.reserveBody}>
            <h3 className={styles.reserveTitle}>{c.title}</h3>
            <p className={styles.rules}>{c.summary}</p>
            <p className={styles.rules}>{c.rules}</p>
            {c.links.length > 0 ? (
              <div className={styles.linkStack}>
                {c.links.map((l) => (
                  <a key={l.url} className={styles.signUp} href={l.url} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                ))}
              </div>
            ) : null}
            <p className={styles.source}>
              <a href={c.sourceUrl} target="_blank" rel="noreferrer">
                Source
              </a>{" "}
              · as of {c.asOf}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
