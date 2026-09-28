import { REFLEX_CONTENT } from "@/content/reflex";

export function Vision() {
  const { vision } = REFLEX_CONTENT;

  return (
    <section id="vision" className="reflex-section reflex-vision-section">
      <div className="reflex-container">
        <div className="vision-header-row">
          <div className="reflex-eyebrow">{vision.eyebrow}</div>
          <span className="vision-badge">{vision.badge}</span>
        </div>

        <h2 className="reflex-section-title vision-title">{vision.title}</h2>
        <p className="vision-sub">{vision.sub}</p>

        <div className="vision-grid">
          {vision.items.map((item) => (
            <div key={item.num} className="vision-card">
              <span className="vision-num">{item.num}</span>
              <h3 className="vision-card-title">{item.title}</h3>
              <p className="vision-card-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
