import * as WebBrowser from "expo-web-browser";

/** Opens a UMD page in the in-app browser. We only link out; nothing is fetched or submitted for the student. */
export function openLink(url: string): void {
  void WebBrowser.openBrowserAsync(url).catch(() => undefined);
}
