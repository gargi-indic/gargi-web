"""
Gargi-M1 architecture and KV-cached generation.

The module definitions mirror `malayalam-nanogpt-v3` exactly so that checkpoint
`state_dict` keys line up without remapping. The only functional addition is a
key/value cache.

The notebook's generate() re-runs a full forward pass over the entire context
for every token, so per-token cost grows with the sequence. With a cache each
decode step processes exactly one token and cost stays flat.

Measured at the real shape (110M params, 12L/768d/12h, ctx 512) on 2 threads,
200 generated tokens:

    uncached (notebook)   37 ms/token at 33 ctx, 77 ms/token at 233 ctx  ~11 s
    cached                                                     88 tok/s   2.3 s

That is a 5x speedup, and the gap widens with longer replies because the
uncached path degrades as context grows while the cached path does not. The
absolute numbers above come from an Apple Silicon laptop; a free Space's 2 vCPU
are slower, which is exactly why the 5x matters there.

Config is read from the checkpoint where present. The training loop's
"budget exhausted" save path omits the config dict, so there is a fallback.
"""

from __future__ import annotations

from dataclasses import dataclass

import torch
import torch.nn as nn
from torch.nn import functional as F

# Matches the notebook's Step 4 hyperparameters. Used only when a checkpoint
# was written by the time-budget save path, which does not store `config`.
DEFAULT_CONFIG = dict(block_size=512, n_embd=768, n_head=12, n_layer=12)
DEFAULT_VOCAB_SIZE = 32000


