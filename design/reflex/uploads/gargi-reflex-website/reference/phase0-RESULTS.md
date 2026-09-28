# Phase 0 results: can a frozen encoder plus trained heads stand in for an LLM?

Issue #1 asks one question before any product work: **what share of calls can a small local model
serve while agreeing with the teacher LLM at least 95% of the time?**

**Answer:** on Banking77, **89.0%** (95% CI 85.2–92.8%) with Gemini 3.8 Flash as the teacher. On a
messier three-field support-ticket task, **~0%**: the student never reaches 95% agreement on the
whole call, because the task is ambiguous enough that two strong LLMs disagree on 42% of tickets.

**Gate verdict: proceed.** The gate needs above 60% on at least one dataset, and Banking77 clears
it by a wide margin. The tickets result is a real limit on multi-field, subjective decisions. It
points at per-field fallback (Phase 7, #8) and at checking a decision's label consistency before
swapping it. It doesn't point at the premise.

Run on 2026-09-23. Teacher: `vertex:gemini-3.8-flash`. Second teacher: `vertex:gemini-3.1-pro-preview`.
Total cost: **$29.47**.

## Headline

| | Banking77 | Tickets |
|---|---|---|
| Task | 1 field, 77 intents | 3 fields: queue (10), priority (3), type (4) |
| Rows labelled by the teacher | 13,072 (all) | 11,923 (all English rows) |
| Train / val / test | 8,979 / 1,020 / 3,073 | 9,541 / 1,238 / 1,144 |
| **Coverage at 95% agreement (test)** | **89.0%** (CI 85.2–92.8%) | **10.5%** (CI 2.8–17.2%) |
| Agreement on the calls served | 95.5% (CI 94.0–96.8%) | 90.8% (CI 84.4–100%): **misses the 95% target** |
| Encoder (picked on validation) | bge-base-en-v1.5 | all-MiniLM-L6-v2 |
| Same student trained on gold labels | 94.6% | 0.0% |

The confidence threshold is picked on the validation split to hit 95% agreement, then applied to an
untouched test split, the same way `min_confidence` is set before going live. The 95% intervals come
from 1,000 bootstrap resamples of validation and test, with the threshold re-picked each time, so
they include the noise in choosing the threshold.

![Banking77: coverage against the agreement target](banking77-coverage_curve.svg)

## Learning curve: how many labels it takes (Banking77, MiniLM, coverage at 95%)

| Teacher labels | 500 | 1,000 | 2,000 | 4,000 | 8,979 |
|---|---|---|---|---|---|
| Teacher-trained | 60.8% | 73.6% | 83.0% | 85.1% | 86.9% |
| Gold-trained (control) | 51.6% | 65.6% | 82.5% | 93.0% | 93.2% |

Most of the gain comes in the first 2,000 labels, which is the cold-start budget Phase 3 (#4) needs
to shrink. Up to about 2,000 labels the teacher-trained student matches or beats the gold-trained
one. The teacher's labels are more consistent than the dataset's, even where they're "wrong".

![Banking77 learning curve](banking77-learning_curve.svg)

## Noise ceiling: how consistent is the teacher?

1,000 test rows per dataset, relabelled by Gemini 3.1 Pro.

| | Banking77 | Tickets: queue | priority | type | whole call |
|---|---|---|---|---|---|
| Flash vs Pro | 92.7% | 82.7% | 82.4% | 85.6% | **57.7%** |
| Flash vs gold | 84.9% | 33.4% | 38.1% | 64.5% | 9.2% |
| Pro vs gold | 85.0% | 30.9% | 36.2% | 68.4% | 9.1% |
| Student vs Flash, on calls it serves | 94.9% | 96.3% | 96.3% | 96.3% | 89.9% |
| Student vs Pro, on calls it serves | **95.1%** | 93.6% | 92.7% | 96.3% | 82.6% |
| Student vs gold, on calls it serves | 89.6% | 32.1% | 45.9% | 67.9% | 12.8% |

- **Banking77:** on the calls the student serves, it agrees with the stronger Pro model (95.1%) as
  well as with its own teacher. It isn't learning Flash's quirks. It serves the calls where the
  answer is clear. Against gold it inherits the teacher's error rate: 89.6% on served calls, and
  84.9% for the teacher on everything.
- **Tickets:** each field is fairly consistent between the two LLMs (83–86%), but all three fields
  together agree only 57.7% of the time. The dataset's own labels barely match either model on
  queue and priority (about a third), so they carry little signal. That's why the gold-trained
  control reaches 0%.

## Where it fails

**Banking77.** The least-covered intents are the ones that overlap: `compromised_card` (61% covered),
`lost_or_stolen_card` (64%), `transfer_not_received_by_recipient` (65%). The top student-vs-teacher
confusions are near-synonyms: `why_verify_identity` → `verify_my_identity`, `card_arrival` →
`card_delivery_estimate`. These are ambiguous for the teacher too.

**Tickets.** Coverage collapses because a call is served only if *every* field is confident:

| Field | Student vs teacher (all test rows) | Coverage at 95%, this field alone (upper bound) |
|---|---|---|
| queue | 81–83% | 57–61% |
| priority | 82–85% | 53–55% |
| type | 85–86% | 66–70% |
| **whole call** | 59–61% | **4–11%** |

The per-field column uses a threshold picked on the test split itself, so it's an upper bound. The
honest, validation-picked whole-call figure is the headline 10.5%, and it lands at 90.8% agreement.

The confusions are the ambiguous pairs a human would argue about too: Technical Support / Product
Support / IT Support, medium ↔ low priority, Problem ↔ Incident. Adding more labels doesn't fix
this. Coverage stays at 1–19% across the learning curve.

![Tickets: coverage against the agreement target](tickets-coverage_curve.svg)

## What it means for gargi

1. **The premise holds for well-posed decisions.** A frozen encoder with trained heads can serve
   most calls of a single-field decision at 95% agreement, from a few thousand teacher labels.
2. **Whole-call serving is the bottleneck for multi-field outputs.** Per-field fallback (#8) could
   serve 53–70% of each tickets field (an upper bound; see above). It's currently a Phase 7 item.
   This result argues for moving it earlier.
3. **gargi should measure label consistency before promising a swap.** A decision whose teacher
   disagrees with a second model on 40% of calls can't be served at 95%, whatever the student. That
   check belongs in onboarding (Phase 2/3). The gates already refuse to promote such a model, which
   is the right behaviour, but users should hear why up front.

## Cost and latency if you swap a Banking77-like decision

This is a projection from the measurements above, not a production measurement.

**Measured inputs**
- Teacher cost: 712 input + 78 output tokens per call = **$0.83 per 1,000 calls** at Gemini 3.8
  Flash's promotional price, or **$1.66** at list price after 2026-12-31.
- Teacher latency (Vertex AI, sequential, n=30): **p50 3.6 s**, mean 4.0 s, p90 8.0 s.
- Student latency (laptop CPU, one input): **30 ms** with bge-base, 4.4 ms with MiniLM.
- Share served locally: 89.0% coverage × 95% (the holdout slice always goes to the LLM) = **84.5%**.

**Savings on LLM spend**

| Calls / day | LLM cost per year today (2027 list) | Saved per quarter (promo price) | Saved per quarter (2027 list) | Saved per year (2027 list) |
|---|---|---|---|---|
| 10,000 | $6,044 | $637 | $1,274 | $5,111 |
| 100,000 | $60,444 | $6,371 | $12,741 | $51,105 |
| 1,000,000 | $604,440 | $63,707 | $127,413 | $511,054 |

**Latency:** median response time falls from 3.6 s to about 30 ms, and mean from 4.0 s to 0.64 s.
The slowest ~15% of calls still go to the LLM, so p90 and above barely change.

**What the projection leaves out**
- **Cold start.** The first ~2,000–4,000 calls go to the LLM while labels build up (or come from
  `gargi replay` over history), plus the shadow period: 200 calls or 24 h, both still LLM-priced.
  Above ~10k calls a day this is under a day of traffic.
- **Serving cost.** One vCPU handles about 2.9M calls a day at 30 ms. In-process this is
  negligible; a dedicated instance costs roughly $20–40 a month.
- **Retraining** is minutes of CPU per run.
- **Tickets-like decisions save nothing today.** They don't pass the gates, and gargi keeps them on
  the LLM.

## Limitations

- **One run, one seed.** The confidence intervals cover sampling and threshold choice, not training
  variance across seeds.
- **One model family.** The teacher and the second opinion are both Gemini, so their agreement may
  overstate how consistent the task is.
- **Banking77 is a clean benchmark:** short single-intent queries, balanced classes. Production
  traffic will have a longer tail. The live holdout slice and drift demotion exist for exactly that.
- **The tickets dataset is partly synthetic, and its gold labels are weak.** The tickets result says
  more about ambiguous multi-field tasks than about this dataset's labels.
- **Agreement is measured against the teacher, not the truth.** The student is as right as the
  teacher on the calls it serves.
- **Prices** are Gemini API rates from 2026-09-22 (`experiments/phase0/teachers.py`), applied to
  measured token counts. Vertex AI bills the same models at comparable rates, and trial credit may
  cover them.

## Reproduce

```bash
pip install -e ".[train,phase0]"
export P0_TEACHER=vertex:gemini-3.8-flash P0_TEACHER_2=vertex:gemini-3.1-pro-preview   # gcloud ADC
python -m experiments.phase0.run check --teachers $P0_TEACHER,$P0_TEACHER_2
python -m experiments.phase0.run label --dataset banking77 --yes --concurrency 8
python -m experiments.phase0.run noise --dataset banking77 --yes --concurrency 6
python -m experiments.phase0.run sweep --dataset banking77
# same for --dataset tickets
```

Keep concurrency at 8 or below: at 24 per dataset (48 in total), Vertex AI throttled 38% of attempts (429
`RESOURCE_EXHAUSTED`). Full results: `experiments/phase0/out/<dataset>/gemini-3.8-flash/results.json`.
