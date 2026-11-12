// @vitest-environment node
import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {pg_trgm} from '@electric-sql/pglite/contrib/pg_trgm';
import {pgcrypto} from '@electric-sql/pglite/contrib/pgcrypto';
const migration=readFileSync('database/migrations/001_init.sql','utf8');
describe('migration safety',()=>{
 it('refuses an existing public table without modifying its data or creating app tables',async()=>{
  const pg=new PGlite({extensions:{pg_trgm,pgcrypto}});
  try{
   await pg.exec("create table existing_data (id integer primary key); insert into existing_data values (42)");
   await expect(pg.exec(migration)).rejects.toThrow('requires an empty public schema');
   await pg.exec('rollback');
   const data=await pg.query<{id:number}>('select id from existing_data');
   expect(data.rows).toEqual([{id:42}]);
   const tables=await pg.query<{name:string|null}>("select to_regclass('public.categories')::text as name");
   expect(tables.rows[0].name).toBeNull();
  }finally{await pg.close()}
 },30000);
});
