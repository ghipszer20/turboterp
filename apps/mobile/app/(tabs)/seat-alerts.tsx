import { Pressable, View } from "react-native";
import { endedNote, watchRowView, type WatchRow } from "@turboterp/app-core/seat-alerts/view";
import { Button, Card, Screen, Skeleton, Text, spacing, tap, useTheme } from "../../src/ui";
import { AddClass } from "../../src/alerts/AddClass";
import { UNAVAILABLE_TEXT } from "../../src/alerts/decisions";
import { openSettings } from "../../src/alerts/push";
import { useAlerts } from "../../src/alerts/store";

const FOOTER = "Alerts are best-effort and can be a minute or two late. TurboTerp checks Testudo; it never registers you or uses your UMD login.";

function Action({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={8} onPress={() => (tap(), onPress())} style={{ minHeight: 44, justifyContent: "center" }}>
      <Text variant="sub" tone="accent">
        {label}
      </Text>
    </Pressable>
  );
}

function WatchItem({ w, now, onDone, onRemove }: { w: WatchRow; now: Date; onDone: () => void; onRemove: () => void }) {
  const { c } = useTheme();
  const v = watchRowView(w, now);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: spacing.sm, gap: spacing.sm, borderBottomWidth: 0.5, borderBottomColor: c.separator }}>
      <View style={{ flex: 1 }}>
        <Text variant="headline">{v.title}</Text>
        <Text variant="foot" tone={v.isOpen ? "accent" : "text2"}>{v.status}</Text>
        {v.checked ? <Text variant="foot" tone="text3">{v.checked}</Text> : null}
        {v.lastAlert ? <Text variant="foot" tone="text3">{v.lastAlert}</Text> : null}
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Action label="I got it" onPress={onDone} />
        <Action label="Remove" onPress={onRemove} />
      </View>
    </View>
  );
}

export default function SeatAlerts() {
  const a = useAlerts();
  const now = new Date();
  const { watches, done, ended } = a.data;
  const note = endedNote(ended);
  const unavailable = a.availability !== "ready";

  return (
    <Screen title="Seat Alerts">
      <Card style={{ padding: spacing.lg, marginBottom: spacing.md, gap: spacing.xs }}>
        <Text variant="headline">Get a notification when a seat opens</Text>
      </Card>

      {a.phase === "loading" ? <Skeleton rows={3} /> : null}
      {a.phase === "unavailable" ? (
        <Card style={{ padding: spacing.lg }}>
          <Text variant="headline">Seat Alerts aren't available right now</Text>
          <Text variant="sub" tone="text2">Try again in a little while.</Text>
          <Action label="Try again" onPress={() => void a.refresh()} />
        </Card>
      ) : null}

      {a.phase === "needs-setup" ? (
        <Card style={{ padding: spacing.lg, gap: spacing.sm }}>
          {unavailable ? (
            <Text variant="sub" tone="text2">{UNAVAILABLE_TEXT}.</Text>
          ) : (
            <>
              <Text variant="sub" tone="text2">Alerts are off for this phone.</Text>
              <Button label="Turn on alerts" onPress={() => void a.enable()} />
              {a.permission !== "ok" ? (
                <>
                  <Text variant="foot" tone="danger">
                    {a.permission === "settings" ? "Notifications are blocked for TurboTerp." : "Notifications weren't allowed."}
                  </Text>
                  {a.permission === "settings" ? <Action label="Open Settings" onPress={openSettings} /> : null}
                </>
              ) : null}
              {a.notice ? <Text variant="foot" tone="danger">{a.notice}</Text> : null}
            </>
          )}
        </Card>
      ) : null}

      {a.phase === "ready" ? (
        <>
          <Text variant="foot" tone="text2" style={{ marginBottom: spacing.sm }}>Alerts are on</Text>
          <AddClass />
          <Text variant="headline" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>Watching</Text>
          <Card style={{ paddingHorizontal: spacing.md }}>
            {watches.length ? (
              watches.map((w) => <WatchItem key={w.id} w={w} now={now} onDone={() => void a.done(w.id)} onRemove={() => void a.remove(w.id)} />)
            ) : (
              <Text variant="sub" tone="text2" style={{ paddingVertical: spacing.md }}>
                Nothing yet. Add a full class above.
              </Text>
            )}
          </Card>
          {note ? <Text variant="foot" tone="text3" style={{ marginTop: spacing.sm }}>{note}</Text> : null}
          {done.length ? (
            <>
              <Text variant="headline" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>{`Done (${done.length})`}</Text>
              <Card style={{ paddingHorizontal: spacing.md }}>
                {done.map((w) => (
                  <View key={w.id} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text variant="sub">{watchRowView(w, now).title}</Text>
                    <Action label="Remove" onPress={() => void a.remove(w.id)} />
                  </View>
                ))}
              </Card>
            </>
          ) : null}
        </>
      ) : null}
      <Text variant="foot" tone="text3" style={{ marginTop: spacing.lg }}>{FOOTER}</Text>
    </Screen>
  );
}
