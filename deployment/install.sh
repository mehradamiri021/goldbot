#!/bin/bash

# رنگ‌ها برای نمایش بهتر
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 شروع نصب سیستم جامع تحلیل طلا و ارز${NC}"
echo "=================================================="

# تابع برای نمایش پیام‌ها
print_status() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# چک کردن سیستم عامل
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    print_error "این اسکریپت فقط برای Linux طراحی شده است"
    exit 1
fi

# چک کردن دسترسی sudo
if ! sudo -n true 2>/dev/null; then
    print_error "نیاز به دسترسی sudo"
    exit 1
fi

print_status "شروع آپدیت سیستم..."
sudo apt update && sudo apt upgrade -y

print_status "نصب پکیج‌های مورد نیاز..."
sudo apt install -y curl wget unzip git nginx ufw

# نصب Node.js
if ! command -v node &> /dev/null; then
    print_status "نصب Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    print_warning "Node.js قبلاً نصب شده"
fi

# نصب PM2
if ! command -v pm2 &> /dev/null; then
    print_status "نصب PM2..."
    sudo npm install -g pm2
else
    print_warning "PM2 قبلاً نصب شده"
fi

# ایجاد کاربر goldbot اگر وجود ندارد
if ! id "goldbot" &>/dev/null; then
    print_status "ایجاد کاربر goldbot..."
    sudo adduser --disabled-password --gecos "" goldbot
    sudo usermod -aG sudo goldbot
else
    print_warning "کاربر goldbot قبلاً وجود دارد"
fi

# ایجاد دایرکتوری پروژه
PROJECT_DIR="/home/goldbot/gold-analysis-system"
sudo mkdir -p $PROJECT_DIR
sudo mkdir -p $PROJECT_DIR/logs

# کپی فایل‌ها (فرض بر این است که فایل‌ها در دایرکتوری جاری هستند)
print_status "کپی فایل‌های پروژه..."
sudo cp -r * $PROJECT_DIR/
sudo chown -R goldbot:goldbot $PROJECT_DIR

# تنظیم دسترسی‌ها
sudo chmod +x $PROJECT_DIR/deployment/install.sh

# رفتن به دایرکتوری پروژه
cd $PROJECT_DIR

print_status "نصب dependencies..."
sudo -u goldbot npm install

# ایجاد فایل .env اگر وجود ندارد
if [ ! -f .env ]; then
    print_status "ایجاد فایل .env..."
    sudo -u goldbot cp .env.example .env
    print_warning "لطفاً فایل .env را ویرایش کنید: nano .env"
fi

# ساخت پروژه
print_status "ساخت پروژه..."
sudo -u goldbot npm run build 2>/dev/null || print_warning "Build script not found, skipping..."

# تنظیم فایروال
print_status "تنظیم فایروال..."
sudo ufw --force enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5000

# تنظیم Nginx
print_status "تنظیم Nginx..."
sudo tee /etc/nginx/sites-available/goldbot > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# فعال کردن سایت Nginx
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/goldbot /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# راه‌اندازی PM2
print_status "راه‌اندازی PM2..."
sudo -u goldbot pm2 start ecosystem.config.js
sudo -u goldbot pm2 save

# تنظیم PM2 برای شروع خودکار
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u goldbot --hp /home/goldbot

# تنظیم بک‌آپ خودکار
print_status "تنظیم بک‌آپ خودکار..."
(sudo -u goldbot crontab -l 2>/dev/null; echo "0 2 * * * cd $PROJECT_DIR && cp database.sqlite backup_\$(date +\\%Y\\%m\\%d).sqlite") | sudo -u goldbot crontab -

print_status "تنظیم مجوزها..."
sudo systemctl enable nginx
sudo systemctl enable pm2-goldbot

echo ""
echo -e "${GREEN}🎉 نصب با موفقیت کامل شد!${NC}"
echo "=================================================="
echo -e "${BLUE}اطلاعات دسترسی:${NC}"
echo "- آدرس پنل: http://$(curl -s ifconfig.me):80"
echo "- آدرس مستقیم: http://$(curl -s ifconfig.me):5000"
echo "- کاربر سیستم: goldbot"
echo "- دایرکتوری پروژه: $PROJECT_DIR"
echo ""
echo -e "${YELLOW}مراحل بعدی:${NC}"
echo "1. ویرایش فایل .env: sudo nano $PROJECT_DIR/.env"
echo "2. ری‌استارت سرویس: sudo -u goldbot pm2 restart goldbot"
echo "3. چک وضعیت: sudo -u goldbot pm2 status"
echo "4. مشاهده لاگ‌ها: sudo -u goldbot pm2 logs goldbot"
echo ""
echo -e "${GREEN}سیستم آماده استفاده است! 🚀${NC}"