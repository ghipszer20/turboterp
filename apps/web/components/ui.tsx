import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronIcon } from "./icons";
import styles from "./ui.module.css";

export function Page({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        {subtitle ? <p className={styles.eyebrow}>{subtitle}</p> : null}
        <h1 className={styles.largeTitle}>{title}</h1>
      </header>
      {children}
      <p className={styles.disclaimer}>
        Unofficial. Not affiliated with the University of Maryland.
        <br />
        <Link href="/terms">Terms of Use</Link> · <Link href="/privacy">Privacy Policy</Link>
      </p>
    </main>
  );
}

export function Section({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className={styles.section}>
      {title || action ? (
        <div className={styles.sectionHead}>
          {title ? <h2 className={styles.sectionTitle}>{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Card({
  children,
  className,
  clipNone,
}: {
  children: ReactNode;
  className?: string;
  /** Opt out of the card's overflow:hidden clip, e.g. for a dropdown that must escape it. */
  clipNone?: boolean;
}) {
  return <div className={`${styles.card} ${clipNone ? styles.cardClipNone : ""} ${className ?? ""}`}>{children}</div>;
}

/** A label for a sub-group of rows inside one Section's Card(s) -- smaller than a Section title. */
export function SubHeading({ children }: { children: ReactNode }) {
  return <p className={styles.subHeading}>{children}</p>;
}

type RowProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  external?: boolean;
};

export function Row({ title, subtitle, leading, trailing, href, external }: RowProps) {
  const body = (
    <>
      {leading ? <span className={styles.leading}>{leading}</span> : null}
      <span className={styles.rowText}>
        <span className={styles.rowTitle}>{title}</span>
        {subtitle ? <span className={styles.rowSub}>{subtitle}</span> : null}
      </span>
      {trailing ? <span className={styles.trailing}>{trailing}</span> : null}
      {href && !external ? <ChevronIcon className={styles.chevron} /> : null}
    </>
  );
  if (!href) return <div className={styles.row}>{body}</div>;
  if (external) {
    return (
      <a className={`${styles.row} ${styles.rowLink}`} href={href} target="_blank" rel="noreferrer">
        {body}
      </a>
    );
  }
  return (
    <Link className={`${styles.row} ${styles.rowLink}`} href={href}>
      {body}
    </Link>
  );
}

export type Status = "open" | "soon" | "closed" | "unknown";

export function StatusPill({
  status,
  inline = false,
  children,
}: {
  status: Status;
  inline?: boolean;
  children: ReactNode;
}) {
  return (
    <span className={styles.pill} data-status={status} data-inline={inline || undefined}>
      {children}
    </span>
  );
}

export function IconTile({ children, tone = "accent" }: { children: ReactNode; tone?: "accent" | "neutral" }) {
  return (
    <span className={styles.iconTile} data-tone={tone}>
      {children}
    </span>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return <p className={styles.notice}>{children}</p>;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>{title}</p>
      {children ? <p className={styles.emptyBody}>{children}</p> : null}
    </div>
  );
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className={styles.card} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <span className={styles.skeletonBlock} />
          <span className={styles.skeletonLine} />
        </div>
      ))}
    </div>
  );
}

export function SourceError({ source }: { source: string }) {
  return (
    <Card>
      <EmptyState title={`Couldn't reach ${source}`}>Try again in a few minutes.</EmptyState>
    </Card>
  );
}
