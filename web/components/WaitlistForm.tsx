"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

/**
 * The email capture that appears in the accent panel on home, models, about
 * and blog. Posts to /api/waitlist, which is the only thing that touches the
 * database -- the browser never holds a Supabase key.
 */
export function WaitlistForm({
  source,
  label = "Research access",
  cta = "Join waitlist",
}: {
  source: string;
  label?: string;
  cta?: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setState("done");
      setMessage(data.message || "You're on the list.");
      track("waitlist_signup", { source });
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="waitlist">
      <div className="waitlist-label">{label}</div>
      {state === "done" ? (
        <p className="waitlist-done" role="status">{message}</p>
      ) : (
        <form className="waitlist-row" onSubmit={submit}>
          <label className="sr-only" htmlFor={`waitlist-${source}`}>Email address</label>
          <input
            id={`waitlist-${source}`}
            className="input waitlist-input"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={state === "sending"}
          />
          <button className="btn waitlist-btn" type="submit" disabled={state === "sending"}>
            {state === "sending" ? "…" : cta}
          </button>
        </form>
      )}
      {state === "error" && <p className="waitlist-error" role="alert">{message}</p>}
    </div>
  );
}
