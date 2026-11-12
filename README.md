# NEX MARKET

Next.js va PostgreSQL asosidagi marketplace. Parolsiz demo login va demo admin yo‘q. Foydalanuvchi so‘roviga ko‘ra 30 ta alohida belgilangan namunaviy mahsulot ko‘rgazmasi mavjud; ular haqiqiy katalog va buyurtmalarga qo‘shilmaydi. **Onlayn baza va SMTP ishlashi hali tasdiqlanmagan**, shuning uchun haqiqiy hisob va buyurtmalar ishlashi tasdiqlanmagan. Payme va Click ulanmagan. Ilova hali real savdoga tayyor emas.

## Sozlash

1. Node.js 20+ va PostgreSQL 15+ tayyorlang. Neon kabi mustaqil PostgreSQL provayderidan foydalanish mumkin; haqiqiy ulanish va migratsiya hali tekshirilmagan. Supabase ishlatilmaydi.
2. Bazaga zaxira oling va kerakli Neon branch/database tanlanganini tekshiring. `database/migrations/001_init.sql` faqat bo‘sh `public` sxemaga bir marta qo‘llanadi; skript mavjud obyektlarni aniqlasa to‘xtaydi va tranzaksiyani qaytaradi. `pgcrypto` va `pg_trgm` kengaytmalari kerak. So‘ng aynan shu bazada `database/migrations/002_auth_rate_limit.sql` ni ishga tushiring; bu mavjud foydalanuvchi ma’lumotlarini o‘chirmaydi va mos jadval mavjud bo‘lsa xavfsiz qayta ishga tushadi. Avvalgi SQL tranzaksiyasi xato bilan to‘xtagan bo‘lsa, undan oldin alohida `ROLLBACK;` bajaring. Keyin `database/migrations/003_optional_email_2fa.sql` va `database/migrations/004_phone_login.sql` ni ketma-ket bir martadan ishga tushiring. 001, 003 va 004 migratsiyalar allaqachon ishlatilgan bo‘lsa, ularni qayta ishga tushirmang. Bu sxema eski brauzer ma’lumotlarini avtomatik ko‘chirmaydi.
3. `.env.example` dan mahalliy maxfiy `.env.local` yarating. Serverga `DATABASE_URL`, tashqi HTTPS `NEXT_PUBLIC_APP_URL`, ixtiyoriy email ikki bosqichli himoya uchun SMTP qiymatlarini kiriting. SMS xizmati talab qilinmaydi. Maxfiy qiymatlarni Git yoki chatga joylamang. Production bazasi TLS bilan himoyalanishi kerak.
4. `npm ci`, migratsiyadan keyin `npm run dev`. Vercel production environment variable'lari server-side sifatida belgilanadi; migratsiya build vaqtida avtomatik ishlamaydi.

`/namunalar` — 30 ta statik namunaviy mahsulot va namunaviy narxlar ko‘rgazmasi; mahsulotlar bazaga yozilmaydi, sotib olib bo‘lmaydi, suratlar turkumning illustratsiyasidir. Kategoriyalarga ajratib ko‘rish mumkin. `tests/fixtures/catalog.sql` **faqat PGlite testlari** uchun; production bazasiga yuklamang. Haqiqiy katalog mahsulotlarini vakolatli admin kiritadi. Rasm uchun HTTPS manzil kiritish mumkin; doimiy rasm saqlash va upload hali amalga oshirilmagan.

## Hisob va administrator

Sessiya va email tokenlari hash shaklida bazada saqlanadi. Ikki bosqichli email himoyasi odatda o‘chiq; foydalanuvchi hisob sahifasida parol va email kodini tasdiqlab uni yoqishi yoki o‘chirishi mumkin. Yoqilganda har bir yangi kirishda 10 daqiqalik bir martalik kod so‘raladi; 5 ta xato urinishdan keyin kod ishlamaydi. Email himoyasi phishingga chidamli autentifikator yoki passkey o‘rnini bosmaydi. Emailga kirish yo‘qolsa mustaqil recovery mexanizmi hali mavjud emas. Ro‘yxatdan o‘tish va oddiy kirish +998 telefon raqami va parol bilan ishlaydi; SMS yuborilmaydi va raqam egaligi tekshirilmaydi. Boshqa shaxs raqamni birinchi bo‘lib ro‘yxatdan o‘tkazib qo‘yishi mumkin; raqamni shaxsni aniqlash, ishonchli aloqa yoki tiklash uchun tasdiqlangan deb hisoblamang. Email faqat foydalanuvchi ixtiyoriy himoyani yoqayotganda kiritiladi. Yangi telefon hisoblarida parolni tiklash hozircha yo‘q: xavfsiz parol tiklash alohida ishlab chiqilishi zarur. Admin hududi server tarafida admin rolini tekshiradi. Ommaviy/default admin yo‘q. Birinchi administrator uchun hisob yaratilgandan so‘ng vakolatli operator uning UUID sini bazada tekshirib, alohida xavfsiz SQL ulanishida shu hisobga `user_roles` jadvali orqali `admin` rolini tayinlashi kerak. UUID/credentiallarni chatga yubormang.

