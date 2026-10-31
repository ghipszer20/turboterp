// Import a Testudo unofficial transcript (ported from apps/web/app/advisor/ImportTranscriptView.tsx).
// Three ways in: a PDF, pasted text, or photos. Everything is read on this phone; nothing is
// applied to the plan until the student reviews the rows and confirms.
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Switch, TextInput, View } from "react-native";
import type { ParsedCourse } from "@turboterp/app-core/transcript-parse";
import { Button, Card, EmptyState, Screen, Text, useTheme } from "../ui";
import { spacing } from "../ui/theme";
import { engine } from "../engine/EngineHost";
import { readTranscript, type CancelToken, type TranscriptSource } from "./transcript-flow";
import { pickPdf, pickPhotos, takePhoto, type Picked } from "./transcript-sources";
import { allChecked, anyChecked, applyReview, buildReview, isEmptyReview, type Checks, type Review } from "./transcript-review";
import { savePlan, useAdvisorPlan } from "./store";

type Stage =
  | { kind: "input"; error?: string }
  | { kind: "reading"; detail: string }
  | { kind: "review"; review: Review; checks: Checks };

export function TranscriptScreen() {
  const router = useRouter();
  const plan = useAdvisorPlan();
  const [stage, setStage] = useState<Stage>({ kind: "input" });
  const [pasted, setPasted] = useState("");
  const token = useRef<CancelToken>({ cancelled: false });

  const run = async (source: TranscriptSource) => {
    const t: CancelToken = { cancelled: false };
    token.current = t;
    setStage({ kind: "reading", detail: "Getting started..." });
    const r = await readTranscript(source, engine, (detail) => !t.cancelled && setStage({ kind: "reading", detail }), t);
    if (t.cancelled) return;
    if (!r.ok) return setStage({ kind: "input", error: r.message });
    const review = buildReview(r.parsed);
    setStage({ kind: "review", review, checks: allChecked(review) });
  };

  const fromPicker = async (pick: () => Promise<Picked>, make: (b: string[]) => TranscriptSource) => {
    const p = await pick();
    if (p.ok === "cancelled") return;
    if (!p.ok) return setStage({ kind: "input", error: p.message });
    void run(make(p.base64s));
  };

  const cancel = () => {
    token.current.cancelled = true;
    setStage({ kind: "input" });
  };

  if (!plan) {
    return (
      <Screen title="Import transcript">
        <EmptyState title="Set up your plan first" body="Importing a transcript fills in your plan, so it needs one to start from." />
        <View style={{ marginTop: spacing.lg }}>
          <Button label="Set up my plan" onPress={() => router.push("/advisor/setup")} />
        </View>
      </Screen>
    );
  }

  if (stage.kind === "reading") {
    return (
      <Screen title="Import transcript">
        <Card style={{ padding: spacing.lg, gap: spacing.md, alignItems: "center" }}>
          <ActivityIndicator />
          <Text variant="body" accessibilityLiveRegion="polite">
            {stage.detail}
          </Text>
          <Text variant="sub" tone="text2">
            Reading happens on this phone. A scanned PDF or photo can take a minute or two.
          </Text>
        </Card>
        <View style={{ marginTop: spacing.md }}>
          <Button variant="secondary" label="Cancel" onPress={cancel} />
        </View>
      </Screen>
    );
  }

  if (stage.kind === "review") {
    const { review, checks } = stage;
    return (
      <Review_
        review={review}
        checks={checks}
        setChecks={(c) => setStage({ kind: "review", review, checks: c })}
        onConfirm={() => {
          savePlan(applyReview(plan, review, checks));
          router.replace("/advisor/plan");
        }}
        onStartOver={() => setStage({ kind: "input" })}
        onCancel={() => router.back()}
      />
    );
  }

  return (
    <Screen title="Import transcript">
      <Card style={{ padding: spacing.lg, gap: spacing.sm }}>
        <Text variant="headline">Why import?</Text>
        <Text variant="sub" tone="text2">
          Optional. Your past courses and grades let TurboTerp personalize its feedback on your plan, such as how hard each semester is likely to feel for you, and fill in what you have already taken so your audit starts out accurate.
        </Text>
        <Text variant="sub" tone="text2">
          Your transcript never leaves this phone unless you export it yourself. It is read on the device and is not uploaded anywhere.
        </Text>
      </Card>

      {stage.error ? (
        <Text variant="sub" tone="danger" style={{ marginTop: spacing.md }} accessibilityRole="alert">
          {stage.error}
        </Text>
      ) : null}

      <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
        <Button label="Choose the transcript PDF" onPress={() => void fromPicker(pickPdf, (b) => ({ kind: "pdf", base64: b[0]! }))} />
        <Button variant="secondary" label="Choose photos of it" onPress={() => void fromPicker(pickPhotos, (b) => ({ kind: "images", base64s: b }))} />
        <Button variant="secondary" label="Take a photo" onPress={() => void fromPicker(takePhoto, (b) => ({ kind: "images", base64s: b }))} />
      </View>

      <Card style={{ padding: spacing.lg, marginTop: spacing.md, gap: spacing.sm }}>
        <Text variant="headline">Or paste from Testudo</Text>
        <Text variant="sub" tone="text2">
          On Testudo's unofficial transcript page, select all, copy, and paste it here.
        </Text>
        <PasteBox value={pasted} onChange={setPasted} />
        <Button label="Read pasted text" disabled={!pasted.trim()} onPress={() => void run({ kind: "paste", text: pasted })} />
      </Card>
      <View style={{ marginTop: spacing.md }}>
        <Button variant="secondary" label="Cancel" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

function PasteBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { c } = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      multiline
      accessibilityLabel="Pasted transcript text"
      placeholder="Paste the transcript text here"
      placeholderTextColor={c.text3}
      style={{ minHeight: 120, maxHeight: 240, borderWidth: 1, borderColor: c.separator, borderRadius: 8, padding: spacing.md, color: c.text, textAlignVertical: "top" }}
    />
  );
}

