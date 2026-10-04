"use client";

// Today card: counts down to the registration appointment the student typed in, only while it
// is stored and still in the future. Links to the checklist on the Schedule tab.

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { Card, Section } from "@/components/ui";
import { easternToDate, parsePrep } from "@/lib/schedule/registration";
import { prepStore } from "@/lib/schedule/registration-store";
import styles from "./schedule/registration.module.css";

export function countdownText(ms: number): string {
  const mins = Math.floor(ms / 60_000);
  const days = Math.floor(mins / 1440);
  if (days >= 1) return `${days} ${days === 1 ? "day" : "days"} to go`;
  const h = Math.floor(mins / 60);
  return h >= 1 ? `${h} ${h === 1 ? "hour" : "hours"} to go` : `${Math.max(mins, 1)} min to go`;
}

function tick(onChange: () => void) {
  const t = setInterval(onChange, 30_000);
  return () => clearInterval(t);
}

export function RegistrationCountdown() {
  const raw = useSyncExternalStore(prepStore.subscribe, prepStore.getSnapshot, prepStore.getServerSnapshot);
  const minute = useSyncExternalStore(tick, () => Math.floor(Date.now() / 60_000), () => 0);
  const now = minute === 0 ? null : minute * 60_000;
  const next = useMemo(() => {
    if (now === null) return null;
    const times: Date[] = [];
    for (const p of Object.values(parsePrep(raw))) {
      const at = p.appointment ? easternToDate(p.appointment) : null;
      if (at && at.getTime() > now) times.push(at);
    }
    return times.sort((a, b) => a.getTime() - b.getTime())[0] ?? null;
  }, [raw, now]);
  if (!next || now === null) return null;
  const when = next.toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <Section title="Registration">
      <Card>
        <Link href="/schedule#register" className={styles.countdown}>
          <strong>{countdownText(next.getTime() - now)}</strong>
          <div className={styles.muted}>Registration appointment {when}. Get ready to register</div>
        </Link>
      </Card>
    </Section>
  );
}
