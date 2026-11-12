-- Apply once after 001_init.sql to the same database. Does not alter existing user data.
begin;
create table public.auth_rate_limits (
  key_hash text primary key,
  attempts integer not null check (attempts > 0),
  expires_at timestamptz not null
);
create index auth_rate_limits_expires_idx on public.auth_rate_limits(expires_at);
commit;
