# راهنمای نصب ویندوز سرور 2019
# Gold Trading Bot - Windows Server 2019 Installation Guide

## مشکل TA-Lib در ویندوز و راه حل

### مشکل اصلی:
- TA-Lib به Microsoft Visual C++ Build Tools نیاز دارد
- نصب آن در ویندوز سرور پیچیده است
- ممکن است خطاهای کامپایل ایجاد کند

### راه حل:
✅ **استفاده از کتابخانه 'ta' به جای TA-Lib**
- کتابخانه 'ta' همه قابلیت‌های TA-Lib را دارد
- نصب آسان بدون نیاز به Build Tools
- کاملاً سازگار با ویندوز

## مراحل نصب در ویندوز سرور 2019

### مرحله 1: آماده‌سازی سیستم

1. **نصب Python 3.11:**
   ```
   https://www.python.org/downloads/
   ```
   - Python 3.11 را دانلود و نصب کنید
   - حتما "Add Python to PATH" را تیک بزنید

2. **بررسی نصب Python:**
   ```cmd
   python --version
   pip --version
   ```

### مرحله 2: حل مشکل TA-Lib و نصب

1. **استخراج فایل ZIP:**
   - فایل `gold-trading-bot-complete-updated.zip` را در پوشه دلخواه استخراج کنید
   - مثال: `C:\GoldBot`

2. **حل مشکل TA-Lib (مهم):**
   
   **❌ خطای معمول:** `Building wheel for TA-Lib failed`
   
   **✅ راه‌حل آسان:**
   ```cmd
   cd C:\GoldBot
   install_windows_fixed.bat
   ```
   
   **یا نصب دستی:**
   ```cmd
   pip install -r install_requirements_windows.txt
   python fix_ta_lib_windows.py
   ```

### مرحله 3: تنظیمات اولیه

1. **ویرایش فایل .env (اختیاری):**
   ```env
   # فقط IP سرور را تنظیم کنید - بقیه از قبل آماده است
   SERVER_IP=192.168.1.100  # IP واقعی سرور شما
   
   # تنظیمات تلگرام از قبل در کد قرار گرفته - نیازی به تغییر نیست
   # Telegram settings are hardcoded - no need to change
   # TELEGRAM_BOT_TOKEN=7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y
   # TELEGRAM_CHANNEL_ID=-1002717718463
   # TELEGRAM_ADMIN_ID=1112066452
   ```

   **⚠️ نکته مهم:** تنظیمات تلگرام مستقیماً در کد قرار گرفته و نیازی به تنظیم دستی ندارد!

2. **تنظیم فایروال ویندوز:**
   ```cmd
   # باز کردن پورت 5000
   netsh advfirewall firewall add rule name="Gold Bot Port 5000" dir=in action=allow protocol=TCP localport=5000
   ```

### مرحله 4: راه‌اندازی

1. **راه‌اندازی دستی:**
   ```cmd
   start_windows_server.bat
   ```

2. **یا اجرای مستقیم:**
   ```cmd
   cd C:\GoldBot
   venv\Scripts\activate
   python main.py
   ```

## فایل‌های جدید برای ویندوز

### 1. install_requirements_windows.txt
- پکیج‌های سازگار با ویندوز
- استفاده از 'ta' به جای TA-Lib
- نسخه‌های تست شده

### 2. analysis_service_windows.py
- سرویس تحلیل سازگار با ویندوز
- استفاده از کتابخانه 'ta'
- تمام قابلیت‌های TA-Lib

### 3. start_windows_server.bat
- اسکریپت راه‌اندازی ویندوز
- نصب خودکار پکیج‌ها
- نمایش اطلاعات دسترسی

### 4. install_windows.py
- نصب کننده هوشمند ویندوز
- تشخیص و رفع مشکلات
- تست خودکار نصب

## دسترسی به وب‌سرویس

### آدرس‌های دسترسی:
- **محلی:** http://localhost:5000
- **شبکه داخلی:** http://192.168.1.100:5000
- **اینترنت:** http://YOUR_PUBLIC_IP:5000

### صفحات در دسترس:
- **داشبورد:** `/dashboard`
- **نمودارها:** `/charts`
- **سیگنال‌ها:** `/signals`
- **تنظیمات:** `/settings`

## عیب‌یابی مشکلات ویندوز

### مشکل 1: خطای TA-Lib
```
ERROR: Failed building wheel for TA-Lib
```
**راه حل:** از `install_requirements_windows.txt` استفاده کنید که 'ta' دارد

### مشکل 2: خطای Microsoft Visual C++
```
error: Microsoft Visual C++ 14.0 or greater is required
```
**راه حل:** نیازی به نصب ندارید، از کتابخانه 'ta' استفاده می‌کنیم

### مشکل 3: خطای دسترسی به پورت
```
Permission denied: port 5000
```
**راه حل:**
```cmd
netsh advfirewall firewall add rule name="Gold Bot" dir=in action=allow protocol=TCP localport=5000
```

### مشکل 4: خطای encoding در ویندوز
```
UnicodeDecodeError
```
**راه حل:** فایل‌های python با encoding='utf-8' ذخیره شده‌اند

## ویژگی‌های ویندوز

### مزایای نسخه ویندوز:
✅ نصب آسان بدون پیچیدگی
✅ سازگاری کامل با Windows Server 2019
✅ عدم نیاز به Microsoft Visual C++ Build Tools
✅ استفاده از کتابخانه 'ta' مدرن و سریع
✅ تست شده روی Windows Server 2019

### تفاوت‌ها با نسخه لینوکس:
- استفاده از 'ta' به جای TA-Lib
- اسکریپت‌های .bat به جای .sh
- تنظیمات مخصوص ویندوز
- راهنمای نصب اختصاصی

## پشتیبانی و بروزرسانی

### چک کردن وضعیت سیستم:
```cmd
curl http://localhost:5000/dashboard
```

### مشاهده لاگ‌ها:
- لاگ‌های سیستم در کنسول نمایش داده می‌شوند
- خطاها با جزئیات کامل ثبت می‌شوند

### بروزرسانی:
1. فایل ZIP جدید را دانلود کنید
2. پوشه قدیمی را backup کنید
3. فایل‌های جدید را جایگزین کنید
4. دوباره راه‌اندازی کنید

---

**✅ سیستم آماده استفاده در ویندوز سرور 2019**

🔗 **دسترسی وب:** http://YOUR_SERVER_IP:5000
📱 **کانال تلگرام:** https://t.me/goldanalysischannel
⚙️ **پنل مدیریت:** https://t.me/YourBotUsername