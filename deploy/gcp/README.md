# Deploying Gargi inference to Cloud Run

One command, no servers to maintain, automatic HTTPS, and it scales to zero
when nobody is using it.

```bash
./deploy/gcp/deploy.sh
```

## Why Cloud Run rather than a VM

The Oracle path needed a firewall fix, Caddy, a TLS certificate and a systemd
unit before it served a single token. Cloud Run needs none of that: TLS,
routing and process supervision come with it. And when the site is idle — which
for a research demo is most of the time — it costs nothing at all.

The tradeoff is **cold starts**. With `min-instances=0` the first request after
an idle period waits for a container to start and load 880 MB of weights.
Expect **20–45 seconds**. Every subsequent request is fast.

If that is unacceptable, run one instance warm:

```bash
MIN_INSTANCES=1 ./deploy/gcp/deploy.sh
```

That bills continuously rather than per-request, so it is not free — but it is
exactly what the $300 trial credit is for while you are showing the site to
people. Flip it back to `0` afterwards.

## What the settings mean

| Flag | Value | Why |
|---|---|---|
| `--memory` | `4Gi` | Loading both fp32 checkpoints peaks above 2 GiB — see below |
| `--cpu` | `2` | Matches `TORCH_THREADS=2`; more threads than cores makes it slower, not faster |
| `--concurrency` | `8` | The app's own single-flight lock handles contention and returns a fast 503, which beats a second user waiting 40s for a cold instance |
| `--max-instances` | `2` | Caps spend. Each instance is a full 880 MB model load |
| `--timeout` | `300` | A long generation must not be cut off mid-stream |
| `--cpu-boost` | on | Extra CPU during startup |
| `--no-cpu-throttling` | on | **Required.** See below |
| `--allow-unauthenticated` | on | Vercel calls this; the bearer token is the actual gate |

### Why `--no-cpu-throttling` is not optional

The first deploy failed with *"container failed to start and listen on
PORT=8080"*, even though the logs showed both checkpoints loading fine in 17s.

The tempting fix — bind the port immediately, load the weights on a background
thread, report readiness from `/health` — **is wrong on a scale-to-zero
platform**, and it fails in a way that looks like success. It was tried, and the
logs showed this loop:

```
loaded instruct (3.7s)
loaded base (3.6s)
ready in 7.6s
Shutting down          <- one second later
```

An instance is only kept alive while it has work to do. A probe request gets
answered in milliseconds with "not ready", the request completes, and Cloud Run
reaps the instance seconds later with the load half-finished. It never
converges, and every request pays for a fresh doomed container.

So `lifespan` blocks until the weights are in. Cloud Run then does not consider
the container started, waits for it, routes the first request only when the
service can actually answer, and does not reap mid-load.

That requires CPU *during startup*, which is what `--no-cpu-throttling` buys.
Throttled, the same load took 17s and tripped the startup probe; unthrottled it
takes **7.6s**. The flag moves billing from per-request to instance-lifetime —
with `min-instances=0` the instance still shuts down when idle, so cost is
bounded, but it is no longer strictly pay-per-request. Set a budget alert.

**Region defaults to `asia-south1` (Mumbai).** The audience for a Malayalam
model is overwhelmingly in India, and this saves roughly 200 ms per request
against a US region. `REGION=us-central1 ./deploy/gcp/deploy.sh` if cost matters
more than latency.

## The bearer token

`deploy.sh` generates it on first run and stores it in **Secret Manager**, so
it never lands in your shell history, a `.env` file, or this repo. Cloud Run
mounts it as `GARGI_API_TOKEN`.

To read it back for Vercel:

```bash
gcloud secrets versions access latest --secret=gargi-api-token
```

To rotate:

```bash
openssl rand -hex 32 | gcloud secrets versions add gargi-api-token --data-file=-
./deploy/gcp/deploy.sh   # redeploy to pick up the new version
```

Update Vercel at the same time or the chat breaks.

## Verify

```bash
URL=$(gcloud run services describe gargi-inference --region asia-south1 --format='value(status.url)')
curl -s $URL/health | python3 -m json.tool
```

Both checkpoints should report `params_m: 110.0`, `context: 512`.

```bash
TOKEN=$(gcloud secrets versions access latest --secret=gargi-api-token)
curl -sN -X POST $URL/generate \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"prompt":"സൂര്യൻ എന്താണ്?","checkpoint":"instruct","max_tokens":120}' \
  | grep -A1 'event: done'
```

Tokens must arrive progressively rather than in one lump at the end. Cloud Run
supports streaming responses natively, so if they lump, the problem is in the
app rather than the platform.

**Expected: 40–80 tok/s.** Measured 100 tok/s on 2 threads of Apple Silicon;
Cloud Run's vCPUs are slower per-core but real.

## Point the site at it

On Vercel, and in `web/.env.local` to test locally against the deployed model:

```
GARGI_INFERENCE_URL=https://gargi-inference-xxxxx.a.run.app
GARGI_API_TOKEN=<from Secret Manager>
```

## Operating it

```bash
gcloud run services logs tail gargi-inference --region asia-south1
gcloud run revisions list --service gargi-inference --region asia-south1
```

Roll back to a previous revision:

```bash
gcloud run services update-traffic gargi-inference \
  --to-revisions <revision-name>=100 --region asia-south1
```

Change a setting without rebuilding:

```bash
gcloud run services update gargi-inference --region asia-south1 \
  --update-env-vars QUANTIZE=1
```

## Cost

At demo traffic with `min-instances=0`, this should sit inside Cloud Run's
perpetual free tier — you pay only for the seconds a request is actually being
served. Verify against current pricing rather than taking that on faith, and
watch the first month's billing page.

`min-instances=1` is a different matter: it bills continuously and is the one
setting that can quietly spend real money. Set a **budget alert** on the project
before you enable it.

## Troubleshooting

**Build fails on image size or timeout** — the build installs torch and
downloads 880 MB. Cloud Build's default timeout is generous but not infinite;
`gcloud config set builds/timeout 1800` if it trips.

**Cold start feels worse than 45s** — check that the CPU-only torch index is
still in `requirements.txt`. Without it the image carries ~2.5 GB of CUDA that
can never run.

**503 "Gargi is answering someone else"** — working as intended. That is the
app's single-flight lock, not Cloud Run.

**Container fails to start** — Cloud Run requires listening on `$PORT`. `app.py`
reads it; a hardcoded port would fail health checks and the deploy would roll
back on its own.

---

An alternative VM-based deployment for Oracle Cloud ARM is kept in
[`../oracle/`](../oracle/). It never sleeps and is free forever, at the cost of
managing certificates and a firewall yourself.
