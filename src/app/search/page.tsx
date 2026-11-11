import {Catalog} from '@/components/local/catalog';
export default async function Page({searchParams}:{searchParams:Promise<{q?:string}>}){const {q}=await searchParams;return <Catalog initialQuery={typeof q==='string'?q:''}/>}
