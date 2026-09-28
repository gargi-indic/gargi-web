# Gargi Labs — site restructure plan

The site stops being "Gargi, the Malayalam model" and becomes **Gargi Labs**, a lab
with three products. This document is the shared spec every ticket points at. When a
ticket and this file disagree, this file wins. **How things look is defined in
[`DESIGN.md`](../../DESIGN.md)** (repo root), which overrides the colours, fonts and radii
in the `design/reflex/` mockups. The mockups still own Reflex content and section order.

## Products

| # | Product | Status | Route root | Source of content |
|---|---|---|---|---|
| 1 | **Gargi Reflex** — autonomous model caching for LLM calls | Launching | `/reflex` | `design/reflex/*.dc.html` + `design/reflex/uploads/gargi-reflex-website/` |
| 2 | **Coding harness & Meta harness** | In development | `/harness` | Placeholder copy below; a "Get notified" waitlist |
| 3 | **Indic Language SLMs** (Gargi-M1 and successors) | Live research preview | `/indic` | Everything the site has today |

## Terminology: model caching, never "distillation"

Decided 2026-09-27. "Distillation" reads as copying someone else's model, so it never appears
in visible copy, alt text, metadata or the film. Reflex is **autonomous model caching**: the LLM
answers until there's enough data, Reflex trains a small classifier on those answers, serves the
calls it's confident about, and hands everything else back. The developer does the prompt design;
Reflex does the data science.

