// @vitest-environment node
import React from 'react';
import {describe,it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
vi.mock('@/lib/db',()=>({isDatabaseConfigured:()=>true}));
vi.mock('@/lib/auth/session',()=>({getCurrentUser:async()=>({id:'u'})}));
vi.mock('@/lib/database/orders',()=>({getUserOrders:async()=>[
 {id:'1',order_number:'NX-1',status:'pending',created_at:'2026-01-01',total:100},
 {id:'2',order_number:'NX-2',status:'confirmed',created_at:'2026-01-01',total:100},
 {id:'3',order_number:'NX-3',status:'cancelled',created_at:'2026-01-01',total:100},
]}));
vi.mock('next/link',()=>({default:({href,children}:React.PropsWithChildren<{href:string}>)=><a href={href}>{children}</a>}));
import OrdersPage from '@/app/orders/page';
describe('order status labels',()=>{it('renders customer-facing statuses in Uzbek',async()=>{
 const html=renderToStaticMarkup(await OrdersPage());
 expect(html).toContain('Kutilmoqda');expect(html).toContain('Tasdiqlangan');expect(html).toContain('Rad etilgan / bekor qilingan');
 expect(html).not.toContain('pending');expect(html).not.toContain('confirmed');
});});
