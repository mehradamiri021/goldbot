# 🚀 goldbot v3.0 - دستورات نصب و اجرا

## 📦 فایل‌های آماده:
- `goldbot-final-complete.tar.gz` - پکیج کامل پروژه
- `FINAL_INSTALL_SCRIPT.sh` - اسکریپت نصب کامل
- `TSX_FIX_SCRIPT.sh` - حل مشکل tsx
- `ULTIMATE_FIX_SCRIPT.sh` - حل مشکل صفحه سفید

---

## 🎯 **دستورات نصب (یکی را انتخاب کنید):**

### 1️⃣ نصب مستقیم از GitHub (پیشنهادی)
```bash
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/FINAL_INSTALL_SCRIPT.sh | bash
```

### 2️⃣ نصب از فایل zip
```bash
# دانلود و استخراج
wget https://github.com/mehradamiri021/goldbot/releases/download/v3.0/goldbot-final-complete.tar.gz
tar -xzf goldbot-final-complete.tar.gz

# اجرای نصب
cd goldbot/
chmod +x FINAL_INSTALL_SCRIPT.sh
./FINAL_INSTALL_SCRIPT.sh
```

---

## 🔧 **حل مشکلات رایج:**

### مشکل tsx not found:
```bash
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/TSX_FIX_SCRIPT.sh | bash
```

### مشکل صفحه سفید:
```bash
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/ULTIMATE_FIX_SCRIPT.sh | bash
```

---

## 📋 **دستورات مدیریت:**

```bash
# وضعیت سیستم
pm2 status

# مشاهده لاگ‌ها
pm2 logs goldbot

# راه‌اندازی مجدد
pm2 restart goldbot

# توقف سیستم
pm2 stop goldbot

# حذف کامل
pm2 delete goldbot
```

---

## 🌐 **دسترسی:**
- **وب پنل**: `http://localhost:5000`
- **API**: `http://localhost:5000/api/prices`

---

## ✅ **تایید نصب:**
```bash
# تست API
curl http://localhost:5000/api/prices

# بررسی وضعیت
pm2 status
```

**نتیجه موفق**: JSON با قیمت‌های ارز و طلا نمایش داده می‌شود

---

**📅 آخرین بروزرسانی: 27 آگوست 2025 - 16:55**