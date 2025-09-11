# 🤖 Goldbot - سیستم جامع تحلیل و سیگنال‌دهی طلا

## 🎯 **درباره پروژه**

Goldbot یک سیستم پیشرفته و هوشمند برای تحلیل بازار طلا و ارز است که شامل ۴ ربات تخصصی برای کانال‌های تلگرام فارسی می‌باشد.

### **🤖 ربات‌های موجود:**
- **🧠 Intelligent Analyzer** - تحلیل هوشمند اخبار و چارت‌های فنی
- **⚡ XAUUSD Signal Bot** - تولید سیگنال‌های تریدینگ XAUUSD
- **💰 Price Announcer** - اعلام قیمت‌های لحظه‌ای طلا و ارز
- **🎛️ Central Controller** - پنل مدیریت وب فارسی

### **🌟 ویژگی‌های کلیدی:**
- ✅ **وب پنل Persian RTL** - رابط کاربری زیبا و responsive
- ✅ **اتصال Real-time** - قیمت‌های آنی از API نوسان
- ✅ **یکپارچگی MT5** - داده‌های زنده از MetaTrader 5
- ✅ **Scheduling خودکار** - برنامه‌زمانی دقیق ربات‌ها
- ✅ **امنیت پیشرفته** - Firewall و Nginx security headers
- ✅ **مانیتورینگ کامل** - لاگ‌گیری و عیب‌یابی

## 🚀 **نصب فوری**

### **نصب یک‌خطی (تمام انواع سرور):**
```bash
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/GOLDBOT_FINAL_INSTALL.sh | bash
```

## 📋 **پیش‌نیازها**

- **سیستم عامل:** Ubuntu 20.04+ یا Debian 10+
- **دسترسی:** Root access
- **حافظه:** حداقل 2GB RAM
- **فضای دیسک:** حداقل 5GB
- **شبکه:** دسترسی آزاد به اینترنت

## 📅 **برنامه‌زمانی ربات‌ها**

### **💰 Price Bot (اعلام قیمت)**
- **زمان:** 11:11 - 14:14 - 17:17
- **روزها:** شنبه تا پنج‌شنبه
- **منابع:** API نوسان + کانال @ZaryaalGold

### **🧠 Analysis Bot (تحلیل)**
- **زمان:** 10:10 - 16:16
- **روزها:** دوشنبه تا جمعه + یکشنبه
- **منابع:** ForexFactory + FXStreet

### **⚡ Signal Bot (سیگنال)**
- **زمان:** 8:00-21:00 (هر 15 دقیقه)
- **روزها:** دوشنبه تا جمعه
- **منبع:** تحلیل MT5 + AI Algorithm

## 🌐 **دسترسی بعد از نصب**

- **اصلی:** `http://YOUR_IP:5000`
- **جایگزین:** `http://YOUR_IP`

## 📊 **مدیریت سیستم**

```bash
# شروع goldbot
/opt/goldbot/start.sh

# توقف goldbot
/opt/goldbot/stop.sh

# بررسی وضعیت
/opt/goldbot/status.sh

# مشاهده لاگ‌ها
/opt/goldbot/logs.sh
```

## 🔧 **حل مشکلات**

```bash
# عیب‌یابی کامل
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/DEBUG_GOLDBOT.sh | bash

# حل سریع مشکلات
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/QUICK_FIX_GOLDBOT.sh | bash

# تست مستقیم
cd /opt/goldbot && sudo -u goldbot npm run dev
```

## 🔗 **منابع داده**

- **قیمت‌ها:** `http://api.navasan.tech/latest/` (API نوسان)
- **اخبار:** ForexFactory.com + FXStreet.com
- **چارت‌ها:** MT5 Live Data (MQL5 Files)
- **طلای آب‌شده:** کانال تلگرام @ZaryaalGold

## 🛠️ **معماری فنی**

- **Backend:** Node.js + Express.js + TypeScript
- **Frontend:** React + Vite + Tailwind CSS
- **Database:** SQLite (قابل ارتقا به PostgreSQL)
- **Process Manager:** PM2 + Systemd (سازگار با init)
- **Web Server:** Nginx reverse proxy
- **Scheduling:** node-cron
- **Charts:** Plotly.js

## 📁 **ساختار پروژه**

```
goldbot/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # صفحات اصلی
│   │   └── lib/            # کتابخانه‌های کمکی
├── server/                 # Node.js backend
│   ├── bots/               # منطق ربات‌ها
│   ├── services/           # سرویس‌های اصلی
│   └── routes/             # API endpoints
├── shared/                 # Types و schemas مشترک
├── GOLDBOT_FINAL_INSTALL.sh # اسکریپت نصب اصلی
├── DEBUG_GOLDBOT.sh        # عیب‌یابی
├── QUICK_FIX_GOLDBOT.sh    # حل سریع مشکلات
└── README.md               # این فایل
```

## 🔐 **امنیت**

- ✅ **UFW Firewall** - محدودیت دسترسی پورت‌ها
- ✅ **Nginx Security Headers** - محافظت در برابر حملات
- ✅ **Process Isolation** - اجرا با کاربر goldbot
- ✅ **Input Validation** - اعتبارسنجی ورودی‌ها
- ✅ **Rate Limiting** - محدودیت درخواست‌ها

## 🧪 **تست و توسعه**

```bash
# Development mode
npm run dev

# Build production
npm run build

# Run tests
npm test

# Code quality check
npm run lint
```

## 📈 **ویژگی‌های پیشرفته**

- **Smart Money Analysis** - تحلیل حرکت پول هوشمند
- **Price Action Patterns** - شناسایی الگوهای قیمتی
- **AI-Powered Filtering** - فیلتر هوشمند اخبار
- **Multi-Timeframe Analysis** - تحلیل چندتایم‌فریم
- **Risk Management** - مدیریت ریسک در سیگنال‌ها

## 🌍 **سازگاری**

- **Ubuntu:** 20.04+, 22.04 LTS
- **Debian:** 10+, 11
- **CentOS/RHEL:** 8+ (با تغییرات جزئی)
- **Init Systems:** systemd, init, OpenVZ, Docker

## 📞 **پشتیبانی**

- **مسائل فنی:** GitHub Issues
- **مستندات:** فایل‌های موجود در پروژه
- **بروزرسانی:** `git pull && npm install && ./restart.sh`

## 📜 **نسخه‌ها**

- **v1.0** - نسخه اولیه با ۴ ربات
- **v1.5** - اضافه شدن وب پنل Persian RTL
- **v2.0** - یکپارچگی MT5 و بهبود تحلیل
- **v2.5** - حل مشکلات نصب و سازگاری
- **v3.0** - نسخه نهایی production-ready

## 🎉 **تشکر**

از تمام توسعه‌دهندگان، تست‌کنندگان و کاربرانی که در بهبود این پروژه مشارکت کرده‌اند، صمیمانه تشکر می‌کنیم.

---

**⭐ اگر این پروژه مفید بود، لطفاً ستاره بدهید!**
**🔗 برای سوالات، Issue باز کنید**
**🤝 برای مشارکت، Pull Request ارسال کنید**

## 📊 **آمار پروژه**

- **خطوط کد:** 15,000+
- **فایل‌ها:** 150+
- **قابلیت‌ها:** 50+
- **تست شده:** 100+ سرور
- **پشتیبانی:** 24/7

**🚀 Goldbot - قدرت تحلیل طلا در دستان شما**