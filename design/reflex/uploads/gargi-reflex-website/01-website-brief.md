# Website brief: Gargi (the lab) and Gargi Reflex (the first product)

This is the source document for designing the Gargi website. It holds the mission, the
page-by-page content with draft copy, the research analytics and charts, the numbers we are
allowed to show (with the caveats that must travel with them), and the visual direction.

Everything factual here comes from the repository: `README.md`, `GARGI.md`,
`docs/phase0/RESULTS.md`, `docs/cold-start.md`, `docs/human-loop.md`, `docs/n8n.md`, the Phase 0
experiment outputs, and the roadmap issues.

**Files in this package** (see `00-START-HERE.md` for the full map):

| File | What it is |
|---|---|
| `website-brief.md` | This document |
| `data/phase0-data.json` | Every research number the site uses, machine-readable, for building charts |
| `charts/svg/*.svg`, `charts/png/*.png` | Reference charts (see section 8). Restyle them to the site's palette; don't change the data |
| `screenshots/` | The real review UI and HTML report |
| `reference/` | README, GARGI.md (code samples), Phase 0 write-up, human-loop and cold-start guides |

---

## 1. Mission

**Gargi is a lab.** It builds AI infrastructure that proves itself before you trust it.

### The thesis (the idea the whole site argues)

> **Let the frontier labs build the intelligence. You build the product. Gargi learns the
> repetitive part.**

Frontier models (Jev, Laya, GPT, Claude, Gemini) keep getting smarter, and developers shouldn't
compete with that. Their job is to build useful products *on top of* those models. But once a
product is live, a large share of its model calls are the same classification and routing
questions asked again and again, and every one is billed and waited on at frontier prices.

Gargi Reflex sits between your product and the frontier model. It learns from every answer the
model gives, and from every correction your team makes, and it gradually takes over the
repetitive classification workload with a small local model. The frontier model is still called
for everything new, hard or ambiguous. You keep building; the bill and the latency shrink behind
you.

The three roles, which the site's copy and visuals should keep distinct:

| Who | Does what |
|---|---|
| **Frontier model** (Jev, Laya, OpenAI, Anthropic, Gemini, …) | The intelligence. Answers everything at first, and everything hard, forever |
| **You, the developer** | The utility. Build the product; don't build or tune models |
| **Gargi Reflex** | The learning layer. Turns the repeated answers into reflexes, proves them, serves them, and hands back what it isn't sure of |

Accuracy note for the copy: Gargi learns *from* the model's answers and *from human corrections*
(a correction counts 3× in training). It doesn't independently detect the frontier model's
mistakes. It measures agreement with the model, and it flags disagreements and borderline cases
for a human. Say "learns from every answer and every correction", not "fixes the model's
mistakes".

**Gargi Reflex, the first product, automates the model work behind repetitive LLM decisions.**
Most production LLM calls answer the same kind of question again and again: which team should
own this ticket, what is this customer asking for, is this message abusive. Gargi Reflex watches
those calls, trains a small model on the LLM's answers, proves on held-out traffic that the small
model agrees, swaps it in, and keeps checking it. When it drifts, the LLM takes back over. Nobody
on your team has to become a data scientist to get there.

The result: calls that took seconds and cost money take milliseconds and cost nothing, and
the LLM is only called for the cases that actually need it.

### Where it is going (vision; say "we're building toward", never "it does")

An **autonomous distillation system**: point it at your LLM traffic and it builds, chooses,
tests, deploys and maintains the right small model for every repetitive decision, with no one
tuning anything.

1. **Automatic model selection.** For each decision, try several small model families (linear,
   gradient-boosted trees, nearest-neighbour, neural heads) and keep whichever passes the gates
   with the most coverage. *(Roadmap epic #27.)*
2. **Per-field serving.** Serve the fields it's sure of and send only the uncertain ones to the
   LLM. Phase 0 showed this is the biggest remaining unlock for multi-field decisions.
3. **Self-healing drift.** Today, drift sends a decision back to the LLM automatically. Next, it
   also retrains on the fresh LLM answers and re-promotes once the new model passes the gates,
   closing the loop without a human.
4. **One distilled model for many tasks.** Instead of a small model per decision, fine-tune a
   single compact model on the distilled data from all of your decisions, for teams whose
   decisions the frozen encoder can't reach. *(Phase 9 lists LoRA fine-tuning; the
   single-model-for-many-tasks idea is newer than the roadmap and should be added to it.)*
