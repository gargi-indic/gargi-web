import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { ScriptCycler } from "@/components/ScriptCycler";
import { ContactSupport } from "@/components/ContactSupport";
import { PageView } from "@/components/PageView";
import { LANGUAGES, M1 } from "@/content/indic";

export default function IndicHome() {
  return (
    <div className="shell">
      <PageView page="indic" />

      <section className="hero">
        <div className="hero-mark" aria-hidden>
          <ScriptCycler />
        </div>
        <div className="hero-body">
          <h1>
            Indic models,<br />built from<br />scratch.
          </h1>
          <p className="hero-lede">
            Gargi Labs builds diverse linguistic models and a shared knowledge infrastructure.
            This approach preserves the unique worldviews of different languages and leverages them for agentic tasks.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary btn-lg" href="/indic/chat">Try {M1.name}</Link>
            <a className="btn btn-secondary btn-lg btn-onbg" href="#languages">
              The language base
            </a>
          </div>
        </div>
      </section>

      <section id="languages" style={{ borderBottom: "2px solid var(--line)" }}>
        <div className="section-head">
          <h2>Building knowledge infrastructure for Indic languages</h2>
          <span className="section-note text-muted">

          </span>
        </div>
        <div className="lang-grid">
          {LANGUAGES.map((l) => (
            <div key={l.english} className={`lang-cell${l.live ? " lang-cell-live" : ""}`}>
              <div className="lang-glyph">{l.glyph}</div>
              <div className="lang-native">{l.native}</div>
              <div className={`lang-speakers${l.live ? "" : " text-muted"}`}>
                {l.english} · {l.speakers}
              </div>
              <hr className="lang-rule" />
              <div className="lang-rows">
                <div className="lang-row">
                  <span className={l.live ? "" : "text-muted"}>Model</span>
                  <b>{l.model}</b>
                </div>
                <div className="lang-row">
                  <span className={l.live ? "" : "text-muted"}>Status</span>
                  {l.live ? <b>{l.status}</b> : <span className="tag tag-neutral">{l.status}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ContactSupport source="indic" />

      <SiteFooter />
    </div>
  );
}
