create table if not exists public.tv_sessions (
  id uuid primary key default gen_random_uuid(),
  session_date date not null,
  start_time time not null,
  end_time time not null,
  hours numeric(8,2) not null check (hours > 0),
  created_at timestamptz not null default now()
);

create index if not exists tv_sessions_date_idx
  on public.tv_sessions (session_date desc, start_time desc);

-- For the simplest family setup, keep RLS disabled so the web app can read/write.
-- If you want tighter security later, add authentication and RLS policies.
alter table public.tv_sessions disable row level security;
