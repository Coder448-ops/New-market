// Source data for an explicit, administrator-only test catalogue import.
export const showcaseCategories = [
  {id:'texnika', title:'Texnika', image:'/images/sample-tech.webp', color:'bg-[#ece8f8]'},
  {id:'uy', title:'Uy uchun', image:'/images/sample-home.webp', color:'bg-[#f2ebe3]'},
  {id:'gozallik', title:'Go‘zallik', image:'/images/sample-beauty.webp', color:'bg-[#f7e9e9]'},
  {id:'uslub', title:'Aksessuarlar', image:'/images/sample-style.webp', color:'bg-[#f2e9de]'},
  {id:'oshxona', title:'Oshxona', image:'/images/sample-kitchen.webp', color:'bg-[#e8f0e9]'},
  {id:'sport', title:'Sport', image:'/images/sample-sport.webp', color:'bg-[#e9eff5]'},
] as const;
const entries = [
 ['Simsiz quloqchin',249000],['Portativ karnay',329000],['Aqlli soat',589000],['Telefon uchun quvvatlagich',89000],['Simsiz sichqoncha',129000],
 ['Stol chirog‘i',185000],['Yumshoq pled',220000],['Dekorativ vaza',119000],['Aroma diffuzor',165000],['Saqlash savati',99000],
 ['Namlagich krem',115000],['Yuz uchun serum',139000],['Soch parvarishi to‘plami',179000],['Qo‘l kremi',59000],['Yuz uchun niqob',49000],
 ['Kundalik sumka',289000],['Hamyon',125000],['Quyosh ko‘zoynagi',159000],['Sharf',79000],['Kichik ryukzak',239000],
 ['Keramika finjon',69000],['Choynak',215000],['Oshxona idishlari to‘plami',279000],['Suv grafin',99000],['Nonushta likopchasi',55000],
 ['Suv idishi',79000],['Yoga gilamchasi',149000],['Mashq rezinkasi',49000],['Sport sumkasi',189000],['Fitnes qo‘lqopi',69000],
] as const;
export const showcaseProducts=entries.map(([name,price],index)=>({id:index+1,name,price,image:`/images/items/${String(index+1).padStart(2,'0')}.${index<10?'webp':'svg'}`,category:showcaseCategories[Math.floor(index/5)]}));
