import { supabaseAdmin, supabaseConfigured } from "./supabase";

/**
 * Postgres-backed rate limiting.
 *
 * This is not abuse theatre. The inference Space is a single free CPU box that
 * serves one generation at a time; without a limit, one person holding down
 * enter denies the model to everyone else on the site.
 */
export type RateLimitResult = { ok: true } | { ok: false; retryAfter: number; reason: string };

const WINDOW_SECONDS = 60;
const MAX_PER_SESSION = 8;
const MAX_PER_IP = 20;

export async function checkRateLimit(
  sessionId: string,
  ipKey: string
): Promise<RateLimitResult> {
  if (!supabaseConfigured()) return { ok: true };

  const since = new Date(Date.now() - WINDOW_SECONDS * 1000).toISOString();
  const db = supabaseAdmin();

  const [bySession, byIp] = await Promise.all([
    db.from("generations").select("id", { count: "exact", head: true })
      .eq("session_id", sessionId).gte("created_at", since),
    db.from("generations").select("id", { count: "exact", head: true })
      .eq("ip_hash", ipKey).gte("created_at", since),
  ]);

  // A failing rate-limit query must not take the chat down with it. Fail open:
  // the single-flight lock on the Space is the real backstop.
  if (bySession.error || byIp.error) return { ok: true };

  if ((bySession.count ?? 0) >= MAX_PER_SESSION) {
    return { ok: false, retryAfter: WINDOW_SECONDS, reason: "Too many messages. Give it a minute." };
  }
  if ((byIp.count ?? 0) >= MAX_PER_IP) {
    return { ok: false, retryAfter: WINDOW_SECONDS, reason: "Too many requests from this network." };
  }
  return { ok: true };
}
