// The typed-name agreement (ported from apps/web/app/advisor/DisclaimerGate.tsx). There is no way
// past it without signing; a wording change (CONSENT_VERSION) asks again.
import { useState, type ReactNode } from "react";
import { Pressable, TextInput, View } from "react-native";
import { acceptConsent, CONSENT_CHECKBOX, CONSENT_POINTS, CONSENT_TITLE } from "@turboterp/app-core/consent";
import { Button, Card, Screen, Text, useTheme } from "../ui";
import { radius, spacing } from "../ui/theme";
import { consentStore, useHasConsent } from "./consent";

export function ConsentGate({ children }: { children: ReactNode }) {
  const ok = useHasConsent();
  return ok ? <>{children}</> : <Agreement />;
}

function Agreement() {
  const { c } = useTheme();
  const [name, setName] = useState("");
  const [ticked, setTicked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const submit = () => {
    const result = acceptConsent(name, ticked, new Date());
    if (result.ok) consentStore.save(result.record);
    else setError(result.error);
  };

  return (
    <Screen title={CONSENT_TITLE} subtitle="Advisor">
      <Text tone="text2" style={{ marginBottom: spacing.md }}>
        TurboTerp can check a four-year plan against your requirements. Please read this and sign before you start.
      </Text>
      <Card style={{ padding: spacing.lg, gap: spacing.md }}>
        {CONSENT_POINTS.map((p) => (
          <Text key={p.title}>
            <Text style={{ fontWeight: "700" }}>{p.title}. </Text>
            {p.body}
          </Text>
        ))}
      </Card>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: ticked }}
        onPress={() => (setTicked(!ticked), setError(null))}
        style={{ flexDirection: "row", gap: spacing.md, alignItems: "center", marginTop: spacing.lg }}
      >
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            borderWidth: 2,
            borderColor: c.accent,
            backgroundColor: ticked ? c.accent : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {ticked ? <Text style={{ color: c.onAccent, fontWeight: "700" }}>✓</Text> : null}
        </View>
        <Text style={{ flex: 1 }}>{CONSENT_CHECKBOX}</Text>
      </Pressable>
      <Text variant="sub" tone="text2" style={{ marginTop: spacing.lg, marginBottom: spacing.xs }}>
        Type your full name to sign
      </Text>
      <TextInput
        value={name}
        onChangeText={(t) => (setName(t), setError(null))}
        placeholder="Full name"
        placeholderTextColor={c.text3}
        autoComplete="name"
        textContentType="name"
        accessibilityLabel="Full name"
        style={{ backgroundColor: c.surface, color: c.text, borderRadius: radius.md, padding: spacing.md, fontSize: 17 }}
      />
      <Text variant="sub" tone="text2" style={{ marginTop: spacing.sm }}>
        Date: {today}
      </Text>
      {error ? (
        <Text tone="danger" accessibilityRole="alert" style={{ marginTop: spacing.sm }}>
          {error}
        </Text>
      ) : null}
      <View style={{ marginTop: spacing.lg }}>
        <Button label="I agree" onPress={submit} />
      </View>
      <Text variant="sub" tone="text3" style={{ marginTop: spacing.md }}>
        Saved on this device only. If the wording changes, you&apos;ll be asked to sign again.
      </Text>
    </Screen>
  );
}