- **Descriptor** (eyebrow, metadata description, OG): *Gargi Reflex · autonomous model caching for LLM calls*
- **Positioning line** (use once per page, near the top): *You do the prompt design. Reflex does the data science.*
- **Not a lookup cache** (use once, on `/reflex`, near "What it automates"): *Not a lookup cache. Reflex trains a model on your LLM's answers, so it handles inputs it has never seen.*
- Cache vocabulary, used consistently: **warm-up** (the LLM answers until there's enough data), **served locally / cache hit** (a confident local answer), **falls back to the LLM** (low confidence), **hit rate** = share served locally (the swap rate), **invalidated** (drift sends the call back to the LLM).
- "Teacher" and "student" stay as technical terms on `/reflex/research` and in charts only.

Replacements for the mockup copy (`design/reflex/*.dc.html` and the brief):

| Mockup text | Use instead |
|---|---|
| GARGI REFLEX · AUTONOMOUS DISTILLATION FOR LLM DECISIONS | GARGI REFLEX · AUTONOMOUS MODEL CACHING FOR LLM CALLS |
| We're building toward an autonomous distillation system. | We're building toward a fully autonomous model cache. |
| Fine-tune a single compact model on the distilled data from all your decisions. | Fine-tune a single compact model on everything Reflex has learned across your calls. |
| "Before you distill an LLM, check whether it agrees with itself." | "Before you cache an LLM's decisions, check whether it agrees with itself." |
| A weak teacher can't be distilled into a good student. | A weak teacher can't train a good student. |

## Brand

- Name everywhere: **Gargi Labs** (was "Gargi"). Product names: "Gargi Reflex", "Indic Language SLMs".
- Mark: keep the Malayalam **ഗ**. The design mockups put Devanagari गार्गी next to the
  wordmark — replace that with ഗ (set in Noto Sans Malayalam). Do not use गार्गी anywhere.
- Lockup: `[ഗ] GARGI LABS` (see DESIGN.md §4). One `Wordmark` component, with a `light`
  variant for dark or red backgrounds.
- Favicons (`web/public/icon.*`, `apple-icon.png`) already use ഗ — keep them.
- The ScriptCycler (ഗ cycling through 12 scripts) stays, but only inside `/indic`.

## Design system

**Direction A (Modernist-led), decided 2026-09-27.** Everything is in
[`DESIGN.md`](../../DESIGN.md): tokens (light + dark), Archivo + JetBrains Mono + Noto Sans
Malayalam, radius 0, 2px ink rules, the [ഗ] mark, grayscale photography. One common look for
the whole site, all three products included. There are no per-product themes.

Token names used by components: `--paper --raised --ink --ink-2 --muted --faint --line
--line-soft --accent --on-accent --inverse --on-inverse --student --teacher --holdout`,
plus `--font-display --font-sans --font-mono`. Values live only in `web/styles/tokens.css`.

## Information architecture

```
/                       Home: Reflex-first, with the launch film; other products as a short row (NEW)
/lab                    About the lab: the name, how we work, all products, contact & support (NEW)
/blog                   Lab-wide blog (unchanged content)
/blog/gargi-m1-is-out   unchanged
/privacy                unchanged

/reflex                 Reflex home          ← design/reflex/Home.dc.html
/reflex/research        Phase 0 research     ← design/reflex/Research.dc.html
/reflex/docs            Docs landing         ← design/reflex/Docs.dc.html

/harness                Coding harness & Meta harness — placeholder + waitlist (NEW)

/indic                  Indic SLMs overview  ← today's `/` (hero, languages, portrait + contact & support)
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

### Home page (`/`): Reflex first

For now the home page sells Reflex. The other two products get one short row near the
bottom and live on their own pages. Section order:

1. **Hero** (split). Headline: **Make every LLM call swappable.** Sub (max 20 words):
   *You write the prompt. Reflex learns from your LLM's answers and serves the repeat calls locally, in milliseconds.*
   Actions: the `pip install gargi` pill (copy button) and a secondary "Watch the film" link
   to the film section. Visual: the live call stream + swap-rate curve panel from
   `design/reflex/Home.dc.html` (lines 48–80), restyled per DESIGN.md.
2. **Launch film.** `web/public/reflex/film.mp4` + `film-poster.jpg` (produced separately,
   see the film ticket), 16:9, per DESIGN.md §5 "Video". Heading: *One minute, from 3.6 s to 5 ms.*
   Caption (mono): *Banking77 end-to-end demo · stub teacher · laptop CPU.*
3. **What Reflex does**, as three numbered rows (not cards):
   - **It watches.** Your typed LLM calls (routing, intent, moderation, extraction) go to your model exactly as today. Reflex logs each input and answer.
   - **It proves.** It trains a small model on CPU in minutes, then tests it on data it never saw. Unless agreement, calibration and coverage all pass, nothing is swapped.
   - **It swaps, and keeps checking.** Confident calls are served locally in about 5 ms at $0. Everything else, plus a permanent holdout slice, still goes to your LLM, which takes back over if agreement drops.
   Below: *Built for Python teams whose product asks an LLM the same kind of question thousands of times a day.*
4. **Evidence:** the four stat tiles from the mockup (89.0%, 95.1%, 3.6 s → 5 ms, ~$51k/yr), each with its caveat, then "Read the research →" (`/reflex/research`).
5. **The contract** (ink band): the fallback sentence from the mockup, plus its 19-fault-points line.
6. **Get started:** `pip install gargi`, "Reproduce our numbers in 90 seconds" command, links to `/reflex` ("Everything about Reflex →"), `/reflex/docs`, GitHub.
7. **Also from Gargi Labs:** one bordered row, two cells: Coding harness & Meta harness (*In development*, → `/harness`) and Indic Language SLMs (*Research preview · Gargi-M1 live*, → `/indic`).

### Contact & support section

Replaces the old "Research access" waitlist panel. One component, `ContactSupport`, used on
`/indic` and `/lab`: the grayscale portrait (`web/public/access-portrait.png`) on the left, a
red panel on the right with a short line and a form (name, email, "I want to" choice:
Contribute / Support the project / Ask a question / Get updates, message, Send). The old manifesto line (*"A billion people should not have to think in English…"*) is
**retired**; remove `MANIFESTO` from content.

The panel states the lab's mission (owner, 2026-09-27: make AI products sustainable and
accessible; bring the tools that cut cost and latency; support autonomous decision making).
`CONTACT_LINE` in `content/lab.ts`:

> **Tools that make AI products sustainable: lower cost, lower latency, and decisions that run on their own.**

No direct contact links (no email address, no socials) are shown. The form is the only
channel: it collects the visitor's contact details and stores them in Supabase
(`contact_messages`), listed in `/admin`. No email alerts.

### Lab copy (starting point, owner may rewrite)

- Mission (use on `/lab` and as `SITE.description`): *Gargi Labs makes AI products sustainable
  and accessible: the tools that cut cost and latency, and the infrastructure for autonomous
  decision making.*
- Lab line (footer): *Gargi Labs builds AI that proves itself before you trust it. Named for Gargi
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
