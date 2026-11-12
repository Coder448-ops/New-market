# NEX MARKET

Next.js va PostgreSQL asosidagi marketplace. Foydalanuvchi ko‘rsatmasiga binoan namunaviy demo katalog, parolsiz demo login va demo admin saytdan olib tashlandi. **Onlayn baza va SMTP ishlashi hali tasdiqlanmagan**, shuning uchun haqiqiy hisob va buyurtmalar ishlashi tasdiqlanmagan. Payme va Click ulanmagan. Ilova hali real savdoga tayyor emas.

## Sozlash

1. Node.js 20+ va PostgreSQL 15+ tayyorlang. Neon kabi mustaqil PostgreSQL provayderidan foydalanish mumkin; haqiqiy ulanish va migratsiya hali tekshirilmagan. Supabase ishlatilmaydi.
2. Bazaga zaxira oling va kerakli Neon branch/database tanlanganini tekshiring. `database/migrations/001_init.sql` faqat bo‘sh `public` sxemaga bir marta qo‘llanadi; skript mavjud obyektlarni aniqlasa to‘xtaydi va tranzaksiyani qaytaradi. `pgcrypto` va `pg_trgm` kengaytmalari kerak. Bu sxema eski brauzer ma’lumotlarini avtomatik ko‘chirmaydi.
3. `.env.example` dan mahalliy maxfiy `.env.local` yarating. Serverga `DATABASE_URL`, tashqi HTTPS `NEXT_PUBLIC_APP_URL`, va ro‘yxatdan o‘tish/email tasdiqlash/parol tiklash uchun SMTP qiymatlarini kiriting. Maxfiy qiymatlarni Git yoki chatga joylamang. Production bazasi TLS bilan himoyalanishi kerak.
4. `npm ci`, migratsiyadan keyin `npm run dev`. Vercel production environment variable'lari server-side sifatida belgilanadi; migratsiya build vaqtida avtomatik ishlamaydi.

`tests/fixtures/catalog.sql` **faqat PGlite testlari** uchun namunaviy ma’lumotlardir; production bazasiga yuklamang. Haqiqiy katalog mahsulotlarini vakolatli admin kiritishi kerak. Doimiy rasm saqlash va upload hali amalga oshirilmagan.

## Hisob va administrator

Sessiya va email tokenlari hash shaklida bazada saqlanadi. Ro‘yxatdan o‘tish uchun sozlangan SMTP talab qilinadi. Admin hududi server tarafida admin rolini tekshiradi. Ommaviy/default admin yo‘q. Birinchi administrator uchun emaili tasdiqlangan hisob yaratilgandan so‘ng vakolatli operator uning UUID sini bazada tekshirib, alohida xavfsiz SQL ulanishida shu hisobga `user_roles` jadvali orqali `admin` rolini tayinlashi kerak. UUID/credentiallarni chatga yubormang.

Kodda real DB narxi va qoldig‘ini tekshiradigan naqd buyurtma tuzilmasi mavjud, lekin tashqi PostgreSQL, SMTP, parallel checkout va production auth E2E sinovlari hali bajarilmagan. Joriy in-memory rate limit ko‘p instance bo‘ylab ishlamaydi va real foydalanishdan oldin ishonchli umumiy limiter kerak. Onlayn to‘lovlar o‘chirilgan.

Avvalgi shaxsiy katalogni saqlab qolish uchun `/manage`, `/local`, `/local/cart`, `/local/favorites` mavjud; ular alohida browser localStorage ishlatadi va umumiy marketplace katalogi emas. `/manage` JSON zaxirasi faqat shu eski katalogga tegishli. Ular boshqa foydalanuvchilarga ma’lumot uzatmaydi.

## Tekshirish

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Auth uchun parol xeshi, sessiya va tasdiqlash xati unit testlari mavjud; SMTP yuborish mock orqali tekshiriladi. Testlar haqiqiy uchinchi tomon xizmatlariga ulanmaydi; PGlite testlari tashqi PostgreSQL yoki haqiqiy foydalanuvchilar bilan E2E sinovi o‘rnini bosmaydi. Qolgan ishlar `DEVELOPMENT_CHECKLIST.md`da.

## Vercel build: jadval topilmadi

`relation "categories" does not exist` — ulanish vaqtida joriy baza/search_path da kerakli jadval topilmadi. Neon branchi va maqsadli bo‘sh bazani tekshirib migratsiyani bir marta ishga tushiring; ma’lumotli bazani o‘zgartirishdan oldin zaxira oling. Migratsiya build vaqtida ishga tushirilmaydi. Bosh sahifa va sitemap deployment build paytida bazani o‘qimaydi, lekin ishlash vaqtida katalog/auth uchun mos sxema va haqiqiy ulanish shart. SMTP ham alohida sozlanishi kerak.
