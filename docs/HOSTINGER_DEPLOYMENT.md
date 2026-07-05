# نشر منصة عزم على هوستنجر

هذا المستند يوضح متطلبات نشر تطبيق Next.js الخاص بمنصة عزم للتشغيل اللوجستي على بيئة Node.js في هوستنجر أو خادم VPS.

## المتطلبات

- Node.js إصدار 20 أو أحدث
- npm إصدار 10 أو أحدث
- مستودع GitHub: `https://github.com/Techzoneksa/azmlogic.git`
- صلاحية تشغيل أوامر البناء والتشغيل

## متغيرات البيئة

أنشئ متغيرات البيئة في لوحة الاستضافة أو ملف بيئة غير ملتزم في Git:

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.example
DATABASE_URL=
DIRECT_URL=
JWT_SECRET=
BAYAN_SERVICE_URL=
BAYAN_CLIENT_ID=
BAYAN_CLIENT_SECRET=
```

ملاحظات مهمة:

- لا تضع الأسرار داخل ملفات الواجهة.
- لا تلتزم بملفات `.env` في Git.
- استخدم `.env.example` كمرجع فقط.
- قيم الربط مع بيان غير مفعلة في المرحلة الأولى وتبقى مخفية في الواجهة.

## أوامر البناء والتشغيل

```bash
npm install
npm run build
npm run start
```

## خطوات النشر

1. اربط مشروع الاستضافة بالمستودع `https://github.com/Techzoneksa/azmlogic.git`.
2. اختر Node.js 20 أو أحدث.
3. اضبط أمر التثبيت: `npm install`.
4. اضبط أمر البناء: `npm run build`.
5. اضبط أمر التشغيل: `npm run start`.
6. أضف متغيرات البيئة المطلوبة من لوحة الاستضافة.
7. نفذ البناء وتأكد من نجاحه دون أخطاء.
8. افتح نطاق الإنتاج وتحقق من تسجيل الدخول ولوحة التحكم وواجهة المندوب.

## التحقق بعد النشر

- تظهر الواجهة باللغة العربية واتجاه RTL.
- لا تظهر رسائل تقنية للمستخدم.
- مسارات لوحة التحكم والشركاء والطلبات والطرود والتوزيع تعمل.
- واجهة المندوب تعمل من المتصفح بحجم شاشة جوال.
- ملف التطبيق التقدمي `manifest.webmanifest` متاح.
- لا توجد مفاتيح سرية ظاهرة في مصدر الصفحة.

## إعادة تشغيل التطبيق

من لوحة هوستنجر أو مدير العمليات في الخادم:

1. أوقف عملية التطبيق الحالية.
2. اسحب آخر تحديث من GitHub.
3. نفذ `npm install` عند تغير الحزم.
4. نفذ `npm run build`.
5. شغل التطبيق عبر `npm run start`.

## استكشاف الأخطاء

- إذا فشل البناء، تحقق من إصدار Node.js ووجود جميع الملفات في Git.
- إذا فشل التشغيل، تحقق من متغيرات البيئة وأذونات المنفذ في الاستضافة.
- إذا ظهرت صفحات فارغة، نفذ `npm run build` محليا أو في الخادم واقرأ سجل الخطأ.
- إذا ظهرت مشكلة في الاتجاه أو الخط، تأكد من تحميل `app/globals.css`.
- إذا احتاج المشروع لاحقا إلى قاعدة بيانات، أضف `DATABASE_URL` و `DIRECT_URL` دون كشفها في الواجهة.

## ملاحظات المرحلة الأولى

- لا يوجد ربط فعلي مع بيان أو أي جهة حكومية.
- لا يوجد نظام دفع أو محاسبة أو رواتب.
- بيانات العملاء في العرض تجريبية وغير شخصية.
- المنصة جاهزة كأساس واجهة وتجربة تشغيل، وتنتظر ربط الخادم وقاعدة البيانات في المراحل التالية.
## ملاحظة Phase 1.2

وحدة المناديب الرئيسية ووحدة المناطق والتغطية تعملان كواجهة Demo محلية ضمن Next.js. لا تعتمد هذه المرحلة على قاعدة بيانات، ولا ترسل ملفات مرفوعة، ولا تستخدم خرائط أو تتبع GPS أو ربط بيان فعلي. عند النشر على Hostinger يكفي الالتزام بأوامر `npm install` و`npm run build` و`npm run start` مع إبقاء الأسرار خارج Git.
## ملحق Phase 2 — قاعدة البيانات وPrisma

