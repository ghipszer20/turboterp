// Explore, the what-if (ported from apps/web/app/advisor/WhatIfView.tsx): pick a different major or
// minor and see how the current plan fits before committing to it. The comparison runs in the engine
// bridge; the saved plan doesn't change until Apply (which can be undone).
import { useState, type ReactNode } from "react";
import { Pressable, TextInput, View } from "react-native";
import type { AdvisorPlan } from "@turboterp/app-core/plan-state";
import { kindTabs, optionState, pickerGroups } from "@turboterp/app-core/program-picker";
import { PROGRAM_OPTIONS, programsLabel, toggleProgram } from "@turboterp/app-core/programs";
import { addedProgramNotes, completedCreditTotals, gatewayAttemptLimitNote, gatewayRuleText } from "@turboterp/app-core/what-if-display";
import type { CourseWhatIf, WhatIfResult } from "@turboterp/app-core/what-if";
import type { ProgramKind } from "@turboterp/programs";
import { Badge, Button, Card, StatusBadge, Text, useTheme } from "../ui";
import { radius, spacing, type Status } from "../ui/theme";
import { AdvisorGate, Building, EngineNote } from "./AdvisorGate";
import { useWhatIf } from "./analysis";
import { GATEWAY_COURSE_LABEL, GATEWAY_TONE, GPA_LABEL, OVERALL_LABEL, OVERALL_TONE } from "./audit-view-model";
import { dispatchPlan } from "./store";

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/** "A", "A and B", "A, B and C" */
export function listing(items: string[]): string {
  return items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

export function ExploreScreen() {
  return <AdvisorGate title="Explore">{(plan) => <Explore plan={plan} />}</AdvisorGate>;
}

function Explore({ plan }: { plan: AdvisorPlan }) {
  const [proposed, setProposed] = useState<string[]>(plan.programs);
  const [undo, setUndo] = useState<string[] | null>(null);
  // The plan's own programs changed underneath (Apply, Undo, Edit setup): match the picker.
  const [synced, setSynced] = useState(plan.programs);
  if (!sameList(plan.programs, synced)) {
    setSynced(plan.programs);
    setProposed(plan.programs);
  }
  const changed = !sameList(proposed, plan.programs);
  const state = useWhatIf(changed ? proposed : null);

  return (
    <View style={{ gap: spacing.md }}>
      <Card style={{ padding: spacing.lg, gap: spacing.sm }}>
        <Text variant="title" accessibilityRole="header">
          Try a different major or minor
        </Text>
        <Text variant="sub" tone="text2">
          {`Switch a major, add a major or minor, or drop one to see the effect on your plan before committing to it. Your real plan (${programsLabel(plan.programs)}) doesn't change until you press Apply.`}
        </Text>
        <Picker selected={proposed} onToggle={(id) => setProposed((p) => toggleProgram(p, id))} />
        {undo ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" }}>
            <Text variant="sub" style={{ flexShrink: 1 }}>{`Applied. Your plan now uses ${programsLabel(plan.programs)}.`}</Text>
            <Button
              label="Undo"
              variant="secondary"
              onPress={() => {
                dispatchPlan({ type: "set-programs", programs: undo });
                setUndo(null);
              }}
            />
          </View>
        ) : null}
        <Button
          label="Apply"
          disabled={!changed || proposed.length === 0}
          onPress={() => {
            setUndo(plan.programs);
            dispatchPlan({ type: "set-programs", programs: proposed });
          }}
        />
      </Card>

      {!changed ? (
        <Card style={{ padding: spacing.lg }}>
          <Text variant="sub" tone="text2">
            Pick a different major, add one, or drop one above to compare it with your current plan.
          </Text>
        </Card>
      ) : (
        <>
          <EngineNote state={state} retry={state.retry} what="comparison" />
          {state.result ? <Compare result={state.result} current={plan.programs} proposed={proposed} /> : state.status === "unavailable" || state.status === "error" ? null : <Building what="comparison" />}
        </>
      )}
    </View>
  );
}

