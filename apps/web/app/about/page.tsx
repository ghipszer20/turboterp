import type { Metadata } from "next";
import Link from "next/link";
import { Card, Page, Row, Section } from "@/components/ui";
import { ABOUT, resolveAbout } from "@/lib/about";
import styles from "./about.module.css";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  const about = resolveAbout(ABOUT);

  return (
    <Page title="About">
      <Section title="About TurboTerp">
        <Card className={styles.card}>
          <div className={styles.prose}>
            <p>
              TurboTerp is an all-in-one app for UMD students: campus info like dining, libraries, gyms and buses, a
              schedule builder, and a four-year plan and degree audit, all in one place.
            </p>
            <p>It&apos;s free and open source. Not affiliated with the University of Maryland.</p>
            <p>
              Read the <Link href="/terms">Terms of Use</Link> and the <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </Card>
      </Section>

      <Section title="Open source">
        <Card className={styles.card}>
          {about.githubUrl ? (
            <Row title="View on GitHub" subtitle={about.githubUrl} href={about.githubUrl} external />
          ) : (
            <Row title="View on GitHub" subtitle="Coming soon" />
          )}
        </Card>
      </Section>

      <Section title="Contact">
        <Card className={styles.card}>
          <div className={styles.contactRow}>
            {about.contactEmail ? (
              <a href={`mailto:${about.contactEmail}`}>{about.contactEmail}</a>
            ) : (
              <span>Contact email coming soon.</span>
            )}
          </div>
        </Card>
      </Section>

      <p className={styles.moreLinks}>
        <Link href="/report">Report an issue</Link>
        <Link href="/donate">Donate</Link>
      </p>
    </Page>
  );
}
