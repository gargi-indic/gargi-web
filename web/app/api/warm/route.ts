export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Liveness check and configuration diagnostic for the inference host.
 *
 * Reports enough to tell a misconfigured deployment from a broken model --
 * whether each variable is present, and whether the bearer token is actually
 * accepted -- without ever returning a secret. Token length and a short
 * fingerprint are enough to spot a truncated paste, a trailing newline, or a
 * value from the wrong environment; the value itself stays server-side.
 *
 * Used by .github/workflows/health.yml.
 */
export async function GET() {
  const url = process.env.GARGI_INFERENCE_URL;
  const token = process.env.GARGI_API_TOKEN;

  const config = {
    inference_url_set: Boolean(url),
    token_set: Boolean(token),
    token_length: token?.length ?? 0,
    // A token pasted with a trailing newline looks identical when printed and
    // fails every request. This is the cheapest way to see it.
    token_has_whitespace: token ? token !== token.trim() : false,
    token_fingerprint: token ? `${token.slice(0, 4)}…${token.slice(-4)}` : null,
    supabase_configured: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    region: process.env.VERCEL_REGION ?? null,
  };

  if (!url) {
    return Response.json({ ok: false, error: "GARGI_INFERENCE_URL not set", config }, { status: 503 });
  }

  const base = url.replace(/\/$/, "");
  const started = Date.now();

  try {
    const health = await fetch(`${base}/health`, { cache: "no-store" }).then((r) => r.json());

    // /health is unauthenticated, so a healthy model proves nothing about the
    // token. Probe /generate with one token to test auth specifically.
    const probe = await fetch(`${base}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token.trim()}` } : {}),
      },
      body: JSON.stringify({ prompt: "പരിശോധന", max_tokens: 1 }),
      cache: "no-store",
    });

    return Response.json({
      ok: health?.ready === true && probe.status !== 401,
      latency_ms: Date.now() - started,
      auth: probe.status === 401 ? "REJECTED — token mismatch" : "accepted",
      auth_status: probe.status,
      config,
      health,
    });
  } catch (err) {
    return Response.json(
      { ok: false, latency_ms: Date.now() - started, error: String(err), config },
      { status: 502 }
    );
  }
}
