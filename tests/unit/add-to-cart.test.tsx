import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {AddToCart} from '@/components/cart/add-to-cart';

afterEach(cleanup);
beforeEach(()=>localStorage.clear());
describe('add to cart',()=>{
  it('adds the chosen quantity and links to the cart',()=>{
    const changed=vi.fn(); window.addEventListener('cart-change',changed);
    render(<AddToCart id="product" stock={5}/>);
    fireEvent.click(screen.getByRole('button',{name:'Miqdorni oshirish'}));
    fireEvent.click(screen.getByRole('button',{name:'Savatga qo‘shish'}));
    expect(JSON.parse(localStorage.getItem('nex-cart')!)).toEqual({product:2});
    expect(screen.getByRole('status').textContent).toContain('2 dona');
    expect(screen.getByRole('link',{name:'Savatni ko‘rish'}).getAttribute('href')).toBe('/cart');
    expect(changed).toHaveBeenCalledOnce(); window.removeEventListener('cart-change',changed);
  });
  it('does not exceed existing stock or the cart limit',()=>{
    localStorage.setItem('nex-cart',JSON.stringify({product:2}));
    render(<AddToCart id="product" stock={2}/>);
    fireEvent.click(screen.getByRole('button',{name:'Savatga qo‘shish'}));
    expect(screen.getByRole('alert').textContent).toContain('ko‘pi bilan 2');
    expect(JSON.parse(localStorage.getItem('nex-cart')!)).toEqual({product:2});
  });
  it('disables the button when out of stock',()=>{
    render(<AddToCart id="product" stock={0}/>);
    expect((screen.getByRole('button',{name:'Mavjud emas'}) as HTMLButtonElement).disabled).toBe(true);
  });
});
