"use client";

import { useEffect, useReducer, useState } from "react";
import { getAppSync, type Ask } from "@/lib/sync/app-sync";
import { chooserCopy, createChooserFlow } from "@/lib/sync/chooser";
import { summarize } from "@/lib/sync/summary";
import { useSyncAsks } from "@/lib/sync/use-sync";
import styles from "./advisor.module.css";

type NameOf = (id: string) => string;

function CopyCard({ heading, raw, kind, nameOf, children }: { heading: string; raw: string | null; kind: Ask["kind"]; nameOf: NameOf; children: React.ReactNode }) {
  return (
    <div className={styles.card}>
      <p className={styles.gateTitle}>{heading}</p>
      {summarize(kind, raw, nameOf).lines.map((line) => (
        <p key={line} className={styles.gateIntro}>
          {line}
        </p>
      ))}
      {children}
    </div>
  );
}

function Chooser({ ask }: { ask: Ask }) {
  const noRemote = ask.remote === null;
  const copy = chooserCopy(ask.kind, noRemote);
  const [flow] = useState(() => createChooserFlow(ask.kind, noRemote, (kind, keep) => void getAppSync().resolve(kind, keep)));
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const act = (fn: () => void) => () => (fn(), rerender());
  const { step, choice } = flow.state();
  // Program names come from the registry, loaded only when the chooser opens (it's on every page).
  const [nameOf, setNameOf] = useState<NameOf>(() => (id: string) => id);
  useEffect(() => {
    let live = true;
    void import("@turboterp/programs").then(({ findProgram }) => {
      if (live) setNameOf(() => (id: string) => findProgram(id)?.name ?? id);
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className={styles.overlay} role="presentation">
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-label={copy.title}>
        <h2 className={styles.gateTitle}>{copy.title}</h2>
        {step === "pick" || !choice ? (
          <>
            <CopyCard heading="On this device" raw={ask.local} kind={ask.kind} nameOf={nameOf}>
              <button type="button" className={styles.primaryButton} onClick={act(() => flow.choose("local"))}>
                {copy.keepLocal}
              </button>
            </CopyCard>
            <CopyCard heading="In your account" raw={ask.remote} kind={ask.kind} nameOf={nameOf}>
              {noRemote ? <p className={styles.gateIntro}>Nothing is saved to your account yet.</p> : null}
              <button type="button" className={noRemote ? styles.dangerButton : styles.primaryButton} onClick={act(() => flow.choose("remote"))}>
                {copy.keepRemote}
              </button>
            </CopyCard>
          </>
        ) : (
          <div className={styles.card}>
            <p className={styles.gateIntro}>{copy.confirm(choice)}</p>
            <button type="button" className={styles.dangerButton} onClick={act(() => flow.confirm())}>
              Yes, delete it
            </button>{" "}
            <button type="button" className={styles.ghostButton} onClick={act(() => flow.back())}>
              Go back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Shown over any page while a document differs between this device and the account. */
export function KeepWhichCopy() {
  const asks = useSyncAsks();
  const first = asks[0];
  return first ? <Chooser key={first.kind} ask={first} /> : null;
}
