import Link from "next/link";
import { REFLEX_CONTENT } from "@/content/reflex";
import { CopyPill } from "./CopyPill";
import { CallStream } from "./CallStream";

export function Hero() {
  const { hero } = REFLEX_CONTENT;

  return (
    <section className="reflex-hero-section">
      <div className="reflex-hero-inner">
        <div className="reflex-hero-left">
          <div className="reflex-eyebrow">{hero.descriptor}</div>
          <h1 className="reflex-hero-title">
            {hero.title}{" "}
            <span className="reflex-hero-title-accent">{hero.titleAccent}</span>
          </h1>
          <p className="reflex-hero-sub">{hero.sub}</p>
          <div className="reflex-hero-actions">
            <CopyPill command={hero.pipCommand} />
            <Link href="/reflex/research" className="btn-secondary">
              {hero.seeResearch}
            </Link>
          </div>
        </div>

        <CallStream />
      </div>
    </section>
  );
}
