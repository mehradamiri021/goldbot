#!/bin/bash

# 🔶 نصب goldbot بدون نیاز به SUDO
# =================================

print_success() { echo -e "✅ $1"; }
print_warning() { echo -e "⚠️  $1"; }
print_error() { echo -e "❌ $1"; }

echo "🔶 نصب goldbot - بدون نیاز به sudo"
echo "=================================="

# 1. پاک‌سازی
print_warning "پاک‌سازی کامل..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true
pkill -f "server/index.ts" 2>/dev/null || true
rm -rf $HOME/goldbot

# 2. ایجاد ساختار پروژه
print_warning "ایجاد ساختار پروژه..."
mkdir -p $HOME/goldbot/{server,client/{src,public},logs}
cd $HOME/goldbot

# 3. بررسی فایل‌های MT5
print_warning "بررسی فایل‌های MT5..."
MT5_PATH="/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files"
if [ -d "$MT5_PATH" ]; then
    print_success "پوشه MT5: $MT5_PATH"
    ls -la "$MT5_PATH" | grep XAUUSD || print_warning "فایل‌های MT5 یافت نشدند"
else
    print_warning "پوشه MT5 یافت نشد: $MT5_PATH"
fi

# 4. package.json با npx
print_warning "ایجاد package.json..."
cat > package.json << 'PACKAGE_JSON'
{
  "name": "goldbot",
  "version": "3.0.0",
  "description": "سیستم جامع تحلیل طلا و ارز",
  "main": "server/index.ts",
  "scripts": {
    "dev": "npx tsx server/index.ts",
    "start": "node --loader tsx/esm server/index.ts",
    "direct": "npx tsx server/index.ts",
    "build": "npx tsc",
    "install-pm2": "npm install pm2",
    "pm2:start": "npx pm2 start server/index.ts --name goldbot --interpreter npx --interpreter-args 'tsx'",
    "pm2:stop": "npx pm2 stop goldbot",
    "pm2:restart": "npx pm2 restart goldbot",
    "pm2:logs": "npx pm2 logs goldbot",
    "pm2:status": "npx pm2 status"
  },
  "type": "module",
  "dependencies": {
    "express": "^4.18.2",
    "node-cron": "^3.0.2",
    "cheerio": "^1.0.0-rc.12",
    "csv-parse": "^5.4.0",
    "multer": "^1.4.5-lts.1",
    "axios": "^1.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "pm2": "^5.3.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.0.0",
    "@types/multer": "^1.4.7",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
PACKAGE_JSON

# 5. ایجاد start.sh
print_warning "ایجاد start.sh..."
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

# 6. ایجاد start-pm2.sh
print_warning "ایجاد start-pm2.sh..."
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

# 7. فایل‌های کمکی PM2
cat > pm2-status.sh << 'PM2_STATUS'
#!/bin/bash
cd $HOME/goldbot && node_modules/.bin/pm2 status
PM2_STATUS

cat > pm2-logs.sh << 'PM2_LOGS'
#!/bin/bash
cd $HOME/goldbot && node_modules/.bin/pm2 logs goldbot
PM2_LOGS

cat > pm2-stop.sh << 'PM2_STOP'
#!/bin/bash
cd $HOME/goldbot && node_modules/.bin/pm2 stop goldbot
PM2_STOP

chmod +x pm2-*.sh

# 8. ایجاد فایل‌های ضروری
print_warning "ایجاد فایل‌های کد..."

# tsconfig.json
cat > tsconfig.json << 'TSCONFIG_JSON'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"]
    }
  },
  "include": ["client/src", "server"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
TSCONFIG_JSON

# server/index.ts
mkdir -p server
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
    usd: 100450,
    eur: 116760,
    cad: 72750,
    aed: 27636,
    bitcoin: 64250000,
    ethereum: 250000,
    tether: 100500,
    gold18k: 3895000,
    coin: 42500000,
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔶 goldbot سرور روی پورت ${PORT} راه‌اندازی شد`);
  console.log(`🌐 دسترسی: http://localhost:${PORT}`);
  console.log(`📁 مسیر: ${__dirname}`);
});
SERVER_INDEX

# client/index.html
mkdir -p client
cat > client/index.html << 'INDEX_HTML'
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>🔶 goldbot - سیستم جامع تحلیل طلا و ارز</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: Tahoma, Arial, sans-serif; }
  </style>
