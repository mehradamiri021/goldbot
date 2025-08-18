# 📦 نحوه نصب تغییرات در گیت‌هاب
## Installation Instructions for GitHub

## مرحله 1: دانلود فایل zip
فایل `goldbot_mt5_fixes_20250817.zip` را دانلود کنید.

## مرحله 2: استخراج فایل‌ها
```bash
unzip goldbot_mt5_fixes_20250817.zip -d fixes/
```

## مرحله 3: جایگزینی فایل‌ها در گیت‌هاب

### الف) فایل‌های services (جایگزینی):
```bash
cp fixes/services/mt5_csv_reader.py services/
cp fixes/services/scheduler_service.py services/
cp fixes/services/telegram_service.py services/
cp fixes/services/bot_monitoring_service.py services/
```

### ب) فایل models.py (جایگزینی):
```bash
cp fixes/models.py .
```

### ج) فایل‌های جدید (اضافه):
```bash
cp fixes/fix_mt5_server_issues.py .
cp fixes/SERVER_DEPLOYMENT_GUIDE.md .
cp fixes/start_server_fixed.sh .
cp fixes/CHANGED_FILES_SUMMARY.md .
```

## مرحله 4: Commit و Push
```bash
git add services/mt5_csv_reader.py services/scheduler_service.py services/telegram_service.py services/bot_monitoring_service.py models.py
git add fix_mt5_server_issues.py SERVER_DEPLOYMENT_GUIDE.md start_server_fixed.sh CHANGED_FILES_SUMMARY.md

git commit -m "🔧 Fix MT5 server integration - Complete solution

- Fixed CSV header detection for Wine MT5 installation
- Fixed get_gold_data function signatures  
- Fixed database model compatibility
- Added complete server deployment guide
- Created optimized startup scripts"

git push origin main
```

## ✅ تست نهایی
پس از آپلود، این دستور را در سرور اجرا کنید:
```bash
python fix_mt5_server_issues.py
```

باید همه تست‌ها موفق باشند!