#!/bin/bash

# Script مانیتورینگ سیستم طلا و ارز
# استفاده: ./monitor.sh

PROJECT_DIR="/home/goldbot/gold-analysis-system"

echo "🖥️  مانیتور سیستم طلا و ارز"
echo "================================="
echo "📅 تاریخ: $(date)"
echo ""

# وضعیت PM2
echo "🤖 وضعیت PM2:"
pm2 status goldbot
echo ""

# استفاده منابع
echo "💻 استفاده منابع:"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}')"
echo "RAM: $(free -h | awk 'NR==2{printf "%.1f/%.1f GB (%.2f%%)\n", $3/1024, $2/1024, $3*100/$2 }')"
echo "Disk: $(df -h $PROJECT_DIR | awk 'NR==2{printf "%s/%s (%s)\n", $3, $2, $5}')"
echo ""

# وضعیت شبکه
echo "🌐 وضعیت شبکه:"
echo "Port 5000: $(netstat -tlnp | grep :5000 | wc -l) connection(s)"
echo "Port 80: $(netstat -tlnp | grep :80 | wc -l) connection(s)"
echo ""

# اندازه لاگ‌ها
echo "📄 اندازه لاگ‌ها:"
if [ -d "$PROJECT_DIR/logs" ]; then
    ls -lah $PROJECT_DIR/logs/
else
    echo "دایرکتوری لاگ وجود ندارد"
fi
echo ""

# اندازه دیتابیس
echo "🗄️  اندازه دیتابیس:"
if [ -f "$PROJECT_DIR/database.sqlite" ]; then
    ls -lah $PROJECT_DIR/database.sqlite
else
    echo "فایل دیتابیس یافت نشد"
fi
echo ""

# تست سلامت
echo "🏥 تست سلامت API:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/bots/status)
if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ API سالم است (HTTP $HTTP_CODE)"
else
    echo "❌ مشکل در API (HTTP $HTTP_CODE)"
fi

# آخرین بک‌آپ
echo ""
echo "💾 آخرین بک‌آپ:"
if [ -d "/home/goldbot/backups" ]; then
    ls -lat /home/goldbot/backups/ | head -3
else
    echo "هیچ بک‌آپی یافت نشد"
fi