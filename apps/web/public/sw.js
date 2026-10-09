// Seat Alerts service worker (docs/project/seat-alerts.md). Push and notification clicks only:
// no fetch handler and no caching, so it can never serve stale pages or data.
self.addEventListener("push", (event) => {
  let p = {};
  try {
    p = event.data ? event.data.json() : {};
  } catch {
    p = {};
  }
  const options = {
    body: p.body || "",
    tag: p.watchId || "seat-alert",
    renotify: true,
    data: { url: p.url || "/schedule/alerts", watchId: p.watchId, token: p.token },
    icon: "/apple-icon",
  };
  if (p.watchId && p.token) options.actions = [{ action: "done", title: "I got it" }];
  event.waitUntil(self.registration.showNotification(p.title || "Seat Alerts", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const d = event.notification.data || {};
  if (event.action === "done" && d.watchId && d.token) {
    event.waitUntil(
      fetch(`/api/seat-alerts/watches/${encodeURIComponent(d.watchId)}/done?token=${encodeURIComponent(d.token)}`, { method: "POST" }).catch(() => undefined),
    );
    return;
  }
  const target = new URL(d.url || "/schedule/alerts", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) if (c.url === target && "focus" in c) return c.focus();
      return self.clients.openWindow(target);
    }),
  );
});
