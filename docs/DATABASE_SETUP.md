# إعداد قاعدة البيانات — AZM Logic

هذا المستند يشرح تجهيز PostgreSQL وPrisma للمرحلة الثانية. لا توجد حاجة لقاعدة بيانات حتى تعمل الواجهة التجريبية؛ عند غياب `DATABASE_URL` يبقى النظام في وضع البيانات التجريبي.

## المتطلبات

- PostgreSQL 14 أو أحدث.
- Node.js 20 أو أحدث.
- متغيرات البيئة خارج Git.
- صلاحية تشغيل أوامر Prisma على بيئة Hostinger أو VPS.

## متغيرات البيئة

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public
DIRECT_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public
JWT_SECRET=change-this-long-random-secret
NEXT_PUBLIC_APP_URL=https://azmapp.promksa.com
NEXT_PUBLIC_DATA_MODE=database
```

`DIRECT_URL` موثق للاستخدام في بيئات الاستضافة التي تحتاج اتصالاً مباشراً، بينما يعتمد schema الحالي على `DATABASE_URL` للتوافق مع Prisma 6.

## أوامر الإعداد

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run build
```

للإنتاج المستقر بعد إنشاء migrations لاحقاً:

```bash
npm run db:migrate
npm run db:generate
npm run build
```

## التحقق

```bash
npx prisma validate
npx prisma generate
npm run build
```

إذا لم تكن قاعدة البيانات مضبوطة محلياً، استخدم متغيراً مؤقتاً للتحقق من schema فقط:

```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/azm?schema=public" npx prisma validate
```

## بيانات seed

الأمر التالي يضيف بيانات تأسيسية مستخرجة من demo الحالي:

```bash
npm run db:seed
```

تشمل البيانات:

- المستخدمين والأدوار والصلاحيات.
- الشركاء والمناديب والمركبات.
- مناطق التغطية.
- الطلبات والطرود ومهام التوزيع.
- محاولات التسليم والمرتجعات.
- وثائق النقل كمسودات داخلية.
- جاهزية بيان في حالة غير مربوط.
- سجل النشاط.

## قواعد السلامة

- لا تضع `.env` داخل Git.
- لا تشغل seed على قاعدة إنتاج تحتوي بيانات حقيقية إلا بعد أخذ نسخة احتياطية.
- لا تستخدم `prisma db push` على إنتاج به بيانات حساسة إلا بقرار واع؛ الأفضل لاحقاً إنشاء migrations رسمية.
- لا توجد مزامنة فعلية مع بيان في هذه المرحلة.
- لا يتم إنشاء أرقام بيان رسمية أو اعتماد تكامل حكومي.

## Phase 2.1 — تفعيل وضع قاعدة البيانات

خطوات الإنتاج المقترحة:

1. أنشئ قاعدة PostgreSQL من Hostinger أو مزود خارجي.
2. أضف `DATABASE_URL` في لوحة البيئة.
3. أضف `DIRECT_URL`، ويمكن أن يطابق `DATABASE_URL` ما لم تكن تستخدم connection pooling.
4. أضف `JWT_SECRET` بقيمة طويلة وعشوائية.
5. اضبط `NEXT_PUBLIC_DATA_MODE=database` لإظهار مؤشر وضع قاعدة البيانات في الواجهة.
6. نفذ الأوامر:

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run build
touch /home/u633767125/domains/azmapp.promksa.com/nodejs/tmp/restart.txt
```

إذا لم يتم ضبط `DATABASE_URL`، تخط أوامر قاعدة البيانات:

```bash
npm install
npx prisma generate
npm run build
touch /home/u633767125/domains/azmapp.promksa.com/nodejs/tmp/restart.txt
```

في هذه الحالة يبقى النظام في وضع البيانات التجريبي.

## Idempotent Seed

`prisma/seed.ts` يستخدم مفاتيح مستقرة وعمليات `upsert` للسجلات الحرجة حتى لا يكرر:

- الأدوار والصلاحيات.
- المستخدمين التجريبيين.
- الشركاء والمناديب والمركبات.
- مناطق التغطية.
- الطلبات والطرود.
- مهام التوزيع ومحاولات التسليم والمرتجعات.
- وثائق النقل.
- إعداد جاهزية بيان.
- سجل النشاط التجريبي.

لا يحذف seed قاعدة البيانات افتراضياً. إذا احتجت إعادة بناء بيانات تجريبية كاملة في بيئة غير إنتاجية فقط:

```bash
AZM_SEED_RESET=true npm run db:seed
```

لا تستخدم `AZM_SEED_RESET=true` على قاعدة إنتاج تحتوي بيانات حقيقية.

## أوامر Hostinger SSH

```bash
cd /home/u633767125/domains/azmapp.promksa.com/public_html/.builds/last-source
git pull origin main

rsync -av \
  --exclude=".git" \
  --exclude="node_modules" \
  --exclude=".next" \
  --exclude="tmp" \
  --exclude="stdout.log" \
  --exclude="stderr.log" \
  ./ /home/u633767125/domains/azmapp.promksa.com/nodejs/

cd /home/u633767125/domains/azmapp.promksa.com/nodejs
npm install
npx prisma generate

# فقط بعد ضبط DATABASE_URL:
npx prisma db push
npm run db:seed

npm run build
touch /home/u633767125/domains/azmapp.promksa.com/nodejs/tmp/restart.txt
```

تحقق بعد التشغيل:

```bash
curl -I https://azmapp.promksa.com/drivers
curl -I https://azmapp.promksa.com/driver
curl -I https://azmapp.promksa.com/orders
curl -I https://azmapp.promksa.com/parcels
curl -I https://azmapp.promksa.com/bayan-readiness
curl -s https://azmapp.promksa.com/api/foundation/status
```

## الرجوع للخلف

قبل أي migration أو seed في الإنتاج:

```bash
pg_dump "$DATABASE_URL" > azm-backup.sql
```

في حال فشل الإعداد، أوقف النشر، أعد متغيرات البيئة السابقة، ثم أعد تشغيل التطبيق.
