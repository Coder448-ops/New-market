# NEX MARKET — demo marketplace

Mavjud Next.js loyihasiga **DEMO MODE** qo‘shilgan. Hech qanday onlayn baza, haqiqiy login, buyurtma yoki to‘lov ulanmagan. Demo admin parolsiz va himoyalanmagan; u haqiqiy admin tizimi emas. Shaxsiy, moliyaviy yoki haqiqiy mijoz ma’lumotlarini kiritmang. Mahsulotlar, narxlar, reytinglar, sharhlar, buyurtmalar va tasvirlar namoyish uchun; suratlar AI yordamida yaratilgan umumiy illustratsiyalardir, real mahsulot fotosuratlari emas.

## Ishga tushirish

```sh
npm ci
npm run dev
# tekshirish
npm run typecheck
npm run lint
npm test
npm run build
```

`/` — demo bosh sahifa; `/catalog` — qidiruv/filtr; `/product/demo-2` — demo mahsulot; `/compare`, `/brands`, `/promotions`, `/notifications`, `/favorites`, `/cart` va `/checkout` — demo sahifalar. `/login` parolsiz namoyish hisobini, `/account` profilni ochadi. `/admin` dagi «Demo adminni ochish» tugmasi ommaviy va hech qanday xavfsizlik bermaydi. `/orders` dagi barcha buyurtmalar namuna. Payme/Click faqat yorliq, integratsiya qilinmagan. `/checkout` dagi tasdiqlash haqiqiy savdo operatsiyasi emas.

Demo kuponlar: `NEX10` (10%, kamida 100 000 so‘m), `WELCOME15` (15%, kamida 200 000 so‘m), `FREESHIP` (bepul demo yetkazish, kamida 100 000 so‘m); ularning muddati 2030-12-31. Admin panelida o‘zgartirish mumkin. Hisoblar, admin o‘zgarishlari, savat, buyurtma va sharhlar `nex-market-demo-v1` localStorage kalitida shu brauzerda saqlanadi. Boshqa foydalanuvchi/qurilmaga uzatilmaydi; storage tozalansa yo‘qoladi, hajm cheklangan, demo xotiraning zaxira/tiklash funksiyasi yo‘q. Reset qilish uchun brauzer developer tools orqali shu kalitni o‘chiring.

Avvalgi shaxsiy katalog saqlangan: `/manage`, `/local`, `/local/cart`, `/local/favorites`. U `nex-market-local-v1` nomli alohida xotiradan foydalanadi; `/manage` dagi JSON zaxira faqat shu eski katalog uchundir. Demo katalogga avtomatik ko‘chirilmaydi. Local rasmlar foydalanuvchining qurilmasida saqlanadi. Brauzer ma’lumotlari sir emas.

## Arxitektura va cheklovlar

`src/lib/demo/data.ts` — markaziy namunaviy ma’lumotlar; `src/lib/demo/store.ts` — demo holat va kuponlar; `src/components/demo/` — ekranlar. Avvalgi local qatlam `src/lib/local/` va `src/components/local/` da qoladi. Production server yoki API mavjud emas. Demo adapter xavfsiz backend o‘rnini bosmaydi: real tizimga o‘tishda server-side avtorizatsiya, narx va zaxira nazorati, ma’lumotlar bazasi, fayl saqlash, transaction, tasdiqlangan xaridor sharhlari va moderatsiya, autentifikatsiya, xavfsiz admin tayinlash, migratsiya va monitoringni alohida amalga oshirish kerak. Demo sharhlar tasdiqlanmagan va moderatsiya qilinmaydi; ularni haqiqiy sharh sifatida e’lon qilmang.

Demo hali barcha so‘ralgan premium funksiyalarning to‘liq implementatsiyasi emas. To‘liq responsive/accessibility va haqiqiy brauzer E2E tekshiruvi qilinmagan; shu sabab tijoratga tayyor emas. `NEXT_PUBLIC_APP_URL` faqat ixtiyoriy metadata manzili. Vercel yoki boshqa xizmat narxlari provayder shartlariga bog‘liq.
