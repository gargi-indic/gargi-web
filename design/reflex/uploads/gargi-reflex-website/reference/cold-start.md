# Kill the cold start: from 6 months of traces to a deployed student in 10 minutes

When migrating to `gargi`, you don't need to wait weeks to collect enough live traffic to train your first student model. If you have historical traces from your existing LLM calls (e.g. in Langfuse, LangSmith, Braintrust, Helicone, OpenTelemetry, or just CSV/JSONL files), you can cold-start a student model immediately.

This guide walks you through:
1. Validating your historical data
2. Importing traces into `gargi`
3. Estimating costs and savings
4. Training your first student model
5. Expected performance improvements

## 1. Diagnostics with `gargi readiness`

Before importing, you can check if your dataset is suitable for `gargi` using the `readiness` command:

```bash
gargi readiness path/to/history.jsonl --schema TicketRouting
```

This validates:
- Schema compliance (do historical outputs match your Pydantic schema?)
- Class balance (are there enough examples of each enum/literal class?)
- Volume (do you have the minimum required rows for training?)

## 2. Direct Trace Ingestion

Once your data is ready, use `gargi import` to ingest traces into the `gargi` database. This bypasses the need to execute the teacher LLM during replay.

```bash
gargi import path/to/history.jsonl --name route_ticket --schema TicketRouting
```

`gargi import` supports multiple formats:
- JSONL / CSV (native)
- Langfuse / LangSmith / Helicone / Braintrust (via export files)
- OpenTelemetry traces (JSON)

This populates the `decisions` table directly, treating the historical outputs as teacher labels.

## 3. Replay with pre-flight cost estimation

If you don't have historical outputs but do have historical *inputs*, you can use `gargi replay` to process them through your teacher LLM.

```bash
gargi replay --app myapp.routing --input inputs.jsonl --limit 1000
```

*Note: You can estimate the potential savings before training by running `gargi scan` on your codebase.*

## 4. Student model training

With the traces ingested or replayed, you can immediately train a student model:

```bash
gargi train route_ticket
```

`gargi train` will:
1. Split the data into train/val/holdout sets
2. Train a fast MLP head over the frozen embeddings
3. Evaluate against the promotion gates (agreement, calibration, coverage)

If the gates pass, the student is automatically promoted and ready to serve live traffic!

## 5. Expected performance

By cold-starting from historical traces, you can achieve immediate benefits on day one:
- **Latency drop:** LLM calls that took 1,000–2,000ms can drop to ~5ms for confident local predictions.
- **Cost reduction:** You can expect an 80-95% reduction in LLM API costs for highly repetitive, predictable structured outputs, since the local student handles the bulk of the volume while the teacher is only called for low-confidence fallback or holdout slices.
