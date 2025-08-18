#!/usr/bin/env python3
"""
تولید پکیج نهایی رفع شده - بدون خطای indentation
"""
import os
import tarfile
import shutil
from datetime import datetime

def create_final_fixed_package():
    """تولید پکیج نهایی رفع شده"""
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    package_name = f"goldbot_final_fixed_{timestamp}"
    
    print(f"🎯 تولید پکیج نهایی رفع شده: {package_name}")
    
    # فایل‌های اصلی
    essential_files = [
        'main.py',
        'app.py', 
        'models.py',
        'routes.py',
        'routes_admin.py',
        'config_defaults.py'
    ]
    
    # پوشه‌های ضروری
    essential_dirs = [
        'services',
        'templates', 
        'static',
        'utils',
        'config',
        'metatrader',
        'data'
    ]
    
    # ایجاد پکیج
    if os.path.exists(package_name):
        shutil.rmtree(package_name)
    os.makedirs(package_name)
    
    try:
        # کپی فایل‌های اصلی
        for file in essential_files:
            if os.path.exists(file):
                shutil.copy2(file, package_name)
                print(f"✅ {file}")
        
        # کپی پوشه‌های ضروری
        for directory in essential_dirs:
            if os.path.exists(directory):
                dest = os.path.join(package_name, directory)
                shutil.copytree(directory, dest)
                print(f"📁 {directory}/")
        
        # فایل requirements
        requirements_content = """Flask>=3.0.0
flask-sqlalchemy>=3.1.1
SQLAlchemy>=2.0.23
psycopg2-binary>=2.9.9
pandas>=2.1.4
numpy>=1.24.4
plotly>=5.17.0
requests>=2.31.0
python-telegram-bot>=20.7
apscheduler>=3.10.4
pytz>=2023.3
beautifulsoup4>=4.12.2
gunicorn>=21.2.0
python-dateutil>=2.8.2
jdatetime
email-validator"""
        
        with open(os.path.join(package_name, 'requirements.txt'), 'w') as f:
            f.write(requirements_content)
        
        # اسکریپت نصب
        install_script = """#!/bin/bash
echo "🎯 نصب GoldBot - نسخه نهایی رفع شده"
echo "=================================="

# بررسی Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 یافت نشد. نصب کنید:"
    echo "   Ubuntu: sudo apt update && sudo apt install python3 python3-pip"
    exit 1
fi

echo "✅ Python3 موجود است"

# نصب بسته‌ها
echo "📦 نصب بسته‌های Python..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ همه چیز نصب شد!"
    echo ""
    echo "🚀 اجرا:"
    echo "   python3 main.py"
    echo ""
    echo "🌐 دسترسی:"
    echo "   http://localhost:5000"
    echo "   http://YOUR_IP:5000/admin"
else
    echo "❌ خطا در نصب"
    exit 1
fi
"""
        
        with open(os.path.join(package_name, 'install.sh'), 'w') as f:
            f.write(install_script)
        os.chmod(os.path.join(package_name, 'install.sh'), 0o755)
        
        # اسکریپت شروع
        start_script = """#!/bin/bash
echo "🚀 شروع GoldBot..."
python3 main.py
"""
        
        with open(os.path.join(package_name, 'start.sh'), 'w') as f:
            f.write(start_script)
        os.chmod(os.path.join(package_name, 'start.sh'), 0o755)
        
        # راهنمای نهایی
        readme = f"""# 🎯 GoldBot - نسخه نهایی رفع شده

## ✅ مشکلات حل شده:
- خطای "No module named 'routes_admin'" ✅
- خطای IndentationError در app.py ✅
- پنل ادمین کاملاً فعال ✅
- تمام import ها رفع شده ✅

## 🚀 نصب و اجرا:
```bash
tar -xzf {package_name}.tar.gz
cd {package_name}
./install.sh
python3 main.py
```

## 🌐 دسترسی:
- **داشبورد**: http://localhost:5000
- **پنل ادمین**: http://localhost:5000/admin
- **برای VPS**: http://YOUR_IP:5000

## 🎯 ویژگی‌های کلیدی:
- سیستم تشخیص سیگنال MT5
- تحلیل Smart Money Concepts
- پنل مدیریت کامل
- ارسال خودکار به تلگرام
- دیتابیس خودکار

## 📋 سیستم مورد نیاز:
- Python 3.8+
- 1GB RAM
- اتصال اینترنت

---
📅 تاریخ: {datetime.now().strftime('%Y/%m/%d %H:%M')}
🏷️ ورژن: Final Fixed - همه مشکلات حل شده
"""
        
        with open(os.path.join(package_name, 'README.md'), 'w', encoding='utf-8') as f:
            f.write(readme)
        
        # تولید tar.gz
        tar_filename = f"{package_name}.tar.gz"
        with tarfile.open(tar_filename, 'w:gz', compresslevel=9) as tar:
            tar.add(package_name, arcname=package_name)
        
        # پاک کردن پوشه موقت
        shutil.rmtree(package_name)
        
        # محاسبه اندازه
        size = os.path.getsize(tar_filename) / (1024 * 1024)
        
        print(f"""
🎉 پکیج نهایی آماده!

📦 نام: {tar_filename}
📊 اندازه: {size:.1f} MB
✅ همه مشکلات حل شده
🎯 آماده اجرا

🚀 دستورات:
tar -xzf {tar_filename}
cd {package_name}
./install.sh
python3 main.py
        """)
        
        return tar_filename
        
    except Exception as e:
        print(f"❌ خطا: {e}")
        if os.path.exists(package_name):
            shutil.rmtree(package_name)
        return None

if __name__ == "__main__":
    result = create_final_fixed_package()
    if result:
        print(f"\n🎯 فایل نهایی: {result}")
    else:
        print("❌ خطا در تولید پکیج")