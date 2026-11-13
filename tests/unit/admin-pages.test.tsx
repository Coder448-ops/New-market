// @vitest-environment node
import {describe,it,expect,vi} from 'vitest';
vi.mock('server-only',()=>({}));
vi.mock('@/lib/auth/session',()=>({requireAdmin:async()=>({error:'Forbidden'})}));
vi.mock('@/lib/db',()=>({db:()=>{throw Error('No unauthorized query allowed')}}));
vi.mock('next/navigation',()=>({notFound:()=>{throw Error('Not found')}}));
vi.mock('@/app/admin/actions',()=>({updateAdminRecord:()=>{},importTestProducts:()=>{},saveProduct:()=>{},deleteProduct:()=>{},saveTaxonomy:()=>{}}));
import AdminPage from '@/app/admin/page';
import AdminSection from '@/app/admin/[section]/page';
describe('admin pages',()=>{
 it('never queries or renders protected dashboard or section content without permission',async()=>{
  expect(await AdminPage()).toBeNull();
  expect(await AdminSection({params:Promise.resolve({section:'products'})})).toBeNull();
 });
});
