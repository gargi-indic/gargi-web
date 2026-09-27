# gargi

[![CI](https://github.com/gargi-indic/gargi-decision-harness/actions/workflows/ci.yml/badge.svg)](https://github.com/gargi-indic/gargi-decision-harness/actions/workflows/ci.yml)

Wrap an existing LLM call that returns a typed result. gargi logs every call, trains a small local
model on the LLM's answers, and swaps that model in once it is *provably* good enough. The LLM stays
as the fallback, and a permanent holdout slice keeps measuring agreement. If agreement drifts, the
decision returns to the LLM automatically.

![Share of calls served locally and agreement with the teacher on the Banking77 demo](docs/swap_rate.svg)

**Banking77 demo** (77 intents, stub teacher, laptop CPU): replay 3,000 historical queries, stream
7,000 live calls with a retrain every 1,000, then measure on the 3,080 unseen test queries.
The [.github/workflows/fresh-clone.yml](.github/workflows/fresh-clone.yml) workflow verifies this claim on a fresh CPU clone in under 10 minutes.

| | result | target |
|---|---|---|
| Calls served locally (test split) | **81.3%** | ≥ 80% |
| Agreement on the holdout slice (317 confident holdout calls since going live) | **96.2%** | ≥ 95% |
| Agreement on *every* locally served call (checked against the stub teacher) | 96.4% | |
| Local latency p50 / p95 | **4.7 ms** / 5.0 ms | < 50 ms |

`python -m examples.banking77.run_demo` reproduces this in about 90 seconds. The first three
training runs are refused by the promotion gates (covered agreement 94–95% on the training holdout
split); the student only goes live once it clears them.

## Install

```bash
pip install -e ".[train]"      # torch + transformers for training and local inference
```

The base install (`pydantic`, `typer`, `rich`, `numpy`) imports in about 50 ms and is enough to log
calls. Training and serving the student need the `train` extra.

## Let your coding agent do it

If you use Claude Code or Cursor, prompt your agent to integrate gargi into your repository:

> "Follow GARGI.md to add gargi to this repo."

See [GARGI.md](GARGI.md) for step-by-step instructions, integration decision tables, and code snippets.

## Use

```python
from typing import Literal
from pydantic import BaseModel, Field
import gargi

class TicketRouting(BaseModel):
    team: Literal["billing", "technical", "sales", "abuse"] = Field(description="Which team should own this ticket")
    urgency: int = Field(ge=1, le=5, description="1 = can wait, 5 = outage")
    needs_human: bool = Field(description="Customer is angry or threatening to churn")

@gargi.swappable(
    name="route_ticket",
    output=TicketRouting,
    swap=gargi.Swap(
        min_confidence=0.90,   # runtime gate, per call, every field
        min_agreement=0.95,    # promotion gate, on holdout
        min_examples=200,      # labelled rows before training
        holdout_rate=0.05,     # share of inputs that always go to the teacher
    ),
)
def route_ticket(ticket: dict) -> TicketRouting:
    """Route an incoming support ticket."""       # becomes the task description
    return call_my_llm(ticket)                     # your existing code, untouched

out = route_ticket(ticket)          # -> TicketRouting, exactly as before
meta = gargi.last()                 # -> DecisionMeta for this thread / task
meta.source                         # "student" | "teacher" | "holdout"
meta.confidence                     # {"team": 0.97, "urgency": 0.93, "needs_human": 0.99}
gargi.correct(meta.decision_id, team="technical")   # human label, weight 3.0 at next train
```

Then, from a separate process:

```bash
gargi replay --app myapp.routing --input history.jsonl   # cold start from historical inputs
gargi train route_ticket                                 # gates pass -> shadow
gargi status
gargi report route_ticket --out report.html
```

See [docs/cold-start.md](docs/cold-start.md) for a complete guide on bootstrapping a student model in minutes using historical traces.
See [docs/human-loop.md](docs/human-loop.md) for a guide on human review queues, the local web interface (`gargi ui`), frozen gold benchmark sets (`gargi gold`), and ROI tracking (`gargi payoff`).

Async functions and methods work too. Call `route_ticket.warmup()` at startup to load the student
up front. Otherwise it loads in a background thread and calls use the teacher until it is ready.

### The contract

If anything in gargi fails (no model, low confidence, a model that won't load, an unwritable or
corrupt database, a bug), the call goes to your function, exactly once. Exceptions raised *by* your
function propagate unchanged. `tests/test_router.py` injects faults into 19 points of the request
path, in every lifecycle state, and asserts this.

### Runtime decisions

Integrations that see a chat call at runtime, rather than a function you own, use
`gargi.decision`. It is created on first use and shared by every thread:

```python
d = gargi.decision("route_ticket", TicketRouting, task="Route an incoming support ticket.")
inp = gargi.chat_input(messages)             # None for images, tool calls, ...: call the LLM directly
out = d(inp, teacher=lambda: call_my_llm(messages)) if inp is not None else call_my_llm(messages)
```

The same contract holds: `teacher` runs exactly once whenever the student doesn't answer.
`await d.acall(inp, teacher=async_fn)` is the async form.

- **The task must be constant.** It is part of the decision's lineage, like a docstring.
- **System prompts go in the input,** not the task, because they often carry per-call data such as
  dates. A system-prompt change therefore changes which inputs count as the same, not the lineage.
- **Asking for the same name with a different schema or task** in one process raises
  `gargi.DecisionConflict`.

#### Drop-in OpenAI client

For OpenAI SDK users, `from gargi.openai import OpenAI, AsyncOpenAI` provides drop-in wrappers.
Calls to `client.chat.completions.create` and `client.chat.completions.parse` with structured output formats automatically route through gargi core:

```python
from gargi.openai import OpenAI
from pydantic import BaseModel
from typing import Literal

class TicketRouting(BaseModel):
    team: Literal["billing", "technical", "sales", "abuse"]
    urgency: int

client = OpenAI()
res = client.chat.completions.parse(
    model="gpt-4o",
    messages=[{"role": "user", "content": "I was charged twice."}],
    response_format=TicketRouting,
    extra_body={"gargi": {"name": "route_ticket"}},  # optional decision name
)
```

Unswapped calls (bypass, teacher, and fall-backs) return the official SDK's response objects directly, preserving `_request_id`, parsed arguments, and streaming chunks. Only `name` is accepted in `extra_body={"gargi": {"name": ...}}` (custom `swap` policies should be configured via `gargi.decision` in Python code).


#### Proxy mode

Start an OpenAI-compatible proxy server with:

```bash
gargi proxy --port 8787 --upstream https://api.openai.com/v1
```

Then point your OpenAI client in any language to the proxy by setting:

```bash
export OPENAI_BASE_URL=http://127.0.0.1:8787/v1
```

Decision names can be specified in three ways (in order of precedence):
1. **HTTP Header:** Set `X-Gargi-Decision: route_ticket`.
2. **Model Prefix:** Pass `"model": "gargi:route_ticket:gpt-4o"`.
3. **Body Field:** Pass `"gargi": {"name": "route_ticket"}` in the request JSON (or `extra_body={"gargi": {"name": "route_ticket"}}` in the Python SDK).

If omitted, gargi uses the schema name from `response_format`. The model prefix and `gargi` body key are always stripped before forwarding requests to the upstream server.

See [docs/n8n.md](docs/n8n.md) for how to swap repetitive LLM calls inside n8n workflows.

## Lifecycle

```
teacher --(train: gates pass)--> shadow --(200 shadow calls or 24h, agreement holds)--> assist
assist  --(drift on the holdout slice, or a new lineage)--> teacher
```

- **teacher**: every call goes to the LLM.
- **shadow**: the LLM answers every call. The student predicts too, and both are logged. Nothing
  user-visible changes.
- **assist**: calls where *every* field clears `min_confidence` are served locally. Everything else,
  plus every call whose input is in the holdout slice, goes to the LLM.
- **Drift**: each process keeps a rolling window of the last 200 confident holdout comparisons.
  If agreement falls more than 5 points below the figure the model was promoted on, the decision is
  demoted to teacher on the spot and a `lifecycle_events` row records why.
- **Lineage**: one output schema, task description (the docstring) and encoder. If any of them
  changes, a new lineage starts: its models are retired, the decision restarts in teacher mode, and
  a `lifecycle_events` row says what changed. Models, calibration and agreement figures don't carry
  over, because they only hold for the combination they were measured on.
  - *Schema*: the hash covers field names, kinds and option sets.
  - *Task*: the task is part of every input hash, so rows logged under an older docstring are
    excluded from training. Otherwise the same input could land in two splits.
  - *Encoder*: the first model of a lineage pins `GARGI_ENCODER` / `GARGI_ENCODE_TASK`. A later
    `gargi train` with other settings refuses unless you pass `--new-lineage`, so a stray env var
    can't retire a working model. Even then the switch happens only once a model on the new encoder
    passes the gates: if the encoder won't load, the data is short or the gates fail, the current
    lineage keeps serving and the new model is kept outside any lineage. Logged rows are reused,
    since they don't depend on the encoder.
  - *Old code during a deploy*: once a schema or task is replaced, a process still running it (an
    old pod) can't start a lineage of its own. It logs its calls and serves from the teacher only,
    so old and new processes don't keep resetting each other. If you went back to the old code on
    purpose, run `gargi allow-revert NAME`.
  - `gargi status` shows the current lineage and when it started. `gargi promote` refuses models
    from an earlier lineage.
- `gargi promote` / `gargi demote` override the state machine. Every override is recorded.

### Promotion gates

`gargi train` builds the dataset from teacher outputs, with human corrections overriding them at
weight 3.0. It never trains on the student's own answers: a call the student served counts only if a
human corrected it, and `train` refuses to run if a student-served row carries a teacher answer. It
splits the data 80/10/10 by input hash, trains one MLP head per field on a frozen encoder, fits a
temperature per field on the validation split, and evaluates on the holdout split.
A model is promoted only if, **for every field**:

| gate | default |
|---|---|
| agreement on covered rows (confidence ≥ `min_confidence`) | ≥ `min_agreement` (0.95) |
| expected calibration error, 15 bins | ≤ 0.05 |
| coverage | ≥ 0.30 |

For multi-field outputs the whole call must also meet `min_agreement` on covered rows, since the
router serves whole calls. When a gate fails, `train` prints the gate and the value, and the model is
kept as a `candidate`.

## CLI

| command | |
|---|---|
| `gargi scan PATH [--json] [--volume FILE] [--cost-per-call USD] [--swap-rate 0.6]` | find swappable LLM call sites and estimate monthly savings |
| `gargi init` | create `./.gargi/` and print the DB path |
| `gargi replay --app mod[:fn] --input rows.jsonl [--limit N] [--concurrency 8]` | run the teacher over historical inputs; resumable, skips inputs already logged |
| `gargi train NAME [--no-promote] [--new-lineage]` | the pipeline above; exit 0 = gates passed, 2 = gates failed, 1 = error. `--new-lineage` allows an encoder change |
| `gargi status [NAME] [--json]` | state, rows, swap rate (7 days), live and train agreement, ECE, p50, estimated savings |
| `gargi review NAME [--limit 20]` | disagreements and low-confidence rows worth labelling |
| `gargi correct ID --field F --value V` | record a human label (validated against the schema) |
| `gargi promote NAME [--version V] [--to shadow\|assist]` / `gargi demote NAME` | manual overrides |
| `gargi allow-revert NAME` | let a process running an earlier schema or task start a lineage again |
| `gargi report NAME --out report.html [--svg chart.svg]` | swap rate and agreement over time, cumulative savings, lifecycle |
| `gargi proxy [--host 127.0.0.1] [--port 8787] [--upstream URL]` | run an OpenAI-compatible proxy server |

In a JSONL replay file, each line is one call's input. For a one-argument function the line is that
argument; otherwise it is an object of keyword arguments.

### gargi scan

`gargi scan PATH` lists the LLM call sites in a codebase (OpenAI, Anthropic, instructor, Pydantic AI,
Google GenAI, LangChain) in four groups:

- **Candidates:** structured output gargi can learn: a JSON schema, a Pydantic model, or a forced tool.
- **Already wrapped:** inside a `@gargi.swappable` function.
- **Unknown:** the arguments that decide the output are built elsewhere (`**kwargs`, a config helper),
  so check by hand.
- **Not swappable:** free text, JSON without a schema, or streaming output. Each is listed with the reason.

Pass `--volume FILE` (a JSON object mapping `"path:line"` or a function name to calls per month) and
`--cost-per-call USD` to get an estimated monthly saving over the candidates (`--swap-rate`, default
0.6). `--json` prints the list for tools such as the GARGI.md agent skill.

## Supported output fields

| Pydantic type | head |
|---|---|
| `Literal[...]`, `Enum` | choice |
| `bool` | binary |
| `int` with `ge`/`le` (or `gt`/`lt`), ≤ 101 values | ordinal |
| `float` with `ge`/`le` | ordinal over 10 equal bins (predicts the bin centre) |
| nested `BaseModel` | flattened one level (`customer.tier`) |

Any other field is logged but not predicted, and the decision stays in teacher mode (whole-call
fallback only in v1).

## Configuration

| env var | default | |
|---|---|---|
| `GARGI_DB` | `./.gargi/gargi.db` | model artefacts go next to it, in `models/<name>/<version>/` |
| `GARGI_ENCODER` | `sentence-transformers/all-MiniLM-L6-v2` | frozen; any HF encoder works |
| `GARGI_ENCODE_TASK` | off | also feed the task description to the encoder (see below) |
| `GARGI_REDACT` | off | don't store input text; training then relies on cached embeddings |
| `GARGI_STATE_TTL` | `1.0` | seconds a process caches lifecycle state before re-reading it |

`Swap(...)` also takes `max_ece`, `min_coverage`, `min_class_examples`, `drift_tolerance`,
`drift_window`, `drift_min_samples`, `shadow_calls`, `shadow_hours` and `cost_per_call` (used by
`status` and `report`).

## Tests

```bash
pytest                 # 197 unit / fault-injection / CLI tests, ~10 s
pytest -m slow         # Banking77 end to end: asserts the definition of done, ~100 s
```

## Where this differs from the v1 spec, and why

- **Name.** `reflex` is taken on PyPI, so this ships as `gargi`, which was free.
- **The encoder doesn't see the task description by default.** It is still prepended in the
  serialised text, which is what gets logged and hashed. But a constant prefix gives a frozen
  mean-pooled encoder nothing to discriminate on and dilutes the input's own tokens. On Banking77,
  dropping it raised coverage at 0.8 confidence from 74% to 79% at the same agreement.
  `GARGI_ENCODE_TASK=1` restores the spec behaviour, and each model records which way it was trained.
- **The holdout slice is a fixed share of inputs, not calls**, chosen by a hash of the input salted
  with the decision name. The same input is always in or always out, so a repeated input can't be
  measured as holdout on one call and trained on through another. Training excludes every input in
  the slice, and any input ever logged as a holdout call, whatever the row's source. Raising
  `holdout_rate` only adds inputs to the slice (they're excluded from the next retrain). Lowering it
  never releases an input already measured. With very few distinct inputs the slice can be empty, and
  drift detection then has nothing to measure.
- **Whole-call gate** on top of the per-field gates (above).
- **Retraining in assist hot-swaps** to the new model without going back through shadow, within the
  same lineage. Its gates are proof enough, and drift demotion still guards it. The previous model serves until the new one
  loads. Retraining in shadow restarts the shadow evidence.
- **Shadow → assist** needs 200 shadow calls (or 24 h), at least 20 confident comparisons, and
  agreement within the drift tolerance of the promotion figure. **Drift** needs at least 100
  confident holdout comparisons before it can fire.
- **Class minimum.** Every `Literal`/`Enum`/`bool` option needs `min_class_examples` (10) rows.
  Ordinal bins only need 10 if they occur at all, since an unseen urgency level shouldn't block
  training.
- **Schema additions.** `lifecycle` (per-decision state, plus the schema and config, so the CLI can
  train without importing your code) and `embeddings` (the cache). `decisions` gains `confident`,
  `agree` and `task_hash` columns, and `lifecycle` / `models` record the lineage. A database created
  before lineages is migrated when it is opened: each decision gets one lineage for its current
  schema, task and encoder. Models that don't match are marked `legacy`, and rows logged under an
  older task get `task_hash = 'unknown'`.
- **scikit-learn is not a dependency.** ECE is a few lines of numpy.
- **The Banking77 demo uses `min_confidence=0.75`.** With 77 classes, 0.9 leaves too little coverage
  to serve 80% of calls. At 0.75 the final model still agreed with the teacher on 96.4% of the calls
  it served in the run above.

## Not in v1

Per-field fallback, free-text outputs, fine-tuning the encoder, client monkey-patching and framework
integrations, and any server or hosted component.
