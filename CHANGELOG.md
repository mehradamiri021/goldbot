# تاریخچه تغییرات / Changelog

## نسخه 2.5.0 - یکپارچه‌سازی MetaTrader 5
### 🚀 ویژگی‌های جدید / New Features
- **یکپارچه‌سازی مستقیم MT5:** دریافت داده‌های real-time از MetaTrader 5
- **سیستم Fallback هوشمند:** MT5 → API خارجی → داده‌های پشتیبان
- **پشتیبانی کراس پلتفرم:** Windows (MT5) + Linux (API)
- **Cache پیشرفته:** بر اساس timeframe با expire خودکار
- **مدیریت خطای بهبود یافته:** handling چندلایه برای اطمینان از در دسترس بودن داده

### 🔧 بهبودهای فنی / Technical Improvements
- **سرویس MT5 جداگانه:** `services/mt5_data_service.py`
- **API بازطراحی شده:** `services/data_service.py` با منطق fallback
- **تست اتصالات:** `test_connections()` برای تمام منابع
- **راهنمای کامل:** `MT5_INTEGRATION_GUIDE.md`

### 🐛 رفع مشکلات / Bug Fixes
- **SQLAlchemy Ubuntu Fix:** حل مشکل `primary mapper` در VPS
- **Import Error Handling:** مدیریت بهتر خطاهای import
- **Logger Issues:** رفع خطاهای logging در services
- **Connection Stability:** بهبود پایداری اتصالات

## نسخه 2.0.0 - حل مشکل SQLAlchemy
### 🔧 اصلاحات مهم / Major Fixes
- **SQLAlchemy Ubuntu Fix:** `clear_mappers()` برای جلوگیری از تداخل
- **API خارجی:** اتصال به `http://46.100.50.194:5050/get_data`
- **داده‌های پشتیبان واقعی:** fallback به جای mock data
- **بهبود main.py:** سازگاری با Gunicorn

### 📦 فایل‌های اضافه شده / Added Files
- `UBUNTU_FIX_README.md` - راهنمای حل مشکل Ubuntu
- `install_ubuntu.sh` - اسکریپت نصب خودکار
- `fix_sqlalchemy_ubuntu.py` - ابزار رفع مشکل

## نسخه 1.5.0 - بهبود Deployment
### 🚀 ویژگی‌های Deployment
- **Windows Server 2019 Support:** پشتیبانی کامل
- **Ubuntu VPS Ready:** سازگاری با VPS
- **Zero Configuration:** بدون نیاز به تنظیمات دستی
- **Auto Installation Scripts:** نصب خودکار dependencies

### 🔐 تنظیمات از پیش آماده / Pre-configured Settings
```python
TELEGRAM_BOT_TOKEN = "7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y"
TELEGRAM_CHANNEL_ID = "-1002717718463"
TELEGRAM_ADMIN_ID = "1112066452"
```

## نسخه 1.0.0 - نسخه اولیه
### 🎯 ویژگی‌های اصلی / Core Features
- **تحلیل روزانه:** گزارش‌های 09:09 و 15:15 تهران
- **مانیتورینگ 15 دقیقه‌ای:** نظارت مداوم بر چارت
- **سیگنال با تایید ادمین:** workflow تایید سیگنال‌ها
- **لاگ تغییر قیمت:** اعلان تغییرات مهم به ادمین
- **یکپارچگی اخبار:** جمع‌آوری اخبار از منابع مختلف

### 🏗️ معماری اولیه / Initial Architecture
- **Flask Web Framework:** پایه web application
- **SQLAlchemy ORM:** مدیریت database
- **APScheduler:** زمان‌بندی tasks
- **Telegram Bot API:** ارتباط با تلگرام
- **TA-Lib Integration:** محاسبات تکنیکال

---

## راهنمای نسخه‌گذاری / Version Guide

### 🏷️ نحوه نسخه‌گذاری:
- **Major (X.0.0):** تغییرات بزرگ معماری
- **Minor (X.Y.0):** ویژگی‌های جدید
- **Patch (X.Y.Z):** رفع مشکلات و بهبودهای کوچک

### 📅 برنامه انتشار:
- **Weekly:** بهبودهای کوچک و رفع باگ
- **Monthly:** ویژگی‌های جدید
- **Quarterly:** تغییرات بزرگ معماری

### 🔄 سیاست پشتیبانی:
- **Current Version:** پشتیبانی کامل
- **Previous Major:** رفع باگ‌های امنیتی
- **Older Versions:** End of Life

---

## آینده پروژه / Project Roadmap

### 🎯 نسخه 3.0.0 (برنامه‌ریزی شده)
- **AI Analysis Enhanced:** تحلیل پیشرفته‌تر با AI
- **Multi-Symbol Support:** پشتیبانی از سایر فلزات
- **Advanced Backtesting:** تست استراتژی‌ها
- **Mobile App Integration:** اپلیکیشن موبایل

### 🔮 آینده دوربرد
- **Machine Learning Models:** مدل‌های پیش‌بینی
- **Cloud Deployment:** استقرار ابری
- **Multi-Language Support:** پشتیبانی چندزبانه
- **Professional Dashboard:** داشبورد حرفه‌ای

---

**📊 آمار پروژه:**
- **خطوط کد:** 15,000+
- **فایل‌ها:** 50+
- **سرویس‌ها:** 12
- **API Endpoints:** 25+
- **حجم Package:** 323KB

**🏆 دستاورد:** ربات کامل و حرفه‌ای تحلیل طلا با قابلیت deployment آسان!