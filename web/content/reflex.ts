import phase0Data from "./reflex-phase0.json";

export const REFLEX_CONTENT = {
  hero: {
    descriptor: "GARGI REFLEX · AUTONOMOUS MODEL CACHING FOR LLM CALLS",
    title: "Make every LLM call",
    titleAccent: "swappable.",
    sub: "Build on Jev, Laya, GPT, Claude or Gemini. Gargi Reflex learns from every answer your model gives, trains a small model on the repetitive ones, and swaps it in once it can prove it agrees. Seconds become milliseconds, and the cost per call drops to zero. The frontier model stays the fallback for everything new or hard.",
    pipCommand: "pip install gargi",
    seeResearch: "See the research →",
    callStreamTitle: "route_intent · live calls",
    stateLabel: "assist",
    callStreamRows: [
      { tag: "REFLEX", label: "card_arrival", latency: "5 ms", type: "student" },
      { tag: "REFLEX", label: "exchange_rate", latency: "5 ms", type: "student" },
      { tag: "HOLDOUT", label: "compromised_card", latency: "3,600 ms", type: "holdout" },
      { tag: "REFLEX", label: "top_up_failed", latency: "5 ms", type: "student" },
      { tag: "LLM", label: "why_verify_identity · low confidence", latency: "3,600 ms", type: "teacher" },
    ],
    chartLegend: [
      { label: "Served locally", colorToken: "--student" },
      { label: "Holdout agreement", colorToken: "--holdout" },
    ],
    chartCaveat: "Banking77 end-to-end demo · stub teacher · laptop CPU · 13,082 calls",
  },

  problem: {
    cards: [
      {
        num: "01",
        title: "You pay full price for the same answer, again.",
        body: "Routing, intent, moderation, extraction: near-identical questions, thousands of times a day.",
        caveat: null,
      },
      {
        num: "02",
        title: "Every call waits on a round trip.",
        body: "We measured 3.6 s median for a hosted model.",
        caveat: "Vertex AI Gemini Flash · n=30",
      },
      {
        num: "03",
        title: "Someone else’s outage is your outage.",
        body: "Rate limits and API downtime land on your users.",
        caveat: null,
      },
    ],
  },

  loop: {
    eyebrow: "WHAT IT AUTOMATES",
    title: "A loop, not a funnel.",
    sub: "Each step is something a data scientist would otherwise do by hand.",
    steps: [
      {
        num: "01",
        name: "Collect",
        colorClass: "teacher",
        text: "Every call goes to your LLM as today. Gargi logs the input and the typed answer. Or import months of history in minutes.",
      },
      {
        num: "02",
        name: "Train",
        colorClass: "normal",
        text: "It builds a small model (frozen sentence encoder + one head per field) on CPU, in minutes, and calibrates its confidence.",
      },
      {
        num: "03",
        name: "Prove",
        colorClass: "normal",
        text: "It tests the model on data it never trained on. No pass, no swap.",
      },
      {
        num: "04",
        name: "Shadow",
        colorClass: "muted",
        text: "The model predicts next to the LLM on live traffic. Nothing user-visible changes.",
      },
      {
        num: "05",
        name: "Swap",
        colorClass: "student",
        text: "Calls where every field clears the confidence bar are served locally. Everything else, plus a permanent holdout slice, still goes to the LLM.",
      },
      {
        num: "06",
        name: "Watch",
        colorClass: "muted",
        text: "The holdout slice keeps measuring. If agreement drops more than 5 points, the decision goes back to the LLM on the spot.",
      },
    ],
    routerEyebrow: "PER-CALL ROUTER",
    routerNodes: ["request", "reflex", "every field confident?"],
    routerOutputs: {
      yes: {
        label: "yes",
        title: "serve locally",
        detail: "~5 ms · $0",
      },
      no: {
        label: "no",
        title: "LLM",
        detail: "logged, so the next model learns it",
      },
    },
  },

  gates: {
    eyebrow: "PROOF BEFORE PROMOTION",
    title: "No pass, no swap.",
    sub: "A model goes live only if, for every field, on held-out data, it clears all three gates. The whole call must also meet the agreement bar, and it never trains on its own answers.",
    table: [
      {
        gate: "Agreement on the calls it would serve",
        defaultVal: "≥ 95%",
        note: null,
      },
      {
        gate: "Calibration error",
        defaultVal: "≤ 0.05",
        note: "(its confidence means what it says)",
      },
      {
        gate: "Coverage",
        defaultVal: "≥ 30%",
        note: "(confident on enough traffic to matter)",
      },
    ],
    refusals: [
      { label: "v1 · refused", passed: false },
      { label: "v2 · refused", passed: false },
      { label: "v3 · refused", passed: false },
      { label: "v4 · passed → shadow", passed: true },
    ],
    demoNote: "In the demo, the first three training runs are refused. The model only goes live once it clears the gates.",
  },

  contract: {
    eyebrow: "THE CONTRACT",
    statement: "If anything in Gargi fails (no model, low confidence, a model that won’t load, a corrupt database, a bug), the call goes to your function, exactly once. Your exceptions propagate unchanged.",
    caveat: "Tested by injecting faults at 19 points of the request path, in every lifecycle state.",
  },

  evidence: {
    eyebrow: "THE EVIDENCE · PHASE 0",
    title: "Where it works, and where it doesn’t.",
    researchLink: "Read the full research →",
    stats: [
      {
        value: "89.0%",
        label: "of calls servable at 95% agreement",
        caveat: "Banking77 · Gemini 3.8 Flash teacher · bge-base · untouched test split · CI 85.2–92.8%",
        highlight: "student",
      },
      {
        value: "95.1%",
        label: "agreement with a stronger LLM it never saw",
        caveat: "Gemini 3.1 Pro · on the calls the student serves",
        highlight: "normal",
      },
      {
        value: "3.6 s → 5 ms",
        label: "median latency, LLM vs local",
        caveat: "Vertex AI Gemini Flash, n=30 · MiniLM on laptop CPU, 4.7 ms p50",
        highlight: "split",
      },
      {
        value: "~$51k/yr",
        label: "projected at 100k calls/day",
        caveat: "Projection · Banking77-like decision · $1.66 per 1k calls · 84.5% served locally",
        highlight: "normal",
      },
    ],
    chart: {
      title: "Share of calls a local model can serve at 95% agreement",
      subtitle: "test split",
      targetLabel: "95% target",
      rows: [
        {
          label: "Banking77 · Gemini Flash teacher",
          pct: 89.0,
          valueText: "89.0%",
          type: "student",
          badge: null,
        },
        {
          label: "Banking77 · clean-label ceiling",
          pct: 95.1,
          valueText: "95.1%",
          type: "holdout",
          badge: null,
        },
        {
          label: "Tickets · Gemini Flash teacher",
          pct: 10.5,
          valueText: "10.5%",
          type: "student",
          badge: "GATES REFUSE TO SWAP",
        },
      ],
    },
    calculatorDefaults: {
      callsPerDay: 100000,
      costPer1k: 1.66,
      shareServed: 84.5,
    },
    calculatorCaveat: "calls/day × 365 × cost per 1k ÷ 1000 × share served. Leaves out cold start, the shadow period and serving costs.",
  },

  sixWaysIn: {
    eyebrow: "SIX WAYS IN",
    title: "Keep your code. Add one line.",
    tabs: [
      {
        id: "python",
        label: "Python function",
        before: `def route_ticket(ticket: dict) -> TicketRouting:
    """Route an incoming support ticket."""
    return call_my_llm(ticket)`,
        after: `import gargi

@gargi.swappable(
    name="route_ticket",
    output=TicketRouting,
    swap=gargi.Swap(
        min_confidence=0.90,
        min_agreement=0.95,
        min_examples=200,
        holdout_rate=0.05,
    ),
)
def route_ticket(ticket: dict) -> TicketRouting:
    """Route an incoming support ticket."""
    return call_my_llm(ticket)   # untouched`,
      },
      {
        id: "instructor",
        label: "instructor",
        before: `import instructor
from openai import OpenAI

client = instructor.from_openai(OpenAI())
res = client.chat.completions.create(
    model="gpt-4o",
    response_model=TicketRouting,
    messages=[{"role": "user", "content": "I was charged twice."}],
)`,
        after: `import instructor
from openai import OpenAI
import gargi.integrations.instructor

client = gargi.integrations.instructor.wrap(instructor.from_openai(OpenAI()))
res = client.chat.completions.create(
    model="gpt-4o",
    response_model=TicketRouting,
    messages=[{"role": "user", "content": "I was charged twice."}],
    gargi_name="route_ticket",
)`,
      },
      {
        id: "pydantic-ai",
        label: "Pydantic AI",
        before: `from pydantic_ai import Agent

agent = Agent("openai:gpt-4o", result_type=TicketRouting)
result = agent.run_sync("I was charged twice.")`,
        after: `from pydantic_ai import Agent
import gargi.integrations.pydantic_ai

agent = gargi.integrations.pydantic_ai.wrap(
    Agent("openai:gpt-4o", result_type=TicketRouting),
    name="route_ticket",
)
result = agent.run_sync("I was charged twice.")`,
      },
      {
        id: "openai",
        label: "OpenAI SDK",
        before: `from openai import OpenAI, AsyncOpenAI

client = OpenAI()
res = client.chat.completions.parse(
    model="gpt-4o",
    messages=[{"role": "user", "content": "I was charged twice."}],
    response_format=TicketRouting,
)`,
        after: `from gargi.openai import OpenAI, AsyncOpenAI

client = OpenAI()
res = client.chat.completions.parse(
    model="gpt-4o",
    messages=[{"role": "user", "content": "I was charged twice."}],
    response_format=TicketRouting,
    extra_body={"gargi": {"name": "route_ticket"}},
)`,
      },
      {
        id: "anthropic",
        label: "Anthropic SDK",
        before: `from anthropic import Anthropic, AsyncAnthropic

client = Anthropic()
res = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": "I was charged twice."}],
    tools=[ticket_routing_tool],
    tool_choice={"type": "tool", "name": "route_ticket"},
)`,
        after: `from gargi.anthropic import Anthropic, AsyncAnthropic

client = Anthropic()
res = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": "I was charged twice."}],
    tools=[ticket_routing_tool],
    tool_choice={"type": "tool", "name": "route_ticket"},
    extra_body={"gargi": {"name": "route_ticket"}},
)`,
      },
      {
        id: "n8n",
        label: "Any language, n8n",
        before: `export OPENAI_BASE_URL=https://api.openai.com/v1`,
        after: `# Start proxy server
gargi proxy --host 127.0.0.1 --port 8787 --upstream https://api.openai.com/v1

# Configure environment
export OPENAI_BASE_URL=http://127.0.0.1:8787/v1`,
      },
    ],
    modelsTitle: "Works with the model you already chose.",
    modelList: ["Jev", "Laya", "OpenAI", "Anthropic", "Gemini", "any OpenAI-compatible API"],
    modelsDesc: "Jev and Laya plug in directly. Gargi doesn’t replace your model choice; it learns from whichever model you pick.",
    agentTitle: "Let your coding agent do it.",
    agentPrompt: "“Follow GARGI.md to add gargi to this repo.”",
    agentDesc: "Before that, gargi scan lists which calls in your codebase are swappable and estimates the monthly saving.",
  },

  coldStartAndHumans: {
    coldStart: {
      eyebrow: "NO COLD START",
      title: "Start from the history you already have.",
      desc: "Import traces, or replay historical inputs with a cost estimate up front. gargi readiness checks the data before you spend anything.",
      tags: ["Langfuse", "LangSmith", "Helicone", "Braintrust", "OpenTelemetry", "JSONL", "CSV"],
      code: `$ gargi readiness history.jsonl --schema TicketRouting
$ gargi import history.jsonl --name route_ticket --schema TicketRouting
# or run the teacher over past inputs
$ gargi replay --app myapp.routing --input history.jsonl`,
      statVal: "83%",
      statLabel: "coverage at 2,000 labels (61% at 500)",
      statCaveat: "Phase 0 · Banking77 · MiniLM · most of the gain comes in the first 2,000 labels",
    },
    humans: {
      eyebrow: "HUMANS WHERE THEY MATTER",
      title: "Disagreements first. Corrections count 3×.",
      desc: "gargi ui is a local, keyboard-driven review app. It shows disagreements and borderline cases first. gargi gold freeze turns corrections into a benchmark that blocks any regressing model; gargi payoff reports the savings.",
      imagePath: "/reflex/review-ui.png",
      imageAlt: "gargi ui review queue",
      shortcuts: [
        { key: "J/K", label: "move" },
        { key: "A", label: "accept LLM" },
        { key: "S", label: "accept model" },
        { key: "E", label: "edit" },
      ],
    },
  },

  vision: {
    eyebrow: "WHERE WE’RE GOING",
    badge: "ROADMAP · NOT SHIPPED",
    title: "We’re building toward a fully autonomous model cache.",
    sub: "Point it at your LLM traffic and it builds, chooses, tests, deploys and maintains the right small model for every repetitive decision, with no one tuning anything.",
    items: [
      {
        num: "01",
        title: "Automatic model selection",
        desc: "Try several small model families; keep whichever passes the gates with the most coverage.",
      },
      {
        num: "02",
        title: "Per-field serving",
        desc: "Serve the fields it’s sure of; send only the uncertain ones to the LLM.",
      },
      {
        num: "03",
        title: "Self-healing drift",
        desc: "Retrain on fresh LLM answers and re-promote once the new model passes the gates.",
      },
      {
        num: "04",
        title: "One model, many tasks",
        desc: "Fine-tune a single compact model on everything Reflex has learned across your calls.",
      },
      {
        num: "05",
        title: "An agent that runs it",
        desc: "Schedules retrains, runs model searches, watches drift, proposes promotions.",
      },
    ],
  },

  whenNotToUse: {
    eyebrow: "WHEN NOT TO USE IT",
    title: "Not every call should be swapped.",
    items: [
      {
        text: "Open-ended generation or summarisation.",
        note: "It needs a fixed, typed output.",
      },
      {
        text: "Answers that change week to week.",
        note: null,
      },
      {
        text: "Streaming or multi-step tool-calling loops.",
        note: null,
      },
      {
        text: "Decisions the LLM itself can’t answer consistently.",
        note: "Phase 0 found one; the gates refused to swap it, which is the point.",
      },
    ],
  },

  openSourceCta: {
    badge: "OPEN SOURCE · APACHE-2.0 · PYTHON · RUNS ON A LAPTOP CPU",
    title: "Make every LLM call",
    titleAccent: "swappable.",
    pipCommand: "pip install gargi",
    reproduceTitle: "Reproduce our numbers in 90 seconds:",
    reproduceCommand: "python -m examples.banking77.run_demo",
    githubLabel: "GitHub ↗",
  },
} as const;

