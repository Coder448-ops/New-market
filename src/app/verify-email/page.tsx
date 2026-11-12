import Link from 'next/link';
import {confirmEmail} from '@/app/actions';
export default async function Page({searchParams}:{searchParams:Promise<{confirm?:string}>}){
 const {confirm}=await searchParams;
 return <div className="wrap py-20"><h1 className="text-2xl font-bold">Email manzilingizni tasdiqlang</h1>{confirm==='1'?<><p className="my-4 text-gray-600">Hisobingizni tasdiqlash uchun tugmani bosing.</p><form action={confirmEmail}><button className="primary">Emailni tasdiqlash</button></form></>:<><p className="my-4 text-gray-600">Agar manzil ro‘yxatdan o‘tish uchun mos bo‘lsa, emailingizga tasdiqlash havolasi yuboriladi. Xat kelmasa spam papkasini tekshiring yoki qayta ro‘yxatdan o‘ting.</p><Link href="/login" className="text-brand-700">Kirish sahifasi →</Link></>}</div>;
}
