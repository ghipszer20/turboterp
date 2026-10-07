"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./CampusNav.module.css";

// Sub-navigation inside the Campus tab. Study rooms live under Libraries.
const SECTIONS = [
  { href: "/campus/dining", label: "Dining", match: ["/campus/dining"] },
  { href: "/campus/transport", label: "Transport", match: ["/campus/transport"] },
  { href: "/campus/libraries", label: "Libraries", match: ["/campus/libraries", "/campus/rooms"] },
  { href: "/campus/gym", label: "Fitness", match: ["/campus/gym"] },
] as const;

export function CampusNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.bar} aria-label="Campus">
      {SECTIONS.map((s) => {
        const active = s.match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
        return (
          <Link key={s.href} href={s.href} className={styles.link} aria-current={active ? "page" : undefined}>
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
