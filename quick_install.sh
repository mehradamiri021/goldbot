#!/bin/bash
# نصب سریع ربات طلا
# Quick Install Script for Gold Trading Bot

set -e

echo "🤖 نصب سریع ربات تحلیل طلا"
echo "================================"

# بررسی دسترسی root
if [[ $EUID -eq 0 ]]; then
   echo "❌ لطفاً این اسکریپت را با کاربر عادی اجرا کنید (نه root)"
   exit 1
fi

# بررسی وجود پایتون
if ! command -v python3 &> /dev/null; then
    echo "❌ پایتون 3 یافت نشد. لطفاً نصب کنید:"
    echo "   Ubuntu/Debian: sudo apt install python3 python3-pip"
    echo "   CentOS/RHEL: sudo yum install python3 python3-pip"
    exit 1
fi

echo "✅ پایتون یافت شد: $(python3 --version)"

# نصب پیش‌نیازها
echo "📦 نصب پیش‌نیازهای سیستم..."
if command -v apt &> /dev/null; then
    sudo apt update
    sudo apt install -y python3-pip python3-venv postgresql-client build-essential python3-dev libpq-dev curl git
elif command -v yum &> /dev/null; then
    sudo yum install -y python3-pip python3-devel postgresql-devel gcc curl git
elif command -v dnf &> /dev/null; then
    sudo dnf install -y python3-pip python3-devel postgresql-devel gcc curl git
else
    echo "⚠️ نتوانستم نوع سیستم‌عامل را تشخیص دهم"
fi

# ایجاد محیط مجازی
echo "🏗️ ایجاد محیط مجازی..."
python3 -m venv venv
source venv/bin/activate

# آپگرید pip
pip install --upgrade pip

# نصب پکیج‌های اصلی
echo "📚 نصب پکیج‌های پایتون..."
pip install flask flask-sqlalchemy psycopg2-binary python-telegram-bot pandas numpy plotly apscheduler pytz requests beautifulsoup4 gunicorn werkzeug

# تلاش برای نصب TA-Lib
echo "🔧 تلاش برای نصب TA-Lib..."
if pip install ta-lib; then
    echo "✅ TA-Lib نصب شد"
else
    echo "⚠️ TA-Lib نصب نشد - نصب pandas-ta به عنوان جایگزین..."
    pip install pandas-ta
fi

# اجرای تنظیم خودکار
echo "⚙️ شروع تنظیم خودکار..."
python3 auto_setup.py

echo "🎉 نصب کامل شد!"
echo "🚀 برای شروع: ./start.sh"