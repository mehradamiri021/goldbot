# 🚀 دستورات GitHub برای goldbot v3.0

## ✅ **دستورات فراخوانی مستقیم:**

### 1️⃣ **نصب بدون sudo (پیشنهادی)**
```bash
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/NO_SUDO_INSTALL_SCRIPT.sh | bash
```

### 2️⃣ **حل مشکل پروژه موجود**
```bash
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/PERMISSION_FIX_SCRIPT.sh | bash
```

### 3️⃣ **نصب معمولی (نیاز به sudo)**
```bash
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/FINAL_INSTALL_SCRIPT.sh | bash
```

### 4️⃣ **حل فوری tsx**
```bash
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/TSX_FIX_SCRIPT.sh | bash
```

### 5️⃣ **حل صفحه سفید**
```bash
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/ULTIMATE_FIX_SCRIPT.sh | bash
```

### 6️⃣ **حل مشکل دسترسی سرور (ERR_CONNECTION_REFUSED)**
```bash
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/SERVER_ACCESS_FIX.sh | bash
```

---

## 🎯 **توصیه برای شرایط جدید:**

با توجه به مشکل tsx که داشتید:

```bash
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/NO_SUDO_INSTALL_SCRIPT.sh | bash
```

این دستور:
- ✅ مشکل tsx را حل می‌کند
- ✅ بدون نیاز به sudo
- ✅ استفاده از npx tsx
- ✅ نصب PM2 محلی
- ✅ فایل‌های start.sh آماده

---

## 📋 **مراحل کامل:**

1. **اجرای دستور:**
   ```bash
   curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/NO_SUDO_INSTALL_SCRIPT.sh | bash
   ```

2. **راه‌اندازی:**
   ```bash
   cd ~/goldbot
   ./start.sh
   ```

3. **دسترسی:**
   ```
   http://localhost:5000
   ```

---

## 🔧 **دستورات اضافی:**

```bash
# مشاهده وضعیت PM2
cd ~/goldbot && ./pm2-status.sh

# مشاهده لاگ‌ها
cd ~/goldbot && ./pm2-logs.sh

# توقف سرور
cd ~/goldbot && ./pm2-stop.sh

# راه‌اندازی مجدد
cd ~/goldbot && ./start.sh
```

---

**📅 بروزرسانی:** 27 آگوست 2025 - 17:40  
**🎯 بهترین روش:** NO_SUDO_INSTALL_SCRIPT.sh