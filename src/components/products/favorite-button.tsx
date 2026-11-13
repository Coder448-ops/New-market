'use client';
import {useFormStatus} from 'react-dom';
import {Heart, LoaderCircle} from 'lucide-react';
import {toggleFavorite} from '@/app/favorites/actions';

function Submit({saved}:{saved:boolean}) {
  const {pending}=useFormStatus();
  return <button type="submit" disabled={pending} aria-pressed={saved} className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:opacity-60 ${saved?'border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100':'border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:text-brand-700'}`}>
    {pending?<LoaderCircle size={19} className="animate-spin"/>:<Heart size={19} className={saved?'fill-current':''}/>}
    {pending?'Saqlanmoqda...':saved?'Saralangandan olib tashlash':'Saralanganlarga qo‘shish'}
  </button>;
}
export function FavoriteButton({id,slug,saved}:{id:string;slug:string;saved:boolean}) {
  return <form action={toggleFavorite}>
    <input type="hidden" name="productId" value={id}/><input type="hidden" name="slug" value={slug}/><input type="hidden" name="intent" value={saved?'remove':'add'}/>
    <Submit saved={saved}/>
  </form>;
}
