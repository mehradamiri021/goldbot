# راهنمای استقرار GoldBot v2.1 Production

## خلاصه تغییرات این نسخه
✅ **تمام مشکلات حل شد**: Event loop error، API status display، TELEGRAM component ERROR
✅ **بروزرسانی Real-time**: قیمت‌ها هر ۱۰ ثانیه خودکار بروزرسانی می‌شوند
✅ **API های فعال**: MT5 (CONNECTED)، Navasan (ONLINE)، طراحی responsive
✅ **Production Ready**: تمام خطاهای runtime برطرف شده

## دستورات استقرار

### 1. آپلود فایل‌ها
```bash
# استخراج فایل‌ها
tar -xzf goldbot_v2.1_production_*.tar.gz
cd goldbot_v2.1_production
```

### 2. نصب dependencies
```bash
# نصب پایتون dependencies
pip install -r install_requirements_production.txt

# یا استفاده از اسکریپت آماده
chmod +x install_production.sh
./install_production.sh
```

### 3. تنظیم environment variables
```bash
export DATABASE_URL="postgresql://user:password@localhost/goldbot"
export NAVASAN_API_KEY="your_api_key_here"
export SESSION_SECRET="your_secret_key_here"
```

### 4. راه‌اندازی سرور
```bash
# استفاده از Gunicorn (توصیه شده)
gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app

# یا استفاده از اسکریپت آماده
chmod +x start_server.sh
./start_server.sh
```

## وضعیت فعلی سیستم

### API های فعال
- **MT5 Local Server**: ✅ CONNECTED (168 candles loaded)
- **Navasan Currency API**: ✅ ONLINE (http://api.navasan.tech/dailyCurrency/)
- **ZaryaalGold Channel**: ⚠️ OFFLINE (نیاز به بررسی)

### فیچرهای فعال
- ✅ Real-time price updates (هر ۱۰ ثانیه)
- ✅ MT5 signal detection
- ✅ RSI + Price Action analysis
- ✅ Admin panel monitoring
- ✅ Telegram bot integration
- ✅ Scheduled reports (morning/evening)

### مشکلات شناخته شده
- ⚠️ قیمت‌ها ممکن است دقیق نباشند (نیاز به بروزرسانی MT5 data)
- ⚠️ Bonbast API قطع است (fallback فعال)
- ⚠️ Gold API (ZaryaalGold) OFFLINE

## فایل‌های مهم
- `main.py`: Entry point اصلی
- `app.py`: Flask application setup
- `routes.py`: Web routes و API endpoints
- `models.py`: Database models
- `services/`: تمام سرویس‌های اصلی
- `templates/`: Frontend templates
- `static/`: CSS/JS files

## بررسی سلامت سیستم
پس از راه‌اندازی، برای بررسی:
- وب: `http://your-server:5000`
- API status: `http://your-server:5000/api/live_status`
- Admin panel: `http://your-server:5000/admin` (نیاز به تنظیم admin ID در Telegram)

## لاگ‌ها
- Application logs: خروجی gunicorn
- Telegram logs: در فایل‌های log/ directory
- Error tracking: در admin panel

---
**تاریخ ایجاد**: August 18, 2025
**نسخه**: GoldBot v2.1 Production Ready