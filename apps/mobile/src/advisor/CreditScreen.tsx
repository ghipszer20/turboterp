// Prior credit (AP, IB, dual enrollment) and the college's credit caps. Ported from the web's
// PriorCreditView; every edit goes through the Advisor store, so the plan, audit and sync follow.
import { useRouter } from "expo-router";
import { useMemo, useState, type ReactNode } from "react";
import { Pressable, Switch, TextInput, View } from "react-native";
import { apExamNames, ibExamNames, type IbLevel } from "@turboterp/credit";
import type { AdvisorPlan } from "@turboterp/app-core/plan-state";
import { computePriorCredit, ibLevelsFor, removePriorEntry, type PriorEntry } from "@turboterp/app-core/prior-credit";
import { Button, Card, StatusBadge, Text, useTheme } from "../ui";
import { radius, spacing } from "../ui/theme";
import { AdvisorGate } from "./AdvisorGate";
import { useAnalysis } from "./analysis";
import {
  addAp,
  addDual,
  addIb,
  AP_SCORES,
  buildCreditCaps,
  dualValid,
  earnText,
  ENTRY_STATUS_LABEL,
  ENTRY_STATUS_TONE,
  IB_SCORES,
  setChoice,
  type DualDraft,
} from "./credit-view-model";
import type { CatalogData } from "./data-core";
import { dispatchPlan } from "./store";

const AP_EXAMS = apExamNames();
const IB_EXAMS = ibExamNames();
const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `k${Math.random().toString(36).slice(2)}`);

export function CreditScreen() {
  return <AdvisorGate title="Prior credit">{(plan, data) => <Body plan={plan} data={data} />}</AdvisorGate>;
}

