'use client';
import {useFormStatus} from 'react-dom';
import {rejectOrder} from '@/app/admin/actions';
function Submit(){const {pending}=useFormStatus();return <button type="submit" disabled={pending} className="min-h-11 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">{pending?'Rad etilmoqda...':'Buyurtmani rad etish'}</button>}
export function RejectOrderButton({id}:{id:string}){
 return <form action={rejectOrder} onSubmit={e=>{if(!window.confirm('Buyurtmani rad etasizmi? Mahsulotlar omborga qaytariladi.'))e.preventDefault()}}>
  <input type="hidden" name="id" value={id}/><Submit/>
 </form>;
}
