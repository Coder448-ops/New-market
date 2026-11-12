import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import type {ProductWithRelations} from '@/types';
import {ProductCard} from './product-card';
export function ProductSection({title,products}:{title:string;products:ProductWithRelations[]}){return <section className="mt-14"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold sm:text-2xl">{title}</h2><Link href="/catalog" className="flex items-center gap-1 text-sm font-semibold text-brand-700">Barchasi <ArrowRight size={16}/></Link></div>{products.length?<div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<p className="rounded-xl bg-gray-50 p-5 text-sm text-gray-500">Hozircha mahsulotlar mavjud emas.</p>}</section>}
