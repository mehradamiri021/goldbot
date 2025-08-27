# 📦 راهنمای سریع نصب goldbot v3.0

## ✅ **فایل آماده: `goldbot-complete-final.tar.gz`**

### 🚀 **دستورات نصب در سرور:**

#### روش 1: استفاده از فایل tar.gz
```bash
# بارگذاری فایل goldbot-complete-final.tar.gz در سرور
tar -xzf goldbot-complete-final.tar.gz
cd ~/
chmod +x NO_SUDO_INSTALL_SCRIPT.sh
./NO_SUDO_INSTALL_SCRIPT.sh
```

#### روش 2: نصب مستقیم از GitHub (بدون sudo)
```bash
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/NO_SUDO_INSTALL_SCRIPT.sh | bash
```

#### روش 3: حل مشکل پروژه موجود
```bash
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/PERMISSION_FIX_SCRIPT.sh | bash
```

---

## 🔧 **مراحل نصب:**

1. **بارگذاری فایل** در سرور
2. **استخراج:** `tar -xzf goldbot-complete-final.tar.gz`
3. **اجرای نصب:** `./NO_SUDO_INSTALL_SCRIPT.sh`
4. **راه‌اندازی:** `./start.sh`

---

## 📋 **فایل‌های موجود در پکیج:**

### اسکریپت‌های نصب:
- `NO_SUDO_INSTALL_SCRIPT.sh` - نصب بدون sudo (حل مشکل tsx)
- `FINAL_INSTALL_SCRIPT.sh` - نصب معمولی 
- `PERMISSION_FIX_SCRIPT.sh` - حل مشکل دسترسی
- `TSX_FIX_SCRIPT.sh` - حل فوری tsx
- `ULTIMATE_FIX_SCRIPT.sh` - حل صفحه سفید

### کدهای پروژه:
- `client/` - فرانت‌اند React
- `server/` - بک‌اند Node.js
- `shared/` - فایل‌های مشترک
- فایل‌های تنظیمات (package.json، tsconfig.json، وغیره)

### مستندات:
- `README.md` - راهنمای کامل
- `DEPLOY_COMMANDS.md` - دستورات deployment
- `DOWNLOAD_GUIDE.md` - راهنمای دانلود
- `PACKAGE_INFO.md` - اطلاعات پکیج

---

## ⚡ **راه‌اندازی سریع:**

بعد از نصب:
```bash
cd ~/goldbot
./start.sh                 # راه‌اندازی ساده
# یا
./start-pm2.sh             # راه‌اندازی با PM2
```

**دسترسی:** `http://localhost:5000`

---

## 🔧 **حل مشکلات:**

```bash
./pm2-status.sh           # وضعیت PM2
./pm2-logs.sh             # مشاهده لاگ‌ها
./pm2-stop.sh             # توقف PM2
npm run dev               # اجرای مستقیم
```

---

**📅 نسخه:** 3.0.0 Final  
**📊 حجم:** ~120KB فشرده  
**🎯 هدف:** حل مشکل tsx بدون sudo