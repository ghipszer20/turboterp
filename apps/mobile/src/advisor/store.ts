// The app's Advisor store: app-core plan state over the app's key-value store. Setup, audit and
// transcript screens build on this. Every student edit calls notifyLocalChange("plan").
import { useSyncExternalStore } from "react";
import type { AdvisorPlan, PlanAction } from "@turboterp/app-core/plan-state";
import { notifyLocalChange } from "../auth/app-sync";
import { kvStore } from "../storage";
import { createAdvisorPlanStore } from "./store-core";

export const advisorPlanStore = createAdvisorPlanStore({ kv: kvStore, onLocalChange: notifyLocalChange });

/** The saved plan, or null when there is none. Re-renders on every change. */
export const useAdvisorPlan = (): AdvisorPlan | null =>
  useSyncExternalStore(advisorPlanStore.subscribe, advisorPlanStore.get, advisorPlanStore.get);

export const savePlan = (plan: AdvisorPlan | null) => advisorPlanStore.save(plan);
export const dispatchPlan = (action: PlanAction) => advisorPlanStore.dispatch(action);
export const refreshPlan = () => advisorPlanStore.refresh();
export const readPlanRaw = () => advisorPlanStore.readRaw();
