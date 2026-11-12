// @vitest-environment node
import {beforeAll,afterAll,beforeEach,describe,it,expect,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {pg_trgm} from '@electric-sql/pglite/contrib/pg_trgm';
import {pgcrypto} from '@electric-sql/pglite/contrib/pgcrypto';
vi.mock('server-only',()=>({}));
const state=vi.hoisted(()=>({pg:null as unknown as PGlite,mail:[] as {token:string;purpose:string}[],cookies:new Map<string,string>(),mailConfigured:true,mailFails:false}));
vi.mock('@/lib/db',()=>({isDatabaseConfigured:()=>true,db:()=>({query:(sql:string,params?:unknown[])=>state.pg.query(sql,params),connect:async()=>({query:(sql:string,params?:unknown[])=>state.pg.query(sql,params),release:()=>{}})})}));
vi.mock('@/lib/mail',()=>({isMailConfigured:()=>state.mailConfigured,sendAuthMail:async(_email:string,token:string,purpose:string)=>{state.mail.push({token,purpose})},sendTwoFactorCode:async(_email:string,token:string,purpose:string)=>{if(state.mailFails)throw Error('SMTP unavailable');state.mail.push({token,purpose:'2fa-'+purpose})}}));
vi.mock('next/headers',()=>({cookies:async()=>({get:(key:string)=>state.cookies.has(key)?{value:state.cookies.get(key)}:undefined,set:(key:string,val:string)=>state.cookies.set(key,val),delete:(key:string)=>state.cookies.delete(key)})}));
vi.mock('next/navigation',()=>({redirect:(url:string)=>{throw new Error('REDIRECT '+url)}}));
import {login,legacyLogin,register,startPhoneAttach,confirmEmail,resetPassword,updatePassword,logout,startTwoFactorSettings,verifyTwoFactor} from '@/app/actions';
import {hashPassword,hashToken} from '@/lib/auth/session';
import {checkAuthRateLimit} from '@/lib/auth/rate-limit';
import {GET} from '@/app/auth/callback/route';
import {NextRequest} from 'next/server';
const form=(data:Record<string,string>)=>{const f=new FormData();for(const [k,v] of Object.entries(data))f.set(k,v);return f};
const registration=(password='new-password',phone='901234567')=>form({phone,firstName:'Test',lastName:'Buyer',password});
const phoneLogin=()=>form({phone:'901234567',password:'new-password'});
async function registerUser(){await expect(register(registration())).rejects.toThrow('REDIRECT /login?registered=1')}
beforeAll(async()=>{state.pg=new PGlite({extensions:{pg_trgm,pgcrypto}});for(const migration of ['001_init.sql','002_auth_rate_limit.sql','003_optional_email_2fa.sql','004_phone_login.sql'])await state.pg.exec(readFileSync('database/migrations/'+migration,'utf8'));},30000);
afterAll(async()=>{await state.pg.close()});
beforeEach(async()=>{state.mail=[];state.mailConfigured=true;state.mailFails=false;state.cookies.clear();await state.pg.exec('truncate users cascade; truncate phone_verifications; truncate auth_rate_limits')});

describe('phone and optional email authentication',()=>{
 it('registers without SMS or email and logs in with phone and password',async()=>{
  await registerUser();
  const u=(await state.pg.query<{phone_e164:string;phone_verified_at:Date|null;email:string|null;email_2fa_enabled:boolean}>('select phone_e164,phone_verified_at,email,email_2fa_enabled from users')).rows[0];
  expect(u).toEqual({phone_e164:'+998901234567',phone_verified_at:null,email:null,email_2fa_enabled:false});
  expect(state.mail).toHaveLength(0);
  await expect(login(form({phone:'901234567',password:'bad-password'}))).rejects.toThrow('REDIRECT /login?error=auth');
  await expect(login(phoneLogin())).rejects.toThrow('REDIRECT /account');expect(state.cookies.get('nex_session')).toBeTruthy();expect(state.mail).toHaveLength(0);
  await expect(logout()).rejects.toThrow('REDIRECT /');
 },30000);
 it('does not overwrite an existing account on duplicate registration',async()=>{
  await registerUser();
  await expect(register(registration('attack-password'))).rejects.toThrow('REDIRECT /register?error=duplicate');
  expect((await state.pg.query('select 1 from users')).rows).toHaveLength(1);
  await expect(login(form({phone:'901234567',password:'attack-password'}))).rejects.toThrow('REDIRECT /login?error=auth');
  await expect(login(phoneLogin())).rejects.toThrow('REDIRECT /account');
 },30000);
 it('keeps existing verified phone accounts working',async()=>{
  const hash=await hashPassword('new-password');
  await state.pg.query("insert into users(phone_e164,phone_verified_at,password_hash) values('+998901234567',now(),$1)",[hash]);
  await expect(login(phoneLogin())).rejects.toThrow('REDIRECT /account');
 },30000);
 it('asks for email only to enable two-factor and requires code only after enabling',async()=>{
  await registerUser();await expect(login(phoneLogin())).rejects.toThrow('REDIRECT /account');
  await expect(startTwoFactorSettings(form({purpose:'enable',password:'new-password'}))).rejects.toThrow('REDIRECT /account?security=invalid');
  await expect(startTwoFactorSettings(form({purpose:'enable',password:'new-password',email:'buyer@example.test'}))).rejects.toThrow('REDIRECT /two-factor?settings=1');
  const enableCode=state.mail.at(-1)!.token;
  expect((await state.pg.query<{email:string|null}>('select email from users')).rows[0].email).toBeNull();
  await expect(verifyTwoFactor(form({settings:'1',code:enableCode}))).rejects.toThrow('REDIRECT /account?security=enabled');
  expect((await state.pg.query<{email:string}>('select email from users')).rows[0].email).toBe('buyer@example.test');
  await expect(logout()).rejects.toThrow('REDIRECT /');await expect(login(phoneLogin())).rejects.toThrow('REDIRECT /two-factor');
  expect(state.cookies.get('nex_session')).toBeUndefined();const code=state.mail.at(-1)!.token;const token=state.cookies.get('nex_2fa_login')!;
  const wrong=code==='000000'?'000001':'000000';await expect(verifyTwoFactor(form({code:wrong}))).rejects.toThrow('REDIRECT /two-factor?error=1');
  await expect(verifyTwoFactor(form({code}))).rejects.toThrow('REDIRECT /account');state.cookies.set('nex_2fa_login',token);await expect(verifyTwoFactor(form({code}))).rejects.toThrow('REDIRECT /two-factor?error=1');
  await expect(startTwoFactorSettings(form({purpose:'disable',password:'new-password'}))).rejects.toThrow('REDIRECT /two-factor?settings=1');
  await expect(verifyTwoFactor(form({settings:'1',code:state.mail.at(-1)!.token}))).rejects.toThrow('REDIRECT /account?security=disabled');
  await expect(logout()).rejects.toThrow('REDIRECT /');const mailCount=state.mail.length;await expect(login(phoneLogin())).rejects.toThrow('REDIRECT /account');expect(state.mail).toHaveLength(mailCount);
 },30000);
 it('keeps legacy email accounts accessible and attaches an unverified phone',async()=>{
  const hash=await hashPassword('legacy-password');const u=await state.pg.query<{id:string}>("insert into users(email,email_verified_at,password_hash) values('old@example.test',now(),$1) returning id",[hash]);
  await state.pg.query('insert into profiles(id,first_name,last_name) values($1,$2,$3)',[u.rows[0].id,'Old','User']);
  await expect(legacyLogin(form({email:'old@example.test',password:'legacy-password'}))).rejects.toThrow('REDIRECT /account');
  await expect(startPhoneAttach(form({phone:'901234567',password:'wrong-password'}))).rejects.toThrow('REDIRECT /account?phone=invalid');
  await expect(startPhoneAttach(form({phone:'901234567',password:'legacy-password'}))).rejects.toThrow('REDIRECT /account?phone=attached');
  const account=(await state.pg.query<{phone_e164:string}>('select phone_e164 from users')).rows[0];expect(account.phone_e164).toBe('+998901234567');
  await expect(logout()).rejects.toThrow('REDIRECT /');await expect(legacyLogin(form({email:'old@example.test',password:'legacy-password'}))).rejects.toThrow('REDIRECT /legacy-login?error=auth');
  await expect(login(form({phone:'901234567',password:'legacy-password'}))).rejects.toThrow('REDIRECT /account');
 },30000);
 it('retains old email verification and password-reset flows',async()=>{
  const hash=await hashPassword('old-password');const user=await state.pg.query<{id:string}>("insert into users(email,password_hash) values('old@example.test',$1) returning id",[hash]);
  const token='legacy-verify-token';await state.pg.query("insert into auth_tokens(token_hash,user_id,purpose,expires_at) values($1,$2,'verify',now()+interval '1 hour')",[hashToken(token),user.rows[0].id]);
  const res=await GET(new NextRequest('https://shop.test/auth/callback?purpose=verify&token='+token));expect(res.status).toBe(307);
  state.cookies.set('nex_verify',token);await expect(confirmEmail()).rejects.toThrow('REDIRECT /login?verified=1');
  await expect(resetPassword(form({email:'old@example.test'}))).rejects.toThrow('REDIRECT /forgot-password?sent=1');const reset=state.mail.at(-1)!.token;
  state.cookies.set('nex_reset',reset);await expect(updatePassword(form({password:'updated-password'}))).rejects.toThrow('REDIRECT /login?reset=1');
  await expect(legacyLogin(form({email:'old@example.test',password:'updated-password'}))).rejects.toThrow('REDIRECT /account');
 },30000);
 it('uses database-backed limits',async()=>{expect(await checkAuthRateLimit('key',2,60)).toBe(true);expect(await checkAuthRateLimit('key',2,60)).toBe(true);expect(await checkAuthRateLimit('key',2,60)).toBe(false);});
});
