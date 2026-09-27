import { REFLEX_CONTENT } from "@/content/reflex";

export function Gates() {
  const { gates } = REFLEX_CONTENT;

  return (
    <section className="reflex-section reflex-gates-section">
      <div className="reflex-container">
        <div className="gates-grid">
          <div className="gates-left">
            <div className="reflex-eyebrow">{gates.eyebrow}</div>
            <h2 className="reflex-section-title">{gates.title}</h2>
            <p className="gates-sub">{gates.sub}</p>
          </div>

          <div className="gates-right">
            <div className="gates-table-header">
              <span>GATE</span>
              <span className="text-right">DEFAULT</span>
            </div>

            <div className="gates-table-body">
              {gates.table.map((row, idx) => (
                <div key={idx} className="gates-row">
                  <span className="gate-name">
                    {row.gate}{" "}
                    {row.note && <span className="gate-note">{row.note}</span>}
                  </span>
                  <span className="gate-val">{row.defaultVal}</span>
                </div>
              ))}
            </div>

            <div className="gates-refusals">
              {gates.refusals.map((ref, idx) => (
                <span
                  key={idx}
                  className={`refusal-badge ${
                    ref.passed ? "badge-passed" : "badge-refused"
                  }`}
                >
                  {ref.label}
                </span>
              ))}
            </div>

            <p className="gates-demo-note">{gates.demoNote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
