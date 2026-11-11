import {CatalogView} from '@/components/products/catalog-view';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){const p=await searchParams;return <CatalogView params={p} title={p.q?`“${p.q}” bo‘yicha natijalar`:'Qidiruv'}/>}
