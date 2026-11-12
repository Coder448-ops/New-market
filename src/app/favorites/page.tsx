import {redirect} from 'next/navigation';
import {db,isDatabaseConfigured} from '@/lib/db';
import {getCurrentUser} from '@/lib/auth/session';
import {ProductCard} from '@/components/products/product-card';
import type {ProductWithRelations} from '@/types';
export const dynamic='force-dynamic';
export default async function Page(){if(!isDatabaseConfigured())return <div className="wrap py-20">Tizim sozlanmagan.</div>;const user=await getCurrentUser();if(!user)redirect('/login');const {rows}=await db().query('select p.* from products p join favorites f on f.product_id=p.id where f.user_id=$1 and p.is_published order by f.created_at desc',[user.id]);return <div className="wrap py-12"><h1 className="text-3xl font-bold">Saralanganlar</h1>{rows.length?<div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">{(rows as ProductWithRelations[]).map(p=><ProductCard key={p.id} product={p}/>)}</div>:<p className="mt-8 text-gray-500">Saralangan mahsulotlar yo‘q.</p>}</div>}
