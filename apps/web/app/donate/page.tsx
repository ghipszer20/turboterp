import type { Metadata } from "next";
import { Card, Page } from "@/components/ui";
import { ABOUT, resolveAbout } from "@/lib/about";
import styles from "./donate.module.css";

export const metadata: Metadata = { title: "Donate" };

// The owner's own words (2026-10-07); change them only on the owner's say.
const PARAGRAPHS = ["If you've found this resource useful, consider donating to support the project."];

export default function DonatePage() {
  const about = resolveAbout(ABOUT);

  return (
    <Page title="Donate">
      <Card className={styles.card}>
        <div className={styles.body}>
          <div className={styles.text}>
            {PARAGRAPHS.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {about.donationUrl ? (
            <div className={styles.action}>
              <a className={styles.donateButton} href={about.donationUrl} target="_blank" rel="noreferrer">
                Donate with Venmo
              </a>
              {about.venmoHandle ? <p className={styles.handle}>{about.venmoHandle}</p> : null}
            </div>
          ) : (
            <p className={styles.handle}>Donation link coming soon.</p>
          )}
          <p className={styles.handle}>TurboTerp is a student project and is not affiliated with the University of Maryland.</p>
        </div>
      </Card>
    </Page>
  );
}
