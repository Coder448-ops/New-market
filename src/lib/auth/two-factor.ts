import 'server-only';
import {randomInt} from 'node:crypto';
import {hashToken,makeToken} from '@/lib/auth/session';

export type Purpose='login'|'enable'|'disable';
export function makeChallenge(){
 const token=makeToken();
 const code=randomInt(0,1_000_000).toString().padStart(6,'0');
 // The random challenge remains in an HttpOnly cookie, not the database. The code alone
 // cannot be enumerated from a database dump without that high-entropy secret.
 return {token,code,tokenHash:hashToken(token),codeHash:hashToken(`${token}:${code}`)};
}
export function challengeCookieOptions(){return {httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/',maxAge:600}}
