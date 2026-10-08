import { describe, expect, it } from "vitest";
import { decryptName, encryptName } from "../name-crypto";

describe("encryptName / decryptName", () => {
  it("gives back exactly what was typed", () => {
    const typed = "  Ada   LOVELACE ";
    expect(decryptName(encryptName(typed, "k"), "k")).toBe(typed);
  });
  it("is versioned and never contains the name", () => {
    const blob = encryptName("Ada Lovelace", "k");
    expect(blob).toMatch(/^v1:[A-Za-z0-9+/]+=*$/);
    expect(blob).not.toContain("Lovelace");
  });
  it("encrypts the same name differently each time", () => {
    expect(encryptName("Ada Lovelace", "k")).not.toBe(encryptName("Ada Lovelace", "k"));
  });
  it("refuses the wrong secret", () => {
    expect(() => decryptName(encryptName("Ada Lovelace", "k"), "other")).toThrow();
  });
  it("refuses a tampered record", () => {
    const blob = encryptName("Ada Lovelace", "k");
    const bytes = Buffer.from(blob.slice(3), "base64");
    bytes[bytes.length - 1] ^= 1;
    expect(() => decryptName(`v1:${bytes.toString("base64")}`, "k")).toThrow();
    expect(() => decryptName("garbage", "k")).toThrow();
  });
});
