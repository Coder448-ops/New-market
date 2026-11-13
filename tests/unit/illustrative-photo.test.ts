import {describe,it,expect} from 'vitest';
import {illustrativePhoto} from '@/lib/showcase/photo';
describe('illustrative catalogue photos',()=>{
 it('maps only matching original test images',()=>{
  expect(illustrativePhoto({sku:'NEX-SINOV-17',main_image:'/images/items/17.svg'})?.url).toBe('/images/photos/17.jpg');
  expect(illustrativePhoto({sku:'NEX-SINOV-17',main_image:'https://example.com/my-image.jpg'})).toBeNull();
  expect(illustrativePhoto({sku:'other',main_image:'/images/items/17.svg'})).toBeNull();
  expect(illustrativePhoto({sku:'NEX-SINOV-18',main_image:'/images/items/17.svg'})).toBeNull();
 });
});
