import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { AppState, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { chooserCopy, copyLine } from "@turboterp/app-core/sync/chooser";
import { getAppSync } from "./app-sync";
import { authConfigured } from "./client";
import { useSession } from "./session";
import type { Ask } from "./sync";

const NO_ASKS: readonly Ask[] = [];

function useAsks(): readonly Ask[] {
  return useSyncExternalStore(
    (fn) => getAppSync().subscribeAsks(fn),
    () => getAppSync().getAsks(),
    () => NO_ASKS,
  );
}

/** The one question sync asks: this phone's copy and the account's copy have never met and differ. */
function KeepWhichCopy() {
  const first = useAsks()[0];
  if (!first) return null;
  const copy = chooserCopy(first.kind);
  const answer = (keep: "local" | "remote") => () => void getAppSync().resolve(first.kind, keep);
  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.backdrop}>
        <View style={styles.sheet} accessibilityViewIsModal>
          <Text style={styles.title} accessibilityRole="header">{copy.title}</Text>
          <Text style={styles.body}>{copyLine(first.kind, first.local, first.remote)}</Text>
          <Pressable accessibilityRole="button" style={styles.primary} onPress={answer("local")}>
            <Text style={styles.primaryText}>{copy.replace}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.ghost} onPress={answer("remote")}>
            <Text style={styles.ghostText}>{copy.keep}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/** Mounted once in the root layout: starts sync while signed in. Never blocks anything. */
export function SyncProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const configured = authConfigured();

  useEffect(() => {
    if (!configured || session.status !== "signed-in" || !session.userId) return;
    const { engine } = getAppSync();
    void engine.start(session.userId);
    const sub = AppState.addEventListener("change", (s) => void (s === "active" ? engine.checkRemote() : engine.flush()));
    return () => {
      sub.remove();
      engine.stop(false);
    };
  }, [configured, session.status, session.userId]);

  return (
    <>
      {children}
      {configured ? <KeepWhichCopy /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 24 },
  sheet: { backgroundColor: "#fff", borderRadius: 16, padding: 20, gap: 12 },
  title: { fontSize: 18, fontWeight: "700", color: "#111" },
  body: { fontSize: 15, color: "#333" },
  primary: { backgroundColor: "#E21833", borderRadius: 12, padding: 14, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  ghost: { borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#bbb" },
  ghostText: { color: "#111", fontWeight: "600", fontSize: 16 },
});
