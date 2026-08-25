import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase";
import { readSessionId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** This visitor's own conversation list, keyed by their session cookie. */
export async function GET() {
  if (!supabaseConfigured()) return Response.json({ conversations: [] });

  const sessionId = await readSessionId();
  if (!sessionId) return Response.json({ conversations: [] });

  const { data, error } = await supabaseAdmin()
    .from("conversations")
    .select("id, title, checkpoint, created_at, updated_at")
    .eq("session_id", sessionId)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(30);

  if (error) return Response.json({ conversations: [] });
  return Response.json({ conversations: data ?? [] });
}
