import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { ScriptCycler } from "@/components/ScriptCycler";
import { WaitlistForm } from "@/components/WaitlistForm";
import { PageView } from "@/components/PageView";
import { CONTRIBUTORS, PILLARS, VISION, WHY_OPEN } from "@/content/indic";

export const metadata: Metadata = {
  title: "About",
  description: "Gargi Labs trains small, capable models for Indian languages and releases them openly.",
};

export default function About() {
  return (
    <div className="shell">
      <PageView page="indic-about" />

      <section className="about-hero">
        <div className="about-hero-body">
          <div className="kicker">About</div>
          <h1 className="page-title">Language is shared knowledge.</h1>
          <p className="page-lede" style={{ marginBottom: 0 }}>
            Gargi Labs trains small, highly capable models for Indian languages and releases
            them openly. Everything we build is meant to be used, copied and improved by
            anyone — because the knowledge a language carries belongs to the people who
            speak it, not to whoever happens to hold the weights.
          </p>
        </div>
        <div className="about-hero-mark">
          <ScriptCycler />
        </div>
      </section>

      <section style={{ borderBottom: "2px solid var(--line)" }}>
        <div className="vision-split">
          <div>
            <div className="kicker" style={{ marginBottom: 16 }}>Our vision</div>
            <p className="manifesto">{VISION}</p>
          </div>
          <div className="vision-why">
            {WHY_OPEN.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
        <div className="pillars">
          {PILLARS.map((p) => (
            <div className="pillar" key={p.n}>
              <div className="pillar-n">{p.n}</div>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="contribute-split">
        <div className="contribute-intro">
          <h2 style={{ margin: "0 0 16px", fontSize: 32 }}>Built the way open source is built</h2>
          <p style={{ margin: "0 0 28px", fontSize: 17, lineHeight: 1.6, maxWidth: "46ch" }}>
            Gargi Labs develops in the open, in public repositories, with the same review and
            contribution model that produced most of the software the world runs on. If you
            work on language, machine learning, data or the languages themselves, there is
            work here for you.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#contribute">Get involved</a>
            <Link className="btn btn-secondary btn-onbg" href="/indic/models">See the models</Link>
          </div>
        </div>
        <div id="contribute" className="contribute-list">
          {CONTRIBUTORS.map((c) => (
            <div className="contribute-row" key={c.role}>
              <span className="contribute-role">{c.role}</span>
              <span className="text-muted" style={{ fontSize: 15 }}>{c.body}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="accent-panel" style={{ padding: "64px var(--gutter)" }}>
        <div className="accent-panel-ghost ml" aria-hidden>ഗ</div>
        <div className="accent-split">
          <WaitlistForm source="about" label="Work with us" cta="Send" />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
