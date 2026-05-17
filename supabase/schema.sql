-- =====================================================================
-- DSA Prep — Database Schema
-- =====================================================================

-- Curated + custom problems
create table problems (
  id            bigserial primary key,
  slug          text unique not null,
  title         text not null,
  leetcode_url  text not null,
  neetcode_url  text,
  topic         text not null,
  topic_order   smallint not null,
  difficulty    text not null check (difficulty in ('Easy','Medium','Hard')),
  source        text not null default 'neetcode150'
                check (source in ('neetcode150','custom')),
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now()
);
create index problems_topic_idx on problems(topic_order, id);
create index problems_source_idx on problems(source);

-- Per-user tracking
create table user_problems (
  id              bigserial primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  problem_id      bigint not null references problems(id) on delete cascade,
  stage           smallint not null default 0 check (stage between 0 and 5),
  status          text not null default 'learning'
                  check (status in ('learning','graduated','suspended')),
  next_due_date   date not null,
  last_reviewed   timestamptz,
  first_solved_at timestamptz not null default now(),
  added_at        timestamptz not null default now(),
  notes           text,
  unique (user_id, problem_id)
);
create index user_problems_due_idx
  on user_problems(user_id, next_due_date)
  where status = 'learning';
create index user_problems_solved_idx
  on user_problems(user_id, first_solved_at);

-- Append-only review history
create table reviews (
  id              bigserial primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  user_problem_id bigint not null references user_problems(id) on delete cascade,
  rating          text not null check (rating in ('again','good','easy')),
  prev_stage      smallint not null,
  next_stage      smallint not null,
  reviewed_at     timestamptz not null default now()
);
create index reviews_user_idx on reviews(user_id, reviewed_at desc);

-- User profile
create table profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  email       text,
  timezone    text not null default 'America/Los_Angeles',
  created_at  timestamptz not null default now()
);

-- =====================================================================
-- Row-Level Security
-- =====================================================================
alter table user_problems enable row level security;
alter table reviews       enable row level security;
alter table profiles      enable row level security;
alter table problems      enable row level security;

create policy "own user_problems" on user_problems
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own reviews" on reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own profile" on profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "read all neetcode150 problems" on problems
  for select using (source = 'neetcode150' or created_by = auth.uid());

create policy "insert own custom problems" on problems
  for insert with check (source = 'custom' and created_by = auth.uid());

-- =====================================================================
-- Auto-create profile on signup
-- =====================================================================
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
