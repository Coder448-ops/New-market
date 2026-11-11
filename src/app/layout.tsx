import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import './globals.css';
export const metadata: Metadata = { title:{default:'NEX MARKET — qulay xarid', template:'%s | NEX MARKET'}, description:'NEX MARKET demo marketplace — namoyish uchun katalog va savat', metadataBase:new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="uz"><body><Header/><main>{children}</main><Footer/></body></html>}
