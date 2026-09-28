import React from "react";
import { RESEARCH } from "@/content/reflex";

export function SectionHeadline() {
  const { headline } = RESEARCH;
  return (
    <section id="headline" className="research-section">
      <div className="section-num">{headline.num}</div>
      <h2 className="section-title">{headline.title}</h2>

      <figure className="chart-figure">
        <div className="chart-figure-title">
          {headline.chartTitle} <span className="chart-figure-sub">{headline.chartSub}</span>
        </div>
        <div className="headline-bars-container">
          <div className="headline-target-line"></div>
          {headline.bars.map((bar, idx) => (
            <div key={idx} className="headline-bar-row">
              <span className="headline-bar-label">{bar.label}</span>
              <div className="bar-track">
                <div
                  className={`bar-fill bar-${bar.color}`}
                  style={{ width: `${bar.pct}%` }}
                ></div>
                {"ci" in bar && bar.ci && <div className="headline-ci-line"></div>}
              </div>
              <span className="headline-bar-val">{bar.val}</span>
            </div>
          ))}
        </div>
        <figcaption className="chart-caption">{headline.figureCaption}</figcaption>
      </figure>

      <div className="headline-summaries">
        <p className="section-p">{headline.banking77Summary}</p>
        <p className="section-p">{headline.ticketsSummary}</p>
      </div>
    </section>
  );
}
