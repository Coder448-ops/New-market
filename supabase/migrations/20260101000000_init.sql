-- NEX MARKET — Initial schema
-- PostgreSQL + Supabase. All money values are in UZS (integer, no decimals).

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ============ Helpers ============
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============ Profiles & roles ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
create index idx_user_roles_user on public.user_roles(user_id);

create or replace function public.is_admin(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles r
    where r.user_id = uid and r.role = 'admin'
  );
$$;



create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Uy',
  region text not null default 'Toshkent',
  city text not null default '',
  street text not null default '',
  building text,
  apartment text,
  postal_code text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_addresses_user on public.addresses(user_id);

-- ============ Catalog ============
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_categories_parent on public.categories(parent_id);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo_url text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  short_description text,
  sku text unique,
  brand_id uuid references public.brands(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  price bigint not null check (price >= 0),
  discount_price bigint check (discount_price is null or (discount_price >= 0 and discount_price < price)),
  stock int not null default 0 check (stock >= 0),
  main_image text,
  specifications jsonb not null default '{}'::jsonb,
  rating numeric(3,2) not null default 0 check (rating >= 0 and rating <= 5),
  review_count int not null default 0 check (review_count >= 0),
  is_published boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_products_category on public.products(category_id);
create index idx_products_brand on public.products(brand_id);
create index idx_products_published on public.products(is_published);
create index idx_products_featured on public.products(is_featured);
create index idx_products_price on public.products(price);
create index idx_products_name_trgm on public.products using gin (name gin_trgm_ops);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index idx_product_images_product on public.product_images(product_id);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sku text unique,
  price bigint not null check (price >= 0),
  stock int not null default 0 check (stock >= 0),
  attributes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_variants_product on public.product_variants(product_id);

-- ============ Cart ============
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or session_id is not null)
);
create unique index uq_carts_user on public.carts(user_id) where user_id is not null;
create unique index uq_carts_session on public.carts(session_id) where session_id is not null;

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (cart_id, product_id, variant_id)
);
create index idx_cart_items_cart on public.cart_items(cart_id);

