import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight, Grid2X2, Store, ShieldCheck} from 'lucide-react';
import {getBanners,getCategories,getBrands} from '@/lib/database/catalog';
import {getFeaturedProducts,getDiscountedProducts,getNewProducts} from '@/lib/database/products';
import {ProductSection} from '@/components/products/product-section';
import {isDatabaseConfigured} from '@/lib/db';
export const dynamic='force-dynamic';
export default async function Home(){
 const [banners,categories,brands,featured,discounted,newest]=await Promise.all([getBanners(),getCategories(),getBrands(),getFeaturedProducts(10),getDiscountedProducts(10),getNewProducts(10)]);
 const roots=categories.filter(c=>!c.parent_id).slice(0,12);
 return <div className="wrap pb-12 sm:pb-16">
 {!isDatabaseConfigured()&&<div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Mahsulotlarni ko‘rish uchun PostgreSQL sozlanishi kerak.</div>}
 <section className="relative mt-5 flex min-h-[390px] overflow-hidden rounded-[24px] bg-[#efeaf4] sm:mt-7 sm:min-h-[430px] lg:min-h-[450px]">
  <Image src="/images/market-hero.webp" alt="" fill priority sizes="100vw" className="object-cover object-[65%_center]"/>
  <div className="absolute inset-0 bg-gradient-to-r from-[#f5f2f2] via-[#f5f2f2]/90 to-[#f5f2f2]/40 sm:via-[#f5f2f2]/80 sm:to-transparent"/>
  <div className="relative z-10 flex max-w-xl flex-col items-start justify-center px-6 py-12 sm:px-12 lg:px-14"><span className="rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-brand-700">NEX MARKET · SIZ UCHUN</span><h1 className="mt-6 text-4xl font-extrabold leading-[1.12] tracking-tight text-[#211936] sm:text-5xl lg:text-6xl">{banners[0]?.title || <>Har kuningizga<br/><span className="text-brand-700">yaxshi tanlov.</span></>}</h1><p className="mt-5 max-w-sm text-sm leading-6 text-gray-600 sm:text-base">{banners[0]?.subtitle || 'O‘zingiz uchun kerakli narsalarni bir joyda kashf eting.'}</p><div className="mt-7"><Link href={banners[0]?.link_url?.startsWith('/') ? banners[0].link_url : '/catalog'} className="primary gap-3">Katalogga o‘tish <ArrowRight size={17}/></Link></div></div>
 </section>
 <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="flex items-center gap-3 rounded-2xl bg-[#f8f7fa] p-4"><span className="rounded-xl bg-white p-2 text-brand-700"><Grid2X2 size={19}/></span><div><b className="text-sm">Bir joyda qulay tanlov</b><p className="text-xs text-gray-500">Katalogni o‘rganing</p></div></div><div className="flex items-center gap-3 rounded-2xl bg-[#f8f7fa] p-4"><span className="rounded-xl bg-white p-2 text-brand-700"><Store size={19}/></span><div><b className="text-sm">Katalog</b><p className="text-xs text-gray-500">Mahsulotlarni kashf eting</p></div></div><div className="flex items-center gap-3 rounded-2xl bg-[#f8f7fa] p-4"><span className="rounded-xl bg-white p-2 text-brand-700"><ShieldCheck size={19}/></span><div><b className="text-sm">Hisobingiz nazoratda</b><p className="text-xs text-gray-500">Ixtiyoriy email himoyasi</p></div></div></div>
 <section className="mt-12 sm:mt-16"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-brand-700">KASHF ETING</p><h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Turkumlar</h2></div><Link href="/catalog" className="text-sm font-semibold text-brand-700">Barcha mahsulotlar →</Link></div>{roots.length?<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{roots.map((c,i)=><Link href={'/category/'+c.slug} key={c.id} className="rounded-2xl bg-[#f6f4fa] p-5 hover:bg-brand-100"><span className="text-xs text-brand-500">{String(i+1).padStart(2,'0')}</span><div className="mt-7 text-sm font-semibold">{c.name} →</div></Link>)}</div>:<div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-500">Hozircha turkumlar qo‘shilmagan.</div>}</section>
 {discounted.length>0&&<ProductSection title="Chegirmalar" products={discounted}/>}{featured.length>0&&<ProductSection title="Ommabop mahsulotlar" products={featured}/>}{newest.length>0&&<ProductSection title="Yangi mahsulotlar" products={newest}/>}
 {brands.length>0&&<section className="mt-14"><h2 className="text-2xl font-bold">Brendlar</h2><div className="mt-5 flex flex-wrap gap-3">{brands.map(b=><Link key={b.id} href={'/catalog?brand='+b.slug} className="rounded-xl border px-6 py-4 text-sm font-semibold hover:border-brand-400">{b.name}</Link>)}</div></section>}
 </div>
}
