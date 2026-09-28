import { NextRequest } from "next/server";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase";
import { getOrCreateSessionId, ipHash } from "@/lib/session";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const VALID_INTENTS = new Set(["contribute", "support", "question", "updates"]);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  // Honeypot check: company field (hidden in UI)
  const company = typeof body?.company === "string" ? body.company.trim() : "";
  if (company.length > 0) {
    // Silently accept and drop honeypot submissions
    return Response.json({ ok: true, message: "Thank you for reaching out." });
  }

  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const intent = typeof body?.intent === "string" ? body.intent.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 4000) : "";
  const source = typeof body?.source === "string" ? body.source.trim().slice(0, 40) : "unknown";

  if (!email || !EMAIL_REGEX.test(email) || email.length > 320) {
    return Response.json({ error: "That does not look like a valid email address." }, { status: 400 });
  }

  if (!intent || !VALID_INTENTS.has(intent)) {
    return Response.json({ error: "Please select what you want to do." }, { status: 400 });
  }

  const sessionId = await getOrCreateSessionId();
  const ipKey = await ipHash();

  const limit = await checkRateLimit(sessionId, ipKey);
  if (!limit.ok) {
    return Response.json(
      { error: limit.reason },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  if (!supabaseConfigured()) {
    return Response.json({
      ok: true,
      message: "Saved locally — the database is not configured yet.",
    });
  }

  try {
    const { error } = await supabaseAdmin().from("contact_messages").insert({
      name: name || null,
      email,
      intent,
      message: message || null,
      source,
      session_id: sessionId,
      handled: false,
    });

    if (error) throw error;
  } catch (err) {
    console.error("[gargi] contact submission failed:", err);
    return Response.json({ error: "Could not save that. Try again." }, { status: 500 });
  }

  return Response.json({ ok: true, message: "Thank you for reaching out." });
}
