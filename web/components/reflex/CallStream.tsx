import { REFLEX_CONTENT } from "@/content/reflex";

/** Live call stream + swap-rate curve panel. Shared by /reflex and / heroes. */
export function CallStream() {
  const { hero } = REFLEX_CONTENT;

  return (
    <div className="reflex-hero-right">
      <div className="call-stream-header">
        <span className="mono-label">{hero.callStreamTitle}</span>
        <span className="call-stream-state">
          state <span className="call-stream-state-val">{hero.stateLabel}</span>
        </span>
      </div>

      <div className="call-stream-list">
        {hero.callStreamRows.map((row, idx) => {
          const routeTagClass =
            row.type === "student"
              ? "tag-reflex"
              : row.type === "teacher"
              ? "tag-llm"
              : "tag-holdout";

          const latencyClass =
            row.type === "student" ? "latency-student" : "latency-teacher";

          return (
            <div key={idx} className="call-stream-row">
              <span className={`route-tag ${routeTagClass}`}>{row.tag}</span>
              <span className="call-stream-label">{row.label}</span>
              <span className={`call-stream-latency ${latencyClass}`}>
                {row.latency}
              </span>
            </div>
          );
        })}
      </div>

      <div className="call-stream-chart-box">
        <div className="call-stream-legend">
          <span className="legend-item">
            <span className="legend-color legend-student" />
            Served locally
          </span>
          <span className="legend-item">
            <span className="legend-color legend-holdout" />
            Holdout agreement
          </span>
        </div>

        <svg
          viewBox="0 0 1000 400"
          className="swap-chart-svg"
          aria-label="Swap rate and holdout agreement chart"
        >
          <line x1="60" x2="940" y1="350" y2="350" className="chart-line-base" />
          <line x1="60" x2="940" y1="190" y2="190" className="chart-line-soft" />
          <line x1="60" x2="940" y1="46" y2="46" className="chart-line-dashed" />
          <text x="66" y="34" className="chart-text-bold">
            95%
          </text>

          <line x1="467" x2="467" y1="46" y2="350" className="chart-divider" />
          <line x1="478" x2="478" y1="46" y2="350" className="chart-divider" />

          <text x="458" y="330" textAnchor="end" className="chart-text-muted">
            teacher
          </text>
          <text x="490" y="330" className="chart-text-muted">
            shadow → assist
          </text>

          {/* Holdout agreement path */}
          <path
            d="M501.3,68.4 L523.3,64.6 L545.4,57.6 L567.5,63.4 L589.5,56.7 L611.6,53.6 L633.7,50.6 L655.7,48.1 L677.8,46.7 L699.9,47.2 L721.9,45.7 L744.0,44.1 L766.0,42.8 L788.1,44.4 L810.2,39.6 L832.2,41.2 L854.3,36.4 L876.4,36.4 L898.4,36.4 L920.5,36.4 L940.0,38.0"
            fill="none"
            className="chart-path-holdout"
          />

          {/* Swap rate / local path */}
          <path
            d="M82.1,350.0 L457.2,350.0 L479.2,325.6 L501.3,88.5 L523.3,84.6 L545.4,94.4 L567.5,88.5 L589.5,105.1 L611.6,97.3 L633.7,97.3 L655.7,100.2 L677.8,81.7 L699.9,91.5 L721.9,92.4 L744.0,100.2 L766.0,93.4 L788.1,80.7 L810.2,105.1 L832.2,94.4 L854.3,78.8 L876.4,89.5 L898.4,83.7 L920.5,99.3 L940.0,75.2"
            fill="none"
            className="chart-path-student"
          />
          <circle cx="940" cy="75.2" r="10" className="chart-circle-student" />
        </svg>

        <div className="chart-caveat">{hero.chartCaveat}</div>
      </div>
    </div>
  );
}
