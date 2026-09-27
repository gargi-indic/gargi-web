import Link from "next/link";
import { REFLEX_CONTENT } from "@/content/reflex";
import { SavingsCalculator } from "./SavingsCalculator";

export function Evidence() {
  const { evidence } = REFLEX_CONTENT;

  return (
    <section className="reflex-section reflex-evidence-section">
      <div className="reflex-container">
        <div className="evidence-header-row">
          <div>
            <div className="reflex-eyebrow">{evidence.eyebrow}</div>
            <h2 className="reflex-section-title">{evidence.title}</h2>
          </div>
          <Link href="/reflex/research" className="evidence-link">
            {evidence.researchLink}
          </Link>
        </div>

        <div className="evidence-stat-tiles">
          {evidence.stats.map((stat, idx) => {
            const splitVal = stat.value.split(" → ");
            return (
              <div key={idx} className="stat-tile">
                <div className="stat-tile-val">
                  {splitVal.length === 2 ? (
                    <>
                      <span className="stat-teacher-val">{splitVal[0]}</span>
                      <span className="stat-arrow"> → </span>
                      <span className="stat-student-val">{splitVal[1]}</span>
                    </>
                  ) : (
                    <span
                      className={
                        stat.highlight === "student" ? "stat-student-val" : ""
                      }
                    >
                      {stat.value}
                    </span>
                  )}
                </div>
                <div className="stat-tile-label">{stat.label}</div>
                <div className="stat-tile-caveat">{stat.caveat}</div>
              </div>
            );
          })}
        </div>

        <div className="evidence-bottom-grid">
          <div className="chart-col">
            <h3 className="chart-col-title">{evidence.chart.title}</h3>
            <div className="chart-col-sub">{evidence.chart.subtitle}</div>

            <div className="evidence-bar-chart">
              <div className="target-line" />
              {evidence.chart.rows.map((r, idx) => {
                const fillClass =
                  r.type === "student" ? "bar-student" : "bar-holdout";
                return (
                  <div key={idx} className="chart-bar-row">
                    <span className="bar-label">{r.label}</span>
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${fillClass}`}
                        style={{ width: `${r.pct}%` }}
                      />
                      {r.badge && <span className="bar-badge">{r.badge}</span>}
                    </div>
                    <span className="bar-val">{r.valueText}</span>
                  </div>
                );
              })}
            </div>

            <div className="chart-axis-labels">
              <span />
              <div className="axis-ticks">
                <span>0%</span>
                <span>50%</span>
                <span className="axis-target">{evidence.chart.targetLabel}</span>
              </div>
              <span />
            </div>
          </div>

          <div className="calculator-col">
            <SavingsCalculator />
          </div>
        </div>
      </div>
    </section>
  );
}