5. **An agent that runs it.** Scheduling retrains, running model searches, watching drift, and
   proposing promotions, with a human data scientist in the loop where you want one.

### What exists today vs what's coming (the site must keep these separate)

| Capability | Today (v0.1, open source) | Coming |
|---|---|---|
| Learn from the LLM's answers | ✅ logs every typed call | |
| Train a small model | ✅ one head per field on a frozen encoder, CPU, minutes | automatic choice among several model families |
| Prove it before it goes live | ✅ agreement, calibration and coverage gates on held-out data; shadow mode on live traffic | |
| Swap it in | ✅ automatic promotion teacher → shadow → assist | |
| Serve locally | ✅ ~5 ms p50 on a laptop CPU, $0 per call | per-field serving |
| Handle drift | ✅ permanent holdout slice; automatic fall-back to the LLM when agreement drops | automatic retrain and re-promotion |
| Retrain | manual or cron (`gargi train`) | autonomous |
| Cold start from history | ✅ import from Langfuse, LangSmith, Helicone, Braintrust, OpenTelemetry, JSONL, CSV; or replay | |
| Human review | ✅ local review UI, 3× weighted corrections, frozen gold sets that block regressions | hosted multi-user console |
| One fine-tuned model across tasks | | ✅ planned |
| Hosted / managed | | planned |

### Audience

- **Primary:** Python engineers and tech leads running LLM calls in production who have seen the
  bill, the latency or the rate limits. Typical call sites: ticket routing, intent classification,
  moderation, lead scoring, extraction into fixed fields.
- **Secondary:** engineering managers who own LLM spend; teams using n8n or other languages
  through the OpenAI-compatible proxy.

**A visitor should leave with:**
1. "My repetitive, typed LLM calls could run locally in milliseconds, for nothing, and I wouldn't
   have to build the model myself."
2. "It won't break anything. The LLM stays the fallback, and it only swaps what it can prove."
3. "These people publish where it fails. I trust their numbers."
4. The next step: `pip install gargi`, then tell their coding agent *"Follow GARGI.md to add gargi
   to this repo."*

---

## 2. Naming

### The lab: Gargi

Named after **Gargi Vachaknavi**, the philosopher of the Upanishads who, in the court of King
Janaka, kept pressing the sage Yajnavalkya with question after question about what everything
rests on. She is remembered for refusing to accept an answer she could not examine.

That is the lab's ethos, and the product already behaves this way: nothing is swapped until it
passes gates on held-out data, a slice of traffic permanently keeps asking the LLM, and the
published research leads with the dataset where the idea failed. **The lab asks the question
before it trusts the answer.** Use the story once, lightly (an "About the name" block or the
footer). Don't make the site a heritage theme.

### The product: Gargi Reflex (decided)

**Gargi Reflex.** An LLM call is slow, deliberate thought. Repeated often enough, it becomes a fast,
learned reflex, and deliberate thought takes over again when something is unfamiliar (low
confidence, holdout, drift). The name describes the whole mission, not one step, and it still fits
as the product becomes an autonomous system.

**"Swappable" is the product's signature word, not its name.** It's already the API
(`@gargi.swappable`), so it anchors the headline and the copy:

- Headline: **Make every LLM call swappable.**
- Descriptor under the logo: *Gargi Reflex · autonomous distillation for LLM decisions*
- In copy: "a swappable call", "12 of your calls are swappable" (`gargi scan`), "swap rate".

Never shorten the product to "Swappable" in headings or the logo.

### The coding harness

Give it one plain cognitive word so it reads as Reflex's sibling, chosen once its one-line pitch
is settled. Options: **Deliberate** or **Reason** (the slow-thinking counterpart to Reflex),
**Praxis** (doing), **Loom** (weaving agents, tools and code).

