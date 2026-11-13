// These images illustrate only the original imported catalogue products. Never
// replace an administrator's custom image, even if the SKU remains unchanged.
const photos: Record<string, {author:string; source:string; license:string; licenseUrl:string; changes:string}> = {
 "01": {author:"Robert Nelson",source:"https://commons.wikimedia.org/wiki/File:Pixel_Buds_in_charging_case_with_product_box.jpg",license:"CC BY 2.0",licenseUrl:"https://creativecommons.org/licenses/by/2.0/",changes:"O‘lchami kichraytirilgan"},
 "02": {author:"Pittigrilli",source:"https://commons.wikimedia.org/wiki/File:JBL_Xtreme_Bluetooth_speaker_(28_cm_long)_viewed_from_an_oblique_front_angle.jpg",license:"CC BY-SA 4.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",changes:"O‘lchami kichraytirilgan"},
 "08": {author:"Imani Clovis",source:"https://commons.wikimedia.org/wiki/File:Minimal_flower_vase_(Unsplash).jpg",license:"CC0 1.0",licenseUrl:"https://creativecommons.org/publicdomain/zero/1.0/",changes:"O‘lchami kichraytirilgan"},
 "09": {author:"Alex Tang",source:"https://commons.wikimedia.org/wiki/File:Reed_diffuser.jpg",license:"CC0 1.0",licenseUrl:"https://creativecommons.org/publicdomain/zero/1.0/",changes:"O‘lchami kichraytirilgan"},
 "03": {author:"Louis PL",source:"https://commons.wikimedia.org/wiki/File:Samsung_Galaxy_Watch_42mm.jpg",license:"CC BY-SA 4.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",changes:"O‘lchami kichraytirilgan"},
 "04": {author:"SD hehua",source:"https://commons.wikimedia.org/wiki/File:Multi-USB_and_charger.jpg",license:"CC BY 4.0",licenseUrl:"https://creativecommons.org/licenses/by/4.0/",changes:"O‘lchami kichraytirilgan"},
 "05": {author:"Pixloom",source:"https://commons.wikimedia.org/wiki/File:A_wireless_computer_mouse.jpg",license:"CC BY-SA 4.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",changes:"O‘lchami kichraytirilgan"},
 "06": {author:"AirbusA330772673",source:"https://commons.wikimedia.org/wiki/File:A_desk_lamp.jpg",license:"CC BY-SA 4.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",changes:"O‘lchami kichraytirilgan"},
 "10": {author:"Hey Paul",source:"https://commons.wikimedia.org/wiki/File:Baskets_Wicker.jpg",license:"CC BY 2.0",licenseUrl:"https://creativecommons.org/licenses/by/2.0/",changes:"O‘lchami kichraytirilgan"},
 "11": {author:"stux",source:"https://commons.wikimedia.org/wiki/File:Cream_in_round_container.jpg",license:"CC0 1.0",licenseUrl:"https://creativecommons.org/publicdomain/zero/1.0/",changes:"O‘lchami kichraytirilgan"},
 "28": {author:"Corn cheese",source:"https://commons.wikimedia.org/wiki/File:Resistance_Band_(cropped).jpg",license:"CC BY-SA 4.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",changes:"Manbada kesilgan va o‘lchami kichraytirilgan"},
 "14": {author:"Ubcule",source:"https://commons.wikimedia.org/wiki/File:Neutrogena_Norwegian_Formula_Hand_Cream.jpg",license:"CC BY-SA 4.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",changes:"O‘lchami kichraytirilgan"},
 "16": {author:"Bongoramsey",source:"https://commons.wikimedia.org/wiki/File:Tote_handbag_Etienne_Aigner.JPG",license:"CC BY-SA 3.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0/",changes:"O‘lchami kichraytirilgan"},
 "21": {author:"Quercus acuta",source:"https://commons.wikimedia.org/wiki/File:Vintage_VICTOR_Coffee_Mug.jpg",license:"CC BY-SA 4.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",changes:"O‘lchami kichraytirilgan"},
 "25": {author:"Daniel Sone / National Cancer Institute",source:"https://commons.wikimedia.org/wiki/File:Dinner_plates.jpg",license:"Public domain",licenseUrl:"https://creativecommons.org/publicdomain/mark/1.0/",changes:"O‘lchami kichraytirilgan"},
 "27": {author:"Gausanchennai",source:"https://commons.wikimedia.org/wiki/File:Yoga_mat.jpg",license:"CC BY-SA 4.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",changes:"O‘lchami kichraytirilgan"},
 "29": {author:"Harsh Jadav",source:"https://commons.wikimedia.org/wiki/File:Leather_duffel_bag_on_the_ground_(Unsplash).jpg",license:"CC0 1.0",licenseUrl:"https://creativecommons.org/publicdomain/zero/1.0/",changes:"O‘lchami kichraytirilgan"},
 '17': {author:'Nicholas Gemini',source:'https://commons.wikimedia.org/wiki/File:Leather_wallets_09.JPG',license:'CC BY-SA 3.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/',changes:'O‘lchami kichraytirilgan'},
 '18': {author:'Avacalop',source:'https://commons.wikimedia.org/wiki/File:Sun_glasses.jpg',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',changes:'O‘lchami kichraytirilgan'},
 '19': {author:'smittenkittenorig',source:'https://commons.wikimedia.org/wiki/File:Red_infinity_scarf.jpg',license:'CC BY 2.0',licenseUrl:'https://creativecommons.org/licenses/by/2.0/',changes:'O‘lchami kichraytirilgan'},
 '20': {author:'Alberto Ziveri',source:'https://commons.wikimedia.org/wiki/File:Herschel_Supply_Co._backpack.jpg',license:'CC BY 2.0',licenseUrl:'https://creativecommons.org/licenses/by/2.0/',changes:'Manbadagi kesilgan versiya'},
 '26': {author:'Sjennings2',source:'https://commons.wikimedia.org/wiki/File:Waterbottle.jpg',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',changes:'O‘lchami kichraytirilgan'},
};
const generated = new Set(['07','12','13','15','22','23','24','30']);

export function illustrativePhoto(product:{sku?:string|null;main_image?:string|null}) {
 const match=product.sku?.match(/^NEX-SINOV-(\d{2})$/);
 if (!match || (!photos[match[1]] && !generated.has(match[1]))) return null;
 const extension=Number(match[1])<=10?'webp':'svg';
 if (product.main_image!==`/images/items/${match[1]}.${extension}`) return null;
 if (generated.has(match[1])) return {kind:'generated' as const,url:`/images/photos/${match[1]}-ai.jpg`};
 return {kind:'licensed' as const,...photos[match[1]],url:`/images/photos/${match[1]}.jpg`};
}
