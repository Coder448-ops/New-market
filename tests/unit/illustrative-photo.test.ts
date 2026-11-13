import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { illustrativePhoto } from '@/lib/showcase/photo';

describe('illustrative catalogue images', () => {
  it('provides a real file for each original image and keeps custom images intact', () => {
    for (let n = 1; n <= 30; n++) {
      const id = String(n).padStart(2, '0');
      const sku = `NEX-SINOV-${id}`;
      const original = `/images/items/${id}.${n <= 10 ? 'webp' : 'svg'}`;
      const image = illustrativePhoto({ sku, main_image: original });
      expect(image, id).not.toBeNull();
      expect(existsSync(`public${image!.url}`), id).toBe(true);
      expect(illustrativePhoto({ sku, main_image: 'https://example.com/own.jpg' })).toBeNull();
    }
    expect(illustrativePhoto({ sku: 'other', main_image: '/images/items/17.svg' })).toBeNull();
    expect(illustrativePhoto({ sku: 'NEX-SINOV-18', main_image: '/images/items/17.svg' })).toBeNull();
  });
  it('distinguishes generated images from licensed photographs', () => {
    expect(illustrativePhoto({ sku: 'NEX-SINOV-13', main_image: '/images/items/13.svg' })).toEqual({ kind: 'generated', url: '/images/photos/13-ai.jpg' });
    expect(illustrativePhoto({ sku: 'NEX-SINOV-17', main_image: '/images/items/17.svg' })?.kind).toBe('licensed');
  });
});