### Package and domain notes

- PyPI (checked 2026-09-27): `gargi`, `gargi-reflex`, `swappable`, `gargi-swappable`, `sanskara`
  and `shishya` are all **unclaimed**; `reflex` is taken. Claim the ones you want before launch.
  One option: ship `pip install gargi-reflex` with `import gargi` unchanged, and hold bare `gargi`
  for the lab.
- LICENSE: Apache-2.0 file is now in the repo root.
- Domains were not checked.

---

## 3. Voice and claim discipline

**Voice:** calm, exact, a little dry. A lab notebook, not a sales deck. Short sentences. Every
number carries its conditions. Limits are stated plainly; that is the brand's strongest trust
signal.

**Never on the site:**
- Testimonials, customer logos, "trusted by", user counts. There are none yet.
- "Enterprise-ready", SOC 2, SSO, hosted console, managed serving, autonomous retraining, one
  model for all tasks, *stated as present*. They are roadmap items; show them only in a clearly
  labelled "Where we're going" section.
- "Up to 80% of LLM calls are repetitive", "$0.005–0.03 per call", "800–2,500 ms per call". These
  appear in `first-user.md` with no source. Use the measured Phase 0 figures instead.
- "Replaces your LLM." It never does. It serves what it can prove; the LLM serves the rest.
- The 60-ticket quickstart's "100% agreement" as a headline. It's a toy demo.

---

## 4. Numbers we can show

Each is measured in the repo. The caveat must appear near the number (small print is fine).
Full data: `phase0-data.json`.

| Claim | Number | Source | Caveat that travels with it |
|---|---|---|---|
| Calls a local model can serve at 95% agreement, real LLM teacher | **89.0%** (95% CI 85.2–92.8%) | Phase 0 | Banking77 (77 intents), Gemini 3.8 Flash teacher, bge-base encoder, untouched test split |
| Agreement on those calls | **95.5%** | Phase 0 | vs the teacher |
| Agreement with a *stronger* LLM it never saw | **95.1%** | Phase 0 | Gemini 3.1 Pro, on the calls the student serves |
| Calls served locally, end-to-end demo | **81.3%** | README | Banking77, stub teacher, laptop CPU, 3,080 unseen queries; verified on a fresh clone in CI |
| Holdout agreement after going live | **96.2%** | README | 317 confident holdout calls |
| Local latency | **4.7 ms p50** / 5.0 ms p95 | README | MiniLM encoder, laptop CPU |
| LLM latency it replaces | **3.6 s p50** | Phase 0 | Vertex AI Gemini Flash, n=30 |
| Labels needed | **61% coverage at 500 labels, 83% at 2,000** | Phase 0 | Banking77, MiniLM |
| Annual LLM saving, projected | **~$51k/yr at 100k calls/day**, ~$511k at 1M/day | Phase 0 | Projection for a Banking77-like decision at $1.66 per 1k calls (Gemini Flash 2027 list), 84.5% served locally |
| Where it fails | **10.5% coverage** on a 3-field ticket task | Phase 0 | Flash and Pro agree on all three fields only 57.7% of the time; the gates correctly refuse to swap |
| Safety contract | Faults injected at **19 points**, every lifecycle state | `tests/test_router.py` | |
| Test suite | **470+ tests** | `pytest --collect-only` | |
| Research cost | **$29.47** for the full Phase 0 study | Phase 0 | |

**Savings calculator** (interactive widget):
`yearly saving ≈ calls_per_day × 365 × cost_per_1k_calls / 1000 × served_share`.
Defaults: `served_share = 0.845`, `cost_per_1k_calls = $1.66`. Let visitors change all three and
label the result "projection".

---

## 5. Site map

```
/            Home: Gargi Reflex, lab framing in header and footer
/research    Phase 0: where it works, where it fails, with charts
/vision      Where we're going (can be a home-page section at launch)
/docs        Links to GitHub (README, GARGI.md, docs/*) for launch
/lab         About Gargi: the name, how we work, the coding harness teaser
```

