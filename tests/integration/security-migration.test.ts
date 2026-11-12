// @vitest-environment node
import {afterAll,beforeAll,describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {pg_trgm} from '@electric-sql/pglite/contrib/pg_trgm';
import {pgcrypto} from '@electric-sql/pglite/contrib/pgcrypto';
const pg=new PGlite({extensions:{pg_trgm,pgcrypto}});
const sql=readFileSync('database/migrations/001_init.sql','utf8');
beforeAll(async()=>{await pg.exec(sql);await pg.exec(readFileSync('tests/fixtures/catalog.sql','utf8'))},30000);
afterAll(async()=>{await pg.close()});
describe('PostgreSQL migration and checkout',()=>{
 it('creates tables and loads seed data',async()=>{const {rows}=await pg.query<{count:number}>('select count(*)::int count from products');expect(rows[0].count).toBe(7)});
 it('prices orders from the database, decrements stock and is idempotent',async()=>{const {rows:[user]}=await pg.query<{id:string}>("insert into users(email,password_hash) values('test@example.com','test') returning id");const {rows:[product]}=await pg.query<{id:string;price:number;discount_price:number;stock:number}>('select id,price::int,discount_price::int,stock from products where discount_price is not null limit 1');const args=[user.id,'Ali','Valiyev','+998901234567','test@example.com','Toshkent','Toshkent','Test address','courier','cod','',JSON.stringify([{product_id:product.id,quantity:2,price:1}]),'', 'idempotency-test-123',0];const q='select public.create_order($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15) as id';const first=await pg.query<{id:string}>(q,args);const second=await pg.query<{id:string}>(q,args);expect(second.rows[0].id).toBe(first.rows[0].id);const order=await pg.query<{subtotal:number}>('select subtotal::int from orders where id=$1',[first.rows[0].id]);expect(order.rows[0].subtotal).toBe(product.discount_price*2);const updated=await pg.query<{stock:number}>('select stock from products where id=$1',[product.id]);expect(updated.rows[0].stock).toBe(product.stock-2)});
 it('rejects invalid quantities and insufficient stock atomically',async()=>{const user=(await pg.query<{id:string}>('select id from users limit 1')).rows[0];const product=(await pg.query<{id:string;stock:number}>('select id,stock from products limit 1')).rows[0];const args=[user.id,'Ali','Valiyev','+998901234567','test@example.com','Toshkent','Toshkent','Test address','courier','cod','',JSON.stringify([{product_id:product.id,quantity:product.stock+1}]),'', 'another-key-123',0];await expect(pg.query('select public.create_order($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15)',args)).rejects.toThrow();const updated=await pg.query<{stock:number}>('select stock from products where id=$1',[product.id]);expect(updated.rows[0].stock).toBe(product.stock)});
});
