export const dynamic='force-dynamic';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import {isDatabaseConfigured} from '@/lib/db';
import {requireAdmin} from '@/lib/auth/session';
const links=[['Umumiy','/admin'],['Mahsulotlar','/admin/products'],['Turkumlar','/admin/categories'],['Brendlar','/admin/brands'],['Buyurtmalar','/admin/orders'],['Mijozlar','/admin/customers'],['Ombor','/admin/inventory'],['Kuponlar','/admin/promotions'],['Sharhlar','/admin/reviews'],['Bannerlar','/admin/banners'],['Sozlamalar','/admin/settings']];
export default async function Layout({children}:{children:React.ReactNode}){if(!isDatabaseConfigured())return <div className="wrap py-20">Admin tizimi sozlanmagan.</div>;const auth=await requireAdmin();if('error' in auth)redirect('/login');return <div className="wrap grid gap-8 py-10 md:grid-cols-[200px_1fr]"><aside><h2 className="mb-5 text-lg font-bold">Boshqaruv</h2><nav className="flex gap-3 overflow-auto md:flex-col">{links.map(([name,href])=><Link className="whitespace-nowrap rounded-lg px-3 py-2 text-sm hover:bg-brand-50 hover:text-brand-700" key={href} href={href}>{name}</Link>)}</nav></aside><div className="min-w-0">{children}</div></div>}
