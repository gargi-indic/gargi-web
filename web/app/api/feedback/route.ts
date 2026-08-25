import { NextRequest } from "next/server";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase";
import { readSessionId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Thumbs up/down on a response. The quality label the training data needs. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const generationId = body?.generationId;
  const rating = body?.rating;

  if (!generationId || (rating !== "up" && rating !== "down")) {
    return Response.json({ error: "generationId and rating are required." }, { status: 400 });
  }
  if (!supabaseConfigured()) return Response.json({ ok: true });

  try {
    const sessionId = await readSessionId();
    await supabaseAdmin().from("feedback").upsert(
      {
        generation_id: generationId,
        session_id: sessionId,
        rating,
        comment: typeof body.comment === "string" ? body.comment.slice(0, 1000) : null,
      },
      { onConflict: "generation_id,session_id" }
    );
  } catch (err) {
    console.error("[gargi] feedback failed:", err);
    return Response.json({ error: "Could not record that." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
