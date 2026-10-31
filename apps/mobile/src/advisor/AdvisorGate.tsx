// What the Audit and Explore screens show before they have a plan and course data, and the quiet
// engine states (updating, unavailable, error) around a result. Accounts are optional: there is no
// sign-in gate, a signed-out student with a plan sees everything.
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, type ReactNode } from "react";
import { View } from "react-native";
import { Button, Card, EmptyState, ErrorState, OfflineState, Screen, Skeleton, Text } from "../ui";
import { spacing } from "../ui/theme";
import type { CatalogData } from "./data-core";
import { useCatalog } from "./data";
import type { JobState } from "./job-controller";
import { refreshPlan, useAdvisorPlan } from "./store";
import type { AdvisorPlan } from "@turboterp/app-core/plan-state";

export function AdvisorGate({ title, children }: { title: string; children: (plan: AdvisorPlan, data: CatalogData) => ReactNode }) {
  const plan = useAdvisorPlan();
  const { result, retry } = useCatalog();
  const router = useRouter();
  // Account sync can replace the plan while another screen is up: re-read when this one is shown.
  useFocusEffect(useCallback(() => refreshPlan(), []));

  if (!plan)
    return (
      <Screen title={title}>
        <EmptyState title="No plan yet" body="Add your majors and first term to get a 4-year plan." />
        <View style={{ marginTop: spacing.lg }}>
          <Button label="Set up my plan" onPress={() => router.push("/advisor/setup")} />
        </View>
      </Screen>
    );
  if (!result)
    return (
      <Screen title={title}>
        <Skeleton rows={5} />
      </Screen>
    );
  if (result.status === "offline")
    return (
      <Screen title={title}>
        <OfflineState onRetry={retry} />
      </Screen>
    );
  if (result.status === "missing")
    return (
      <Screen title={title}>
        <ErrorState title="Course data isn't available" body="TurboTerp couldn't load its course data, so it can't check your plan." onRetry={retry} />
      </Screen>
    );
  return <Screen title={title}>{children(plan, result.data)}</Screen>;
}

/** The note above a result: "Updating…" while recomputing, an error with Retry, or the web-only notice. */
export function EngineNote({ state, retry, what }: { state: JobState<unknown>; retry: () => void; what: string }) {
  if (state.status === "unavailable")
    return (
      <Card style={{ padding: spacing.lg, gap: spacing.xs }}>
        <Text variant="headline">The audit runs in the iPhone app</Text>
        <Text variant="sub" tone="text2">
          {`${what} needs the on-device engine, which isn't available in the browser preview.`}
        </Text>
      </Card>
    );
  if (state.status === "error")
    return (
      <Card style={{ padding: spacing.lg, gap: spacing.sm }}>
        <Text variant="sub">{state.result ? `Couldn't refresh. Showing your last ${what}.` : `Couldn't build the ${what} right now.`}</Text>
        {state.message ? (
          <Text variant="caption" tone="text3">
            {state.message}
          </Text>
        ) : null}
        <Button label="Try again" variant="secondary" onPress={retry} />
      </Card>
    );
  if (state.status === "running" && state.result)
    return (
      <Text variant="caption" tone="text3" accessibilityLiveRegion="polite" style={{ marginBottom: spacing.sm }}>
        Updating…
      </Text>
    );
  return null;
}

/** First load, nothing to show yet. */
export function Building({ what }: { what: string }) {
  return (
    <View accessibilityLiveRegion="polite">
      <Text variant="sub" tone="text2" style={{ marginBottom: spacing.sm }}>{`Building your ${what}…`}</Text>
      <Skeleton rows={4} />
    </View>
  );
}
