// The degree audit (ported from apps/web/app/advisor/AuditView.tsx): per program, each requirement
// with met/needed status and "Still needed" lines, open slots as "Confirm with your advisor", the
// program GPA, the catalog citation; then the CS gateway and pre-professional Tracks. The solver runs
// in the engine bridge; this screen only renders the Analysis it returns.
import { useMemo, useState, type ReactNode } from "react";
import { Pressable, TextInput, View } from "react-native";
import type { Analysis } from "@turboterp/app-core/analysis";
import type { AdvisorPlan } from "@turboterp/app-core/plan-state";
import { showsScienceGpa } from "@turboterp/app-core/tracks";
import { gatewayAttemptLimitNote } from "@turboterp/app-core/what-if-display";
import { Badge, Card, StatusBadge, Text, useTheme } from "../ui";
import { radius, spacing, type Status } from "../ui/theme";
import { CourseCodeText } from "../course/components";
import { CourseSheet } from "../course/CourseSheet";
import { AdvisorGate, Building, EngineNote } from "./AdvisorGate";
import { useAnalysisState } from "./analysis";
import {
  buildPrograms,
  buildTracks,
  GATEWAY_COURSE_LABEL,
  GATEWAY_TONE,
  GPA_LABEL,
  OVERALL_LABEL,
  OVERALL_TONE,
  type ReqRow,
  type SlotRow,
} from "./audit-view-model";
import { dispatchPlan } from "./store";

export function AuditScreen() {
  return <AdvisorGate title="Audit">{(plan) => <Audit plan={plan} />}</AdvisorGate>;
}

function Audit({ plan }: { plan: AdvisorPlan }) {
  const state = useAnalysisState();
  const analysis = state.result;
  return (
    <View style={{ gap: spacing.md }}>
      <EngineNote state={state} retry={state.retry} what="audit" />
      {analysis ? <Result analysis={analysis} plan={plan} /> : state.status === "unavailable" || state.status === "error" ? null : <Building what="audit" />}
    </View>
  );
}

