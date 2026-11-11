import {CatalogView} from '@/components/products/catalog-view';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){return <CatalogView params={await searchParams}/>}
