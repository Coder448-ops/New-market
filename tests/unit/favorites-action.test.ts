import {beforeEach,describe,expect,it,vi} from 'vitest';
const mocks=vi.hoisted(()=>({query:vi.fn(),user:vi.fn(),revalidate:vi.fn(),redirect:vi.fn()}));
vi.mock('@/lib/db',()=>({db:()=>({query:mocks.query})}));
vi.mock('@/lib/auth/session',()=>({getCurrentUser:mocks.user}));
vi.mock('next/cache',()=>({revalidatePath:mocks.revalidate}));
vi.mock('next/navigation',()=>({redirect:mocks.redirect}));
import {toggleFavorite} from '@/app/favorites/actions';
const id='b8a5cd45-5476-46bb-8097-0cac770d7e43';
function form(intent:string){const f=new FormData();f.set('productId',id);f.set('slug','bag');f.set('intent',intent);return f;}
beforeEach(()=>{vi.clearAllMocks();mocks.user.mockResolvedValue({id:'user'});mocks.query.mockResolvedValue({rowCount:1});});
describe('favorite changes',()=>{
 it('adds idempotently and refreshes the relevant pages',async()=>{await toggleFavorite(form('add'));expect(mocks.query.mock.calls[0][0]).toContain('insert into favorites');expect(mocks.query.mock.calls[0][0]).toContain('on conflict');expect(mocks.revalidate).toHaveBeenCalledWith('/favorites');expect(mocks.revalidate).toHaveBeenCalledWith('/product/bag');});
 it('removes only the current user’s item',async()=>{await toggleFavorite(form('remove'));expect(mocks.query).toHaveBeenCalledWith('delete from favorites where user_id=$1 and product_id=$2',['user',id]);});
 it('rejects an invalid intent without a database mutation',async()=>{await toggleFavorite(form('toggle'));expect(mocks.query).not.toHaveBeenCalled();});
 it('redirects guests to login',async()=>{mocks.user.mockResolvedValue(null);mocks.redirect.mockImplementation(()=>{throw Error('redirect')});await expect(toggleFavorite(form('add'))).rejects.toThrow('redirect');expect(mocks.redirect).toHaveBeenCalledWith('/login');expect(mocks.query).not.toHaveBeenCalled();});
});