---

## 6. Home page, section by section

### 6.1 Header
**Gargi** wordmark. Nav: Reflex · Research · Vision · Docs · Lab · GitHub.

### 6.2 Hero
- Eyebrow: *Gargi Reflex · autonomous distillation for LLM decisions*
- Headline: **Make every LLM call swappable.**
  Alternative that leads with the thesis: **Let frontier models think. Let Gargi remember.**
- Sub: Build on Jev, Laya, GPT, Claude or Gemini. Gargi Reflex learns from every answer your model
  gives, trains a small model on the repetitive ones, and swaps it in once it can prove it agrees.
  Seconds become milliseconds, and the cost per call drops to zero. The frontier model stays the
  fallback for everything new or hard.
- Primary CTA: `pip install gargi` (copy button). Secondary: "See the research".
- Visual: a live-feeling stream of calls tagged `LLM`, `REFLEX` or `HOLDOUT`, each with its latency
  (3,600 ms vs 5 ms), and the share served locally climbing from 0% to ~81% as the state moves
  teacher → shadow → assist. `charts/demo-swap_rate.svg` is the real curve.

### 6.3 The problem (three short cards)
1. **You pay full price for the same answer, again.** Routing, intent, moderation, extraction:
   near-identical questions, thousands of times a day.
2. **Every call waits on a round trip.** We measured 3.6 s median for a hosted model.
3. **Someone else's outage is your outage.** Rate limits and API downtime land on your users.

### 6.4 What it automates (the core diagram)
Draw a loop, not a funnel. Each step is something a data scientist would otherwise do by hand:

1. **Collect.** Every call goes to your LLM as today. Gargi logs the input and the typed answer.
   Or import months of history in minutes.
2. **Train.** It builds a small model (frozen sentence encoder + one head per field) on CPU, in
   minutes, and calibrates its confidence.
3. **Prove.** It tests the model on data it never trained on. No pass, no swap.
4. **Shadow.** The model predicts next to the LLM on live traffic. Nothing user-visible changes.
5. **Swap.** Calls where every field clears the confidence bar are served locally. Everything
   else, plus a permanent holdout slice, still goes to the LLM.
6. **Watch.** The holdout slice keeps measuring. If agreement drops more than 5 points, the
   decision goes back to the LLM on the spot.

Second, smaller diagram, the per-call router: `request → reflex → every field confident? → yes:
serve locally (~5 ms, $0) / no: LLM (logged, so the next model learns it)`.

### 6.5 Proof before promotion
A model goes live only if, **for every field**, on held-out data:

| Gate | Default |
|---|---|
| Agreement on the calls it would serve | ≥ 95% |
| Calibration error (its confidence means what it says) | ≤ 0.05 |
| Coverage (confident on enough traffic to matter) | ≥ 30% |

The whole call must also meet the agreement bar, and it never trains on its own answers. Line:
*"In the demo, the first three training runs are refused. The model only goes live once it
clears the gates."*

### 6.6 The contract
Large, quiet statement:

> If anything in Gargi fails (no model, low confidence, a model that won't load, a corrupt
> database, a bug), the call goes to your function, exactly once. Your exceptions propagate
> unchanged.

Small print: tested by injecting faults at 19 points of the request path, in every lifecycle state.

### 6.7 The evidence (short version of `/research`)
Four stat tiles, each with its caveat: **89.0%** of calls servable at 95% agreement · **95.1%**
agreement with a stronger LLM it never saw · **3.6 s → 5 ms** · **~$51k/yr** projected at 100k
calls/day. Below: `charts/coverage-by-dataset.svg` (it shows the success *and* the failure in
one glance), then the savings calculator, then "Read the full research →".

### 6.8 Six ways in
Tabbed before/after code, from `GARGI.md`:

| Your code today | Change |
|---|---|
| A Python function | `@gargi.swappable(...)` decorator (default tab; the README sample) |
| `instructor` | `gargi.integrations.instructor.wrap(client)` |
| Pydantic AI | `gargi.integrations.pydantic_ai.wrap(agent)` |
| OpenAI SDK | `from gargi.openai import OpenAI` |
| Anthropic SDK | `from gargi.anthropic import Anthropic` |
| Any language, n8n | `gargi proxy`, then change `OPENAI_BASE_URL` |

