/** [ഗ] GARGI LABS lockup */
export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className={`wordmark${light ? " wordmark-light" : ""}`}>
      <span className="wordmark-mark" aria-hidden>
        <span className="wordmark-bracket">[</span>
        <span className="wordmark-glyph ml">ഗ</span>
        <span className="wordmark-bracket">]</span>
      </span>
      <span className="wordmark-text">GARGI LABS</span>
    </span>
  );
}
