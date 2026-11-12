import {afterEach,beforeEach,describe,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {Manage} from '@/components/local/manage';
import {KEY,parseState} from '@/lib/local/store';
beforeEach(()=>localStorage.clear());
afterEach(cleanup);
describe('browser-only product form',()=>{it('saves entered products only in localStorage',async()=>{render(<Manage/>);fireEvent.change(screen.getByLabelText('Nomi'),{target:{value:'Shaxsiy mahsulot'}});fireEvent.change(screen.getByLabelText('Narx, so‘m'),{target:{value:'125000'}});fireEvent.change(screen.getByLabelText('Mavjud soni'),{target:{value:'3'}});fireEvent.click(screen.getByRole('button',{name:'Saqlash'}));await waitFor(()=>expect(localStorage.getItem(KEY)).not.toBeNull());const saved=parseState(localStorage.getItem(KEY)!);expect(saved.products[0].name).toBe('Shaxsiy mahsulot');expect(saved.products[0].price).toBe(125000)})});
