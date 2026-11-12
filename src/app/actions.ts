'use server';
import {redirect} from 'next/navigation';
import {cookies} from 'next/headers';
import {db,isDatabaseConfigured} from '@/lib/db';
import {cookieName,sessionCookieOptions,destroySession,getCurrentUser,hashPassword,verifyPassword,makeToken,hashToken} from '@/lib/auth/session';
import {makeChallenge,challengeCookieOptions,type Purpose} from '@/lib/auth/two-factor';
import {timingSafeEqual} from 'node:crypto';
import {isMailConfigured,sendAuthMail,sendTwoFactorCode} from '@/lib/mail';
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
 const challenge=makeChallenge(),sessionToken=makeToken(),expires=new Date(Date.now()+14*24*60*60*1000);
 const client=await db().connect();let mode:'login'|'normal'|'invalid'|'unconfigured'|'limited'='invalid';
 try{
  await client.query('begin');
  const locked=await client.query('select password_hash,email_verified_at,email_2fa_enabled from users where id=$1 for update',[user.id]);
  const current=locked.rows[0];
  if(current?.email_verified_at && current.password_hash===user.password_hash){
   if(current.email_2fa_enabled){
    if(!isMailConfigured())mode='unconfigured';
    else if(!await checkAuthRateLimit('2fa-login:'+user.id,5,3600))mode='limited';
    else {
     await client.query("delete from auth_2fa_challenges where user_id=$1 and purpose='login'",[user.id]);
     await client.query("insert into auth_2fa_challenges(challenge_hash,user_id,purpose,code_hash,expires_at) values($1,$2,'login',$3,now()+interval '10 minutes')",[challenge.tokenHash,user.id,challenge.codeHash]);
     mode='login';
    }
   }else{
    await client.query('insert into sessions(token_hash,user_id,expires_at) values($1,$2,$3)',[hashToken(sessionToken),user.id,expires]);mode='normal';
   }
  }
  await client.query('commit');
 }catch{await client.query('rollback');mode='invalid'}finally{client.release()}
 if(mode==='unconfigured')redirect('/login?error=unconfigured');
 if(mode==='invalid'||mode==='limited')redirect('/login?error=auth');
 const store=await cookies();
 // Remove an older session after credentials are accepted, so it cannot mask the challenge.
 const old=store.get(cookieName)?.value;if(old)await db().query('delete from sessions where token_hash=$1',[hashToken(old)]);store.delete(cookieName);
 if(mode==='normal'){store.set(cookieName,sessionToken,sessionCookieOptions(expires));redirect('/account')}
 try{await sendTwoFactorCode(email,challenge.code,'login')}catch{await db().query('delete from auth_2fa_challenges where challenge_hash=$1',[challenge.tokenHash]);redirect('/login?error=mail')}
 store.set('nex_2fa_login',challenge.token,challengeCookieOptions());redirect('/two-factor');
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
 try{await client.query('begin');const result=await client.query("delete from auth_tokens where token_hash=$1 and purpose='reset' and expires_at>now() returning user_id",[hashToken(token)]);if(result.rows[0]){const id=result.rows[0].user_id;await client.query('update users set password_hash=$1 where id=$2',[passwordHash,id]);await client.query('delete from sessions where user_id=$1',[id]);await client.query('delete from auth_2fa_challenges where user_id=$1',[id]);await client.query("delete from auth_tokens where user_id=$1 and purpose='reset'",[id]);changed=true}await client.query('commit')}catch{await client.query('rollback');changed=false}finally{client.release()}
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

