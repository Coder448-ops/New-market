import 'server-only';
import {cookies} from 'next/headers';
import {createHash,randomBytes,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {db,isDatabaseConfigured} from '@/lib/db';
const scrypt=promisify(scryptCallback);
export const cookieName='nex_session';
export function sessionCookieOptions(expires:Date){return {httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/',expires}}
export type User={id:string;email:string|null;phone_e164:string|null};
export function hashToken(s:string){return createHash('sha256').update(s).digest('hex')}
export function makeToken(){return randomBytes(32).toString('base64url')}
export async function hashPassword(password:string){const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,64) as Buffer;return `${salt}:${key.toString('hex')}`}
export async function verifyPassword(password:string,hash:string){const [salt,key]=hash.split(':');if(!salt||!key||!/^[a-f0-9]{128}$/.test(key))return false;const actual=await scrypt(password,salt,64) as Buffer;return timingSafeEqual(actual,Buffer.from(key,'hex'))}
export async function createSession(userId:string){const token=makeToken(),expires=new Date(Date.now()+14*24*60*60*1000);await db().query('insert into sessions(token_hash,user_id,expires_at) values($1,$2,$3)',[hashToken(token),userId,expires]);(await cookies()).set(cookieName,token,sessionCookieOptions(expires))}
export async function getCurrentUser():Promise<User|null>{if(!isDatabaseConfigured())return null;const token=(await cookies()).get(cookieName)?.value;if(!token||token.length>128)return null;const {rows}=await db().query('select u.id,u.email,u.phone_e164 from sessions s join users u on u.id=s.user_id where s.token_hash=$1 and s.expires_at>now() and (u.phone_verified_at is not null or (u.phone_e164 is null and u.email_verified_at is not null))',[hashToken(token)]);return rows[0]||null}
export async function destroySession(){const store=await cookies(),token=store.get(cookieName)?.value;if(token&&isDatabaseConfigured())await db().query('delete from sessions where token_hash=$1',[hashToken(token)]);store.delete(cookieName)}
export async function isAdmin(userId:string){return Boolean((await db().query("select 1 from user_roles where user_id=$1 and role='admin'",[userId])).rowCount)}
export async function requireAdmin():Promise<{user:User}|{error:string}>{const user=await getCurrentUser();if(!user||!await isAdmin(user.id))return {error:'Admin huquqi talab qilinadi'};return {user}}
