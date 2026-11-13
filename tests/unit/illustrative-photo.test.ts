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

describe('all new photos',()=>{
 it('resolves the correct original path and keeps custom images intact',()=>{
  for(const id of ['01','02','03','04','05','06','09','10','11','13','14','16','21','23','25','27','28','29']) {
   const sku=`NEX-SINOV-${id}`;
   const ext=Number(id)<=10?'webp':'svg';
   expect(illustrativePhoto({sku,main_image:`/images/items/${id}.${ext}`})?.url).toBe(`/images/photos/${id}.jpg`);
   expect(illustrativePhoto({sku,main_image:'https://example.com/own.jpg'})).toBeNull();
  }
 });
});
