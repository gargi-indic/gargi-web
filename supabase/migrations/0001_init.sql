-- ============================================================================
-- Gargi — conversation capture, model analytics and site analytics.
--
-- Security model: every table has RLS enabled and NO policies. That is not an
-- oversight. The anon key therefore reaches nothing at all, and the only way
-- in is the service-role key held by the Next.js server. A browser that could
-- read `messages` could read every visitor's conversations.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- sessions --
create table if not exists sessions (
  id           uuid primary key,
  first_seen   timestamptz not null default now(),
  last_seen    timestamptz not null default now(),
  user_agent   text,
  referrer     text,
  country      text,
  device       text
);

-- ----------------------------------------------------------- conversations --
create table if not exists conversations (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid references sessions(id) on delete cascade,
  checkpoint   text not null default 'instruct',
  script_pref  text not null default 'malayalam',
  title        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz
);
create index if not exists conversations_session_idx
  on conversations (session_id, updated_at desc nulls last);

-- ---------------------------------------------------------------- messages --
-- The raw training data. One row per turn.
create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  seq             int  not null,
  created_at      timestamptz not null default now(),
  unique (conversation_id, seq)
);
create index if not exists messages_conversation_idx on messages (conversation_id, seq);

-- ------------------------------------------------------------- generations --
-- One row per model call, with the performance envelope of that call.
create table if not exists generations (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid references conversations(id) on delete cascade,
  session_id       uuid references sessions(id) on delete set null,
  ip_hash          text,                    -- salted hash; never a raw address
  checkpoint       text not null,
  prompt_text      text,
  response_text    text,
  prompt_tokens    int,
  completion_tokens int,
  ttft_ms          numeric,
  total_ms         numeric,
  tokens_per_sec   numeric,
  stop_reason      text,
  prompt_truncated boolean default false,
  temperature      numeric,
  top_k            int,
  max_tokens       int,
  error            text,
  created_at       timestamptz not null default now()
);
-- Supports the rate-limit lookups, which run on every single message.
create index if not exists generations_session_time_idx on generations (session_id, created_at desc);
create index if not exists generations_ip_time_idx      on generations (ip_hash,    created_at desc);
create index if not exists generations_created_idx      on generations (created_at desc);

-- ------------------------------------------------------ generation_quality --
-- The notebook's Step 11 health checks, computed on every live response
-- instead of five fixed prompts.
--   malayalam_script_ratio near 0 -> collapsed to Latin/garbage
--   distinct_3gram below ~0.5     -> repetition loop
create table if not exists generation_quality (
  generation_id          uuid primary key references generations(id) on delete cascade,
  malayalam_script_ratio numeric,
  distinct_3gram         numeric,
  char_len               int,
  word_len               int,
  created_at             timestamptz not null default now()
);

-- ---------------------------------------------------------------- feedback --
create table if not exists feedback (
  id            uuid primary key default gen_random_uuid(),
  generation_id uuid not null references generations(id) on delete cascade,
  session_id    uuid references sessions(id) on delete set null,
  rating        text not null check (rating in ('up', 'down')),
  reason        text,
  comment       text,
  created_at    timestamptz not null default now(),
  unique (generation_id, session_id)
);

-- ------------------------------------------------------------------ events --
create table if not exists events (
  id         bigserial primary key,
  session_id uuid references sessions(id) on delete cascade,
  name       text not null,
  path       text,
  props      jsonb not null default '{}'::jsonb,
  referrer   text,
  country    text,
  device     text,
  created_at timestamptz not null default now()
);
create index if not exists events_name_time_idx on events (name, created_at desc);
create index if not exists events_time_idx      on events (created_at desc);

-- ---------------------------------------------------------------- waitlist --
create table if not exists waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  source     text,
  session_id uuid references sessions(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------- RLS ----
alter table sessions           enable row level security;
alter table conversations      enable row level security;
alter table messages           enable row level security;
alter table generations        enable row level security;
alter table generation_quality enable row level security;
alter table feedback           enable row level security;
alter table events             enable row level security;
alter table waitlist           enable row level security;
-- No policies, deliberately. The service-role key bypasses RLS; nothing else
-- gets in. Do not add an anon policy here without a very good reason.

-- ============================================================================
-- Views for the /admin dashboard and for ad-hoc analysis in the SQL editor.
-- ============================================================================

create or replace view v_daily_usage as
select date_trunc('day', g.created_at)::date       as day,
       count(*)                                     as generations,
       count(distinct g.session_id)                 as sessions,
       count(distinct g.conversation_id)            as conversations,
       sum(g.completion_tokens)                     as tokens_out
from generations g
group by 1
order by 1 desc;

create or replace view v_model_latency as
select checkpoint,
       count(*)                                                            as n,
       round(percentile_cont(0.5) within group (order by ttft_ms)::numeric, 0)  as ttft_p50,
       round(percentile_cont(0.95) within group (order by ttft_ms)::numeric, 0) as ttft_p95,
       round(percentile_cont(0.5) within group (order by total_ms)::numeric, 0) as total_p50,
       round(percentile_cont(0.95) within group (order by total_ms)::numeric,0) as total_p95,
       round(avg(tokens_per_sec)::numeric, 1)                              as avg_tok_per_sec
from generations
where ttft_ms is not null
group by checkpoint;

-- The signal that matters for the next training run: is output quality moving,
-- and does the instruct checkpoint actually beat the base one on real questions?
create or replace view v_quality_trend as
select date_trunc('day', g.created_at)::date        as day,
       g.checkpoint,
       count(*)                                      as n,
       round(avg(q.malayalam_script_ratio)::numeric, 3) as avg_malayalam_ratio,
       round(avg(q.distinct_3gram)::numeric, 3)         as avg_distinct_3gram,
       round(avg(q.char_len)::numeric, 0)               as avg_chars,
       count(*) filter (where q.malayalam_script_ratio < 0.5) as low_script_count,
       count(*) filter (where q.distinct_3gram < 0.5)         as repetition_count
from generations g
join generation_quality q on q.generation_id = g.id
group by 1, 2
order by 1 desc, 2;

create or replace view v_feedback_rate as
select g.checkpoint,
       count(f.id)                                     as rated,
       count(*) filter (where f.rating = 'up')         as up,
       count(*) filter (where f.rating = 'down')       as down,
       round(100.0 * count(*) filter (where f.rating = 'up')
             / nullif(count(f.id), 0), 1)              as pct_up
from feedback f
join generations g on g.id = f.generation_id
group by g.checkpoint;

create or replace view v_top_prompts as
select lower(btrim(prompt_text)) as prompt,
       count(*)                  as times_asked,
       count(distinct session_id) as people
from generations
where prompt_text is not null
group by 1
having count(*) > 1
order by 2 desc
limit 100;
