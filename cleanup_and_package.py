#!/usr/bin/env python3
"""
پاکسازی کامل و تولید پکیج نهایی
"""
import os
import tarfile
import shutil
from datetime import datetime

def cleanup_project():
    """پاکسازی فایل‌های اضافی"""
    print("🧹 شروع پاکسازی...")
    
    # فایل‌های اضافی برای حذف
    cleanup_patterns = [
        "*.tar.gz", "*.zip",
        "README_*", "*FINAL*", "*PRODUCTION*", 
        "*VPS*", "*GITHUB*", "*DEPLOYMENT*",
        "create_*.py", "fix_*.py", "install_*.py",
        "auto_setup.py", "download_*.py"
    ]
    
    # پوشه‌های اضافی
    cleanup_dirs = [
        "attached_assets", ".cache", ".pythonlibs", 
        "__pycache__", "instance"
    ]
    
    removed_count = 0
    
    # حذف فایل‌های اضافی
    for pattern in cleanup_patterns:
        import glob
        files = glob.glob(pattern)
        for file in files:
            if os.path.exists(file) and "replit.md" not in file:
                try:
                    os.remove(file)
                    removed_count += 1
                    print(f"🗑️ حذف: {file}")
                except:
                    pass
    
    # حذف پوشه‌های اضافی
    for dir_name in cleanup_dirs:
        if os.path.exists(dir_name):
            try:
                shutil.rmtree(dir_name)
                removed_count += 1
                print(f"📁 حذف پوشه: {dir_name}")
            except:
                pass
    
    print(f"✅ پاکسازی کامل شد: {removed_count} فایل/پوشه حذف شد")
    return removed_count

def create_clean_package():
    """تولید پکیج تمیز و نهایی"""
    
    # پاکسازی اول
    cleanup_project()
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    package_name = f"goldbot_clean_final_{timestamp}"
    
    print(f"📦 تولید پکیج تمیز: {package_name}")
    
    # فایل‌های ضروری
    essential_files = [
        'main.py', 'app.py', 'models.py', 'routes.py',
        'config_defaults.py', 'install_requirements_fixed.txt'
    ]
    
    # پوشه‌های ضروری
    essential_dirs = [
        'services', 'templates', 'static', 'utils', 
        'config', 'metatrader'
    ]
    
    # ایجاد پکیج
    if os.path.exists(package_name):
        shutil.rmtree(package_name)
    os.makedirs(package_name)
    
    try:
        # کپی فایل‌های ضروری
        for file in essential_files:
            if os.path.exists(file):
                shutil.copy2(file, package_name)
                print(f"✅ کپی: {file}")
        
        # کپی پوشه‌های ضروری
        for directory in essential_dirs:
            if os.path.exists(directory):
                shutil.copytree(directory, os.path.join(package_name, directory))
                print(f"📁 کپی: {directory}")
        
        # ایجاد راهنمای ساده
        readme_content = f"""# GoldBot - نسخه نهایی تمیز

## نصب سریع:
```bash
# آپلود به VPS
scp {package_name}.tar.gz root@IP:/opt/

# نصب
cd /opt/
tar -xzf {package_name}.tar.gz  
cd {package_name}/
pip3 install -r install_requirements_fixed.txt
python3 main.py
```

## دسترسی:
- وب: http://IP:5000
- ادمین: http://IP:5000/admin

## ویژگی‌ها:
✅ دیتابیس خودکار
✅ بدون TA-Lib 
✅ RSI سفارشی
✅ MT5 + SMC Analysis
✅ پنل ادمین کامل

تاریخ: {datetime.now().strftime('%Y/%m/%d %H:%M')}
"""
        
        with open(os.path.join(package_name, 'README.md'), 'w', encoding='utf-8') as f:
            f.write(readme_content)
        
        # تولید tar.gz
        tar_filename = f"{package_name}.tar.gz"
        with tarfile.open(tar_filename, 'w:gz') as tar:
            tar.add(package_name, arcname=package_name)
        
        # پاک کردن پوشه موقت
        shutil.rmtree(package_name)
        
        # محاسبه اندازه
        size = os.path.getsize(tar_filename) / (1024 * 1024)
        
        print(f"""
🎉 پکیج تمیز آماده شد!
📦 نام: {tar_filename}
📊 اندازه: {size:.2f} MB
✅ آماده برای دانلود و آپلود به VPS
        """)
        
        return tar_filename
        
    except Exception as e:
        print(f"❌ خطا: {e}")
        if os.path.exists(package_name):
            shutil.rmtree(package_name)
        return None

if __name__ == "__main__":
    create_clean_package()