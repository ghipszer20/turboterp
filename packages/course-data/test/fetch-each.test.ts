import { describe, expect, it } from "vitest";
import { fetchEach } from "../src/fetch-each.ts";

const noPause = async () => {};

describe("fetchEach", () => {
  it("collects every key's items in key order", async () => {
    const result = await fetchEach(["CMSC", "MATH"], async (dept) => [`${dept}131`, `${dept}140`], { attempts: 3, pause: noPause });
    expect(result.items).toEqual(["CMSC131", "CMSC140", "MATH131", "MATH140"]);
    expect(result.failed).toEqual([]);
  });

  it("retries a key that fails, and keeps its items once it succeeds", async () => {
    const calls: string[] = [];
    const result = await fetchEach(
      ["CMSC", "MATH"],
      async (dept) => {
        calls.push(dept);
        if (dept === "CMSC" && calls.filter((c) => c === "CMSC").length < 3) throw new Error("fetch failed");
        return [`${dept}131`];
      },
      { attempts: 3, pause: noPause },
    );
    expect(result.items).toEqual(["CMSC131", "MATH131"]);
    expect(result.failed).toEqual([]);
    expect(calls).toEqual(["CMSC", "CMSC", "CMSC", "MATH"]);
  });

  it("reports a key that fails every attempt, and still fetches the rest", async () => {
    let cmscCalls = 0;
    const result = await fetchEach(
      ["CMSC", "MATH"],
      async (dept) => {
        if (dept === "CMSC") {
          cmscCalls++;
          throw new Error("HTTP 503");
        }
        return [`${dept}140`];
      },
      { attempts: 3, pause: noPause },
    );
    expect(result.items).toEqual(["MATH140"]);
    expect(result.failed).toEqual([{ key: "CMSC", message: "HTTP 503" }]);
    expect(cmscCalls).toBe(3);
  });

  it("pauses after every request", async () => {
    let pauses = 0;
    await fetchEach(["CMSC", "MATH"], async (dept) => (dept === "CMSC" && pauses === 0 ? Promise.reject(new Error("x")) : []), {
      attempts: 2,
      pause: async () => {
        pauses++;
      },
    });
    expect(pauses).toBe(3);
  });
});
