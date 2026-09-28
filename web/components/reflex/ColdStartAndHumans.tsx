import Image from "next/image";
import { REFLEX_CONTENT } from "@/content/reflex";

export function ColdStartAndHumans() {
  const { coldStartAndHumans } = REFLEX_CONTENT;
  const { coldStart, humans } = coldStartAndHumans;

  return (
    <section className="reflex-section reflex-coldstart-section">
      <div className="reflex-container">
        <div className="coldstart-grid">
          {/* Cold Start Column */}
          <div className="coldstart-col">
            <div className="reflex-eyebrow">{coldStart.eyebrow}</div>
            <h2 className="reflex-section-title">{coldStart.title}</h2>
            <p className="coldstart-desc">{coldStart.desc}</p>

            <div className="coldstart-tags">
              {coldStart.tags.map((tag) => (
                <span key={tag} className="coldstart-tag">
                  {tag}
                </span>
              ))}
            </div>

            <div className="code-block code-block-after coldstart-code">
              <pre className="code-block-content">{coldStart.code}</pre>
            </div>

            <div className="coldstart-stat-row">
              <span className="coldstart-stat-val">{coldStart.statVal}</span>
              <span className="coldstart-stat-label">{coldStart.statLabel}</span>
            </div>
            <div className="coldstart-stat-caveat">{coldStart.statCaveat}</div>
          </div>

          {/* Humans Column */}
          <div className="humans-col">
            <div className="reflex-eyebrow">{humans.eyebrow}</div>
            <h2 className="reflex-section-title">{humans.title}</h2>
            <p className="humans-desc">{humans.desc}</p>

            <div className="humans-image-wrapper">
              <Image
                src={humans.imagePath}
                alt={humans.imageAlt}
                width={600}
                height={350}
                className="humans-image"
              />
            </div>

            <div className="humans-shortcuts">
              {humans.shortcuts.map((sc) => (
                <span key={sc.key} className="shortcut-item">
                  <b className="shortcut-key">{sc.key}</b> {sc.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
