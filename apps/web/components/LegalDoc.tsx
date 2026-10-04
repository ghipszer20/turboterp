import { Card, Page, Section } from "@/components/ui";
import type { LegalSection } from "@/lib/legal";
import styles from "@/app/about/about.module.css";

export function LegalDoc({ title, version, sections }: { title: string; version: string; sections: LegalSection[] }) {
  return (
    <Page title={title} subtitle={`Updated ${version}`}>
      <Section>
        {sections.map((s) => (
          <Card key={s.heading} className={styles.card}>
            <div className={styles.prose}>
              <p>
                <strong>{s.heading}</strong>
              </p>
              {s.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Card>
        ))}
      </Section>
    </Page>
  );
}
