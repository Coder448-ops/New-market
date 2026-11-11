import {redirect} from 'next/navigation';
import {isSupabaseConfigured} from '@/config/site';
import {createServerSupabase} from '@/lib/supabase/server';
import {ProductCard} from '@/components/products/product-card';
import type {ProductWithRelations} from '@/types';
export default async function Page(){if(!isSupabaseConfigured())return <div className="wrap py-20">Tizim sozlanmagan.</div>;const s=await createServerSupabase();const {data:{user}}=await s.auth.getUser();if(!user)redirect('/login');const {data}=await s.from('favorites').select('product_id').eq('user_id',user.id);const ids=(data||[]).map(x=>x.product_id);const result=ids.length?await s.from('products').select('*').in('id',ids).eq('is_published',true):{data:[]};return <div className="wrap py-12"><h1 className="text-3xl font-bold">Saralanganlar</h1>{result.data?.length?<div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">{(result.data as ProductWithRelations[]).map(p=><ProductCard key={p.id} product={p}/>)}</div>:<p className="mt-8 text-gray-500">Saralangan mahsulotlar yo‘q.</p>}</div>}
