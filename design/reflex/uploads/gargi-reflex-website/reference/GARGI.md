# Integrating Gargi into a Codebase

This guide is addressed to an AI coding agent (e.g., Claude Code or Cursor). Follow these instructions to integrate gargi into a target repository.

## What Gargi Does, and When Not to Use It

Gargi logs calls to structured LLM call sites, learns from the LLM's outputs, and swaps in a fast local model once it is provably good enough. The LLM stays as the fallback if confidence is low, database is unavailable, or a call fails.

### When NOT to Use Gargi
- **Open-ended generation or summarisation:** Gargi requires a fixed, typed output schema (e.g. Pydantic BaseModel, Enum, or tool input schema).
- **Answers that change week to week:** Gargi learns patterns from historical responses. If the correct answer for the same prompt changes rapidly over time, gargi is not suitable.
- **Streaming or tool-calling loops:** Never wrap streaming calls or calls where the LLM executes interactive multi-step tool calls.

---

## Integration Steps

### Step 1: Scan the Codebase

Run `gargi scan` with `--json` to discover swappable LLM call sites and estimate potential cost savings:

```bash
gargi scan . --json
```

Optionally pass `--volume` and `--cost-per-call` to refine cost estimates:

```bash
gargi scan PATH --json --volume volume.json --cost-per-call 0.002 --swap-rate 0.6
```

### Step 2: Choose Candidate Call Sites

Select call sites that satisfy all three rules:
1. **Fixed output schema:** Uses a Pydantic `BaseModel`, `Literal`, or JSON schema output format.
2. **Repetitive:** The input prompts follow repeatable structures (e.g., ticket routing, intent classification, sentiment analysis, entity extraction).
3. **High volume:** High call count per month where local execution saves latency and cost.

### Step 3: Choose the Integration Path

Use this decision table to pick the correct integration path for each candidate call site:

| Pattern in Codebase | Integration Path | Implementation |
|---|---|---|
| Already uses `instructor` | Instructor adapter | Wrap client with `gargi.integrations.instructor.wrap(client)` |
| Uses `pydantic_ai` | Pydantic AI adapter | Wrap agent with `gargi.integrations.pydantic_ai.wrap(agent)` |
| Plain OpenAI SDK | Drop-in OpenAI client | Import `OpenAI` / `AsyncOpenAI` from `gargi.openai` |
| Plain Anthropic SDK | Drop-in Anthropic client | Import `Anthropic` / `AsyncAnthropic` from `gargi.anthropic` |
| Another language or no-code tool | Proxy mode | Point `OPENAI_BASE_URL` to `gargi proxy` |
| Custom function / generic LLM call | Runtime Decision API | Wrap function call with `gargi.decision` and `gargi.chat_input` |

### Step 4: Apply Code Edits

Apply minimal changes according to the selected path. Below are before/after pairs for all six integration paths:

#### Path 1: Custom Function (`gargi.decision` and `gargi.chat_input`)

*Before:*
```python
def route_ticket(messages: list[dict]) -> TicketRouting:
    return call_my_llm(messages)
```

*After:*
```python
import gargi

d = gargi.decision("route_ticket", TicketRouting, task="Route an incoming support ticket.")

def route_ticket(messages: list[dict]) -> TicketRouting:
    inp = gargi.chat_input(messages)
    if inp is None:
        return call_my_llm(messages)
    return d(inp, teacher=lambda: call_my_llm(messages))
```

#### Path 2: Instructor Adapter (`gargi.integrations.instructor.wrap`)

*Before:*
```python
import instructor
from openai import OpenAI

client = instructor.from_openai(OpenAI())
res = client.chat.completions.create(
    model="gpt-4o",
    response_model=TicketRouting,
    messages=[{"role": "user", "content": "I was charged twice."}],
)
```

*After:*
```python
import instructor
from openai import OpenAI
import gargi.integrations.instructor

client = gargi.integrations.instructor.wrap(instructor.from_openai(OpenAI()))
res = client.chat.completions.create(
    model="gpt-4o",
    response_model=TicketRouting,
    messages=[{"role": "user", "content": "I was charged twice."}],
    gargi_name="route_ticket",
)
```

#### Path 3: Pydantic AI Adapter (`gargi.integrations.pydantic_ai.wrap`)

*Before:*
```python
from pydantic_ai import Agent

agent = Agent("openai:gpt-4o", result_type=TicketRouting)
result = agent.run_sync("I was charged twice.")
```

