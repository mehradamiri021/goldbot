#!/usr/bin/env python3
"""
رفع خطاهای DataFrame truth value ambiguous
"""
import sys
import os
sys.path.append('.')

def fix_dataframe_errors():
    """رفع خطاهای DataFrame در فایل‌های مختلف"""
    
    print("🔧 رفع خطاهای DataFrame...")
    
    # فایل‌های نیاز به رفع
    files_to_fix = [
        'services/analysis_service.py',
        'services/data_service.py',
        'services/chart_service.py'
    ]
    
    replacements = [
        # در analysis_service.py
        {
            'file': 'services/analysis_service.py',
            'old': 'if len(df) == 0:',
            'new': 'if df is None or df.empty:'
        },
        {
            'file': 'services/analysis_service.py', 
            'old': 'if not df:',
            'new': 'if df is None or df.empty:'
        },
        # در data_service.py
        {
            'file': 'services/data_service.py',
            'old': 'if len(df) == 0:',
            'new': 'if df is None or df.empty:'
        },
        {
            'file': 'services/data_service.py',
            'old': 'if not df:',
            'new': 'if df is None or df.empty:'
        },
        # در chart_service.py
        {
            'file': 'services/chart_service.py',
            'old': 'if not data:',
            'new': 'if data is None or data.empty:'
        }
    ]
    
    # اعمال تغییرات
    fixed_count = 0
    for fix in replacements:
        try:
            file_path = fix['file']
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if fix['old'] in content:
                    content = content.replace(fix['old'], fix['new'])
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"✅ رفع شد: {file_path}")
                    fixed_count += 1
                else:
                    print(f"⚠️ متن پیدا نشد: {file_path}")
            else:
                print(f"❌ فایل موجود نیست: {file_path}")
        except Exception as e:
            print(f"❌ خطا در {fix['file']}: {e}")
    
    print(f"\n🎉 {fixed_count} مورد رفع شد!")
    return fixed_count > 0

if __name__ == "__main__":
    success = fix_dataframe_errors()
    if success:
        print("✅ همه خطاها رفع شدند")
    else:
        print("⚠️ هیچ تغییری اعمال نشد")