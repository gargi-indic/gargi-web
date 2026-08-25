# Running Gargi locally

Two processes: the model server on `:7860` and the site on `:3000`.
Supabase is optional — skip step 3 to run without it.

## 1. Model server

Downloads ~880 MB of weights on first run (both checkpoints), cached in
`~/.cache/huggingface` afterwards.

```bash
cd inference
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Serves on **http://localhost:7860**. Startup takes 20–40s while both
checkpoints load; watch for two `[gargi] loaded …` lines.

To serve only the instruct checkpoint (halves memory and startup time):

```bash
BASE_REPO=gishnu/malayalam-nanogpt-instruct-v3-100M python app.py
```

Check it is alive:

```bash
curl -s localhost:7860/health | python3 -m json.tool
```

Stream a real generation — this is the test that matters, because it proves the
KV cache is engaged:

```bash
curl -N -X POST localhost:7860/generate -H 'Content-Type: application/json' -d '{"prompt":"കേരളത്തിന്റെ തലസ്ഥാനം ഏതാണ്?","checkpoint":"instruct","max_tokens":120}'
```

You want tokens appearing progressively, and a final `done` event reporting
**more than 15 tok/s**. Far below that means the cache is not being used and
something in `model.py` has regressed.

## 2. The site

```bash
cd web
cp .env.example .env.local     # then edit it
npm install
npm run dev
```

Set at minimum:

```
GARGI_INFERENCE_URL=http://localhost:7860
```

Open **http://localhost:3000**. Every page works without a database; the chat
works as soon as the model server above is running.

## 3. Supabase (optional, needed for logging and analytics)

1. Create a project, then paste `supabase/migrations/0001_init.sql` into the SQL
   editor and run it.
2. Copy the project URL and the **service role** key (Settings → API) into
   `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_PASSWORD=something-long
```

The service-role key is server-only and must never be committed or exposed to
the browser. Every table has RLS on with no policies, so this key is the only
way in — which is exactly why it must stay on the server.

Restart `npm run dev`, send a chat message, then confirm:

```sql
select checkpoint, prompt_tokens, completion_tokens, ttft_ms, tokens_per_sec, stop_reason
from generations order by created_at desc limit 5;

select * from generation_quality order by created_at desc limit 5;
```

`malayalam_script_ratio` should be high and `distinct_3gram` above ~0.5. If the
ratio is near zero the model has collapsed to Latin characters; if distinct-3gram
is low it is stuck in a repetition loop.

Then visit **http://localhost:3000/admin** and log in with `ADMIN_PASSWORD`.

## What to check by hand

| Check | Where |
|---|---|
| Malayalam renders in Noto Sans Malayalam, not a system fallback | any page with `ഗ` |
| Layout matches the artboards | 1440px wide |
| Nothing overflows horizontally | 1024, 768 and 375px |
| Sidebar becomes a drawer with a ☰ button | `/chat` below 860px |
| Base vs Instruct give different answers | `/chat`, same question both ways |
| Thumbs up/down persists | `/chat`, then the `feedback` table |
| Waitlist accepts an email | any marketing page footer panel |

## Troubleshooting

**"Could not reach the model"** — the server on `:7860` is not running, or
`GARGI_INFERENCE_URL` is unset. The site says so rather than hanging.

**"Gargi is answering someone else"** — working as designed. Generation is
single-flight because 2 vCPU cannot serve two at once.

**Generation is very slow** — confirm `tokens_per_sec` in the `done` event.
Under ~15 means the KV cache is not engaged.

**`quantized: false` in `/health`** — expected. int8 is off by default; fp32
already runs fast enough and int8 costs quality. It also needs an fbgemm build
of torch, which Apple Silicon does not have.

## Deploying

The model server goes to Cloud Run — see
[deploy/gcp/README.md](../deploy/gcp/README.md). One command:
`./deploy/gcp/deploy.sh`.
