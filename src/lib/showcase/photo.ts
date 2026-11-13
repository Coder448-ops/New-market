// These photographs illustrate only the original imported test products. Never
// replace an administrator's custom image, even if the SKU remains unchanged.
const photos: Record<string, {author:string; source:string; license:string; licenseUrl:string; changes:string}> = {
 '17': {author:'Nicholas Gemini',source:'https://commons.wikimedia.org/wiki/File:Leather_wallets_09.JPG',license:'CC BY-SA 3.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/',changes:'O‘lchami kichraytirilgan'},
 '18': {author:'Avacalop',source:'https://commons.wikimedia.org/wiki/File:Sun_glasses.jpg',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',changes:'O‘lchami kichraytirilgan'},
 '19': {author:'smittenkittenorig',source:'https://commons.wikimedia.org/wiki/File:Red_infinity_scarf.jpg',license:'CC BY 2.0',licenseUrl:'https://creativecommons.org/licenses/by/2.0/',changes:'O‘lchami kichraytirilgan'},
 '20': {author:'Alberto Ziveri',source:'https://commons.wikimedia.org/wiki/File:Herschel_Supply_Co._backpack.jpg',license:'CC BY 2.0',licenseUrl:'https://creativecommons.org/licenses/by/2.0/',changes:'Manbadagi kesilgan versiya'},
 '26': {author:'Sjennings2',source:'https://commons.wikimedia.org/wiki/File:Waterbottle.jpg',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',changes:'O‘lchami kichraytirilgan'},
};
export function illustrativePhoto(product:{sku?:string|null;main_image?:string|null}) {
 const match=product.sku?.match(/^NEX-SINOV-(17|18|19|20|26)$/);
 if (!match || product.main_image!==`/images/items/${match[1]}.svg`) return null;
 return {...photos[match[1]],url:`/images/photos/${match[1]}.jpg`};
}
