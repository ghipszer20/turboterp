import Link from "next/link";
import { Card, Page, Section } from "@/components/ui";
import { ABOUT, resolveAbout } from "@/lib/about";
import { formatVersion, type LegalSection } from "@/lib/legal";
import styles from "@/app/about/about.module.css";

const DOCS = [
  { href: "/terms", label: "Terms of Use" },
  { href: "/privacy", label: "Privacy Policy" },
] as const;

export function LegalDoc({ title, version, sections }: { title: string; version: string; sections: LegalSection[] }) {
  const { contactEmail } = resolveAbout(ABOUT);
  return (
    <Page title={title} subtitle={`Last updated ${formatVersion(version)}`}>
      <Section>
        {sections.map((s) => (
          <Card key={s.heading} className={styles.card}>
            <div className={styles.prose}>
              <p>
                <strong>{s.heading}</strong>
              </p>
              {s.paragraphs.map((block) =>
                typeof block === "string" ? (
                  <p key={block}>{block}</p>
                ) : (
                  <ul key={block[0]} className={styles.list}>
                    {block.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ),
              )}
            </div>
          </Card>
        ))}
      </Section>
      <p className={styles.moreLinks}>
        <Link href="/report">Report an issue</Link>
        {contactEmail ? <a href={`mailto:${contactEmail}`}>{contactEmail}</a> : null}
        {DOCS.filter((d) => d.label !== title).map((d) => (
          <Link key={d.href} href={d.href}>
            {d.label}
          </Link>
        ))}
      </p>
    </Page>
  );
}
