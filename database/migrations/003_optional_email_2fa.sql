-- Run once after migrations 001 and 002 in the same database.
begin;
alter table public.users add column email_2fa_enabled boolean not null default false;
create table public.auth_2fa_challenges (
 challenge_hash text primary key,
 user_id uuid not null references public.users(id) on delete cascade,
 purpose text not null check (purpose in ('login','enable','disable')),
 code_hash text not null,
 session_hash text,
 attempts integer not null default 0 check (attempts between 0 and 5),
 expires_at timestamptz not null,
 created_at timestamptz not null default now(),
 check ((purpose='login' and session_hash is null) or (purpose in ('enable','disable') and session_hash is not null))
);
create index auth_2fa_challenges_user_idx on public.auth_2fa_challenges(user_id);
create index auth_2fa_challenges_expiry_idx on public.auth_2fa_challenges(expires_at);
commit;
