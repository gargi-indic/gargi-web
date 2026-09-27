# Gargi Labs — site restructure plan

The site stops being "Gargi, the Malayalam model" and becomes **Gargi Labs**, a lab
with three products. This document is the shared spec every ticket points at. When a
ticket and this file disagree, this file wins; when this file and the design files in
`design/reflex/` disagree on Reflex page content, the design files win.

## Products

| # | Product | Status | Route root | Source of content |
|---|---|---|---|---|
| 1 | **Gargi Reflex** — autonomous distillation for LLM decisions | Launching | `/reflex` | `design/reflex/*.dc.html` + `design/reflex/uploads/gargi-reflex-website/` |
| 2 | **Coding harness & Meta harness** | In development | `/harness` | Placeholder copy below; a "Get notified" waitlist |
| 3 | **Indic Language SLMs** (Gargi-M1 and successors) | Live research preview | `/indic` | Everything the site has today |

## Brand

- Name everywhere: **Gargi Labs** (was "Gargi"). Product names: "Gargi Reflex", "Indic Language SLMs".
- Mark: keep the Malayalam **ഗ**. The design mockups put Devanagari गार्गी next to the
  wordmark — replace that with ഗ (set in Noto Sans Malayalam). Do not use गार्गी anywhere.
- Lockup: `ഗ` glyph (accent colour) + `Gargi Labs` in Newsreader 500. One `Wordmark`
  component, with a `light` variant for dark backgrounds.
- Favicons (`web/public/icon.*`, `apple-icon.png`) already use ഗ — keep them.
- The ScriptCycler (ഗ cycling through 12 scripts) stays, but only inside `/indic`.

## Design system

Adopt the "lab notebook" system from `design/reflex/Home.dc.html` as the default theme (lab pages, Reflex, Harness).

Tokens (put in `web/styles/tokens.css`, consumed via CSS custom properties — never hard-code hex in components):

| Token | Light | Dark | Role |
|---|---|---|---|
| `--paper` | `#f4f1e9` | `#16150f` | page background |
| `--paper-raised` | `#faf8f3` | `#1f1e19` | cards, alt sections |
| `--ink` | `#1d1c19` | `#ede9df` | text |
| `--ink-2` | `#3d3a34` | `#c9c4b8` | body copy |
| `--muted` | `#66625a` | `#a39e92` | secondary text |
| `--faint` | `#a39e92` | `#6b675f` | numbering, captions |
| `--line` | `#d9d3c6` | `#34322d` | rules/borders |
| `--line-soft` | `#e6e1d6` | `#2a2924` | inner rules |
| `--student` (Reflex, orange) | `#cf5d24` | `#ee8452` | Reflex / local / primary accent |
| `--teacher` (LLM, blue) | `#3a70bb` | `#72a0e0` | LLM / teacher |
| `--holdout` (grey) | `#8f8a80` | `#8f8a80` | holdout / reference |
| `--inverse-bg` | `#1d1c19` | `#0e0d0a` | dark bands (contract, CTA) |

Dark mode: `@media (prefers-color-scheme: dark)` on `:root`.

**Per-product themes.** Components use only the semantic token names above (plus
`--font-display`, `--font-sans`, `--font-mono`, `--radius`). The lab-notebook values are the
default theme. Each product layout sets `data-product="reflex" | "harness" | "indic"` on its
wrapper, and `tokens.css` may override tokens per product. Only the default theme is defined
for now; whether `/indic` keeps its current modernist look (Archivo, red `#ec3013`, square
corners) as a product theme is **still being decided** — do not restyle `/indic` pages yet. The three semantic colours
(student / teacher / holdout) must mean the same thing in every hero, diagram and chart.

Fonts via `next/font/google` in `web/app/layout.tsx`: **Newsreader** (headings, serif),
**Hanken Grotesk** (UI/body), **JetBrains Mono** (code and every number),
**Noto Sans Malayalam** (kept — the ഗ mark and all Malayalam text). Drop Archivo once
nothing uses it.

Layout: max-width 1240px, 48px side padding on desktop, 16px on phones, no horizontal
scroll at 375px. Every multi-column grid in the mockups collapses to one column below
~860px; stat tiles stack; code tabs become a `<select>` on phones.

## Information architecture

