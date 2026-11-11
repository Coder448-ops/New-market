import {Orders} from '@/components/demo/commerce';
export default async function Page({params}:{params:Promise<{id:string}>}){return <Orders id={(await params).id}/>}
