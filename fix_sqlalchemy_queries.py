#!/usr/bin/env python3
"""
رفع تمام کوئری‌های SQLAlchemy که مشکل "Column expression, FROM clause" دارند
"""

import os
import re

def fix_sqlalchemy_queries():
    """رفع کوئری‌های SQLAlchemy در تمام فایل‌ها"""
    
    files_to_check = [
        'routes.py',
        'routes_admin.py', 
        'services/bot_monitoring_service.py',
        'services/analysis_service.py',
        'services/scheduler_service.py'
    ]
    
    # الگوی db.session.query() که باید تبدیل شود
    pattern = r'db\.session\.query\((\w+)\)'
    replacement = r'\1.query'
    
    fixed_files = []
    
    for file_path in files_to_check:
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # جستجو برای الگوی مشکل‌دار
                if 'db.session.query(' in content:
                    print(f"🔧 رفع کوئری‌های SQLAlchemy در {file_path}")
                    
                    # تبدیل کوئری‌ها
                    new_content = re.sub(pattern, replacement, content)
                    
                    # ذخیره فایل
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    
                    fixed_files.append(file_path)
                    print(f"✅ {file_path}")
                else:
                    print(f"⚪ {file_path} - بدون مشکل")
                    
            except Exception as e:
                print(f"❌ خطا در {file_path}: {e}")
    
    if fixed_files:
        print(f"\n🎉 تعداد {len(fixed_files)} فایل رفع شد:")
        for file in fixed_files:
            print(f"  - {file}")
    else:
        print("\n✅ همه فایل‌ها بدون مشکل هستند!")

if __name__ == "__main__":
    fix_sqlalchemy_queries()