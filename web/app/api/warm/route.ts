export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Health proxy for the inference host. The Oracle VM does not sleep, so this is
 * a liveness check rather than a keep-warm: it surfaces the model server's
 * status without exposing its bearer token. See .github/workflows/health.yml.
 */
export async function GET() {
  const url = process.env.GARGI_INFERENCE_URL;
  if (!url) return Response.json({ ok: false, error: "GARGI_INFERENCE_URL not set" }, { status: 503 });

  const started = Date.now();
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/health`, {
      headers: process.env.GARGI_API_TOKEN
        ? { Authorization: `Bearer ${process.env.GARGI_API_TOKEN}` }
        : {},
      cache: "no-store",
    });
    const health = await res.json().catch(() => ({}));
    return Response.json({ ok: res.ok, latency_ms: Date.now() - started, health });
  } catch (err) {
    return Response.json(
      { ok: false, latency_ms: Date.now() - started, error: String(err) },
      { status: 502 }
    );
  }
}
