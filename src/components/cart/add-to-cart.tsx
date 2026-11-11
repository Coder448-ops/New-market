'use client';
import {useState} from 'react';
import {ShoppingBag} from 'lucide-react';
export function AddToCart({id,stock}:{id:string;stock:number}){const [added,setAdded]=useState(false);function add(){try{const items:Record<string,number>=JSON.parse(localStorage.getItem('nex-cart')||'{}');items[id]=Math.min(stock,(items[id]||0)+1);localStorage.setItem('nex-cart',JSON.stringify(items));window.dispatchEvent(new Event('cart-change'));setAdded(true)}catch{setAdded(false)}}return <button disabled={stock<1} onClick={add} className="primary w-full gap-2 disabled:bg-gray-300"><ShoppingBag size={19}/>{stock<1?'Mavjud emas':added?'Savatga qo‘shildi':'Savatga qo‘shish'}</button>}
