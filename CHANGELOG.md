# تغییرات بروزرسانی ربات تحلیل طلا
# Gold Trading Bot Update Changelog

## آخرین بروزرسانی (Latest Update) - 2025/08/11

### ✅ قالب‌های گزارش‌دهی بهبود یافته (Enhanced Report Templates)

#### گزارش روزانه شامل:
- ✓ فرمت فارسی کامل طبق نمونه ارائه شده
- ✓ پرایس اکشن و ساختار بازار (BOS/CHoCH) 
- ✓ محدوده‌های کلیدی (مقاومت/حمایت روزانه)
- ✓ اندیکاتورهای چندگانه (RSI هفتگی/روزانه/4ساعته/15دقیقه)
- ✓ آمار بازار 24 ساعته کامل
- ✓ تحلیل جامع و چشم‌انداز کوتاه‌مدت
- ✓ سناریوهای صعودی/نزولی با اهداف قیمتی

#### گزارش هفتگی شامل:
- ✓ تحلیل تکنیکال چند تایم‌فریم
- ✓ مقاومت‌ها و حمایت‌های هفتگی/روزانه/4ساعته
- ✓ استراتژی‌های ورود و خروج
- ✓ تقویم اقتصادی هفتگی

### ✅ تنظیمات وب‌سرویس برای دسترسی خارجی (External Web Access)

#### فایل‌های اضافه شده:
- `config/web_config.py` - تنظیمات شبکه و امنیت
- `services/telegram_service_helper.py` - حل مشکل import
- `DEPLOYMENT_INSTRUCTIONS.md` - راهنمای کامل استقرار

#### ویژگی‌های جدید:
- ✓ دسترسی از IP استاتیک خارجی: `http://YOUR_SERVER_IP:5000`
- ✓ پشتیبانی از اتصالات همزمان (threaded=True)
- ✓ نمایش اطلاعات startup برای راهنمایی کاربر
- ✓ تنظیمات قابل تنظیم از environment variables

### ✅ سیستم اخبار پیشرفته (Enhanced News System)

#### منابع اخبار:
- ForexFactory - تقویم اقتصادی و اخبار فارکس
- FXStreet - اخبار مالی و تحلیل بازار  
- Investing.com - اخبار کامودیتی‌ها
- MarketWatch - آتی طلا و احساسات بازار
- Kitco - اخبار تخصصی فلزات گرانبها

#### ویژگی‌های هوشمند:
- ✓ فیلتر کلمات کلیدی طلا
- ✓ اولویت‌بندی اخبار (بالا/متوسط/پایین)
- ✓ تحلیل احساسات (صعودی/نزولی/خنثی)
- ✓ حذف خودکار اخبار تکراری
- ✓ سیستم fallback در صورت عدم دسترسی

### 🔧 رفع باگ‌ها (Bug Fixes)

#### مشکلات حل شده:
- ✓ خطای `Signal.result` در dashboard - تصحیح شد
- ✓ خطای `'stats' is undefined` در template - برطرف شد
- ✓ مشکل import `send_admin_notification` - حل شد
- ✓ کاراکتر غیرقابل چاپ در strings - پاک شد
- ✓ خطای template rendering در صورت بروز خرابی

### 📦 فایل‌های بروزرسانی شده

#### فایل‌های اصلی:
- `services/telegram_service.py` - قالب گزارش‌ها
- `services/news_service.py` - منابع اخبار جدید
- `main.py` - تنظیمات شبکه
- `routes.py` - رفع مشکلات dashboard
- `models.py` - مدل‌های پایگاه داده

#### فایل‌های جدید:
- `templates/report_templates.py` - قالب‌های اختصاصی
- `config/web_config.py` - تنظیمات وب
- `services/telegram_service_helper.py` - کمکی telegram
- `DEPLOYMENT_INSTRUCTIONS.md` - راهنمای استقرار

### 🚀 راهنمای استقرار سریع

#### روش 1: استقرار مستقیم
```bash
python main.py
# دسترسی: http://YOUR_SERVER_IP:5000
```

#### روش 2: با Gunicorn (پیشنهادی)
```bash
gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app
```

#### تنظیمات محیط (.env):
```env
SERVER_IP=YOUR_ACTUAL_IP
HOST=0.0.0.0
PORT=5000
TELEGRAM_BOT_TOKEN=7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y
TELEGRAM_CHANNEL_ID=-1002717718463
TELEGRAM_ADMIN_ID=1112066452
```

### 📊 صفحات وب در دسترس

- 🏠 Dashboard: `http://YOUR_SERVER_IP:5000/`
- 📊 Analytics: `http://YOUR_SERVER_IP:5000/dashboard`
- 📈 Charts: `http://YOUR_SERVER_IP:5000/charts`
- 📋 Signals: `http://YOUR_SERVER_IP:5000/signals`
- ⚙️ Settings: `http://YOUR_SERVER_IP:5000/settings`

### ⚠️ نکات مهم

1. API خارجی (46.100.50.194:5050) در حال حاضر در دسترس نیست
2. سیستم fallback data فعال است و کاملاً کار می‌کند
3. برای دسترسی خارجی، IP سرور را در متغیرهای محیط تنظیم کنید
4. فایروال سرور باید پورت 5000 را باز کند

### 🛠️ تنظیمات ویژه ویندوز سرور 2019 (Windows Server 2019 Specific)

#### حل مشکل TA-Lib:
- ✓ جایگزینی TA-Lib با کتابخانه 'ta' برای سازگاری ویندوز
- ✓ عدم نیاز به Microsoft Visual C++ Build Tools
- ✓ `analysis_service_windows.py` - سرویس تحلیل مخصوص ویندوز
- ✓ `install_requirements_windows.txt` - پکیج‌های سازگار ویندوز

#### حل مشکل SQLAlchemy Circular Import:
- ✓ اصلاح `app.py` برای رفع circular import در ویندوز
- ✓ بازنویسی `main.py` با مدیریت خطای بهتر
- ✓ `fix_windows_import.py` - اسکریپت خودکار رفع مشکلات import
- ✓ تنظیم `use_reloader=False` برای جلوگیری از مشکلات ویندوز

#### فایل‌های جدید ویندوز:
- `start_windows_server.bat` - اسکریپت راه‌اندازی ویندوز
- `install_windows.py` - نصب کننده هوشمند ویندوز  
- `README_WINDOWS_SERVER.md` - راهنمای کامل ویندوز

#### تنظیمات شبکه ویندوز:
- ✓ پیکربندی فایروال ویندوز برای پورت 5000
- ✓ تنظیمات IP استاتیک و دسترسی خارجی
- ✓ راهنمای troubleshooting مسائل رایج ویندوز

---

**✅ تمام تغییرات در فایل ZIP جدید اعمال شده است**
**📦 فایل: `gold-trading-bot-complete-updated.zip`**
**🖥️ سازگار با Windows Server 2019**