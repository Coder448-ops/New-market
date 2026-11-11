-- NEX MARKET — Development seed data
-- Run AFTER migrations. Product images are placeholders to be replaced
-- with real uploads via Supabase Storage in production.

insert into public.categories (name, slug, description, sort_order) values
  ('Elektronika', 'elektronika', 'Telefonlar, noutbuklar va aksessuarlar', 1),
  ('Maishiy texnika', 'maishiy-texnika', 'Kir yuvish mashinalari, muzlatgichlar', 2),
  ('Kiyim', 'kiyim', 'Erkaklar va ayollar kiyimi', 3),
  ('Poyabzal', 'poyabzal', 'Krossovkalar, etiklar, sandal', 4),
  ('Uy va bog‘', 'uy-va-bog', 'Mebel, dekor va bog‘ jihozlari', 5),
  ('Sport va ochiq havo', 'sport', 'Sport anjomlari va velosipedlar', 6),
  ('Go‘zallik', 'gozallik', 'Kosmetika va parvarish vositalari', 7),
  ('Bolalar', 'bolalar', 'O‘yinchoqlar va bolalar buyumlari', 8)
on conflict (slug) do nothing;

insert into public.categories (name, slug, parent_id, sort_order)
select 'Smartfonlar', 'smartfonlar', id, 1 from public.categories where slug = 'elektronika'
on conflict (slug) do nothing;
insert into public.categories (name, slug, parent_id, sort_order)
select 'Noutbuklar', 'noutbuklar', id, 2 from public.categories where slug = 'elektronika'
on conflict (slug) do nothing;

insert into public.brands (name, slug) values
  ('Samsung', 'samsung'), ('Apple', 'apple'), ('Xiaomi', 'xiaomi'),
  ('LG', 'lg'), ('Bosch', 'bosch'), ('Nike', 'nike'),
  ('Adidas', 'adidas'), ('Artel', 'artel')
on conflict (slug) do nothing;

-- Products (prices in UZS)
insert into public.products (name, slug, description, short_description, sku, brand_id, category_id, price, discount_price, stock, is_published, is_featured, specifications)
select
  'Samsung Galaxy A55 5G 256GB',
  'samsung-galaxy-a55-5g',
  '6.6 dyuymli Super AMOLED ekran, 120Hz, 50MP kamera, 5000mAh batareya.',
  'O‘rta segmentning eng yaxshi smartfoni',
  'SAM-A55-256',
  b.id, c.id, 6490000, 5790000, 24, true, true,
  '{"ekran":"6.6 AMOLED 120Hz","xotira":"256GB","ram":"8GB","batareya":"5000mAh"}'::jsonb
from public.brands b, public.categories c
where b.slug = 'samsung' and c.slug = 'smartfonlar'
on conflict (slug) do nothing;

insert into public.products (name, slug, description, short_description, sku, brand_id, category_id, price, stock, is_published, is_featured, specifications)
select
  'Apple iPhone 15 128GB',
  'apple-iphone-15-128',
  'A16 Bionic chip, 48MP kamera, Dynamic Island.',
  'Apple iPhone 15 — ishonchli va kuchli',
  'APP-IP15-128',
  b.id, c.id, 11990000, 12, true, true,
  '{"ekran":"6.1 OLED","xotira":"128GB","chip":"A16 Bionic"}'::jsonb
from public.brands b, public.categories c
where b.slug = 'apple' and c.slug = 'smartfonlar'
on conflict (slug) do nothing;

insert into public.products (name, slug, description, short_description, sku, brand_id, category_id, price, discount_price, stock, is_published, specifications)
select
  'Xiaomi Redmi Note 13 Pro 256GB',
  'xiaomi-redmi-note-13-pro',
  '200MP kamera, 67W tez zaryad, AMOLED ekran.',
  'Narx/sifat bo‘yicha eng yaxshi tanlov',
  'XIA-RN13P-256',
  b.id, c.id, 4990000, 4490000, 31, true,
  '{"ekran":"6.67 AMOLED","xotira":"256GB","kamera":"200MP"}'::jsonb
