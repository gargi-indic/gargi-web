import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageView } from "@/components/PageView";
import { CallStream } from "@/components/reflex/CallStream";
import { CopyPill } from "@/components/reflex/CopyPill";
import { StatTiles } from "@/components/reflex/StatTiles";
import { Contract } from "@/components/reflex/Contract";
import { HOME, SITE } from "@/content/lab";

export const metadata: Metadata = {
  title: { absolute: SITE.name },
  description: HOME.hero.sub,
};

export default function Home() {
  const { hero, does, evidence, getStarted, also } = HOME;

  return (
    <div className="shell">
      <PageView page="home" />
      <SiteHeader />
      <main className="page-main">
        <section className="reflex-hero-section">
          <div className="reflex-hero-inner">
            <div className="reflex-hero-left">
              <div className="reflex-eyebrow">{hero.descriptor}</div>
              <h1 className="reflex-hero-title">
                {hero.title} <span className="reflex-hero-title-accent">{hero.titleAccent}</span>
              </h1>
              <p className="reflex-hero-sub">{hero.sub}</p>
              <p className="home-positioning">{hero.positioning}</p>
              <div className="reflex-hero-actions">
                <CopyPill command={hero.pipCommand} />
              </div>
            </div>
            <CallStream />
          </div>
        </section>

        <section className="reflex-section">
          <div className="reflex-container">
            <h2 className="reflex-section-title">{does.title}</h2>
            <ol className="numbered-rows">
              {does.rows.map((row) => (
                <li key={row.n} className="numbered-row">
                  <span className="numbered-row-n">{row.n}</span>
                  <h3 className="numbered-row-title">{row.title}</h3>
                  <p className="numbered-row-body">{row.body}</p>
                </li>
              ))}
            </ol>
            <p className="page-lede">{does.audience}</p>
          </div>
        </section>

        <section className="reflex-section">
          <div className="reflex-container">
            <div className="evidence-header-row">
              <h2 className="reflex-section-title">{evidence.title}</h2>
              <Link href="/reflex/research" className="evidence-link">
                {evidence.researchLink}
              </Link>
            </div>
            <StatTiles />
          </div>
        </section>

        <Contract />

        <section className="reflex-section">
          <div className="reflex-container get-started-grid">
            <h2 className="reflex-section-title">{getStarted.title}</h2>
            <div className="get-started-body">
              <CopyPill command={getStarted.pipCommand} />
              <div className="cta-reproduce-box">
                <div className="reproduce-title">{getStarted.reproduceTitle}</div>
                <div className="reproduce-cmd">
                  <span className="copy-pill-prompt">$</span> {getStarted.reproduceCommand}
                </div>
              </div>
              <div className="get-started-links">
                {getStarted.links.map((l) =>
                  l.external ? (
                    <a key={l.href + l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                      {l.label}
                    </a>
                  ) : (
                    <Link key={l.href} href={l.href} className="btn-secondary">
                      {l.label}
                    </Link>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="reflex-section">
          <div className="reflex-container">
            <h2 className="also-title">{also.title}</h2>
            <div className="also-row">
              {also.items.map((item) => (
                <Link key={item.href} href={item.href} className="also-cell">
                  <span className="also-name">{item.name} →</span>
                  <span className="status-tag status-dev">{item.status}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