function Picker({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  const { c } = useTheme();
  const tabs = kindTabs(PROGRAM_OPTIONS);
  const [kind, setKind] = useState<ProgramKind>(tabs[0]?.kind ?? "major");
  const [query, setQuery] = useState("");
  const groups = pickerGroups(PROGRAM_OPTIONS, { kind, query });
  const chosen = selected.map((id) => PROGRAM_OPTIONS.find((o) => o.id === id)?.name ?? id);
  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="caption" tone="text3">
        PROPOSED PROGRAMS
      </Text>
      <Text variant="sub">{chosen.length ? listing(chosen) : "None chosen"}</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search majors, minors and certificates"
        placeholderTextColor={c.text3}
        accessibilityLabel="Search programs"
        autoCorrect={false}
        style={{ borderWidth: 1, borderColor: c.separator, borderRadius: radius.sm, padding: spacing.md, color: c.text, fontSize: 17 }}
      />
      {query.trim() === "" ? (
        <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
          {tabs.map((t) => (
            <Pressable
              key={t.kind}
              accessibilityRole="button"
              accessibilityState={{ selected: kind === t.kind }}
              onPress={() => setKind(t.kind)}
              style={{ paddingHorizontal: spacing.md, minHeight: 36, justifyContent: "center", borderRadius: radius.pill, backgroundColor: kind === t.kind ? c.accent : c.surface2 }}
            >
              <Text variant="sub" style={{ color: kind === t.kind ? c.onAccent : c.text }}>{`${t.label} (${t.count})`}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {groups.length === 0 ? (
        <Text variant="sub" tone="text2">
          No programs match that search.
        </Text>
      ) : (
        groups.map((g) => (
          <View key={g.title}>
            <Text variant="caption" tone="text3" style={{ marginVertical: spacing.xs }}>
              {g.title.toUpperCase()}
            </Text>
            {g.options.map((o) => {
              const st = optionState(o, selected);
              return (
                <Pressable
                  key={o.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: st.on, disabled: st.disabled }}
                  accessibilityHint={st.blocked}
                  disabled={st.disabled}
                  onPress={() => onToggle(o.id)}
                  style={{ minHeight: 44, justifyContent: "center", opacity: st.disabled ? 0.5 : 1 }}
                >
                  <Text variant="body" style={{ fontWeight: st.on ? "600" : "400" }}>
                    {`${st.on ? "✓ " : ""}${o.name}`}
                  </Text>
                  {st.blocked ? (
                    <Text variant="caption" tone="text3">
                      {st.blocked}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))
      )}
    </View>
  );
}

const STATUS_LABEL: Record<CourseWhatIf["currentStatus"], string> = { counts: "Counts", elective: "Elective", unused: "Unused" };
const STATUS_TONE: Record<CourseWhatIf["currentStatus"], Status> = { counts: "open", elective: "soon", unused: "closed" };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card style={{ padding: spacing.lg, gap: spacing.sm }}>
      <Text variant="headline" accessibilityRole="header">
        {title}
      </Text>
      {children}
    </Card>
  );
}

function Compare({ result: r, current, proposed }: { result: WhatIfResult; current: string[]; proposed: string[] }) {
  const changedCourses = r.courses.filter((c) => c.currentStatus !== c.proposedStatus);
  const nameOf = (id: string) => `the ${PROGRAM_OPTIONS.find((o) => o.id === id)?.name ?? id}`;
  const dropped = current.filter((id) => !proposed.includes(id)).map(nameOf);
  const added = proposed.filter((id) => !current.includes(id));
  const notes = addedProgramNotes(current, proposed);
  const totals = completedCreditTotals(r.courses);
  const g = r.gateway;
  return (
    <View style={{ gap: spacing.md }}>
      <Section title="Graduation date">
        <Text variant="sub" tone="text2">
          {`At your typical pace (${r.graduation.typicalLoad} credits a term), your estimated finish term${
            r.graduation.deltaTerms === 0
              ? ` stays ${r.graduation.currentFinishTerm}.`
              : ` would move from ${r.graduation.currentFinishTerm} to ${r.graduation.proposedFinishTerm}, ${r.graduation.deltaTerms > 0 ? "later" : "earlier"}.`
          }`}
        </Text>
      </Section>

      {totals.counts + totals.elective + totals.unused > 0 ? (
        <Section title="Your existing credits">
          <Text variant="sub" tone="text2">
            {`Of the credits you've already earned (completed courses and prior credit), under ${programsLabel(proposed)}: ${totals.counts} count toward a requirement, ${totals.elective} become electives, and ${totals.unused} go unused.`}
          </Text>
        </Section>
      ) : null}

      {notes.length > 0 ? (
        <Section title="Catalog year">
          {notes.map((n) => (
            <View key={n.id} style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.sm, flexWrap: "wrap" }}>
              <Text variant="body" style={{ flexShrink: 1 }}>
                {n.name}
              </Text>
              <View style={{ flexDirection: "row", gap: spacing.xs, alignItems: "center" }}>
                {!n.verified ? <Badge label="Unverified" /> : null}
                <Text variant="sub" tone="text2">
                  {n.catalogYear ? `Catalog ${n.catalogYear.replace("-", "–")}` : "Catalog year not on file"}
                </Text>
              </View>
            </View>
          ))}
        </Section>
      ) : null}

      {r.freedCredits > 0 ? (
        <Section title="Freed credits">
          <Text variant="sub" tone="text2">
            {`${r.freedCredits} credits of not-yet-taken courses would no longer be required${dropped.length > 0 ? ` after dropping ${listing(dropped)}` : ""}.`}
          </Text>
        </Section>
      ) : null}

      {r.orphaned.length > 0 ? (
        <Section title="Would count toward nothing">
          <Text variant="sub" tone="text2">
            {`${listing(r.orphaned)} would no longer count toward any program or Gen Ed requirement. Keep ${r.orphaned.length === 1 ? "it" : "them"} as free electives or swap ${r.orphaned.length === 1 ? "it" : "them"} out.`}
          </Text>
        </Section>
      ) : null}

      {r.newlyMissing.length > 0 ? (
        <Section title="Still needed">
          {r.newlyMissing.map((m) => (
            <View key={m.program.id} style={{ gap: spacing.xs }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.sm, alignItems: "flex-start" }}>
                <Text variant="body" style={{ flex: 1 }}>
                  {m.program.name}
                </Text>
                <StatusBadge status="closed" label={`${m.coursesShort} course${m.coursesShort === 1 ? "" : "s"} short`} />
              </View>
              <Text variant="sub" tone="text2">
                {listing(m.missing)}
              </Text>
            </View>
          ))}
        </Section>
      ) : added.length > 0 ? (
        <Card style={{ padding: spacing.lg }}>
          <Text variant="sub" tone="text2">
            Every newly added major is already satisfied by your current plan.
          </Text>
        </Card>
      ) : null}

      {g ? (
        <Section title="CS gateway (Limited Enrollment Program)">
          <Text variant="sub" tone="text2">
            {gatewayRuleText(g.rule)}
          </Text>
          {g.courses.map((c) => (
            <View key={c.id} style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.sm, alignItems: "flex-start" }}>
              <Text variant="body" style={{ flex: 1 }}>
                {c.name}
              </Text>
              <StatusBadge status={GATEWAY_TONE[c.status]} label={GATEWAY_COURSE_LABEL[c.status]} />
            </View>
          ))}
          <Text variant="sub" tone={g.gpa === "below" ? "danger" : "text2"}>
            {`GPA: ${GPA_LABEL[g.gpa]}${g.gpa === "unknown" ? ". Enter it on the Audit tab." : ""}`}
          </Text>
          <StatusBadge status={OVERALL_TONE[g.overall]} label={OVERALL_LABEL[g.overall]} />
          {gatewayAttemptLimitNote(g) ? (
            <Text variant="sub" tone="danger">
              {gatewayAttemptLimitNote(g)}
            </Text>
          ) : null}
        </Section>
      ) : null}

      <Section title="What changes for your courses">
        {changedCourses.length === 0 ? (
          <Text variant="sub" tone="text2">
            No course's status changes.
          </Text>
        ) : (
          changedCourses.map((c, i) => (
            <View key={`${c.id}-${i}`} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" }}>
              <Text variant="body">{c.id}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                <StatusBadge status={STATUS_TONE[c.currentStatus]} label={STATUS_LABEL[c.currentStatus]} />
                <Text variant="sub">→</Text>
                <StatusBadge status={STATUS_TONE[c.proposedStatus]} label={STATUS_LABEL[c.proposedStatus]} />
              </View>
            </View>
          ))
        )}
        <Text variant="sub" tone="text2">
          {`${r.courses.length - changedCourses.length} of ${r.courses.length} courses are unaffected.`}
        </Text>
      </Section>
    </View>
  );
}
