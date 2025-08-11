# راهنمای سریع نصب ربات تحلیل طلا
# Gold Trading Bot Quick Installation Guide

## 🚀 نصب در 3 مرحله ساده
## 🚀 Installation in 3 Simple Steps

### مرحله 1: دانلود و استخراج
### Step 1: Download and Extract

```bash
# استخراج فایل ZIP
# Extract ZIP file
unzip gold-trading-bot-complete.zip
cd gold-trading-bot-complete
```

### مرحله 2: نصب خودکار
### Step 2: Automatic Installation

```bash
# اجرای نصب خودکار
# Run automatic installation
python install.py
```

### مرحله 3: تنظیمات و اجرا
### Step 3: Configuration and Run

```bash
# ویرایش فایل تنظیمات
# Edit configuration file
nano .env

# اجرا در Windows
# Run on Windows
start_windows.bat

# اجرا در Linux/Mac  
# Run on Linux/Mac
./start_linux.sh
```

## ⚙️ تنظیمات ضروری در فایل .env
## ⚙️ Required Settings in .env File

```env
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN
TELEGRAM_CHANNEL_ID=YOUR_CHANNEL_ID  
TELEGRAM_ADMIN_ID=YOUR_ADMIN_ID
DATA_API_URL=http://46.100.50.194:5050/get_data
```

## 📱 دریافت توکن تلگرام
## 📱 Get Telegram Token

1. پیام به [@BotFather](https://t.me/BotFather)
2. دستور `/newbot`
3. انتخاب نام و username
4. کپی توکن دریافتی

## 🌐 دسترسی به وب پنل
## 🌐 Access Web Panel

```
http://localhost:5000
```

## ❓ نیاز به کمک؟
## ❓ Need Help?

- راهنمای کامل: `README_FA.md`
- راهنمای deployment: `DEPLOYMENT_GUIDE.md`
- MetaTrader integration: `metatrader/GoldDataSender.mq5`

## 🔧 عیب‌یابی سریع
## 🔧 Quick Troubleshooting

**خطای نصب پکیج‌ها:**
```bash
pip install --upgrade pip
pip install -r install_requirements.txt
```

**خطای دسترسی:**
```bash
chmod +x start_linux.sh
chmod +x scripts/install_service.sh
```

**مشاهده لاگ‌ها:**
```bash
tail -f logs/goldbot.log
journalctl -u goldbot -f
```

---
✅ **آماده استفاده - Ready to Use!**