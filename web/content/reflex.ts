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

export const RESEARCH = {
  header: {
    eyebrow: "RESEARCH · PHASE 0",
    title: "Can a small model stand in for an LLM? Where it works, and where it doesn’t.",
    subtitle: "Phase 0, September 2026. Two datasets, two Gemini models, $29.47.",
  },

  nav: [
    { id: "q", label: "1 · The question" },
    { id: "headline", label: "2 · Headline" },
    { id: "noise", label: "3 · Flash vs Pro" },
    { id: "labels", label: "4 · How many labels" },
    { id: "dial", label: "5 · The dial" },
    { id: "fails", label: "6 · Where it fails" },
    { id: "worth", label: "7 · What it’s worth" },
    { id: "limits", label: "8 · Limitations" },
  ],

  question: {
    num: "§1",
    title: "The question",
    p1: "Before building the product, we asked one thing: what share of calls can a small local model serve while agreeing with the LLM at least 95% of the time? We decided in advance that above 60% on at least one dataset meant go, and below 40% on both meant the idea was wrong.",
    p2: "Setup. Gemini 3.8 Flash labels every row (the teacher). Gemini 3.1 Pro relabels 1,000 test rows (a second opinion). The small model is a frozen sentence encoder with a trained head per field. The confidence threshold is chosen on a validation split and then measured on an untouched test split, exactly as in production. Intervals come from 1,000 bootstrap resamples.",
    table: [
      {
        feature: "Task",
        banking77: "1 field, 77 intents",
        tickets: "3 fields: queue (10), priority (3), type (4)",
      },
      {
        feature: "Rows labelled by the LLM",
        banking77: "13,072",
        tickets: "11,923",
      },
      {
        feature: "Train / val / test",
        banking77: "8,979 / 1,020 / 3,073",
        tickets: "9,541 / 1,238 / 1,144",
      },
    ],
  },

  headline: {
    num: "§2",
    title: "It works on well-posed decisions, and says no to ambiguous ones",
    chartTitle: "Share of calls a local model can serve at 95% agreement",
    chartSub: "(test split)",
    bars: [
      {
        label: "Banking77 · Gemini Flash teacher",
        val: "89.0%",
        pct: 89.0,
        ci: "85.2–92.8%",
        color: "student",
      },
      {
        label: "Banking77 · clean-label ceiling",
        val: "95.1%",
        pct: 95.1,
        color: "holdout",
      },
      {
        label: "Tickets · Gemini Flash teacher",
        val: "10.5%",
        pct: 10.5,
        color: "student",
      },
    ],
    figureCaption: "Fig. 1 · Black rule on the first bar: 95% CI 85.2–92.8%. Dashed line: 95% target. Data: banking77.headline, tickets.headline, controls.banking77_gold_as_teacher.",
    banking77Summary: "Banking77: 89.0% of calls served at 95.5% agreement (CI 85.2–92.8%). Against a clean-label ceiling of 95.1%, the LLM’s own label noise costs about 6 points.",
    ticketsSummary: "Tickets: 10.5%, at 90.8% agreement, which misses the target. The gates would refuse to swap this decision, and should.",
  },

  noiseCeiling: {
    num: "§3",
    title: "It learns the answer, not the LLM’s quirks",
    intro: "On the calls it chooses to serve, the student agrees with Gemini Pro, a stronger model it never trained on, 95.1% of the time, as well as with its own teacher (94.9%). It isn’t copying Flash’s mistakes; it serves the calls where the answer is clear and hands the rest back. The two LLMs agree with each other 92.7% of the time on Banking77.",
    chartTitle: "How consistent is the LLM, and does the student match it?",
    pullQuote: "“Before you cache an LLM’s decisions, check whether it agrees with itself.”",
    ticketsIntro: "On tickets, each field is fairly consistent between Flash and Pro (82–86%), but all three fields together agree only 57.7% of the time, and the dataset’s own labels match either model on only about a third of queue and priority. No student can be 95% consistent with a teacher that isn’t consistent with itself.",
    figureCaption: "Fig. 2 · Student bars measured on the calls it serves (Banking77 n=855, tickets n=109). Dashed line: 95% target. Data: *.noise_ceiling.",
    legend: [
      { label: "Flash vs Pro (two LLMs)", colorClass: "teacher" },
      { label: "Flash vs dataset labels", colorClass: "holdout" },
      { label: "Student vs Flash (its teacher)", colorClass: "student" },
      { label: "Student vs Pro (never saw it)", colorClass: "student-light" },
    ],
    rows: {
      banking77: [
        {
          label: "Banking77 · intent",
          teacherVsTeacher2: 92.7,
          teacherVsGold: 84.9,
          studentVsTeacher: 94.9,
          studentVsTeacher2: 95.1,
        },
      ],
      tickets: [
        {
          label: "Tickets · queue",
          teacherVsTeacher2: 82.7,
          teacherVsGold: 33.4,
          studentVsTeacher: 96.3,
          studentVsTeacher2: 93.6,
        },
        {
          label: "Tickets · priority",
          teacherVsTeacher2: 82.4,
          teacherVsGold: 38.1,
          studentVsTeacher: 96.3,
          studentVsTeacher2: 92.7,
        },
        {
          label: "Tickets · type",
          teacherVsTeacher2: 85.6,
          teacherVsGold: 64.5,
          studentVsTeacher: 96.3,
          studentVsTeacher2: 96.3,
        },
        {
          label: "Tickets · whole call",
          teacherVsTeacher2: 57.7,
          teacherVsGold: 9.2,
          studentVsTeacher: 89.9,
          studentVsTeacher2: 82.6,
          isBold: true,
        },
      ],
    },
  },

  learningCurve: {
    num: "§4",
    title: "How many labels it takes",
    legend: [
      { label: "Coverage at 95% agreement, LLM labels", colorClass: "student" },
      { label: "Same, dataset labels (control)", colorClass: "holdout" },
    ],
    figureCaption: "Fig. 3 · Banking77 · MiniLM encoder · data: banking77.learning_curve",
    table: {
      headers: ["500", "1,000", "2,000", "4,000", "8,979"],
      teacherRow: {
        label: "Trained on LLM labels",
        values: ["60.8%", "73.6%", "83.0%", "85.1%", "86.9%"],
      },
      goldRow: {
        label: "Trained on dataset labels (control)",
        values: ["51.6%", "65.6%", "82.5%", "93.0%", "93.2%"],
      },
    },
    summary: "Most of the gain comes in the first 2,000 labels, about a day of traffic at 10k calls/day, or a one-off import of history. Up to 2,000 labels, LLM labels train a better student than the dataset’s own labels: the LLM is more consistent, even where it’s “wrong”.",
  },

  dial: {
    num: "§5",
    title: "The dial: agreement vs coverage",
    intro: "Stricter agreement means fewer calls served. Each team picks its point with one setting, min_agreement.",
    figureCaption: "Fig. 4 · Banking77, student trained on LLM labels · data: banking77.operating_points",
    points: [
      { agreement: "0.90", coverageText: "~100% served", target: 0.90 },
      { agreement: "0.95", coverageText: "89% served", target: 0.95, isDefault: true },
      { agreement: "0.97", coverageText: "83% served", target: 0.97 },
    ],
  },

  whereItFails: {
    num: "§6",
    title: "Where it fails, and what it taught us",
    figureCaption: "Fig. 5 · Tickets, whole call (3 fields) · falls below the 95% bar almost immediately · data: tickets.operating_points",
    points: [
      {
        bold: "Tickets.",
        text: "A call is served only if every field is confident. Each field alone could serve roughly 53–70% (upper bound); together, 4–11%. The confusions are pairs a human would argue about too: Technical / Product / IT Support, medium vs low priority, Problem vs Incident.",
      },
      {
        bold: "Banking77.",
        text: "The least-covered intents overlap, like compromised_card vs lost_or_stolen_card. Top confusions are near-synonyms (why_verify_identity → verify_my_identity), ambiguous for the LLM too.",
      },
      {
        bold: "Takeaways that shaped the roadmap:",
        text: "serve per field (moved earlier); measure label consistency before promising a swap.",
      },
      {
        bold: "A side probe.",
        text: "A 0.5B-parameter local model as the teacher agreed with Gemini Flash on the whole ticket only 18% of the time (38 rows; directional only). A weak teacher can’t train a good student.",
      },
    ],
  },

  economics: {
    num: "§7",
    title: "What it’s worth",
    badge: "PROJECTION",
    rows: [
      { callsPerDay: "10k", saving: "$5.1k" },
      { callsPerDay: "100k", saving: "$51k", isAccent: true },
      { callsPerDay: "1M", saving: "$511k" },
    ],
    costNote: "At list price, $1.66 per 1k calls · 84.5% served locally (89.0% coverage × 95%, holdout always goes to the LLM)",
    latency: {
      llm: "3.6 s",
      bge: "~30 ms",
      minilm: "~5 ms",
      note: "The slowest ~15% of calls still go to the LLM, so p90 barely changes.",
    },
    leavesOut: "Cold start; the shadow period; ~$20–40/month for a dedicated serving instance; retraining minutes.",
  },

  limitations: {
    num: "§8",
    title: "Limitations",
    items: [
      {
        num: "01",
        bold: "One run, one seed.",
        text: "The confidence intervals cover sampling and threshold choice, not training variance across seeds.",
      },
      {
        num: "02",
        bold: "One model family.",
        text: "The teacher and the second opinion are both Gemini, so their agreement may overstate how consistent the task is.",
      },
      {
        num: "03",
        bold: "Banking77 is a clean benchmark:",
        text: "short single-intent queries, balanced classes. Production traffic will have a longer tail. The live holdout slice and drift demotion exist for exactly that.",
      },
      {
        num: "04",
        bold: "The tickets dataset is partly synthetic, and its gold labels are weak.",
        text: "The tickets result says more about ambiguous multi-field tasks than about this dataset’s labels.",
      },
      {
        num: "05",
        bold: "Agreement is measured against the teacher, not the truth.",
        text: "The student is as right as the teacher on the calls it serves.",
      },
    ],
    reproduceTitle: "REPRODUCE",
    reproduceCmd: `pip install -e ".[train,phase0]"
export P0_TEACHER=vertex:gemini-3.8-flash P0_TEACHER_2=vertex:gemini-3.1-pro-preview
python -m experiments.phase0.run check --teachers $P0_TEACHER,$P0_TEACHER_2
python -m experiments.phase0.run label --dataset banking77 --yes --concurrency 8
python -m experiments.phase0.run noise --dataset banking77 --yes --concurrency 6
python -m experiments.phase0.run sweep --dataset banking77
# same for --dataset tickets`,
    links: [
      { label: "Raw results (phase0-data.json)", href: "/reflex-phase0.json" },
      { label: "Full write-up on GitHub ↗", href: "https://github.com/gargi-indic" },
    ],
  },
} as const;

export { phase0Data };
