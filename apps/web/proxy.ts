import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE, COMING_SOON_PATH, accessToken, gateDecision } from "@/lib/access";

// Pre-launch gate: see lib/access.ts. Does nothing unless SITE_ACCESS_CODE is set.
export async function proxy(request: NextRequest) {
  const code = process.env.SITE_ACCESS_CODE;
  if (!code) return NextResponse.next();
  const decision = gateDecision({
    pathname: request.nextUrl.pathname,
    cookie: request.cookies.get(ACCESS_COOKIE)?.value,
    token: await accessToken(code),
  });
  if (decision === "allow") return NextResponse.next();
  if (decision === "deny") return NextResponse.json({ error: "TurboTerp is not open yet." }, { status: 401 });
  return NextResponse.redirect(new URL(COMING_SOON_PATH, request.url));
}
