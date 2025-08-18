#!/bin/bash

# GoldBot v2.1 - Quick Server Update Script
echo "🔧 آپدیت سریع سرور GoldBot v2.1"
echo "================================="

# Check if backup directory exists
if [ ! -d "goldbot_backup_$(date +%Y%m%d)" ]; then
    echo "📁 ایجاد بک‌آپ..."
    cp -r goldbot goldbot_backup_$(date +%Y%m%d)
    echo "✅ بک‌آپ ایجاد شد: goldbot_backup_$(date +%Y%m%d)"
fi

# Stop running process
echo "⏹️ متوقف کردن پردازش فعلی..."
pkill -f "python.*main.py" || true
pkill -f "gunicorn.*main" || true
sleep 2

echo "🔄 کپی فایل‌های فیکس شده..."

# Copy fixed files
cp main.py goldbot/
cp routes.py goldbot/
cp -r services/ goldbot/

echo "✅ فایل‌های فیکس شده کپی شدند"

# Start the bot
echo "🚀 راه‌اندازی مجدد ربات..."
cd goldbot

# Try with gunicorn first (production)
if command -v gunicorn >/dev/null 2>&1; then
    echo "🔄 استفاده از Gunicorn..."
    gunicorn --bind 0.0.0.0:5000 --reuse-port --reload --daemon main:app
    echo "✅ Gunicorn started"
else
    # Fallback to Python
    echo "🔄 استفاده از Python..."
    nohup python main.py > ../goldbot_server.log 2>&1 &
    echo "✅ Python started"
fi

sleep 3

# Test the application
echo "🧪 تست اپلیکیشن..."
curl -s http://localhost:5000/api/live_status | head -c 100
echo ""

echo ""
echo "✅ آپدیت کامل شد!"
echo "🌐 دسترسی: http://your-server-ip:5000"
echo "📋 لاگ: tail -f goldbot_server.log"