create extension if not exists "pgcrypto";

create table if not exists public.portfolio_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text not null default 'นายพิชญานนท์ วัจนสุนทร',
  position text default 'ครูชำนาญการ',
  school text default 'โรงเรียนอนุบาลหนองหานวิทยายน',
  department text default 'วิทยาศาสตร์และเทคโนโลยี',
  role text not null default 'owner' check (role in ('owner', 'admin', 'manager', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_works (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  teacher_name text not null,
  position text,
  academic_year text not null,
  semester text,
  work_date date,
  title text not null,
  description text,
  category text not null,
  work_level text,
  pa_indicator text,
  sar_standard text,
  evidence_type text,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'ready', 'published', 'archived')),
  public_on_profile boolean not null default false,
  evidence_url text,
  cover_image_url text,
  notes text,
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_files (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.portfolio_works(id) on delete cascade,
  owner_id uuid references auth.users(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id uuid,
  ip inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.portfolio_profiles
  add column if not exists role text not null default 'owner';

alter table public.portfolio_profiles
  drop constraint if exists portfolio_profiles_role_check;

alter table public.portfolio_profiles
  add constraint portfolio_profiles_role_check check (role in ('owner', 'admin', 'manager', 'viewer'));

alter table public.portfolio_works
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references auth.users(id);

create index if not exists portfolio_works_owner_idx on public.portfolio_works(owner_id);
create index if not exists portfolio_works_year_idx on public.portfolio_works(academic_year);
create index if not exists portfolio_works_status_idx on public.portfolio_works(status);
create index if not exists portfolio_works_category_idx on public.portfolio_works(category);
create index if not exists portfolio_works_public_idx on public.portfolio_works(public_on_profile) where public_on_profile = true;
create index if not exists portfolio_works_deleted_idx on public.portfolio_works(deleted_at) where deleted_at is null;
create index if not exists portfolio_audit_logs_user_idx on public.portfolio_audit_logs(user_id);
create index if not exists portfolio_audit_logs_action_idx on public.portfolio_audit_logs(action);
create index if not exists portfolio_audit_logs_record_idx on public.portfolio_audit_logs(record_id);
create index if not exists portfolio_audit_logs_created_idx on public.portfolio_audit_logs(created_at desc);

alter table public.portfolio_profiles enable row level security;
alter table public.portfolio_works enable row level security;
alter table public.portfolio_files enable row level security;
alter table public.portfolio_audit_logs enable row level security;

drop policy if exists "profile owner can read" on public.portfolio_profiles;
create policy "profile owner can read"
on public.portfolio_profiles for select
using (auth.uid() = user_id);

drop policy if exists "profile owner can write" on public.portfolio_profiles;
create policy "profile owner can write"
on public.portfolio_profiles for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "work owner can manage" on public.portfolio_works;
create policy "work owner can manage"
on public.portfolio_works for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "published works are public" on public.portfolio_works;
create policy "published works are public"
on public.portfolio_works for select
using (public_on_profile = true and status = 'published' and deleted_at is null);

drop policy if exists "file owner can manage" on public.portfolio_files;
create policy "file owner can manage"
on public.portfolio_files for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "published work files are public" on public.portfolio_files;
create policy "published work files are public"
on public.portfolio_files for select
using (
  exists (
    select 1
    from public.portfolio_works
    where portfolio_works.id = portfolio_files.work_id
      and portfolio_works.public_on_profile = true
      and portfolio_works.status = 'published'
      and portfolio_works.deleted_at is null
  )
);

drop policy if exists "audit owner can insert" on public.portfolio_audit_logs;
create policy "audit owner can insert"
on public.portfolio_audit_logs for insert
with check (auth.uid() = user_id);

drop policy if exists "audit owner can read" on public.portfolio_audit_logs;
create policy "audit owner can read"
on public.portfolio_audit_logs for select
using (auth.uid() = user_id);
