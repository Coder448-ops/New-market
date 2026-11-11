import {Catalog} from '@/components/demo/storefront';
export default async function Page({params}:{params:Promise<{slug:string}>}){return <Catalog initialCategory={decodeURIComponent((await params).slug)}/>}
