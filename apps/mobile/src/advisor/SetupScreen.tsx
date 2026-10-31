// Advisor setup (ported from apps/web/app/advisor/SetupView.tsx and ProgramPicker.tsx), as a
// three-step flow: programs, term and college, tracks. First run builds the plan; editing saves it.
import { useRouter } from "expo-router";
import { useState, type ReactNode } from "react";
import { Pressable, TextInput, View } from "react-native";
import type { ProgramKind } from "@turboterp/programs";
import { collegeName, COLLEGES, type College } from "@turboterp/plan/credit-caps";
import { kindTabs, optionState, pickerGroups } from "@turboterp/app-core/program-picker";
import type { DegreeChoice } from "@turboterp/app-core/plan-state";
import { AUTOMATIC_PROGRAMS, CATALOG_YEARS, degreeModeOf, PROGRAM_OPTIONS, toggleProgram, type ProgramOption } from "@turboterp/app-core/programs";
import { defaultTerms, startTermOptions } from "@turboterp/app-core/terms";
import { toggleTrack, TRACKS } from "@turboterp/app-core/tracks";
import { Badge, Button, Card, Screen, SectionHeader, Text, useTheme } from "../ui";
import { radius, spacing } from "../ui/theme";
import { applySetup, canContinue, initialForm, movesCourses, sharedExamMilestones, type SetupForm } from "./setup-model";
import { savePlan, useAdvisorPlan } from "./store";

const KIND_NAME: Record<ProgramKind, string> = { major: "Major", minor: "Minor", certificate: "Certificate", special: "Special program" };
const TABS = kindTabs(PROGRAM_OPTIONS);
const title = (o: ProgramOption) => o.name.replace(/ \(.*\)$/, "");
const STEPS = ["Programs", "Term and college", "Tracks"] as const;

export function SetupScreen() {
  const router = useRouter();
  const plan = useAdvisorPlan();
  const [form, setForm] = useState<SetupForm>(() => initialForm(plan, new Date().getFullYear()));
  const [step, setStep] = useState(0);
  const patch = (p: Partial<SetupForm>) => setForm((f) => ({ ...f, ...p }));
  const last = step === STEPS.length - 1;

  const finish = () => {
    savePlan(applySetup(plan, form));
    router.replace("/advisor/plan");
  };

  return (
    <Screen title={plan ? "Edit setup" : "Set up your plan"} subtitle={`Step ${step + 1} of ${STEPS.length} · ${STEPS[step]}`}>
      {step === 0 ? <ProgramsStep form={form} patch={patch} /> : null}
      {step === 1 ? <TermStep form={form} patch={patch} moves={movesCourses(plan, form)} /> : null}
      {step === 2 ? <TracksStep form={form} patch={patch} planTerms={plan?.terms.map((t) => t.name)} /> : null}
      <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
        <Button
          label={last ? (plan ? "Save" : "Build my plan") : "Continue"}
          disabled={!canContinue(form)}
          onPress={last ? finish : () => setStep(step + 1)}
        />
        {step > 0 ? <Button variant="secondary" label="Back" onPress={() => setStep(step - 1)} /> : null}
        {plan && step === 0 ? <Button variant="secondary" label="Cancel" onPress={() => router.back()} /> : null}
        {!canContinue(form) ? (
          <Text variant="sub" tone="text3">
            Pick at least one program to continue.
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

type StepProps = { form: SetupForm; patch: (p: Partial<SetupForm>) => void };

/** A tappable row with a check, used for programs, tracks and colleges. */
function Option({ on, disabled, title: t, sub, trailing, onPress }: { on: boolean; disabled?: boolean; title: string; sub?: string; trailing?: ReactNode; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on, disabled: !!disabled }}
      accessibilityLabel={sub ? `${t}. ${sub}` : t}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        padding: spacing.md,
        minHeight: 52,
        opacity: disabled ? 0.45 : 1,
        backgroundColor: pressed ? c.surfacePressed : "transparent",
      })}
    >
      <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: c.accent, backgroundColor: on ? c.accent : "transparent", alignItems: "center", justifyContent: "center" }}>
        {on ? <Text variant="caption" style={{ color: c.onAccent, fontWeight: "700" }}>✓</Text> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="headline">{t}</Text>
        {sub ? (
          <Text variant="sub" tone="text2">
            {sub}
          </Text>
        ) : null}
      </View>
      {trailing}
    </Pressable>
  );
}

