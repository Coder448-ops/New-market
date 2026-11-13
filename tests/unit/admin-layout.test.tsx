// @vitest-environment node
import React from 'react';
import {describe,it,expect,vi,beforeEach} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
const state=vi.hoisted(()=>({user:null as null | {id:string},admin:false,configured:true}));
vi.mock('server-only',()=>({}));
vi.mock('@/lib/db',()=>({isDatabaseConfigured:()=>state.configured}));
vi.mock('@/lib/auth/session',()=>({getCurrentUser:async()=>state.user,isAdmin:async()=>state.admin}));
vi.mock('next/navigation',()=>({redirect:(url:string)=>{throw Error('REDIRECT '+url)}}));
vi.mock('next/link',()=>({default:({href,children,...props}:React.PropsWithChildren<{href:string}>)=><a href={href} {...props}>{children}</a>}));
import AdminLayout from '@/app/admin/layout';
beforeEach(()=>{state.user=null;state.admin=false;state.configured=true});
describe('admin access',()=>{
 it('sends signed-out users to a login that returns to admin',async()=>{
  await expect(AdminLayout({children:<p>secret</p>})).rejects.toThrow('REDIRECT /login?next=admin');
 });
 it('explains missing permissions without rendering protected children',async()=>{
  state.user={id:'user'};
  const html=renderToStaticMarkup(await AdminLayout({children:<p>secret</p>}));
  expect(html).toContain('Admin huquqi mavjud emas');expect(html).not.toContain('secret');
 });
 it('shows the panel to an administrator',async()=>{
  state.user={id:'admin'};state.admin=true;
  const html=renderToStaticMarkup(await AdminLayout({children:<p>admin-content</p>}));
  expect(html).toContain('admin-content');expect(html).toContain('/admin/products');
 });
});
