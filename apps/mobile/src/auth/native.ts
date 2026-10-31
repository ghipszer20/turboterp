// Native pieces behind feature checks, so Expo Go and the web export don't crash where a module is missing.
import { Platform } from "react-native";
import type { AppleCredential, BrowserResult } from "./flows";

type AppleModule = typeof import("expo-apple-authentication");

function appleModule(): AppleModule | null {
  if (Platform.OS !== "ios") return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-apple-authentication") as AppleModule;
  } catch {
    return null;
  }
}

export async function appleAvailable(): Promise<boolean> {
  try {
    return (await appleModule()?.isAvailableAsync()) ?? false;
  } catch {
    return false;
  }
}

/** The native Apple button component, or null when unavailable. */
export function appleButtonModule(): AppleModule | null {
  return appleModule();
}

function randomNonce(): string {
  const bytes = new Uint8Array(16);
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getRandomValues } = require("expo-crypto") as { getRandomValues: (a: Uint8Array) => Uint8Array };
  getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Shows the Apple sheet. Apple gets the SHA-256 of the nonce; Supabase gets the raw value. */
export async function requestApple(): Promise<{ credential: AppleCredential; nonce: string }> {
  const Apple = appleModule();
  if (!Apple) throw Object.assign(new Error("apple unavailable"), { code: "ERR_UNAVAILABLE" });
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Crypto = require("expo-crypto") as typeof import("expo-crypto");
  const nonce = randomNonce();
  const hashed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
  const credential = await Apple.signInAsync({
    requestedScopes: [Apple.AppleAuthenticationScope.EMAIL],
    nonce: hashed,
  });
  return { credential: { identityToken: credential.identityToken, authorizationCode: credential.authorizationCode }, nonce };
}

/** For delete account: Sign in with Apple again and return the fresh authorization code (null if cancelled). */
export async function reauthApple(): Promise<string | null> {
  try {
    const { credential } = await requestApple();
    return credential.authorizationCode;
  } catch {
    return null;
  }
}

export async function openAuthSession(url: string, redirect: string): Promise<BrowserResult> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const WebBrowser = require("expo-web-browser") as typeof import("expo-web-browser");
  const result = await WebBrowser.openAuthSessionAsync(url, redirect);
  return result.type === "success" ? { type: "success", url: result.url } : { type: "cancel" };
}
