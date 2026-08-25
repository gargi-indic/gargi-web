import { NextRequest } from "next/server";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase";
import { readSessionId, requestContext } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  "page_view", "cta_click", "chat_opened", "message_sent", "checkpoint_switched",
  "feedback_given", "response_copied", "regenerated", "waitlist_signup",
]);

export async function POST(req: NextRequest) {
  if (!supabaseConfigured()) return new Response(null, { status: 204 });

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name : null;
  // Allowlisted names only -- this endpoint is unauthenticated by necessity,
  // so it must not become a free-text write primitive.
  if (!name || !ALLOWED.has(name)) return new Response(null, { status: 204 });

  try {
    const sessionId = await readSessionId();
    const ctx = await requestContext();
    await supabaseAdmin().from("events").insert({
      session_id: sessionId,
      name,
      path: typeof body.path === "string" ? body.path.slice(0, 200) : null,
      props: typeof body.props === "object" && body.props ? body.props : {},
      referrer: ctx.referrer,
      country: ctx.country,
      device: ctx.device,
    });
  } catch {
    /* analytics failures are silent by design */
  }
  return new Response(null, { status: 204 });
}
