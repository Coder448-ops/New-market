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
import {saveProduct,saveTaxonomy,updateAdminRecord,deleteProduct} from '@/app/admin/actions';
const form=(data:Record<string,string>)=>{const f=new FormData();for(const [k,v] of Object.entries(data))f.set(k,v);return f};
const product=(extra:Record<string,string>={})=>form({id:'',name:'Namuna emas',slug:'haqiqiy-mahsulot',sku:'',description:'',price:'10000',discount_price:'',stock:'5',main_image:'',category_id:'',brand_id:'',...extra});
beforeAll(async()=>{state.pg=new PGlite({extensions:{pg_trgm,pgcrypto}});await state.pg.exec(readFileSync('database/migrations/001_init.sql','utf8'))},30000);
afterAll(async()=>{await state.pg.close()});
beforeEach(async()=>{state.admin=true;await state.pg.exec('truncate products, categories, brands cascade')});
describe('admin catalogue actions',()=>{
 it('requires administrator permission for writes',async()=>{
  state.admin=false;await expect(saveProduct(product())).rejects.toThrow('Forbidden');await expect(saveTaxonomy(form({}))).rejects.toThrow('Forbidden');await expect(updateAdminRecord(form({}))).rejects.toThrow('Forbidden');await expect(deleteProduct(form({}))).rejects.toThrow('Forbidden');
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
});
