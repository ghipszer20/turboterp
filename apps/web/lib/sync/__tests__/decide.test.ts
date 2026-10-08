import { describe, expect, it } from "vitest";
import { decideOnFocus, decideOnSignIn } from "../decide";

describe("decideOnSignIn", () => {
  it("does nothing when both are empty", () => expect(decideOnSignIn(null, null)).toBe("nothing"));
  it("uploads when only local", () => expect(decideOnSignIn('{"a":1}', null)).toBe("upload"));
  it("downloads when only remote", () => expect(decideOnSignIn(null, '{"a":1}')).toBe("download"));
  it("does nothing when equal JSON, whatever the formatting", () =>
    expect(decideOnSignIn('{"a": 1,"b":2}', '{"a":1,"b":2}')).toBe("nothing"));
  it("asks when they differ", () => expect(decideOnSignIn('{"a":1}', '{"a":2}')).toBe("ask"));
  it("does nothing when only key order differs (Postgres jsonb reorders keys)", () =>
    expect(decideOnSignIn('{"v":1,"terms":[{"name":"F","courses":[]}]}', '{"terms":[{"courses":[],"name":"F"}],"v":1}')).toBe("nothing"));
  it("still asks when array order differs", () => expect(decideOnSignIn('{"a":[1,2]}', '{"a":[2,1]}')).toBe("ask"));
});

describe("decideOnFocus", () => {
  it("nothing without a remote copy", () => expect(decideOnFocus(2, undefined, true)).toBe("nothing"));
  it("nothing when revs are equal", () => expect(decideOnFocus(3, 3, true)).toBe("nothing"));
  it("nothing when local is ahead", () => expect(decideOnFocus(4, 3, false)).toBe("nothing"));
  it("downloads when remote newer and local unchanged", () => expect(decideOnFocus(2, 3, false)).toBe("download"));
  it("asks when remote newer and local changed", () => expect(decideOnFocus(2, 3, true)).toBe("ask"));
  it("never synced and remote exists: download if clean, ask if dirty", () => {
    expect(decideOnFocus(undefined, 1, false)).toBe("download");
    expect(decideOnFocus(undefined, 1, true)).toBe("ask");
  });
});
