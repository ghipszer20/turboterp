import { describe, expect, it } from "vitest";
import { clearDeviceToken, DEVICE_KEY, loadDeviceToken, saveDeviceToken } from "../seat-alerts/device";

function memory(): Storage {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  } as Storage;
}
const throwing = (): Storage => {
  const boom = () => {
    throw new Error("blocked");
  };
  return { getItem: boom, setItem: boom, removeItem: boom } as unknown as Storage;
};

describe("device token storage", () => {
  it("round-trips a token", () => {
    const s = memory();
    expect(loadDeviceToken(s)).toBeNull();
    saveDeviceToken("id.secret", s);
    expect(s.getItem(DEVICE_KEY)).toBe("id.secret");
    expect(loadDeviceToken(s)).toBe("id.secret");
    clearDeviceToken(s);
    expect(loadDeviceToken(s)).toBeNull();
  });
  it("load returns null and save/clear don't throw when storage throws", () => {
    const s = throwing();
    expect(loadDeviceToken(s)).toBeNull();
    expect(() => saveDeviceToken("x.y", s)).not.toThrow();
    expect(() => clearDeviceToken(s)).not.toThrow();
  });
});
