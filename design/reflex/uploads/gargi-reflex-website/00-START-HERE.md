# Design brief package: Gargi / Gargi Reflex website

**What to design:** the website for **Gargi**, an AI infrastructure lab, launching its first
product, **Gargi Reflex**: an open-source layer that learns from the LLM calls a product already
makes, trains a small local model on the answers, proves it agrees, and swaps it in. Seconds
become milliseconds, and the cost per call drops to zero. The LLM stays the fallback.

**The one idea the site argues:**

> Let the frontier labs build the intelligence. You build the product. Gargi learns the
> repetitive part.

**Headline:** *Make every LLM call swappable.*

---

## Read in this order

1. **`01-website-brief.md`**: the full brief (mission, naming, voice, every page section with
   draft copy, the research page, charts, visual direction). It's the source of truth.
2. **`charts/png/`**: look at these to understand the research story, then redraw them in the
   site's style from `data/phase0-data.json` (or recolour `charts/svg/`, which use CSS variables).
3. **`screenshots/`**: the real product UI, to show on the site as-is.
4. **`reference/`**: background only. Pull code samples from `GARGI.md`; don't design from it.

## What to deliver

1. **Home page** (brief section 6): hero → problem → what it automates (loop diagram) → proof
   before promotion → the contract → the evidence (stat tiles + savings calculator) → six ways in
   (tabbed code) → no cold start → humans in the loop → where we're going → when not to use it →
   open-source CTA and footer.
2. **Research page** (brief section 7): a short, paper-like page built around the charts.
3. **Lab page** (brief section 9): can be simple.

Light and dark themes, responsive down to phone width.

## Non-negotiables

- **Use only the numbers in the brief** (section 4) and `data/phase0-data.json`, each with its
  caveat nearby. Don't invent metrics, testimonials, customer logos or user counts; there are none
  yet.
- **Keep "today" and "vision" visibly separate.** Autonomous retraining, automatic model selection
  and one fine-tuned model for many tasks are roadmap items and go only in the "Where we're going"
  section.
- **Keep the failure case.** The tickets result (10.5%) and "When not to use it" are deliberate
  trust signals.
- **One colour system for the three roles**, used the same everywhere (hero, diagrams, charts):
  LLM / teacher = calm blue, Reflex / student = warm orange, holdout / reference = muted grey.
- **Naming:** the lab is "Gargi"; the product is "Gargi Reflex" (not "Swappable", which is the
  signature word). The descriptor is *autonomous distillation for LLM decisions*.
- **Jev and Laya:** plain text wordmarks at the front of the "works with your model" row, no
  logos.
- **The numbers in `screenshots/html-report.png`** (82.0%, 97.5%, $9.22) come from a local demo
  run. They're fine inside the screenshot, but don't lift them into headlines.

## Package map

```
00-START-HERE.md          this file
01-website-brief.md       the full brief
data/phase0-data.json     every research number, for building charts and the calculator
charts/png/               chart previews (2x)
charts/svg/               the same charts as recolourable SVG (CSS variables)
  coverage-by-dataset     success vs failure at a glance: 89.0% / 95.1% ceiling / 10.5%
  noise-ceiling           Flash vs Pro vs dataset labels vs student, per field
  banking77-learning_curve  coverage vs number of labels
  banking77-coverage_curve  coverage vs agreement target (the dial)
  tickets-coverage_curve    the failure case
  tickets-learning_curve    more labels don't fix ambiguity
  demo-swap_rate            share served locally over the live demo (hero motif)
screenshots/
  review-ui.png           gargi ui: keyboard-driven human review queue
  html-report.png         gargi report: per-decision dashboard
reference/
  README.md               product README (lifecycle, gates, CLI)
  GARGI.md                code for all six integration paths
  phase0-RESULTS.md       the full research write-up
  human-loop.md           review queue, gold sets, ROI
  cold-start.md           importing history
```
