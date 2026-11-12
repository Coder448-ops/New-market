-- Apply once after 001, 002 and 003, in the same database. No existing users are deleted.
begin;
alter table public.users alter column email drop not null;
alter table public.users add column phone_e164 text unique;
alter table public.users add column phone_verified_at timestamptz;
alter table public.users add constraint users_phone_format check (phone_e164 is null or phone_e164 ~ '^\+998[0-9]{9}$');
alter table public.auth_2fa_challenges add column pending_email text;
-- Old pending enable challenges do not contain the email needed by the new flow.
delete from public.auth_2fa_challenges where purpose='enable';
create table public.phone_verifications (
 challenge_hash text primary key,
 phone_e164 text not null check (phone_e164 ~ '^\+998[0-9]{9}$'),
 purpose text not null check (purpose in ('register','attach')),
 password_hash text,
 first_name text,
 last_name text,
 user_id uuid references public.users(id) on delete cascade,
 session_hash text,
 verification_sid text not null,
 attempts integer not null default 0 check (attempts between 0 and 5),
 expires_at timestamptz not null,
 created_at timestamptz not null default now(),
 check ((purpose='register' and password_hash is not null and first_name is not null and last_name is not null and user_id is null and session_hash is null) or (purpose='attach' and user_id is not null and session_hash is not null and password_hash is null))
);
create index phone_verifications_expiry_idx on public.phone_verifications(expires_at);
commit;
