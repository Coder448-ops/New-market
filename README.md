# NEX MARKET

Next.js va **mustaqil PostgreSQL** asosidagi marketplace. Supabase kerak emas. Loyiha hali tugallanmagan: real savdo uchun ishga tushirishdan oldin `DEVELOPMENT_CHECKLIST.md` va `COMPLETION_REPORT.md` dagi ishlarni bajaring.

## Sozlash

1. Node.js 20+, npm va PostgreSQL 15+ (masalan, o‘zingiz boshqaradigan server yoki Neon kabi PostgreSQL xizmati) tayyorlang.
2. Alohida bo‘sh ma’lumotlar bazasi yarating. Bu yangi sxema bo‘lib, avvalgi sxemadan avtomatik ma’lumot ko‘chirmaydi.
3. `.env.example` ni `.env.local` ga ko‘chiring, `DATABASE_URL` va `NEXT_PUBLIC_APP_URL` ni to‘ldiring. Production'da TLS bilan himoyalangan bazadan foydalaning; faylni Git'ga kiritmang.
4. Migratsiyani o‘zingizning PostgreSQL mijozingiz orqali **bir marta** ishga tushiring:

```sh
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -1 -f database/migrations/001_init.sql
# faqat mahalliy/sinov ma’lumotlari uchun:
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -1 -f database/seed.sql
npm ci
npm run dev
```

Migratsiya `pgcrypto` va `pg_trgm` extensionlarini talab qiladi. Xizmat ko‘rsatuvchi ularni qo‘llashi va migratsiya foydalanuvchisiga kerakli huquqlarni berishi kerak. Ulash satri kodda emas, server environment'da saqlansin. Brauzerga database kirishini bermang. PostgreSQL faqat ishonchli ilova serveridan ochiq bo‘lsin; bu sxemada RLS yo‘q, vakolatlar serverda tekshiriladi. Ilova DB credentiali bilan bazaga kirgan shaxs barcha ma’lumotlarni ko‘ra oladi.

## Autentifikatsiya va email

Ro‘yxatdan o‘tish va parolni tiklash uchun SMTP sozlamalari (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`) va tashqi HTTPS `NEXT_PUBLIC_APP_URL` kerak. Foydalanuvchining paroli scrypt bilan hash qilinadi; sessiya va bir martalik havola tokenlari bazada hash shaklida saqlanadi. Tasdiqlanmagan email bilan kirib bo‘lmaydi. SMTP sozlanmaganda ro‘yxatdan o‘tish ataylab mavjud emas. Hozirgi rate limiting faqat bitta server instance xotirasida, production uchun umumiy rate limiter va mustaqil xavfsizlik auditi zarur. Email va Auth jarayonlari tashqi SMTP/PostgreSQL bilan hali tekshirilmagan.

### Birinchi administrator

Ommaviy admin yaratilmaydi. Emailni tasdiqlagan hisobning UUID sini bazada tekshiring; vakolatli operator alohida SQL ulanishida UUID ni almashtirib bajarsin:

```sql
insert into user_roles (user_id, role)
values ('YOUR_USER_UUID'::uuid, 'admin')
on conflict (user_id, role) do nothing;
```

## Vercel

Vercel local fayl tizimi doimiy ma’lumotlar bazasi emas. `DATABASE_URL` sifatida tashqi PostgreSQL ulang va Vercel Environment Variables sahifasida server-only sifatida saqlang; `NEXT_PUBLIC_APP_URL` ni saytning HTTPS manziliga belgilang. SMTP qiymatlari ham faqat server-side bo‘lishi lozim. Sozlamalardan keyin yangi deployment zarur. SQL migratsiya va seedni Vercel build jarayoni avtomatik bajarmaydi.

Media yuklash hali amalga oshirilmagan; ishlab chiqarish uchun doimiy obyekt saqlash xizmati va tekshirilgan upload/delete qo‘shilishi kerak. Payme/Click ataylab o‘chirilgan. Savat qurilmalar orasida sinxronlanmaydi. Buyurtma funksiyasi DB narxi va qoldig‘ini tekshiradi, yetkazish qoidasi hozir SQL'da belgilangan. PostgreSQL concurrency, auth va SMTP E2E tekshiruvlari hali kerak.

## Tekshiruv

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Test suite PGlite ichida migratsiya, seed va ba’zi checkout holatlarini tekshiradi. Bu tashqi PostgreSQL, SMTP, ko‘p serverli concurrency yoki haqiqiy xaridorlar bilan end-to-end sinovning o‘rnini bosa olmaydi.
