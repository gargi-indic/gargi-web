"use client";

import { useState } from "react";

export function AdminLogin() {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) location.reload();
    else setError(true);
  }

  return (
    <div className="shell">
      <div className="prose">
        <h1>Gargi Labs admin</h1>
        <form onSubmit={submit} style={{ display: "flex", gap: 8, maxWidth: 380 }}>
          <label className="sr-only" htmlFor="pw">Password</label>
          <input
            id="pw"
            className="input"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            autoFocus
          />
          <button className="btn btn-primary" type="submit">Enter</button>
        </form>
        {error && <p style={{ color: "var(--accent)" }}>Wrong password.</p>}
      </div>
    </div>
  );
}
