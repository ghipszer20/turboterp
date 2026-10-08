"use client";

// The Advisor's per-device state (agreement + plan) as an external store over localStorage, so
// components read it with useSyncExternalStore: nothing renders from storage on the server, and
// there's no hydration mismatch.

import { useSyncExternalStore } from "react";
import { CONSENT_STORAGE_KEY, parseConsent, type ConsentRecord } from "@/lib/advisor/consent";
import { planReducer, type AdvisorPlan, type PlanAction } from "@/lib/advisor/plan-state";
import { seedFromUrl } from "@/lib/advisor/seed";
import { parsePlan, PLAN_STORAGE_KEY, serializePlan } from "@/lib/advisor/storage";
import { localChanged } from "../../lib/sync/hooks";

export type AdvisorSnapshot = { consent: ConsentRecord | null; plan: AdvisorPlan | null };

let snapshot: AdvisorSnapshot | null = null;
const listeners = new Set<() => void>();

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage blocked (private browsing): the plan lasts for this page only.
  }
}

function load(): AdvisorSnapshot {
  const seed = seedFromUrl(location.search, {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_TURBOTERP_SEED: process.env.NEXT_PUBLIC_TURBOTERP_SEED,
  });
  if (seed) {
    write(CONSENT_STORAGE_KEY, JSON.stringify(seed.consent));
    if (seed.plan) write(PLAN_STORAGE_KEY, serializePlan(seed.plan));
  }
  return { consent: parseConsent(read(CONSENT_STORAGE_KEY)), plan: parsePlan(read(PLAN_STORAGE_KEY)) };
}

function set(next: AdvisorSnapshot) {
  snapshot = next;
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => (snapshot ??= load());
const getServerSnapshot = () => null;

/** null until the page has mounted in the browser. */
export const useAdvisorStore = (): AdvisorSnapshot | null => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

export function saveConsent(consent: ConsentRecord) {
  write(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  set({ ...getSnapshot(), consent });
}

export function savePlan(plan: AdvisorPlan | null) {
  write(PLAN_STORAGE_KEY, plan ? serializePlan(plan) : null);
  set({ ...getSnapshot(), plan });
  localChanged("plan");
}

/** The plan as stored text (from memory, so it works when storage is blocked); what account sync reads. */
export const readPlanRaw = (): string | null => {
  const plan = getSnapshot().plan;
  return plan ? serializePlan(plan) : null;
};

/** Replace the plan with the account's copy (or remove it with null). Not a student edit: nothing is re-saved. */
export function replacePlanFromRemote(raw: string | null) {
  const plan = parsePlan(raw);
  write(PLAN_STORAGE_KEY, plan ? serializePlan(plan) : null);
  set({ ...getSnapshot(), plan });
}

export function dispatchPlan(action: PlanAction) {
  const plan = getSnapshot().plan;
  if (!plan) return;
  const next = planReducer(plan, action);
  if (next !== plan) savePlan(next);
}

// ---- which view is open (#plan, #credit, #audit) ----

export type View = "plan" | "credit" | "audit" | "what-if";
const VIEWS: View[] = ["plan", "credit", "audit", "what-if"];

const subscribeHash = (l: () => void) => {
  window.addEventListener("hashchange", l);
  return () => window.removeEventListener("hashchange", l);
};
const hashView = (): View => {
  const h = location.hash.slice(1) as View;
  return VIEWS.includes(h) ? h : "plan";
};

export const useView = (): View => useSyncExternalStore(subscribeHash, hashView, () => "plan" as View);

export function openView(view: View) {
  history.replaceState(null, "", `${location.pathname}${location.search}#${view}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}
