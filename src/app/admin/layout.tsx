export const dynamic='force-dynamic';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import {isDatabaseConfigured} from '@/lib/db';
import {getCurrentUser,isAdmin} from '@/lib/auth/session';
const links=[['Umumiy','/admin'],['Mahsulotlar','/admin/products'],['Turkumlar','/admin/categories'],['Brendlar','/admin/brands'],['Buyurtmalar','/admin/orders'],['Mijozlar','/admin/customers'],['Ombor','/admin/inventory'],['Kuponlar','/admin/promotions'],['Sharhlar','/admin/reviews'],['Bannerlar','/admin/banners'],['Sozlamalar','/admin/settings']];
export default async function Layout({children}:{children:React.ReactNode}){
 if(!isDatabaseConfigured())return <div className="wrap py-20">Admin tizimi sozlanmagan.</div>;
 const user=await getCurrentUser();if(!user)redirect('/login?next=admin');
 if(!await isAdmin(user.id))return <div className="wrap py-16"><div className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-7"><h1 className="text-2xl font-bold">Admin huquqi mavjud emas</h1><p className="mt-4 text-sm leading-6 text-gray-700">Siz hisobga kirgansiz, ammo bu hisobga admin huquqi berilmagan. To‘g‘ri hisobga kirganingizni va bazada aynan shu hisobga admin roli berilganini tekshiring.</p><Link href="/account" className="primary mt-6">Hisobimga qaytish</Link></div></div>;
 return <div className="wrap grid gap-7 py-8 md:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:py-12"><aside className="h-fit rounded-2xl border bg-[#fbfafe] p-4"><p className="px-3 pt-2 text-[10px] font-bold uppercase tracking-[.18em] text-brand-700">NEX MARKET</p><h2 className="mb-4 px-3 pt-1 text-lg font-bold">Boshqaruv</h2><nav aria-label="Admin bo‘limlari" className="flex gap-1 overflow-x-auto md:flex-col">{links.map(([name,href])=><Link className="whitespace-nowrap rounded-xl px-3 py-2.5 text-sm text-gray-600 hover:bg-brand-50 hover:text-brand-700" key={href} href={href}>{name}</Link>)}</nav></aside><div className="min-w-0">{children}</div></div>
}
