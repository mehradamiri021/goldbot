#!/usr/bin/env python3
"""
اسکریپت نصب خودکار ربات تحلیل طلا
Automated Installation Script for Gold Trading Bot
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def print_step(step, message):
    """چاپ مرحله نصب"""
    print(f"\n{'='*50}")
    print(f"مرحله {step}: {message}")
    print(f"Step {step}: {message}")
    print(f"{'='*50}")

def run_command(cmd, description):
    """اجرای دستور با مدیریت خطا"""
    print(f"در حال اجرا: {description}")
    print(f"Running: {description}")
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ موفق: {description}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ خطا در {description}:")
        print(f"❌ Error in {description}:")
        print(f"Command: {cmd}")
        print(f"Error: {e.stderr}")
        return False

def check_python():
    """بررسی نسخه پایتون"""
    print_step(1, "بررسی نسخه پایتون / Checking Python Version")
    
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ خطا: پایتون 3.8 یا بالاتر مورد نیاز است")
        print("❌ Error: Python 3.8 or higher is required")
        return False
    
    print(f"✅ پایتون {version.major}.{version.minor}.{version.micro} پیدا شد")
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} found")
    return True

def create_venv():
    """ایجاد محیط مجازی"""
    print_step(2, "ایجاد محیط مجازی / Creating Virtual Environment")
    
    if os.path.exists('venv'):
        print("📁 محیط مجازی موجود است، حذف و بازسازی...")
        print("📁 Virtual environment exists, removing and recreating...")
        shutil.rmtree('venv')
    
    return run_command(f"{sys.executable} -m venv venv", "ایجاد محیط مجازی")

def get_pip_command():
    """دستور pip مناسب را برمی‌گرداند"""
    if os.name == 'nt':  # Windows
        return 'venv\\Scripts\\pip'
    else:  # Linux/Mac
        return 'venv/bin/pip'

def get_python_command():
    """دستور python مناسب را برمی‌گرداند"""
    if os.name == 'nt':  # Windows
        return 'venv\\Scripts\\python'
    else:  # Linux/Mac
        return 'venv/bin/python'

def install_requirements():
    """نصب پکیج‌های مورد نیاز"""
    print_step(3, "نصب پکیج‌ها / Installing Packages")
    
    pip_cmd = get_pip_command()
    
    # بروزرسانی pip
    if not run_command(f"{pip_cmd} install --upgrade pip", "بروزرسانی pip"):
        return False
    
    # نصب پکیج‌ها
    if os.path.exists('install_requirements.txt'):
        return run_command(f"{pip_cmd} install -r install_requirements.txt", "نصب پکیج‌های پروژه")
    else:
        print("❌ فایل install_requirements.txt یافت نشد")
        print("❌ install_requirements.txt file not found")
        return False

def setup_env_file():
    """تنظیم فایل محیطی"""
    print_step(4, "تنظیم فایل محیطی / Setting up Environment File")
    
    if os.path.exists('.env'):
        print("⚠️  فایل .env موجود است، از تغییر صرف نظر می‌شود")
        print("⚠️  .env file exists, skipping modification")
        return True
    
    if os.path.exists('.env.example'):
        shutil.copy('.env.example', '.env')
        print("✅ فایل .env از .env.example کپی شد")
        print("✅ .env file copied from .env.example")
        print("\n⚠️  لطفاً فایل .env را ویرایش کنید و تنظیمات خود را وارد کنید")
        print("⚠️  Please edit .env file and enter your settings")
        return True
    else:
        print("❌ فایل .env.example یافت نشد")
        print("❌ .env.example file not found")
        return False

def setup_database():
    """راه‌اندازی دیتابیس"""
    print_step(5, "راه‌اندازی دیتابیس / Setting up Database")
    
    python_cmd = get_python_command()
    
    # ایجاد پوشه instance
    os.makedirs('instance', exist_ok=True)
    
    # اجرای اسکریپت برای ایجاد جداول
    db_script = '''
from app import app, db
with app.app_context():
    db.create_all()
    print("✅ دیتابیس ایجاد شد")
    print("✅ Database created successfully")
'''
    
    with open('setup_db.py', 'w', encoding='utf-8') as f:
        f.write(db_script)
    
    success = run_command(f"{python_cmd} setup_db.py", "ایجاد جداول دیتابیس")
    
    # حذف فایل موقت
    if os.path.exists('setup_db.py'):
        os.remove('setup_db.py')
    
    return success

def create_startup_scripts():
    """ایجاد اسکریپت‌های راه‌اندازی"""
    print_step(6, "ایجاد اسکریپت‌های راه‌اندازی / Creating Startup Scripts")
    
    # اسکریپت Windows
    windows_script = f'''@echo off
echo Starting Gold Trading Bot...
echo راه‌اندازی ربات تحلیل طلا...

cd /d "%~dp0"
venv\\Scripts\\python.exe main.py

pause
'''
    
    with open('start_windows.bat', 'w', encoding='utf-8') as f:
        f.write(windows_script)
    
    # اسکریپت Linux/Mac
    linux_script = f'''#!/bin/bash
echo "Starting Gold Trading Bot..."
echo "راه‌اندازی ربات تحلیل طلا..."

cd "$(dirname "$0")"
source venv/bin/activate
python main.py
'''
    
    with open('start_linux.sh', 'w', encoding='utf-8') as f:
        f.write(linux_script)
    
    # اجازه اجرا برای Linux/Mac
    if os.name != 'nt':
        os.chmod('start_linux.sh', 0o755)
    
    print("✅ اسکریپت‌های راه‌اندازی ایجاد شدند")
    print("✅ Startup scripts created")
    return True

def main():
    """تابع اصلی نصب"""
    print("🚀 نصب خودکار ربات تحلیل طلا")
    print("🚀 Automated Installation for Gold Trading Bot")
    print("=" * 60)
    
    steps = [
        check_python,
        create_venv, 
        install_requirements,
        setup_env_file,
        setup_database,
        create_startup_scripts
    ]
    
    for i, step in enumerate(steps, 1):
        if not step():
            print(f"\n❌ نصب در مرحله {i} متوقف شد")
            print(f"❌ Installation stopped at step {i}")
            sys.exit(1)
    
    print("\n" + "=" * 60)
    print("🎉 نصب با موفقیت کامل شد!")
    print("🎉 Installation completed successfully!")
    print("=" * 60)
    
    print("\n📋 مراحل بعدی:")
    print("📋 Next Steps:")
    print("1. فایل .env را ویرایش کنید")
    print("   Edit .env file with your settings")
    print("2. برای اجرا:")
    print("   To run:")
    if os.name == 'nt':
        print("   Windows: دوبار کلیک روی start_windows.bat")
        print("   Windows: Double-click start_windows.bat")
    else:
        print("   Linux/Mac: ./start_linux.sh")
    print("3. برای مشاهده وب پنل:")
    print("   For web panel: http://localhost:5000")

if __name__ == "__main__":
    main()