from public.brands b, public.categories c
where b.slug = 'xiaomi' and c.slug = 'smartfonlar'
on conflict (slug) do nothing;

insert into public.products (name, slug, description, short_description, sku, brand_id, category_id, price, stock, is_published, specifications)
select
  'LG 55" 4K Smart TV',
  'lg-55-4k-smart-tv',
  '4K UHD, webOS, HDR10, ovozli boshqaruv.',
  'Uy kinoteatri uchun 4K televizor',
  'LG-TV55-4K',
  b.id, c.id, 8990000, 8, true,
  '{"diagonal":"55 dyuym","rezolyutsiya":"4K","tizim":"webOS"}'::jsonb
from public.brands b, public.categories c
where b.slug = 'lg' and c.slug = 'elektronika'
on conflict (slug) do nothing;

insert into public.products (name, slug, description, short_description, sku, brand_id, category_id, price, discount_price, stock, is_published, specifications)
select
  'Bosch Kir yuvish mashinasi 8kg',
  'bosch-kir-yuvish-8kg',
  '1400 aylanish/daq, A+++ energiya sinfi, inverter motor.',
  'Sokin va tejamkor kir yuvish',
  'BOS-WAT-8KG',
  b.id, c.id, 7490000, 6790000, 6, true,
  '{"sigim":"8kg","aylanish":"1400","sinf":"A+++"}'::jsonb
from public.brands b, public.categories c
where b.slug = 'bosch' and c.slug = 'maishiy-texnika'
on conflict (slug) do nothing;

insert into public.products (name, slug, description, short_description, sku, brand_id, category_id, price, stock, is_published, specifications)
select
  'Nike Air Max Krossovka',
  'nike-air-max',
  'Yengil va qulay sport krossovkasi, Air yostiqcha.',
  'Kunlik kiyish uchun qulay',
  'NIK-AM-42',
  b.id, c.id, 1890000, 40, true,
  '{"olcham":"42","material":"to‘qima"}'::jsonb
from public.brands b, public.categories c
where b.slug = 'nike' and c.slug = 'poyabzal'
on conflict (slug) do nothing;

insert into public.products (name, slug, description, short_description, sku, brand_id, category_id, price, stock, is_published, is_featured, specifications)
select
  'Artel Muzlatgich 360L',
  'artel-muzlatgich-360',
  'No Frost, inverter kompressor, 360 litr hajm.',
  'Keng va tejamkor muzlatgich',
  'ART-FR-360',
  b.id, c.id, 5290000, 15, true, true,
  '{"hajm":"360L","tizim":"No Frost"}'::jsonb
from public.brands b, public.categories c
where b.slug = 'artel' and c.slug = 'maishiy-texnika'
on conflict (slug) do nothing;

insert into public.banners (title, subtitle, image_url, link_url, position, sort_order) values
  ('Katta chegirmalar', 'Elektronikada 40% gacha chegirma', null, '/catalog?category=elektronika', 'hero', 1),
  ('Yangi mahsulotlar', 'Eng so‘nggi modellar allaqachon sotuvda', null, '/catalog', 'hero', 2)
on conflict do nothing;

insert into public.coupons (code, discount_type, discount_value, min_order, max_discount, expires_at) values
  ('NEX10', 'percent', 10, 100000, 200000, now() + interval '90 days'),
  ('WELCOME50000', 'fixed', 50000, 500000, null, now() + interval '90 days')
on conflict (code) do nothing;

insert into public.site_settings (key, value) values
  ('store_name', '"NEX MARKET"'),
  ('store_phone', '"+998 71 200 00 00"'),
  ('store_email', '"info@nexmarket.uz"'),
  ('delivery_fee', '25000'),
  ('free_delivery_threshold', '500000')
on conflict (key) do nothing;
