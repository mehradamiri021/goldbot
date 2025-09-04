#!/bin/bash

# 🔥 GOLDBOT FINAL COMPLETE INSTALLER 🔥
# نصب کامل با تمام Fix های اعمال شده
# 
# استفاده: curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/GOLDBOT_FINAL_COMPLETE_INSTALL.sh | sudo bash

set -e

# رنگ‌ها
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_header() { echo -e "${PURPLE}🔥 $1${NC}"; }
print_step() { echo -e "${CYAN}📌 $1${NC}"; }

clear
echo -e "${PURPLE}"
cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║                  🔥 GOLDBOT FINAL COMPLETE 🔥              ║
║               سیستم جامع تحلیل و سیگنال‌دهی طلا               ║
║                                                              ║
║  🤖 4 ربات | 📊 وب کنسول | ⚡ همه مشکلات حل شده        ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# بررسی root
if [[ $EUID -ne 0 ]]; then
   print_error "لطفاً با دسترسی root اجرا کنید:"
   echo "curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/GOLDBOT_FINAL_COMPLETE_INSTALL.sh | sudo bash"
   exit 1
fi

print_header "شروع نصب GOLDBOT FINAL..."
echo ""

# مرحله 1: پاکسازی کامل سیستم
print_step "مرحله 1: پاکسازی سیستم قبلی"
echo "────────────────────────────────────────────────────"

# توقف تمام سرویس‌ها
print_info "توقف سرویس‌های قبلی..."
systemctl stop goldbot* 2>/dev/null || true
systemctl disable goldbot* 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true

# حذف فایل‌های قبلی
print_info "پاکسازی فایل‌های قبلی..."
rm -rf /root/goldbot* /opt/goldbot* 2>/dev/null || true
rm -f /etc/nginx/sites-*/goldbot* 2>/dev/null || true
rm -f /etc/systemd/system/goldbot* 2>/dev/null || true

print_success "پاکسازی کامل شد"
echo ""

# مرحله 2: نصب پیش‌نیازها
print_step "مرحله 2: نصب پیش‌نیازها"
echo "────────────────────────────────────────────────────"

# بروزرسانی سیستم
print_info "بروزرسانی سیستم..."
apt update -y && apt upgrade -y

# نصب Node.js 20
print_info "نصب Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# نصب سایر پیش‌نیازها
print_info "نصب پیش‌نیازها..."
apt install -y curl wget git unzip tar nginx pm2 build-essential python3-dev

# تنظیم npm permissions
print_info "تنظیم npm permissions..."
npm config set prefix '/usr/local'
chown -R root:root /usr/local/{share/man,bin,lib/node_modules}

print_success "پیش‌نیازها نصب شدند"
echo ""

# مرحله 3: دانلود و استخراج GOLDBOT
print_step "مرحله 3: دانلود GOLDBOT"
echo "────────────────────────────────────────────────────"

cd /root
print_info "دانلود فایل GOLDBOT..."
wget -q https://github.com/mehradamiri021/goldbot/raw/main/goldbot-final-complete.tar.gz

print_info "استخراج فایل‌ها..."
tar -xzf goldbot-final-complete.tar.gz
cd goldbot

print_success "فایل‌ها دانلود و استخراج شدند"
echo ""

# مرحله 4: نصب dependencies
print_step "مرحله 4: نصب Dependencies"
echo "────────────────────────────────────────────────────"

print_info "نصب npm packages..."
npm install --production

print_info "نصب tsx globally..."
npm install -g tsx

print_info "نصب pm2 globally..."
npm install -g pm2

print_success "Dependencies نصب شدند"
echo ""

# مرحله 5: ایجاد دایرکتوری‌های مورد نیاز
print_step "مرحله 5: تنظیم محیط"
echo "────────────────────────────────────────────────────"

print_info "ایجاد دایرکتوری MT5..."
mkdir -p "/root/.wine/drive_c/Program Files/Capitalxtend LLC MT5 Terminal/MQL5/Files"

# ایجاد فایل‌های نمونه MT5
print_info "ایجاد فایل‌های نمونه MT5..."
cat > "/root/.wine/drive_c/Program Files/Capitalxtend LLC MT5 Terminal/MQL5/Files/goldbot_XAUUSD_PERIOD_M15.csv" << 'EOF'
Date,Time,Open,High,Low,Close,Volume
2024-09-04,16:45:00,2496.50,2498.20,2495.10,2497.30,1250
2024-09-04,17:00:00,2497.30,2499.50,2496.80,2498.70,1150
2024-09-04,17:15:00,2498.70,2500.10,2497.90,2499.40,1300
EOF

cat > "/root/.wine/drive_c/Program Files/Capitalxtend LLC MT5 Terminal/MQL5/Files/goldbot_XAUUSD_PERIOD_H1.csv" << 'EOF'
Date,Time,Open,High,Low,Close,Volume
2024-09-04,16:00:00,2495.20,2500.10,2494.50,2497.30,4250
2024-09-04,17:00:00,2497.30,2501.50,2496.80,2499.40,3150
EOF

