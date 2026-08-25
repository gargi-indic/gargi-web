/**
 * Verifies the Supabase wiring end to end.
 *   node web/scripts/verify-supabase.mjs
 *
 * Checks, in order: the schema exists, the service-role key can write, and --
 * the one that actually matters -- that the publishable key can read none of it.
 *
 * Uses plain fetch against PostgREST rather than supabase-js, so it has no
 * dependencies and runs on any Node version.
 */
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const PUBLISHABLE = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!URL_ || !SERVICE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in web/.env.local");
  process.exit(1);
}

const rest = (key) => async (path, init = {}) => {
  const res = await fetch(`${URL_}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  let body = null;
  try { body = await res.json(); } catch { /* 204 has no body */ }
  return { status: res.status, ok: res.ok, body };
};

const admin = rest(SERVICE);
const anon = PUBLISHABLE ? rest(PUBLISHABLE) : null;

const TABLES = ["sessions", "conversations", "messages", "generations",
                "generation_quality", "feedback", "events", "waitlist"];
const VIEWS = ["v_daily_usage", "v_model_latency", "v_quality_trend",
               "v_feedback_rate", "v_top_prompts"];

let failed = 0;
const check = (cond, msg) => { console.log(`  ${cond ? "PASS" : "FAIL"}  ${msg}`); if (!cond) failed++; };

console.log("\n1. Schema");
for (const t of [...TABLES, ...VIEWS]) {
  const r = await admin(`${t}?select=*&limit=1`);
  check(r.ok, `${t}${r.ok ? "" : ` — ${r.body?.message ?? r.status}`}`);
}

console.log("\n2. Service-role can write");
const sid = crypto.randomUUID();
const w = await admin("sessions", {
  method: "POST",
  headers: { Prefer: "return=representation" },
  body: JSON.stringify({ id: sid, device: "verify-script" }),
});
check(w.ok, `insert into sessions${w.ok ? "" : ` — ${w.body?.message ?? w.status}`}`);

console.log("\n3. RLS blocks the publishable key");
if (!anon) {
  console.log("  SKIP  no publishable key set");
} else {
  for (const t of ["messages", "generations", "conversations", "waitlist"]) {
    const r = await anon(`${t}?select=*&limit=1`);
    // Correct outcomes: a permission error, or an empty array. Rows are a leak.
    const leaked = r.ok && Array.isArray(r.body) && r.body.length > 0;
    check(!leaked, `anon cannot read ${t}${leaked ? " — LEAK, rows returned" : ""}`);
  }
  const aw = await anon("events", { method: "POST", body: JSON.stringify({ name: "page_view" }) });
  check(!aw.ok, `anon cannot write events${aw.ok ? " — LEAK, insert succeeded" : ""}`);
}

await admin(`sessions?id=eq.${sid}`, { method: "DELETE" });
console.log(failed === 0 ? "\nAll checks passed.\n" : `\n${failed} check(s) failed.\n`);
process.exit(failed === 0 ? 0 : 1);
