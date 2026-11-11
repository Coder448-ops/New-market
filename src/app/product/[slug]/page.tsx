import {ProductDetail} from '@/components/local/product-detail';
export default async function Page({params}:{params:Promise<{slug:string}>}){return <ProductDetail id={(await params).slug}/>}
