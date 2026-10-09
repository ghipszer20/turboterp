"use client";

import { useEffect, useState } from "react";
import { getAppSync, type Ask } from "@/lib/sync/app-sync";
import { chooserCopy, copyLine } from "@/lib/sync/chooser";
import { useSyncAsks } from "@/lib/sync/use-sync";
import styles from "./advisor.module.css";

function Chooser({ ask }: { ask: Ask }) {
  const copy = chooserCopy(ask.kind);
  // Program names come from the registry, loaded only when the dialog opens (it's on every page).
  const [nameOf, setNameOf] = useState<(id: string) => string>(() => (id: string) => id);
  useEffect(() => {
    let live = true;
    void import("@turboterp/programs").then(({ findProgram }) => {
      if (live) setNameOf(() => (id: string) => findProgram(id)?.name ?? id);
    });
    return () => {
      live = false;
    };
  }, []);
  const answer = (keep: "local" | "remote") => () => void getAppSync().resolve(ask.kind, keep);

  return (
    <div className={styles.overlay} role="presentation">
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-label={copy.title}>
        <h2 className={styles.gateTitle}>{copy.title}</h2>
        <p className={styles.gateIntro}>{copyLine(ask.kind, ask.local, ask.remote, nameOf)}</p>
        <button type="button" className={styles.primaryButton} onClick={answer("local")}>
          {copy.replace}
        </button>{" "}
        <button type="button" className={styles.ghostButton} onClick={answer("remote")}>
          {copy.keep}
        </button>
      </div>
    </div>
  );
}

/** Shown over any page when this browser's copy and the account's copy have never been synced and differ. */
export function KeepWhichCopy() {
  const asks = useSyncAsks();
  const first = asks[0];
  return first ? <Chooser key={first.kind} ask={first} /> : null;
}
