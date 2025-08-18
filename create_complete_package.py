#!/usr/bin/env python3
"""
تولید پکیج کامل با تمام فایل‌های ضروری برای اجرای ربات
"""
import os
import tarfile
import shutil
from datetime import datetime

def create_complete_package():
    """تولید پکیج کامل با تمام فایل‌های مورد نیاز"""
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    package_name = f"goldbot_complete_{timestamp}"
    
    print(f"📦 تولید پکیج کامل: {package_name}")
    
    # تمام فایل‌های اصلی مورد نیاز
    essential_files = [
        # فایل‌های اصلی
        'main.py',
        'app.py', 
        'models.py',
        'routes.py',
        'config_defaults.py',
        
        # فایل‌های نصب
        'install_requirements_fixed.txt',
        'install_ubuntu.sh',
        'simple_install.sh',
        'one_click_install.sh',
        
        # فایل‌های مستندات
        'README.md',
        'DATABASE_INFO.md',
        'NO_TALIB_CONFIRMATION.md',
        
        # فایل‌های پیکربندی
        'pyproject.toml',
        'uv.lock'
    ]
    
    # تمام پوشه‌های مورد نیاز
    essential_dirs = [
        'services',      # سرویس‌های اصلی
        'templates',     # قالب‌های وب
        'static',        # فایل‌های استاتیک
        'utils',         # ابزارهای کمکی
        'config',        # پیکربندی‌ها
        'metatrader',    # فایل‌های MT5
        'data',          # داده‌های CSV
        'scripts'        # اسکریپت‌های سرویس
    ]
    
    # ایجاد پکیج
    if os.path.exists(package_name):
        shutil.rmtree(package_name)
    os.makedirs(package_name)
    
    try:
        copied_files = 0
        copied_dirs = 0
        
        # کپی فایل‌های اصلی
        for file in essential_files:
            if os.path.exists(file):
                shutil.copy2(file, package_name)
                print(f"✅ {file}")
                copied_files += 1
            else:
                print(f"⚠️ فایل موجود نیست: {file}")
        
        # کپی پوشه‌های ضروری
        for directory in essential_dirs:
            if os.path.exists(directory):
                dest = os.path.join(package_name, directory)
                shutil.copytree(directory, dest)
                print(f"📁 {directory}/")
                copied_dirs += 1
            else:
                print(f"⚠️ پوشه موجود نیست: {directory}")
        
        # ایجاد فایل requirements کامل
        requirements_content = """# پکیج‌های ضروری GoldBot
Flask>=3.0.0
flask-sqlalchemy>=3.1.1
Werkzeug>=3.0.1
SQLAlchemy>=2.0.23
psycopg2-binary>=2.9.9

# پردازش داده
pandas>=2.1.4
numpy>=1.24.4

# نمودار و تجسم
plotly>=5.17.0

# HTTP و API
requests>=2.31.0

# تلگرام
python-telegram-bot>=20.7

# زمان‌بندی
apscheduler>=3.10.4
pytz>=2023.3

# وب اسکریپینگ
beautifulsoup4>=4.12.2
trafilatura>=1.6.4
lxml>=4.9.4

# سرور
gunicorn>=21.2.0

# محیط
python-dotenv>=1.0.0

# تاریخ و زمان
python-dateutil>=2.8.2

# کتابخانه‌های پایه
jdatetime
email-validator
"""
        
        with open(os.path.join(package_name, 'requirements.txt'), 'w') as f:
            f.write(requirements_content)
        print("✅ requirements.txt")
        
        # ایجاد اسکریپت نصب جامع
        install_script = """#!/bin/bash
# نصب خودکار GoldBot

echo "🚀 شروع نصب GoldBot..."
echo "=================================="

# بررسی Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 یافت نشد. لطفاً نصب کنید:"
    echo "   Ubuntu/Debian: sudo apt update && sudo apt install python3 python3-pip"
    echo "   CentOS/RHEL: sudo yum install python3 python3-pip"
    exit 1
fi

echo "✅ Python3 موجود است"

# نصب pip packages
echo "📦 نصب بسته‌های Python..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ تمام بسته‌ها با موفقیت نصب شدند"
else
    echo "❌ خطا در نصب بسته‌ها"
    exit 1
fi

# ایجاد دایرکتوری لاگ
mkdir -p logs
mkdir -p data/mt5_csv

# تنظیم مجوزها
chmod +x *.sh

echo "=================================="
echo "✅ نصب کامل شد!"
echo ""
echo "📋 برای اجرا:"
echo "   python3 main.py"
echo ""
echo "🌐 دسترسی وب:"
echo "   http://localhost:5000"
echo "   http://YOUR_IP:5000"
echo ""
echo "👤 پنل ادمین:"
echo "   http://localhost:5000/admin"
echo ""
echo "🔧 برای VPS:"
echo "   gunicorn --bind 0.0.0.0:5000 --reload main:app"
"""
        
        with open(os.path.join(package_name, 'install.sh'), 'w') as f:
            f.write(install_script)
        os.chmod(os.path.join(package_name, 'install.sh'), 0o755)
        print("✅ install.sh")
        
        # ایجاد اسکریپت شروع سرویس
        start_script = """#!/bin/bash
# شروع سرویس GoldBot

echo "🔄 شروع GoldBot..."

# بررسی پورت
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ پورت 5000 در حال استفاده است"
    echo "🔧 برای متوقف کردن: pkill -f gunicorn"
fi

# اجرا در پس‌زمینه
nohup gunicorn --bind 0.0.0.0:5000 --reload main:app > logs/goldbot.log 2>&1 &

echo "✅ GoldBot شروع شد"
echo "📋 لاگ: tail -f logs/goldbot.log"
echo "🌐 دسترسی: http://$(hostname -I | awk '{print $1}'):5000"
"""
        
        with open(os.path.join(package_name, 'start.sh'), 'w') as f:
            f.write(start_script)
        os.chmod(os.path.join(package_name, 'start.sh'), 0o755)
        print("✅ start.sh")
        
        # ایجاد اسکریپت توقف
        stop_script = """#!/bin/bash
# متوقف کردن GoldBot

echo "🛑 متوقف کردن GoldBot..."
pkill -f "gunicorn.*main:app" || echo "❌ هیچ پروسه‌ای یافت نشد"
echo "✅ GoldBot متوقف شد"
"""
        
        with open(os.path.join(package_name, 'stop.sh'), 'w') as f:
            f.write(stop_script)
        os.chmod(os.path.join(package_name, 'stop.sh'), 0o755)
        print("✅ stop.sh")
        
        # راهنمای کامل
        readme_complete = f"""# 🤖 GoldBot - ربات تحلیل طلای جهانی

## 📦 محتویات پکیج:
این پکیج شامل تمام فایل‌های مورد نیاز برای اجرای کامل ربات است.

### 📁 ساختار فایل‌ها:
- **فایل‌های اصلی**: main.py, app.py, models.py, routes.py
- **سرویس‌ها**: services/ - تمام سرویس‌های تحلیل و ارتباط  
- **قالب‌ها**: templates/ - صفحات وب
- **استاتیک**: static/ - CSS, JS, تصاویر
- **پیکربندی**: config/ - تنظیمات سیستم
- **MT5**: metatrader/ - فایل‌های MetaTrader
- **داده**: data/ - فایل‌های CSV و داده‌ها

## 🚀 نصب و راه‌اندازی:

### 1️⃣ نصب خودکار (توصیه می‌شود):
```bash
chmod +x install.sh
./install.sh
```

### 2️⃣ نصب دستی:
```bash
pip3 install -r requirements.txt
python3 main.py
```

### 3️⃣ اجرا برای VPS:
```bash
# شروع
./start.sh

# متوقف
./stop.sh
```

## 🌐 دسترسی:
- **داشبورد**: http://localhost:5000
- **پنل ادمین**: http://localhost:5000/admin
- **برای VPS**: http://YOUR_IP:5000

## ✅ ویژگی‌های کلیدی:

### 🎯 اولویت اول - سیگنال MT5:
- سیستم تشخیص سیگنال در زمان واقعی
- تحلیل Smart Money Concepts (SMC)
- پنل تایید و ویرایش سیگنال‌ها
- لاگ کامل فعالیت‌ها

### 📊 تحلیل تکنیکال:
- شاخص RSI سفارشی (بدون TA-Lib)
- تحلیل Price Action
- الگوهای کندل استیک
- تحلیل چندزمانه (M15, H1, H4, D1)

### 💰 قیمت‌گذاری:
- API Navasan برای نرخ‌های ارز
- مانیتورینگ کانال @ZaryaalGold
- به‌روزرسانی خودکار قیمت‌ها

### 🗄️ پایگاه داده:
- **خودکار ایجاد می‌شود** - نیازی به نصب PostgreSQL نیست
- ذخیره تمام سیگنال‌ها و تحلیل‌ها
- سیستم آمارگیری کامل

### 📱 تلگرام:
- ارسال خودکار گزارش‌ها
- سیستم اعلانات ادمین
- گزارش‌های هفتگی جامع

## 🔧 تنظیمات مهم:

### مسیر MT5:
سیستم به طور خودکار از این مسیر داده می‌خواند:
```
/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files
```

### متغیرهای محیطی:
- `DATABASE_URL`: آدرس پایگاه داده (اختیاری)
- `NAVASAN_API_KEY`: کلید API نوسان
- `TELEGRAM_BOT_TOKEN`: توکن ربات تلگرام

## 📋 نیازمندی‌های سیستم:
- Python 3.8+
- 1GB RAM حداقل
- 2GB فضای دیسک
- اتصال اینترنت

## 🆘 عیب‌یابی:

### مشکلات رایج:
1. **پورت اشغال**: `./stop.sh` سپس `./start.sh`
2. **خطای پایگاه داده**: خودکار حل می‌شود
3. **مشکل API**: کلیدهای API را بررسی کنید

### لاگ‌ها:
```bash
tail -f logs/goldbot.log
```

## 📞 پشتیبانی:
برای مشکلات فنی، فایل‌های لاگ را بررسی کنید.

---
📅 تاریخ تولید: {datetime.now().strftime('%Y/%m/%d %H:%M')}
🏷️ ورژن: Complete Package - کامل و آماده اجرا
📊 تعداد فایل‌ها: {copied_files + copied_dirs + 4}
"""
        
        with open(os.path.join(package_name, 'README_COMPLETE.md'), 'w', encoding='utf-8') as f:
            f.write(readme_complete)
        print("✅ README_COMPLETE.md")
        
        # تولید tar.gz با بهترین فشرده‌سازی
        tar_filename = f"{package_name}.tar.gz"
        with tarfile.open(tar_filename, 'w:gz', compresslevel=9) as tar:
            tar.add(package_name, arcname=package_name)
        
        # پاک کردن پوشه موقت
        shutil.rmtree(package_name)
        
        # محاسبه اندازه
        size = os.path.getsize(tar_filename) / (1024 * 1024)
        
        print(f"""
🎉 پکیج کامل آماده شد!

📦 نام فایل: {tar_filename}
📊 اندازه: {size:.1f} MB
📁 تعداد فایل‌ها: {copied_files}
📂 تعداد پوشه‌ها: {copied_dirs}
✅ شامل تمام فایل‌های ضروری

🚀 نصب در سرور:
1. آپلود فایل
2. tar -xzf {tar_filename}
3. cd {package_name}
4. ./install.sh
5. ./start.sh یا python3 main.py

🌐 دسترسی: http://YOUR_IP:5000
👤 ادمین: http://YOUR_IP:5000/admin
        """)
        
        return tar_filename
        
    except Exception as e:
        print(f"❌ خطا در تولید پکیج: {e}")
        if os.path.exists(package_name):
            shutil.rmtree(package_name)
        return None

if __name__ == "__main__":
    result = create_complete_package()
    if result:
        print(f"\n🎯 فایل نهایی: {result}")
        full_path = os.path.abspath(result)
        print(f"📍 مسیر کامل: {full_path}")
        print(f"✅ آماده برای دانلود و استفاده")
    else:
        print("❌ خطا در تولید پکیج کامل")