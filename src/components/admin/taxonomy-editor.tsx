import {saveTaxonomy} from '@/app/admin/actions';
import type {Category,Brand} from '@/types';
export function TaxonomyEditor({type,item}:{type:'categories'|'brands';item?:Category|Brand}){
 const label=type==='categories'?'turkum':'brend';
 return <details className="rounded-2xl border bg-white p-5"><summary className="cursor-pointer font-semibold">{item?`${item.name} — tahrirlash`:`+ Yangi ${label} qo‘shish`}</summary><form action={saveTaxonomy} className="mt-4 grid gap-4 sm:grid-cols-2"><input type="hidden" name="type" value={type}/><input type="hidden" name="id" value={item?.id||''}/><label className="text-sm font-medium">Nomi<input className="field mt-1" name="name" minLength={2} maxLength={100} required defaultValue={item?.name}/></label><label className="text-sm font-medium">URL nomi (slug)<input className="field mt-1" name="slug" pattern="[a-z0-9-]{3,200}" required defaultValue={item?.slug}/></label><label className="text-sm"><input type="checkbox" name="is_active" defaultChecked={item?.is_active??true}/> Faol</label><div className="sm:col-span-2"><button className="primary">Saqlash</button></div></form></details>
}
