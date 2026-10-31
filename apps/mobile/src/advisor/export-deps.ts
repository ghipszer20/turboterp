// Real dependencies for the plan exports: cache folder, share sheet, session token, API post.
import { apiHeaders, apiUrl, authConfigured } from "../config";
import type { EmailDeps, FileDeps } from "./export-files";

export const fileDeps: FileDeps = {
  async writeBase64(fileName, base64) {
    const { File, Paths } = await import("expo-file-system");
    const file = new File(Paths.cache, fileName);
    if (file.exists) file.delete();
    file.create();
    file.write(base64, { encoding: "base64" });
    return file.uri;
  },
  async share(uri, mime, fileName) {
    const Sharing = await import("expo-sharing");
    if (!(await Sharing.isAvailableAsync())) throw new Error("sharing unavailable");
    await Sharing.shareAsync(uri, { mimeType: mime, dialogTitle: fileName, UTI: mime === "application/pdf" ? "com.adobe.pdf" : undefined });
  },
};

export const emailDeps: EmailDeps = {
  async getToken() {
    if (!authConfigured()) return null;
    const { getAuthClient } = await import("../auth/client");
    const client = await getAuthClient();
    const { data } = await client.auth.getSession();
    return data.session?.access_token ?? null;
  },
  async post(body, token) {
    const res = await fetch(apiUrl("/api/email/plan"), {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}`, ...apiHeaders() },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as { email?: string; error?: string };
    return { status: res.status, body: json };
  },
};
