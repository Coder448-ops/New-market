import {NextResponse,type NextRequest} from 'next/server';
import {db,isDatabaseConfigured} from '@/lib/db';
import {hashToken} from '@/lib/auth/session';
export async function GET(request:NextRequest){
 const url=new URL(request.url),token=url.searchParams.get('token'),purpose=url.searchParams.get('purpose');
 if(!isDatabaseConfigured()||!token||token.length>128||!['verify','reset'].includes(purpose||''))return NextResponse.redirect(new URL('/login?error=auth',url));
 const {rows}=await db().query('select 1 from auth_tokens where token_hash=$1 and purpose=$2 and expires_at>now()',[hashToken(token),purpose]);
 if(!rows.length)return NextResponse.redirect(new URL('/login?error=auth',url));
 // Never consume verification links on GET: email security scanners often visit links.
 const res=NextResponse.redirect(new URL(purpose==='reset'?'/reset-password':'/verify-email?confirm=1',url));
 res.headers.set('Referrer-Policy','no-referrer');res.headers.set('Cache-Control','no-store');
 res.cookies.set(purpose==='reset'?'nex_reset':'nex_verify',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:3600});return res;
}
