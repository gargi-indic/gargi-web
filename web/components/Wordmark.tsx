/** [ഗ] GARGI, the lockup used in the nav and footer. */
export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <>
      <span className="wordmark-glyph" aria-hidden>
        <span className={light ? "wordmark-bracket-light" : "wordmark-bracket"}>[</span>
        <span className="ml">ഗ</span>
        <span className={light ? "wordmark-bracket-light" : "wordmark-bracket"}>]</span>
      </span>
      GARGI
    </>
  );
}
