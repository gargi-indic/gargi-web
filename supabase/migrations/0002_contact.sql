-- -------------------------------------------------------- contact_messages --
create table if not exists contact_messages (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name       text check (length(name) <= 120),
  email      text not null check (length(email) <= 320),
  intent     text not null check (intent in ('contribute', 'support', 'question', 'updates')),
  message    text check (length(message) <= 4000),
  source     text check (length(source) <= 40),
  session_id uuid references sessions(id) on delete set null,
  handled    boolean not null default false
);

create index if not exists contact_messages_created_idx on contact_messages (created_at desc);

alter table contact_messages enable row level security;
