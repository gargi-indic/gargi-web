# The Human Loop: Review Queues, Web Interface, Gold Benchmark Sets & ROI Tracking

Phase 4 of `gargi` turns domain expertise into an active driver of student accuracy and reliability. While automated LLM logging and background training bootstrap initial student models, human domain experts provide the high-leverage labels needed to solve hard edge cases, lock in benchmark truth, and prevent regressions.

---

## Overview & Philosophy

The human loop in `gargi` is designed for high efficiency and maximum leverage:

1. **Focused 30-Minute Sessions:** Non-engineers and domain experts sit down for short review sessions without needing Python or database knowledge.
2. **High-Leverage Edge Cases:** Smart review queues prioritize high-uncertainty predictions, student-teacher disagreements, and decision boundaries where human input changes model behavior most.
3. **Frozen Benchmark Sets:** Human corrections are snapshotted into unchanging, versioned gold sets (`gargi gold freeze`) that act as ground truth.
4. **Automated Regression Gate:** During `gargi train`, candidate student models are evaluated against frozen gold sets. If a candidate model performs worse than the currently active model on any frozen gold benchmark, promotion is automatically aborted.
5. **Immediate Impact:** Human corrections carry a $3.0\times$ sample weight during training, allowing a handful of targeted corrections to fix systematic errors and immediately boost student swap rates while blocking regressions.

---

## Smart Review Queue Sampling

`gargi` provides intelligent sampling strategies to construct review queues from logged decision traces.

### CLI Usage

To view candidates for review from the terminal:

```bash
gargi review route_ticket --limit 20 --strategy smart
```

Options:
- `NAME`: The target decision name (e.g. `route_ticket`).
- `--limit`: Maximum number of candidate items to display (default: `20`).
- `--strategy`: Sampling strategy (default: `smart`).

### 6 Sampling Strategies

`gargi` supports six distinct sampling strategies:

1. **`smart` (Composite Priority):** Calculates a composite priority score for each item based on four weighted components:
   $$\text{Priority} = \text{Disagreement Score} + \text{Threshold Band Score} + \text{Confidence Score} + \text{Class Balance Score}$$
   - **Disagreement (weight 10.0):** Items where student and teacher outputs disagree or where student agreement flag is `0`.
   - **Threshold Band (up to 3.0):** Predictions whose confidence falls near the decision swap threshold (e.g. $0.85 \pm 0.08$), where human labels have maximum leverage for model promotion.
   - **Confidence Score (up to 2.0):** Inverted model confidence score ($2.0 \times (1 - \text{confidence})$).
   - **Class Frequency (inverse square root):** Boosts underrepresented classes ($1 / \sqrt{\text{class\_count}}$).
2. **`disagreements`:** Filters strictly for items where teacher and student predictions differ, or where the student prediction failed agreement verification (`agree == 0`).
3. **`lowest_confidence`:** Orders candidates by lowest model confidence score first ($1.0 - \text{confidence}$), targeting model uncertainty.
4. **`threshold_band`:** Filters for decision items with confidence scores within $\pm 0.08$ of the swap threshold ($0.85$). These "edge-of-confidence" cases represent the decisions most likely to cross into local execution upon retraining.
5. **`class_balanced`:** Uses round-robin selection across unique class/output labels to ensure rare output categories receive human review.
6. **`random`:** Uniform random sampling across all unreviewed predictions for unbiased auditing.

### Automatic Exclusion of Corrected Items

When `gargi` generates a review queue, it executes a SQL query that excludes any decision row that already has an entry in the `corrections` table:

```sql
WHERE d.name = ?
  AND d.student_output IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM corrections c WHERE c.decision_id = d.id)
```

This guarantees that reviewers never waste time reviewing decision calls that have already been labeled.

---

## Local Review Web Interface (`gargi ui`)

`gargi` includes a local, web-based review application designed for rapid keyboard-driven labeling.

### Starting the Web UI

To launch the review web application:

```bash
gargi ui route_ticket --port 8788 --host 127.0.0.1
```

