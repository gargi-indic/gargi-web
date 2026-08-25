/**
 * Every factual claim the site makes about Gargi models lives here.
 *
 * The Claude Design mockup was drawn around a hypothetical 7.2B model with a
 * 32K context trained on 1.4T tokens. Gargi-M1 is a 110M model with a 512
 * context trained on ~1.05B tokens. The numbers below are the real ones, taken
 * from the malayalam-nanogpt-v3 training run; the prose is a starting point to
 * be rewritten. Change copy here, not in the pages.
 */

export const SITE = {
  name: "Gargi",
  tagline: "Indic language research",
  description:
    "Gargi builds open foundation models for Indian languages — trained from the language itself, not translated into it.",
  url: "https://gargi.ai",
} as const;

/**
 * The flagship model, as actually trained.
 * These are read off the published checkpoints, not the notebook's log output:
 * pretraining ran to step 21,172 (x 65,536 tokens/step = 1.39B) reaching a
 * held-out loss of 1.1887, and SFT ran to step 2,773.
 */
export const M1 = {
  id: "gargi-m1",
  name: "Gargi-M1",
  language: "Malayalam",
  params: "110M",
  paramsExact: 109_990_000,
  layers: 12,
  heads: 12,
  dModel: 768,
  context: "512",
  contextTokens: 512,
  vocab: "32,000",
  vocabSize: 32000,
  trainingTokens: "1.39B",
  valLoss: "1.189",
  fertility: "1.36 chars/token",
  license: "Apache 2.0",
  status: "Research preview",
  hf: {
    instruct: "gishnu/malayalam-nanogpt-instruct-v3-100M",
    base: "gishnu/malayalam-nanogpt-base-v3-100M",
  },
} as const;

/** The stat grid on /models. */
export const M1_STATS: { label: string; value: string; accent?: boolean }[] = [
  { label: "Parameters", value: M1.params },
  { label: "Context", value: M1.context },
  { label: "Training tokens", value: M1.trainingTokens },
  { label: "Vocabulary", value: M1.vocab },
  { label: "License", value: M1.license },
  { label: "Status", value: M1.status, accent: true },
];

/** The "Fundamentals" 01–05 sections on /models. */
export const FUNDAMENTALS = [
  {
    n: "01",
    title: "Tokenizer",
    body: `A 32,000-token byte-level BPE vocabulary trained on Malayalam text alone, never on a multilingual mix. Malayalam is agglutinative and its conjunct forms are split three or four ways by most multilingual tokenizers; this one averages 1.36 characters per token on held-out text. Fewer tokens per word means more real Malayalam inside the same context window — with a 512-token window, the tokenizer is not a detail, it is most of the budget.`,
  },
  {
    n: "02",
    title: "Corpus",
    body: `1.9 million documents and 473 million characters, from Malayalam Wikipedia and the Ultimate Malayalam Dataset. Documents below 20 characters or less than 30% Malayalam script are dropped, exact duplicates are removed by hash, and every 200th document is held out — whole documents sampled throughout the corpus rather than a slice off the end, so the validation number means something.`,
  },
  {
    n: "03",
    title: "Architecture",
    body: `A decoder-only transformer in the GPT-2 shape: ${M1.layers} layers, ${M1.heads} heads, ${M1.dModel} hidden dimensions, fused QKV projections, flash attention, learned positional embeddings and tied input/output embeddings. Deliberately conventional. At this size the novelty has to be in the data and the tokenizer, not in an architecture nobody can reproduce.`,
  },
  {
    n: "04",
    title: "Training",
    body: `Pre-trained in mixed-precision with gradient accumulation to a 65,536-token batch, a 2% linear warmup and cosine decay from 4e-4 to 4e-5, gradient clipping at 1.0 and no weight decay on biases or LayerNorm gains. ${M1.trainingTokens} tokens processed, reaching a held-out loss of ${M1.valLoss}. Instruction tuning follows at a tenth of the learning rate so the model does not forget the language while learning the format.`,
  },
  {
    n: "05",
    title: "Evaluation",
    body: `Bits-per-character rather than perplexity, because per-token perplexity is not comparable across tokenizers and this project changes them. Generation health is tracked continuously on live traffic: the share of output that is actually Malayalam script, and distinct-3gram to catch repetition loops. Both are published, failures included.`,
  },
] as const;

/** The releases table on /models. */
export const RELEASES = [
  {
    name: "Gargi-M1-Instruct",
    language: "Malayalam",
    params: "110M",
    context: "512",
    date: "Aug 2026",
    href: `https://huggingface.co/${M1.hf.instruct}`,
    status: "live" as const,
  },
  {
    name: "Gargi-M1-Base",
    language: "Malayalam",
    params: "110M",
    context: "512",
    date: "Aug 2026",
    href: `https://huggingface.co/${M1.hf.base}`,
    status: "live" as const,
  },
  {
    name: "Gargi-T1",
    language: "Tamil",
    params: "—",
    context: "—",
    date: "2027",
    href: null,
    status: "Planned" as const,
  },
  {
    name: "Gargi-K1",
    language: "Kannada",
    params: "—",
    context: "—",
    date: "2027",
    href: null,
    status: "Collecting" as const,
  },
];