في Phase 2 تمت إضافة أساس PostgreSQL/Prisma مع بقاء الواجهة قادرة على العمل في وضع البيانات التجريبي عند عدم ضبط قاعدة البيانات.

### متغيرات البيئة المطلوبة

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://azmapp.promksa.com
NEXT_PUBLIC_DATA_MODE=database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public
DIRECT_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public
JWT_SECRET=change-this-long-random-secret
BAYAN_SERVICE_URL=
BAYAN_CLIENT_ID=
BAYAN_CLIENT_SECRET=
```

لا يتم استخدام متغيرات بيان لإجراء أي اتصال فعلي في هذه المرحلة، ويجب إبقاؤها فارغة أو غير مفعلة حتى مرحلة التكامل الرسمية.

### أوامر النشر بعد Pull

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run build
```

إذا كانت قاعدة الإنتاج تحتوي بيانات حقيقية لاحقاً، لا تشغل `db:seed` قبل أخذ نسخة احتياطية ومراجعة الخطة.

### إعادة التشغيل على Hostinger

إذا كان تطبيق Node.js يستخدم مجلد `nodejs/tmp`:

```bash
touch ~/domains/azmapp.promksa.com/nodejs/tmp/restart.txt
```

إذا كان يستخدم PM2، أعد تشغيل عملية AZM فقط بعد التأكد من الاسم:

```bash
pm2 list
pm2 restart <azm-process-name>
```

لا تعيد تشغيل مشاريع أخرى ولا تلمس `albaariz.com`.

### التحقق بعد النشر

- افتح `/settings` وتأكد من ظهور وضع البيانات.
- افتح `/api/foundation/status` وتأكد أن الاستجابة عربية وآمنة.
- افتح `/drivers` وتأكد أنها صفحة إدارة المناديب.
- افتح `/driver` وتأكد أنها تجربة المندوب.
- افتح `/bayan-readiness` وتأكد أنها تعرض غير مربوط / قيد التجهيز ولا توجد مزامنة فعلية.

### أوامر فحص Prisma

```bash
npx prisma validate
npx prisma generate
```

إذا لم يتم ضبط `DATABASE_URL` في بيئة الفحص، استخدم قيمة PostgreSQL مؤقتة للتحقق من schema فقط.

## Phase 2.1 — تفعيل قاعدة PostgreSQL

هذه الخطوات مخصصة لمسار AZM فقط:

```text
/home/u633767125/domains/azmapp.promksa.com
```

لا تستخدم هذه الأوامر داخل `albaariz.com`.

### قبل التفعيل

- تأكد أن آخر commit موجود على GitHub.
- تأكد أن التطبيق يعمل في demo mode إذا لم تضبط `DATABASE_URL`.
- لا تضف أسرار قاعدة البيانات إلى Git.
- لا يوجد ربط فعلي مع بيان في هذه المرحلة.

### أوامر التحديث على SSH

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
```

إذا تم ضبط `DATABASE_URL` و`JWT_SECRET`:

```bash
npx prisma db push
npm run db:seed
```

إذا لم يتم ضبط `DATABASE_URL`:

```bash
echo "DATABASE_URL غير مضبوط، سيتم تشغيل demo mode"
```

ثم:

```bash
npm run build
touch /home/u633767125/domains/azmapp.promksa.com/nodejs/tmp/restart.txt
```

### التحقق

```bash
curl -I https://azmapp.promksa.com
curl -I https://azmapp.promksa.com/drivers
curl -I https://azmapp.promksa.com/driver
curl -I https://azmapp.promksa.com/orders
curl -I https://azmapp.promksa.com/parcels
curl -I https://azmapp.promksa.com/bayan-readiness
curl -s https://azmapp.promksa.com/api/foundation/status
```

افتح `/settings` وتأكد من ظهور:

- `وضع البيانات: تجريبي` عند غياب قاعدة البيانات.
- `وضع البيانات: قاعدة بيانات` بعد ضبط `NEXT_PUBLIC_DATA_MODE=database` و`DATABASE_URL`.
