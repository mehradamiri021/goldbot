# 🚀 راهنمای Deploy سرور Goldbot

## مشکل وب کنسول در سرور

اگر بعد از deploy در سرور، بجای dashboard کامل، صفحه ساده‌ای می‌بینید:

## ✅ راه‌حل:

### 1️⃣ اجرای اسکریپت build:
```bash
./build-dashboard.sh
```

### 2️⃣ یا دستی:
```bash
npm run build
cp -r dist/public/* server/public/
```

### 3️⃣ restart سرور:
```bash
# اگر با PM2 اجرا می‌کنید:
pm2 restart goldbot

# یا اگر با node مستقیم:
pkill -f goldbot
node server/index.js
```

## 🔍 تشخیص مشکل:

### اگر صفحه ساده می‌بینید:
- فایل‌های dashboard ساخته نشده‌اند
- `server/public/assets/` خالی است

### اگر dashboard کامل می‌بینید:
- ✅ همه چیز درست کار می‌کند
- قیمت‌ها با دکمه بروزرسانی می‌شوند

## 📍 URL های مهم:
- **Dashboard:** `http://your-server-ip:5000`
- **API:** `http://your-server-ip:5000/api/prices`
- **Settings:** `http://your-server-ip:5000/settings`

## ⚠️ نکات مهم:
1. همیشه بعد از تغییرات frontend، `build-dashboard.sh` را اجرا کنید
2. فایل‌های `server/public/assets/` نباید خالی باشند
3. در صورت مشکل، `server/public/` را پاک کنید و دوباره build کنید