-- ============ Orders ============
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  payment_method text not null check (payment_method in ('cod','payme','click')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid','paid','failed','refunded')),
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text,
  region text not null default 'Toshkent',
  city text not null default '',
  address text not null,
  delivery_method text not null default 'courier' check (delivery_method in ('courier','pickup')),
  notes text,
  subtotal bigint not null check (subtotal >= 0),
  discount_total bigint not null default 0 check (discount_total >= 0),
  delivery_fee bigint not null default 0 check (delivery_fee >= 0),
  total bigint not null check (total >= 0),
  coupon_code text,
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_orders_user on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_created on public.orders(created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  sku text,
  unit_price bigint not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  line_total bigint not null check (line_total >= 0),
  created_at timestamptz not null default now()
);
create index idx_order_items_order on public.order_items(order_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null check (provider in ('payme','click','cod')),
  provider_txn_id text,
  amount bigint not null check (amount >= 0),
  status text not null default 'pending'
    check (status in ('pending','processing','succeeded','failed','refunded')),
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_payments_order on public.payments(order_id);

-- ============ Engagement ============
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  rating int not null check (rating >= 1 and rating <= 5),
  title text,
  comment text,
  is_verified_purchase boolean not null default false,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index idx_reviews_product on public.reviews(product_id);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value bigint not null check (discount_value > 0 and (discount_type <> 'percent' or discount_value <= 100)),
  min_order bigint not null default 0 check (min_order >= 0),
  max_discount bigint check (max_discount is null or max_discount >= 0),
  usage_limit int check (usage_limit is null or usage_limit > 0),
  used_count int not null default 0 check (used_count >= 0),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  discount bigint not null check (discount >= 0),
  created_at timestamptz not null default now()
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  link_url text,
  position text not null default 'hero',
  sort_order int not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  data jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on public.notifications(user_id, is_read);

create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','addresses','categories','brands','products','product_variants',
    'carts','orders','payments','reviews','coupons','banners','site_settings'
  ] loop
    execute format(
      'create trigger trg_%s_updated before update on public.%I
       for each row execute function public.set_updated_at();', t, t);
  end loop;
end $$;

-- ============ Rating recalculation ============
create or replace function public.recalc_product_rating(p_product_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.products p
  set rating = coalesce(sub.avg_rating, 0),
      review_count = coalesce(sub.cnt, 0)
  from (
    select avg(rating)::numeric(3,2) as avg_rating, count(*)::int as cnt
    from public.reviews
    where product_id = p_product_id and is_approved = true
  ) sub
  where p.id = p_product_id;
end;
$$;

-- ============ Atomic checkout ============
-- Creates order + items, decrements stock, applies coupon.
-- Returns the new order id. Raises exception on any validation failure.
create or replace function public.create_order(
  p_user_id uuid,
  p_first_name text, p_last_name text, p_phone text, p_email text,
  p_region text, p_city text, p_address text,
  p_delivery_method text, p_payment_method text, p_notes text,
  p_items jsonb, p_coupon_code text, p_idempotency_key text,
  p_delivery_fee bigint
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_subtotal bigint := 0;
  v_discount bigint := 0;
  v_total bigint;
  v_order_id uuid;
  v_order_number text;
  v_item jsonb;
  v_product record;
  v_variant record;
  v_coupon record;
  v_existing uuid;
begin
  -- Idempotency: return existing order for the same key
  if p_idempotency_key is not null then
    select id into v_existing from public.orders where idempotency_key = p_idempotency_key and user_id = p_user_id;
    if v_existing is not null then
      return v_existing;
    end if;
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 100 then
    raise exception 'Cart is empty';
  end if;

  -- Validate + price every item from the DB (never trust client prices)
  for v_item in select * from jsonb_array_elements(p_items) loop
    if coalesce((v_item->>'quantity')::int, 0) < 1 or (v_item->>'quantity')::int > 100 then raise exception 'Invalid quantity'; end if;
    if (v_item->>'variant_id') is not null then
      select * into v_variant from public.product_variants
       where id = (v_item->>'variant_id')::uuid and product_id = (v_item->>'product_id')::uuid and exists (select 1 from public.products p where p.id = product_id and p.is_published) for update;
      if not found then raise exception 'Variant not found'; end if;
      if v_variant.stock < (v_item->>'quantity')::int then
        raise exception 'Insufficient stock for variant %', v_variant.name;
      end if;
      v_subtotal := v_subtotal + v_variant.price * (v_item->>'quantity')::int;
    else
      select * into v_product from public.products
       where id = (v_item->>'product_id')::uuid and is_published = true for update;
      if not found then raise exception 'Product not available: %', v_item->>'product_id'; end if;
      if v_product.stock < (v_item->>'quantity')::int then
        raise exception 'Insufficient stock for product %', v_product.name;
      end if;
      v_subtotal := v_subtotal + coalesce(v_product.discount_price, v_product.price) * (v_item->>'quantity')::int;
    end if;
  end loop;

  -- Coupon
  if p_coupon_code is not null and p_coupon_code <> '' then
    select * into v_coupon from public.coupons
     where code = upper(p_coupon_code) and is_active = true
       and starts_at <= now() and (expires_at is null or expires_at > now()) for update;
    if not found then raise exception 'Coupon is not valid'; end if;
    if v_subtotal < v_coupon.min_order then raise exception 'Coupon minimum order not met'; end if;
    if v_coupon.usage_limit is not null and v_coupon.used_count >= v_coupon.usage_limit then
      raise exception 'Coupon usage limit reached';
    end if;
    if v_coupon.discount_type = 'percent' then
      v_discount := (v_subtotal * v_coupon.discount_value) / 100;
      if v_coupon.max_discount is not null and v_discount > v_coupon.max_discount then
        v_discount := v_coupon.max_discount;
      end if;
    else
      v_discount := least(v_coupon.discount_value, v_subtotal);
    end if;
  end if;

  -- Fees are derived on the server, never from client input.
  p_delivery_fee := case when p_delivery_method = 'pickup' or v_subtotal - v_discount >= 500000 then 0 else 25000 end;
  v_total := v_subtotal - v_discount + p_delivery_fee;
  if v_total < 0 then v_total := 0; end if;

  v_order_number := 'NX-' || to_char(now(), 'YYYYMMDD') || '-' ||
    upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));

  insert into public.orders (
    order_number, user_id, status, payment_method, payment_status,
    first_name, last_name, phone, email, region, city, address,
    delivery_method, notes, subtotal, discount_total, delivery_fee,
    total, coupon_code, idempotency_key
  ) values (
    v_order_number, p_user_id, 'pending', p_payment_method,
    case when p_payment_method = 'cod' then 'unpaid' else 'unpaid' end,
    p_first_name, p_last_name, p_phone, p_email, p_region, p_city, p_address,
    p_delivery_method, p_notes, v_subtotal, v_discount, p_delivery_fee,
    v_total, nullif(upper(p_coupon_code), ''), p_idempotency_key
  ) returning id into v_order_id;

  -- Items + stock decrement
  for v_item in select * from jsonb_array_elements(p_items) loop
    if (v_item->>'variant_id') is not null then
      select * into v_variant from public.product_variants
       where id = (v_item->>'variant_id')::uuid;
      update public.product_variants set stock = stock - (v_item->>'quantity')::int
       where id = v_variant.id;
      insert into public.order_items (order_id, product_id, variant_id, product_name, sku, unit_price, quantity, line_total)
      values (v_order_id, v_variant.product_id, v_variant.id,
              (select name from public.products where id = v_variant.product_id) || ' — ' || v_variant.name,
              v_variant.sku, v_variant.price, (v_item->>'quantity')::int,
              v_variant.price * (v_item->>'quantity')::int);
    else
      select * into v_product from public.products where id = (v_item->>'product_id')::uuid;
      update public.products set stock = stock - (v_item->>'quantity')::int where id = v_product.id;
      insert into public.order_items (order_id, product_id, product_name, sku, unit_price, quantity, line_total)
      values (v_order_id, v_product.id, v_product.name, v_product.sku,
              coalesce(v_product.discount_price, v_product.price), (v_item->>'quantity')::int,
              coalesce(v_product.discount_price, v_product.price) * (v_item->>'quantity')::int);
    end if;
  end loop;

  -- Coupon redemption
  if p_coupon_code is not null and p_coupon_code <> '' then
    update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
    insert into public.coupon_redemptions (coupon_id, user_id, order_id, discount)
    values (v_coupon.id, p_user_id, v_order_id, v_discount);
  end if;

  return v_order_id;
end;
$$;

-- ============ Row Level Security ============
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.favorites enable row level security;
alter table public.reviews enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.banners enable row level security;
alter table public.notifications enable row level security;
alter table public.site_settings enable row level security;

-- Public read: catalog
create policy "public read categories" on public.categories for select using (is_active = true);
create policy "public read brands" on public.brands for select using (is_active = true);
create policy "public read products" on public.products for select using (is_published = true);
create policy "public read product images" on public.product_images for select using (true);
create policy "public read variants" on public.product_variants for select using (true);
create policy "public read banners" on public.banners for select using (is_active = true);
create policy "public read approved reviews" on public.reviews for select using (is_approved = true);
create policy "public read settings" on public.site_settings for select using (true);

-- Profiles: own + admin
create policy "own profile" on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "admin profiles" on public.profiles for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Roles: own read, admin all
create policy "own roles read" on public.user_roles for select using (auth.uid() = user_id);
create policy "admin roles" on public.user_roles for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Addresses: own + admin
create policy "own addresses" on public.addresses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "admin addresses" on public.addresses for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Catalog admin write
create policy "admin categories" on public.categories for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admin brands" on public.brands for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admin products" on public.products for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admin product images" on public.product_images for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admin variants" on public.product_variants for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admin banners" on public.banners for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admin settings" on public.site_settings for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Carts: owner (user or session via service role in app) + admin
create policy "own carts" on public.carts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "admin carts" on public.carts for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "own cart items" on public.cart_items for all
  using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));
