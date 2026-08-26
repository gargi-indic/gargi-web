import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WaitlistForm } from "@/components/WaitlistForm";
import { PageView } from "@/components/PageView";
import { FUNDAMENTALS, M1, M1_STATS, RELEASES } from "@/content/site";

export const metadata: Metadata = {
  title: "Models",
  description: `${M1.name} — a ${M1.params}-parameter Malayalam language model, openly released.`,
};

export default function Models() {
  return (
    <div className="shell">
      <PageView page="models" />
      <Nav current="models" />

      <section className="model-hero">
        <div className="model-hero-body">
          <div className="kicker">Models</div>
          <h1 className="page-title">{M1.name}</h1>
          <p className="page-lede">
            A {M1.params}-parameter Malayalam language model trained from Malayalam text,
            with a tokenizer built for the script rather than adapted to it. Weights,
            tokenizer and training recipe are published in full.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary btn-lg" href="/chat">Try it in chat</Link>
            <a className="btn btn-secondary btn-lg btn-onbg" href="#downloads">Download weights</a>
          </div>
        </div>
        <div className="stat-grid">
          {M1_STATS.map((s) => (
            <div className="stat" key={s.label}>
              <div className="stat-label text-muted">{s.label}</div>
              <div
                className={[
                  "stat-value",
                  s.value.length > 6 ? "stat-value-sm" : "",
                  s.accent ? "stat-value-accent" : "",
                ].join(" ")}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ borderBottom: "2px solid var(--color-divider)" }}>
        <div className="section-head" style={{ paddingTop: 44, paddingBottom: 24 }}>
          <h2 style={{ fontSize: 32 }}>Fundamentals</h2>
          <span className="section-note text-muted">
            {/* The short version — the full recipe is in the model card. */}
          </span>
        </div>
        <div className="fundamentals">
          {FUNDAMENTALS.map((f) => (
            <div className="fundamental" key={f.n}>
              <div className="fundamental-head">
                <div className="fundamental-n">{f.n}</div>
                <h3>{f.title}</h3>
              </div>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="downloads" style={{ borderBottom: "2px solid var(--color-divider)" }}>
        <div className="section-head" style={{ paddingTop: 44, paddingBottom: 24 }}>
          <h2 style={{ fontSize: 32 }}>Releases</h2>
          <span className="section-note text-muted">
            {/* Weights, tokenizers and evaluation code, published as each one is finished. */}
          </span>
        </div>
        <div className="table-scroll">
          <table className="table releases">
            <thead>
              <tr>
                <th>Release</th><th>Language</th><th>Parameters</th>
                <th>Context</th><th>Date</th><th>Weights</th>
              </tr>
            </thead>
            <tbody>
              {RELEASES.map((r) => (
                <tr key={r.name}>
                  <td>{r.name}</td>
                  <td>{r.language}</td>
                  <td>{r.params}</td>
                  <td>{r.context}</td>
                  <td>{r.date}</td>
                  <td>
                    {r.href ? (
                      <a href={r.href} target="_blank" rel="noreferrer">Hugging Face</a>
                    ) : (
                      <span className="tag tag-neutral">{r.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="accent-panel" style={{ padding: "56px var(--gutter)" }}>
        <div className="accent-panel-ghost ml" aria-hidden>ഗ</div>
        <div className="accent-split">
          <div className="manifesto" style={{ maxWidth: "26ch" }}>
            A billion people should not have to think in English to be understood by a machine.
          </div>
          <WaitlistForm source="models" />
        </div>
      </section>

      <Footer />
    </div>
  );
}
