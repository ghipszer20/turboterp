// The device id and secret ("<id>.<secret>") in the iOS keychain through expo-secure-store.
import * as SecureStore from "expo-secure-store";
import type { TokenStore } from "@turboterp/app-core/seat-alerts/device";

const KEY = "turboterp.seatAlerts.device";
let memory: string | null = null; // used where SecureStore is missing (web)

export const tokenStore: TokenStore = {
  async get() {
    try {
      return (await SecureStore.getItemAsync(KEY)) ?? memory;
    } catch {
      return memory;
    }
  },
  async set(token) {
    memory = token;
    try {
      await SecureStore.setItemAsync(KEY, token);
    } catch {
      // Keychain unavailable: the device registers again next launch.
    }
  },
};
