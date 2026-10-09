import { RESERVE_CARDS } from "@turboterp/campus-data";
import { Card, Row } from "@/components/ui";
import styles from "./classes.module.css";

// Static booking guidance. Every link goes to the booking site in a new tab;
// the app never fetches ActiveTerp or Planyo and never handles UMD credentials.
export function ReserveSection() {
  return (
    <div className={styles.reserveList}>
      {RESERVE_CARDS.map((c) => (
        <Card key={c.id}>
          <Row title={c.title} subtitle={c.summary} />
          <Row
            title={<span className={styles.rules}>{c.rules}</span>}
            subtitle={
              <>
                <a href={c.sourceUrl} target="_blank" rel="noreferrer">
                  Source
                </a>{" "}
                · as of {c.asOf}
              </>
            }
            trailing={
              c.links.length > 0 ? (
                <span className={styles.linkStack}>
                  {c.links.map((l) => (
                    <a key={l.url} className={styles.signUp} href={l.url} target="_blank" rel="noreferrer">
                      {l.label}
                    </a>
                  ))}
                </span>
              ) : null
            }
          />
        </Card>
      ))}
    </div>
  );
}
