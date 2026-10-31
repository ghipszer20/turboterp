// The Advisor plan store without any React Native imports, so it can be unit-tested in Node.
// Same storage key and format as the web (apps/web/app/advisor/store.ts), so account sync carries
// plans between web and app.
import { kvGet, kvSet, type KeyValueStore } from "@turboterp/app-core/key-value-store";
import { planReducer, type AdvisorPlan, type PlanAction } from "@turboterp/app-core/plan-state";
import { parsePlan, PLAN_STORAGE_KEY, serializePlan } from "@turboterp/app-core/storage";

export interface AdvisorPlanStore {
  /** The saved plan (read from storage on first use), or null when none is saved yet. */
  get(): AdvisorPlan | null;
  subscribe(listener: () => void): () => void;
  /** A student edit: stores the plan (null removes it) and tells sync. */
  save(plan: AdvisorPlan | null): void;
  /** A student edit through the plan reducer. A no-op without a plan or when nothing changed. */
  dispatch(action: PlanAction): void;
  /** Re-read storage (after account sync replaced the plan). Not a student edit: nothing is re-saved. */
  refresh(): void;
  /** The plan as stored text, for account sync. */
  readRaw(): string | null;
}

export function createAdvisorPlanStore(deps: { kv: KeyValueStore; onLocalChange: (kind: "plan") => void }): AdvisorPlanStore {
  let plan: AdvisorPlan | null | undefined;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());
  const load = () => parsePlan(kvGet(deps.kv, PLAN_STORAGE_KEY));

  const store: AdvisorPlanStore = {
    get: () => (plan === undefined ? (plan = load()) : plan),
    subscribe(l) {
      listeners.add(l);
      return () => void listeners.delete(l);
    },
    save(next) {
      kvSet(deps.kv, PLAN_STORAGE_KEY, next ? serializePlan(next) : null);
      plan = next;
      emit();
      deps.onLocalChange("plan");
    },
    dispatch(action) {
      const current = store.get();
      if (!current) return;
      const next = planReducer(current, action);
      if (next !== current) store.save(next);
    },
    refresh() {
      const next = load();
      if (JSON.stringify(next) === JSON.stringify(plan)) return;
      plan = next;
      emit();
    },
    readRaw: () => {
      const p = store.get();
      return p ? serializePlan(p) : null;
    },
  };
  return store;
}