```
/                       Gargi Labs home — lab intro + three product cards (NEW)
/lab                    About the lab: the name, how we work, products (NEW, brief §9)
/blog                   Lab-wide blog (unchanged content)
/blog/gargi-m1-is-out   unchanged
/privacy                unchanged

/reflex                 Reflex home          ← design/reflex/Home.dc.html
/reflex/research        Phase 0 research     ← design/reflex/Research.dc.html
/reflex/docs            Docs landing         ← design/reflex/Docs.dc.html

/harness                Coding harness & Meta harness — placeholder + waitlist (NEW)

/indic                  Indic SLMs overview  ← today's `/` (hero, languages, manifesto, waitlist)
/indic/models           ← today's /models
/indic/chat             ← today's /chat
/indic/about            ← today's /about (vision, pillars, contributors)

/admin, /api/*          unchanged paths (API routes do NOT move)
```

Permanent redirects in `web/next.config.mjs`: `/models → /indic/models`,
`/chat → /indic/chat`, `/about → /indic/about`.

### Navigation

- **Global header** (every page): Wordmark → `/` · Reflex · Harness · Indic SLMs · Blog · Lab ·
  `GitHub ↗` button. Sticky, translucent paper background as in the mockup. Mobile: a
  disclosure menu.
- **Product sub-nav** (second row, only inside a product): Reflex → Overview · Research · Docs ·
  GitHub; Indic SLMs → Overview · Models · Chat · About. Current page marked with `aria-current`.
- **Global footer**: Wordmark, the lab line, links to the three products, Blog, Lab, Privacy.
- The full-screen chat (`/indic/chat`) keeps its own chrome but its brand link says Gargi Labs.

## Content

All copy and every number stay in `web/content/`, never inline in JSX (existing rule):

- `content/lab.ts` — `SITE` (name "Gargi Labs", url, description), lab line, `PRODUCTS` (the
  three cards), name story, how-we-work list.
- `content/reflex.ts` — everything on the Reflex pages. Numbers only from the brief §4 and
  `design/reflex/uploads/gargi-reflex-website/data/phase0-data.json`, each with its caveat. Import the JSON directly
  (copy it to `web/content/reflex-phase0.json`).
- `content/indic.ts` — today's `content/site.ts` minus `SITE` (M1, releases, languages, scripts, pillars, …).
- `content/site.ts` is removed once nothing imports it.

External links: `REFLEX.github` and `LAB.github` constants. The Reflex source repo
(`gargi-indic/gargi-decision-harness`) is private until launch — link to
`https://github.com/gargi-indic` for now, single constant so it's a one-line change.

### Lab copy (starting point, owner may rewrite)

- Lab line: *Gargi Labs builds AI that proves itself before you trust it. Named for Gargi
  Vachaknavi, who kept asking.*
- Product cards:
  1. **Gargi Reflex** — "Make every LLM call swappable." Learns from the LLM calls your product
     already makes and swaps in a small local model once it can prove it agrees. *Open source ·
     launching.* → `/reflex`
  2. **Coding harness & Meta harness** — "The harness around your coding agents." *In development.*
     → `/harness`
  3. **Indic Language SLMs** — "Indic models, built from scratch." Open small language models for
     Indian languages; Gargi-M1 (Malayalam, 110M) is live. *Research preview.* → `/indic`

### Harness placeholder copy

Headline "Coding harness & Meta harness". One paragraph: *The slow-thinking counterpart to
Reflex: a harness for coding agents, and a meta harness that builds and tunes harnesses. In
development.* Then the existing `WaitlistForm` with `source="harness"`. No invented features or
numbers.

## Non-negotiables (from the Reflex brief)

- Only numbers from brief §4 / `phase0-data.json`, each with its caveat nearby. No testimonials,
  logos, user counts.
- "Where we're going" roadmap items stay visibly separated from what ships today.
- Keep the failure case (tickets 10.5%) and "When not to use it".
- Never shorten the product to "Swappable" in headings or the logo.
- Figures inside `html-report.png` (82.0%, 97.5%, $9.22) are not lifted into copy.

## Engineering rules for every ticket

- Next.js 15 App Router, React 19, TypeScript, plain CSS (no Tailwind, no new UI libraries).
- Server components by default; `"use client"` only for interactive islands (copy button, tabs,
  calculator, sliders, mobile menu).
- Every page renders `<PageView page="…" />` with a unique page name.
- `npm run typecheck` and `npm run build` must pass in `web/`.
- Must work in light and dark, at 375px and 1440px widths.
- Don't touch `web/app/api/**`, `inference/`, `supabase/`, `deploy/` unless the ticket says so.
