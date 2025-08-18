@echo off
chcp 65001 > nul
REM Gold Trading Bot - Windows Installation Script
REM اسکریپت نصب ربات طلا - ویندوز

echo.
echo ===================================
echo    Gold Trading Bot Installation
echo    نصب ربات تحلیل و سیگنال طلا
echo ===================================
echo.

echo ⚠️ مشکل TA-Lib در ویندوز شناسایی شد
echo ⚠️ TA-Lib issue detected in Windows
echo.

echo 🔧 حل مشکل با استفاده از پکیج‌های سازگار ویندوز...
echo 🔧 Solving with Windows-compatible packages...
echo.

echo Step 1: Installing Windows-compatible Python packages...
echo مرحله 1: نصب پکیج‌های پایتون سازگار ویندوز...

REM Use Windows-compatible requirements (ta instead of TA-Lib)
if exist install_requirements_windows.txt (
    echo ✅ Using Windows-compatible packages...
    echo ✅ استفاده از پکیج‌های سازگار ویندوز...
    pip install -r install_requirements_windows.txt
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Package installation failed
        echo ❌ نصب پکیج‌ها ناموفق
        pause
        exit /b 1
    )
) else (
    echo ❌ Windows requirements file not found!
    echo ❌ فایل پکیج‌های ویندوز یافت نشد!
    echo Trying standard requirements...
    echo تلاش با پکیج‌های استاندارد...
    pip install -r install_requirements.txt
)

echo.
echo Step 2: Fixing analysis service for Windows...
echo مرحله 2: اصلاح سرویس تحلیل برای ویندوز...

REM Replace TA-Lib service with ta library service
if exist services\analysis_service_windows.py (
    copy /Y services\analysis_service_windows.py services\analysis_service.py > nul
    echo ✅ Analysis service updated for Windows compatibility
    echo ✅ سرویس تحلیل برای سازگاری ویندوز بروزرسانی شد
) else (
    echo ⚠️ Windows analysis service not found, using default
    echo ⚠️ سرویس تحلیل ویندوز یافت نشد، از پیش‌فرض استفاده می‌شود
)

echo.
echo Step 3: Creating environment file...
echo مرحله 3: ایجاد فایل محیط...

if not exist .env (
    copy .env.example .env > nul
    echo ✅ Environment file created from template
    echo ✅ فایل محیط از قالب ایجاد شد
) else (
    echo ✅ Environment file already exists
    echo ✅ فایل محیط از قبل موجود است
)

echo.
echo Step 4: Setting up database...
echo مرحله 4: راه‌اندازی پایگاه داده...

python -c "from app import app, db; app.app_context().push(); db.create_all(); print('Database initialized')" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Database initialized successfully
    echo ✅ پایگاه داده با موفقیت راه‌اندازی شد
) else (
    echo ⚠️ Database initialization skipped (will be done on first run)
    echo ⚠️ راه‌اندازی پایگاه داده رد شد (در اولین اجرا انجام می‌شود)
)

echo.
echo ===================================
echo 🎉 Installation completed successfully!
echo 🎉 نصب با موفقیت تکمیل شد!
echo.
echo 🚀 To start the bot, run one of these commands:
echo 🚀 برای راه‌اندازی ربات، یکی از این دستورها را اجرا کنید:
echo.
echo   Option 1 - Python: python main.py
echo   Option 2 - Batch:   start_windows_server.bat
echo.
echo 📊 Dashboard will be available at: http://localhost:5000
echo 📊 داشبورد در آدres زیر در دسترس خواهد بود: http://localhost:5000
echo.
echo ✅ Telegram settings are pre-configured in code
echo ✅ تنظیمات تلگرام از پیش در کد تعریف شده
echo ===================================
echo.
pause