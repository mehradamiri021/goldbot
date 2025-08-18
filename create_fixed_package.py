#!/usr/bin/env python3
"""
تولید پکیج رفع شده با routes_admin
"""
import os
import tarfile
import shutil
from datetime import datetime

def create_fixed_package():
    """تولید پکیج رفع شده"""
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    package_name = f"goldbot_fixed_{timestamp}"
    
    print(f"🔧 تولید پکیج رفع شده: {package_name}")
    
    # فایل‌های اصلی (شامل routes_admin جدید)
    essential_files = [
        'main.py',
        'app.py', 
        'models.py',
        'routes.py',
        'routes_admin.py',  # فایل جدید اضافه شده
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
        copied_files = 0
        
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
        
        # فایل requirements ساده
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
python-dateutil>=2.8.2"""
        
        with open(os.path.join(package_name, 'requirements.txt'), 'w') as f:
            f.write(requirements_content)
        
        # اسکریپت نصب
        install_script = """#!/bin/bash
echo "🔧 نصب GoldBot (رفع شده)..."
pip3 install -r requirements.txt
echo "✅ نصب کامل شد - مشکل routes_admin حل شد"
echo "🚀 اجرا: python3 main.py"
"""
        
        with open(os.path.join(package_name, 'install.sh'), 'w') as f:
            f.write(install_script)
        os.chmod(os.path.join(package_name, 'install.sh'), 0o755)
        
        # راهنما
        readme = f"""# GoldBot - نسخه رفع شده

## مشکل حل شده:
✅ خطای "No module named 'routes_admin'" برطرف شد
✅ فایل routes_admin.py اضافه شده
✅ پنل ادمین کاملاً فعال

## نصب:
```bash
tar -xzf {package_name}.tar.gz
cd {package_name}
./install.sh
python3 main.py
```

## دسترسی:
- وب: http://localhost:5000
- ادمین: http://localhost:5000/admin

تاریخ: {datetime.now().strftime('%Y/%m/%d %H:%M')}
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
🎉 پکیج رفع شده آماده!

📦 نام: {tar_filename}
📊 اندازه: {size:.1f} MB
🔧 مشکل routes_admin حل شد
✅ آماده اجرا در VPS

🚀 استفاده:
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
    result = create_fixed_package()
    if result:
        print(f"\n✅ فایل رفع شده: {result}")
    else:
        print("❌ خطا در تولید پکیج")