</head>
<body class="bg-gradient-to-br from-blue-900 to-purple-900 text-white min-h-screen">
  <div class="container mx-auto px-4 py-12 text-center">
    <h1 class="text-6xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
      🔶 سیستم جامع تحلیل طلا و ارز
    </h1>
    
    <div class="max-w-4xl mx-auto mb-12">
      <p class="text-2xl text-blue-200 mb-8">
        سیستم هوشمند تحلیل، سیگنال‌دهی و اعلام قیمت طلا و ارز
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div class="text-4xl mb-4">📊</div>
          <h3 class="text-xl font-semibold mb-2">تحلیل هوشمند</h3>
          <p class="text-blue-200">تحلیل تکنیکال و بنیادی بازار طلا</p>
        </div>
        
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div class="text-4xl mb-4">⚡</div>
          <h3 class="text-xl font-semibold mb-2">سیگنال‌دهی</h3>
          <p class="text-blue-200">سیگنال‌های معاملاتی XAUUSD</p>
        </div>
        
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div class="text-4xl mb-4">💰</div>
          <h3 class="text-xl font-semibold mb-2">قیمت‌ها</h3>
          <p class="text-blue-200">اعلام قیمت لحظه‌ای ارزها</p>
        </div>
        
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div class="text-4xl mb-4">🤖</div>
          <h3 class="text-xl font-semibold mb-2">کنترل مرکزی</h3>
          <p class="text-blue-200">مدیریت و کنترل ربات‌ها</p>
        </div>
      </div>
      
      <div class="bg-green-500/20 backdrop-blur-sm rounded-lg p-8 border border-green-500/30">
        <div class="flex items-center justify-center gap-2 mb-4">
          <span class="inline-block w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
          <span class="text-green-400 text-xl font-semibold">سیستم آنلاین و فعال</span>
        </div>
        
        <h2 class="text-3xl font-bold mb-4 text-green-400">
          🎉 نصب با موفقیت انجام شد!
        </h2>
        
        <p class="text-lg text-green-200 mb-6">
          سیستم goldbot به طور کامل راه‌اندازی شده و آماده استفاده است.
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div class="bg-white/10 rounded-lg p-4">
            <h4 class="font-semibold mb-2">📁 مسیر پروژه</h4>
            <code class="text-blue-300">~/goldbot</code>
          </div>
          <div class="bg-white/10 rounded-lg p-4">
            <h4 class="font-semibold mb-2">🚀 راه‌اندازی</h4>
            <code class="text-blue-300">./start.sh</code>
          </div>
          <div class="bg-white/10 rounded-lg p-4">
            <h4 class="font-semibold mb-2">⏰ زمان نصب</h4>
            <code class="text-blue-300" id="install-time"></code>
          </div>
        </div>
      </div>
    </div>
    
    <div class="text-sm text-blue-300">
      <p>نسخه 3.0.0 - طراحی شده برای سرورهای Linux</p>
    </div>
  </div>
  
  <script>
    document.getElementById('install-time').textContent = new Date().toLocaleString('fa-IR');
  </script>
</body>
</html>
INDEX_HTML

# 9. نصب پکیج‌ها
print_warning "نصب پکیج‌های Node.js..."
npm install

print_success "فایل‌های پروژه ایجاد شدند"

# 10. تست اجرا
print_success "نصب کامل شد!"
echo ""
echo "🎯 دستورات اجرا:"
echo "=================="
echo "1️⃣ روش ساده (توصیه شده):"
echo "   ./start.sh"
echo ""
echo "2️⃣ روش PM2:"
echo "   ./start-pm2.sh"
echo ""
echo "3️⃣ روش npm:"
echo "   npm run dev"
echo ""
echo "4️⃣ وضعیت PM2:"
echo "   ./pm2-status.sh"
echo ""
echo "🔧 حل مشکلات:"
echo "   ./pm2-logs.sh      # مشاهده لاگ‌ها"
echo "   ./pm2-stop.sh      # توقف PM2"
echo ""

print_warning "تست اجرای سریع..."
timeout 3s ./start.sh &
sleep 2
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null; then
    print_success "✅ سرور روی پورت 5000 فعال شد!"
    echo "🌐 دسترسی: http://localhost:5000"
    pkill -f "server/index.ts" 2>/dev/null || true
else
    print_warning "تست کامل نشد، لطفاً دستی اجرا کنید: ./start.sh"
fi

echo ""
print_success "🎉 نصب goldbot بدون sudo کامل شد!"