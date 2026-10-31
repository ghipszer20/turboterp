// Plans A/B/C: switch between them, save the week shown, delete the last saved plan (two taps).
import { useState } from "react";
import { Pressable, View } from "react-native";
import type { PlanId } from "@turboterp/app-core/schedule/saved";
import { Button, Text, radius, spacing, useTheme } from "../../ui";
import { removeQuestion, type PlanChip } from "../builder-model";

export type PlanBarProps = {
  plan: PlanId;
  chips: PlanChip[];
  onPlan: (p: PlanId) => void;
  canSave: boolean;
  /** Why saving is blocked (overlap), shown under the bar. */
  blockedNote: string | null;
  /** "Saved as Plan A" for a moment after saving, else null. */
  note: string | null;
  onSave: () => void;
  onRemove: (p: PlanId) => void;
};

export function PlanBar({ plan, chips, onPlan, canSave, blockedNote, note, onSave, onRemove }: PlanBarProps) {
  const { c } = useTheme();
  const [asking, setAsking] = useState<PlanId | null>(null);
  return (
    <View style={{ gap: spacing.sm }}>
      <View accessibilityRole="radiogroup" style={{ flexDirection: "row", gap: spacing.sm, alignItems: "center", flexWrap: "wrap" }}>
        {chips.map((chip) => {
          const on = chip.id === plan;
          return (
            <View key={chip.id} style={{ flexDirection: "row", alignItems: "center" }}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={`Plan ${chip.id}${chip.saved ? ", saved" : ""}`}
                onPress={() => {
                  setAsking(null);
                  onPlan(chip.id);
                }}
                style={{
                  minHeight: 40,
                  paddingHorizontal: spacing.md,
                  justifyContent: "center",
                  borderRadius: radius.pill,
                  backgroundColor: on ? c.accent : c.accentTint,
                }}
              >
                <Text variant="sub" style={{ color: on ? c.onAccent : c.accent, fontWeight: "600" }}>
                  {`Plan ${chip.id}${chip.saved ? " ✓" : ""}`}
                </Text>
              </Pressable>
              {chip.removable ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Delete Plan ${chip.id}`}
                  onPress={() => setAsking(chip.id)}
                  hitSlop={6}
                  style={{ minWidth: 40, minHeight: 40, alignItems: "center", justifyContent: "center" }}
                >
                  <Text variant="headline" tone="text2">
                    ×
                  </Text>
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </View>
      {asking ? (
        <View accessibilityRole="alert" style={{ gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: c.surface2 }}>
          <Text variant="sub">{removeQuestion(asking)}</Text>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Button
                label={`Delete Plan ${asking}`}
                onPress={() => {
                  const p = asking;
                  setAsking(null);
                  onRemove(p);
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Keep it" variant="secondary" onPress={() => setAsking(null)} />
            </View>
          </View>
        </View>
      ) : null}
      <Button label={note ?? `Save as Plan ${plan}`} onPress={onSave} disabled={!canSave} />
      {blockedNote ? (
        <Text variant="foot" tone="danger" accessibilityRole="alert">
          Overlap: {blockedNote} Fix it to save this plan.
        </Text>
      ) : null}
    </View>
  );
}
