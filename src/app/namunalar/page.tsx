import Link from 'next/link';
import {showcaseCategories,showcaseProducts} from '@/lib/showcase/products';
import {ShowcaseCard} from '@/components/showcase/showcase-card';
export default async function Page({searchParams}:{searchParams:Promise<{turkum?:string}>}){
 const {turkum}=await searchParams;
 const selected=showcaseCategories.find(c=>c.id===turkum);
 const products=selected?showcaseProducts.filter(p=>p.category.id===selected.id):showcaseProducts;
 return <div className="wrap py-10 sm:py-14"><div className="text-sm text-gray-400"><Link href="/">Bosh sahifa</Link> / Namunalar</div><div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-brand-700">NEX MARKET KO‘RGAZMASI</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Namunaviy mahsulotlar</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">Bu 30 ta mahsulot va narxlar faqat dizaynni ko‘rsatish uchun. Rasmlar turkumga oid tasvirlardir; mahsulotlarni sotib olib bo‘lmaydi.</p></div><Link href="/catalog" className="text-sm font-semibold text-brand-700">Haqiqiy katalogga →</Link></div>
 <nav aria-label="Namunalar turkumi" className="mt-8 flex gap-2 overflow-x-auto pb-2"><Link href="/namunalar" className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${!selected?'bg-gray-900 text-white':'bg-gray-100 text-gray-600'}`}>Barchasi</Link>{showcaseCategories.map(c=><Link key={c.id} href={'/namunalar?turkum='+c.id} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${selected?.id===c.id?'bg-gray-900 text-white':'bg-gray-100 text-gray-600'}`}>{c.title}</Link>)}</nav>
 <p className="mt-6 text-sm text-gray-400">{products.length} ta namuna</p><div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{products.map(p=><ShowcaseCard key={p.id} product={p}/>)}</div></div>
}
