import { SCRIPTS } from "@/content/indic";

/**
 * The [ഗ] wordmark cycling through twelve Indic scripts -- one glyph per
 * script, stacked in a single grid cell and cross-faded on a step timer.
 * Appears at hero scale on the home and about pages.
 */
export function ScriptCycler({ className = "" }: { className?: string }) {
  return (
    <div className={`sc ${className}`} aria-label="Gargi Labs" role="img">
      <span aria-hidden>[</span>
      <span className="sc-stack" aria-hidden>
        {SCRIPTS.map((s, i) => (
          <span key={s.g} title={s.title} style={{ animationDelay: `${i * 1.1}s` }}>
            {s.g}
          </span>
        ))}
      </span>
      <span aria-hidden>]</span>
    </div>
  );
}
