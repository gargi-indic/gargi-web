"use client";

import React, { useState } from "react";
import { RESEARCH } from "@/content/reflex";

export function SectionTheDial() {
  const { dial } = RESEARCH;
  const [selectedTarget, setSelectedTarget] = useState<number>(0.95);

  const activePoint = dial.points.find((p) => p.target === selectedTarget) || dial.points[1];

  return (
    <section id="dial" className="research-section">
      <div className="section-num">{dial.num}</div>
      <h2 className="section-title">{dial.title}</h2>
      <p className="section-p">{dial.intro}</p>

      <figure className="chart-figure dial-figure">
        <div className="dial-grid">
          <svg
            viewBox="0 0 1000 400"
            className="dial-svg"
            aria-label="Agreement vs coverage dial curve"
          >
            <line x1="60" x2="940" y1="350" y2="350" className="chart-grid-line-main" />
            <line x1="60" x2="940" y1="190" y2="190" className="chart-grid-line" />
            <line x1="60" x2="940" y1="30" y2="30" className="chart-grid-line" />
            <line x1="60" x2="940" y1="46" y2="46" className="chart-guide-line" />

            <text x="50" y="354" textAnchor="end" className="chart-axis-text">0%</text>
            <text x="50" y="194" textAnchor="end" className="chart-axis-text">50%</text>
            <text x="50" y="34" textAnchor="end" className="chart-axis-text">100%</text>

            <text x="60" y="376" className="chart-axis-text">0%</text>
            <text x="500" y="376" textAnchor="middle" className="chart-axis-text">50%</text>
            <text x="940" y="376" textAnchor="end" className="chart-axis-text">100%</text>
            <text x="500" y="396" textAnchor="middle" className="chart-axis-subtext">
              share of calls served · y: agreement
            </text>

            {/* Operating curve */}
            <path
              d="M68.6,30.0 L367.8,30.0 L499.9,31.3 L605.2,32.5 L702.3,35.6 L790.2,40.7 L842.9,46.9 L887.0,52.3 L940.0,61.6"
              fill="none"
              className="dial-path-student"
            />

            {/* Operating points */}
            {/* 0.90 -> ~100% served (cx=940, cy=60.7) */}
            <circle
              cx="940"
              cy="60.7"
              r={selectedTarget === 0.90 ? 9 : 6}
              className={selectedTarget === 0.90 ? "circle-active" : "circle-inactive"}
              onClick={() => setSelectedTarget(0.90)}
              style={{ cursor: "pointer" }}
            />
            {/* 0.95 -> 89% served (cx=843, cy=44.4) */}
            <circle
              cx="843"
              cy="44.4"
              r={selectedTarget === 0.95 ? 9 : 6}
              className={selectedTarget === 0.95 ? "circle-active" : "circle-inactive"}
              onClick={() => setSelectedTarget(0.95)}
              style={{ cursor: "pointer" }}
            />
            {/* 0.97 -> 83% served (cx=794.5, cy=39.2) */}
            <circle
              cx="794.5"
              cy="39.2"
              r={selectedTarget === 0.97 ? 9 : 6}
              className={selectedTarget === 0.97 ? "circle-active" : "circle-inactive"}
              onClick={() => setSelectedTarget(0.97)}
              style={{ cursor: "pointer" }}
            />

            {/* Active drop line */}
            {selectedTarget === 0.95 && (
              <>
                <line x1="843" x2="843" y1="54" y2="350" className="dial-drop-line" />
                <text x="835" y="120" textAnchor="end" className="dial-drop-text">
                  95% → 89% served
                </text>
              </>
            )}
            {selectedTarget === 0.90 && (
              <>
                <line x1="940" x2="940" y1="70" y2="350" className="dial-drop-line" />
                <text x="930" y="130" textAnchor="end" className="dial-drop-text">
                  90% → ~100% served
                </text>
              </>
            )}
            {selectedTarget === 0.97 && (
              <>
                <line x1="794.5" x2="794.5" y1="48" y2="350" className="dial-drop-line" />
                <text x="785" y="110" textAnchor="end" className="dial-drop-text">
                  97% → 83% served
                </text>
              </>
            )}
          </svg>

          <div className="dial-controls">
            <div className="dial-control-header">min_agreement</div>
            {dial.points.map((pt) => {
              const isSelected = pt.target === selectedTarget;
              return (
                <button
                  key={pt.agreement}
                  onClick={() => setSelectedTarget(pt.target)}
                  className={`dial-point-btn ${isSelected ? "is-selected" : ""}`}
                >
                  <span>{pt.agreement}</span>
                  <span>{pt.coverageText}</span>
                </button>
              );
            })}
            <div className="dial-slider-box">
              <label htmlFor="agreement-slider" className="dial-slider-label">
                Interactive target: <span className="mono-val">{selectedTarget}</span>
              </label>
              <input
                id="agreement-slider"
                type="range"
                min="0.90"
                max="0.97"
                step="0.01"
                value={selectedTarget}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (val <= 0.92) setSelectedTarget(0.90);
                  else if (val <= 0.96) setSelectedTarget(0.95);
                  else setSelectedTarget(0.97);
                }}
                className="slider-input slider-student"
              />
            </div>
          </div>
        </div>

        <figcaption className="chart-caption">{dial.figureCaption}</figcaption>
      </figure>
    </section>
  );
}
