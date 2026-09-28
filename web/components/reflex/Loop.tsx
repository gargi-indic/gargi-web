import { REFLEX_CONTENT } from "@/content/reflex";

export function Loop() {
  const { loop } = REFLEX_CONTENT;

  return (
    <section className="reflex-section reflex-loop-section">
      <div className="reflex-container">
        <div className="loop-grid">
          <div className="loop-visual-col">
            <div className="reflex-eyebrow">{loop.eyebrow}</div>
            <h2 className="reflex-section-title">{loop.title}</h2>
            <p className="loop-sub">{loop.sub}</p>

            <div className="loop-diagram-wrapper">
              <svg
                viewBox="-40 -10 500 440"
                className="loop-svg"
                aria-label="Reflex lifecycle state loop"
              >
                <circle cx="210" cy="210" r="160" className="loop-svg-circle" />
                <text x="210" y="192" textAnchor="middle" className="loop-svg-label-muted">
                  STATE
                </text>
                <text x="210" y="226" textAnchor="middle" className="loop-svg-state-teacher">
                  teacher
                </text>
                <text x="210" y="250" textAnchor="middle" className="loop-svg-label-muted">
                  → shadow → <tspan className="loop-svg-state-student">assist</tspan>
                </text>

                {/* Nodes */}
                <circle cx="210" cy="50" r="11" className="node-fill-teacher" />
                <text x="210" y="24" textAnchor="middle" className="node-text">
                  COLLECT
                </text>

                <circle cx="348.6" cy="130" r="9" className="node-stroke-ink" />
                <text x="366" y="126" className="node-text-muted">
                  TRAIN
                </text>

                <circle cx="348.6" cy="290" r="9" className="node-stroke-ink" />
                <text x="366" y="302" className="node-text-muted">
                  PROVE
                </text>

                <circle cx="210" cy="370" r="9" className="node-stroke-holdout" />
                <text x="210" y="402" textAnchor="middle" className="node-text-muted">
                  SHADOW
                </text>

                <circle cx="71.4" cy="290" r="11" className="node-fill-student" />
                <text x="54" y="302" textAnchor="end" className="node-text-student">
                  SWAP
                </text>

                <circle cx="71.4" cy="130" r="9" className="node-fill-holdout" />
                <text x="54" y="126" textAnchor="end" className="node-text-muted">
                  WATCH
                </text>
              </svg>
            </div>
          </div>

          <div className="loop-steps-col">
            <div className="loop-steps-list">
              {loop.steps.map((step) => {
                const stepClass =
                  step.colorClass === "teacher"
                    ? "step-teacher"
                    : step.colorClass === "student"
                    ? "step-student"
                    : step.colorClass === "muted"
                    ? "step-muted"
                    : "step-normal";

                return (
                  <div key={step.num} className="loop-step-item">
                    <span className="step-num">{step.num}</span>
                    <span className={`step-name ${stepClass}`}>{step.name}</span>
                    <span className="step-text">{step.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="router-section">
              <div className="router-eyebrow">{loop.routerEyebrow}</div>
              <div className="router-nodes">
                <span className="router-node">{loop.routerNodes[0]}</span>
                <span className="router-arrow">→</span>
                <span className="router-node">{loop.routerNodes[1]}</span>
                <span className="router-arrow">→</span>
                <span className="router-node router-node-check">{loop.routerNodes[2]}</span>
              </div>
              <div className="router-outputs">
                <div className="router-output-card output-yes">
                  <b>{loop.routerOutputs.yes.label}</b> → {loop.routerOutputs.yes.title}
                  <br />
                  {loop.routerOutputs.yes.detail}
                </div>
                <div className="router-output-card output-no">
                  <b>{loop.routerOutputs.no.label}</b> → {loop.routerOutputs.no.title}
                  <br />
                  {loop.routerOutputs.no.detail}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
