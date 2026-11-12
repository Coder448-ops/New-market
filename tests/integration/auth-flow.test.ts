// @vitest-environment node
import {beforeAll,afterAll,beforeEach,describe,it,expect,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {pg_trgm} from '@electric-sql/pglite/contrib/pg_trgm';
import {pgcrypto} from '@electric-sql/pglite/contrib/pgcrypto';

vi.mock('server-only',()=>({}));
const state=vi.hoisted(()=>({pg:null as unknown as PGlite,mail:[] as {token:string;purpose:string}[],cookies:new Map<string,string>()}));
vi.mock('@/lib/db',()=>({isDatabaseConfigured:()=>true,db:()=>({query:(sql:string,params?:unknown[])=>state.pg.query(sql,params),connect:async()=>({query:(sql:string,params?:unknown[])=>state.pg.query(sql,params),release:()=>{}})})}));
vi.mock('@/lib/mail',()=>({isMailConfigured:()=>true,sendAuthMail:async(_email:string,token:string,purpose:string)=>{state.mail.push({token,purpose})}}));
vi.mock('next/headers',()=>({cookies:async()=>({get:(key:string)=>state.cookies.has(key)?{value:state.cookies.get(key)}:undefined,set:(key:string,val:string)=>state.cookies.set(key,val),delete:(key:string)=>state.cookies.delete(key)})}));
vi.mock('next/navigation',()=>({redirect:(url:string)=>{throw new Error('REDIRECT '+url)}}));
import {login,register,confirmEmail,resetPassword,updatePassword,logout} from '@/app/actions';
import {hashToken} from '@/lib/auth/session';
import {checkAuthRateLimit} from '@/lib/auth/rate-limit';
import {GET} from '@/app/auth/callback/route';
import {NextRequest} from 'next/server';

const form=(data:Record<string,string>)=>{const f=new FormData();for(const [k,v] of Object.entries(data))f.set(k,v);return f};
const registration=(password:string)=>form({email:'buyer@example.test',firstName:'Test',lastName:'Buyer',password});
beforeAll(async()=>{state.pg=new PGlite({extensions:{pg_trgm,pgcrypto}});await state.pg.exec(readFileSync('database/migrations/001_init.sql','utf8'));await state.pg.exec(readFileSync('database/migrations/002_auth_rate_limit.sql','utf8'));},30000);
afterAll(async()=>{await state.pg.close()});
beforeEach(async()=>{state.mail=[];state.cookies.clear();await state.pg.exec('truncate users cascade; truncate auth_rate_limits')});

describe('database-backed authentication',()=>{
 it('registers, rejects old links after re-registration, verifies, logs in and resets all sessions and reset links',async()=>{
  await expect(register(registration('old-password'))).rejects.toThrow('REDIRECT /verify-email');const old=state.mail[0].token;
  await expect(register(registration('new-password'))).rejects.toThrow('REDIRECT /verify-email');const verify=state.mail[1].token;
  const oldRow=await state.pg.query('select 1 from auth_tokens where token_hash=$1',[hashToken(old)]);expect(oldRow.rows).toHaveLength(0);
  const response=await GET(new NextRequest('https://shop.test/auth/callback?purpose=verify&token='+verify));
  expect(response.status).toBe(307);expect(response.headers.get('location')).toContain('/verify-email?confirm=1');
  expect((await state.pg.query('select 1 from auth_tokens where token_hash=$1',[hashToken(verify)])).rows).toHaveLength(1);
  state.cookies.set('nex_verify',verify);await expect(confirmEmail()).rejects.toThrow('REDIRECT /login?verified=1');
  await expect(login(form({email:'buyer@example.test',password:'old-password'}))).rejects.toThrow('REDIRECT /login?error=auth');
  await expect(login(form({email:'buyer@example.test',password:'new-password'}))).rejects.toThrow('REDIRECT /account');
  expect(state.cookies.get('nex_session')).toBeTruthy();
  await expect(resetPassword(form({email:'buyer@example.test'}))).rejects.toThrow('REDIRECT /forgot-password?sent=1');const reset1=state.mail.at(-1)!.token;
  await expect(resetPassword(form({email:'buyer@example.test'}))).rejects.toThrow('REDIRECT /forgot-password?sent=1');const reset2=state.mail.at(-1)!.token;
  state.cookies.set('nex_reset',reset1);await expect(updatePassword(form({password:'updated-password'}))).rejects.toThrow('REDIRECT /login?reset=1');
  expect((await state.pg.query('select 1 from sessions')).rows).toHaveLength(0);
  expect((await state.pg.query('select 1 from auth_tokens where token_hash=$1',[hashToken(reset2)])).rows).toHaveLength(0);
  await expect(login(form({email:'buyer@example.test',password:'updated-password'}))).rejects.toThrow('REDIRECT /account');
  await expect(logout()).rejects.toThrow('REDIRECT /');expect((await state.pg.query('select 1 from sessions')).rows).toHaveLength(0);
 },30000);
 it('limits requests across instances and restarts expired windows',async()=>{
  expect(await checkAuthRateLimit('login:test',2,60)).toBe(true);
  expect(await checkAuthRateLimit('login:test',2,60)).toBe(true);
  expect(await checkAuthRateLimit('login:test',2,60)).toBe(false);
  await state.pg.exec("update auth_rate_limits set expires_at=now()-interval '1 second'");
  expect(await checkAuthRateLimit('login:test',2,60)).toBe(true);
 });
});
