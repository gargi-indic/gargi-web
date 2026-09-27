import { cookies } from "next/headers";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase";
import { AdminLogin } from "./AdminLogin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false, follow: false } };

/**
 * Read-only dashboard over the SQL views. Gated by a single shared password in
 * ADMIN_PASSWORD -- enough to keep the numbers off the open web, and not
 * pretending to be an auth system.
 */
export default async function Admin() {
  const expected = process.env.ADMIN_PASSWORD;
  const supplied = (await cookies()).get("gargi_admin")?.value;

  if (!expected) {
    return <Shell><p>Set <code>ADMIN_PASSWORD</code> to enable this dashboard.</p></Shell>;
  }
  if (supplied !== expected) return <AdminLogin />;
  if (!supabaseConfigured()) {
    return <Shell><p>Supabase is not configured.</p></Shell>;
  }

  const db = supabaseAdmin();
  const [usage, latency, quality, feedback, recent] = await Promise.all([
    db.from("v_daily_usage").select("*").limit(14),
    db.from("v_model_latency").select("*"),
    db.from("v_quality_trend").select("*").limit(14),
    db.from("v_feedback_rate").select("*"),
    db.from("generations")
      .select("created_at, checkpoint, prompt_text, response_text, total_ms, tokens_per_sec, stop_reason")
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  return (
    <Shell>
      <Table title="Latency by checkpoint" rows={latency.data} />
      <Table title="Feedback" rows={feedback.data} />
      <Table title="Daily usage" rows={usage.data} />
      <Table
        title="Generation quality — low script ratio or low distinct-3gram means the model is failing"
        rows={quality.data}
      />
      <Table title="Recent generations" rows={recent.data} truncate />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <div className="prose" style={{ maxWidth: "none" }}>
        <h1>Gargi Labs admin</h1>
        {children}
      </div>
    </div>
  );
}

function Table({
  title,
  rows,
  truncate = false,
}: {
  title: string;
  rows: Record<string, unknown>[] | null;
  truncate?: boolean;
}) {
  if (!rows?.length) {
    return (
      <>
        <h2>{title}</h2>
        <p className="text-muted">No data yet.</p>
      </>
    );
  }
  const cols = Object.keys(rows[0]);
  return (
    <>
      <h2>{title}</h2>
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>{cols.map((c) => <th key={c}>{c.replace(/_/g, " ")}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {cols.map((c) => {
                  const v = r[c];
                  const s = v == null ? "—" : String(v);
                  return (
                    <td key={c} style={{ maxWidth: truncate ? 280 : undefined }}>
                      {truncate && s.length > 90 ? `${s.slice(0, 90)}…` : s}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
