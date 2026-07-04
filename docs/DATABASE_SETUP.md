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

## الرجوع للخلف

قبل أي migration أو seed في الإنتاج:

```bash
pg_dump "$DATABASE_URL" > azm-backup.sql
```

في حال فشل الإعداد، أوقف النشر، أعد متغيرات البيئة السابقة، ثم أعد تشغيل التطبيق.
