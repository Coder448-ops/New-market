import {Catalog} from '@/components/demo/storefront';
export default async function Page({searchParams}:{searchParams:Promise<{category?:string;brand?:string}>}){const p=await searchParams;return <Catalog initialCategory={p.category||''} initialBrand={p.brand||''}/>}
