# 🤖 ربات هوشمند تحلیل و سیگنال‌دهی طلا

## 📋 توضیحات پروژه

این ربات یک سیستم کامل و خودکار برای تحلیل بازار طلا (XAUUSD) است که با استفاده از هوش مصنوعی و Smart Money Concepts، سیگنال‌های معاملاتی تولید می‌کند و از طریق تلگرام ارسال می‌شود.

## ✨ ویژگی‌های کلیدی

### 🔄 تحلیل خودکار 24/7
- تحلیل چند تایم‌فریمه (15 دقیقه، 1 ساعت، 4 ساعت، روزانه)
- محاسبه اندیکاتورهای تکنیکال (RSI, MACD, Bollinger Bands)
- تشخیص الگوهای Smart Money Concepts
- تحلیل سطوح حمایت و مقاومت

### 📱 ارسال خودکار تلگرام
- **گزارش صبحانه**: روزانه ساعت 09:09 تهران
- **گزارش عصر**: روزانه ساعت 15:15 تهران
- **گزارش هفتگی**: یکشنبه‌ها ساعت 12:12
- **مانیتورینگ مداوم**: بررسی هر 15 دقیقه برای تولید سیگنال

### 👤 سیستم تأیید ادمین
- سیگنال‌ها ابتدا برای ادمین ارسال می‌شوند
- امکان تأیید یا رد سیگنال‌ها
- پس از تأیید، سیگنال به کانال ارسال می‌شود

### 💻 وب پنل مدیریت
- داشبورد کامل با نمودارهای تعاملی
- مدیریت سیگنال‌ها
- آمار عملکرد
- بخش ادمین برای کنترل کامل

## 🔧 Smart Money Concepts

- **Order Blocks**: تشخیص بلوک‌های سفارش نهادی
- **Fair Value Gaps**: شناسایی فاصله‌های قیمت عادلانه
- **Liquidity Zones**: تحلیل نقاط نقدینگی
- **Break of Structure (BOS)**: شکست ساختار
- **Change of Character (CHOCH)**: تغییر شخصیت بازار

## 🚀 نصب سریع

### روش 1: نصب خودکار (پیشنهادی)
```bash
# دانلود پروژه
git clone [repository-url]
cd gold-trading-bot

# اجرای نصب خودکار
python install.py
```

### روش 2: نصب دستی
```bash
# ایجاد محیط مجازی
python -m venv venv

# فعال‌سازی محیط مجازی
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# نصب پکیج‌ها
pip install -r install_requirements.txt

# کپی تنظیمات
cp .env.example .env

# ویرایش فایل .env با تنظیمات شما
nano .env

# راه‌اندازی دیتابیس
python -c "from app import app, db; app.app_context().push(); db.create_all()"
```

## ⚙️ تنظیمات

### فایل .env
```env
# تنظیمات تلگرام (اجباری)
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN
TELEGRAM_CHANNEL_ID=YOUR_CHANNEL_ID
TELEGRAM_ADMIN_ID=YOUR_ADMIN_ID

# API داده‌ها
DATA_API_URL=http://46.100.50.194:5050/get_data

# تنظیمات زمان‌بندی
MORNING_REPORT_TIME=09:09
EVENING_REPORT_TIME=15:15
```

### دریافت توکن تلگرام
1. به ربات [@BotFather](https://t.me/BotFather) در تلگرام پیام دهید
2. دستور `/newbot` را ارسال کنید
3. نام و username برای ربات انتخاب کنید
4. توکن دریافتی را در فایل `.env` قرار دهید

### شناسه کانال
1. ربات را به کانال اضافه کنید
2. ربات را Admin کنید
3. شناسه کانال (معمولاً منفی) را در `.env` قرار دهید

## 🏃‍♂️ اجرای برنامه

### Windows
```cmd
# دوبار کلیک روی فایل
start_windows.bat

# یا از CMD
start_windows.bat
```

### Linux/Mac
```bash
./start_linux.sh

# یا دستی
source venv/bin/activate
python main.py
```

### اجرا به عنوان سرویس (Linux)
```bash
# کپی فایل سرویس
sudo cp goldbot.service /etc/systemd/system/

# ویرایش مسیر در فایل سرویس
sudo nano /etc/systemd/system/goldbot.service

# فعال‌سازی سرویس
sudo systemctl daemon-reload
sudo systemctl enable goldbot
sudo systemctl start goldbot
```

## 📊 استفاده

### دسترسی به وب پنل
```
http://localhost:5000
```

### دستورات ادمین در تلگرام
- `/status` - وضعیت سیستم
- `/health` - سلامت کامپوننت‌ها
- `/logs` - آخرین لاگ‌ها
- `/restart` - راه‌اندازی مجدد

## 📈 انتگریشن MetaTrader 5

### نصب Expert Advisor
1. فایل `GoldDataSender.mq5` را در پوشه `MQL5\Experts` کپی کنید
2. MetaTrader را راه‌اندازی کنید
3. EA را روی چارت XAUUSD اعمال کنید
4. تنظیمات IP و Port را بررسی کنید

### تنظیمات MT5
```env
MT5_HOST=127.0.0.1
MT5_PORT=9090
MT5_ENABLED=true
```

## 🔍 عیب‌یابی

### مشکلات رایج

**خطای اتصال API:**
```bash
# بررسی دسترسی
curl http://46.100.50.194:5050/get_data?symbol=XAUUSD&timeframe=H1&limit=10
```

**خطای تلگرام:**
- بررسی صحت Token
- اطمینان از Admin بودن ربات در کانال
- بررسی شناسه کانال

**خطای دیتابیس:**
```bash
# بازسازی دیتابیس
rm instance/gold_bot.db
python -c "from app import app, db; app.app_context().push(); db.create_all()"
```

### لاگ‌ها
```bash
# مشاهده لاگ‌ها در Linux
sudo journalctl -u goldbot -f

# مشاهده فایل لاگ
tail -f logs/goldbot.log
```

## 📁 ساختار پروژه

```
gold-trading-bot/
├── app.py                 # اپلیکیشن اصلی Flask
├── main.py               # نقطه ورود
├── models.py             # مدل‌های دیتابیس
├── routes.py             # مسیرهای وب
├── services/             # سرویس‌های اصلی
│   ├── analysis_service.py
│   ├── telegram_service.py
│   ├── data_service.py
│   └── ...
├── templates/            # قالب‌های HTML
├── static/              # فایل‌های استاتیک
├── config/              # فایل‌های تنظیمات
├── install.py           # اسکریپت نصب
├── .env.example         # نمونه تنظیمات
└── DEPLOYMENT_GUIDE.md  # راهنمای استقرار
```

## 🔐 امنیت

- استفاده از متغیرهای محیطی برای اطلاعات حساس
- رمزنگاری اتصالات
- محدودیت نرخ درخواست
- لاگ کامل عملیات
- احراز هویت ادمین

## 🆘 پشتیبانی

در صورت بروز مشکل:
1. فایل‌های لاگ را بررسی کنید
2. تنظیمات `.env` را کنترل کنید
3. اتصال اینترنت و دسترسی API را تست کنید
4. نسخه Python و پکیج‌ها را بررسی کنید

## 📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است.

---

**⚠️ هشدار**: این ابزار صرفاً جهت آموزش و تحلیل است. معاملات مالی دارای ریسک هستند و باید مسئولانه انجام شوند.