function Row({ label, note, flagged, value, onToggle }: { label: string; note?: string; flagged?: boolean; value: boolean; onToggle: () => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.xs }}>
      <View style={{ flex: 1 }}>
        <Text variant="body">{label}</Text>
        {note ? (
          <Text variant="sub" tone="text2">
            {note}
          </Text>
        ) : null}
        {flagged ? (
          <Text variant="caption" tone="danger">
            Check this
          </Text>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onToggle} accessibilityLabel={label} />
    </View>
  );
}

const flip = (a: boolean[], i: number) => a.map((v, j) => (i === j ? !v : v));

function Review_({
  review,
  checks,
  setChecks,
  onConfirm,
  onStartOver,
  onCancel,
}: {
  review: Review;
  checks: Checks;
  setChecks: (c: Checks) => void;
  onConfirm: () => void;
  onStartOver: () => void;
  onCancel: () => void;
}) {
  const { parsed, ap, ib, dual, notRecognized } = review;
  const terms: string[] = [];
  const byTerm = new Map<string, { course: ParsedCourse; index: number }[]>();
  parsed.courses.forEach((course, index) => {
    if (!byTerm.has(course.term)) {
      byTerm.set(course.term, []);
      terms.push(course.term);
    }
    byTerm.get(course.term)!.push({ course, index });
  });
  return (
    <Screen title="Review import">
      <Text variant="sub" tone="text2">
        Check what looks right. Anything marked "Check this" was read from noisy text and repaired automatically, so it is worth a second look. Nothing is added to your plan until you confirm below.
      </Text>
      {isEmptyReview(review) ? (
        <Text variant="body" style={{ marginTop: spacing.md }}>
          Nothing recognizable was found in that text.
        </Text>
      ) : null}

      {terms.map((term) => (
        <Card key={term} style={{ padding: spacing.lg, marginTop: spacing.md }}>
          <Text variant="headline">{term}</Text>
          {byTerm.get(term)!.map(({ course, index }) => (
            <Row
              key={index}
              label={`${course.code}${course.title ? ` - ${course.title}` : ""}`}
              note={`${course.status === "in-progress" ? "In progress" : (course.grade ?? "No grade read")}${course.attemptedCredits !== null ? ` · ${course.attemptedCredits} cr` : ""}${course.genEd.length ? ` · ${course.genEd.join(", ")}` : ""}`}
              flagged={course.flagged}
              value={checks.courses[index]!}
              onToggle={() => setChecks({ ...checks, courses: flip(checks.courses, index) })}
            />
          ))}
        </Card>
      ))}

      {parsed.cumulativeGpa ? (
        <Card style={{ padding: spacing.lg, marginTop: spacing.md }}>
          <Text variant="headline">Cumulative GPA</Text>
          <Row label={`${parsed.cumulativeGpa.value.toFixed(2)} (from your transcript)`} flagged={parsed.cumulativeGpa.flagged} value={checks.gpa} onToggle={() => setChecks({ ...checks, gpa: !checks.gpa })} />
        </Card>
      ) : null}

      {ap.matched.length > 0 ? (
        <Card style={{ padding: spacing.lg, marginTop: spacing.md }}>
          <Text variant="headline">AP exams</Text>
          {ap.matched.map((a, i) => (
            <Row key={i} label={`AP ${a.exam} (${a.score})`} flagged={a.flagged} value={checks.ap[i]!} onToggle={() => setChecks({ ...checks, ap: flip(checks.ap, i) })} />
          ))}
        </Card>
      ) : null}

      {ib.matched.length > 0 ? (
        <Card style={{ padding: spacing.lg, marginTop: spacing.md }}>
          <Text variant="headline">IB exams</Text>
          {ib.matched.map((b, i) => (
            <Row key={i} label={`IB ${b.exam} ${b.level ?? ""} (${b.score})`} flagged={b.flagged} value={checks.ib[i]!} onToggle={() => setChecks({ ...checks, ib: flip(checks.ib, i) })} />
          ))}
        </Card>
      ) : null}

      {dual.matched.length > 0 ? (
        <Card style={{ padding: spacing.lg, marginTop: spacing.md }}>
          <Text variant="headline">College credit</Text>
          {dual.matched.map((d, i) => (
            <Row
              key={i}
              label={`${d.institution}: ${d.course} ${d.title}`}
              note={`${d.credits} credits, ${d.elective ? "elective" : d.umd}`}
              flagged={d.flagged}
              value={checks.dual[i]!}
              onToggle={() => setChecks({ ...checks, dual: flip(checks.dual, i) })}
            />
          ))}
        </Card>
      ) : null}

      {ap.info.length > 0 ? (
        <Card style={{ padding: spacing.lg, marginTop: spacing.md, gap: spacing.xs }}>
          <Text variant="headline">Also on the transcript</Text>
          {ap.info.map((a, i) => (
            <Text key={i} variant="sub" tone="text2">{`AP ${a.exam} (${a.score}): ${a.note}`}</Text>
          ))}
        </Card>
      ) : null}

      {notRecognized.length > 0 ? (
        <Card style={{ padding: spacing.lg, marginTop: spacing.md, gap: spacing.xs }}>
          <Text variant="headline">Not recognized</Text>
          <Text variant="sub" tone="text2">
            Couldn't match these to UMD's AP or IB charts, or they carry no credit. Add them by hand in prior credit if they are real.
          </Text>
          {notRecognized.map((a, i) => (
            <Text key={i} variant="sub">
              {a.raw}
            </Text>
          ))}
        </Card>
      ) : null}

      {parsed.unparsed.length > 0 ? (
        <Card style={{ padding: spacing.lg, marginTop: spacing.md, gap: spacing.xs }}>
          <Text variant="headline">{`Couldn't read ${parsed.unparsed.length === 1 ? "this line" : "these lines"}`}</Text>
          {parsed.unparsed.map((u, i) => (
            <View key={i}>
              <Text variant="sub">{u.raw}</Text>
              <Text variant="caption" tone="text2">
                {u.reason}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}

      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        <Button label="Confirm import" disabled={!anyChecked(review, checks)} onPress={onConfirm} />
        <Button variant="secondary" label="Start over" onPress={onStartOver} />
        <Button variant="secondary" label="Cancel" onPress={onCancel} />
      </View>
    </Screen>
  );
}