create policy "admin cart items" on public.cart_items for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Orders: own read/insert, admin all. Customers cannot change prices/status:
-- update is restricted to admin only.
create policy "own orders read" on public.orders for select using (auth.uid() = user_id);
create policy "own orders insert" on public.orders for insert with check (auth.uid() = user_id);
create policy "admin orders" on public.orders for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "own order items read" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "admin order items" on public.order_items for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Payments: admin only (service role handles provider callbacks)
create policy "admin payments" on public.payments for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Favorites: own + admin
create policy "own favorites" on public.favorites for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "admin favorites" on public.favorites for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Reviews: own write, public approved read, admin all
create policy "own reviews" on public.reviews for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "admin reviews" on public.reviews for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Coupons: admin only
create policy "admin coupons" on public.coupons for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admin redemptions" on public.coupon_redemptions for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Notifications: own + admin
create policy "own notifications" on public.notifications for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "admin notifications" on public.notifications for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ============ Storage buckets ============
insert into storage.buckets (id, name, public) values
  ('product-images', 'product-images', true),
  ('banners', 'banners', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "public read product-images" on storage.objects for select
  using (bucket_id = 'product-images');
create policy "admin upload product-images" on storage.objects for insert
  using (bucket_id = 'product-images' and public.is_admin(auth.uid()));
create policy "admin update product-images" on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin(auth.uid()));
create policy "admin delete product-images" on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin(auth.uid()));

