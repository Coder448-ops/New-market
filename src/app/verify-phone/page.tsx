import Link from 'next/link';
import {verifyPhone} from '@/app/actions';
export default async function Page({searchParams}:{searchParams:Promise<{error?:string}>}){
 const {error}=await searchParams;
 return <div className="wrap py-14"><div className="mx-auto max-w-md rounded-2xl border p-7"><h1 className="text-2xl font-bold">Telefon raqamni tasdiqlash</h1><p className="mt-3 text-sm text-gray-600">Telefoningizga yuborilgan SMS kodni kiriting.</p>{error&&<p role="alert" className="mt-4 text-sm text-red-700">Kod noto‘g‘ri, muddati tugagan yoki xizmat mavjud emas. Qayta urinib ko‘ring yoki ro‘yxatdan o‘tishni qayta boshlang.</p>}<form action={verifyPhone} className="mt-6 grid gap-4"><label className="text-sm">SMS kod<input className="field mt-1" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{4,10}" minLength={4} maxLength={10} required/></label><button className="primary">Tasdiqlash</button></form><Link href="/register" className="mt-5 block text-sm text-brand-700">Orqaga</Link></div></div>;
}
