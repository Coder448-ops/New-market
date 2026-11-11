import {Catalog} from '@/components/local/catalog';
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <Catalog category={decodeURIComponent(slug)}/>}
