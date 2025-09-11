#!/bin/bash

# 🚀 GOLDBOT نصب ساده و مطمئن
# استفاده: sudo bash SIMPLE_INSTALL.sh

set -e

# رنگ‌ها
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🔥 شروع نصب GOLDBOT...${NC}"

# 1. بررسی root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ لطفاً با sudo اجرا کنید${NC}"
   exit 1
fi

echo -e "${BLUE}📌 مرحله 1: پاکسازی${NC}"
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true
rm -rf /root/goldbot* 2>/dev/null || true

echo -e "${BLUE}📌 مرحله 2: نصب Node.js و پیش‌نیازها${NC}"
# نصب Node.js 20 اگر نصب نیست
if ! command -v node &> /dev/null || [[ $(node -v | cut -d. -f1 | tr -d v) -lt 18 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

apt-get update
apt-get install -y git curl nginx

echo -e "${BLUE}📌 مرحله 3: نصب PM2${NC}"
npm install -g pm2 tsx

echo -e "${BLUE}📌 مرحله 4: بررسی فایل‌ها${NC}"
if [ ! -f "goldbot.tar.gz" ]; then
    echo -e "${RED}❌ فایل goldbot.tar.gz یافت نشد!${NC}"
    echo -e "${BLUE}لطفاً فایل goldbot.tar.gz را در همین پوشه قرار دهید${NC}"
    exit 1
fi

echo -e "${BLUE}📌 مرحله 5: استخراج فایل‌ها${NC}"
tar -xzf goldbot.tar.gz
cd goldbot

echo -e "${BLUE}📌 مرحله 6: نصب dependencies${NC}"
npm install --production

echo -e "${BLUE}📌 مرحله 7: ایجاد فایل‌های MT5${NC}"
mkdir -p "/root/.wine/drive_c/Program Files/Capitalxtend LLC MT5 Terminal/MQL5/Files"
cat > "/root/.wine/drive_c/Program Files/Capitalxtend LLC MT5 Terminal/MQL5/Files/goldbot_XAUUSD_PERIOD_M15.csv" << 'EOF'
Date,Time,Open,High,Low,Close,Volume
2024-09-07,10:45:00,2496.50,2498.20,2495.10,2497.30,1250
EOF

echo -e "${BLUE}📌 مرحله 8: ایجاد تنظیمات PM2${NC}"
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'goldbot',
    script: 'tsx',
    args: 'server/index.ts',
    instances: 1,
    env: {
      NODE_ENV: 'production',
      PORT: '5000'
    }
  }]
};
EOF

echo -e "${BLUE}📌 مرحله 9: تنظیم nginx${NC}"
cat > /etc/nginx/sites-available/goldbot << 'EOF'
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/goldbot /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

echo -e "${BLUE}📌 مرحله 10: راه‌اندازی${NC}"
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo -e "${GREEN}✅ نصب کامل شد!${NC}"
echo -e "${GREEN}🌐 وب کنسول: http://$(curl -s ifconfig.me || echo 'YOUR-IP')${NC}"
echo -e "${GREEN}📊 وضعیت: pm2 status${NC}"
echo -e "${GREEN}📝 لاگ‌ها: pm2 logs goldbot${NC}"