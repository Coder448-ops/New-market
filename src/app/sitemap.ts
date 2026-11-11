import type {MetadataRoute} from 'next';
export default function sitemap():MetadataRoute.Sitemap {const url=process.env.NEXT_PUBLIC_APP_URL||'http://localhost:3000';return ['','/catalog','/manage','/help','/privacy','/about'].map(path=>({url:url+path}))}
