"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./CampusNav.module.css";

// Sub-navigation inside the Schedule tab: the builder and Seat Alerts (owner, 2026-10-09).
const SECTIONS = [
  { href: "/schedule", label: "Builder", match: (p: string) => p === "/schedule" },
  { href: "/schedule/alerts", label: "Seat Alerts", match: (p: string) => p === "/schedule/alerts" || p.startsWith("/schedule/alerts/") },
] as const;

export function ScheduleNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.bar} aria-label="Schedule">
      {SECTIONS.map((s) => (
        <Link key={s.href} href={s.href} className={styles.link} aria-current={s.match(pathname) ? "page" : undefined}>
          {s.label}
        </Link>
      ))}
    </nav>
  );
}
