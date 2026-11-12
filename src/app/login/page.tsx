import {AuthForm} from '@/components/forms/auth-form';
export default async function Page({searchParams}:{searchParams:Promise<{error?:string;sent?:string;verified?:string;reset?:string}>}){const p=await searchParams;return <AuthForm mode="login" error={p.error} sent={p.sent} verified={p.verified} reset={p.reset}/>}
