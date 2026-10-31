// Hidden WebView that hosts the engine bridge page. Mount <EngineHost /> once, near the root, but
// it only creates the WebView after the first screen has rendered and settled (never during
// launch: iOS kills apps that hang at startup, and the 10 MB page is slow to parse). Everything
// loads from the bundled asset: the page may not fetch from the network.
import { Asset } from "expo-asset";
import { useEffect, useRef, useState } from "react";
import { InteractionManager, StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { createEngineClient, type EngineClient } from "./client";

// Built by `npm run build:bridge` (scripts/build-bridge.mjs); Metro serves .html as an asset.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ENGINE_PAGE: number = require("../../assets/engine/engine.html");

let webView: WebView | null = null;

/** The one engine for the app. `engine.run(job)` works before the host mounts: jobs wait in the queue. */
export const engine: EngineClient = createEngineClient({
  send: (text) => webView?.postMessage(text),
  reload: () => webView?.reload(),
});

const dirOf = (uri: string) => uri.slice(0, uri.lastIndexOf("/") + 1);

export function EngineHost() {
  const [mounted, setMounted] = useState(false);
  const [uri, setUri] = useState<string | null>(null);
  const ref = useRef<WebView | null>(null);

  // Warm start: wait for the first screen's interactions and animations to finish.
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => setMounted(true));
    return () => task.cancel();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    void Asset.fromModule(ENGINE_PAGE)
      .downloadAsync()
      .then((a) => {
        if (!cancelled) setUri(a.localUri ?? a.uri);
      })
      .catch(() => {
        // Left unmounted: queued jobs fail with "unavailable" after the ready timeout.
      });
    return () => {
      cancelled = true;
    };
  }, [mounted]);

  useEffect(() => () => void (webView = null), []);

  if (!uri) return null;
  return (
    <View pointerEvents="none" style={styles.hidden}>
      <WebView
        ref={(w) => {
          ref.current = w;
          webView = w;
        }}
        source={{ uri }}
        originWhitelist={["file://*"]}
        allowFileAccess
        allowingReadAccessToURL={dirOf(uri)}
        javaScriptEnabled
        cacheEnabled={false}
        onMessage={(e: WebViewMessageEvent) => engine.handleMessage(e.nativeEvent.data)}
        onContentProcessDidTerminate={() => engine.handleTerminated()}
        onRenderProcessGone={() => engine.handleTerminated()}
        onError={() => engine.handleTerminated()}
        // Nothing the page does may navigate to the network.
        onShouldStartLoadWithRequest={(req) => req.url.startsWith("file://") || req.url.startsWith("about:") || req.url.startsWith("blob:")}
      />
    </View>
  );
}

const styles = StyleSheet.create({ hidden: { position: "absolute", width: 1, height: 1, opacity: 0, left: -10, top: -10 } });
