import { REFLEX_CONTENT } from "@/content/reflex";

/** The four Phase 0 stat tiles, each with its caveat. Shared by /reflex and /. */
export function StatTiles() {
  const { evidence } = REFLEX_CONTENT;

  return (
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
  );
}
