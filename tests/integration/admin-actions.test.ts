// @vitest-environment node
import {beforeAll,afterAll,beforeEach,describe,it,expect,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {pg_trgm} from '@electric-sql/pglite/contrib/pg_trgm';
import {pgcrypto} from '@electric-sql/pglite/contrib/pgcrypto';
const state=vi.hoisted(()=>({pg:null as unknown as PGlite,admin:true}));
vi.mock('server-only',()=>({}));
vi.mock('@/lib/db',()=>({db:()=>({query:(sql:string,params?:unknown[])=>state.pg.query(sql,params)})}));
vi.mock('@/lib/auth/session',()=>({requireAdmin:async()=>state.admin?{user:{id:'admin'}}:{error:'Forbidden'}}));
vi.mock('next/cache',()=>({revalidatePath:()=>{}}));
import {saveProduct,saveTaxonomy,updateAdminRecord,deleteProduct,importTestProducts} from '@/app/admin/actions';
const form=(data:Record<string,string>)=>{const f=new FormData();for(const [k,v] of Object.entries(data))f.set(k,v);return f};
const product=(extra:Record<string,string>={})=>form({id:'',name:'Namuna emas',slug:'haqiqiy-mahsulot',sku:'',description:'',price:'10000',discount_price:'',stock:'5',main_image:'',category_id:'',brand_id:'',...extra});
beforeAll(async()=>{state.pg=new PGlite({extensions:{pg_trgm,pgcrypto}});await state.pg.exec(readFileSync('database/migrations/001_init.sql','utf8'))},30000);
afterAll(async()=>{await state.pg.close()});
beforeEach(async()=>{state.admin=true;await state.pg.exec('truncate products, categories, brands cascade')});
describe('admin catalogue actions',()=>{
 it('requires administrator permission for writes',async()=>{
  state.admin=false;await expect(importTestProducts(form({confirm:'on'}))).rejects.toThrow('Forbidden');await expect(saveProduct(product())).rejects.toThrow('Forbidden');await expect(saveTaxonomy(form({}))).rejects.toThrow('Forbidden');await expect(updateAdminRecord(form({}))).rejects.toThrow('Forbidden');await expect(deleteProduct(form({}))).rejects.toThrow('Forbidden');
  expect((await state.pg.query('select id from products')).rows).toHaveLength(0);
 });
 it('creates and edits real category, brand and product without touching existing rows',async()=>{
  await saveTaxonomy(form({type:'categories',id:'',name:'Texnika',slug:'texnika',is_active:'on'}));
  await saveTaxonomy(form({type:'brands',id:'',name:'Brend',slug:'brend',is_active:'on'}));
  const category=(await state.pg.query<{id:string}>('select id from categories')).rows[0].id,brand=(await state.pg.query<{id:string}>('select id from brands')).rows[0].id;
  await saveProduct(product({category_id:category,brand_id:brand,main_image:'https://example.com/image.jpg',discount_price:'9000',is_published:'on'}));
  const result=await state.pg.query<{id:string;name:string;category_id:string;brand_id:string;phone:string|null;discount_price:string;is_published:boolean}>('select * from products');
  const row=result.rows[0];expect(row.name).toBe('Namuna emas');expect(row.category_id).toBe(category);expect(row.brand_id).toBe(brand);expect(Number(row.discount_price)).toBe(9000);expect(row.is_published).toBe(true);
  await saveProduct(product({id:row.id,name:'Yangi nom',category_id:category,brand_id:brand,stock:'8'}));
  expect((await state.pg.query<{name:string;stock:number}>('select name,stock from products')).rows).toEqual([{name:'Yangi nom',stock:8}]);
  await saveTaxonomy(form({type:'categories',id:category,name:'Yangi turkum',slug:'yangi-turkum'}));
  expect((await state.pg.query<{is_active:boolean}>('select is_active from categories')).rows[0].is_active).toBe(false);
 });
 it('rejects bad data, non-HTTPS images and unsupported taxonomy tables',async()=>{
  await expect(saveProduct(product({discount_price:'10000'}))).rejects.toThrow();
  await expect(saveProduct(product({main_image:'http://example.com/a.jpg'}))).rejects.toThrow();
  await expect(saveTaxonomy(form({type:'users',id:'',name:'Oops',slug:'oops'}))).rejects.toThrow();
  expect((await state.pg.query('select id from products')).rows).toHaveLength(0);
 });
 it('imports 30 items only on admin confirmation, and does not overwrite edits on repeat',async()=>{
  await expect(importTestProducts(form({}))).rejects.toThrow('Tasdiqlash');
  await importTestProducts(form({confirm:'on'}));
  let rows=(await state.pg.query<{sku:string;price:number;stock:number;main_image:string;category_id:string}>('select sku,price,stock,main_image,category_id from products order by sku')).rows;
  expect(rows).toHaveLength(30);expect(rows.every(p=>p.stock===10&&p.category_id&&p.main_image)).toBe(true);
  await state.pg.query('update products set price=42 where sku=$1',[rows[0].sku]);
  await importTestProducts(form({confirm:'on'}));
  rows=(await state.pg.query('select sku,price,stock,main_image,category_id from products order by sku')).rows as typeof rows;
  expect(rows).toHaveLength(30);expect(Number(rows[0].price)).toBe(42);
  expect((await state.pg.query('select * from categories')).rows).toHaveLength(6);
 });

 it('manual SQL import matches the admin import and can be run twice without changing prices',async()=>{
  await state.pg.exec(readFileSync('database/import-test-products.sql','utf8'));
  const first=await state.pg.query<{sku:string;price:number}>('select sku,price from products order by sku');
  expect(first.rows).toHaveLength(30);
  await state.pg.query('update products set price=99 where sku=$1',[first.rows[0].sku]);
  await state.pg.exec(readFileSync('database/import-test-products.sql','utf8'));
  const after=await state.pg.query<{price:number}>('select price from products where sku=$1',[first.rows[0].sku]);
  expect(Number(after.rows[0].price)).toBe(99);
  expect((await state.pg.query('select * from products')).rows).toHaveLength(30);
 });

 it('allows an imported item through the database order function and reduces stock',async()=>{
  await importTestProducts(form({confirm:'on'}));
  const p=(await state.pg.query<{id:string;price:number}>('select id,price from products where sku=$1',['NEX-SINOV-01'])).rows[0];
  const user=(await state.pg.query<{id:string}>("insert into users(email,password_hash) values('order-test@example.invalid','not-a-real-password') returning id")).rows[0];
  const result=await state.pg.query<{id:string}>("select public.create_order($1,'Test','User','+998901234567',null,'Toshkent','Toshkent','Test address','pickup','cod','',$2::jsonb,'','test-order-import',0) as id",[user.id,JSON.stringify([{product_id:p.id,quantity:1}])]);
  expect(result.rows[0].id).toBeTruthy();
  const row=(await state.pg.query<{stock:number}>('select stock from products where id=$1',[p.id])).rows[0];
  expect(row.stock).toBe(9);
 });

});