function Chips<T extends string>({ label, options, value, onChange }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, minHeight: 40, justifyContent: "center", borderRadius: radius.pill, backgroundColor: on ? c.accent : c.surface }}
          >
            <Text variant="sub" style={{ color: on ? c.onAccent : c.text, fontWeight: "600" }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ProgramsStep({ form, patch }: StepProps) {
  const { c } = useTheme();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<ProgramKind>("major");
  const selected = form.programs;
  const groups = pickerGroups(PROGRAM_OPTIONS, { kind, query });
  const searching = query.trim() !== "";
  const chosen = selected.map((id) => PROGRAM_OPTIONS.find((o) => o.id === id)).filter((o): o is ProgramOption => o !== undefined);
  const degreeMode = degreeModeOf(selected, form.degreeChoice);
  const toggle = (id: string) => patch({ programs: toggleProgram(selected, id) });

  return (
    <View style={{ gap: spacing.md }}>
      <Text tone="text2">Pick every major, minor or program you have or want. A major can have one track.</Text>
      {chosen.length ? (
        <Card style={{ padding: spacing.sm }}>
          <SectionHeader title={`Chosen (${chosen.length})`} />
          {chosen.map((o) => (
            <Option key={o.id} on title={o.short ?? title(o)} sub={KIND_NAME[o.kind]} onPress={() => toggle(o.id)} />
          ))}
        </Card>
      ) : null}
      {degreeMode ? (
        <Card style={{ padding: spacing.lg, gap: spacing.sm }}>
          <Text variant="headline">Two majors as</Text>
          <Chips<DegreeChoice>
            label="Two majors as"
            options={[
              { value: "double-major", label: "Double major" },
              { value: "double-degree", label: "Double degree" },
            ]}
            value={degreeMode}
            onChange={(v) => patch({ degreeChoice: v })}
          />
          <Text variant="sub" tone="text2">
            {degreeMode === "double-major"
              ? "One degree, 120 credits. A course can count toward both majors."
              : "Two degrees, 150 credits. Each degree needs 18 credits that don't count toward the other."}
          </Text>
        </Card>
      ) : null}
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search majors, minors and programs"
        placeholderTextColor={c.text3}
        accessibilityLabel="Search programs"
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        style={{ backgroundColor: c.surface, color: c.text, borderRadius: radius.md, padding: spacing.md, fontSize: 17 }}
      />
      {!searching && TABS.length > 1 ? (
        <Chips<ProgramKind> label="Program type" options={TABS.map((t) => ({ value: t.kind, label: t.label }))} value={kind} onChange={setKind} />
      ) : null}
      {groups.length === 0 ? <Text tone="text2">No program matches “{query.trim()}”.</Text> : null}
      {groups.map((g) => (
        <View key={g.title}>
          <SectionHeader title={g.title} />
          <Card>
            {g.options.map((o) => {
              const { on, disabled, blocked } = optionState(o, selected);
              const base = o.track ? `${o.track} track` : KIND_NAME[o.kind];
              return (
                <Option
                  key={o.id}
                  on={on}
                  disabled={disabled}
                  title={title(o)}
                  sub={blocked ?? (searching ? `${base} · ${collegeName(o.college)}` : base)}
                  trailing={!o.verified ? <Badge label="Unverified" /> : undefined}
                  onPress={() => toggle(o.id)}
                />
              );
            })}
          </Card>
        </View>
      ))}
      <Text variant="sub" tone="text3">
        Always included: {AUTOMATIC_PROGRAMS.map((p) => p.name).join(" and ")}.
      </Text>
    </View>
  );
}

function TermStep({ form, patch, moves }: StepProps & { moves: boolean }) {
  const terms = startTermOptions(new Date().getFullYear());
  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ gap: spacing.sm }}>
        <Text variant="headline">Catalog year</Text>
        <Chips<string> label="Catalog year" options={CATALOG_YEARS.map((y) => ({ value: y, label: y.replace("-", "–") }))} value={form.catalogYear} onChange={(v) => patch({ catalogYear: v })} />
        <Text variant="sub" tone="text2">
          Usually the year you started or declared. Only 2026–27 for now.
        </Text>
      </View>
      <View style={{ gap: spacing.sm }}>
        <Text variant="headline">First term at UMD</Text>
        <Chips<string> label="First term" options={terms.map((t) => ({ value: t, label: t }))} value={form.startTerm} onChange={(v) => patch({ startTerm: v })} />
        {moves ? (
          <Text variant="sub" style={{ color: "#B45309" }}>
            Changing your first term moves every course to the matching term.
          </Text>
        ) : null}
        <Option on={form.transfer} title="I started at UMD as a transfer student" onPress={() => patch({ transfer: !form.transfer })} />
      </View>
      <View style={{ gap: spacing.sm }}>
        <Text variant="headline">College</Text>
        <Text variant="sub" tone="text2">
          Your college sets your credit limit per term.
        </Text>
        <Card>
          {COLLEGES.map((c) => (
            <Option key={c.code} on={form.college === c.code} title={c.name} onPress={() => patch({ college: c.code as College })} />
          ))}
        </Card>
      </View>
    </View>
  );
}

function TracksStep({ form, patch, planTerms }: StepProps & { planTerms: string[] | undefined }) {
  const chosen = TRACKS.filter((t) => form.tracks.includes(t.id));
  const milestones = sharedExamMilestones(chosen);
  const termNames = planTerms ?? defaultTerms(form.startTerm);
  const setExamTerm = (id: string, term: string) => {
    const next = { ...form.examTerms };
    if (term) next[id] = term;
    else delete next[id];
    patch({ examTerms: next });
  };
  return (
    <View style={{ gap: spacing.md }}>
      <Text tone="text2">
        Optional. What professional schools expect you to take. Not a UMD graduation requirement.
      </Text>
      <Card>
        {TRACKS.map((t) => (
          <Option
            key={t.id}
            on={form.tracks.includes(t.id)}
            title={t.name}
            sub={`For ${t.schools}`}
            trailing={<Badge label="Unverified" />}
            onPress={() => patch({ tracks: toggleTrack(form.tracks, t.id) })}
          />
        ))}
      </Card>
      {milestones.map(({ milestone, trackNames }) => (
        <View key={milestone.id} style={{ gap: spacing.sm }}>
          <Text variant="headline">
            Planned {milestone.name} term{trackNames.length > 1 ? ` (${trackNames.join(", ")})` : ""}
          </Text>
          <Chips<string>
            label={`Planned ${milestone.name} term`}
            options={[{ value: "", label: "Not entered" }, ...termNames.map((n) => ({ value: n, label: n }))]}
            value={form.examTerms[milestone.id] ?? ""}
            onChange={(v) => setExamTerm(milestone.id, v)}
          />
        </View>
      ))}
    </View>
  );
}
