import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return Response.json({ error: "not configured" }, { status: 503 });

  const { password } = await req.json().catch(() => ({ password: "" }));
  const a = Buffer.from(String(password ?? ""));
  const b = Buffer.from(expected);
  const ok = a.length === b.length && timingSafeEqual(a, b);
  if (!ok) return Response.json({ error: "nope" }, { status: 401 });

  (await cookies()).set("gargi_admin", expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return Response.json({ ok: true });
}
