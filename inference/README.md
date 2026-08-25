# Gargi inference

FastAPI service for both [Gargi-M1](https://huggingface.co/gishnu/malayalam-nanogpt-instruct-v3-100M)
checkpoints, with SSE token streaming. Backs the chat on the Gargi site; not
meant to be called directly from a browser.

**Deployment: [../deploy/oracle/](../deploy/oracle/)** — Oracle Cloud ARM
Always Free, systemd + Caddy, $0/month.

| | |
|---|---|
| Parameters | 110M (12 layers, 768 d, 12 heads) |
| Context | 512 tokens |
| Vocab | 32,000 byte-level BPE, Malayalam only |
| Checkpoints | `base` (pretrained, step 21,172, val loss 1.189) and `instruct` (Alpaca-Malayalam SFT, step 2,773) |

## Endpoints

`GET /health` — loaded models, their training step and val loss, whether a
generation is in flight.

`POST /generate` — `{prompt, checkpoint, max_tokens, temperature, top_k}`,
returns `text/event-stream` with `start`, `token`, `done` (or `error`) events.
The `done` event carries token counts, `ttft_ms`, `total_ms`, `tokens_per_sec`
and `stop_reason`.

Requires `Authorization: Bearer $GARGI_API_TOKEN` when that variable is set.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `GARGI_API_TOKEN` | *(unset)* | Bearer token. Unset disables auth — fine locally, never in public. |
| `QUANTIZE` | `0` | int8 dynamic quantization. Off: fp32 runs at ~100 tok/s and int8 costs quality. |
| `TORCH_THREADS` | `2` | Match the host's core count. |
| `MAX_NEW_TOKENS_CAP` | `300` | Hard ceiling regardless of what the caller asks. |
| `INSTRUCT_REPO` / `BASE_REPO` | the v3 100M repos | Point both at one repo to halve memory. |

## Notes

Generation is **single-flight**. Two concurrent generations on 2 cores do not
run twice as slowly, they make each other time out, so the second caller gets
`503` with `Retry-After` and the UI says so.

The KV cache in `model.py` is what makes CPU serving viable — see the module
docstring for the measured numbers.

## Running locally

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py     # :7860
```

A `Dockerfile` is included for portability, but the Oracle deployment runs
`app.py` directly under systemd — see the deploy guide.
