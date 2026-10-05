import type { Metadata } from "next";
import { Card, Page } from "@/components/ui";
import { ABOUT, resolveAbout } from "@/lib/about";
import styles from "./support.module.css";

export const metadata: Metadata = { title: "Support TurboTerp" };

export default function SupportPage() {
  const about = resolveAbout(ABOUT);

  return (
    <Page title="Support TurboTerp">
      <Card className={styles.card}>
        <div className={styles.body}>
          <p className={styles.text}>
            TurboTerp is free. Donations only cover what it costs to keep it running: hosting and the domain. Nothing is
            sold and there are no ads.
          </p>
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
        </div>
      </Card>
    </Page>
  );
}