**Works with the model you already chose.** A row of provider marks, with **Jev** and **Laya**
first: *"Jev and Laya plug in directly."* Anything that speaks the OpenAI-compatible API works
through the drop-in client or `gargi proxy` (point it at the provider as `--upstream`), and the
Anthropic SDK has its own drop-in. Gargi doesn't replace your model choice; it learns from
whichever model you pick. (Switching teacher models mid-lineage mixes their labels; the promotion
gates still apply, so it only matters if the two models disagree.)

> **For now:** show Jev and Laya as plain text wordmarks at the front of the provider row (no
> logos), with the line "Jev and Laya plug in directly." Details on both will follow; leave room
> to give them more prominence later.

Callout: **Let your coding agent do it.** *"Follow GARGI.md to add gargi to this repo."* Before
that, `gargi scan` lists which calls in your codebase are swappable and estimates the monthly
saving.

### 6.9 No cold start
Import traces from Langfuse, LangSmith, Helicone, Braintrust, OpenTelemetry, JSONL or CSV
(`gargi import`), or replay historical inputs with a cost estimate up front (`gargi replay`).
`gargi readiness` checks the data before you spend anything. Phase 0: most of the gain comes in
the first 2,000 labels.

### 6.10 Humans where they matter
`gargi ui`: a local, keyboard-driven review app (J/K move, A/S accept LLM or model, E edit). It
shows disagreements and borderline cases first. A correction counts 3× in the next training run.
`gargi gold freeze` turns corrections into a benchmark that blocks any regressing model.
`gargi payoff` reports the savings. Screenshot: `screenshots/review-ui.png`.

### 6.11 Where we're going
Short version of the vision (section 1), clearly labelled as the roadmap: automatic model
selection · per-field serving · self-healing drift (retrain and re-promote) · one fine-tuned model
across all your decisions · an agent that runs it. Visual: the loop from 6.4 with the manual steps
(retrain, choose model) lighting up as "autonomous".

### 6.12 When not to use it (keep it; it builds trust)
- Open-ended generation or summarisation. It needs a fixed, typed output.
- Answers that change week to week.
- Streaming or multi-step tool-calling loops.
- Decisions the LLM itself can't answer consistently. Phase 0 found one; the gates refused to
  swap it, which is the point.

### 6.13 Open source + footer
Apache-2.0, Python, runs on a laptop CPU. `pip install gargi` · GitHub · "Reproduce our numbers in
90 seconds: `python -m examples.banking77.run_demo`". Footer: *Gargi is a lab building AI
infrastructure that proves itself. Named for Gargi Vachaknavi, who kept asking.*

---

## 7. Research page (`/research`)

Title: **Can a small model stand in for an LLM? Where it works, and where it doesn't.**
Subtitle: *Phase 0, September 2026. Two datasets, two Gemini models, $29.47.*

Structure it as a short paper. Each subsection names its chart (section 8) and data key in
`phase0-data.json`.

### 7.1 The question
Before building the product, we asked one thing: what share of calls can a small local model serve
while agreeing with the LLM at least 95% of the time? We decided in advance that above 60% on at
least one dataset meant go, and below 40% on both meant the idea was wrong.

**Setup** (a small diagram or spec list): Gemini 3.8 Flash labels every row (the teacher). Gemini
3.1 Pro relabels 1,000 test rows (a second opinion). The small model is a frozen sentence encoder
with a trained head per field. The confidence threshold is chosen on a validation split and then
measured on an untouched test split, exactly as in production. Intervals come from 1,000 bootstrap
resamples.

| | Banking77 | Support tickets |
|---|---|---|
| Task | 1 field, 77 intents | 3 fields: queue (10), priority (3), type (4) |
| Rows labelled by the LLM | 13,072 | 11,923 |
| Train / val / test | 8,979 / 1,020 / 3,073 | 9,541 / 1,238 / 1,144 |