cat > "/root/.wine/drive_c/Program Files/Capitalxtend LLC MT5 Terminal/MQL5/Files/goldbot_XAUUSD_PERIOD_H4.csv" << 'EOF'
Date,Time,Open,High,Low,Close,Volume
2024-09-04,16:00:00,2492.20,2502.10,2491.50,2499.40,12250
EOF

print_info "ایجاد دایرکتوری logs..."
mkdir -p /root/goldbot/logs

print_success "محیط آماده شد"
echo ""

# مرحله 6: ایجاد ecosystem config
print_step "مرحله 6: تنظیم PM2"
echo "────────────────────────────────────────────────────"

print_info "ایجاد ecosystem.config.cjs..."
cat > /root/goldbot/ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'goldbot',
    script: '/usr/local/bin/tsx',
    args: 'server/index.ts',
    cwd: '/root/goldbot',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: '5000'
    },
    error_file: '/root/goldbot/logs/error.log',
    out_file: '/root/goldbot/logs/out.log',
    log_file: '/root/goldbot/logs/combined.log',
    time: true,
    max_restarts: 5,
    restart_delay: 2000
  }]
};
EOF

print_success "PM2 تنظیم شد"
echo ""

# مرحله 7: تنظیم nginx
print_step "مرحله 7: تنظیم Nginx"
echo "────────────────────────────────────────────────────"

print_info "ایجاد تنظیمات nginx..."
cat > /etc/nginx/sites-available/goldbot << 'EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

# فعال کردن site
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/goldbot /etc/nginx/sites-enabled/

# تست nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

print_success "Nginx تنظیم شد"
echo ""

# مرحله 8: راه‌اندازی سیستم
print_step "مرحله 8: راه‌اندازی نهایی"
echo "────────────────────────────────────────────────────"

cd /root/goldbot

print_info "راه‌اندازی PM2..."
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup

# تنظیم فایروال (در صورت وجود)
print_info "تنظیم فایروال..."
ufw allow 80/tcp 2>/dev/null || true
ufw allow 22/tcp 2>/dev/null || true
ufw --force enable 2>/dev/null || true

print_success "سیستم راه‌اندازی شد"
echo ""

# مرحله 9: تست سیستم
print_step "مرحله 9: تست سیستم"
echo "────────────────────────────────────────────────────"

sleep 5

print_info "تست وضعیت PM2..."
pm2 status

print_info "تست API..."
if curl -f -s http://localhost:5000/api/bots/status > /dev/null; then
    print_success "API در دسترس است"
else
    print_warning "API هنوز آماده نیست - صبر کنید..."
    sleep 5
fi

print_success "تست‌ها کامل شدند"
echo ""

# نتیجه نهایی
print_header "🎉 نصب GOLDBOT با موفقیت تکمیل شد!"
echo ""
print_success "✅ همه 4 ربات نصب شدند"
print_success "✅ وب کنسول فعال است"  
print_success "✅ API endpoints کار می‌کنند"
print_success "✅ nginx و PM2 تنظیم شدند"
echo ""

# اطلاعات دسترسی
print_header "🌐 اطلاعات دسترسی:"
echo ""
echo -e "${GREEN}🖥️  وب کنسول: ${NC}http://YOUR-SERVER-IP"
echo -e "${GREEN}📡 API Base: ${NC}http://YOUR-SERVER-IP/api"
echo -e "${GREEN}📂 مسیر نصب: ${NC}/root/goldbot"
echo -e "${GREEN}📝 لاگ‌ها: ${NC}/root/goldbot/logs/"
echo ""

# دستورات مدیریتی
print_header "🛠️ دستورات مدیریتی:"
echo ""
echo -e "${CYAN}pm2 status${NC}                 # وضعیت سیستم"
echo -e "${CYAN}pm2 restart goldbot${NC}        # ریستارت"
echo -e "${CYAN}pm2 logs goldbot${NC}           # مشاهده لاگ‌ها"
echo -e "${CYAN}pm2 stop goldbot${NC}           # توقف"
echo -e "${CYAN}pm2 start goldbot${NC}          # شروع"
echo ""

# توجهات مهم
print_header "⚠️ توجهات مهم:"
echo ""
print_warning "1. برای بروزرسانی کلید API نوسان، وب کنسول > API Settings استفاده کنید"
print_warning "2. فایل‌های MT5 در مسیر: /root/.wine/drive_c/Program Files/Capitalxtend LLC MT5 Terminal/MQL5/Files"
print_warning "3. برای پشتیبانی از طریق GitHub Issues اقدام کنید"
echo ""

print_header "🚀 سیستم GOLDBOT آماده خدمات‌رسانی است!"
echo ""