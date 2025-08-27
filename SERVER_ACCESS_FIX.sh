#!/bin/bash

# 🌐 حل مشکل دسترسی به سرور از IP خارجی
# =============================================

print_success() { echo -e "✅ $1"; }
print_warning() { echo -e "⚠️  $1"; }
print_error() { echo -e "❌ $1"; }

echo "🌐 حل مشکل دسترسی سرور goldbot"
echo "============================="

cd $HOME/goldbot

# 1. تصحیح server/index.ts برای bind کردن به 0.0.0.0
print_warning "تصحیح تنظیمات سرور..."
cat > server/index.ts << 'SERVER_INDEX'
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(join(__dirname, '../client')));

// Mock API endpoints
app.get('/api/prices', (req, res) => {
  res.json({
    usd: 100200,
    eur: 116470,
    cad: 72560,
    aed: 27546,
    bitcoin: 64150000,
    ethereum: 249000,
    tether: 100200,
    gold18k: 3892000,
    coin: 42450000,
    lastUpdated: new Date().toISOString()
  });
});

app.get('/api/bots/status', (req, res) => {
  res.json([
    {
      id: 1,
      botName: 'analysis-bot',
      status: 'فعال',
      lastActivity: new Date().toISOString()
    },
    {
      id: 2,
      botName: 'signal-bot',
      status: 'فعال',
      lastActivity: new Date().toISOString()
    },
    {
      id: 3,
      botName: 'price-bot',
      status: 'فعال',
      lastActivity: new Date().toISOString()
    }
  ]);
});

app.get('/api/signals/today', (req, res) => {
  res.json([]);
});

app.get('/api/signals/pending', (req, res) => {
  res.json([]);
});

app.get('/api/news', (req, res) => {
  res.json([]);
});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../client/index.html'));
});

// استفاده از 0.0.0.0 برای دسترسی از IP خارجی
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔶 goldbot سرور روی پورت ${PORT} راه‌اندازی شد`);
  console.log(`🌐 دسترسی محلی: http://localhost:${PORT}`);
  console.log(`🌐 دسترسی خارجی: http://YOUR_SERVER_IP:${PORT}`);
  console.log(`📁 مسیر: ${__dirname}`);
});
SERVER_INDEX

# 2. بررسی و باز کردن پورت 5000
print_warning "بررسی پورت 5000..."

# توقف فرآیندهای قبلی
pkill -f "server/index.ts" 2>/dev/null || true
if command -v pm2 &> /dev/null; then
    pm2 stop goldbot 2>/dev/null || true
fi
if [ -f "node_modules/.bin/pm2" ]; then
    node_modules/.bin/pm2 stop goldbot 2>/dev/null || true
fi

# بررسی firewall
if command -v ufw &> /dev/null; then
    print_warning "تنظیم UFW firewall..."
    sudo ufw allow 5000/tcp 2>/dev/null || print_warning "نتوانست UFW را تنظیم کند - ممکن است نیاز به sudo باشد"
fi

if command -v iptables &> /dev/null; then
    print_warning "بررسی iptables..."
    sudo iptables -A INPUT -p tcp --dport 5000 -j ACCEPT 2>/dev/null || print_warning "نتوانست iptables را تنظیم کند"
fi

# 3. تصحیح فایل start.sh
print_warning "تصحیح start.sh..."
cat > start.sh << 'START_SCRIPT'
#!/bin/bash

echo "🚀 راه‌اندازی goldbot..."
echo "======================"

# بررسی پورت
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  پورت 5000 در حال استفاده، آزاد می‌کنم..."
    pkill -f "server/index.ts"
    sleep 2
fi

# راه‌اندازی
echo "✅ شروع سرور..."
cd $HOME/goldbot

if [ -f "node_modules/.bin/tsx" ]; then
    echo "✅ استفاده از tsx محلی..."
    node_modules/.bin/tsx server/index.ts
elif command -v npx &> /dev/null; then
    echo "✅ استفاده از npx tsx..."
    npx tsx server/index.ts
else
    echo "❌ tsx موجود نیست"
    exit 1
fi
START_SCRIPT

chmod +x start.sh

# 4. تصحیح start-pm2.sh
print_warning "تصحیح start-pm2.sh..."
cat > start-pm2.sh << 'START_PM2_SCRIPT'
#!/bin/bash

echo "🚀 راه‌اندازی goldbot با PM2..."
echo "=============================="

cd $HOME/goldbot

# نصب PM2 محلی
if [ ! -f "node_modules/.bin/pm2" ]; then
    echo "⚠️  نصب PM2 محلی..."
    npm install pm2
fi

echo "✅ راه‌اندازی با PM2..."

# توقف قبلی
node_modules/.bin/pm2 stop goldbot 2>/dev/null || true
node_modules/.bin/pm2 delete goldbot 2>/dev/null || true

# راه‌اندازی جدید
node_modules/.bin/pm2 start server/index.ts --name goldbot --interpreter node_modules/.bin/tsx

echo "📋 دستورات PM2:"
echo "   ./pm2-status.sh    # وضعیت"
echo "   ./pm2-logs.sh      # لاگ‌ها"  
echo "   ./pm2-stop.sh      # توقف"
START_PM2_SCRIPT

chmod +x start-pm2.sh

# 5. دریافت IP سرور
print_warning "دریافت IP سرور..."
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || hostname -I | awk '{print $1}')

print_success "تنظیمات سرور تصحیح شد"

echo ""
echo "🌐 اطلاعات دسترسی:"
echo "=================="
echo "📍 IP سرور: $SERVER_IP"
echo "🔗 لینک دسترسی: http://$SERVER_IP:5000"
echo "🏠 دسترسی محلی: http://localhost:5000"
echo ""

print_warning "راه‌اندازی مجدد سرور..."
timeout 5s ./start.sh &
sleep 3

if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null; then
    print_success "✅ سرور فعال شد!"
    echo "🌐 دسترسی: http://$SERVER_IP:5000"
    pkill -f "server/index.ts" 2>/dev/null || true
else
    print_warning "سرور راه‌اندازی نشد، لطفاً دستی اجرا کنید:"
    echo "   ./start.sh"
fi

echo ""
echo "📋 دستورات مفید:"
echo "   ./start.sh         # راه‌اندازی ساده"
echo "   ./start-pm2.sh     # راه‌اندازی PM2"
echo "   ./pm2-status.sh    # وضعیت PM2"
echo ""

print_success "🎉 تنظیمات دسترسی کامل شد!"
echo "🔗 لینک نهایی: http://$SERVER_IP:5000"