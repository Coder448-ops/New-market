export const dynamic='force-dynamic';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import {ORDER_STATUS_LABELS, type OrderStatus} from '@/types';
import {isDatabaseConfigured} from '@/lib/db';
import {getCurrentUser} from '@/lib/auth/session';
import {getUserOrders} from '@/lib/database/orders';
import {formatDate,formatPrice} from '@/lib/utils/format';
export default async function Page(){if(!isDatabaseConfigured())return <div className="wrap py-20">Buyurtmalar tizimi sozlanmagan.</div>;const u=await getCurrentUser();if(!u)redirect('/login');const orders=await getUserOrders(u.id);return <div className="wrap py-12"><h1 className="text-3xl font-bold">Buyurtmalarim</h1><div className="mt-8 grid gap-3">{orders.length?orders.map(o=><Link key={o.id} href={'/orders/'+o.id} className="flex flex-wrap justify-between gap-3 rounded-xl border p-5"><span><b>{o.order_number}</b><span className="block text-sm text-gray-500">{formatDate(o.created_at)}</span></span><span>{ORDER_STATUS_LABELS[o.status as OrderStatus] || "Noma’lum holat"}</span><b>{formatPrice(o.total)}</b></Link>):<p className="text-gray-500">Buyurtmalar hali yo‘q.</p>}</div></div>}