*After:*
```python
from pydantic_ai import Agent
import gargi.integrations.pydantic_ai

agent = gargi.integrations.pydantic_ai.wrap(
    Agent("openai:gpt-4o", result_type=TicketRouting),
    name="route_ticket",
)
result = agent.run_sync("I was charged twice.")
```

#### Path 4: Drop-in OpenAI Client (`gargi.openai`)

*Before:*
```python
from openai import OpenAI, AsyncOpenAI

client = OpenAI()
res = client.chat.completions.parse(
    model="gpt-4o",
    messages=[{"role": "user", "content": "I was charged twice."}],
    response_format=TicketRouting,
)
```

*After:*
```python
from gargi.openai import OpenAI, AsyncOpenAI

client = OpenAI()
res = client.chat.completions.parse(
    model="gpt-4o",
    messages=[{"role": "user", "content": "I was charged twice."}],
    response_format=TicketRouting,
    extra_body={"gargi": {"name": "route_ticket"}},
)
```

#### Path 5: Drop-in Anthropic Client (`gargi.anthropic`)

*Before:*
```python
from anthropic import Anthropic, AsyncAnthropic

client = Anthropic()
res = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": "I was charged twice."}],
    tools=[ticket_routing_tool],
    tool_choice={"type": "tool", "name": "route_ticket"},
)
```

*After:*
```python
from gargi.anthropic import Anthropic, AsyncAnthropic

client = Anthropic()
res = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": "I was charged twice."}],
    tools=[ticket_routing_tool],
    tool_choice={"type": "tool", "name": "route_ticket"},
    extra_body={"gargi": {"name": "route_ticket"}},
)
```

#### Path 6: Proxy Mode (`gargi proxy`)

*Before:*
```bash
export OPENAI_BASE_URL=https://api.openai.com/v1
```

*After:*
Start the proxy server:
```bash
gargi proxy --host 127.0.0.1 --port 8787 --upstream https://api.openai.com/v1
```

Configure your application environment:
```bash
export OPENAI_BASE_URL=http://127.0.0.1:8787/v1
```

In HTTP requests or client calls, specify the decision name using the `X-Gargi-Decision` header, a `gargi:route_ticket:gpt-4o` model name prefix, or `extra_body={"gargi": {"name": "route_ticket"}}`.

---

### Step 5: Configure `GARGI_DB`

Initialize the gargi directory and set the environment variable pointing to the database:

```bash
gargi init
export GARGI_DB=./.gargi/gargi.db
```

### Step 6: Verify Integration

Run the host application once (or trigger a test call), then check gargi status:

```bash
gargi status route_ticket --json
```

Verify that the decision is registered in `teacher` state and that row counts increase as calls are logged.

---

## Explanation of the Lifecycle Loop for Users

Explain the lifecycle loop to the user after integration:

1. **Replay (Cold Start):** Populate initial training data from historical logs (see [docs/cold-start.md](docs/cold-start.md) for a detailed guide on using `gargi import` or `gargi replay`):
   ```bash
   gargi replay --app myapp.routing --input history.jsonl --limit 500 --concurrency 8
   ```
2. **Train:** Train local student heads on logged teacher outputs:
   ```bash
   gargi train route_ticket --promote
   ```
   If training passes accuracy and calibration gates, the decision automatically transitions from `teacher` to `shadow` (or `assist` if hot-swapping). You can also pass `--no-promote` or `--new-lineage` if changing encoders.
3. **Status & Review:** Check performance and review disagreements (see [docs/human-loop.md](docs/human-loop.md) for full documentation on review queues, the web interface `gargi ui`, frozen gold sets `gargi gold`, and ROI tracking `gargi payoff`):
   ```bash
   gargi status route_ticket --cost-per-call 0.002
   gargi review route_ticket --limit 20
   gargi correct DECISION_ID --field team --value technical --author admin
   ```
4. **Report & Manual Overrides:** Generate an HTML/SVG report or manually override lifecycle states:
   ```bash
   gargi report route_ticket --out report.html --svg chart.svg --cost-per-call 0.002
   gargi promote route_ticket --version v1 --to assist
   gargi allow-revert route_ticket
   gargi demote route_ticket --reason "investigating drift"
   ```

---

## Don'ts

- **Never wrap streaming or tool-calling calls:** Gargi requires complete structured responses to evaluate model confidence.
- **Never hand-edit the database:** Always use CLI commands (`gargi correct`, `gargi promote`, `gargi demote`, `gargi allow-revert`) to manage state and corrections.
- **The LLM stays the fallback:** Gargi never removes the teacher LLM; if local confidence is below threshold, database is unreachable, or an error occurs, Gargi falls back to the original LLM.
