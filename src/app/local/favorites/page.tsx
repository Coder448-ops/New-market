'use client';
import {useLocal} from '@/lib/local/use-local';
import {ProductCard} from '@/components/local/product-card';
export default function Page(){const {state}=useLocal();return <div className="wrap py-10"><h1 className="text-2xl font-bold">Mahalliy saralanganlar</h1><div className="demo-grid mt-6">{state.products.filter(p=>state.favorites.includes(p.id)).map(p=><ProductCard key={p.id} product={p}/>)}</div></div>}
