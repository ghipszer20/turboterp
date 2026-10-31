// "Share" on the plan screen: plan PDF or Excel through the iOS share sheet, or "Email my plan".
import { useState } from "react";
import { Switch, View } from "react-native";
import { buildPlanExport } from "@turboterp/app-core/export/plan-export";
import { earnedCredits, planSummaryLines } from "@turboterp/app-core/export/plan-summary";
import type { Analysis } from "@turboterp/app-core/analysis";
import type { AdvisorPlan } from "@turboterp/app-core/plan-state";
import { PROGRAM_OPTIONS, programsLabel } from "@turboterp/app-core/programs";
import { Button, Card, Text } from "../ui";
import { spacing } from "../ui/theme";
import { engine } from "../engine/EngineHost";
import type { CatalogData } from "./data-core";
import { emailDeps, fileDeps } from "./export-deps";
import { emailPlan, exportPlanFile, type ExportKind } from "./export-files";

export function ShareMenu({ plan, analysis, data, priorCredits }: { plan: AdvisorPlan; analysis: Analysis | null; data: CatalogData; priorCredits: number }) {
  const [open, setOpen] = useState(false);
  const [hideGrades, setHideGrades] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const ready = analysis !== null;

  const build = () =>
    buildPlanExport({
      plan,
      analysis: analysis!,
      catalog: data.catalog,
      programKinds: Object.fromEntries(PROGRAM_OPTIONS.map((p) => [p.id, p.kind])),
      today: new Date(),
      hideGrades,
      programsLabel: programsLabel(plan.programs),
      catalogYear: plan.catalogYear,
      priorCreditCredits: priorCredits,
    });

  const share = async (kind: ExportKind) => {
    setBusy(kind);
    setNote(null);
    const r = await exportPlanFile(kind, build(), engine, fileDeps).catch(() => ({ ok: false as const, message: "Couldn't make that file. Try again." }));
    setBusy(null);
    if (!r.ok) setNote(r.message);
  };

  const email = async () => {
    setBusy("email");
    setNote(null);
    const planExport = build();
    const earned = earnedCredits(plan.terms, (c) => c.credits ?? data.catalog.get(c.id)?.credits.min ?? 0);
    const summary = planSummaryLines({
      creditsEarned: earned + priorCredits,
      creditsPlanned: planExport.creditsPlanned,
      programs: analysis!.audits.map((a) => ({ name: a.program.name, satisfied: a.satisfied, total: a.total, inProgress: a.inProgress })),
    });
    const r = await emailPlan(planExport, summary, engine, emailDeps);
    setBusy(null);
    setNote(r.ok ? `Sent to ${r.email ?? "your email"}.` : r.message);
  };

  return (
    <View style={{ marginTop: spacing.sm }}>
      <Button variant="secondary" label={open ? "Hide share options" : "Share"} onPress={() => setOpen((o) => !o)} />
      {open ? (
        <Card style={{ padding: spacing.lg, marginTop: spacing.sm, gap: spacing.sm }}>
          {!ready ? <Text variant="sub" tone="text2">Available once the audit finishes.</Text> : null}
          <Button variant="secondary" label={busy === "pdf" ? "Preparing..." : "4-year plan (PDF)"} disabled={!ready || busy !== null} onPress={() => void share("pdf")} />
          <Button variant="secondary" label={busy === "xlsx" ? "Preparing..." : "4-year plan (Excel)"} disabled={!ready || busy !== null} onPress={() => void share("xlsx")} />
          <Button variant="secondary" label={busy === "email" ? "Sending..." : "Email my plan"} disabled={!ready || busy !== null} onPress={() => void email()} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text variant="body">Hide grades</Text>
            <Switch value={hideGrades} onValueChange={setHideGrades} accessibilityLabel="Hide grades" />
          </View>
          {note ? (
            <Text variant="sub" tone="text2" accessibilityLiveRegion="polite">
              {note}
            </Text>
          ) : null}
        </Card>
      ) : null}
    </View>
  );
}
