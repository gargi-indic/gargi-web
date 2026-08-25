"""
Gargi inference service -- FastAPI on a Hugging Face Space (free CPU tier).

Serves both Gargi-M1 checkpoints (base and instruct) with SSE token streaming.
Only the Gargi web app's server calls this; the bearer token never reaches a
browser.

Two constraints shape the design, both from the free tier's 2 vCPU:

  * Generation is single-flight. A second concurrent request would not run
    twice as slow, it would make both crawl and time out, so the second caller
    gets a 503 with Retry-After and the UI says so honestly.
  * Weights are baked into the image at build time (see Dockerfile). Downloading
    880 MB on cold start would put a minute in front of the first visitor.
"""

from __future__ import annotations

import asyncio
import json
import os
import threading
import time
from contextlib import asynccontextmanager

import torch
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field
from tokenizers import Tokenizer

from model import LoadedModel, build_prompt, generate_stream, load_checkpoint

# --- configuration ---------------------------------------------------------

REPOS = {
    "instruct": os.environ.get("INSTRUCT_REPO", "gishnu/malayalam-nanogpt-instruct-v3-100M"),
    "base": os.environ.get("BASE_REPO", "gishnu/malayalam-nanogpt-base-v3-100M"),
}
API_TOKEN = os.environ.get("GARGI_API_TOKEN", "")
QUANTIZE = os.environ.get("QUANTIZE", "0") not in ("0", "false", "False", "")
MAX_NEW_TOKENS_CAP = int(os.environ.get("MAX_NEW_TOKENS_CAP", "300"))
TORCH_THREADS = int(os.environ.get("TORCH_THREADS", "2"))

MODELS: dict[str, LoadedModel] = {}
TOKENIZERS: dict[str, Tokenizer] = {}
EOS: dict[str, int | None] = {}
STARTED_AT = time.time()

# One generation at a time. See module docstring.
GEN_LOCK = asyncio.Semaphore(1)

# Set once both checkpoints are resident. Until then the port is open but
# /generate refuses -- see the note on _load_all below.
READY = threading.Event()
LOAD_ERROR: str | None = None


def _load_all() -> None:
    global LOAD_ERROR
    from huggingface_hub import hf_hub_download

    try:
        torch.set_num_threads(TORCH_THREADS)
        for name, repo in REPOS.items():
            t0 = time.perf_counter()
            ckpt = hf_hub_download(repo, "pytorch_model.bin")
            tok_path = hf_hub_download(repo, "tokenizer.json")

            tok = Tokenizer.from_file(tok_path)
            loaded = load_checkpoint(ckpt, tok.get_vocab_size(), quantize=QUANTIZE)

            MODELS[name] = loaded
            TOKENIZERS[name] = tok
            EOS[name] = tok.get_vocab().get("[EOS]")
            print(
                f"[gargi] loaded {name} from {repo}: "
                f"{loaded.n_params/1e6:.1f}M params, ctx {loaded.config['block_size']}, "
                f"vocab {loaded.vocab_size}, quantized={loaded.quantized}, "
                f"step={loaded.step}, val_loss={loaded.val_loss} "
                f"({time.perf_counter()-t0:.1f}s)",
                flush=True,
            )
        READY.set()
        print(f"[gargi] ready in {time.time()-STARTED_AT:.1f}s", flush=True)
    except Exception as exc:  # noqa: BLE001
        LOAD_ERROR = f"{type(exc).__name__}: {exc}"
        print(f"[gargi] FAILED to load models: {LOAD_ERROR}", flush=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load before the port opens, deliberately.
    #
    # The obvious alternative -- bind immediately, load on a background thread --
    # is wrong on a scale-to-zero platform. The instance is only kept alive
    # while it has work: a probe request gets answered in milliseconds with
    # "not ready", the request completes, and the instance is reaped seconds
    # later with the load half-finished. It never converges.
    #
    # Blocking here means the platform does not consider the container started
    # until the weights are in, so it waits, routes the first request only when
    # the service can actually answer it, and does not reap mid-load. The cost
    # is that a cold start is ~10s of latency rather than an immediate 503.
    #
    # This does require CPU during startup. On Cloud Run that means
    # --no-cpu-throttling (and --cpu-boost); throttled, the same load takes
    # 17s instead of 8 and can trip the startup probe.
    _load_all()
    yield
    MODELS.clear()


app = FastAPI(title="Gargi inference", lifespan=lifespan)


# --- auth ------------------------------------------------------------------


def _check_auth(authorization: str | None) -> None:
    if not API_TOKEN:  # unset locally, so `python app.py` just works
        return
    expected = f"Bearer {API_TOKEN}"
    if not authorization or not _consteq(authorization, expected):
        raise HTTPException(status_code=401, detail="unauthorized")


def _consteq(a: str, b: str) -> bool:
    import hmac

    return hmac.compare_digest(a.encode(), b.encode())


# --- routes ----------------------------------------------------------------


class GenerateRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=4000)
    checkpoint: str = Field(default="instruct", pattern="^(instruct|base)$")
    max_tokens: int = Field(default=200, ge=1, le=1000)
    temperature: float = Field(default=0.8, ge=0.0, le=2.0)
    top_k: int = Field(default=50, ge=0, le=1000)


