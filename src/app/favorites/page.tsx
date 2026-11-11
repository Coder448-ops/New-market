'use client';
import Link from 'next/link';
import {useLocal} from '@/lib/local/use-local';
import {ProductCard} from '@/components/local/product-card';
export default function Page(){const {state,error}=useLocal();const products=state.products.filter(p=>state.favorites.includes(p.id));return <div className="wrap py-12"><h1 className="text-3xl font-bold">Saralanganlar</h1><p className="mt-2 text-sm text-gray-500">Faqat ushbu brauzerda saqlanadi.</p>{error&&<p role="alert" className="mt-4 text-red-700">{error}</p>}{products.length?<div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<p className="mt-8 text-gray-500">Saralangan mahsulotlar yo‘q. <Link href="/catalog" className="text-brand-700">Katalogga o‘tish</Link></p>}</div>}
