# 🚀 راهنمای نهایی اجرای GoldBot v2.1

## مشکلات حل شده ✅

### 1. SQLAlchemy Errors حل شد
- ❌ خطا: `Column expression, FROM clause element expected`  
- ✅ حل: تبدیل تمام `Model.query` به `db.session.query(Model)`

### 2. Missing Dependencies حل شد
- ❌ خطا: `No module named 'flask_sqlalchemy'`
- ✅ حل: نصب کامل dependencies در virtual environment

### 3. Import Errors حل شد  
- ❌ خطا: `cannot import name 'send_message_to_channel'`
- ✅ حل: اضافه کردن تابع مفقود شده به telegram_service.py

## فایل نهایی آماده
**`goldbot_v2.1_complete_fix_*.tar.gz`** - شامل تمام فیکس‌ها

## دستورات اجرا در سرور

### روش 1: استفاده از virtual environment (پیشنهادی)
```bash
# در سرور:
cd ~/goldbot
source venv/bin/activate

# نصب dependencies (اگر نصب نشده)
pip install flask==3.0.0 flask-sqlalchemy==3.1.1 gunicorn==21.2.0
pip install python-telegram-bot==20.8 requests==2.31.0 
pip install pandas==2.1.4 numpy plotly apscheduler pytz
pip install psycopg2-binary sqlalchemy werkzeug jdatetime beautifulsoup4

# اجرا
python main.py
```

### روش 2: اجرای production با gunicorn
```bash
source venv/bin/activate
gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app
```

## تست عملکرد

### بررسی وضعیت APIs
```bash
curl http://localhost:5000/api/live_status
```

انتظار: 
```json
{
  "status": "success",
  "current_price": 3344.54,
  "mt5_status": "CONNECTED", 
  "navasan_status": "ONLINE"
}
```

### بررسی وب interface
- 🌐 دسترسی: `http://your-server-ip:5000`
- ✅ API status badges باید سبز باشند (CONNECTED/ONLINE)
- ✅ قیمت real-time نمایش داده شود ($3344.54)

## نتایج مورد انتظار

### ✅ پس از اجرا موفق:
1. **MT5 Connection**: 500 candles loaded، قیمت real-time
2. **Telegram**: پیام‌ها ارسال می‌شود
3. **Web Interface**: API status سبز، داده‌های واقعی
4. **Scheduler**: jobs هر 15 دقیقه اجرا می‌شود
5. **Database**: queries بدون خطا کار می‌کند

### 📊 لاگ‌های موفق:
```
✅ Successfully got 500 candles from MT5 CSV
📊 Latest price: $3344.54  
✅ API call successful: /latest
🎯 15-Minute Signal Monitor (PRIMARY) scheduled
✅ Admin notification sent successfully
```

## عیب‌یابی سریع

### اگر هنوز SQLAlchemy error دارید:
```bash
pip install --upgrade sqlalchemy flask-sqlalchemy
```

### اگر import error دارید:
```bash  
pip install --upgrade python-telegram-bot requests
```

### اگر API ها قرمز هستند:
- بررسی اتصال اینترنت
- Navasan API key معتبر است
- MT5 CSV files در مسیر درست هستند

---

**تاریخ**: 2025-08-18  
**نسخه**: GoldBot v2.1 Complete Fix  
**وضعیت**: آماده production 🚀