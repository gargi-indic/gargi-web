import { cookies, headers } from "next/headers";
import { randomUUID } from "crypto";

export const SESSION_COOKIE = "gargi_sid";

/**
 * An anonymous, cookie-scoped identity. No login, no email, no fingerprinting
 * -- just enough to group one person's conversations and let them see their own
 * history. Reset the cookie and you are a new visitor.
 */
export async function getOrCreateSessionId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(SESSION_COOKIE)?.value;
  if (existing) return existing;

  const sid = randomUUID();
  jar.set(SESSION_COOKIE, sid, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return sid;
}

export async function readSessionId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

/** Coarse request metadata for analytics. Never stores a raw IP. */
export async function requestContext() {
  const h = await headers();
  const ua = h.get("user-agent") ?? "";
  return {
    user_agent: ua.slice(0, 400),
    referrer: h.get("referer")?.slice(0, 400) ?? null,
    country: h.get("x-vercel-ip-country") ?? null,
    device: /mobile|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop",
  };
}

/**
 * A stable, non-reversible key for per-IP rate limiting. Hashed with a salt so
 * the table never holds an address that could identify anyone.
 */
export async function ipHash(): Promise<string> {
  const h = await headers();
  const raw =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const { createHash } = await import("crypto");
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 16) ?? "gargi";
  return createHash("sha256").update(`${salt}:${raw}`).digest("hex").slice(0, 32);
}
