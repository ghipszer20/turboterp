import Storage from "expo-sqlite/kv-store";
import { createKeyValueStore } from "./kv-store";

/** The app's persistent key-value store (the Advisor's state, preferences). */
export const kvStore = createKeyValueStore(Storage);
