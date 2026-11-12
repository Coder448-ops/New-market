import {saveProduct,deleteProduct} from '@/app/admin/actions';
import type {Product,Category,Brand} from '@/types';
export function ProductEditor({product:p,categories,brands}:{product?:Product;categories:Category[];brands:Brand[]}){
 return <details className="rounded-2xl border border-gray-200 bg-white p-5"><summary className="cursor-pointer font-semibold text-gray-900">{p?`${p.name} — tahrirlash`:'+ Yangi mahsulot qo‘shish'}</summary>
 <form action={saveProduct} className="mt-5 grid gap-4 sm:grid-cols-2"><input type="hidden" name="id" value={p?.id||''}/>
 <label className="text-sm font-medium">Nomi<input className="field mt-1" name="name" required minLength={3} maxLength={200} defaultValue={p?.name}/></label>
 <label className="text-sm font-medium">URL nomi (slug)<input className="field mt-1" name="slug" placeholder="masalan-oq-sumka" required pattern="[a-z0-9-]{3,200}" defaultValue={p?.slug}/></label>
 <label className="text-sm font-medium">SKU<input className="field mt-1" name="sku" maxLength={100} defaultValue={p?.sku||''}/></label>
 <label className="text-sm font-medium">Rasm manzili (HTTPS yoki mavjud ichki tasvir)<input className="field mt-1" name="main_image" type="text" placeholder="https://..." defaultValue={p?.main_image||''}/></label>
 <label className="text-sm font-medium">Turkum<select name="category_id" className="field mt-1" defaultValue={p?.category_id||''}><option value="">Tanlanmagan</option>{categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
 <label className="text-sm font-medium">Brend<select name="brand_id" className="field mt-1" defaultValue={p?.brand_id||''}><option value="">Tanlanmagan</option>{brands.map(b=><option value={b.id} key={b.id}>{b.name}</option>)}</select></label>
 <label className="text-sm font-medium">Narx, so‘m<input className="field mt-1" type="number" min="0" max="1000000000" required name="price" defaultValue={p?.price}/></label>
 <label className="text-sm font-medium">Chegirma narxi, so‘m<input className="field mt-1" type="number" min="0" max="1000000000" name="discount_price" defaultValue={p?.discount_price??''}/></label>
 <label className="text-sm font-medium">Ombordagi soni<input className="field mt-1" type="number" min="0" max="1000000" required name="stock" defaultValue={p?.stock}/></label>
 <label className="text-sm font-medium sm:col-span-2">Tavsif<textarea className="field mt-1" rows={3} name="description" maxLength={10000} defaultValue={p?.description||''}/></label>
 <div className="flex flex-wrap items-center gap-5 sm:col-span-2"><label className="text-sm"><input type="checkbox" name="is_published" defaultChecked={p?.is_published}/> Nashr qilish</label><label className="text-sm"><input type="checkbox" name="is_featured" defaultChecked={p?.is_featured}/> Tavsiya etilgan</label></div><button className="primary sm:w-fit">Saqlash</button></form>
 {p&&<form action={deleteProduct} className="mt-4 border-t pt-4"><input type="hidden" name="id" value={p.id}/><button className="text-sm font-medium text-red-600">Mahsulotni o‘chirish</button></form>}</details>
}
