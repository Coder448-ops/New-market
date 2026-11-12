import {showcaseCategories,showcaseProducts} from '@/lib/showcase/products';

// One atomic, insert-only operation. Existing slugs and SKUs are never overwritten.
export const importShowcaseSql = `
with categories_input as (
 select * from jsonb_to_recordset($1::jsonb) as x(name text, slug text, sort_order int)
), inserted_categories as (
 insert into categories(name, slug, sort_order, is_active)
 select name, slug, sort_order, true from categories_input
 on conflict do nothing returning id, slug
), category_map as (
 select id, slug from inserted_categories
 union all
 select c.id, c.slug from categories c join categories_input i on i.slug=c.slug
), products_input as (
 select * from jsonb_to_recordset($2::jsonb) as x(name text, slug text, sku text, price bigint, main_image text, category_slug text)
), inserted_products as (
 insert into products(name, slug, sku, description, price, stock, main_image, category_id, is_published, is_featured)
 select p.name, p.slug, p.sku,
  'Sinov uchun kiritilgan mahsulot. Rasm, narx va ombor qoldig‘i haqiqiy savdo uchun tasdiqlanmagan.',
  p.price, 10, p.main_image, c.id, true, true
 from products_input p join category_map c on c.slug=p.category_slug
 on conflict do nothing returning id
)
select count(*)::int as inserted from inserted_products`;

export function showcaseImportValues(){
 const categories=showcaseCategories.map((c,i)=>({name:c.title,slug:`nex-sinov-${c.id}`,sort_order:100+i}));
 const products=showcaseProducts.map(p=>({name:p.name,slug:`nex-sinov-${String(p.id).padStart(2,'0')}`,sku:`NEX-SINOV-${String(p.id).padStart(2,'0')}`,price:p.price,main_image:p.image,category_slug:`nex-sinov-${p.category.id}`}));
 return [JSON.stringify(categories),JSON.stringify(products)];
}
