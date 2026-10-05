import { ACCESS_COOKIE, accessToken } from "@/lib/access";

// POST /api/access { code } → sets the access cookie when the code matches SITE_ACCESS_CODE.
export async function POST(request: Request) {
  const expected = process.env.SITE_ACCESS_CODE;
  const body = (await request.json().catch(() => null)) as { code?: unknown } | null;
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!expected || code.length === 0 || code.length > 200) return Response.json({ ok: false }, { status: 401 });
  // Compare hashes, so the check takes the same time whatever was typed.
  const [given, wanted] = await Promise.all([accessToken(code), accessToken(expected)]);
  if (given !== wanted) return Response.json({ ok: false }, { status: 401 });
  const halfYear = 60 * 60 * 24 * 180;
  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": `${ACCESS_COOKIE}=${wanted}; Path=/; Max-Age=${halfYear}; HttpOnly; Secure; SameSite=Lax` } },
  );
}
