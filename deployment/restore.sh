#!/bin/bash

# Script برای بازیابی بک‌آپ سیستم
# استفاده: ./restore.sh backup_file.tar.gz

if [ -z "$1" ]; then
    echo "❌ استفاده: ./restore.sh backup_file.tar.gz"
    exit 1
fi

BACKUP_FILE="$1"
PROJECT_DIR="/home/goldbot/gold-analysis-system"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ فایل بک‌آپ یافت نشد: $BACKUP_FILE"
    exit 1
fi

echo "🔄 شروع بازیابی از: $BACKUP_FILE"

# متوقف کردن PM2
pm2 stop goldbot

# بک‌آپ فایل‌های فعلی
echo "💾 بک‌آپ فایل‌های فعلی..."
mv $PROJECT_DIR/database.sqlite $PROJECT_DIR/database.sqlite.old
mv $PROJECT_DIR/.env $PROJECT_DIR/.env.old

# بازیابی فایل‌ها
echo "📦 بازیابی فایل‌ها..."
tar -xzf "$BACKUP_FILE" -C $PROJECT_DIR

# ری‌استارت PM2
pm2 start goldbot

echo "✅ بازیابی کامل شد"
echo "📂 فایل‌های قدیمی در $PROJECT_DIR/*.old محفوظ شده‌اند"