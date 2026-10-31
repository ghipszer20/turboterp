// The 4-year plan grid (ported from apps/web/app/advisor/PlanView.tsx and ChecksPanel.tsx):
// one column of term sections, courses as rows colored by requirement category. Long-press a
// course to move or remove it.
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Modal, Pressable, ScrollView, TextInput, View } from "react-native";
import { checkPlan } from "@turboterp/plan/check";
import type { TermDifficulty } from "@turboterp/plan/difficulty";
import { checkerPlan } from "@turboterp/app-core/checker";
import { planDifficulty } from "@turboterp/app-core/difficulty";
import { groupIssues, planTips, SEVERITY } from "@turboterp/app-core/issues";
import { computePriorCredit } from "@turboterp/app-core/prior-credit";
import { legendCategories, rowCategory, type RowCategory } from "@turboterp/app-core/row-category";
import { searchCourses } from "@turboterp/app-core/search";
import { TEST_STUDENTS } from "@turboterp/app-core/test-students";
import { Button, Card, EmptyState, ErrorState, OfflineState, Screen, Skeleton, Text, tap, useTheme } from "../ui";
import { radius, spacing } from "../ui/theme";
import { CourseSheet } from "../course/CourseSheet";
import { useAnalysis } from "./analysis";
import { advisorData, useCatalog } from "./data";
import type { CatalogData } from "./data-core";
import { buildPlanView, CATEGORY_COLORS, CATEGORY_LABELS, moveTargets, nextMainTerm, type CourseRow, type TermSection } from "./plan-view-model";
import { dispatchPlan, refreshPlan, savePlan, useAdvisorPlan } from "./store";

export function PlanScreen() {
  const plan = useAdvisorPlan();
  const { result, retry } = useCatalog();
  // Account sync can replace the plan while another screen is up: re-read when this one is shown.
  useFocusEffect(useCallback(() => refreshPlan(), []));

  if (!plan) return <NoPlan />;
  if (!result) {
    return (
      <Screen title="4-year plan">
        <Skeleton rows={5} />
      </Screen>
    );
  }
  if (result.status === "offline") {
    return (
      <Screen title="4-year plan">
        <OfflineState onRetry={retry} />
      </Screen>
    );
  }
  if (result.status === "missing") {
    return (
      <Screen title="4-year plan">
        <ErrorState title="Course data isn't available" body="TurboTerp couldn't load its course data, so it can't search courses or check prerequisites." onRetry={retry} />
      </Screen>
    );
  }
  return <Plan data={result.data} />;
}

function NoPlan() {
  const router = useRouter();
  return (
    <Screen title="4-year plan">
      <EmptyState title="No plan yet" body="Set up your majors and start term, and TurboTerp builds a 4-year plan you can edit." />
      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        <Button label="Set up my plan" onPress={() => router.push("/advisor/setup")} />
        {__DEV__ ? <Button variant="secondary" label="Load sample student (dev)" onPress={() => savePlan(TEST_STUDENTS[0]!.plan)} /> : null}
      </View>
    </Screen>
  );
}

type Sheet = { kind: "course"; term: string; id: string } | { kind: "move"; term: string; id: string } | { kind: "add"; term: string } | null;

