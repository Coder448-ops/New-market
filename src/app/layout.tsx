import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import './globals.css';
// The shared header reads the live catalog; never query the database at build time.
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title:{default:'NEX MARKET — qulay xarid', template:'%s | NEX MARKET'}, description:'O‘zbekiston uchun onlayn marketplace', metadataBase:new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="uz"><body className="flex min-h-screen flex-col"><Header/><main className="flex-1">{children}</main><Footer/></body></html>}
