# 🤖 راهنمای اجرای سیستم گلدربات - Goldbot Deployment Guide

## 📦 فایل‌های آماده برای آپلود

### ✅ فایل‌های ایجاد شده:
- `goldbot-complete.tar.gz` (13.4 MB) - بسته کامل پروژه
- `GITHUB_UPDATE_COMMANDS.sh` - اسکریپت به‌روزرسانی از GitHub  
- `QUICK_START.sh` - اسکریپت راه‌اندازی سریع

## 🚀 دستورات نصب و اجرا

### 1️⃣ آپلود به GitHub:
```bash
# فایل goldbot-complete.tar.gz را در GitHub Release آپلود کنید
# یا محتویات پروژه را در repository اصلی کپی کنید
```

### 2️⃣ دانلود و نصب در سرور:
```bash
# دانلود مستقیم از GitHub
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/GITHUB_UPDATE_COMMANDS.sh | bash

# یا نصب دستی:
wget https://github.com/mehradamiri021/goldbot/releases/latest/download/goldbot-complete.tar.gz
tar -xzf goldbot-complete.tar.gz
cd goldbot
./QUICK_START.sh
```

### 3️⃣ راه‌اندازی خودکار:
```bash
# اجرای اسکریپت به‌روزرسانی
chmod +x GITHUB_UPDATE_COMMANDS.sh
./GITHUB_UPDATE_COMMANDS.sh
```

## 🔧 تنظیمات مورد نیاز

### Environment Variables:
```bash
BOT_TOKEN=7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y
CHANNEL_ID=-1002717718463
NAVASAN_API_KEY=freeBY5YCsWyaVmR7DSu2QOLTH0KBsbu
MT5_DATA_PATH=/root/.wine/drive_c/Program Files/Capitalxtend LLC MT5 Terminal/MQL5/Files
```

## 📅 زمان‌بندی ربات‌ها

### 💰 Price Bot:
- **زمان اجرا:** 11:11، 14:14، 17:17 
- **روزهای فعال:** شنبه تا پنج‌شنبه
- **منبع داده:** API نوسان + کانال @ZaryaalGold

### 📊 Analysis Bot:  
- **روزهای هفته:** 10:10 و 16:16
- **یکشنبه:** 10:10 (اخبار هفتگی) و 16:16 (تحلیل تکنیکال)
- **منبع اخبار:** ForexFactory + FXStreet

### ⚡ Signal Bot:
- **زمان:** دوشنبه-جمعه، 8:00-21:00
- **فاصله:** هر 15 دقیقه
- **منبع:** فایل‌های MT5 + الگوریتم هوشمند

## 🌐 دسترسی‌ها

- **وب پنل:** `http://localhost:5000`
- **API Status:** `http://localhost:5000/api/status`
- **قیمت‌ها:** `http://localhost:5000/api/prices`

## 📋 دستورات مدیریت

```bash
# بررسی وضعیت
curl http://localhost:5000/api/status

# مشاهده لاگ‌ها  
tail -f logs/goldbot.log

# ری‌استارت
./GITHUB_UPDATE_COMMANDS.sh

# توقف
pkill -f "tsx server/index.ts"
```

## ✨ ویژگی‌های فعال

- ✅ **4 ربات تلگرام** کاملاً فعال
- ✅ **وب کنسول RTL** با طراحی زیبا
- ✅ **API نوسان** برای قیمت‌های لحظه‌ای  
- ✅ **پردازش اخبار** هوشمند از 2 منبع
- ✅ **نمودارهای تحلیلی** با Plotly.js
- ✅ **زمان‌بندی خودکار** با node-cron
- ✅ **مدیریت خطا** و لاگ‌گیری کامل

## 🔄 به‌روزرسانی خودکار

برای به‌روزرسانی خودکار از GitHub:
```bash
# اجرای دوباره اسکریپت
./GITHUB_UPDATE_COMMANDS.sh
```

این اسکریپت:
- آخرین نسخه را از GitHub دانلود می‌کند
- Dependencies را نصب می‌کند  
- تنظیمات را اعمال می‌کند
- ربات‌ها را با PM2 یا nohup اجرا می‌کند