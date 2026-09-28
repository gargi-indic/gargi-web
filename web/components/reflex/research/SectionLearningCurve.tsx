import React from "react";
import { RESEARCH } from "@/content/reflex";

export function SectionLearningCurve() {
  const { learningCurve } = RESEARCH;

  return (
    <section id="labels" className="research-section">
      <div className="section-num">{learningCurve.num}</div>
      <h2 className="section-title">{learningCurve.title}</h2>

      <figure className="chart-figure">
        <div className="chart-legend-row">
          {learningCurve.legend.map((leg, idx) => (
            <span key={idx} className="legend-item">
              <span className={`legend-line swatch-${leg.colorClass}`}></span>
              {leg.label}
            </span>
          ))}
        </div>

        <svg
          viewBox="0 0 1000 400"
          className="learning-curve-svg"
          aria-label="Learning curve chart"
        >
          <line x1="60" x2="940" y1="350" y2="350" className="chart-grid-line-main" />
          <line x1="60" x2="940" y1="270" y2="270" className="chart-grid-line" />
          <line x1="60" x2="940" y1="190" y2="190" className="chart-grid-line" />
          <line x1="60" x2="940" y1="110" y2="110" className="chart-grid-line" />
          <line x1="60" x2="940" y1="30" y2="30" className="chart-grid-line" />

          <text x="50" y="354" textAnchor="end" className="chart-axis-text">0%</text>
          <text x="50" y="194" textAnchor="end" className="chart-axis-text">50%</text>
          <text x="50" y="34" textAnchor="end" className="chart-axis-text">100%</text>

          <line x1="256" x2="256" y1="30" y2="350" className="chart-guide-line" />
          <text x="262" y="330" className="chart-guide-text">2,000 labels</text>

          <text x="60" y="376" className="chart-axis-text">0</text>
          <text x="256" y="376" textAnchor="middle" className="chart-axis-text">2k</text>
          <text x="452" y="376" textAnchor="middle" className="chart-axis-text">4k</text>
          <text x="648" y="376" textAnchor="middle" className="chart-axis-text">6k</text>
          <text x="844" y="376" textAnchor="middle" className="chart-axis-text">8k</text>
          <text x="940" y="394" textAnchor="end" className="chart-axis-text">LLM labels</text>

          {/* Gold labels curve */}
          <path
            d="M109.0,184.8 L158.0,140.0 L256.0,85.9 L452.0,52.5 L940.0,51.7"
            fill="none"
            className="curve-path-holdout"
          />
          {/* LLM labels curve */}
          <path
            d="M109.0,155.4 L158.0,114.3 L256.0,84.3 L452.0,77.8 L940.0,72.0"
            fill="none"
            className="curve-path-student"
          />

          <circle cx="940" cy="72" r="5" className="circle-student" />
          <circle cx="940" cy="51.7" r="5" className="circle-holdout" />

          <text x="950" y="77" className="curve-val-student">87%</text>
          <text x="950" y="50" className="curve-val-holdout">93%</text>
        </svg>

        <figcaption className="chart-caption">{learningCurve.figureCaption}</figcaption>
      </figure>

      <div className="learning-table-wrapper">
        <div className="learning-table-grid learning-table-header">
          <span>LLM LABELS</span>
          {learningCurve.table.headers.map((h, idx) => (
            <span key={idx}>{h}</span>
          ))}
        </div>
        <div className="learning-table-grid learning-table-row">
          <span className="row-label-student">{learningCurve.table.teacherRow.label}</span>
          {learningCurve.table.teacherRow.values.map((v, idx) => (
            <span key={idx}>{v}</span>
          ))}
        </div>
        <div className="learning-table-grid learning-table-row">
          <span className="row-label-holdout">{learningCurve.table.goldRow.label}</span>
          {learningCurve.table.goldRow.values.map((v, idx) => (
            <span key={idx}>{v}</span>
          ))}
        </div>
      </div>

      <p className="section-p">{learningCurve.summary}</p>
    </section>
  );
}