create policy "public read banners" on storage.objects for select
  using (bucket_id = 'banners');
create policy "admin upload banners" on storage.objects for insert
  using (bucket_id = 'banners' and public.is_admin(auth.uid()));
create policy "admin update banners" on storage.objects for update
  using (bucket_id = 'banners' and public.is_admin(auth.uid()));
create policy "admin delete banners" on storage.objects for delete
  using (bucket_id = 'banners' and public.is_admin(auth.uid()));

create policy "own read avatars" on storage.objects for select
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own upload avatars" on storage.objects for insert
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own update avatars" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own delete avatars" on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============ Profile auto-creation ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name, last_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', null)
  )
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Checkout is exclusively invoked by trusted backend code. Never permit direct
-- client insertion of totals, order status, or arbitrary user IDs.
drop policy "own orders insert" on public.orders;
revoke all on function public.create_order(uuid,text,text,text,text,text,text,text,text,text,text,jsonb,text,text,bigint) from public, anon, authenticated;
grant execute on function public.create_order(uuid,text,text,text,text,text,text,text,text,text,text,jsonb,text,text,bigint) to service_role;
-- Reviews require a delivered purchase and can never be self-approved.
drop policy "own reviews" on public.reviews;
create policy "own reviews read" on public.reviews for select using (auth.uid() = user_id);
create policy "verified review insert" on public.reviews for insert with check (
  auth.uid() = user_id and is_approved = false and is_verified_purchase = true
  and exists (select 1 from public.orders o join public.order_items i on i.order_id = o.id
    where o.id = reviews.order_id and o.user_id = auth.uid() and o.status = 'delivered' and i.product_id = reviews.product_id)
);

create or replace function public.refresh_review_rating()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op <> 'INSERT' then perform public.recalc_product_rating(old.product_id); end if;
  if tg_op <> 'DELETE' then perform public.recalc_product_rating(new.product_id); end if;
  return null;
end;
$$;
create trigger review_rating_changed after insert or update or delete on public.reviews
for each row execute function public.refresh_review_rating();
