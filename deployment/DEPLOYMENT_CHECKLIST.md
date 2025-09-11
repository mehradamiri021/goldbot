# چک‌لیست نهایی Deployment - سیستم طلا و ارز

## ✅ قبل از نصب

### مشخصات سرور تایید شده:
- [ ] OS: Debian 12 x64
- [ ] RAM: 1 GB  
- [ ] Storage: 25 GB
- [ ] CPU: 1 vCPU
- [ ] IP: 45.195.250.226
- [ ] Internet: دسترسی به API های خارجی

### فایل‌های آماده:
- [ ] `gold-analysis-system.tar.gz` آپلود شده
- [ ] اطلاعات تلگرام تایید شده:
  - Bot Token: `7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y`
  - Admin ID: `1112066452`
  - Channel ID: `-1002717718463`
- [ ] API Key نوسان: `freeBY5YCsWyaVmR7DSu2QOLTH0KBsbu`

## 🚀 مراحل نصب

### 1. آپلود و استخراج:
```bash
# آپلود فایل
scp gold-analysis-system.tar.gz root@45.195.250.226:/root/

# اتصال SSH
ssh root@45.195.250.226

# استخراج و آماده‌سازی
cd /root
tar -xzf gold-analysis-system.tar.gz
cd workspace
```

### 2. اجرای اسکریپت نصب:
```bash
chmod +x deployment/install.sh
./deployment/install.sh
```

### 3. تنظیم .env:
```bash
nano .env

# تایید محتویات:
BOT_TOKEN=7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y
ADMIN_ID=1112066452
CHANNEL_ID=-1002717718463
NAVASAN_API_KEY=freeBY5YCsWyaVmR7DSu2QOLTH0KBsbu
PORT=5000
NODE_ENV=production
DATABASE_URL=./database.sqlite
TZ=Asia/Tehran
```

### 4. راه‌اندازی نهایی:
```bash
sudo -u goldbot npm install
sudo -u goldbot pm2 start ecosystem.config.js
sudo -u goldbot pm2 save
```

## 🧪 تست‌های نهایی

### دسترسی پنل:
- [ ] `http://45.195.250.226:5000` باز می‌شود
- [ ] داشبورد نمایش داده می‌شود
- [ ] وضعیت 4 ربات نمایش داده می‌شود

### تست عملکرد ربات‌ها:

#### ربات قیمت:
- [ ] دکمه "ارسال قیمت‌ها" در داشبورد
- [ ] قیمت‌ها در کانال ارسال می‌شوند
- [ ] فرمت فارسی صحیح

#### ربات تحلیل‌گر:
- [ ] صفحه `/analysis` باز می‌شود
- [ ] دکمه "تست تحلیل صبحانه"
- [ ] پیام تحلیل در کانال ارسال می‌شود

#### ربات سیگنال:
- [ ] صفحه `/signals` باز می‌شود  
- [ ] دکمه "تست تولید سیگنال"
- [ ] سیگنال تولید و نمایش داده می‌شود

#### بارگذاری اخبار:
- [ ] صفحه `/news` باز می‌شود
- [ ] آپلود فایل CSV کار می‌کند
- [ ] اخبار در لیست نمایش داده می‌شوند

### وضعیت سیستم:
```bash
# چک PM2
sudo -u goldbot pm2 status

# چک لاگ‌ها
sudo -u goldbot pm2 logs goldbot

# چک API
curl http://localhost:5000/api/bots/status

# چک مانیتورینگ
./deployment/monitor.sh
```

## 📋 زمان‌بندی تایید شده

### ربات تحلیل‌گر:
- دوشنبه-جمعه: 10:10 صبح، 16:16 عصر
- یکشنبه: 10:10 صبح (اخبار هفتگی)، 16:16 عصر (تحلیل تکنیکال)

### ربات سیگنال:
- دوشنبه-جمعه: 8:00-21:00، هر 15 دقیقه
- تایید ادمین: 5 دقیقه انتظار

### ربات قیمت:
- شنبه-پنج‌شنبه: 11:11، 14:14، 17:17

### بارگذاری اخبار:
- هر شنبه: آپلود دستی CSV توسط کاربر

## 🔄 فرآیند هفتگی

### شنبه (آغاز هفته):
1. کاربر فایل CSV اخبار هفته را آپلود می‌کند
2. سیستم اخبار را پردازش می‌کند
3. ربات قیمت شروع به کار می‌کند

### یکشنبه:
1. تحلیل اخبار هفتگی (10:10)
2. تحلیل تکنیکال هفتگی (16:16)

### دوشنبه-جمعه:
1. تحلیل صبحانه و عصرانه
2. سیگنال‌دهی مداوم
3. اعلام قیمت منظم

## 🛠 ابزارهای مدیریت

### دستورات مفید:
```bash
# ری‌استارت سیستم
sudo -u goldbot pm2 restart goldbot

# مشاهده لاگ‌ها
sudo -u goldbot pm2 logs goldbot --lines 50

# بک‌آپ دستی
./deployment/backup.sh

# مانیتورینگ سیستم
./deployment/monitor.sh

# تست API ها
curl http://localhost:5000/api/bots/status
curl http://localhost:5000/api/prices/latest
```

### فایل‌های مهم:
- `/home/goldbot/gold-analysis-system/.env` - تنظیمات
- `/home/goldbot/gold-analysis-system/database.sqlite` - دیتابیس
- `/home/goldbot/gold-analysis-system/logs/` - لاگ‌ها
- `/home/goldbot/gold-analysis-system/attached_assets/` - فایل‌های آپلود شده

## ⚠️ نکات مهم

1. **بک‌آپ روزانه**: سیستم خودکار در ساعت 2 صبح
2. **مانیتورینگ**: هر 30 ثانیه وضعیت ربات‌ها چک می‌شود
3. **لاگ‌ها**: تمام فعالیت‌ها ثبت می‌شوند
4. **امنیت**: فایروال فقط پورت‌های ضروری را باز کرده
5. **اخبار**: فقط اخبار مرتبط با طلا فیلتر می‌شوند

## 📞 در صورت مشکل

1. چک کردن لاگ‌ها: `pm2 logs goldbot`
2. ری‌استارت سیستم: `pm2 restart goldbot`
3. بررسی دیتابیس: اگر فایل `database.sqlite` وجود دارد
4. تست API: `curl http://localhost:5000/api/bots/status`

## ✅ سیستم آماده!

پس از تکمیل تمام مراحل، سیستم کاملاً عملیاتی و آماده ارائه خدمات است:

- پنل مدیریت: `http://45.195.250.226:5000`
- کانال تلگرام: فعال و دریافت کننده پیام‌ها
- 4 ربات: همگی در حالت running
- زمان‌بندی: طبق برنامه تنظیم شده فعال

**سیستم جامع تحلیل، سیگنال‌دهی و اعلام قیمت طلا و ارز راه‌اندازی شد! 🚀**