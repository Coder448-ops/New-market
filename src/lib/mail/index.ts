import 'server-only';
import nodemailer from 'nodemailer';
export function isMailConfigured(){return Boolean(process.env.SMTP_HOST&&process.env.SMTP_USER&&process.env.SMTP_PASSWORD&&process.env.MAIL_FROM&&process.env.NEXT_PUBLIC_APP_URL)}
function transport(){const port=Number(process.env.SMTP_PORT||587);return nodemailer.createTransport({host:process.env.SMTP_HOST,port,secure:port===465,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}})}
export async function sendAuthMail(email:string,token:string,purpose:'verify'|'reset') {
 if(!isMailConfigured())throw Error('Email service not configured');
 const origin=new URL(process.env.NEXT_PUBLIC_APP_URL!);if(origin.protocol!=='https:'&&origin.hostname!=='localhost')throw Error('Invalid application URL');
 const url=new URL('/auth/callback',origin);url.searchParams.set('token',token);url.searchParams.set('purpose',purpose);
 await transport().sendMail({from:process.env.MAIL_FROM,to:email,subject:purpose==='verify'?'NEX MARKET: emailni tasdiqlash':'NEX MARKET: parolni tiklash',text:`Havolani oching: ${url.toString()}\nAgar buni siz so‘ramagan bo‘lsangiz, xatni e’tiborsiz qoldiring.`});
}
export async function sendTwoFactorCode(email:string,code:string,purpose:'login'|'enable'|'disable'){
 if(!isMailConfigured())throw Error('Email service not configured');
 const operation={login:'hisobga kirish',enable:'ikki bosqichli himoyani yoqish',disable:'ikki bosqichli himoyani o‘chirish'}[purpose];
 await transport().sendMail({from:process.env.MAIL_FROM,to:email,subject:'NEX MARKET: tasdiqlash kodi',text:`${operation} uchun bir martalik kod: ${code}\nKod 10 daqiqa amal qiladi. Uni hech kimga bermang. Agar buni siz so‘ramagan bo‘lsangiz, xatni e’tiborsiz qoldiring.`});
}