export async function startTwoFactorSettings(form:FormData){
 const user=await getCurrentUser();if(!user)redirect('/login');
 const purpose=String(form.get('purpose')||'');const password=String(form.get('password')||'');
 if((purpose!=='enable'&&purpose!=='disable')||!password||password.length>256)redirect('/account?security=invalid');
 if(!isMailConfigured())redirect('/account?security=unconfigured');
 if(!await checkAuthRateLimit('2fa-settings:'+user.id,5,3600))redirect('/account?security=limit');
 const session=(await cookies()).get(cookieName)?.value;if(!session)redirect('/login');
 const {rows}=await db().query('select password_hash,email_2fa_enabled from users where id=$1',[user.id]);
 if(!rows[0]||!await verifyPassword(password,rows[0].password_hash)||rows[0].email_2fa_enabled===(purpose==='enable'))redirect('/account?security=invalid');
 const challenge=makeChallenge();const client=await db().connect();let created=false;
 try{
  await client.query('begin');
  const locked=await client.query('select password_hash,email_2fa_enabled from users where id=$1 for update',[user.id]);
  const current=locked.rows[0];
  const active=await client.query('select 1 from sessions where token_hash=$1 and user_id=$2 and expires_at>now()',[hashToken(session),user.id]);
  if(current&&active.rows.length&&current.password_hash===rows[0].password_hash&&current.email_2fa_enabled!==(purpose==='enable')){
   await client.query('delete from auth_2fa_challenges where user_id=$1 and purpose=$2',[user.id,purpose]);
   await client.query("insert into auth_2fa_challenges(challenge_hash,user_id,purpose,code_hash,session_hash,expires_at) values($1,$2,$3,$4,$5,now()+interval '10 minutes')",[challenge.tokenHash,user.id,purpose,challenge.codeHash,hashToken(session)]);created=true;
  }
  await client.query('commit');
 }catch{await client.query('rollback');created=false}finally{client.release()}
 if(!created)redirect('/account?security=invalid');
 try{await sendTwoFactorCode(user.email,challenge.code,purpose)}catch{await db().query('delete from auth_2fa_challenges where challenge_hash=$1',[challenge.tokenHash]);redirect('/account?security=mail')}
 (await cookies()).set('nex_2fa_settings',challenge.token,challengeCookieOptions());redirect('/two-factor?settings=1');
}

export async function verifyTwoFactor(form:FormData){
 const settings=form.get('settings')==='1';const store=await cookies();
 const cookie=settings?'nex_2fa_settings':'nex_2fa_login';const token=store.get(cookie)?.value;
 const code=String(form.get('code')||'');const errorPath=settings?'/two-factor?settings=1&error=1':'/two-factor?error=1';
 if(!token||token.length>128||!/^\d{6}$/.test(code))redirect(errorPath);
 const session=store.get(cookieName)?.value;
 const client=await db().connect();let outcome:'success'|'invalid'='invalid';let purpose:Purpose|undefined;
 const sessionToken=makeToken(),expires=new Date(Date.now()+14*24*60*60*1000);
 try{
  await client.query('begin');
  const result=await client.query(`select c.user_id,c.purpose,c.code_hash,c.session_hash,c.attempts,u.email_2fa_enabled
   from auth_2fa_challenges c join users u on u.id=c.user_id
   where c.challenge_hash=$1 and c.expires_at>now() and c.attempts<5 and u.email_verified_at is not null
   for update of c,u`,[hashToken(token)]);
  const row=result.rows[0];
  if(row){
   const calculated=Buffer.from(hashToken(`${token}:${code}`),'hex'), expected=Buffer.from(row.code_hash,'hex');
   const correct=expected.length===calculated.length && timingSafeEqual(expected,calculated);
   let authorized=false;
   if(settings && row.purpose!=='login' && session && hashToken(session)===row.session_hash){
    const active=await client.query('select 1 from sessions where token_hash=$1 and user_id=$2 and expires_at>now()',[row.session_hash,row.user_id]);
    authorized=Boolean(active.rows.length) && row.email_2fa_enabled===(row.purpose==='disable');
   }else if(!settings && row.purpose==='login')authorized=row.email_2fa_enabled===true;
   if(correct&&authorized){
    purpose=row.purpose;
    await client.query('delete from auth_2fa_challenges where challenge_hash=$1',[hashToken(token)]);
    if(row.purpose==='login')await client.query('insert into sessions(token_hash,user_id,expires_at) values($1,$2,$3)',[hashToken(sessionToken),row.user_id,expires]);
    else{
     await client.query('update users set email_2fa_enabled=$1 where id=$2',[row.purpose==='enable',row.user_id]);
     await client.query('delete from sessions where user_id=$1 and token_hash<>$2',[row.user_id,row.session_hash]);
     await client.query('delete from auth_2fa_challenges where user_id=$1',[row.user_id]);
    }
    outcome='success';
   }else{
    await client.query('update auth_2fa_challenges set attempts=attempts+1 where challenge_hash=$1',[hashToken(token)]);
   }
  }
  await client.query('commit');
 }catch{await client.query('rollback');outcome='invalid'}finally{client.release()}
 if(outcome!=='success')redirect(errorPath);
 store.delete(cookie);
 if(purpose==='login'){store.set(cookieName,sessionToken,sessionCookieOptions(expires));redirect('/account')}
 redirect('/account?security='+ (purpose==='enable'?'enabled':'disabled'));
}
