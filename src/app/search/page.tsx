import {Catalog} from '@/components/demo/storefront';
export default async function Page({searchParams}:{searchParams:Promise<{q?:string}>}){return <Catalog initialQuery={(await searchParams).q||''}/>}
