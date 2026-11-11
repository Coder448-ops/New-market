# NEX MARKET — brauzer rejimi

Bu versiya foydalanuvchi tanlagan **bazasiz, faqat brauzerda saqlash** rejimi. Hech qanday database yoki server-side saqlash xizmati talab qilinmaydi; mahsulot, rasm, saralanganlar va savat brauzerning `localStorage` xotirasida saqlanadi. Bu haqiqiy marketplace emas.

## Ishlatish

```sh
npm ci
npm run dev
```

Saytdagi **Qo‘shish** sahifasida mahsulot nomi, narxi, qoldig‘i va ixtiyoriy rasmni qo‘shing. Rasm JPEG/PNG/WebP, 300 KB gacha bo‘lishi mumkin. Katalog, qidiruv, filtr, saralash, saralanganlar va savat ushbu brauzerda ishlaydi. Boshqarish sahifasida JSON zaxira nusxasini yuklab olish va tasdiq bilan tiklash mumkin. Savat shaxsiy matn ro‘yxati sifatida yuklanadi.

**Cheklovlar:** boshqa brauzer yoki qurilmalar bu ma’lumotlarni ko‘rmaydi; brauzer ma’lumotlarini tozalash ularni o‘chiradi. Storage hajmi cheklangan va brauzer sozlamalari bilan o‘chirilishi mumkin. Zaxirani xavfsiz joyda saqlang. Zaxira fayli mahsulot rasmlarini ham o‘z ichiga oladi; uni ulashganda ehtiyot bo‘ling. Maxfiy yoki mijoz ma’lumotlarini kiritmang: qurilmadan foydalana oladigan shaxs brauzer ma’lumotlarini o‘qishi mumkin. Import mahalliy ma’lumotlarni almashtiradi.

Hisob, autentifikatsiya, umumiy admin, serverdagi narx/qoldiq tekshiruvi, haqiqiy buyurtma, to‘lov va yetkazib berish mavjud emas. Xarid yoki buyurtma tasdiqlanmaydi. Ushbu rejim tijorat faoliyatiga tayyor emas; bunday imkoniyatlar uchun kelajakda ishonchli server-side saqlash va xavfsizlik kerak. Avvalgi PostgreSQL ma’lumotlari avtomatik ko‘chirilmaydi.

## Vercel

Next.js loyihasi sifatida deployment qiling. Bazaga yoki maxfiy environment variable'larga ehtiyoj yo‘q. `NEXT_PUBLIC_APP_URL` ixtiyoriy metadata manzili. Vercel hosting rejasining haqiqiy limitlari va mumkin bo‘lgan xarajatlari provayder shartlariga bog‘liq; loyihaning o‘zi xizmatlardan bepul foydalanishni kafolatlamaydi.

## Tekshirish

```sh
npm run typecheck
npm run lint
npm test
npm run build
```