Options:
- `NAME`: Decision name to review.
- `--port`: Port to listen on (default: `8788`).
- `--host`: Host address to bind to (default: `127.0.0.1`).

> **Note:** The web interface is self-contained and zero-dependency at the gargi core level. It uses Starlette and Uvicorn when invoked (installed via `pip install "gargi[proxy]"` or `pip install "gargi[integrations]"`).

### Keyboard Shortcuts

The web interface is fully controllable via keyboard for high-throughput review:

| Key | Action | Description |
|---|---|---|
| **`J`** | Next item | Navigate down in the review queue |
| **`K`** | Previous item | Navigate up in the review queue |
| **`A`** | Accept teacher | Select teacher output as the ground truth label |
| **`S`** | Accept student | Select student output as the ground truth label |
| **`E`** | Edit custom value | Focus text input to specify a custom label (format: `field=value`) |
| **`Space`** / **`Enter`** | Submit & next | Submit the selected correction and advance automatically to the next item |
| **`Esc`** | Cancel edit | Blur input field or clear active selection |

---

## Frozen Gold Benchmark Sets & Regression Gate

Gold sets are unchanging, versioned snapshots of human-verified labels used as permanent benchmark evaluation suites.

### Freezing Gold Sets

Freeze human corrections into a named gold benchmark set:

```bash
gargi gold freeze route_ticket --set gold_v1 --limit 100
```

CLI options:
- `NAME`: Decision name.
- `--set`: Benchmark set name (default: `default`).
- `--from-corrections / --all`: Snapshot from decisions with human corrections (default: `--from-corrections`).
- `--author`: Author or team tag (defaults to current system user).
- `--limit`: Optional maximum number of items to freeze.

### Listing Gold Sets

List all frozen gold sets for a decision:

```bash
gargi gold list route_ticket
```

Outputs set names, item counts, creation timestamps, and author tags.

### Evaluating Model Versions on Gold Sets

Evaluate any trained student model against a frozen gold set:

```bash
gargi gold eval route_ticket --set gold_v1 --version route_ticket-v2
```

Outputs overall agreement percentage and per-field accuracy break-downs against the ground-truth benchmark labels.

### Automated Regression Gate in `gargi train`

Whenever `gargi train` evaluates a candidate student model, it automatically tests the candidate against all frozen gold sets for that decision.

1. **Active Model Baseline:** `gargi train` calculates the active model's agreement on each frozen gold set.
2. **Candidate Evaluation:** It evaluates the newly trained candidate model on the same gold sets.
3. **Regression Check:** If candidate agreement on any gold set is lower than the active model's agreement, the candidate fails the promotion gates with a `regression detected on gold set <name>` failure message.
4. **Promotion Blocked:** The candidate model remains saved on disk for inspection, but automatic promotion to `shadow` or `assist` is aborted, preventing regressions from hitting production.

---

## Review Payoff Analytics & ROI Tracking

Track the real-world business impact and LLM cost savings resulting from human labeling efforts.

### CLI Usage

```bash
gargi payoff route_ticket --days 7
```

Pass `--json` to retrieve structured JSON for custom dashboards or reporting scripts:

```bash
gargi payoff route_ticket --days 7 --json
```

### ROI Metrics Explained

- **Human Correction Volume:** Tracks correction activity across time windows:
  - `today`: Human labels recorded since midnight.
  - `7d` / `30d`: Human labels recorded in the last 7 or 30 days.
  - `total`: Total human corrections recorded for this decision.
- **Swap Rate Delta:** Compares local execution swap rate before vs. after human review:
  $$\Delta \text{Swap Rate} = \text{Swap Rate}_{\text{after}} - \text{Swap Rate}_{\text{before}}$$
  Demonstrates how human corrections enable student models to pass gates and handle a higher percentage of live volume locally.
- **Estimated LLM Cost Savings:**
  - `llm_calls_saved`: Total live calls served locally by student models after human review.
  - `llm_tokens_saved`: Estimated total LLM input and output tokens saved (calculated using character-length token approximations).
  - `dollars_saved`: Estimated net financial savings based on configured `cost_per_call` (default: `$0.002` per call).
