import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronIcon, SearchIcon } from "./icons";
import { clampSub, tileStatusTone } from "../lib/tiles";
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


export type TileArea = "dining" | "study" | "fitness" | "transport";

/** Today / Campus tile: icon box, name, a two-line sub. `status` colors the sub with a dot; `accent` makes it solid red. */
export function Tile({
  href,
  icon,
  area,
  title,
  sub,
  status,
  accent = false,
  wide = false,
  external = false,
}: {
  href: string;
  icon: ReactNode;
  area: TileArea;
  title: string;
  sub?: string;
  status?: Status;
  accent?: boolean;
  /** Full-width row layout, for a group with a single tile. */
  wide?: boolean;
  /** An off-site link: opens in a new tab. */
  external?: boolean;
}) {
  const Anchor = external ? "a" : Link;
  return (
    <Anchor
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={styles.tile}
      data-area={area}
      data-accent={accent || undefined}
      data-wide={wide || undefined}
    >
      <span className={styles.tileIcon}>{icon}</span>
      <span className={styles.tileText}>
        <span className={styles.tileName}>{title}</span>
        {sub ? (
          <span className={styles.tileSub} data-tone={status ? tileStatusTone(status) : undefined}>
            {clampSub(sub)}
          </span>
        ) : null}
      </span>
    </Anchor>
  );
}

/** 4 columns on desktop, 2 on phones. */
/** `row`: on desktop, every tile on one line (equal widths) instead of 4 per row. */
export function TileGrid({ children, row = false }: { children: ReactNode; row?: boolean }) {
  return (
    <div className={styles.tileGrid} data-row={row || undefined}>
      {children}
    </div>
  );
}

/** Next-class hero on the brand gradient. */
export function Hero({ label, title, sub, href }: { label: string; title: string; sub?: string; href?: string }) {
  const body = (
    <>
      <span className={styles.heroLabel}>{label}</span>
      <span className={styles.heroTitle}>{title}</span>
      {sub ? <span className={styles.heroSub}>{sub}</span> : null}
    </>
  );
  if (!href) return <div className={styles.hero}>{body}</div>;
  return (
    <Link href={href} className={styles.hero}>
      {body}
    </Link>
  );
}

/** Row for a Hero and its HeroStat: stacked on phones, side by side on desktop. */
export function HeroRow({ children }: { children: ReactNode }) {
  return <div className={styles.heroRow}>{children}</div>;
}

/** White stat tile beside the hero: big accent number over a caption. */
export function HeroStat({ number, text, small }: { number: ReactNode; text: string; small?: boolean }) {
  return (
    <div className={styles.heroStat} data-small={small || undefined}>
      <span className={styles.heroNumber}>{number}</span>
      <span className={styles.heroStatText}>{text}</span>
    </div>
  );
}

/** 44px search field: a link to a search page (href) or a submit handler (onSubmit). */
export function SearchField({
  placeholder,
  href,
  onSubmit,
}: {
  placeholder: string;
  href?: string;
  onSubmit?: (query: string) => void;
}) {
  if (href && !onSubmit) {
    return (
      <Link href={href} className={styles.search}>
        <SearchIcon className={styles.searchIcon} />
        <span className={styles.searchPlaceholder}>{placeholder}</span>
      </Link>
    );
  }
  return (
    <form
      className={styles.search}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get("q");
        onSubmit?.(typeof q === "string" ? q.trim() : "");
      }}
    >
      <SearchIcon className={styles.searchIcon} />
      <input className={styles.searchInput} name="q" type="search" placeholder={placeholder} aria-label={placeholder} />
    </form>
  );
}
