// Pre-professional tracks: each chosen track's required courses (met or needed, and the term each
// sits in), its milestones on the plan's timeline, and a way back to setup to change tracks. The
// full requirement detail also lives in the Audit screen; this view is the track-by-track summary.
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";
import type { Analysis } from "@turboterp/app-core/analysis";
import type { AdvisorPlan } from "@turboterp/app-core/plan-state";
import { showsScienceGpa } from "@turboterp/app-core/tracks";
import { Badge, Button, Card, EmptyState, StatusBadge, Text, useTheme } from "../ui";
import { spacing } from "../ui/theme";
import { AdvisorGate, Building, EngineNote } from "./AdvisorGate";
import { useAnalysisState } from "./analysis";
import { buildTracks } from "./audit-view-model";
import { countedWhere, termOfCourses } from "./credit-view-model";

export function TracksScreen() {
  return <AdvisorGate title="Tracks">{(plan) => <Body plan={plan} />}</AdvisorGate>;
}

function Body({ plan }: { plan: AdvisorPlan }) {
  const router = useRouter();
  const state = useAnalysisState();
  const analysis = state.result;
  const chosen = plan.tracks ?? [];
  return (
    <View style={{ gap: spacing.md }}>
      <Text variant="sub" tone="text2">
        What professional schools expect you to take. Not a UMD graduation requirement.
      </Text>
      {chosen.length === 0 ? (
        <EmptyState title="No tracks chosen" body="Pick a pre-health or pre-law track in setup to see its courses here." />
      ) : (
        <>
          <EngineNote state={state} retry={state.retry} what="track check" />
          {analysis ? <Result analysis={analysis} plan={plan} /> : state.status === "unavailable" || state.status === "error" ? null : <Building what="tracks" />}
        </>
      )}
      <Button variant="secondary" label={chosen.length ? "Change tracks" : "Choose tracks"} onPress={() => router.push("/advisor/setup")} />
    </View>
  );
}

function Result({ analysis, plan }: { analysis: Analysis; plan: AdvisorPlan }) {
  const { c } = useTheme();
  const tracks = useMemo(() => buildTracks(analysis, plan, showsScienceGpa), [analysis, plan]);
  const where = useMemo(() => termOfCourses(plan.terms), [plan.terms]);
  return (
    <>
      {tracks.map((t) => (
        <Card key={t.id} style={{ padding: spacing.lg, gap: spacing.sm }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" }}>
            <Text variant="title" accessibilityRole="header" style={{ flexShrink: 1 }}>
              {t.name}
            </Text>
            {t.unverified ? <Badge label="Unverified" /> : null}
          </View>
          {t.summary ? (
            <Text variant="sub" tone="text2">
              {t.summary}
            </Text>
          ) : null}
          {t.noCourses ? (
            <Text variant="sub" tone="text2">
              {t.noCourses}
            </Text>
          ) : null}
          {t.rows.map((r, i) =>
            r.kind === "req" ? (
              <View key={r.id} style={{ paddingTop: spacing.sm, gap: spacing.xs, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.separator }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.sm }}>
                  <Text variant="body" style={{ flex: 1 }}>
                    {r.name}
                  </Text>
                  <StatusBadge status={r.tone} label={r.statusLabel} />
                </View>
                {r.counted.length > 0 ? (
                  <Text variant="sub" tone="text2">
                    {countedWhere(r.counted, where)}
                  </Text>
                ) : null}
                {r.gap ? (
                  <Text variant="sub" tone="text2">
                    {r.gap.text}
                  </Text>
                ) : null}
              </View>
            ) : null,
          )}
          {t.confirmYourself ? (
            <Text variant="sub" tone="text2">
              {t.confirmYourself}
            </Text>
          ) : null}
          {t.scienceGpa.map((line) => (
            <Text key={line} variant="sub" tone="text2">
              {line}
            </Text>
          ))}
          {t.milestones.length > 0 ? (
            <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
              <Text variant="headline">Milestones on your plan</Text>
              {t.milestones.map((b) => (
                <View key={b.label} style={{ gap: spacing.xs }}>
                  <Text variant="caption" tone="text3">
                    {b.label}
                  </Text>
                  {b.items.map((m) => (
                    <Text key={m.id} variant="sub">
                      {`${m.when}: ${m.name}. ${m.detail}`}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          ) : null}
          <Text variant="caption" tone="text3" style={{ marginTop: spacing.sm }}>
            {t.disclaimer}
          </Text>
        </Card>
      ))}
    </>
  );
}
