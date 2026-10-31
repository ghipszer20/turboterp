import { assertEquals } from "jsr:@std/assert@1";
import { sendExpoBatch } from "../../../apps/web/lib/seat-alerts/expo.ts";

// The Expo endpoint is mocked through the fetch argument; nothing leaves the machine.
Deno.test("sendExpoBatch posts 100 per request to the Expo push API and maps tickets", async () => {
  const sizes: number[] = [];
  let url = "";
  const mock = ((u: string, init: RequestInit) => {
    url = u;
    const body = JSON.parse(String(init.body)) as { to: string; data: { url: string } }[];
    sizes.push(body.length);
    return Promise.resolve(new Response(JSON.stringify({ data: body.map((m) => (m.to.endsWith("[gone0000]") ? { status: "error", details: { error: "DeviceNotRegistered" } } : { status: "ok" })) })));
  }) as unknown as typeof fetch;
  const payload = { title: "t", body: "b", url: "https://app.testudo.umd.edu/#/main/dropAdd?termId=202701" };
  const msgs = Array.from({ length: 101 }, (_, i) => ({ token: i === 100 ? "ExponentPushToken[gone0000]" : `ExponentPushToken[tok${i}xxxxx]`, payload }));
  const res = await sendExpoBatch(msgs, mock);
  assertEquals(sizes, [100, 1]);
  assertEquals(url, "https://exp.host/--/api/v2/push/send");
  assertEquals(res[0], "ok");
  assertEquals(res[100], "gone");
});
