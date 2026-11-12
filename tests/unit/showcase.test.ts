import {describe,it,expect} from 'vitest';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {showcaseProducts,showcaseCategories} from '@/lib/showcase/products';
describe('isolated showcase',()=>{
 it('has 30 unique illustrative entries in six groups',()=>{
  expect(showcaseProducts).toHaveLength(30);
  expect(new Set(showcaseProducts.map(p=>p.id)).size).toBe(30);
  expect(showcaseCategories).toHaveLength(6);
  expect(new Set(showcaseProducts.map(p=>p.image)).size).toBe(30);
  for(const p of showcaseProducts)expect(existsSync(join(process.cwd(),'public',p.image))).toBe(true);
  for(const c of showcaseCategories)expect(showcaseProducts.filter(p=>p.category.id===c.id)).toHaveLength(5);
 });
});
