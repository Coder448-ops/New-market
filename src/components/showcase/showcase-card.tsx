import Image from 'next/image';
import {formatPrice} from '@/lib/utils/format';
import type {showcaseProducts} from '@/lib/showcase/products';
type Item=(typeof showcaseProducts)[number];
export function ShowcaseCard({product}:{product:Item}){
 return <article className="group min-w-0">
  <div className={`relative aspect-[4/5] overflow-hidden rounded-2xl ${product.category.color}`}>
   <Image src={product.category.image} alt="" fill sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 20vw" className="object-cover transition duration-500 group-hover:scale-105"/>
   <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700">Namuna</span>
  </div>
  <div className="px-0.5 pt-3"><p className="text-xs text-gray-400">{product.category.title}</p><h3 className="mt-1 min-h-10 text-sm font-medium leading-5 text-gray-800">{product.name}</h3><p className="mt-2 text-sm font-bold text-gray-900">{formatPrice(product.price)}</p><p className="mt-1 text-xs text-gray-400">Namunaviy narx</p></div>
 </article>
}
