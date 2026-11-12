'use server';
import {redirect} from 'next/navigation';
import {cookies} from 'next/headers';
import {db,isDatabaseConfigured} from '@/lib/db';
import {createSession,destroySession,getCurrentUser,hashPassword,verifyPassword,makeToken,hashToken} from '@/lib/auth/session';
import {isMailConfigured,sendAuthMail} from '@/lib/mail';
import {loginSchema,registerSchema} from '@/lib/validation/schemas';
import {checkAuthRateLimit} from '@/lib/auth/rate-limit';

const dummyHash='9d5018dbe45ed13d18d01a76aefb2937:2ba5b84bcbd2b6a4f4a139d95bd77f96da88aaaf819d2277dec333febe4c4d83e08d008df1118ced9db82b790d1f8f62efd6f55c395b8f53f261fee5bf4a2996';
export async function login(form:FormData){
 if(!isDatabaseConfigured())redirect('/login?error=unconfigured');
 const p=loginSchema.safeParse(Object.fromEntries(form));if(!p.success)redirect('/login?error=invalid');
 const email=p.data.email.toLowerCase().trim();
 if(!await checkAuthRateLimit('login:'+email,10,60))redirect('/login?error=auth');
 const {rows}=await db().query('select id,password_hash,email_verified_at from users where email=$1',[email]);
 const user=rows[0];const valid=await verifyPassword(p.data.password,user?.password_hash||dummyHash);
 if(!user||!user.email_verified_at||!valid)redirect('/login?error=auth');
 await createSession(user.id);redirect('/account');
}
export async function register(form:FormData){
 if(!isDatabaseConfigured()||!isMailConfigured())redirect('/register?error=unconfigured');
 const p=registerSchema.safeParse(Object.fromEntries(form));if(!p.success)redirect('/register?error=invalid');
 const email=p.data.email.toLowerCase().trim();
 if(!await checkAuthRateLimit('register:'+email,5,3600))redirect('/verify-email');
 const passwordHash=await hashPassword(p.data.password),token=makeToken();
 const client=await db().connect();let shouldSend=false;
 try{
  await client.query('begin');
  const created=await client.query('insert into users(email,password_hash) values($1,$2) on conflict(email) do nothing returning id',[email,passwordHash]);
  const result=created.rows.length?created:await client.query('select id,email_verified_at from users where email=$1 for update',[email]);
  const user=result.rows[0];
  if(user && !user.email_verified_at){
   // Re-registration replaces pending credentials and invalidates older links, preventing pre-hijacked accounts.
   if(!created.rows.length)await client.query('update users set password_hash=$1 where id=$2',[passwordHash,user.id]);
   await client.query('insert into profiles(id,first_name,last_name,phone) values($1,$2,$3,$4) on conflict(id) do update set first_name=excluded.first_name,last_name=excluded.last_name,phone=excluded.phone',[user.id,p.data.firstName,p.data.lastName,p.data.phone||null]);
   await client.query("insert into user_roles(user_id,role) values($1,'customer') on conflict(user_id,role) do nothing",[user.id]);
   await client.query("delete from auth_tokens where user_id=$1 and purpose='verify'",[user.id]);
   await client.query("insert into auth_tokens(token_hash,user_id,purpose,expires_at) values($1,$2,'verify',now()+interval '24 hours')",[hashToken(token),user.id]);
   shouldSend=true;
  }
  await client.query('commit');
 }catch{await client.query('rollback');redirect('/register?error=auth')}finally{client.release()}
 if(shouldSend){try{await sendAuthMail(email,token,'verify')}catch{redirect('/register?error=mail')}}
 redirect('/verify-email');
}
export async function logout(){await destroySession();redirect('/')}
export async function resetPassword(form:FormData){
 if(!isDatabaseConfigured()||!isMailConfigured())redirect('/forgot-password?error=unconfigured');
 const email=String(form.get('email')||'').toLowerCase().trim();
 if(!loginSchema.shape.email.safeParse(email).success)redirect('/forgot-password?sent=1');
 if(await checkAuthRateLimit('reset:'+email,5,3600)){
  const {rows}=await db().query('select id from users where email=$1 and email_verified_at is not null',[email]);
  if(rows[0]){const token=makeToken();await db().query("insert into auth_tokens(token_hash,user_id,purpose,expires_at) values($1,$2,'reset',now()+interval '1 hour')",[hashToken(token),rows[0].id]);try{await sendAuthMail(email,token,'reset')}catch{/* Do not reveal account existence. */}}
 }
 redirect('/forgot-password?sent=1');
}
export async function updatePassword(form:FormData){
 const password=String(form.get('password')||'');const store=await cookies();const token=store.get('nex_reset')?.value;
 if(!isDatabaseConfigured()||password.length<8||password.length>256||!token||token.length>128)redirect('/reset-password?error=invalid');
 const passwordHash=await hashPassword(password);const client=await db().connect();let changed=false;
 try{await client.query('begin');const result=await client.query("delete from auth_tokens where token_hash=$1 and purpose='reset' and expires_at>now() returning user_id",[hashToken(token)]);if(result.rows[0]){const id=result.rows[0].user_id;await client.query('update users set password_hash=$1 where id=$2',[passwordHash,id]);await client.query('delete from sessions where user_id=$1',[id]);await client.query("delete from auth_tokens where user_id=$1 and purpose='reset'",[id]);changed=true}await client.query('commit')}catch{await client.query('rollback');changed=false}finally{client.release()}
 store.delete('nex_reset');if(!changed)redirect('/reset-password?error=invalid');redirect('/login?reset=1');
}
export async function confirmEmail(){
 const store=await cookies(),token=store.get('nex_verify')?.value;
 if(!isDatabaseConfigured()||!token||token.length>128)redirect('/login?error=auth');
 const client=await db().connect();let verified=false;
 try{await client.query('begin');const result=await client.query("delete from auth_tokens where token_hash=$1 and purpose='verify' and expires_at>now() returning user_id",[hashToken(token)]);if(result.rows[0]){await client.query('update users set email_verified_at=now() where id=$1',[result.rows[0].user_id]);verified=true}await client.query('commit')}catch{await client.query('rollback');verified=false}finally{client.release()}
 store.delete('nex_verify');if(!verified)redirect('/login?error=auth');redirect('/login?verified=1');
}
export async function updateProfile(form:FormData){const user=await getCurrentUser();if(!user)redirect('/login');await db().query('update profiles set first_name=$1,last_name=$2,phone=$3 where id=$4',[String(form.get('first_name')||'').slice(0,100),String(form.get('last_name')||'').slice(0,100),String(form.get('phone')||'').slice(0,30),user.id]);redirect('/account?saved=1')}
