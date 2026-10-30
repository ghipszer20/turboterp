// HTTP security headers for every response, set in next.config.ts. HSTS comes from Vercel already.
// No nonces: a nonce makes every page dynamic, which would undo Cache Components and CDN caching,
// so scripts use 'unsafe-inline' (Next's inline RSC payload and the theme script need it).

export type CspSettings = { supabaseUrl?: string; sentryDsn?: string; dev: boolean };

const origin = (url: string | undefined): string | null => {
  try {
    return url ? new URL(url).origin : null;
  } catch {
    return null;
  }
};

export function contentSecurityPolicy({ supabaseUrl, sentryDsn, dev }: CspSettings): string {
  const supabase = origin(supabaseUrl);
  const connect = ["'self'", ...(supabase ? [supabase, supabase.replace(/^https:/, "wss:")] : []), ...[origin(sentryDsn)].filter((o) => o !== null)];
  const directives = [
    "default-src 'self'",
    // 'wasm-unsafe-eval': the audit's highs solver and transcript OCR compile WebAssembly.
    // Dev only: React's dev build needs eval, and Vercel Analytics loads its debug script from its CDN.
    `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${dev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src ${connect.join(" ")}`,
    // Tesseract starts its OCR worker from a blob: URL; pdf.js and the Seat Alerts worker are same-origin.
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ];
  return directives.join("; ");
}

export function securityHeaders(settings: CspSettings): { key: string; value: string }[] {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(settings) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    // Older browsers that ignore frame-ancestors.
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
    // Sign-in uses full-page redirects, never popups, so the page can sit in its own browsing context group.
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ];
}