### 7.2 Headline: it works on well-posed decisions, and says no to ambiguous ones
Chart: `coverage-by-dataset.svg` · data: `banking77.headline`, `tickets.headline`,
`controls.banking77_gold_as_teacher`

- **Banking77: 89.0%** of calls served at 95.5% agreement (CI 85.2–92.8%). Against a clean-label
  ceiling of 95.1%, the LLM's own label noise costs about 6 points.
- **Tickets: 10.5%**, at 90.8% agreement, which misses the target. The gates would refuse to swap
  this decision, and should.

### 7.3 It learns the answer, not the LLM's quirks (Flash vs Pro)
Chart: `noise-ceiling.svg` · data: `*.noise_ceiling`

The strongest single finding for the site. On the calls it chooses to serve, the student agrees
with Gemini Pro, a stronger model it never trained on, **95.1%** of the time, as well as with its
own teacher (94.9%). It isn't copying Flash's mistakes; it serves the calls where the answer is
clear and hands the rest back. The two LLMs agree with each other 92.7% of the time on Banking77.

On tickets, each field is fairly consistent between Flash and Pro (82–86%), but all three fields
together agree only **57.7%** of the time, and the dataset's own labels match either model on only
about a third of queue and priority. No student can be 95% consistent with a teacher that isn't
consistent with itself.

Pull quote: *"Before you distill an LLM, check whether it agrees with itself."*

### 7.4 How many labels it takes
Chart: `banking77-learning_curve.svg` · data: `banking77.learning_curve`

| LLM labels | 500 | 1,000 | 2,000 | 4,000 | 8,979 |
|---|---|---|---|---|---|
| Trained on LLM labels | 60.8% | 73.6% | 83.0% | 85.1% | 86.9% |
| Trained on dataset labels (control) | 51.6% | 65.6% | 82.5% | 93.0% | 93.2% |

Most of the gain comes in the first 2,000 labels, about a day of traffic at 10k calls/day, or a
one-off import of history. Up to 2,000 labels, LLM labels train a *better* student than the
dataset's own labels: the LLM is more consistent, even where it's "wrong".

### 7.5 The dial: agreement vs coverage
Chart: `banking77-coverage_curve.svg` · data: `banking77.operating_points`

Stricter agreement means fewer calls served. On Banking77: 90% agreement → ~100% served;
95% → 89%; 97% → 83%. Each team picks its point with one setting (`min_agreement`). Good
candidate for an interactive slider.

### 7.6 Where it fails, and what it taught us
Chart: `tickets-coverage_curve.svg` · data: `tickets.per_field`, `*.least_covered_classes`,
`*.top_student_vs_teacher_confusions`

- **Tickets:** a call is served only if *every* field is confident. Each field alone could serve
  roughly 53–70% (upper bound); together, 4–11%. The confusions are pairs a human would argue about
  too: Technical / Product / IT Support, medium vs low priority, Problem vs Incident.
- **Banking77:** the least-covered intents overlap, like `compromised_card` vs
  `lost_or_stolen_card`. Top confusions are near-synonyms (`why_verify_identity` →
  `verify_my_identity`), ambiguous for the LLM too.
- **Takeaways that shaped the roadmap:** serve per field (moved earlier); measure label consistency
  before promising a swap.
- **A side probe:** a 0.5B-parameter local model as the teacher agreed with Gemini Flash on the
  whole ticket only 18% of the time (38 rows; directional only). A weak teacher can't be
  distilled into a good student. (`small_teacher_probe`)

### 7.7 What it's worth
Data: `economics_projection`. Table of yearly savings at 10k / 100k / 1M calls per day
($5.1k / $51k / $511k at list price), and latency: median 3.6 s → ~30 ms (bge-base) or ~5 ms
(MiniLM). The slowest ~15% of calls still go to the LLM, so p90 barely changes. Label everything
"projection"; list what it leaves out (cold start, the shadow period, ~$20–40/month for a
dedicated serving instance, retraining minutes).

