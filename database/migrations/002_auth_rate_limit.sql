-- Run after 001_init.sql in the intended database. Existing compatible data is preserved.
-- Re-running is safe only if the existing table and index match this migration.
-- If a previous SQL command failed, run ROLLBACK separately before this script.
begin;
create table if not exists public.auth_rate_limits (
  key_hash text primary key,
  attempts integer not null check (attempts > 0),
  expires_at timestamptz not null
);

do $$
declare
  table_oid oid := to_regclass('public.auth_rate_limits');
begin
  -- Do not silently accept a same-named object belonging to another application.
  if not exists (select 1 from pg_class where oid = table_oid and relkind = 'r')
     or (select count(*) from pg_attribute where attrelid = table_oid and attnum > 0 and not attisdropped) <> 3
     or not exists (select 1 from pg_attribute where attrelid = table_oid and attname = 'key_hash' and atttypid = 'text'::regtype and attnotnull and not attisdropped)
     or not exists (select 1 from pg_attribute where attrelid = table_oid and attname = 'attempts' and atttypid = 'integer'::regtype and attnotnull and not attisdropped)
     or not exists (select 1 from pg_attribute where attrelid = table_oid and attname = 'expires_at' and atttypid = 'timestamptz'::regtype and attnotnull and not attisdropped)
     or not exists (select 1 from pg_constraint where conrelid = table_oid and contype = 'p' and pg_get_constraintdef(oid) = 'PRIMARY KEY (key_hash)')
     or not exists (select 1 from pg_constraint where conrelid = table_oid and contype = 'c' and pg_get_constraintdef(oid) = 'CHECK ((attempts > 0))') then
    raise exception '002: public.auth_rate_limits already exists with an incompatible structure; no changes applied';
  end if;
end;
$$;

create index if not exists auth_rate_limits_expires_idx on public.auth_rate_limits(expires_at);

do $$
begin
  if not exists (
    select 1 from pg_index i
    join pg_class idx on idx.oid = i.indexrelid
    join pg_am am on am.oid = idx.relam
    join pg_attribute a on a.attrelid = i.indrelid and a.attnum = i.indkey[0]
    where i.indexrelid = to_regclass('public.auth_rate_limits_expires_idx')
      and i.indrelid = to_regclass('public.auth_rate_limits')
      and i.indisvalid and i.indisready and i.indnkeyatts = 1 and i.indnatts = 1
      and i.indpred is null and i.indexprs is null and am.amname = 'btree'
      and a.attname = 'expires_at'
  ) then
    raise exception '002: public.auth_rate_limits_expires_idx exists with an incompatible structure; no changes applied';
  end if;
end;
$$;
commit;
