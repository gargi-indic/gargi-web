import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase";
import { readSessionId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One conversation's transcript, so a click in the sidebar reopens the thread.
 *
 * Scoped to the caller's own session cookie: the id is a uuid, but guessing is
 * not the bar -- a shared link should not hand over someone else's chat.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!supabaseConfigured()) return Response.json({ error: "Not found." }, { status: 404 });

  const sessionId = await readSessionId();
  if (!sessionId) return Response.json({ error: "Not found." }, { status: 404 });

  const { id } = await params;
  const db = supabaseAdmin();

  const { data: conversation } = await db
    .from("conversations")
    .select("id, title, checkpoint, script_pref")
    .eq("id", id)
    .eq("session_id", sessionId)
    .maybeSingle();

  if (!conversation) return Response.json({ error: "Not found." }, { status: 404 });

  const { data: messages, error } = await db
    .from("messages")
    .select("role, content, seq")
    .eq("conversation_id", id)
    .order("seq", { ascending: true });

  if (error) return Response.json({ error: "Could not load that chat." }, { status: 500 });

  return Response.json({ conversation, messages: messages ?? [] });
}
