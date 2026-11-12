// @vitest-environment node
import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
const sql=readFileSync('database/migrations/002_auth_rate_limit.sql','utf8');
describe('auth rate-limit migration',()=>{
 it('can be re-run and preserves existing data',async()=>{
  const pg=new PGlite();try{
   await pg.exec(sql);await pg.exec("insert into auth_rate_limits values ('existing',2,now()+interval '1 hour')");
   await pg.exec(sql);
   expect((await pg.query<{key_hash:string;attempts:number}>('select key_hash,attempts from auth_rate_limits')).rows).toEqual([{key_hash:'existing',attempts:2}]);
  }finally{await pg.close()}
 },30000);
 it('rejects an incompatible same-named table without changing it',async()=>{
  const pg=new PGlite();try{
   await pg.exec("create table auth_rate_limits (important text); insert into auth_rate_limits values ('preserve me')");
   await expect(pg.exec(sql)).rejects.toThrow('incompatible structure');await pg.exec('rollback');
   expect((await pg.query<{important:string}>('select important from auth_rate_limits')).rows).toEqual([{important:'preserve me'}]);
  }finally{await pg.close()}
 },30000);
 it('rejects an index with the correct name but wrong table and rolls back',async()=>{
  const pg=new PGlite();try{
   await pg.exec('create table other_table (created_at timestamptz); create index auth_rate_limits_expires_idx on other_table(created_at)');
   await expect(pg.exec(sql)).rejects.toThrow('incompatible structure');await pg.exec('rollback');
   expect((await pg.query<{name:string|null}>("select to_regclass('public.auth_rate_limits')::text as name")).rows[0].name).toBeNull();
  }finally{await pg.close()}
 },30000);
});