export const DOCS = {
  intro: {
    eyebrow: "DOCS · GARGI REFLEX v0.1",
    title: "Add gargi to a repo in an afternoon.",
    sub: "The docs live on GitHub, next to the code. This page is the map: install, pick an integration path, and find the guide you need.",
    pipCommand: "pip install gargi",
    agentEyebrow: "OR TELL YOUR CODING AGENT",
    agentPrompt: "“Follow GARGI.md to add gargi to this repo.”",
  },
  quickStart: {
    eyebrow: "QUICK START",
    steps: [
      {
        num: "01",
        title: "Scan",
        code: "gargi scan . --json",
        desc: "Find swappable call sites and estimate monthly savings.",
      },
      {
        num: "02",
        title: "Wrap",
        code: "@gargi.swappable(...)",
        desc: "Or one of the five other paths below.",
      },
      {
        num: "03",
        title: "Init",
        code: "gargi init",
        desc: "Create ./.gargi/ and set GARGI_DB.",
      },
      {
        num: "04",
        title: "Train",
        code: "gargi train route_ticket",
        desc: "Gates pass → shadow. Exit 2 means a gate failed.",
      },
      {
        num: "05",
        title: "Watch",
        code: "gargi status",
        desc: "State, swap rate, agreement, p50, estimated savings.",
      },
    ],
  },
  integrationPaths: {
    eyebrow: "SIX INTEGRATION PATHS",
    githubGuideLabel: "GARGI.md ↗",
    docPath: "GARGI.md",
    paths: [
      {
        tag: "YOUR CODE TODAY",
        title: "A Python function",
        code: "@gargi.swappable(...)",
      },
      {
        tag: "YOUR CODE TODAY",
        title: "instructor",
        code: "gargi.integrations.instructor.wrap(client)",
      },
      {
        tag: "YOUR CODE TODAY",
        title: "Pydantic AI",
        code: "gargi.integrations.pydantic_ai.wrap(agent)",
      },
      {
        tag: "YOUR CODE TODAY",
        title: "OpenAI SDK",
        code: "from gargi.openai import OpenAI",
      },
      {
        tag: "YOUR CODE TODAY",
        title: "Anthropic SDK",
        code: "from gargi.anthropic import Anthropic",
      },
      {
        tag: "YOUR CODE TODAY",
        title: "Any language, n8n",
        code: "gargi proxy · OPENAI_BASE_URL",
      },
    ],
  },
  guidesAndLifecycle: {
    guidesEyebrow: "GUIDES",
    guides: [
      {
        title: "README",
        desc: "Lifecycle, promotion gates, the contract, CLI.",
        linkLabel: "README.md ↗",
        docPath: "README.md",
      },
      {
        title: "Integrating with a coding agent",
        desc: "Before/after code for all six paths.",
        linkLabel: "GARGI.md ↗",
        docPath: "GARGI.md",
      },
      {
        title: "Cold start",
        desc: "readiness, import from Langfuse and others, replay.",
        linkLabel: "docs/cold-start.md ↗",
        docPath: "docs/cold-start.md",
      },
      {
        title: "Humans in the loop",
        desc: "Review queue, gargi ui, gold sets, payoff.",
        linkLabel: "docs/human-loop.md ↗",
        docPath: "docs/human-loop.md",
      },
      {
        title: "n8n workflows",
        desc: "Swap repetitive LLM calls through the proxy.",
        linkLabel: "docs/n8n.md ↗",
        docPath: "docs/n8n.md",
      },
    ],
    lifecycleEyebrow: "LIFECYCLE",
    lifecycleRoles: [
      {
        name: "teacher",
        type: "teacher" as const,
      },
      {
        name: "shadow",
        type: "muted" as const,
      },
      {
        name: "assist",
        type: "student" as const,
      },
    ],
    lifecycleTransitions: [
      "gates pass →",
      "200 calls or 24 h →",
    ],
    resetText: "↺ drift on the holdout slice, or a new lineage → teacher",
    lifecycleItems: [
      {
        role: "teacher",
        roleClass: "teacher" as const,
        desc: "every call goes to the LLM.",
      },
      {
        role: "shadow",
        roleClass: "muted" as const,
        desc: "the LLM answers every call. The student predicts too, and both are logged.",
      },
      {
        role: "assist",
        roleClass: "student" as const,
        desc: "calls where every field clears min_confidence are served locally. Everything else, plus the holdout slice, goes to the LLM.",
      },
    ],
    reportImage: "/reflex/html-report.png",
    reportAlt: "gargi report: per-decision dashboard",
    reportCaption: "gargi report route_ticket --out report.html · local demo run",
  },
  cli: {
    eyebrow: "CLI REFERENCE",
    commands: [
      {
        cmd: "gargi scan PATH [--json] [--volume FILE]",
        desc: "Find swappable LLM call sites and estimate monthly savings",
      },
      {
        cmd: "gargi init",
        desc: "Create ./.gargi/ and print the DB path",
      },
      {
        cmd: "gargi replay --app mod[:fn] --input rows.jsonl",
        desc: "Run the teacher over historical inputs; resumable",
      },
      {
        cmd: "gargi train NAME [--no-promote] [--new-lineage]",
        desc: "Train and gate; exit 0 = passed, 2 = gates failed, 1 = error",
      },
      {
        cmd: "gargi status [NAME] [--json]",
        desc: "State, rows, swap rate, agreement, ECE, p50, estimated savings",
      },
      {
        cmd: "gargi review NAME [--limit 20]",
        desc: "Disagreements and low-confidence rows worth labelling",
      },
      {
        cmd: "gargi correct ID --field F --value V",
        desc: "Record a human label, validated against the schema",
      },
      {
        cmd: "gargi promote NAME · gargi demote NAME",
        desc: "Manual overrides; every override is recorded",
      },
      {
        cmd: "gargi report NAME --out report.html",
        desc: "Swap rate and agreement over time, savings, lifecycle",
      },
      {
        cmd: "gargi proxy [--port 8787] [--upstream URL]",
        desc: "Run an OpenAI-compatible proxy server",
      },
    ],
  },
} as const;

export { phase0Data };
