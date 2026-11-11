import {Checkout} from '@/components/demo/commerce';
export default async function Page({searchParams}:{searchParams:Promise<{coupon?:string;region?:string}>}){const p=await searchParams;return <Checkout coupon={p.coupon||''} region={p.region||''}/>}
