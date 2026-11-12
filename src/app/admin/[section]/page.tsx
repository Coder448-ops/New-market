import {notFound,redirect} from 'next/navigation';
import {db} from '@/lib/db';
import {requireAdmin} from '@/lib/auth/session';
import {updateAdminRecord} from '../actions';
import {ProductEditor} from '@/components/admin/product-editor';
import {TaxonomyEditor} from '@/components/admin/taxonomy-editor';
import {formatPrice} from '@/lib/utils/format';
import {ORDER_STATUS_LABELS,type OrderStatus,type Product,type Category,type Brand} from '@/types';
const sections={products:['Mahsulotlar','products'],categories:['Turkumlar','categories'],brands:['Brendlar','brands'],orders:['Buyurtmalar','orders'],customers:['Mijozlar','profiles'],inventory:['Ombor','products'],promotions:['Kuponlar','coupons'],reviews:['Sharhlar','reviews'],banners:['Bannerlar','banners'],settings:['Sozlamalar','site_settings']} as const;
export default async function Page({params}:{params:Promise<{section:string}>}){
 const {section}=await params;if(!(section in sections))notFound();const [title,table]=sections[section as keyof typeof sections];
 const auth=await requireAdmin();if('error' in auth)redirect('/login');
 const {rows:data}=await db().query(`select * from ${table} limit 100`);
 const [categories,brands]=section==='products'?await Promise.all([db().query('select * from categories order by name'),db().query('select * from brands order by name')]):[{rows:[]},{rows:[]}];
 return <><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-brand-700">BOSHQARUV</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1><p className="mt-2 text-sm text-gray-500">Birinchi 100 ta yozuv · {data.length} ta ko‘rsatilmoqda</p></div></div>
 <div className="mt-7 grid gap-3">{section==='products'&&<ProductEditor categories={categories.rows} brands={brands.rows}/>}{(section==='categories'||section==='brands')&&<TaxonomyEditor type={section}/>}
 {data.map(row=>{const r=row as Record<string,unknown>;const rowId=String(r.id||r.key);
  if(section==='products')return <ProductEditor key={rowId} product={row as Product} categories={categories.rows} brands={brands.rows}/>;
  if(section==='categories'||section==='brands')return <TaxonomyEditor key={rowId} type={section} item={row as Category|Brand}/>;
  const label=String(r.name||r.order_number||r.code||r.title||r.first_name||r.key||rowId);
  return <div key={rowId} className="rounded-2xl border bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-gray-900">{label}</h2>
   {section==='orders'&&<p className="mt-1 text-sm text-gray-500">{ORDER_STATUS_LABELS[r.status as OrderStatus]||String(r.status)} · {formatPrice(Number(r.total))}</p>}
   {section==='inventory'&&<p className="mt-1 text-sm text-gray-500">Qoldiq: {String(r.stock)} dona</p>}
   {section==='customers'&&<p className="mt-1 text-sm text-gray-500">{String(r.last_name||'')} {r.phone?`· ${String(r.phone)}`:''}</p>}
   {section==='reviews'&&<p className="mt-1 text-sm text-gray-500">{String(r.rating)} / 5 · {r.is_approved?'Tasdiqlangan':'Tasdiqlanmagan'}{r.comment?` · ${String(r.comment)}`:''}</p>}
   {section==='promotions'&&<p className="mt-1 text-sm text-gray-500">Chegirma: {String(r.discount_value)} {r.discount_type==='percent'?'%':'so‘m'}</p>}
   {(section==='banners'||section==='settings')&&<p className="mt-1 text-sm text-gray-500">Bu bo‘lim ma’lumotlari hozircha faqat ko‘rish uchun.</p>}
   </div></div>
   {['orders','inventory','reviews'].includes(section)&&!(section==='orders'&&r.status==='cancelled')&&<form action={updateAdminRecord} className="mt-4 flex flex-wrap gap-2"><input type="hidden" name="id" value={rowId}/><input type="hidden" name="type" value={section}/>{section==='orders'?<select aria-label="Buyurtma holati" name="value" defaultValue={String(r.status)} className="field max-w-52">{(['pending','confirmed','processing','shipped','delivered'] as OrderStatus[]).map(x=><option key={x} value={x}>{ORDER_STATUS_LABELS[x]}</option>)}</select>:section==='inventory'?<input aria-label="Ombor qoldig‘i" name="value" type="number" min="0" max="1000000" defaultValue={Number(r.stock)} className="field max-w-40"/>:<select aria-label="Sharh amali" name="value" className="field max-w-40"><option value="approve">Tasdiqlash</option><option value="delete">O‘chirish</option></select>}<button className="primary">Saqlash</button></form>}
  </div>
 })}
 {data.length===0&&<p className="rounded-2xl bg-gray-50 p-8 text-center text-sm text-gray-500">Hozircha yozuvlar yo‘q.</p>}
 </div></>
}
