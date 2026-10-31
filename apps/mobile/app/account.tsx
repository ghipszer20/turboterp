import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack } from "expo-router";
import { codeProblem, emailProblem, normalizeCode } from "@turboterp/app-core/auth/email";
import { apiHeaders, apiUrl } from "../src/config";
import { getAppSync } from "../src/auth/app-sync";
import { authConfigured, getAuthClient } from "../src/auth/client";
import {
  DELETE_DETAIL,
  DELETE_QUESTION,
  deleteAccount,
  sendEmailCode,
  signInWithApple,
  signInWithGoogle,
  verifyEmailCode,
  type AuthApi,
  type FlowResult,
} from "../src/auth/flows";
import { appleAvailable, appleButtonModule, openAuthSession, reauthApple, requestApple } from "../src/auth/native";
import { useSession } from "../src/auth/session";

type Step = "choose" | "code";

function SignIn() {
  const [step, setStep] = useState<Step>("choose");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [apple, setApple] = useState(false);

  useEffect(() => {
    void appleAvailable().then(setApple);
  }, []);

  const run = async (fn: (c: AuthApi) => Promise<FlowResult>): Promise<boolean> => {
    setBusy(true);
    setError(null);
    try {
      const r = await fn((await getAuthClient()) as unknown as AuthApi);
      if (!r.ok) setError(r.message);
      return r.ok;
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    const problem = emailProblem(email);
    if (problem) return setError(problem);
    if (await run((c) => sendEmailCode(c, email))) setStep("code");
  };
  const verify = async () => {
    const problem = codeProblem(code);
    if (problem) return setError(problem);
    await run((c) => verifyEmailCode(c, email, normalizeCode(code)));
  };

  const Apple = apple ? appleButtonModule() : null;

  return (
    <View style={styles.block}>
      <Text style={styles.heading}>Sign in to sync</Text>
      <Text style={styles.note}>Optional. Sign in to keep your plan and schedules on all your devices.</Text>
      {Apple ? (
        <Apple.AppleAuthenticationButton
          buttonType={Apple.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={Apple.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={12}
          style={styles.appleButton}
          onPress={() => void run((c) => signInWithApple(c, requestApple))}
        />
      ) : null}
      <Pressable accessibilityRole="button" disabled={busy} style={styles.googleButton} onPress={() => void run((c) => signInWithGoogle(c, openAuthSession))}>
        <Text style={styles.googleText}>Continue with Google</Text>
      </Pressable>
      <Text style={styles.or}>or use an email code</Text>
      {step === "choose" ? (
        <>
          <TextInput style={styles.input} value={email} onChangeText={(v) => (setEmail(v), setError(null))} placeholder="you@example.com" autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" />
          <Pressable accessibilityRole="button" disabled={busy} style={styles.secondary} onPress={() => void send()}>
            <Text style={styles.secondaryText}>Email me a code</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.note}>We sent a code to {email.trim()}.</Text>
          <TextInput style={styles.input} value={code} onChangeText={(v) => (setCode(v), setError(null))} placeholder="Digits from the email" keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="one-time-code" />
          <Pressable accessibilityRole="button" disabled={busy} style={styles.secondary} onPress={() => void verify()}>
            <Text style={styles.secondaryText}>Sign in</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => (setStep("choose"), setCode(""), setError(null))}>
            <Text style={styles.link}>Use a different email</Text>
          </Pressable>
        </>
      )}
      {busy ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
    </View>
  );
}

function Account({ email, isApple }: { email: string | null; isApple: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signOut = async () => {
    getAppSync().stopAndClear(); // the synced copies leave this phone, then the session ends
    await (await getAuthClient()).auth.signOut();
  };
  const remove = async () => {
    setBusy(true);
    setError(null);
    const client = (await getAuthClient()) as unknown as AuthApi;
    const r = await deleteAccount({
      client,
      isAppleAccount: isApple,
      reauthApple,
      fetchFn: fetch,
      deleteUrl: apiUrl("/api/account/delete"),
      headers: apiHeaders(),
    });
    setBusy(false);
    if (r.ok) getAppSync().stopAndClear();
    else setError(r.message);
  };

  return (
    <View style={styles.block}>
      <Text style={styles.heading}>Signed in</Text>
      <Text style={styles.note}>{email ?? "Your account"}</Text>
      <Pressable accessibilityRole="button" style={styles.secondary} onPress={() => void signOut()}>
        <Text style={styles.secondaryText}>Sign out</Text>
      </Pressable>
      {confirming ? (
        <View style={styles.danger}>
          <Text style={styles.heading}>{DELETE_QUESTION}</Text>
          <Text style={styles.note}>{DELETE_DETAIL}</Text>
          <Pressable accessibilityRole="button" disabled={busy} style={styles.deleteButton} onPress={() => void remove()}>
            <Text style={styles.deleteText}>Yes, delete my account</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={busy} onPress={() => setConfirming(false)}>
            <Text style={styles.link}>Keep my account</Text>
          </Pressable>
          {busy ? <ActivityIndicator /> : null}
        </View>
      ) : (
        <Pressable accessibilityRole="button" onPress={() => setConfirming(true)}>
          <Text style={styles.deleteLink}>Delete account</Text>
        </Pressable>
      )}
      {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
    </View>
  );
}

export default function AccountScreen() {
  const session = useSession();
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Stack.Screen options={{ headerShown: true, title: "Account" }} />
      {!authConfigured() ? (
        <Text style={styles.note}>Accounts aren't set up in this build. Everything else works without one.</Text>
      ) : session.status === "loading" ? (
        <ActivityIndicator />
      ) : session.status === "signed-in" ? (
        <Account email={session.email} isApple={session.provider === "apple"} />
      ) : (
        <SignIn />
      )}
    </ScrollView>
  );
}

// Minimal local styling; B1's design system will replace it.
const styles = StyleSheet.create({
  page: { padding: 20 },
  block: { gap: 12 },
  heading: { fontSize: 20, fontWeight: "700", color: "#111" },
  note: { fontSize: 15, color: "#444" },
  or: { textAlign: "center", color: "#666" },
  input: { borderWidth: 1, borderColor: "#bbb", borderRadius: 12, padding: 14, fontSize: 16 },
  appleButton: { height: 52, width: "100%" },
  googleButton: { height: 52, borderRadius: 12, borderWidth: 1, borderColor: "#bbb", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  googleText: { fontSize: 17, fontWeight: "600", color: "#111" },
  secondary: { height: 48, borderRadius: 12, backgroundColor: "#E21833", alignItems: "center", justifyContent: "center" },
  secondaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  link: { textAlign: "center", color: "#E21833", fontSize: 15 },
  error: { color: "#B00020", fontSize: 15 },
  danger: { gap: 12, borderWidth: 1, borderColor: "#B00020", borderRadius: 12, padding: 14 },
  deleteButton: { height: 48, borderRadius: 12, backgroundColor: "#B00020", alignItems: "center", justifyContent: "center" },
  deleteText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  deleteLink: { textAlign: "center", color: "#B00020", fontSize: 15 },
});