function Body({ plan, data }: { plan: AdvisorPlan; data: CatalogData }) {
  const router = useRouter();
  const analysis = useAnalysis();
  const genEdOf = (id: string) => data.catalog.get(id)?.genEd ?? [];
  const autoChoices = analysis?.autoChoices;
  const prior = useMemo(
    () => computePriorCredit(plan.prior, genEdOf, autoChoices && Object.keys(autoChoices).length ? autoChoices : {}),
    // genEdOf reads the catalog only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plan.prior, data, autoChoices],
  );
  const caps = useMemo(
    () =>
      buildCreditCaps({
        college: plan.college,
        terms: plan.terms,
        creditsOf: (c) => c.credits ?? data.catalog.get(c.id)?.credits.min ?? null,
      }),
    [plan.college, plan.terms, data],
  );
  const commit = (next: AdvisorPlan["prior"]) => dispatchPlan({ type: "set-prior", prior: next });
  const remove = (kind: "ap" | "ib" | "dual", key: string) => commit(removePriorEntry(plan.prior, kind, key));

  return (
    <View style={{ gap: spacing.lg }}>
      <Card style={{ padding: spacing.lg, gap: spacing.sm }}>
        <Text variant="headline" accessibilityRole="header">
          What you have
        </Text>
        <Text variant="sub" tone="text2">
          {`${prior.totalCredits} credit${prior.totalCredits === 1 ? "" : "s"} counted toward your plan.`}
        </Text>
        {prior.entries.length === 0 ? (
          <Text variant="sub" tone="text2">
            Add an AP or IB exam, or a dual-enrollment course, below.
          </Text>
        ) : (
          prior.entries.map((e) => <EntryRow key={e.key} entry={e} onRemove={() => remove(e.kind, e.key)} onPick={(id) => commit(setChoice(plan.prior, e.source, id))} />)
        )}
      </Card>

      {prior.notCounted.length > 0 ? (
        <Card style={{ padding: spacing.lg, gap: spacing.sm }}>
          <Text variant="headline" accessibilityRole="header">
            Overkill
          </Text>
          <Text variant="sub" tone="text2">
            Credit UMD counts only once. These rows don&apos;t add anything new.
          </Text>
          {prior.notCounted.map((n, i) => (
            <View key={i} style={{ gap: spacing.xs }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" }}>
                <Text variant="body" style={{ flexShrink: 1 }}>
                  {n.source}
                </Text>
                <StatusBadge status="soon" label={n.kind === "overkill" ? "Overkill" : "Not counted"} />
              </View>
              <Text variant="sub" tone="text2">
                {n.reason}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}

      <ApForm onAdd={(exam, score) => commit(addAp(plan.prior, uid(), exam, score))} />
      <IbForm onAdd={(exam, level, score) => commit(addIb(plan.prior, uid(), exam, level, score))} />
      <DualForm onAdd={(d) => commit(addDual(plan.prior, uid(), d))} />

      <Card style={{ padding: spacing.lg, gap: spacing.sm }}>
        <Text variant="headline" accessibilityRole="header">
          Credit limits
        </Text>
        <Text variant="sub" tone="text2">
          {caps.usesDefault
            ? "Using UMD's campus-wide limits. Choose your college in setup for its own limits."
            : `Limits for ${caps.collegeLabel} students. Going over a limit needs approval.`}
        </Text>
        {caps.rules.map((r) => (
          <Text key={r.season} variant="sub">
            {`${r.season}: up to ${r.max} credits (more needs ${r.approval}).`}
          </Text>
        ))}
        {caps.terms.length > 0 ? (
          <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
            <Text variant="headline">Your plan against them</Text>
            {caps.terms.map((t) => (
              <View key={t.name} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Text variant="body">{t.name}</Text>
                  <Text variant="sub" tone="text2">
                    {t.text}
                  </Text>
                </View>
                {t.status === "over" ? <StatusBadge status="closed" label="Over" /> : t.status === "at" ? <StatusBadge status="soon" label="At limit" /> : null}
              </View>
            ))}
          </View>
        ) : null}
      </Card>

      <View style={{ gap: spacing.sm }}>
        <Button variant="secondary" label="Pre-professional tracks" onPress={() => router.push("/advisor/tracks")} />
        <Button variant="secondary" label="Back to my plan" onPress={() => router.push("/advisor/plan")} />
      </View>
    </View>
  );
}

function EntryRow({ entry, onRemove, onPick }: { entry: PriorEntry; onRemove: () => void; onPick: (id: string) => void }) {
  const { c } = useTheme();
  return (
    <View style={{ paddingTop: spacing.sm, gap: spacing.xs, borderTopWidth: 1, borderTopColor: c.separator }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        <Text variant="body" style={{ flex: 1 }}>
          {entry.source}
        </Text>
        <StatusBadge status={ENTRY_STATUS_TONE[entry.status]} label={ENTRY_STATUS_LABEL[entry.status]} />
      </View>
      {entry.error ? (
        <Text variant="sub" tone="danger">
          {entry.error}
        </Text>
      ) : null}
      {entry.earns.map((earn, i) => (
        <View key={i} style={{ gap: spacing.xs }}>
          <Text variant="sub" tone="text2">
            {earnText(earn)}
          </Text>
          {earn.kind === "choice" ? (
            <View>
              <Chips
                label={`Course for ${entry.source}`}
                value={earn.auto ? "" : (earn.picked ?? "")}
                options={[{ value: "", label: "Automatic" }, ...earn.options.map((o) => ({ value: o.id, label: o.genEd.length ? `${o.id} · ${o.genEd.join(", ")}` : o.id }))]}
                onChange={onPick}
              />
              <Text variant="caption" tone="text3" style={{ marginTop: spacing.xs }}>
                {earn.auto
                  ? `TurboTerp picked ${earn.picked ?? "one"} to fit your plan. If UMD posted the other course, choose it.`
                  : "Pick the course UMD posted for this exam. Your degree audit or transcript lists it."}
              </Text>
            </View>
          ) : null}
        </View>
      ))}
      {entry.notes.map((n, i) => (
        <Text key={i} variant="caption" tone="text3">
          {n}
        </Text>
      ))}
      <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${entry.source}`} onPress={onRemove} hitSlop={8} style={{ minHeight: 44, justifyContent: "center", alignSelf: "flex-start" }}>
        <Text variant="sub" tone="danger" style={{ fontWeight: "600" }}>
          Remove
        </Text>
      </Pressable>
    </View>
  );
}

function Chips<T extends string | number>({ label, options, value, onChange }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, minHeight: 40, justifyContent: "center", borderRadius: radius.pill, backgroundColor: on ? c.accent : c.bg }}
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text variant="caption" tone="text2">
        {label}
      </Text>
      {children}
    </View>
  );
}

function Input(props: { value: string; onChangeText: (v: string) => void; label: string; placeholder?: string; numeric?: boolean; caps?: boolean }) {
  const { c } = useTheme();
  return (
    <TextInput
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
      placeholderTextColor={c.text3}
      accessibilityLabel={props.label}
      keyboardType={props.numeric ? "number-pad" : "default"}
      autoCapitalize={props.caps ? "characters" : "none"}
      autoCorrect={false}
      style={{ borderWidth: 1, borderColor: c.separator, borderRadius: radius.sm, padding: spacing.md, color: c.text, fontSize: 17 }}
    />
  );
}

/** A searchable list for the long exam lists: type to narrow, tap to choose. */
function ExamPicker({ label, exams, value, onChange }: { label: string; exams: string[]; value: string; onChange: (v: string) => void }) {
  const { c } = useTheme();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const shown = exams.filter((e) => e.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8);
  return (
    <Field label={label}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}. Change`}
        onPress={() => setOpen((o) => !o)}
        style={{ borderWidth: 1, borderColor: c.separator, borderRadius: radius.sm, padding: spacing.md, minHeight: 48, justifyContent: "center" }}
      >
        <Text variant="body">{value}</Text>
      </Pressable>
      {open ? (
        <View style={{ gap: spacing.xs }}>
          <Input value={query} onChangeText={setQuery} label={`Search ${label}`} placeholder="Search" />
          {shown.map((e) => (
            <Pressable
              key={e}
              accessibilityRole="button"
              onPress={() => {
                onChange(e);
                setOpen(false);
                setQuery("");
              }}
              style={({ pressed }) => ({ padding: spacing.md, minHeight: 44, justifyContent: "center", backgroundColor: pressed ? c.surfacePressed : "transparent" })}
            >
              <Text variant="body">{e}</Text>
            </Pressable>
          ))}
          {shown.length === 0 ? (
            <Text variant="sub" tone="text2">
              No exam matches.
            </Text>
          ) : null}
        </View>
      ) : null}
    </Field>
  );
}

function FormCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card style={{ padding: spacing.lg, gap: spacing.md }}>
      <Text variant="headline" accessibilityRole="header">
        {title}
      </Text>
      {children}
    </Card>
  );
}

function ApForm({ onAdd }: { onAdd: (exam: string, score: number) => void }) {
  const [exam, setExam] = useState(AP_EXAMS[0] ?? "");
  const [score, setScore] = useState(5);
  return (
    <FormCard title="Add an AP exam">
      <ExamPicker label="Exam" exams={AP_EXAMS} value={exam} onChange={setExam} />
      <Field label="Score">
        <Chips label="AP score" value={score} onChange={setScore} options={AP_SCORES.map((s) => ({ value: s, label: String(s) }))} />
      </Field>
      <Button label="Add AP exam" onPress={() => onAdd(exam, score)} disabled={!exam} />
    </FormCard>
  );
}

function IbForm({ onAdd }: { onAdd: (exam: string, level: IbLevel, score: number) => void }) {
  const [exam, setExam] = useState(IB_EXAMS[0] ?? "");
  const levels = ibLevelsFor(exam);
  const [level, setLevel] = useState<IbLevel>(levels[0] ?? "HL");
  const [score, setScore] = useState(6);
  const shownLevel = levels.includes(level) ? level : (levels[0] ?? "HL");
  return (
    <FormCard title="Add an IB exam">
      <ExamPicker
        label="Exam"
        exams={IB_EXAMS}
        value={exam}
        onChange={(e) => {
          setExam(e);
          const ls = ibLevelsFor(e);
          if (!ls.includes(level)) setLevel(ls[0] ?? "HL");
        }}
      />
      <Field label="Level">
        <Chips label="IB level" value={shownLevel} onChange={setLevel} options={levels.map((l) => ({ value: l, label: l }))} />
      </Field>
      <Field label="Score">
        <Chips label="IB score" value={score} onChange={setScore} options={IB_SCORES.map((s) => ({ value: s, label: String(s) }))} />
      </Field>
      <Button label="Add IB exam" onPress={() => onAdd(exam, shownLevel, score)} disabled={!exam} />
    </FormCard>
  );
}

function DualForm({ onAdd }: { onAdd: (d: DualDraft) => void }) {
  const [d, setD] = useState<DualDraft>({ institution: "", course: "", credits: 3, elective: false, umd: "" });
  const patch = (p: Partial<DualDraft>) => setD((x) => ({ ...x, ...p }));
  return (
    <FormCard title="Add a dual-enrollment or transfer course">
      <Field label="Institution">
        <Input value={d.institution} onChangeText={(v) => patch({ institution: v })} label="Institution" placeholder="e.g. Montgomery College" />
      </Field>
      <Field label="Their course">
        <Input value={d.course} onChangeText={(v) => patch({ course: v })} label="Their course" placeholder="e.g. MATH181" caps />
      </Field>
      <Field label="Credits">
        <Input value={String(d.credits || "")} onChangeText={(v) => patch({ credits: Number(v.replace(/\D/g, "")) })} label="Credits" numeric />
      </Field>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
        <Text variant="sub" style={{ flex: 1 }}>
          Transfers as elective credit (no UMD equivalent)
        </Text>
        <Switch value={d.elective} onValueChange={(v) => patch({ elective: v })} accessibilityLabel="Transfers as elective credit" />
      </View>
      {!d.elective ? (
        <Field label="UMD equivalent">
          <Input value={d.umd} onChangeText={(v) => patch({ umd: v })} label="UMD equivalent" placeholder="e.g. MATH141" caps />
        </Field>
      ) : null}
      <Button
        label="Add course"
        disabled={!dualValid(d)}
        onPress={() => {
          onAdd(d);
          setD({ institution: "", course: "", credits: 3, elective: false, umd: "" });
        }}
      />
    </FormCard>
  );
}
