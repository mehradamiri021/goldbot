# 🔶 goldbot v3.0 - سیستم جامع تحلیل طلا و ارز

## 🎯 نسخه نهایی با UI کامل و حل مشکل صفحه سفید

### 📋 خلاصه پروژه:
سیستم جامع تحلیل، سیگنال‌دهی و اعلام قیمت طلا و ارز شامل:
- **4 ربات تخصصی**: Analysis, Signal, Price, Controller
- **وب پنل مدیریت**: UI زیبا با قیمت‌های لیو
- **قیمت‌گذاری هوشمند**: از API نوسان
- **طراحی RTL فارسی**: مناسب بازار ایران

---

## 🚀 **نصب سریع:**

### روش 1: نصب بدون sudo (پیشنهادی برای مشکل tsx)
```bash
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/NO_SUDO_INSTALL_SCRIPT.sh | bash
```

### روش 2: نصب معمولی (نیاز به sudo)
```bash
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/FINAL_INSTALL_SCRIPT.sh | bash
```

### روش 3: دانلود فایل tar.gz
```bash
# دانلود goldbot-complete-final.tar.gz از این پروژه
tar -xzf goldbot-complete-final.tar.gz
chmod +x NO_SUDO_INSTALL_SCRIPT.sh
./NO_SUDO_INSTALL_SCRIPT.sh
```

این دستورات:
- ✅ پروژه را از صفر نصب می‌کند  
- ✅ تمام پکیج‌ها را دانلود می‌کند
- ✅ tsx و PM2 را global نصب می‌کند
- ✅ سرور را در پورت 5000 اجرا می‌کند
- ✅ وب پنل را آماده نمایش می‌کند

---

## 🎨 **ویژگی‌های UI:**

### 📊 **داشبورد اصلی:**
- نمایش وضعیت 4 ربات با رنگ‌بندی
- قیمت‌های لیو: دلار، یورو، بیت‌کوین، طلا
- بروزرسانی خودکار هر 30 ثانیه
- Loading states زیبا

### 🎨 **طراحی:**
- گرادینت آبی به بنفش
- کارت‌های شفاف با blur effect
- آیکون‌های فارسی: 💰🔶⚡📊
- انیمیشن pulse برای عناصر فعال
- طراحی responsive (موبایل + دسکتاپ)

---

## 🏗️ **ساختار پروژه:**

```
goldbot/
├── package.json              ✅ Dependencies کامل
├── tsconfig.json              ✅ TypeScript config
├── vite.config.ts             ✅ Vite + React setup
├── tailwind.config.ts         ✅ Tailwind CSS
├── ecosystem.config.cjs       ✅ PM2 config (tsx fix)
├── .env                       ✅ Environment variables
├── server/
│   └── index.ts              ✅ Express + APIs
├── client/
│   ├── index.html            ✅ HTML RTL template
│   └── src/
│       ├── App.tsx           ✅ React component
│       ├── main.tsx          ✅ Entry point
│       └── index.css         ✅ Tailwind styles
└── logs/                     ✅ PM2 logs
```

---

## 🔧 **API Endpoints:**

| Endpoint | Method | توضیح |
|----------|--------|-------|
| `/api/prices` | GET | قیمت‌های لیو ارز و طلا |
| `/api/bots/status` | GET | وضعیت 4 ربات |
| `/api/signals/today` | GET | سیگنال‌های امروز |
| `/api/signals/pending` | GET | سیگنال‌های در انتظار |
| `/api/news` | GET | اخبار طلا |
| `/api/logs` | POST | ثبت لاگ |

---

## 💰 **قیمت‌های نمایش داده شده:**

### ارزهای اصلی:
- 💵 دلار آمریکا (USD)
- 💶 یورو (EUR) 
- 🍁 دلار کانادا (CAD)
- 🏜️ درهم امارات (AED)

### ارزهای دیجیتال:
- ₿ بیت‌کوین (BTC)
- Ξ اتریوم (ETH)
- ₮ تتر (USDT)

### طلا:
- 🔶 طلای ۱۸ عیار
- 🟡 سکه طلا

---

## 🔧 **دستورات مدیریت:**

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

## 🐛 **عیب‌یابی:**

### مشکل: tsx not found (رایج‌ترین)
```bash
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/TSX_FIX_SCRIPT.sh | bash
```

### مشکل: صفحه سفید
```bash
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/ULTIMATE_FIX_SCRIPT.sh | bash
```

### مشکل: API کار نمی‌کند
```bash
pm2 logs goldbot --lines 20
curl http://localhost:5000/api/prices
```

### مشکل: پورت اشغال
```bash
sudo fuser -k 5000/tcp
pm2 restart goldbot
```

---

## ✅ **وضعیت کنونی:**

### کارکردهای فعال:
- ✅ **وب پنل زیبا**: UI کامل با داده‌های واقعی
- ✅ **4 ربات فعال**: نمایش وضعیت همه ربات‌ها  
- ✅ **API endpoints**: تمام endpoint ها پاسخ می‌دهند
- ✅ **قیمت‌های لیو**: از Navasan API
- ✅ **PM2 management**: مدیریت خودکار
- ✅ **Error handling**: لاگ‌گیری کامل

### آماده توسعه:
- 🔄 اتصال واقعی MT5 (نیاز به فایل‌های CSV)
- 🔄 Telegram bot integration
- 🔄 News scraping از ForexFactory
- 🔄 Chart analysis و signal generation
- 🔄 Database برای تاریخچه

---

## 🎉 **نتیجه:**

**goldbot v3.0 آماده استفاده!**

پس از نصب، وب پنل در `http://localhost:5000` با UI کامل و زیبا در دسترس خواهد بود.

---

## 📞 **پشتیبانی:**

برای مشکلات یا سوالات:
- لاگ‌های PM2: `pm2 logs goldbot`
- تست API: `curl http://localhost:5000/api/prices`
- وب پنل: `http://localhost:5000`

**📅 آخرین بروزرسانی: 27 آگوست 2025 - 16:40**