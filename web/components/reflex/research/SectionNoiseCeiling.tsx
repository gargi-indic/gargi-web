"use client";

import React, { useState } from "react";
import { RESEARCH } from "@/content/reflex";

export function SectionNoiseCeiling() {
  const { noiseCeiling } = RESEARCH;
  const [activeTab, setActiveTab] = useState<"all" | "banking77" | "tickets">("all");

  const showBanking77 = activeTab === "all" || activeTab === "banking77";
  const showTickets = activeTab === "all" || activeTab === "tickets";

  return (
    <section id="noise" className="research-section">
      <div className="section-num">{noiseCeiling.num}</div>
      <h2 className="section-title">{noiseCeiling.title}</h2>
      <p className="section-p">{noiseCeiling.intro}</p>

      <figure className="chart-figure">
        <div className="chart-header-row">
          <div className="chart-figure-title">{noiseCeiling.chartTitle}</div>
          <div className="noise-tabs">
            <button
              onClick={() => setActiveTab("all")}
              className={`noise-tab-btn ${activeTab === "all" ? "is-selected" : ""}`}
            >
              All fields
            </button>
            <button
              onClick={() => setActiveTab("banking77")}
              className={`noise-tab-btn ${activeTab === "banking77" ? "is-selected" : ""}`}
            >
              Banking77
            </button>
            <button
              onClick={() => setActiveTab("tickets")}
              className={`noise-tab-btn ${activeTab === "tickets" ? "is-selected" : ""}`}
            >
              Tickets
            </button>
          </div>
        </div>

        <div className="chart-legend-row">
          {noiseCeiling.legend.map((leg, idx) => (
            <span key={idx} className="legend-item">
              <span className={`legend-swatch swatch-${leg.colorClass}`}></span>
              {leg.label}
            </span>
          ))}
        </div>

        <div className="noise-chart-body">
          <div className="headline-target-line"></div>

          {showBanking77 &&
            noiseCeiling.rows.banking77.map((row, idx) => (
              <div key={idx} className="noise-row">
                <span className="noise-row-label">{row.label}</span>
                <div className="noise-bars-stack">
                  <div className="noise-single-bar">
                    <div className="noise-bar-fill bar-teacher" style={{ width: `${row.teacherVsTeacher2}%` }}></div>
                    <span className="noise-bar-val">{row.teacherVsTeacher2}%</span>
                  </div>
                  <div className="noise-single-bar">
                    <div className="noise-bar-fill bar-holdout" style={{ width: `${row.teacherVsGold}%` }}></div>
                    <span className="noise-bar-val">{row.teacherVsGold}%</span>
                  </div>
                  <div className="noise-single-bar">
                    <div className="noise-bar-fill bar-student" style={{ width: `${row.studentVsTeacher}%` }}></div>
                    <span className="noise-bar-val">{row.studentVsTeacher}%</span>
                  </div>
                  <div className="noise-single-bar">
                    <div className="noise-bar-fill bar-student-light" style={{ width: `${row.studentVsTeacher2}%` }}></div>
                    <span className="noise-bar-val">{row.studentVsTeacher2}%</span>
                  </div>
                </div>
              </div>
            ))}

          {showTickets &&
            noiseCeiling.rows.tickets.map((row, idx) => (
              <div key={idx} className={`noise-row ${"isBold" in row && row.isBold ? "is-bold" : ""}`}>
                <span className="noise-row-label">{row.label}</span>
                <div className="noise-bars-stack">
                  <div className="noise-single-bar">
                    <div className="noise-bar-fill bar-teacher" style={{ width: `${row.teacherVsTeacher2}%` }}></div>
                    <span className="noise-bar-val">{row.teacherVsTeacher2}%</span>
                  </div>
                  <div className="noise-single-bar">
                    <div className="noise-bar-fill bar-holdout" style={{ width: `${row.teacherVsGold}%` }}></div>
                    <span className="noise-bar-val">{row.teacherVsGold}%</span>
                  </div>
                  <div className="noise-single-bar">
                    <div className="noise-bar-fill bar-student" style={{ width: `${row.studentVsTeacher}%` }}></div>
                    <span className="noise-bar-val">{row.studentVsTeacher}%</span>
                  </div>
                  <div className="noise-single-bar">
                    <div className="noise-bar-fill bar-student-light" style={{ width: `${row.studentVsTeacher2}%` }}></div>
                    <span className="noise-bar-val">{row.studentVsTeacher2}%</span>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <figcaption className="chart-caption">{noiseCeiling.figureCaption}</figcaption>
      </figure>

      <p className="section-p">{noiseCeiling.ticketsIntro}</p>

      <blockquote className="noise-pullquote">{noiseCeiling.pullQuote}</blockquote>
    </section>
  );
}
