import {describe,it,expect} from 'vitest';
import {showcaseProducts,showcaseCategories} from '@/lib/showcase/products';
describe('isolated showcase',()=>{
 it('has 30 unique illustrative entries in six groups',()=>{
  expect(showcaseProducts).toHaveLength(30);
  expect(new Set(showcaseProducts.map(p=>p.id)).size).toBe(30);
  expect(showcaseCategories).toHaveLength(6);
  for(const c of showcaseCategories)expect(showcaseProducts.filter(p=>p.category.id===c.id)).toHaveLength(5);
 });
});
