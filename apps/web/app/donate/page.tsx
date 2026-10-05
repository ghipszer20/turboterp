import type { Metadata } from "next";
import { Card, Page } from "@/components/ui";
import { ABOUT, resolveAbout } from "@/lib/about";
import styles from "./donate.module.css";

export const metadata: Metadata = { title: "Donate" };

// The owner's own words (2026-10-04); change them only on the owner's say.
const PARAGRAPHS = [
  "Thank you for considering a donation to TurboTerp.",
  "We invite you to think about how many times you opened TurboTerp this semester: to build a schedule, check your degree progress, or see what the dining hall was serving. If it saved you time, please consider chipping in. Any amount helps: $3, $5, $10, or whatever feels right to you today.",
  "College already costs enough. The tools you need to plan your classes and get around campus should not cost extra, and they should not be scattered across a dozen websites. TurboTerp brings them together in one place, built by a student, with no ads and no paid tier.",
  "TurboTerp will never make money. Donations go only toward the cost of keeping it running, so it stays free for every student.",
  "If TurboTerp has made your semester easier, please consider giving back. There are no small contributions: every friend told counts, every bug report counts, every donation counts.",
];

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
