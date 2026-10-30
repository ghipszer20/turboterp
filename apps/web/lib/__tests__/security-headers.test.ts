import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, securityHeaders } from "../security-headers";

const directive = (csp: string, name: string) => csp.split("; ").find((d) => d.startsWith(`${name} `)) ?? "";

describe("contentSecurityPolicy", () => {
  it("allows the Supabase project and the Sentry ingest host, and nothing else off-site", () => {
    const csp = contentSecurityPolicy({
      supabaseUrl: "https://abc.supabase.co",
      sentryDsn: "https://key@o123.ingest.us.sentry.io/456",
      dev: false,
    });
    expect(directive(csp, "connect-src")).toBe("connect-src 'self' https://abc.supabase.co wss://abc.supabase.co https://o123.ingest.us.sentry.io");
    expect(directive(csp, "default-src")).toBe("default-src 'self'");
  });

  it("leaves unset or malformed services out", () => {
    const csp = contentSecurityPolicy({ supabaseUrl: "", sentryDsn: "not a url", dev: false });
    expect(directive(csp, "connect-src")).toBe("connect-src 'self'");
  });

  it("lets the audit solver and OCR compile WebAssembly, but never allows eval in production", () => {
    const csp = contentSecurityPolicy({ dev: false });
    expect(directive(csp, "script-src")).toContain("'wasm-unsafe-eval'");
    expect(directive(csp, "script-src")).not.toContain("'unsafe-eval'");
    expect(directive(contentSecurityPolicy({ dev: true }), "script-src")).toContain("'unsafe-eval'");
  });

  it("blocks framing, plugins, base-tag hijacks and off-site form posts", () => {
    const csp = contentSecurityPolicy({ dev: false });
    for (const d of ["frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'"]) expect(csp).toContain(d);
    expect(directive(csp, "worker-src")).toBe("worker-src 'self' blob:");
  });
});

describe("securityHeaders", () => {
  it("sends the standard hardening headers on every response", () => {
    const names = securityHeaders({ dev: false }).map((h) => h.key);
    expect(names).toEqual(
      expect.arrayContaining(["Content-Security-Policy", "X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy", "Cross-Origin-Opener-Policy"]),
    );
  });

  it("turns off device features the site never uses", () => {
    const pp = securityHeaders({ dev: false }).find((h) => h.key === "Permissions-Policy")!.value;
    for (const f of ["camera=()", "microphone=()", "geolocation=()", "payment=()"]) expect(pp).toContain(f);
  });
});
