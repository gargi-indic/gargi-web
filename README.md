# Gargi Labs

Gargi Labs makes AI products sustainable and accessible: the tools that cut cost and latency, and the infrastructure for autonomous decision making.

## Products

1. **[Gargi Reflex](/reflex)** — Autonomous model caching for LLM calls. Learns from the LLM calls your product already makes and swaps in a small local model once it can prove it agrees.
2. **Coding harness & Meta harness** (`/harness`) — The slow-thinking counterpart to Reflex: a harness for coding agents, and a meta harness that builds and tunes harnesses.
3. **Indic Language SLMs** (`/indic`) — Open small language models for Indian languages. Gargi-M1 (Malayalam, 110M) is live.

## Route Map

- `/` — Home (Reflex-first, launch film, product overview)
- `/lab` — About the lab, mission, name story, how we work, contact & support
- `/reflex` — Gargi Reflex overview
  - `/reflex/research` — Phase 0 research paper & benchmark data
  - `/reflex/docs` — Documentation and CLI reference
- `/harness` — Coding harness & Meta harness (waitlist)
- `/indic` — Indic SLMs overview
  - `/indic/models` — Gargi-M1 specification, fundamentals, and weights
  - `/indic/chat` — Live Malayalam chat interface
  - `/indic/about` — Vision, pillars, and contributors
- `/blog` — Lab notes & research updates
  - `/blog/gargi-m1-is-out` — Launch note for Gargi-M1
- `/privacy` — Privacy policy

For complete architecture and design specifications, see [PLAN.md](docs/gargi-labs/PLAN.md) and [DESIGN.md](DESIGN.md).

## Local Development

```bash
cd web
npm install
npm run dev
```

To run typecheck and build:

```bash
cd web
npm run typecheck
npm run build
```