/** The four-language grid on the home page. */
export const LANGUAGES = [
  {
    glyph: "ഗ",
    native: "മലയാളം",
    english: "Malayalam",
    speakers: "38M speakers",
    model: "M1 · 110M",
    status: "Live",
    live: true,
  },
  {
    glyph: "க",
    native: "தமிழ்",
    english: "Tamil",
    speakers: "79M speakers",
    model: "T1",
    status: "Planned",
    live: false,
  },
  {
    glyph: "ಗ",
    native: "ಕನ್ನಡ",
    english: "Kannada",
    speakers: "44M speakers",
    model: "—",
    status: "Collecting",
    live: false,
  },
  {
    glyph: "గ",
    native: "తెలుగు",
    english: "Telugu",
    speakers: "83M speakers",
    model: "—",
    status: "Planned",
    live: false,
  },
];

/** The 12 scripts the [ഗ] wordmark cycles through. */
export const SCRIPTS = [
  { g: "ഗ", title: "Malayalam" },
  { g: "ग", title: "Devanagari — Hindi, Marathi, Sanskrit, Nepali, Konkani, Maithili, Dogri, Bodo, Sindhi" },
  { g: "গ", title: "Bengali–Assamese" },
  { g: "గ", title: "Telugu" },
  { g: "ಗ", title: "Kannada" },
  { g: "க", title: "Tamil" },
  { g: "ગ", title: "Gujarati" },
  { g: "ଗ", title: "Odia" },
  { g: "ਗ", title: "Gurmukhi — Punjabi" },
  { g: "گ", title: "Perso-Arabic — Urdu, Kashmiri, Sindhi" },
  { g: "ᱜ", title: "Ol Chiki — Santali" },
  { g: "ꯒ", title: "Meetei Mayek — Manipuri" },
] as const;

/** /about — the four numbered pillars. */
export const PILLARS = [
  {
    n: "01",
    title: "Small models, genuinely capable",
    body: "The first job is engineering, not manifesto. We train small language models that handle Indian languages well enough to be depended on — trained from the language itself rather than translated into it, and evaluated against speakers instead of leaderboards. Small because a model that runs on modest hardware is a model that reaches people.",
  },
  {
    n: "02",
    title: "Open source, permanently",
    body: "Weights, tokenizers, corpora and evaluation code are released as each one is finished, and they stay released. This is not a staged giveaway ahead of a closed version. A language is not ours to enclose, so the models built on it are not either.",
  },
  {
    n: "03",
    title: "The whole knowledge layer",
    body: "Models are one piece. The larger aim is the knowledge infrastructure underneath them — tokenizers, corpora, retrieval, search, transliteration, evaluation — so that computers and the information inside them become reachable to people regardless of which language they read, write or speak.",
  },
  {
    n: "04",
    title: "How this sustains itself",
    body: "Right now every hour goes into building models worth open sourcing. In time, the technologies that sit around the models — deployment, tooling, domain systems — can carry the revenue, while the models and the language layer remain free. The open core is the commitment; the business is built beside it, never on top of it.",
  },
] as const;

export const CONTRIBUTORS = [
  { role: "Researchers", body: "Pretraining, tokenization, evaluation design for Indic scripts." },
  { role: "Engineers", body: "Training infrastructure, inference on small hardware, tooling." },
  { role: "Linguists", body: "Corpus curation, annotation standards, dialect coverage." },
  { role: "Speakers", body: "Reading model output and telling us where it is wrong." },
] as const;

/** /blog. Set `href` when a post actually exists. */
export const POSTS = [
  {
    featured: true,
    tag: "Release",
    date: "18 August 2026",
    read: "9 min",
    title: "Gargi-M1 is out, and here is everything that went wrong first",
    excerpt:
      "A model that was 48x undertrained, dropout fighting a problem that did not exist, and a validation split that had been flattering us the whole time. The full account of the v1 to v3 rebuild, with the loss curves that forced each change.",
    href: null,
  },
  {
    tag: "Research",
    date: "02 August 2026",
    read: "7 min",
    title: "Why 1.36 characters per token matters more than another layer",
    excerpt:
      "What a dedicated Malayalam vocabulary does to effective context length and training cost, measured against multilingual tokenizers on the same corpus.",
    href: null,
  },
  {
    tag: "Data",
    date: "21 July 2026",
    read: "11 min",
    title: "Building a Malayalam corpus without scraping the web dry",
    excerpt:
      "Where native text actually lives, why every 200th document is held out rather than the last 10%, and what deduplication found once we looked.",
    href: null,
  },
  {
    tag: "Evaluation",
    date: "30 June 2026",
    read: "8 min",
    title: "Bits per character, or you are not comparing anything",
    excerpt:
      "Per-token perplexity moves whenever the tokenizer changes, which makes it useless across runs. What we track instead, and how to run it.",
    href: null,
  },
  {
    tag: "Open source",
    date: "09 June 2026",
    read: "6 min",
    title: 'What "open forever" has to mean in practice',
    excerpt:
      "Licensing, governance and the commitments that stop an open core from quietly closing three years later.",
    href: null,
  },
] as const;

export const MANIFESTO =
  "A billion people should not have to think in English to be understood by a machine.";

/** Sampling defaults, mirroring the notebook's generate(). */
export const GEN_DEFAULTS = {
  temperature: 0.8,
  topK: 50,
  maxTokens: 200,
} as const;
