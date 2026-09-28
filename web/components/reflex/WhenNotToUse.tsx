import { REFLEX_CONTENT } from "@/content/reflex";

export function WhenNotToUse() {
  const { whenNotToUse } = REFLEX_CONTENT;

  return (
    <section className="reflex-section reflex-whennot-section">
      <div className="reflex-container">
        <div className="whennot-grid">
          <div className="whennot-left">
            <div className="reflex-eyebrow">{whenNotToUse.eyebrow}</div>
            <h2 className="reflex-section-title">{whenNotToUse.title}</h2>
          </div>

          <div className="whennot-right">
            <div className="whennot-list">
              {whenNotToUse.items.map((item, idx) => (
                <div key={idx} className="whennot-item">
                  <span className="whennot-cross">✕</span>
                  <span className="whennot-text">
                    {item.text}{" "}
                    {item.note && <span className="whennot-note">{item.note}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
