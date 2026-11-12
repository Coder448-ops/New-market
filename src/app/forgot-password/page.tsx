import {AuthForm} from '@/components/forms/auth-form';
export default async function Page({searchParams}:{searchParams:Promise<{error?:string;sent?:string}>}){const p=await searchParams;return <AuthForm mode="forgot" error={p.error} sent={p.sent}/>}
