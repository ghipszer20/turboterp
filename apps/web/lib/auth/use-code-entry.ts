"use client";

import { useState } from "react";
import { getAuthClient } from "./client";
import { codeProblem, normalizeCode, verifyProblem } from "./email";

/** Typing the emailed code: used where the link can't open (a Home Screen app). The session listener picks up the sign-in. */
export function useCodeEntry(email: string, setError: (message: string | null) => void) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const change = (value: string) => (setCode(value), setError(null));

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = codeProblem(code);
    if (problem) return setError(problem);
    setBusy(true);
    try {
      const client = await getAuthClient();
      const { error: failed } = await client.auth.verifyOtp({ email, token: normalizeCode(code), type: "email" });
      if (failed) setError(verifyProblem(failed));
    } catch (thrown) {
      setError(verifyProblem(thrown));
    } finally {
      setBusy(false);
    }
  };

  return { code, change, verify, busy };
}
