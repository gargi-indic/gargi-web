import React from "react";
import { RESEARCH } from "@/content/reflex";

export function SectionEconomics() {
  const { economics } = RESEARCH;

  return (
    <section id="worth" className="research-section">
      <div className="section-num">{economics.num}</div>
      <h2 className="section-title">
        {economics.title}
        <span className="projection-badge">{economics.badge}</span>
      </h2>

      <div className="economics-grid">
        <div className="economics-table-col">
          <div className="economics-table-header">
            <span>CALLS / DAY</span>
            <span className="text-right">YEARLY SAVING</span>
          </div>
          {economics.rows.map((r, idx) => (
            <div key={idx} className="economics-table-row">
              <span className="mono-val">{r.callsPerDay}</span>
              <span className={`text-right mono-val ${"isAccent" in r && r.isAccent ? "accent-val" : ""}`}>
                {r.saving}
              </span>
            </div>
          ))}
          <div className="economics-note">{economics.costNote}</div>
        </div>

        <div className="economics-latency-col">
          <div className="economics-header">MEDIAN LATENCY</div>
          <div className="latency-flex">
            <span className="lat-llm">{economics.latency.llm}</span>
            <span className="lat-arrow">→</span>
            <span className="lat-local">{economics.latency.bge}</span>
            <span className="lat-tag">bge-base</span>
            <span className="lat-local">{economics.latency.minilm}</span>
            <span className="lat-tag">MiniLM</span>
          </div>
          <p className="section-p">{economics.latency.note}</p>

          <div className="leaves-out-header">WHAT THIS LEAVES OUT</div>
          <p className="leaves-out-text">{economics.leavesOut}</p>
        </div>
      </div>
    </section>
  );
}
