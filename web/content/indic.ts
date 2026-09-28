/**
 * Every factual claim the site makes about Gargi models lives here.
 */

/**
 * The flagship model, as actually trained.
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
    body: `${M1.vocab} tokens of byte-level BPE trained on Malayalam alone, at ${M1.fertility}, so more real Malayalam fits inside a ${M1.context}-token window.`,
  },
  {
    n: "02",
    title: "Corpus",
    body: `1.9M documents of native Malayalam. Deduplicated, filtered by script, with every 200th document held out for validation.`,
  },
  {
    n: "03",
    title: "Architecture",
    body: `A decoder-only transformer in the GPT-2 shape: ${M1.layers} layers, ${M1.heads} heads, ${M1.dModel} dimensions. Deliberately conventional.`,
  },
  {
    n: "04",
    title: "Training",
    body: `${M1.trainingTokens} tokens to a held-out loss of ${M1.valLoss}, then instruction tuning at a tenth of the learning rate.`,
  },
  {
    n: "05",
    title: "Evaluation",
    body: `Bits-per-character, not perplexity. It is the only measure that survives a change of tokenizer. Published in full, failures included.`,
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
    params: "TBD",
    context: "TBD",
    date: "2027",
    href: null,
    status: "Planned" as const,
  },
  {
    name: "Gargi-K1",
    language: "Kannada",
    params: "TBD",
    context: "TBD",
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
    model: "TBD",
    status: "Collecting",
    live: false,
  },
  {
    glyph: "గ",
    native: "తెలుగు",
    english: "Telugu",
    speakers: "83M speakers",
    model: "TBD",
    status: "Planned",
    live: false,
  },
];

/** The 12 scripts the [ഗ] wordmark cycles through. */
export const SCRIPTS = [
  { g: "ഗ", title: "Malayalam" },
  { g: "ग", title: "Devanagari: Hindi, Marathi, Sanskrit, Nepali, Konkani, Maithili, Dogri, Bodo, Sindhi" },
  { g: "গ", title: "Bengali–Assamese" },
  { g: "గ", title: "Telugu" },
  { g: "ಗ", title: "Kannada" },
  { g: "க", title: "Tamil" },
  { g: "ગ", title: "Gujarati" },
  { g: "ଗ", title: "Odia" },
  { g: "ਗ", title: "Gurmukhi: Punjabi" },
  { g: "گ", title: "Perso-Arabic: Urdu, Kashmiri, Sindhi" },
  { g: "ᱜ", title: "Ol Chiki: Santali" },
  { g: "ꯒ", title: "Meetei Mayek: Manipuri" },
] as const;

/** /about — the four numbered pillars. */
export const PILLARS = [
  {
    n: "01",
    title: "Small models, genuinely capable",
    body: "Small models that handle Indian languages well enough to depend on, trained from the language itself, not translated into it.",
  },
  {
    n: "02",
    title: "Open source, permanently",
    body: "Weights, tokenizers, corpora and evaluation code are released as each is finished, and they stay released.",
  },
  {
    n: "03",
    title: "The whole knowledge layer",
    body: "Not just models, but the infrastructure beneath them, so information becomes reachable in any language people read, write or speak.",
  },
  {
    n: "04",
    title: "Free at the core",
    body: "The models and the language layer stay free; the tooling and systems built around them carry the business.",
  },
] as const;

export const CONTRIBUTORS = [
  { role: "Researchers", body: "Pretraining, tokenization, evaluation design for Indic scripts." },
  { role: "Engineers", body: "Training infrastructure, inference on small hardware, tooling." },
  { role: "Linguists", body: "Corpus curation, annotation standards, dialect coverage." },
  { role: "Speakers", body: "Reading model output and telling us where it is wrong." },
] as const;

/** /blog. One post for now — the launch note. */
export const POSTS = [
  {
    featured: true,
    tag: "Release",
    date: "26 August 2026",
    read: "3 min",
    slug: "gargi-m1-is-out",
    title: "Gargi-M1 is out, and here is everything that went wrong first",
    excerpt:
      `A ${M1.params} Malayalam model, trained from the language rather than translated into it. Both checkpoints open, a chat you can use right now, and an honest note on what it still cannot do, plus who I am looking for to build the rest.`,
    href: "/blog/gargi-m1-is-out",
  },
] as const;

export const VISION =
  "Every person reaching computers, and everything computers know, in their own language, through models that belong to everyone.";

export const WHY_OPEN = [
  "A model is human knowledge, compressed: trained on what millions of people wrote, spoke and handed down. It was never ours to fence off. Language and the knowledge it carries are held in common, so the models built from them must be too.",
  "What is ours to build, and to earn from, is what sits on top: the tooling, the systems, the specialized ways that knowledge gets put to work. So the order is deliberate: first, models that handle each language superbly; then, the systems built on them. The knowledge stays free. The value lives in what you make with it.",
] as const;

/** Sampling defaults, mirroring the notebook's generate(). */
export const GEN_DEFAULTS = {
  temperature: 0.8,
  topK: 50,
  maxTokens: 200,
} as const;
