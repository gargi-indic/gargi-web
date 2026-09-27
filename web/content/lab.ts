export const SITE = {
  name: "Gargi Labs",
  tagline: "Autonomous model caching & open Indic foundation models",
  description:
    "Gargi Labs makes AI products sustainable and accessible: the tools that cut cost and latency, and the infrastructure for autonomous decision making.",
  url: "https://gargi.ai",
} as const;

export const LAB_LINE =
  "Gargi Labs builds AI that proves itself before you trust it. Named for Gargi Vachaknavi, who kept asking.";

export const LAB_GITHUB = "https://github.com/gargi-indic";
export const REFLEX_GITHUB = "https://github.com/gargi-indic";

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
