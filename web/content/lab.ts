export const SITE = {
  name: "Gargi Labs",
  tagline: "Autonomous model caching and Indic language SLMs",
  description:
    "Gargi Labs makes AI products sustainable and accessible: the tools that cut cost and latency, and the infrastructure for autonomous decision making.",
  url: "https://gargi.ai",
} as const;

export const LAB_LINE =
  "Gargi Labs builds AI that proves itself before you trust it. Named for Gargi Vachaknavi, who kept asking.";

export const CONTACT_LINE =
  "Tools that make AI products sustainable: lower cost, lower latency, and decisions that run on their own.";

export const LAB_GITHUB = "https://github.com/gargi-indic";
export const REFLEX_GITHUB = "https://github.com/gargi-indic/gargi-decision-harness";

export const PRODUCTS = [
  {
    id: "reflex",
    name: "Gargi Reflex",
    tagline: "Make every LLM call swappable.",
    description:
      "Learns from the LLM calls your product already makes and swaps in a small local model once it can prove it agrees.",
    status: "Open source · launching",
    statusType: "live" as const,
    href: "/reflex",
  },
  {
    id: "harness",
    name: "Coding harness & Meta harness",
    tagline: "The harness around your coding agents.",
    description:
      "The slow-thinking counterpart to Reflex: a harness for coding agents, and a meta harness that builds and tunes harnesses.",
    status: "In development",
    statusType: "dev" as const,
    href: "/harness",
  },
  {
    id: "indic",
    name: "Indic Language SLMs",
    tagline: "Indic models, built from scratch.",
    description:
      "Open small language models for Indian languages; Gargi-M1 (Malayalam, 110M) is live.",
    status: "Research preview",
    statusType: "preview" as const,
    href: "/indic",
  },
] as const;

export const PRODUCT_NAV = {
  reflex: [
    { id: "overview", label: "Overview", href: "/reflex" },
    { id: "research", label: "Research", href: "/reflex/research" },
    { id: "docs", label: "Docs", href: "/reflex/docs" },
    { id: "github", label: "GitHub ↗", href: REFLEX_GITHUB, external: true },
  ],
  indic: [
    { id: "overview", label: "Overview", href: "/indic" },
    { id: "models", label: "Models", href: "/indic/models" },
    { id: "chat", label: "Chat", href: "/indic/chat" },
    { id: "about", label: "About", href: "/indic/about" },
  ],
} as const;

/* ---------- Home (/) : Reflex first ---------- */
export const HOME = {
  hero: {
    descriptor: "Gargi Reflex · autonomous model caching for LLM calls",
    title: "Make every LLM call",
    titleAccent: "swappable.",
    sub: "You write the prompt. Reflex learns from your LLM's answers and serves the repeat calls locally, in milliseconds.",
    positioning: "You do the prompt design. Reflex does the data science.",
    pipCommand: "pip install gargi-reflex",
  },
  does: {
    title: "What Reflex does",
    rows: [
      {
        n: "01",
        title: "It watches.",
        body: "Your typed LLM calls (routing, intent, moderation, extraction) go to your model exactly as today. Reflex logs each input and answer.",
      },
      {
        n: "02",
        title: "It proves.",
        body: "It trains a small model on CPU in minutes, then tests it on data it never saw. Unless agreement, calibration and coverage all pass, nothing is swapped.",
      },
      {
        n: "03",
        title: "It swaps, and keeps checking.",
        body: "Confident calls are served locally in about 5 ms at $0. Everything else, plus a permanent holdout slice, still goes to your LLM, which takes back over if agreement drops.",
      },
    ],
    audience:
      "Built for Python teams whose product asks an LLM the same kind of question thousands of times a day.",
  },
  evidence: {
    title: "The evidence",
    researchLink: "Read the research →",
  },
  getStarted: {
    title: "Get started",
    pipCommand: "pip install gargi-reflex",
    reproduceTitle: "Reproduce our numbers in 90 seconds:",
    reproduceCommand: "python -m examples.banking77.run_demo",
    links: [
      { label: "Everything about Reflex →", href: "/reflex", external: false },
      { label: "Docs →", href: "/reflex/docs", external: false },
      { label: "GitHub ↗", href: REFLEX_GITHUB, external: true },
    ],
  },
  also: {
    title: "Also from Gargi Labs",
    items: [
      {
        name: "Coding harness & Meta harness",
        status: "In development",
        href: "/harness",
      },
      {
        name: "Indic Language SLMs",
        status: "Research preview · Gargi-M1 live",
        href: "/indic",
      },
    ],
  },
} as const;

/* ---------- /lab ---------- */
export const LAB_PAGE = {
  title: "The lab",
  mission: SITE.description,
  name: {
    title: "About the name",
    body: "Gargi Vachaknavi was a philosopher of the Upanishads who, in the court of King Janaka, kept pressing the sage Yajnavalkya with question after question about what everything rests on. She is remembered for refusing to accept an answer she could not examine. The lab asks the question before it trusts the answer.",
  },
  howWeWork: {
    title: "How we work",
    items: [
      {
        title: "Test the core claim before building the product.",
        body: "Before we build a product, we check on real data that the idea holds up, and say where it does not.",
      },
      {
        title: "Publish the failures.",
        body: "The research leads with the dataset where the idea did not work, not only the ones where it did.",
      },
      {
        title: "The fallback is sacred.",
        body: "When anything is uncertain or broken, the call goes back to the slower, trusted path. Exactly once, unchanged.",
      },
      {
        title: "Measure against held-out data only.",
        body: "Every number we publish comes from data the model never saw during training, and carries its conditions next to it.",
      },
    ],
  },
  products: { title: "Products" },
} as const;

/* ---------- /harness ---------- */
export const HARNESS = {
  title: "Coding harness & Meta harness",
  status: "In development",
  body: "The slow-thinking counterpart to Reflex: a harness for coding agents, and a meta harness that builds and tunes harnesses. In development.",
  waitlistLabel: "Get notified",
  waitlistCta: "Notify me",
} as const;
