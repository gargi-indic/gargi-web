import { REFLEX_CONTENT } from "@/content/reflex";
import { REFLEX_GITHUB } from "@/content/lab";
import { CopyPill } from "./CopyPill";

export function OpenSourceCta() {
  const { openSourceCta } = REFLEX_CONTENT;

  return (
    <section className="reflex-cta-section">
      <div className="reflex-container">
        <div className="cta-grid">
          <div className="cta-left">
            <div className="cta-badge">{openSourceCta.badge}</div>
            <h2 className="cta-title">
              {openSourceCta.title}{" "}
              <span className="cta-title-accent">{openSourceCta.titleAccent}</span>
            </h2>
          </div>

          <div className="cta-right">
            <CopyPill command={openSourceCta.pipCommand} className="cta-pill" />

            <div className="cta-reproduce-box">
              <div className="reproduce-title">{openSourceCta.reproduceTitle}</div>
              <div className="reproduce-cmd">
                <span className="copy-pill-prompt">$</span> {openSourceCta.reproduceCommand}
              </div>
            </div>

            <a
              href={REFLEX_GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-github-link"
            >
              {openSourceCta.githubLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
