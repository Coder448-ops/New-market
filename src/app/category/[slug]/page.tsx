import {notFound} from 'next/navigation';
import {getCategoryBySlug} from '@/lib/database/catalog';
import {CatalogView} from '@/components/products/catalog-view';
export default async function Page({params,searchParams}:{params:Promise<{slug:string}>,searchParams:Promise<Record<string,string|undefined>>}){const {slug}=await params;const cat=await getCategoryBySlug(slug);if(!cat)notFound();return <CatalogView params={await searchParams} categorySlug={slug} title={cat.name}/>}
