import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {Checkout} from '@/components/demo/commerce';
import {Admin} from '@/components/demo/admin';
import {KEY,quantity,update} from '@/lib/demo/store';
import {products} from '@/lib/demo/data';
const push=vi.fn();
vi.mock('next/navigation',()=>({useRouter:()=>({push})}));
beforeEach(()=>{localStorage.clear();push.mockClear();window.scrollTo=vi.fn()});
afterEach(cleanup);
describe('demo interactions',()=>{
 it('creates a local demo order through all checkout steps without processing payment',()=>{const p=products[1];quantity(p.id,1);render(<Checkout coupon="NEX10" region="Toshkent"/>);fireEvent.change(screen.getByLabelText('Demo ism'),{target:{value:'Demo User'}});fireEvent.change(screen.getByLabelText('Demo telefon'),{target:{value:'123'}});fireEvent.click(screen.getByRole('button',{name:'Davom etish'}));fireEvent.change(screen.getByLabelText('Demo manzil'),{target:{value:'Namuna manzil'}});fireEvent.click(screen.getByRole('button',{name:'Davom etish'}));fireEvent.change(screen.getByLabelText('To‘lov usuli'),{target:{value:'Payme (demo)'}});expect(screen.getByText(/Payme va Click ulanmagan/i)).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Davom etish'}));fireEvent.click(screen.getByRole('button',{name:'Demo tasdiqlash'}));const saved=JSON.parse(localStorage.getItem(KEY)!);expect(saved.orders[0].payment).toBe('Payme (demo)');expect(saved.orders[0].items[0].id).toBe(p.id);expect(saved.cart).toEqual({});expect(push).toHaveBeenCalledWith(expect.stringMatching(/^\/orders\/DEMO-/))});
 it('opens the explicitly unprotected demo admin and updates a product',()=>{update(s=>({...s,admin:true}));render(<Admin/>);fireEvent.click(screen.getByRole('button',{name:'Mahsulotlar'}));fireEvent.click(screen.getAllByRole('button',{name:'Tahrirlash'})[0]);fireEvent.change(screen.getByLabelText('Narx'),{target:{value:'100000'}});fireEvent.click(screen.getByRole('button',{name:'Demo saqlash'}));expect(JSON.parse(localStorage.getItem(KEY)!).products[0].price).toBe(100000)});
});
