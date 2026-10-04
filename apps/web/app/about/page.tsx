import type { Metadata } from "next";
import Link from "next/link";
import { Card, Notice, Page, Row, Section } from "@/components/ui";
import { ABOUT, resolveAbout } from "@/lib/about";
import { ReportForm } from "./ReportForm";
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
              Read the <Link href="/terms">Terms of Use</Link> and the <Link href="/privacy">Privacy</Link> notice.
            </p>
          </div>
        </Card>
      </Section>

      <Section title="Report an issue">
        <Card className={styles.card}>
          <ReportForm contactEmail={about.contactEmail} issuesUrl={about.issuesUrl} />
        </Card>
        {about.issuesUrl ? (
          <Card className={styles.card}>
            <Row title="GitHub Issues" subtitle="File an issue on GitHub" href={about.issuesUrl} external />
          </Card>
        ) : (
          <Notice>GitHub Issues link coming soon.</Notice>
        )}
      </Section>

      <Section title="About the creator">
        <Card className={styles.card}>
          <div className={styles.prose}>
            <p>{about.bio ?? "Bio coming soon."}</p>
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

      <Section title="Support TurboTerp">
        <Card className={styles.card}>
          <div className={styles.support}>
            <p className={styles.supportText}>
              TurboTerp is free to use. Donations only cover what it costs to keep it running -- hosting and the
              domain -- nothing more.
            </p>
            {about.donationUrl ? (
              <a className={styles.donateButton} href={about.donationUrl} target="_blank" rel="noreferrer">
                Chip in for hosting
              </a>
            ) : (
              <p className={styles.comingSoon}>Donation link coming soon.</p>
            )}
          </div>
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
    </Page>
  );
}