Kodda real DB narxi va qoldig‘ini tekshiradigan naqd buyurtma tuzilmasi mavjud, lekin tashqi PostgreSQL, SMTP, parallel checkout va production auth E2E sinovlari hali bajarilmagan. Auth uchun telefon, ro‘yxatdan o‘tish va email bo‘yicha PostgreSQL orqali instance-lararo limit bor. Bu IP bo‘yicha cheklov yoki to‘liq abuse himoyasi emas; production uchun qo‘shimcha tarmoq/WAF himoyasi va muddati tugagan `auth_rate_limits` yozuvlarini tozalash kerak. Onlayn to‘lovlar o‘chirilgan.

Avvalgi shaxsiy katalogni saqlab qolish uchun `/manage`, `/local`, `/local/cart`, `/local/favorites` mavjud; ular alohida browser localStorage ishlatadi va umumiy marketplace katalogi emas. `/manage` JSON zaxirasi faqat shu eski katalogga tegishli. Ular boshqa foydalanuvchilarga ma’lumot uzatmaydi.

## Tekshirish

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Auth uchun parol xeshi, sessiya, tasdiqlash xati unit testlari hamda PGlite orqali ro‘yxatdan o‘tish/kirish/tiklash oqimi testlari mavjud; SMTP yuborish mock orqali tekshiriladi. Testlar haqiqiy uchinchi tomon xizmatlariga ulanmaydi; PGlite testlari tashqi PostgreSQL yoki haqiqiy foydalanuvchilar bilan E2E sinovi o‘rnini bosmaydi. Qolgan ishlar `DEVELOPMENT_CHECKLIST.md`da.

## Vercel build: jadval topilmadi

`relation "categories" does not exist` — ulanish vaqtida joriy baza/search_path da kerakli jadval topilmadi. Neon branchi va maqsadli bo‘sh bazani tekshirib migratsiyani bir marta ishga tushiring; ma’lumotli bazani o‘zgartirishdan oldin zaxira oling. Migratsiya build vaqtida ishga tushirilmaydi. Bosh sahifa va sitemap deployment build paytida bazani o‘qimaydi, lekin ishlash vaqtida katalog/auth uchun mos sxema va haqiqiy ulanish shart. SMTP ham alohida sozlanishi kerak.

### Admin panel

`/admin` server tomonida admin rolini tekshiradi, demo yoki umumiy parol yo‘q. Mahsulotlarni qo‘shish/tahrirlash (narx, chegirma, qoldiq, turkum, brend va HTTPS rasm), turkum va brendlarni qo‘shish/tahrirlash, buyurtma holati, ombor va sharhlar uchun amallar bor. Kuponlar, bannerlar, mijozlar va sozlamalar hozircha ko‘rish uchun; to‘liq CRUD emas. Mahsulotni o‘chirish haqiqiy yozuvga ta’sir qiladi. Bekor qilingan buyurtmalar admin paneldan qayta ochilmaydi; qaytarish/stock tranzaksiyasi hali yo‘q. Admin roli bazada vakolatli operator tomonidan qo‘lda tayinlanadi, o‘z-o‘zidan berilmaydi.

### Email 2FA

SMTP barcha email manzillarga (jumladan Gmail) kod yuborish uchun kerak. Vercel Project → Settings → Environment Variables sahifasida production uchun `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` va to‘g‘ri HTTPS `NEXT_PUBLIC_APP_URL` ni xizmat provayderi ma’lumotlari bilan sozlang; maxfiy qiymatlarni chatga, Git'ga yoki logga yubormang. Masalan, Gmail yuboruvchi sifatida tanlansa: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER` va `MAIL_FROM` tegishli Gmail manzili, `SMTP_PASSWORD` esa Google hisobidagi 2-Step Verification orqali yaratilgan App Password bo‘lishi mumkin; uning mavjudligi hisob siyosatiga bog‘liq. Qiymatlarni operator to‘g‘ridan-to‘g‘ri Vercel'ga kiritadi, keyin yangi deployment zarur. Gmail jo‘natish cheklovlari va provider shartlari qo‘llanadi. Arena Gmail ulanishi veb-ilova uchun doimiy SMTP ulanishi emas. SMTP ishlamasa email 2FA o‘chirilmaydi va kod bilan kirish chetlab o‘tilmaydi. Auth holati PGlite va mock SMTP bilan tekshirilgan; real Neon, SMTP va brauzer orqali sinov shart. `auth_2fa_challenges` va `auth_rate_limits` muddati o‘tgan qatorlarini davriy tozalash kerak.

### Telefon autentifikatsiyasi va eski hisoblar

SMS tasdiqlash ishlatilmaydi. `phone_verified_at` ilgari tasdiqlangan hisoblarning tarixiy holatini saqlaydi; yangi hisoblarda NULL qoladi. Eski email hisoblar `/legacy-login` orqali avvalgi email/parol bilan kirib, hisob sahifasida tasdiqlanmagan telefon raqamini bog‘lashi mumkin. Mavjud `phone_verifications` jadvali va ma’lumotlari xavfsizlik uchun avtomatik o‘chirilmaydi; eski tugallanmagan SMS registratsiyalar hisobga aylanmaydi, ular qayta ro‘yxatdan o‘tishi kerak. Raqamni almashtirish va yangi telefon hisobi parolini xavfsiz tiklash hali tayyor emas. Telefon egaligi tekshirilmagani sababli raqamni egallab olish va firibgarlik xavfi mavjud; WAF va qo‘shimcha himoyalarsiz ishlab chiqarishda qo‘llamang.