function Plan({ data }: { data: CatalogData }) {
  const router = useRouter();
  const plan = useAdvisorPlan()!;
  const { c } = useTheme();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const genEdOf = useCallback((id: string) => data.catalog.get(id)?.genEd ?? [], [data]);
  const ownPrior = useMemo(() => computePriorCredit(plan.prior, genEdOf), [plan.prior, genEdOf]);
  const analysis = useAnalysis();
  const prior = useMemo(
    () => (analysis?.autoChoices && Object.keys(analysis.autoChoices).length ? computePriorCredit(plan.prior, genEdOf, analysis.autoChoices) : ownPrior),
    [plan.prior, genEdOf, analysis, ownPrior],
  );
  const checked = useMemo(() => {
    // collegeOf (from the program registry) isn't importable in the app yet: the saved college decides the credit caps.
    const issues = checkPlan(checkerPlan(plan, prior.courses), data.catalog, { college: plan.college });
    return { issues, groups: groupIssues(issues, plan.terms.map((t) => t.name)) };
  }, [plan, prior.courses, data]);

  const creditsOf = useCallback((id: string, own?: number) => own ?? data.catalog.get(id)?.credits.min ?? null, [data]);
  const [difficulty, setDifficulty] = useState<Map<string, TermDifficulty>>(new Map());
  useEffect(() => {
    let live = true;
    planDifficulty(plan, creditsOf, (id) => advisorData.loadGrades(id))
      .then((d) => live && setDifficulty(d))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [plan, creditsOf]);

  const cats = useMemo(() => {
    const m = new Map<string, RowCategory>();
    if (analysis) for (const t of plan.terms) for (const course of t.courses) m.set(course.id, rowCategory(course.id, analysis));
    return m;
  }, [analysis, plan.terms]);

  const vm = useMemo(
    () =>
      buildPlanView({
        plan,
        lookup: (id) => {
          const info = data.catalog.get(id);
          return info ? { title: info.title, credits: info.credits.min } : null;
        },
        groups: checked.groups,
        categoryOf: (id) => cats.get(id) ?? "elective",
        difficulty,
      }),
    [plan, data, checked, cats, difficulty],
  );
  const legend = legendCategories(vm.years.flatMap((y) => y.terms.flatMap((t) => t.courses.map((r) => r.category))));
  const total = vm.totalCredits + prior.totalCredits;
  const programChecks = (analysis?.degrees?.issues ?? []).filter((i) => i.severity === "error" || i.severity === "warning");
  const tips = planTips(checked.issues, [
    ...(analysis?.notices ?? []).map((n) => n.message),
    ...(analysis?.degrees?.issues ?? []).filter((i) => i.severity === "info").map((i) => i.message),
  ]);
  const lastTerm = plan.terms.at(-1)?.name;
  const find = (term: string, id: string) => vm.years.flatMap((y) => y.terms).find((t) => t.name === term)?.courses.find((r) => r.id === id);

  return (
    <Screen title="4-year plan">
      <Card style={{ padding: spacing.lg, gap: spacing.xs }}>
        <Text variant="headline">
          {total} credits planned{prior.totalCredits > 0 ? ` (${prior.totalCredits} from prior credit)` : ""}
        </Text>
        {vm.countLabels.length > 0 ? (
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            {vm.countLabels.map((l) => (
              <Text key={l.severity} variant="sub" style={{ color: l.severity === "error" ? c.danger : c.soon, fontWeight: "600" }}>
                {l.text}
              </Text>
            ))}
          </View>
        ) : (
          <Text variant="sub" tone="text2">
            No problems found in your plan.
          </Text>
        )}
      </Card>
      <View style={{ marginTop: spacing.sm, gap: spacing.sm }}>
        <Button variant="secondary" label="Edit setup" onPress={() => router.push("/advisor/setup")} />
        <Button variant="secondary" label="Prior credit and credit limits" onPress={() => router.push("/advisor/credit")} />
        {(plan.tracks ?? []).length > 0 ? <Button variant="secondary" label="Pre-professional tracks" onPress={() => router.push("/advisor/tracks")} /> : null}
      </View>

      {programChecks.length > 0 ? (
        <Card style={{ padding: spacing.lg, marginTop: spacing.md, gap: spacing.sm }}>
          <Text variant="headline">Program checks</Text>
          {programChecks.map((i, n) => (
            <IssueLine key={n} severity={i.severity} message={i.message} />
          ))}
        </Card>
      ) : null}

      {legend.length > 0 ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.lg }} accessibilityLabel="Course colors">
          {legend.map((cat) => (
            <View key={cat} style={{ backgroundColor: color(c.bg === "#000000", cat).bg, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 3 }}>
              <Text variant="caption" style={{ color: color(c.bg === "#000000", cat).fg }}>
                {CATEGORY_LABELS[cat]}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {vm.years.map((y) => (
        <View key={y.label}>
          <Text variant="title" accessibilityRole="header" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
            Year {y.number} <Text variant="sub" tone="text2">{y.label}</Text>
          </Text>
          <View style={{ gap: spacing.md }}>
            {y.terms.map((t) => (
              <TermCard
                key={t.name}
                term={t}
                onAdd={() => setSheet({ kind: "add", term: t.name })}
                onCourse={(id) => setSheet({ kind: "course", term: t.name, id })}
              />
            ))}
          </View>
          <OptionalTerms yearTerms={y.terms.map((t) => t.name)} />
        </View>
      ))}

      {lastTerm ? (
        <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
          <Button variant="secondary" label={`+ Add ${nextMainTerm(lastTerm)}`} onPress={() => dispatchPlan({ type: "add-term", name: nextMainTerm(lastTerm) })} />
        </View>
      ) : null}

      {tips.length > 0 ? (
        <View style={{ marginTop: spacing.xl, gap: spacing.xs }}>
          <Text variant="headline">Tips</Text>
          {tips.map((tip) => (
            <Text key={tip} variant="foot" tone="text2">
              {tip}
            </Text>
          ))}
        </View>
      ) : null}
      <Text variant="foot" tone="text3" style={{ marginTop: spacing.xl }}>
        Unofficial. Not affiliated with the University of Maryland. Not academic advising: confirm your plan with your advisor and UMD&apos;s official degree audit.
      </Text>

      <Sheet visible={sheet?.kind === "course"} title={sheet?.kind === "course" ? sheet.id : ""} onClose={() => setSheet(null)}>
        {sheet?.kind === "course" ? (
          <>
            {find(sheet.term, sheet.id)?.title ? (
              <Text variant="sub" tone="text2" style={{ paddingHorizontal: spacing.lg }}>
                {find(sheet.term, sheet.id)!.title}
              </Text>
            ) : null}
            <SheetRow
              label="Course details"
              onPress={() => {
                setDetail(sheet.id);
                setSheet(null);
              }}
            />
            <SheetRow label="Move to another term" onPress={() => setSheet({ kind: "move", term: sheet.term, id: sheet.id })} />
            <SheetRow
              label="Remove from plan"
              danger
              onPress={() => {
                dispatchPlan({ type: "remove-course", term: sheet.term, id: sheet.id });
                setSheet(null);
              }}
            />
          </>
        ) : null}
      </Sheet>
      <Sheet visible={sheet?.kind === "move"} title={sheet?.kind === "move" ? `Move ${sheet.id} to` : ""} onClose={() => setSheet(null)}>
        {sheet?.kind === "move"
          ? moveTargets(plan, sheet.term).map((name) => (
              <SheetRow
                key={name}
                label={name}
                onPress={() => {
                  dispatchPlan({ type: "move-course", id: sheet.id, from: sheet.term, to: name });
                  setSheet(null);
                }}
              />
            ))
          : null}
      </Sheet>
      <CourseSheet courseId={detail} onClose={() => setDetail(null)} />
      {sheet?.kind === "add" ? <AddCourseSheet termName={sheet.term} data={data} onClose={() => setSheet(null)} /> : null}
    </Screen>
  );
}

const color = (dark: boolean, cat: RowCategory) => CATEGORY_COLORS[dark ? "dark" : "light"][cat];

function IssueLine({ severity, message }: { severity: "error" | "warning" | "confirm" | "info"; message: string }) {
  const { c } = useTheme();
  const tone = severity === "error" ? c.danger : severity === "warning" ? c.soon : c.text2;
  return (
    <Text variant="sub" accessibilityLabel={`${SEVERITY[severity].label}: ${message}`}>
      <Text variant="sub" style={{ color: tone, fontWeight: "600" }}>
        {SEVERITY[severity].label}{" "}
      </Text>
      {message}
    </Text>
  );
}

function TermCard({ term, onAdd, onCourse }: { term: TermSection; onAdd: () => void; onCourse: (id: string) => void }) {
  const { c } = useTheme();
  const danger = term.issues.some((i) => i.severity === "error");
  return (
    <Card style={{ padding: spacing.md, gap: spacing.sm, borderWidth: danger ? 1 : 0, borderColor: c.danger }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
        <Text variant="headline" accessibilityRole="header">
          {term.name}
        </Text>
        <Text variant="sub" tone="text2">
          {term.credits}
          {term.creditsApprox ? "+" : ""} credits
        </Text>
      </View>
      {term.difficulty ? (
        <Text variant="foot" tone="text2">
          Difficulty {term.difficulty.score}/10 (estimate). {term.difficulty.sentence}
        </Text>
      ) : null}
      {term.issues.map((i, n) => (
        <IssueLine key={n} severity={i.severity} message={i.message} />
      ))}
      {term.courses.map((r) => (
        <CourseRowView key={r.id} row={r} onPress={() => onCourse(r.id)} />
      ))}
      {term.courses.length === 0 ? (
        <Text variant="sub" tone="text3">
          No courses yet.
        </Text>
      ) : null}
      <Pressable accessibilityRole="button" accessibilityLabel={`Add a course to ${term.name}`} onPress={onAdd} style={{ paddingVertical: spacing.sm }}>
        <Text variant="sub" tone="accent" style={{ fontWeight: "600" }}>
          + Add course
        </Text>
      </Pressable>
      {term.optional ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${term.name}`}
          onPress={() => dispatchPlan({ type: "remove-term", name: term.name })}
        >
          <Text variant="foot" tone="text3">
            Remove {term.name}
            {term.courses.length ? ` and its ${term.courses.length} course${term.courses.length === 1 ? "" : "s"}` : ""}
          </Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

function CourseRowView({ row, onPress }: { row: CourseRow; onPress: () => void }) {
  const { c } = useTheme();
  const col = color(c.bg === "#000000", row.category);
  const noteColor = row.severity === "error" ? c.danger : row.severity === "warning" ? c.soon : c.text2;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={() => {
        tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={`${row.id}${row.title ? `, ${row.title}` : ""}, ${row.credits ?? "unknown"} credits${row.note ? `. ${row.note}` : ""}`}
      accessibilityHint="Opens move and remove options"
      style={({ pressed }) => ({
        backgroundColor: col.bg,
        borderRadius: radius.md,
        padding: spacing.md,
        gap: 2,
        opacity: pressed ? 0.8 : 1,
        borderLeftWidth: row.severity === "error" || row.severity === "warning" ? 4 : 0,
        borderLeftColor: noteColor,
      })}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text variant="headline" style={{ color: col.fg }}>
          {row.id}
          {row.grad ? "  Grad" : ""}
        </Text>
        <Text variant="sub" style={{ color: col.fg }}>
          {row.credits ?? "?"} cr
        </Text>
      </View>
      {row.title ? (
        <Text variant="sub" style={{ color: col.fg }} numberOfLines={2}>
          {row.title}
        </Text>
      ) : null}
      {row.note ? (
        <Text variant="foot" style={{ color: noteColor, fontWeight: "600" }}>
          {row.note}
        </Text>
      ) : null}
    </Pressable>
  );
}

/** "+ Winter" and "+ Summer" for an academic year that doesn't have them. */
function OptionalTerms({ yearTerms }: { yearTerms: string[] }) {
  const fall = yearTerms.find((n) => n.startsWith("Fall "));
  const spring = yearTerms.find((n) => n.startsWith("Spring "));
  const next = fall ? Number(fall.slice(5)) + 1 : spring ? Number(spring.slice(7)) : null;
  if (next === null) return null;
  const missing = [
    ...(fall && !yearTerms.includes(`Winter ${next}`) ? [`Winter ${next}`] : []),
    ...(!yearTerms.includes(`Summer ${next}`) ? [`Summer ${next}`] : []),
  ];
  if (missing.length === 0) return null;
  return (
    <View style={{ flexDirection: "row", gap: spacing.lg, marginTop: spacing.sm }}>
      {missing.map((name) => (
        <Pressable key={name} accessibilityRole="button" onPress={() => dispatchPlan({ type: "add-term", name })} style={{ paddingVertical: spacing.sm }}>
          <Text variant="sub" tone="accent">
            + {name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function Sheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const { c } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} onPress={onClose} accessibilityLabel="Close" />
      <View style={{ backgroundColor: c.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, maxHeight: "70%", paddingBottom: spacing.xl }}>
        <Text variant="headline" accessibilityRole="header" style={{ padding: spacing.lg }}>
          {title}
        </Text>
        <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
          <Button variant="secondary" label="Cancel" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

function SheetRow({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ paddingHorizontal: spacing.lg, paddingVertical: spacing.md, minHeight: 48, justifyContent: "center", backgroundColor: pressed ? c.surfacePressed : "transparent" })}
    >
      <Text variant="body" style={{ color: danger ? c.danger : c.text }}>
        {label}
      </Text>
    </Pressable>
  );
}

function AddCourseSheet({ termName, data, onClose }: { termName: string; data: CatalogData; onClose: () => void }) {
  const plan = useAdvisorPlan()!;
  const { c } = useTheme();
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchCourses(data.list, query, 8), [data, query]);
  const inTerm = new Set(plan.terms.find((t) => t.name === termName)?.courses.map((x) => x.id));
  const typedId = query.replace(/\s+/g, "").toUpperCase();
  const looksLikeId = /^[A-Z]{4}\d{3}[A-Z]?$/.test(typedId) && !results.some((r) => r.id === typedId);
  const add = (id: string) => {
    dispatchPlan({ type: "add-course", term: termName, id });
    onClose();
  };
  return (
    <Sheet visible title={`Add a course to ${termName}`} onClose={onClose}>
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
        <TextInput
          autoFocus
          autoCapitalize="characters"
          autoCorrect={false}
          value={query}
          onChangeText={setQuery}
          placeholder="Course or title, e.g. CMSC351"
          placeholderTextColor={c.text3}
          accessibilityLabel={`Add a course to ${termName}`}
          returnKeyType="done"
          onSubmitEditing={() => (results[0] ? add(results[0].id) : looksLikeId ? add(typedId) : undefined)}
          style={{ backgroundColor: c.surface2, color: c.text, borderRadius: radius.md, padding: spacing.md, fontSize: 17 }}
        />
      </View>
      {query.trim()
        ? results.map((r) => (
            <SheetRow key={r.id} label={`${r.id}  ${r.title}  ·  ${inTerm.has(r.id) ? "Added" : `${r.credits} cr`}`} onPress={() => (inTerm.has(r.id) ? undefined : add(r.id))} />
          ))
        : null}
      {looksLikeId ? <SheetRow label={`${typedId}: add anyway (not in this term's Schedule of Classes)`} onPress={() => add(typedId)} /> : null}
      {query.trim() && results.length === 0 && !looksLikeId ? (
        <Text variant="sub" tone="text3" style={{ padding: spacing.lg }}>
          No matching courses
        </Text>
      ) : null}
    </Sheet>
  );
}
