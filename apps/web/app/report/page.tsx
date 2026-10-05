import type { Metadata } from "next";
import { Card, Notice, Page, Row } from "@/components/ui";
import { ABOUT, resolveAbout } from "@/lib/about";
import { ReportForm } from "./ReportForm";
import styles from "./report.module.css";

export const metadata: Metadata = { title: "Report an issue" };

export default function ReportPage() {
  const about = resolveAbout(ABOUT);

  return (
    <Page title="Report an issue">
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
    </Page>
  );
}
