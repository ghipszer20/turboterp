"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdvisorIcon, CalendarIcon, CampusIcon, FlagIcon, HeartIcon, InfoIcon, ScheduleIcon, TodayIcon } from "./icons";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Nav.module.css";

// Four main tabs (owner decision). Today lives at "/" and is reached from the logo.
const TABS = [
  { href: "/campus", label: "Campus", Icon: CampusIcon },
  { href: "/schedule", label: "Schedule", Icon: ScheduleIcon },
  { href: "/calendar", label: "Calendar", Icon: CalendarIcon },
  { href: "/advisor", label: "Advisor", Icon: AdvisorIcon },
] as const;

// Three small buttons, kept separate (owner): About, Report an issue, Donate.
const INFO_LINKS = [
  { href: "/about", label: "About", aria: "About TurboTerp", Icon: InfoIcon },
  { href: "/report", label: "Report an issue", aria: "Report an issue", Icon: FlagIcon },
  { href: "/donate", label: "Donate", aria: "Donate to TurboTerp", Icon: HeartIcon },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// The terrapin mark beside the wordmark; decorative, since the wordmark names the site.
function LogoMark() {
  // eslint-disable-next-line @next/next/no-img-element -- a tiny static SVG; next/image adds nothing here
  return <img src="/icon.svg" alt="" width={26} height={26} className={styles.mark} />;
}

export function Nav() {
  const pathname = usePathname();
  return (
    <>
      {/* Phones: small wordmark at the top that goes to Today. */}
      <header className={styles.topBar}>
        <Link href="/" className={styles.wordmark} aria-current={pathname === "/" ? "page" : undefined}>
          <LogoMark />
          Turbo<span>Terp</span>
        </Link>
        <div className={styles.topBarControls}>
          {INFO_LINKS.map(({ href, aria, Icon }) => (
            <Link
              key={href}
              href={href}
              className={styles.aboutIconLink}
              aria-label={aria}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Icon size={22} />
            </Link>
          ))}
          <ThemeToggle compact />
        </div>
      </header>
      <nav className={styles.nav} aria-label="Main">
        <Link href="/" className={styles.brand} aria-current={pathname === "/" ? "page" : undefined}>
          <LogoMark />
          Turbo<span>Terp</span>
        </Link>
        <Link href="/" className={`${styles.tab} ${styles.todayLink}`} data-active={pathname === "/"}>
          <TodayIcon size={24} />
          <span>Today</span>
        </Link>
        <ul className={styles.tabs}>
          {TABS.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link href={href} className={styles.tab} data-active={active} aria-current={active ? "page" : undefined}>
                  <Icon size={24} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className={styles.infoLinks}>
          {INFO_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={styles.aboutLink}
              data-active={pathname === href}
              aria-current={pathname === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className={styles.appearance}>
          <ThemeToggle />
        </div>
        <p className={styles.fine}>
          Unofficial. Not affiliated with the University of Maryland. <Link href="/terms">Terms</Link> ·{" "}
          <Link href="/privacy">Privacy</Link>
        </p>
      </nav>
    </>
  );
}
