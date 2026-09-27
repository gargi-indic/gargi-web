import React from "react";
import { RESEARCH } from "@/content/reflex";

export function SectionWhereItFails() {
  const { whereItFails } = RESEARCH;

  return (
    <section id="fails" className="research-section">
      <div className="section-num">{whereItFails.num}</div>
      <h2 className="section-title">{whereItFails.title}</h2>

      <figure className="chart-figure">
        <div className="chart-legend-row">
          <span className="legend-item">
            <span className="legend-line swatch-student"></span>
            Trained on LLM labels (agreement vs LLM)
          </span>
          <span className="legend-item">
            <span className="legend-line swatch-holdout"></span>
            Trained on dataset labels (agreement vs dataset)
          </span>
        </div>

        <svg
          viewBox="0 0 1000 400"
          className="fails-svg"
          aria-label="Tickets coverage vs agreement curve"
        >
          <line x1="60" x2="940" y1="350" y2="350" className="chart-grid-line-main" />
          <line x1="60" x2="940" y1="190" y2="190" className="chart-grid-line" />
          <line x1="60" x2="940" y1="30" y2="30" className="chart-grid-line" />

          <line x1="60" x2="940" y1="46" y2="46" className="chart-guide-line" />
          <text x="934" y="40" textAnchor="end" className="chart-guide-text">
            95% agreement bar
          </text>

          <text x="50" y="354" textAnchor="end" className="chart-axis-text">0%</text>
          <text x="50" y="194" textAnchor="end" className="chart-axis-text">50%</text>
          <text x="50" y="34" textAnchor="end" className="chart-axis-text">100%</text>

          <text x="60" y="376" className="chart-axis-text">0%</text>
          <text x="500" y="376" textAnchor="middle" className="chart-axis-text">50%</text>
          <text x="940" y="376" textAnchor="end" className="chart-axis-text">100%</text>
          <text x="500" y="396" textAnchor="middle" className="chart-axis-subtext">
            share of calls served · y: agreement on the whole call
          </text>

          {/* Dataset labels curve */}
          <path
            d="M68.5,59.1 L76.9,102.7 L85.4,107.6 L94.6,136.7 L103.1,138.6 L112.3,142.9 L120.8,151.5 L130.0,156.6 L138.5,168.0 L147.7,173.2 L173.8,168.4 L200.0,175.9 L226.9,180.4 L253.1,186.8 L279.2,192.8 L306.2,198.0 L332.3,199.9 L358.5,206.5 L385.4,212.3 L411.5,214.2 L437.7,221.0 L464.6,224.7 L490.8,230.0 L516.9,232.6 L543.8,234.0 L570.0,237.5 L596.2,240.7 L623.1,242.9 L649.2,245.6 L675.4,247.6 L702.3,250.0 L728.5,251.3 L754.6,253.3 L781.5,254.5 L807.7,256.5 L833.8,256.8 L860.8,258.1 L886.9,259.2 L913.1,260.3 L940.0,261.6"
            fill="none"
            className="curve-path-holdout"
          />

          {/* LLM labels curve */}
          <path
            d="M68.5,30.0 L76.9,44.5 L85.4,39.7 L94.6,44.2 L103.1,47.1 L112.3,53.5 L120.8,54.3 L130.0,54.6 L138.5,55.1 L147.7,58.1 L156.2,60.7 L164.6,67.6 L173.8,64.6 L182.3,64.2 L191.5,65.6 L200.0,66.9 L209.2,69.6 L226.9,69.8 L235.4,76.3 L253.1,79.7 L270.8,88.4 L296.9,89.2 L323.1,93.6 L350.0,97.1 L376.2,98.5 L402.3,101.2 L429.2,104.0 L455.4,106.6 L481.5,110.0 L508.5,115.1 L534.6,116.1 L560.8,118.0 L587.7,121.0 L613.8,122.9 L640.0,125.5 L666.9,127.7 L693.1,129.9 L719.2,134.6 L746.2,137.3 L772.3,140.9 L798.5,144.3 L825.4,146.7 L851.5,149.4 L877.7,151.6 L904.6,155.0 L940.0,160.9"
            fill="none"
            className="curve-path-student"
          />

          <circle cx="940" cy="160.9" r="5" className="circle-student" />
          <circle cx="940" cy="261.6" r="5" className="circle-holdout" />

          <text x="950" y="166" className="curve-val-student">59%</text>
          <text x="950" y="266" className="curve-val-holdout">28%</text>
        </svg>

        <figcaption className="chart-caption">{whereItFails.figureCaption}</figcaption>
      </figure>

      <div className="fails-points-list">
        {whereItFails.points.map((pt, idx) => (
          <p key={idx} className="section-p">
            <strong>{pt.bold} </strong>
            {pt.text}
          </p>
        ))}
      </div>
    </section>
  );
}
