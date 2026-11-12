'use server';
import {redirect} from 'next/navigation';
import {cookies} from 'next/headers';
import {db,isDatabaseConfigured} from '@/lib/db';
import {cookieName,sessionCookieOptions,destroySession,getCurrentUser,hashPassword,verifyPassword,makeToken,hashToken} from '@/lib/auth/session';
import {makeChallenge,challengeCookieOptions,type Purpose} from '@/lib/auth/two-factor';
import {timingSafeEqual} from 'node:crypto';
import {isMailConfigured,sendAuthMail,sendTwoFactorCode} from '@/lib/mail';
import {loginSchema,registerSchema,loginPhoneSchema} from '@/lib/validation/schemas';
import {checkAuthRateLimit} from '@/lib/auth/rate-limit';
import {z} from 'zod';

const dummyHash='9d5018dbe45ed13d18d01a76aefb2937:2ba5b84bcbd2b6a4f4a139d95bd77f96da88aaaf819d2277dec333febe4c4d83e08d008df1118ced9db82b790d1f8f62efd6f55c395b8f53f261fee5bf4a2996';
async function loginWithIdentifier(form:FormData,legacy:boolean){
 if(!isDatabaseConfigured())redirect('/login?error=unconfigured');
 const fields=Object.fromEntries(form);const p=legacy?z.object({email:z.string().trim().email().max(254),password:z.string().min(1).max(256)}).safeParse(fields):loginSchema.safeParse(fields);
 if(!p.success)redirect(legacy?'/legacy-login?error=invalid':'/login?error=invalid');
 const identifier=legacy?String(fields.email).trim().toLowerCase():(p.data as {phone:string}).phone;
 if(!await checkAuthRateLimit('login:'+identifier,10,60))redirect(legacy?'/legacy-login?error=auth':'/login?error=auth');
 const {rows}=await db().query(legacy?'select id,password_hash,email_verified_at,phone_verified_at,phone_e164,email from users where email=$1 and phone_e164 is null':'select id,password_hash,email_verified_at,phone_verified_at,phone_e164,email from users where phone_e164=$1',[identifier]);
 const user=rows[0];const valid=await verifyPassword(p.data.password,user?.password_hash||dummyHash);
 if(!user||!(legacy?user.email_verified_at:user.phone_e164)||!valid)redirect(legacy?'/legacy-login?error=auth':'/login?error=auth');
 const challenge=makeChallenge(),sessionToken=makeToken(),expires=new Date(Date.now()+14*24*60*60*1000);
 const client=await db().connect();let mode:'login'|'normal'|'invalid'|'unconfigured'|'limited'='invalid';let loginEmail:string|undefined;
 try{
  await client.query('begin');
  const locked=await client.query('select password_hash,email_verified_at,phone_verified_at,phone_e164,email_2fa_enabled,email from users where id=$1 for update',[user.id]);
  const current=locked.rows[0];
  if(current && (legacy?(current.email_verified_at && !current.phone_e164):current.phone_e164===identifier) && current.password_hash===user.password_hash){
   if(current.email_2fa_enabled){
    if(!isMailConfigured()||!current.email||!current.email_verified_at)mode='unconfigured';
    else if(!await checkAuthRateLimit('2fa-login:'+user.id,5,3600))mode='limited';
    else {
     await client.query("delete from auth_2fa_challenges where user_id=$1 and purpose='login'",[user.id]);
     await client.query("insert into auth_2fa_challenges(challenge_hash,user_id,purpose,code_hash,expires_at) values($1,$2,'login',$3,now()+interval '10 minutes')",[challenge.tokenHash,user.id,challenge.codeHash]);
     loginEmail=current.email;mode='login';
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
 try{await sendTwoFactorCode(loginEmail!,challenge.code,'login')}catch{await db().query('delete from auth_2fa_challenges where challenge_hash=$1',[challenge.tokenHash]);redirect('/login?error=mail')}
 store.set('nex_2fa_login',challenge.token,challengeCookieOptions());redirect('/two-factor');
}
export async function login(form:FormData){return loginWithIdentifier(form,false)}
export async function legacyLogin(form:FormData){return loginWithIdentifier(form,true)}
export async function register(form:FormData){
 if(!isDatabaseConfigured())redirect('/register?error=unconfigured');
 const p=registerSchema.safeParse(Object.fromEntries(form));if(!p.success)redirect('/register?error=invalid');
 const {phone,firstName,lastName,password}=p.data;
 if(!await checkAuthRateLimit('register-phone:'+phone,5,3600)||!await checkAuthRateLimit('register-global',1000,3600))redirect('/register?error=limit');
 const passwordHash=await hashPassword(password);const client=await db().connect();let created=false;
 try{
  await client.query('begin');
  const result=await client.query('insert into users(phone_e164,password_hash) values($1,$2) on conflict(phone_e164) do nothing returning id',[phone,passwordHash]);
  if(result.rows[0]){
   const id=result.rows[0].id;
   await client.query('insert into profiles(id,first_name,last_name,phone) values($1,$2,$3,$4)',[id,firstName,lastName,phone]);
   await client.query("insert into user_roles(user_id,role) values($1,'customer')",[id]);created=true;
  }
  await client.query('commit');
 }catch{await client.query('rollback');redirect('/register?error=unavailable')}finally{client.release()}
 if(!created)redirect('/register?error=duplicate');
 redirect('/login?registered=1');
}
export async function startPhoneAttach(form:FormData){
 const user=await getCurrentUser();if(!user)redirect('/login');
 if(user.phone_e164)redirect('/account?phone=exists');
 const parsed=loginPhoneSchema.safeParse(String(form.get('phone')||''));const password=String(form.get('password')||'');
 if(!parsed.success||!password||password.length>256)redirect('/account?phone=invalid');
 if(!await checkAuthRateLimit('phone-attach:'+user.id,5,3600))redirect('/account?phone=limit');
 const session=(await cookies()).get(cookieName)?.value;if(!session)redirect('/login');
 const {rows}=await db().query('select password_hash from users where id=$1',[user.id]);
 if(!rows[0]||!await verifyPassword(password,rows[0].password_hash))redirect('/account?phone=invalid');
 const client=await db().connect();let done=false;
 try{
  await client.query('begin');
  const active=await client.query('select 1 from sessions where token_hash=$1 and user_id=$2 and expires_at>now()',[hashToken(session),user.id]);
  if(active.rows.length){
   const updated=await client.query('update users set phone_e164=$1 where id=$2 and phone_e164 is null and password_hash=$3 returning id',[parsed.data,user.id,rows[0].password_hash]);
   if(updated.rows.length){await client.query('update profiles set phone=$1 where id=$2',[parsed.data,user.id]);done=true}
  }
  await client.query('commit');
 }catch{await client.query('rollback');done=false}finally{client.release()}
 redirect(done?'/account?phone=attached':'/account?phone=invalid');
}
export async function logout(){await destroySession();redirect('/')}
export async function resetPassword(form:FormData){
 if(!isDatabaseConfigured()||!isMailConfigured())redirect('/forgot-password?error=unconfigured');
 const email=String(form.get('email')||'').toLowerCase().trim();
 if(!z.string().email().max(254).safeParse(email).success)redirect('/forgot-password?sent=1');
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
 const email=purpose==='enable'?String(form.get('email')||'').trim().toLowerCase():user.email;
 if(!email||!z.string().email().max(254).safeParse(email).success)redirect('/account?security=invalid');
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
   await client.query("insert into auth_2fa_challenges(challenge_hash,user_id,purpose,code_hash,session_hash,pending_email,expires_at) values($1,$2,$3,$4,$5,$6,now()+interval '10 minutes')",[challenge.tokenHash,user.id,purpose,challenge.codeHash,hashToken(session),email]);created=true;
  }
  await client.query('commit');
 }catch{await client.query('rollback');created=false}finally{client.release()}
 if(!created)redirect('/account?security=invalid');
 try{await sendTwoFactorCode(email,challenge.code,purpose)}catch{await db().query('delete from auth_2fa_challenges where challenge_hash=$1',[challenge.tokenHash]);redirect('/account?security=mail')}
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
  const result=await client.query(`select c.user_id,c.purpose,c.code_hash,c.session_hash,c.pending_email,c.attempts,u.email_2fa_enabled
   from auth_2fa_challenges c join users u on u.id=c.user_id
   where c.challenge_hash=$1 and c.expires_at>now() and c.attempts<5 and (u.phone_e164 is not null or u.email_verified_at is not null)
   for update of c,u`,[hashToken(token)]);
  const row=result.rows[0];
  if(row){
   const calculated=Buffer.from(hashToken(`${token}:${code}`),'hex'), expected=Buffer.from(row.code_hash,'hex');
   const correct=expected.length===calculated.length && timingSafeEqual(expected,calculated);
   let authorized=false;
   if(settings && row.purpose!=='login' && session && hashToken(session)===row.session_hash){
    const active=await client.query('select 1 from sessions where token_hash=$1 and user_id=$2 and expires_at>now()',[row.session_hash,row.user_id]);
    authorized=Boolean(active.rows.length) && row.email_2fa_enabled===(row.purpose==='disable') && (row.purpose!=='enable'||z.string().email().max(254).safeParse(row.pending_email).success);
   }else if(!settings && row.purpose==='login')authorized=row.email_2fa_enabled===true;
   if(correct&&authorized){
    purpose=row.purpose;
    await client.query('delete from auth_2fa_challenges where challenge_hash=$1',[hashToken(token)]);
    if(row.purpose==='login')await client.query('insert into sessions(token_hash,user_id,expires_at) values($1,$2,$3)',[hashToken(sessionToken),row.user_id,expires]);
    else{
     if(row.purpose==='enable')await client.query('update users set email=$1,email_verified_at=now(),email_2fa_enabled=true where id=$2',[row.pending_email,row.user_id]);
     else await client.query('update users set email_2fa_enabled=false where id=$1',[row.user_id]);
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