function Result({ analysis, plan }: { analysis: Analysis; plan: AdvisorPlan }) {
  const programs = useMemo(() => buildPrograms(analysis, plan), [analysis, plan]);
  const tracks = useMemo(() => buildTracks(analysis, plan, showsScienceGpa), [analysis, plan]);
  const gateway = analysis.gateway;
  return (
    <View style={{ gap: spacing.md }}>
      {programs.map((p) => (
        <Card key={p.id} style={{ padding: spacing.lg, gap: spacing.sm }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" }}>
            <Text variant="title" accessibilityRole="header" style={{ flexShrink: 1 }}>
              {p.name}
            </Text>
            {p.unverified ? <Badge label="Unverified" /> : null}
          </View>
          <Text variant="sub" tone="text2">
            {p.summary}
          </Text>
          {p.citation ? (
            <Text variant="caption" tone="text3">
              {p.citation}
            </Text>
          ) : null}
          <Rows rows={p.rows} />
        </Card>
      ))}

      {gateway ? (
        <Card style={{ padding: spacing.lg, gap: spacing.sm }}>
          <Text variant="title" accessibilityRole="header">
            CS gateway (Limited Enrollment Program)
          </Text>
          <Text variant="sub" tone="text2">
            {`Matriculated ${gateway.rule.name === "fall-2024-or-later" ? "Fall 2024 or later" : "before Fall 2024"}: every gateway course ${gateway.rule.minGrade} or better, cumulative GPA ${gateway.rule.minGpa.toFixed(1)} or higher.`}
          </Text>
          {gateway.courses.map((c) => (
            <RowShell key={c.id} name={`${c.name} (${c.options.join(" or ")})`} tone={GATEWAY_TONE[c.status]} label={`${GATEWAY_COURSE_LABEL[c.status]}${c.satisfiedBy ? ` (${c.satisfiedBy})` : ""}`} />
          ))}
          <GpaField gpa={plan.gpa} />
          <Text variant="sub" tone={gateway.gpa === "below" ? "danger" : "text2"}>{`GPA: ${GPA_LABEL[gateway.gpa]}`}</Text>
          <StatusBadge status={OVERALL_TONE[gateway.overall]} label={OVERALL_LABEL[gateway.overall]} />
          {gatewayAttemptLimitNote(gateway) ? (
            <Text variant="sub" tone="danger">
              {gatewayAttemptLimitNote(gateway)}
            </Text>
          ) : null}
        </Card>
      ) : null}

      {tracks.length > 0 ? (
        <View style={{ gap: spacing.md }}>
          <Text variant="title" accessibilityRole="header" style={{ marginTop: spacing.md }}>
            Tracks
          </Text>
          <Text variant="sub" tone="text2">
            What professional schools expect you to take. Not a UMD graduation requirement.
          </Text>
          {tracks.map((t) => (
            <Card key={t.id} style={{ padding: spacing.lg, gap: spacing.sm }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" }}>
                <Text variant="headline" accessibilityRole="header" style={{ flexShrink: 1 }}>
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
              <Rows rows={t.rows} />
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
                        {b.label.toUpperCase()}
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
              <Text variant="caption" tone="text3">
                {t.disclaimer}
              </Text>
            </Card>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Rows({ rows }: { rows: (ReqRow | SlotRow)[] }) {
  const { c } = useTheme();
  return (
    <View>
      {rows.map((r, i) => (
        <View key={r.kind === "slot" ? r.key : r.id} style={{ paddingVertical: spacing.sm, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.separator, gap: spacing.xs }}>
          {r.kind === "slot" ? <SlotItem slot={r} /> : <ReqItem row={r} />}
        </View>
      ))}
    </View>
  );
}

function RowShell({ name, tone, label, sub }: { name: string; tone: Status; label: string; sub?: ReactNode }) {
  return (
    <View style={{ gap: spacing.xs }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.sm }}>
        <Text variant="body" style={{ flex: 1 }}>
          {name}
        </Text>
        <StatusBadge status={tone} label={label} />
      </View>
      {sub}
    </View>
  );
}

/** Text whose course codes open the course sheet. */
function CodeText({ text }: { text: string }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      <CourseCodeText text={text} tone="text2" onOpenCourse={setOpen} />
      <CourseSheet courseId={open} onClose={() => setOpen(null)} />
    </>
  );
}

function ReqItem({ row }: { row: ReqRow }) {
  return (
    <RowShell
      name={row.name}
      tone={row.tone}
      label={row.statusLabel}
      sub={
        <>
          {row.notes.map((n) => (
            <Text key={n} variant="sub" tone="text2">
              {n}
            </Text>
          ))}
          {row.counted.length > 0 ? (
            <CodeText text={`Counted: ${row.counted.join(", ")}`} />
          ) : null}
          {row.gap ? (
            <CodeText
              text={`${row.gap.text}${row.gap.suggestions.length > 0 ? ` For example: ${row.gap.suggestions.join(", ")}.` : ""}${row.gap.note ? ` ${row.gap.note}` : ""}`}
            />
          ) : null}
        </>
      }
    />
  );
}

/** An open slot ("from an approved list" that isn't published): ticked once the advisor confirms it. */
function SlotItem({ slot }: { slot: SlotRow }) {
  const { c } = useTheme();
  return (
    <>
      <RowShell
        name={`${slot.name}${slot.credits !== null ? ` · ${slot.credits} credits` : ""}`}
        tone={slot.confirmed ? "open" : "soon"}
        label={slot.statusLabel}
        sub={
          slot.note ? (
            <Text variant="sub" tone="text2">
              {slot.note}
            </Text>
          ) : null
        }
      />
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: slot.confirmed }}
        accessibilityLabel={`My advisor confirmed my courses for ${slot.name}`}
        onPress={() => dispatchPlan({ type: "toggle-slot", key: slot.key })}
        style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: 44 }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: radius.sm / 2,
            borderWidth: 2,
            borderColor: slot.confirmed ? c.accent : c.separator,
            backgroundColor: slot.confirmed ? c.accent : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {slot.confirmed ? <Text variant="caption" style={{ color: c.onAccent }}>✓</Text> : null}
        </View>
        <Text variant="sub" style={{ flex: 1 }}>
          My advisor confirmed my courses for this
        </Text>
      </Pressable>
    </>
  );
}

function GpaField({ gpa }: { gpa: number | undefined }) {
  const { c } = useTheme();
  const [text, setText] = useState(gpa === undefined ? "" : String(gpa));
  return (
    <View style={{ gap: spacing.xs }}>
      <Text variant="sub" tone="text2">
        Cumulative UMD GPA (a transcript import fills this in; you can edit it)
      </Text>
      <TextInput
        value={text}
        onChangeText={(v) => {
          setText(v);
          const n = Number(v);
          if (v === "") dispatchPlan({ type: "set-gpa", gpa: undefined });
          else if (Number.isFinite(n) && n >= 0 && n <= 4) dispatchPlan({ type: "set-gpa", gpa: n });
        }}
        keyboardType="decimal-pad"
        placeholder="Not entered"
        placeholderTextColor={c.text3}
        accessibilityLabel="Cumulative UMD GPA"
        style={{ borderWidth: 1, borderColor: c.separator, borderRadius: radius.sm, padding: spacing.md, color: c.text, fontSize: 17 }}
      />
    </View>
  );
}
