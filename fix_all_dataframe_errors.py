#!/usr/bin/env python3
"""
رفع کامل خطاهای DataFrame truth value ambiguous
"""
import os
import sys
import re

def fix_dataframe_errors():
    """رفع تمام خطاهای DataFrame در پروژه"""
    
    print("🔧 شروع رفع خطاهای DataFrame...")
    
    # لیست فایل‌هایی که ممکن است مشکل داشته باشند
    files_to_check = [
        'services/scheduler_service.py',
        'services/analysis_service.py',
        'services/data_service.py',
        'services/chart_service.py',
        'services/telegram_service.py',
        'main.py'
    ]
    
    # الگوهای نیاز به رفع
    patterns_to_fix = [
        {
            'pattern': r'\bif\s+(\w+)\s+and\s+len\(',
            'replacement': r'if \1 is not None and len(',
            'description': 'رفع if data and len(data)'
        },
        {
            'pattern': r'\bif\s+not\s+(\w+)\.empty:',
            'replacement': r'if \1 is not None and not \1.empty:',
            'description': 'رفع if not df.empty'
        },
        {
            'pattern': r'\bif\s+(\w+):(?=\s*\n)',
            'replacement': r'if \1 is not None and len(\1) > 0:',
            'description': 'رفع if data: برای DataFrame'
        },
        {
            'pattern': r'\bif\s+not\s+(\w+):(?=\s*\n)',
            'replacement': r'if \1 is None or len(\1) == 0:',
            'description': 'رفع if not data: برای DataFrame'
        }
    ]
    
    fixed_count = 0
    
    for file_path in files_to_check:
        if not os.path.exists(file_path):
            continue
            
        print(f"📋 بررسی {file_path}...")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # اعمال الگوهای رفع
            for pattern_info in patterns_to_fix:
                matches = re.findall(pattern_info['pattern'], content)
                if matches:
                    content = re.sub(pattern_info['pattern'], pattern_info['replacement'], content)
                    print(f"  ✅ {pattern_info['description']} - {len(matches)} مورد")
                    fixed_count += len(matches)
            
            # ذخیره فایل اگر تغییری انجام شده
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"  💾 {file_path} ذخیره شد")
            else:
                print(f"  ⚠️ نیازی به تغییر نداشت")
                
        except Exception as e:
            print(f"  ❌ خطا در {file_path}: {e}")
    
    print(f"\n🎉 جمع کل: {fixed_count} مورد رفع شد!")
    
    # رفع‌های خاص دستی
    specific_fixes = [
        {
            'file': 'services/scheduler_service.py',
            'old': 'if data and len(data) > 0:',
            'new': 'if data is not None and len(data) > 0:'
        }
    ]
    
    for fix in specific_fixes:
        try:
            if os.path.exists(fix['file']):
                with open(fix['file'], 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if fix['old'] in content:
                    content = content.replace(fix['old'], fix['new'])
                    with open(fix['file'], 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"✅ رفع خاص: {fix['file']}")
                    fixed_count += 1
        except Exception as e:
            print(f"❌ خطا در رفع خاص {fix['file']}: {e}")
    
    return fixed_count > 0

if __name__ == "__main__":
    success = fix_dataframe_errors()
    if success:
        print("\n✅ همه خطاهای DataFrame رفع شدند!")
        print("🚀 سیستم آماده اجرا مجدد")
    else:
        print("\n⚠️ هیچ مشکلی پیدا نشد")