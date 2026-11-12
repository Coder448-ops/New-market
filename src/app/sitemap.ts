import type {MetadataRoute} from 'next';
import {getProducts} from '@/lib/database/products';
import {getCategories} from '@/lib/database/catalog';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const url=process.env.NEXT_PUBLIC_APP_URL||'http://localhost:3000';const [p,c]=await Promise.all([getProducts({pageSize:1000}),getCategories()]);return ['', '/catalog','/about','/contact','/delivery','/payment','/help','/privacy','/terms'].map(x=>({url:url+x})).concat(p.products.map(x=>({url:url+'/product/'+x.slug})),c.map(x=>({url:url+'/category/'+x.slug})))}
