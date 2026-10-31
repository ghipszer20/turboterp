import webpush from "npm:web-push@3.6.7";
import { assert, assertEquals } from "jsr:@std/assert@1";

Deno.test("web-push encrypts and sends to a mock endpoint under Deno", async () => {
  const vapid = webpush.generateVAPIDKeys();
  const ua = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const rawPub = new Uint8Array(await crypto.subtle.exportKey("raw", ua.publicKey));
  const b64 = (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const auth = crypto.getRandomValues(new Uint8Array(16));
  let got: { headers: Headers; len: number } | null = null;
  const server = Deno.serve({ port: 0, onListen() {}, cert: Deno.readTextFileSync(new URL("./testdata/localhost.crt", import.meta.url)), key: Deno.readTextFileSync(new URL("./testdata/localhost.key", import.meta.url)) }, async (req) => {
    got = { headers: req.headers, len: (await req.arrayBuffer()).byteLength };
    return new Response(null, { status: 201 });
  });
  try {
    Deno.env.set("NODE_TLS_REJECT_UNAUTHORIZED", "0"); // the mock endpoint uses a self-signed cert
    webpush.setVapidDetails("mailto:test@example.com", vapid.publicKey, vapid.privateKey);
    const res = await webpush.sendNotification(
      { endpoint: `https://localhost:${server.addr.port}/push`, keys: { p256dh: b64(rawPub), auth: b64(auth) } },
      JSON.stringify({ title: "hi" }),
      { TTL: 900 },
    );
    assertEquals(res.statusCode, 201);
    assert(got);
    const g = got as { headers: Headers; len: number };
    assertEquals(g.headers.get("content-encoding"), "aes128gcm");
    assert(g.headers.get("authorization")?.startsWith("vapid t="));
    assert(g.len > 100);
  } finally {
    await server.shutdown();
  }
});
