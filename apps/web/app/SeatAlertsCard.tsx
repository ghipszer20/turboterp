"use client";

import Link from "next/link";
import { useWatches } from "@/lib/seat-alerts/use-watches";
import styles from "./seat-alerts-card.module.css";

/** Today card: shown only while the signed-in student has active seat watches. */
export function SeatAlertsCard() {
  const { phase, data } = useWatches();
  const n = data.watches.length;
  if (phase !== "ready" || n === 0) return null;
  return (
    <Link href="/schedule/alerts" className={styles.card}>
      <span className={styles.title}>Seat Alerts: {n} watching</span>
      <span className={styles.sub}>We&apos;ll notify you when a seat opens.</span>
    </Link>
  );
}
