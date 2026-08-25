/**
 * Generation health metrics, ported from the notebook's Step 11 checks.
 *
 * There they ran once over five fixed prompts. Here they run over every real
 * response, which turns a spot check into a continuous signal -- and it is the
 * signal that actually matters for the next training run, because it is
 * measured on the questions people genuinely ask rather than the ones we
 * thought to write down.
 *
 * Reading the numbers:
 *   malayalamScriptRatio near 0  -> collapsed to Latin/garbage
 *   distinct3gram below ~0.5     -> repetition loop
 *   charLen 0                    -> emitted EOS immediately
 */

/** Share of letters that are in the Malayalam Unicode block (U+0D00–U+0D7F). */
export function malayalamRatio(s: string): number {
  const letters = [...s].filter((c) => /\p{L}/u.test(c));
  if (letters.length === 0) return 0;
  const ml = letters.filter((c) => c >= "ഀ" && c <= "ൿ").length;
  return ml / letters.length;
}

/** Fraction of word n-grams that are unique. Low means the model is looping. */
export function distinctNGram(s: string, n = 3): number {
  const t = s.split(/\s+/).filter(Boolean);
  if (t.length < n) return 1;
  const grams = new Set<string>();
  const total = t.length - n + 1;
  for (let i = 0; i < total; i++) grams.add(t.slice(i, i + n).join(" "));
  return grams.size / total;
}

export type QualityMetrics = {
  malayalam_script_ratio: number;
  distinct_3gram: number;
  char_len: number;
  word_len: number;
};

export function scoreGeneration(text: string): QualityMetrics {
  return {
    malayalam_script_ratio: Number(malayalamRatio(text).toFixed(4)),
    distinct_3gram: Number(distinctNGram(text, 3).toFixed(4)),
    char_len: text.length,
    word_len: text.split(/\s+/).filter(Boolean).length,
  };
}
