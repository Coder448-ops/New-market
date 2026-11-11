import {DemoDetail} from '@/components/demo/products';
import {ProductDetail} from '@/components/local/product-detail';
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return slug.startsWith('demo-')?<DemoDetail id={slug}/>:<ProductDetail id={slug}/>}
