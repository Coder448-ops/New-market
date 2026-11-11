# NEX MARKET — development checklist

Holat: tugallanmagan; real savdo uchun tayyor emas.

- [x] Supabase dependency va client kodlarini olib tashlash; mustaqil PostgreSQL, hashed session va SMTP asosini yaratish.
- [x] PGlite bilan yangi migratsiya, seed, narx, qoldiq va idempotency asosiy holatlarini tekshirish.
- [ ] Tashqi PostgreSQL, TLS, migratsiya, parallel checkout va barcha ruxsatlarni tekshirish.
- [ ] SMTP bilan registration, tasdiqlash, kirish, chiqish, parol tiklashni E2E sinash; auth xavfsizlik auditi va umumiy rate limiter.
- [ ] To‘liq admin CRUD, variantlar, order bekor qilish/restock, hisobot, filtr, sozlamalar va bannerlar.
- [ ] Doimiy obyekt storage va xavfsiz upload/o‘chirish, real product rasmlari.
- [ ] Savat sinxronlash, manzillar, batafsil gallery/specifications va qidiruv/turkumlar.
- [ ] Payme va Click protokollari, imzo tekshiruvi, reconciliation va sandbox testlar.
- [ ] Legal/contact mazmuni, SEO, accessibility, responsive va E2E testlar.
- [ ] Dependency audit kamchiliklarini tuzatish; faqat keyin ishlab chiqarishga tayyorlikni baholash.
