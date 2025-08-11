@echo off
chcp 65001 > nul
title ربات تحلیل طلا - Gold Trading Bot

echo.
echo ====================================
echo     ربات تحلیل طلا
echo     Gold Trading Bot
echo ====================================
echo.

cd /d "%~dp0"

REM بررسی وجود محیط مجازی
if not exist "venv" (
    echo ❌ محیط مجازی یافت نشد. لطفاً ابتدا install.py را اجرا کنید
    echo ❌ Virtual environment not found. Please run install.py first
    pause
    exit /b 1
)

REM بررسی وجود فایل .env
if not exist ".env" (
    echo ⚠️  فایل .env یافت نشد. از .env.example کپی می‌شود...
    echo ⚠️  .env file not found. Copying from .env.example...
    copy ".env.example" ".env" > nul
    echo ✅ فایل .env ایجاد شد. لطفاً تنظیمات خود را وارد کنید
    echo ✅ .env file created. Please enter your settings
    notepad .env
)

echo 🚀 در حال راه‌اندازی ربات...
echo 🚀 Starting bot...
echo.

REM فعال‌سازی محیط مجازی و اجرای برنامه
call venv\Scripts\activate.bat
python main.py

if %errorlevel% neq 0 (
    echo.
    echo ❌ خطا در اجرای برنامه
    echo ❌ Error running application
    pause
) else (
    echo.
    echo ✅ برنامه بسته شد
    echo ✅ Application closed
)

pause