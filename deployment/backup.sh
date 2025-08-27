#!/bin/bash

# Script برای بک‌آپ سیستم طلا و ارز
# استفاده: ./backup.sh [backup_name]

BACKUP_NAME=${1:-"backup_$(date +%Y%m%d_%H%M%S)"}
PROJECT_DIR="/home/goldbot/gold-analysis-system"
BACKUP_DIR="/home/goldbot/backups"

echo "🔄 شروع بک‌آپ سیستم..."

# ایجاد دایرکتوری بک‌آپ
mkdir -p $BACKUP_DIR

# متوقف کردن موقت PM2
pm2 stop goldbot

# بک‌آپ فایل‌های مهم
echo "📦 بک‌آپ فایل‌ها..."
tar -czf "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" \
  -C $PROJECT_DIR \
  database.sqlite \
  .env \
  attached_assets/ \
  server/bots/ \
  --exclude="node_modules" \
  --exclude="logs" \
  --exclude="*.log"

# بک‌آپ تنظیمات سیستم
echo "⚙️ بک‌آپ تنظیمات..."
cp /etc/nginx/sites-available/goldbot "$BACKUP_DIR/${BACKUP_NAME}_nginx.conf"

# ری‌استارت PM2
pm2 start goldbot

echo "✅ بک‌آپ کامل شد: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
echo "📊 اندازه فایل: $(du -h $BACKUP_DIR/${BACKUP_NAME}.tar.gz | cut -f1)"