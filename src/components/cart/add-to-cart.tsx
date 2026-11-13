'use client';
import Link from 'next/link';
import {useState} from 'react';
import {Check,Minus,Plus,ShoppingBag} from 'lucide-react';

export function AddToCart({id,stock}:{id:string;stock:number}) {
  const [quantity,setQuantity]=useState(1);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const limit=Math.min(100,Math.max(0,stock));
  function add(){
    try {
      const raw:unknown=JSON.parse(localStorage.getItem('nex-cart')||'{}');
      if(!raw || typeof raw!=='object' || Array.isArray(raw)) throw Error();
      const items=raw as Record<string,number>;
      const current=items[id]??0;
      if(!Number.isInteger(current)||current<0) throw Error();
      if(current+quantity>limit){setMessage('');setError(`Savatga ko‘pi bilan ${limit} dona qo‘shish mumkin. Savatdagi miqdorni tekshiring.`);return;}
      if(!(id in items)&&Object.keys(items).length>=100){setMessage('');setError('Savatda ko‘pi bilan 100 xil mahsulot bo‘lishi mumkin.');return;}
      items[id]=current+quantity;
      localStorage.setItem('nex-cart',JSON.stringify(items));
      window.dispatchEvent(new Event('cart-change'));
      setError('');setMessage(`${quantity} dona savatga qo‘shildi.`);
    } catch {setMessage('');setError('Savatni saqlab bo‘lmadi. Brauzer xotirasini tekshiring.');}
  }
  return <div>
    <div className="mb-3 flex items-center justify-between gap-4"><span className="text-sm font-medium text-gray-600">Miqdor</span><div className="flex items-center rounded-xl border border-gray-200 bg-gray-50">
      <button type="button" aria-label="Miqdorni kamaytirish" disabled={quantity<=1||limit===0} onClick={()=>setQuantity(q=>Math.max(1,q-1))} className="p-3 text-gray-700 disabled:opacity-30"><Minus size={16}/></button>
      <span aria-live="polite" className="w-8 text-center text-sm font-bold">{quantity}</span>
      <button type="button" aria-label="Miqdorni oshirish" disabled={quantity>=limit} onClick={()=>setQuantity(q=>Math.min(limit,q+1))} className="p-3 text-gray-700 disabled:opacity-30"><Plus size={16}/></button>
    </div></div>
    <button type="button" disabled={limit<1} onClick={add} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-4 font-semibold text-white shadow-lg shadow-brand-700/20 transition hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:bg-gray-300 disabled:shadow-none"><ShoppingBag size={20}/>{limit<1?'Mavjud emas':'Savatga qo‘shish'}</button>
    {message&&<p role="status" className="mt-3 flex flex-wrap items-center gap-2 text-sm text-emerald-700"><Check size={17}/>{message} <Link href="/cart" className="font-semibold underline">Savatni ko‘rish</Link></p>}
    {error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  </div>;
}
