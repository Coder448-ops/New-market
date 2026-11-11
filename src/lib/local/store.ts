import {z} from 'zod';

/** All data is private to this browser and can be cleared by the browser/user. */
export const productSchema=z.object({
 id:z.string().uuid(),name:z.string().trim().min(2).max(160),description:z.string().max(3000),
 category:z.string().trim().max(80),brand:z.string().trim().max(80),
 price:z.number().int().min(0).max(1000000000),stock:z.number().int().min(0).max(1000000),
 image:z.string().max(450000).refine(x=>!x||/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(x)),
 createdAt:z.string().datetime(),
});
export type LocalProduct=z.infer<typeof productSchema>;
const stateSchema=z.object({products:z.array(productSchema).max(200),cart:z.record(z.number().int().min(1).max(100)),favorites:z.array(z.string().uuid()).max(200)}).superRefine((state,ctx)=>{const products=new Map(state.products.map(p=>[p.id,p]));if(products.size!==state.products.length)ctx.addIssue({code:'custom',message:'Takrorlangan mahsulot'});if(new Set(state.favorites).size!==state.favorites.length||state.favorites.some(id=>!products.has(id)))ctx.addIssue({code:'custom',message:'Saralangan mahsulot noto‘g‘ri'});for(const [id,qty] of Object.entries(state.cart)){const p=products.get(id);if(!p||qty>p.stock)ctx.addIssue({code:'custom',message:'Savat noto‘g‘ri'})}});
export type LocalState=z.infer<typeof stateSchema>;
export const KEY='nex-market-local-v1';
export const EMPTY=JSON.stringify({products:[],cart:{},favorites:[]});
export function parseState(raw:string):LocalState {return stateSchema.parse(JSON.parse(raw))}
export function readSnapshot():string {try{return localStorage.getItem(KEY)||EMPTY}catch{return EMPTY}}
export function subscribe(callback:()=>void){const handleStorage=(e:StorageEvent)=>{if(e.key===KEY||e.key===null)callback()};window.addEventListener('storage',handleStorage);window.addEventListener('nex-local-change',callback);return ()=>{window.removeEventListener('storage',handleStorage);window.removeEventListener('nex-local-change',callback)}}
export function replaceState(value:LocalState){const updated=stateSchema.parse(value);localStorage.setItem(KEY,JSON.stringify(updated));window.dispatchEvent(new Event('nex-local-change'))}
export function updateState(fn:(current:LocalState)=>LocalState){const existing=localStorage.getItem(KEY);const state=existing?parseState(existing):parseState(EMPTY);const updated=stateSchema.parse(fn(state));localStorage.setItem(KEY,JSON.stringify(updated));window.dispatchEvent(new Event('nex-local-change'))}
export function putProduct(product:LocalProduct){const p=productSchema.parse(product);updateState(s=>{const cart={...s.cart};if(cart[p.id]>p.stock){if(p.stock)cart[p.id]=p.stock;else delete cart[p.id]}return {...s,cart,products:[...s.products.filter(x=>x.id!==p.id),p]}})}
export function deleteProduct(id:string){updateState(s=>{const cart={...s.cart};delete cart[id];return {...s,products:s.products.filter(p=>p.id!==id),favorites:s.favorites.filter(x=>x!==id),cart}})}
export function setQuantity(id:string,quantity:number){updateState(s=>{const product=s.products.find(p=>p.id===id);if(!product)throw Error('Mahsulot topilmadi');const cart={...s.cart};if(quantity<=0)delete cart[id];else cart[id]=Math.min(100,product.stock,Math.floor(quantity));if(!cart[id])delete cart[id];return {...s,cart}})}
export function toggleFavorite(id:string){updateState(s=>{if(!s.products.some(p=>p.id===id))throw Error('Mahsulot topilmadi');return {...s,favorites:s.favorites.includes(id)?s.favorites.filter(x=>x!==id):[...s.favorites,id]}})}
