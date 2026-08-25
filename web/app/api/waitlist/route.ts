import { NextRequest } from "next/server";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase";
import { readSessionId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const source = typeof body?.source === "string" ? body.source.slice(0, 40) : "unknown";

  if (!EMAIL.test(email) || email.length > 320) {
    return Response.json({ error: "That does not look like an email address." }, { status: 400 });
  }
  if (!supabaseConfigured()) {
    return Response.json({ ok: true, message: "Saved locally — the database is not configured yet." });
  }

  try {
    const sessionId = await readSessionId();
    const { error } = await supabaseAdmin()
      .from("waitlist")
      .upsert({ email, source, session_id: sessionId }, { onConflict: "email" });
    if (error) throw error;
  } catch (err) {
    console.error("[gargi] waitlist failed:", err);
    return Response.json({ error: "Could not save that. Try again." }, { status: 500 });
  }
  return Response.json({ ok: true, message: "You're on the list." });
}