class CausalSelfAttention(nn.Module):
    def __init__(self, cfg):
        super().__init__()
        self.n_head = cfg["n_head"]
        self.c_attn = nn.Linear(cfg["n_embd"], 3 * cfg["n_embd"], bias=False)
        self.c_proj = nn.Linear(cfg["n_embd"], cfg["n_embd"], bias=False)
        self.resid_dropout = nn.Dropout(0.0)

    def forward(self, x, past_kv=None):
        B, T, C = x.shape
        q, k, v = self.c_attn(x).split(C, dim=2)
        q = q.view(B, T, self.n_head, C // self.n_head).transpose(1, 2)
        k = k.view(B, T, self.n_head, C // self.n_head).transpose(1, 2)
        v = v.view(B, T, self.n_head, C // self.n_head).transpose(1, 2)

        if past_kv is not None:
            k = torch.cat((past_kv[0], k), dim=2)
            v = torch.cat((past_kv[1], v), dim=2)

        # With a cache, T == 1 and the query attends to every cached key, all of
        # which precede it -- so no mask is needed. is_causal=True would be
        # actively wrong here: SDPA aligns the causal mask to the top-left when
        # q_len != k_len, which for a single query masks out the entire history.
        y = F.scaled_dot_product_attention(q, k, v, is_causal=(past_kv is None and T > 1))
        y = y.transpose(1, 2).contiguous().view(B, T, C)
        return self.resid_dropout(self.c_proj(y)), (k, v)


class FeedForward(nn.Module):
    def __init__(self, cfg):
        super().__init__()
        self.c_fc = nn.Linear(cfg["n_embd"], 4 * cfg["n_embd"])
        self.gelu = nn.GELU()
        self.c_proj = nn.Linear(4 * cfg["n_embd"], cfg["n_embd"])
        self.drop = nn.Dropout(0.0)

    def forward(self, x):
        return self.drop(self.c_proj(self.gelu(self.c_fc(x))))


class Block(nn.Module):
    def __init__(self, cfg):
        super().__init__()
        self.ln1 = nn.LayerNorm(cfg["n_embd"])
        self.attn = CausalSelfAttention(cfg)
        self.ln2 = nn.LayerNorm(cfg["n_embd"])
        self.ffwd = FeedForward(cfg)

    def forward(self, x, past_kv=None):
        attn_out, kv = self.attn(self.ln1(x), past_kv)
        x = x + attn_out
        x = x + self.ffwd(self.ln2(x))
        return x, kv


class MalayalamGPT(nn.Module):
    def __init__(self, cfg, vocab_size):
        super().__init__()
        self.cfg = cfg
        self.block_size = cfg["block_size"]
        self.token_embedding_table = nn.Embedding(vocab_size, cfg["n_embd"])
        self.position_embedding_table = nn.Embedding(cfg["block_size"], cfg["n_embd"])
        self.drop = nn.Dropout(0.0)
        self.blocks = nn.ModuleList([Block(cfg) for _ in range(cfg["n_layer"])])
        self.ln_f = nn.LayerNorm(cfg["n_embd"])
        self.lm_head = nn.Linear(cfg["n_embd"], vocab_size, bias=False)
        self.lm_head.weight = self.token_embedding_table.weight

    def forward(self, idx, past_kvs=None, pos_offset=0, last_only=True):
        """Returns (logits, new_past_kvs).

        `pos_offset` is where this chunk starts in the sequence -- with a cache
        the input is one token but its position embedding must reflect its true
        index, not 0.

        `last_only` slices to the final position before the lm_head. Generation
        only ever needs that one row, and skipping the rest avoids a
        768 x 32000 matmul per prompt token during prefill.
        """
        B, T = idx.shape
        pos = torch.arange(pos_offset, pos_offset + T, device=idx.device)
        x = self.drop(self.token_embedding_table(idx) + self.position_embedding_table(pos))

        new_kvs = []
        for i, blk in enumerate(self.blocks):
            x, kv = blk(x, past_kvs[i] if past_kvs is not None else None)
            new_kvs.append(kv)

        if last_only:
            x = x[:, -1:, :]
        return self.lm_head(self.ln_f(x)), new_kvs


# ---------------------------------------------------------------------------
# Loading
# ---------------------------------------------------------------------------


@dataclass
class LoadedModel:
    model: MalayalamGPT
    config: dict
    vocab_size: int
    step: object
    val_loss: object
    quantized: bool
    n_params: int


def load_checkpoint(ckpt_path: str, vocab_size: int, quantize: bool = False) -> LoadedModel:
    ck = torch.load(ckpt_path, map_location="cpu", weights_only=False)

    cfg = dict(DEFAULT_CONFIG)
    cfg.update(ck.get("config") or {})

    ck_vocab = ck.get("vocab_size", vocab_size)
    if ck_vocab != vocab_size:
        raise RuntimeError(
            f"Tokenizer/checkpoint mismatch: checkpoint vocab={ck_vocab}, "
            f"tokenizer vocab={vocab_size}. The embeddings are tied to the "
            f"tokenizer they were trained with; pairing them is not optional."
        )

    state = ck.get("model_state_dict", ck)
    model = MalayalamGPT(cfg, vocab_size)
    missing, unexpected = model.load_state_dict(state, strict=False)
    # lm_head.weight is tied to the token embedding, so its absence is expected.
    missing = [k for k in missing if k != "lm_head.weight"]
    if missing or unexpected:
        raise RuntimeError(
            f"Checkpoint does not match the architecture. "
            f"missing={missing} unexpected={unexpected}"
        )

    model.eval()
    n_params = sum(p.numel() for p in model.parameters())
    step, val_loss = ck.get("step"), ck.get("loss")

    # Drop the checkpoint dict now that its tensors have been copied into the
    # model. Holding it until this function returns doubles the footprint of a
    # load, and when two checkpoints are loaded in sequence the second one's
    # transient copy lands on top of the first model already being resident --
    # which is exactly what pushed the container past a 2 GiB limit.
    del state, ck
    gc.collect()

    if quantize:
        # Dynamic int8 on the Linear layers. Measured unquantized throughput is
        # already ~88 tok/s on 2 threads, so this is off by default -- it buys
        # memory rather than speed we need, at a real quality cost. It also
        # requires an fbgemm/qnnpack build of torch: absent on Apple Silicon,
        # present on the Space's x86 Linux. Failing here would be an absurd way
        # to lose the whole service, so it degrades instead.
        try:
            model = torch.quantization.quantize_dynamic(model, {nn.Linear}, dtype=torch.qint8)
        except RuntimeError as exc:
            print(f"[gargi] int8 quantization unavailable ({exc}); serving fp32", flush=True)
            quantize = False

    return LoadedModel(
        model=model,
        config=cfg,
        vocab_size=vocab_size,
        step=ck.get("step"),
        val_loss=ck.get("loss"),
        quantized=quantize,
        n_params=n_params,
    )


# ---------------------------------------------------------------------------
# Generation
# ---------------------------------------------------------------------------


@torch.inference_mode()
def generate_stream(
    loaded: LoadedModel,
    tokenizer,
    prompt: str,
    max_new_tokens: int = 200,
    temperature: float = 0.8,
    top_k: int = 50,
    stop_token_id: int | None = None,
    stop_strings: tuple[str, ...] = (),
):
    """Yields (text_delta, token_id) per step, then a final dict of metrics.

    Sampling matches the notebook's MalayalamGPT.generate: temperature scaling,
    top-k truncation, multinomial draw.
    """
    import time

    model = loaded.model
    block_size = loaded.config["block_size"]

    ids = tokenizer.encode(prompt).ids
    # The model has no positions beyond block_size. Keep the tail of the prompt
    # and leave room to actually generate something.
    room = block_size - min(max_new_tokens, block_size // 2)
    truncated = len(ids) > room
    if truncated:
        ids = ids[-room:]

    prompt_tokens = len(ids)
    t0 = time.perf_counter()
    ttft = None

    idx = torch.tensor([ids], dtype=torch.long)
    logits, past = model(idx, pos_offset=0)  # prefill
    pos = prompt_tokens

    produced: list[int] = []
    text_so_far = ""
    stop_reason = "length"

    for _ in range(max_new_tokens):
        if pos >= block_size:
            stop_reason = "context_full"
            break

        step_logits = logits[:, -1, :].float() / max(temperature, 1e-6)
        if top_k:
            v, _ = torch.topk(step_logits, min(top_k, step_logits.size(-1)))
            step_logits[step_logits < v[:, [-1]]] = -float("inf")
        probs = F.softmax(step_logits, dim=-1)
        next_id = int(torch.multinomial(probs, num_samples=1).item())

        if ttft is None:
            ttft = (time.perf_counter() - t0) * 1000

        if stop_token_id is not None and next_id == stop_token_id:
            stop_reason = "eos"
            break

        produced.append(next_id)
        # Decode the whole run each step: byte-level BPE tokens are not
        # individually decodable, and a multi-byte Malayalam character can span
        # two tokens. Emitting the diff is the only way to avoid mojibake.
        new_text = tokenizer.decode(produced)
        delta, text_so_far = new_text[len(text_so_far):], new_text

        if delta:
            yield ("token", delta, next_id)

        if any(s in text_so_far for s in stop_strings):
            stop_reason = "stop_string"
            break

        idx = torch.tensor([[next_id]], dtype=torch.long)
        logits, past = model(idx, past_kvs=past, pos_offset=pos)
        pos += 1

    total_ms = (time.perf_counter() - t0) * 1000
    completion_tokens = len(produced)

    for s in stop_strings:
        if s in text_so_far:
            text_so_far = text_so_far.split(s)[0]

    yield (
        "done",
        {
            "text": text_so_far,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "prompt_truncated": truncated,
            "ttft_ms": round(ttft or total_ms, 1),
            "total_ms": round(total_ms, 1),
            "tokens_per_sec": round(completion_tokens / (total_ms / 1000), 2) if total_ms else 0.0,
            "stop_reason": stop_reason,
        },
        None,
    )


# ---------------------------------------------------------------------------
# Prompt formats -- must match how each checkpoint was trained
# ---------------------------------------------------------------------------

INSTRUCT_TEMPLATE = "### Instruction:\n{prompt}\n\n### Response:\n"


def build_prompt(checkpoint: str, user_text: str) -> str:
    """The instruct checkpoint saw Alpaca-formatted text during SFT; the base
    checkpoint only ever saw raw documents. Asking a base model a question is
    out of distribution -- it continues text, it does not answer."""
    if checkpoint == "instruct":
        return INSTRUCT_TEMPLATE.format(prompt=user_text.strip())
    return user_text
