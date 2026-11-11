# NEX MARKET

O‘zbekiston uchun Next.js App Router va Supabase asosidagi marketplace. **Loyiha hali tugallanmagan va ishlab chiqarishga tayyor emas.** Bajarilgan hamda qolgan ishlar uchun [DEVELOPMENT_CHECKLIST.md](DEVELOPMENT_CHECKLIST.md) va [COMPLETION_REPORT.md](COMPLETION_REPORT.md) ni ko‘ring.

## Talablar

Node.js 20+ (sinov: 22), npm va Supabase loyihasi. Muhit sozlanmaganida katalog bo‘sh ko‘rinadi va buyurtma/qayd funksiyalari ishlamaydi. Namuna ma’lumot faqat `supabase/seed.sql` da; ilova mahsulotlarni PostgreSQL'dan oladi.

```sh
npm ci
cp .env.example .env.local
# .env.local fayliga haqiqiy Supabase URL, anon key va server-only service role key kiriting
npm run dev
```

Supabase CLI bilan lokal loyiha sozlangan bo‘lsa, `supabase start` va `supabase db reset` migratsiya va seedni qo‘llaydi. Yoki yangi Supabase loyihasida `supabase/migrations/20260101000000_init.sql` ni SQL muharriri/CLI orqali qo‘llang; **seedni faqat sinov muhitida** ishga tushiring. Migratsiya ushbu muhitda jonli bazada tekshirilmagan: avval test loyihasida sinang. Real ma’lumotlar va rasmlarni o‘zingiz kiriting.

Supabase Auth Site URL va redirect URLs'ga `NEXT_PUBLIC_APP_URL` va `<URL>/auth/callback` ni qo‘shing; email tasdiqlash va SMTP sozlamalarini tekshiring. `NEXT_PUBLIC_APP_URL` deploy qilingan haqiqiy origin bo‘lsin. Keylarni Git'ga joylamang. Service role faqat serverda ishlatiladi, RLS'ni chetlab o‘tadi; uni hech qachon `NEXT_PUBLIC_` bilan belgilamang.

### Birinchi administrator

Ommaviy admin hisobi mavjud emas. Avval o‘zingizning hisobingizni normal ro‘yxatdan o‘tkazib tasdiqlang. So‘ng **Supabase SQL Editor'da, faqat vakolatli operator** aniq UUID'ni Auth Users bo‘limidan olib, quyidagi so‘rovga almashtirib bajarsin:

```sql
insert into public.user_roles (user_id, role)
values ('YOUR_AUTH_USER_UUID'::uuid, 'admin')
on conflict (user_id, role) do nothing;
```

`/admin` serverda rolni tekshiradi. Hech qachon bu SQL'ni ommaviy API orqali taqdim etmang.

## Buyurtma va to‘lov

Savat hozircha browser `localStorage` da va qurilmalar o‘rtasida sinxronlanmaydi. Checkout uchun login zarur. API narxlarni qabul qilmaydi: xizmat roliga cheklangan DB funksiyasi joriy narx, kupon va qoldiqni tekshiradi, qatorlarni qulflab buyurtma yaratadi. Hozir funksiyadagi yetkazib berish qoidasi: 500 000 so‘mdan boshlab yoki olib ketishda bepul, aks holda 25 000 so‘m; `.env.example`dagi delivery qiymatlari bu funksiyaga ulanmagan. Real bazada tranzaksiya, idempotency va raqobat testlari **hali bajarilmagan**.

Faqat naqd to‘lov tanlovi mavjud. **Payme va Click ishlamaydi va ataylab o‘chirilgan**, hatto credentials kiritilsa ham; callback, tranzaksiyalar, imzo tekshiruvi va provider sandbox sinovlari hali yozilishi kerak. Soxta to‘lov muvaffaqiyatini qaytaradigan kod ishlatilmaydi.

## Vercel

Repo'ni Vercel'ga ulang, framework Next.js deb tanlang. Supabase URL, anon key, `SUPABASE_SERVICE_ROLE_KEY` va `NEXT_PUBLIC_APP_URL` ni environment variables sifatida belgilang. Migratsiyalarni oldin Supabase'da bajaring, Auth redirect sozlang. Bu qadamlar deployment tayyorligini anglatmaydi; checklistdagi xavfsizlik va integratsiya ishlari avval bajarilishi shart. Rate limiter hozir faqat bitta process xotirasida, serverless deploymentda global himoya emas.

## Tekshiruv

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm audit --omit=dev
```

Testlar sof validation/format va migratsiya matnini statik tekshiradi; ular jonli PostgreSQL, Supabase Auth, provider API yoki E2E testlarining o‘rnini bosa olmaydi.

Notion'dagi o‘zbekcha loyiha tavsifi: [NEX MARKET loyihasi](https://app.notion.com/p/NEX-MARKET-To-liq-Full-Stack-Marketplace-loyihasi-O-zbekcha-4158ec15a2e38165bec8d180575fb6f0).
