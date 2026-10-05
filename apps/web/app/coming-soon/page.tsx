import type { Metadata } from "next";
import { AccessForm } from "./AccessForm";
import styles from "./coming-soon.module.css";

export const metadata: Metadata = { title: "Coming soon" };

// What visitors see while the pre-launch gate is on (lib/access.ts). Covers the whole screen,
// so the tabs behind it are not shown.
export default function ComingSoonPage() {
  return (
    <main className={styles.screen}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a tiny static SVG */}
      <img src="/icon.svg" alt="" width={84} height={84} className={styles.mark} />
      <h1 className={styles.title}>
        Turbo<span>Terp</span>
      </h1>
      <p className={styles.soon}>Coming soon</p>
      <p className={styles.fine}>An unofficial app for UMD students. Not affiliated with the University of Maryland.</p>
      <AccessForm />
    </main>
  );
}