@app.get("/health")
async def health():
    return {
        "ok": READY.is_set(),
        "ready": READY.is_set(),
        "load_error": LOAD_ERROR,
        "models": {
            name: {
                "repo": REPOS[name],
                "params_m": round(m.n_params / 1e6, 1),
                "context": m.config["block_size"],
                "vocab_size": m.vocab_size,
                "quantized": m.quantized,
                "train_step": m.step,
                "val_loss": m.val_loss,
            }
            for name, m in MODELS.items()
        },
        "busy": GEN_LOCK.locked(),
        "uptime_s": round(time.time() - STARTED_AT, 1),
    }


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


@app.post("/generate")
async def generate(req: GenerateRequest, request: Request, authorization: str = Header(default=None)):
    _check_auth(authorization)

    if LOAD_ERROR:
        raise HTTPException(status_code=500, detail=f"model failed to load: {LOAD_ERROR}")

    if not READY.is_set():
        # Cold start: the port is open but the weights are still loading. Say so
        # rather than pretending the model is broken.
        return JSONResponse(
            {"error": "warming_up", "detail": "Gargi is starting up. Try again in a few seconds."},
            status_code=503,
            headers={"Retry-After": "10"},
        )

    if req.checkpoint not in MODELS:
        raise HTTPException(status_code=503, detail="model not loaded")

    if GEN_LOCK.locked():
        return JSONResponse(
            {"error": "busy", "detail": "Gargi is answering someone else. Try again in a moment."},
            status_code=503,
            headers={"Retry-After": "5"},
        )

    loaded = MODELS[req.checkpoint]
    tok = TOKENIZERS[req.checkpoint]
    prompt = build_prompt(req.checkpoint, req.prompt)
    max_new = min(req.max_tokens, MAX_NEW_TOKENS_CAP)

    async def stream():
        async with GEN_LOCK:
            yield _sse("start", {"checkpoint": req.checkpoint, "model": REPOS[req.checkpoint]})
            loop = asyncio.get_running_loop()
            gen = generate_stream(
                loaded,
                tok,
                prompt,
                max_new_tokens=max_new,
                temperature=req.temperature,
                top_k=req.top_k,
                stop_token_id=EOS[req.checkpoint],
                # The instruct model sometimes rolls straight into a second
                # turn instead of emitting [EOS]. Cut it there.
                stop_strings=("### Instruction:",) if req.checkpoint == "instruct" else (),
            )
            try:
                while True:
                    # Each next() is a full model step and would otherwise block
                    # the event loop, stalling the SSE writes and the health check.
                    item = await loop.run_in_executor(None, lambda: next(gen, None))
                    if item is None:
                        break
                    kind, payload, _tid = item
                    if kind == "token":
                        if await request.is_disconnected():
                            break
                        yield _sse("token", {"t": payload})
                    else:
                        yield _sse("done", payload)
                        break
            except Exception as exc:  # noqa: BLE001
                print(f"[gargi] generation failed: {exc!r}", flush=True)
                yield _sse("error", {"message": str(exc)})

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "7860")))
