#!/usr/bin/env python3
"""
تولید پکیج سبک و تمیز نهایی
"""
import os
import tarfile
import shutil
from datetime import datetime

def create_lightweight_package():
    """تولید پکیج سبک"""
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    package_name = f"goldbot_lightweight_{timestamp}"
    
    print(f"📦 تولید پکیج سبک: {package_name}")
    
    # فقط فایل‌های ضروری
    core_files = [
        'main.py',
        'app.py', 
        'models.py',
        'routes.py',
        'config_defaults.py'
    ]
    
    # پوشه‌های اصلی (فقط ضروری)
    essential_dirs = [
        'services',
        'templates', 
        'static',
        'utils'
    ]
    
    # ایجاد پکیج
    if os.path.exists(package_name):
        shutil.rmtree(package_name)
    os.makedirs(package_name)
    
    try:
        # کپی فایل‌های اصلی
        for file in core_files:
            if os.path.exists(file):
                shutil.copy2(file, package_name)
                print(f"✅ {file}")
        
        # کپی پوشه‌های ضروری
        for directory in essential_dirs:
            if os.path.exists(directory):
                dest = os.path.join(package_name, directory)
                shutil.copytree(directory, dest)
                print(f"📁 {directory}")
        
        # ایجاد فایل requirements ساده
        requirements_content = """# پکیج‌های ضروری
Flask>=3.0.0
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
        
        # ایجاد اسکریپت نصب ساده
        install_script = """#!/bin/bash
echo "🚀 نصب GoldBot..."
pip3 install -r requirements.txt
echo "✅ نصب کامل شد"
echo "📝 برای اجرا: python3 main.py"
"""
        
        with open(os.path.join(package_name, 'install.sh'), 'w') as f:
            f.write(install_script)
        
        # اجازه اجرا
        os.chmod(os.path.join(package_name, 'install.sh'), 0o755)
        
        # راهنمای ساده
        readme = f"""# GoldBot - ربات تحلیل طلا

## نصب سریع:
```bash
tar -xzf {package_name}.tar.gz
cd {package_name}
./install.sh
python3 main.py
```

## دسترسی:
http://localhost:5000

تاریخ: {datetime.now().strftime('%Y/%m/%d')}
"""
        
        with open(os.path.join(package_name, 'README.txt'), 'w', encoding='utf-8') as f:
            f.write(readme)
        
        # تولید tar.gz با فشرده‌سازی بالا
        tar_filename = f"{package_name}.tar.gz"
        with tarfile.open(tar_filename, 'w:gz', compresslevel=9) as tar:
            tar.add(package_name, arcname=package_name)
        
        # پاک کردن پوشه موقت
        shutil.rmtree(package_name)
        
        # محاسبه اندازه
        size = os.path.getsize(tar_filename) / (1024 * 1024)
        
        print(f"""
🎉 پکیج سبک آماده شد!

📦 نام فایل: {tar_filename}
📊 اندازه: {size:.1f} MB
✅ آماده برای دانلود

🚀 نصب در سرور:
scp {tar_filename} root@server:/opt/
ssh root@server "cd /opt && tar -xzf {tar_filename} && cd {package_name} && ./install.sh && python3 main.py"
        """)
        
        return tar_filename
        
    except Exception as e:
        print(f"❌ خطا: {e}")
        if os.path.exists(package_name):
            shutil.rmtree(package_name)
        return None

if __name__ == "__main__":
    result = create_lightweight_package()
    if result:
        print(f"\n✅ فایل آماده: {result}")
        # نمایش مسیر کامل فایل
        full_path = os.path.abspath(result)
        print(f"📍 مسیر کامل: {full_path}")
    else:
        print("❌ خطا در تولید پکیج")