# Gargi Labs

A small lab building three things, and the site that presents them.

| Product | Status | Route |
|---|---|---|
| **Gargi Reflex**: autonomous model caching for LLM calls | Launching | `/reflex` |
| **Coding harness & Meta harness** | In development | `/harness` |
| **Indic Language SLMs** (Gargi-M1 and successors) | Live research preview | `/indic` |

The spec for the site is [`docs/gargi-labs/PLAN.md`](docs/gargi-labs/PLAN.md); how it
looks is [`DESIGN.md`](DESIGN.md) (tokens in `web/styles/tokens.css`, components in
`web/styles/lab.css`).

```
gargi/
├── web/         Next.js 15 site + chat + API routes  → Vercel
├── inference/   FastAPI model server                 → Cloud Run (GCP)
└── supabase/    Postgres schema, RLS and analytics views
```

## Routes

```
/                        Home, Reflex-first, with the launch film
/lab                     About the lab, all products, contact & support
/reflex                  Gargi Reflex
/reflex/research         Phase 0 research
/reflex/docs             Docs landing
/harness                 Coding harness & Meta harness (waitlist)
/indic                   Indic SLMs overview
/indic/models            Gargi-M1 and releases
/indic/about             Vision, pillars, contributors
/indic/chat              Chat with Gargi-M1
/blog, /blog/<post>      Lab notes
/privacy                 Privacy
/admin, /api/*           Internal
```

`/models`, `/chat` and `/about` redirect permanently to their `/indic` versions.
All copy and every number live in `web/content/` (`lab.ts`, `reflex.ts`, `indic.ts`);
nothing is hardcoded in JSX.

## Gargi-M1, as actually trained

| | |
|---|---|
| Parameters | 110M: 12 layers, 12 heads, 768 hidden |
| Context | 512 tokens |
| Vocabulary | 32,000 byte-level BPE, Malayalam only |
| Training | ~1.39B tokens, held-out loss 1.189 |
| Tokenizer fertility | 1.36 characters/token |
| Checkpoints | [instruct](https://huggingface.co/gishnu/malayalam-nanogpt-instruct-v3-100M) · [base](https://huggingface.co/gishnu/malayalam-nanogpt-base-v3-100M) |

## Running it locally

Full instructions in [`docs/LOCAL.md`](docs/LOCAL.md). The short version:

```bash
cd inference && pip install -r requirements.txt && python app.py    # :7860
cd web && cp .env.example .env.local && npm install && npm run dev  # :3000
```

The site runs without Supabase or the model server — pages render, and the chat
reports plainly that the model is unreachable rather than failing silently.

## How a message flows

```
browser ──POST /api/chat──▶ Next.js route ──POST /generate──▶ HF Space
   ◀──────── SSE tokens ─────────┤                              (KV-cached)
                                 └── after the stream closes ──▶ Supabase
                                     messages, generations,
                                     generation_quality
```

The Space's bearer token stays on the server. Logging happens *after* the last
token, never between tokens, so the database never sits in front of the model.

## Two things worth knowing

**The KV cache is the reason the free tier works.** The training notebook's
`generate()` re-runs a full forward pass over the whole context for every token.
Measured at the real model shape on 2 threads: 11s uncached versus 2.3s cached
for a 200-token reply, and the gap widens with longer replies. See
[`inference/model.py`](inference/model.py).

**Quality is measured continuously, not at release.** The notebook's Step 11
health checks — Malayalam script ratio and distinct-3gram — run on every live
response and land in `generation_quality`. Combined with the base/instruct switch
in the chat header, the site is a permanently-running version of the
`probe_base.py` experiment: which checkpoint answers real questions better.

## Deploying

1. **Inference** — Cloud Run: `./deploy/gcp/deploy.sh`. Scales to zero, HTTPS
   and the bearer token handled for you. Guide: **[deploy/gcp/](deploy/gcp/)**.
2. **Database** — run `supabase/migrations/0001_init.sql` in the SQL editor.
3. **Vercel** — import `web/`, set the variables in `web/.env.example`.
4. **Monitoring** — add `GARGI_INFERENCE_URL` as a GitHub secret so
   `.github/workflows/health.yml` tells you if the service dies.

Hugging Face Spaces was the original plan, but Docker Spaces need a paid tier.
GCP won over Oracle ARM because model training will live there too, and one
provider beats two. A working Oracle VM deployment is kept in
[deploy/oracle/](deploy/oracle/) as a fallback — free forever and never sleeps,
at the cost of managing TLS and a firewall yourself.