### 7.8 Limitations and reproduce
List the limitations from `RESULTS.md` as written (one seed, one model family, Banking77 is clean,
tickets labels are weak, agreement is against the teacher not the truth). Then the reproduce
commands, and a link to the raw results.

---

## 8. Charts

All are in `charts/svg/` (source, recolourable) and `charts/png/` (previews). They use CSS custom properties with fallbacks, so the site can
recolour them by setting `--teacher`, `--student`, `--student-2`, `--gold`, `--ink`, `--muted`,
`--line`, `--a`, `--b`. Redraw them in the site's own style if you like, using `phase0-data.json`,
but keep the data exactly as it is.

| Chart | Shows | Used in |
|---|---|---|
| `coverage-by-dataset.svg` | Share servable at 95%: Banking77 89.0%, clean-label ceiling 95.1%, tickets 10.5% | Home 6.7, Research 7.2 |
| `noise-ceiling.svg` | Flash vs Pro vs dataset labels vs student, per field | Research 7.3 |
| `banking77-learning_curve.svg` | Coverage at 95% vs number of labels, LLM labels vs dataset labels | Research 7.4 |
| `banking77-coverage_curve.svg` | Coverage vs agreement target (the dial) | Research 7.5 |
| `tickets-coverage_curve.svg` | Same for tickets: never reaches 95% on the whole call | Research 7.6 |
| `tickets-learning_curve.svg` | More labels don't fix ambiguity | Research 7.6 (optional) |
| `demo-swap_rate.svg` | Share served locally and holdout agreement over the live demo | Home hero |

**Interactive ideas:** the savings calculator (6.7); an agreement-target slider on the Banking77
operating points (7.5); a toggle on the noise-ceiling chart between Banking77 and tickets.

`data/phase0-data.json` was generated from the raw experiment results; treat its numbers as final.

---

## 9. Lab page (`/lab`)

- **The name** (2–3 sentences from section 2).
- **How we work:** test the core claim before building the product (Phase 0 came first, for
  $29.47); publish the failures; the fallback is sacred; measure against held-out data only.
- **Products:** Reflex (open source, shipping) · [coding harness] (in development: one line and a
  "Get notified" field).

---

## 10. Visual direction

**Concept: the lab notebook.** Precise, editorial, calm confidence. A research paper crossed with a
well-made developer tool, not a SaaS template.

- **Type:** a serif with character for headlines, a clean grotesk for UI and body, a monospace for
  code and every number.
- **Colour:** warm off-white and ink (light), near-black and paper (dark); support both. Three
  semantic colours, used identically in the hero stream, diagrams and every chart, so visitors learn
  the system by colour:
  - **LLM / teacher**: calm blue (slow, deliberate)
  - **Reflex / student**: warm orange (fast, local)
  - **Holdout / reference**: muted grey
- **Hero motif:** the swap curve: share served locally rising while agreement holds above the 95%
  line. It's real data and it tells the whole story.
- **Diagrams:** thin-line, state-machine style. Animate only transitions (collect → train → prove
  → shadow → swap → watch, and the drift arrow back).
- **Numbers always carry their footnote** in small monospace beneath. A signature, not clutter.
- **Indic touch, sparingly:** optionally a mark derived from Devanagari गार्गी or one geometric
  motif. No mandalas, no saffron washes.
- **Code blocks are first-class:** large, readable, copy buttons, before/after toggles.
- **Mobile:** stat tiles stack, code tabs become a select, diagrams go vertical, bar charts stay
  horizontal.

**Avoid:** gradient-blob AI aesthetics, glowing brains, robots, neural-network wallpaper, fake
dashboards with invented numbers, stock photos.

---

## 11. Other assets in the repo

| Asset | Path |
|---|---|
| Code for all six integration paths | `reference/GARGI.md` |
| Lifecycle diagram (ASCII) | `reference/README.md`, "Lifecycle" |
| Full Phase 0 write-up | `reference/phase0-RESULTS.md` |
| Review UI | `screenshots/review-ui.png` |
| HTML report (per-decision dashboard) | `screenshots/html-report.png` |
