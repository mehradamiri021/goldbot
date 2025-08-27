#!/bin/bash

# 🔧 حل مشکل دسترسی tsx و PM2 - goldbot
# ========================================

print_success() { echo -e "✅ $1"; }
print_warning() { echo -e "⚠️  $1"; }
print_error() { echo -e "❌ $1"; }

echo "🔧 حل مشکل دسترسی tsx و PM2"
echo "============================="

# روش 1: نصب tsx محلی در پروژه
print_warning "نصب tsx محلی در پروژه..."
cd $HOME/goldbot
npm install tsx --save-dev

# روش 2: استفاده از npx
print_warning "ایجاد ecosystem.config.cjs با npx..."
cat > ecosystem.config.cjs << 'ECOSYSTEM'
module.exports = {
  apps: [{
    name: 'goldbot',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--import=tsx/esm',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
ECOSYSTEM

# روش 3: اسکریپت راه‌اندازی بدون PM2 
print_warning "ایجاد start.sh برای راه‌اندازی مستقیم..."
cat > start.sh << 'START_SCRIPT'
#!/bin/bash

echo "🚀 راه‌اندازی goldbot بدون PM2..."

# بررسی tsx
if ! command -v tsx &> /dev/null; then
    echo "⚠️  tsx موجود نیست، استفاده از npx..."
    npx tsx server/index.ts
else
    echo "✅ استفاده از tsx..."
    tsx server/index.ts
fi
START_SCRIPT

chmod +x start.sh

# روش 4: package.json scripts بهتر
print_warning "تصحیح package.json scripts..."
cat > package.json << 'PACKAGE_JSON'
{
  "name": "goldbot",
  "version": "3.0.0",
  "description": "سیستم جامع تحلیل طلا و ارز",
  "main": "server/index.ts",
  "scripts": {
    "dev": "npx tsx server/index.ts",
    "start": "node --import=tsx/esm server/index.ts",
    "build": "tsc",
    "pm2:start": "pm2 start ecosystem.config.cjs",
    "pm2:stop": "pm2 stop goldbot",
    "pm2:restart": "pm2 restart goldbot",
    "pm2:logs": "pm2 logs goldbot"
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
    "postcss": "^8.4.24"
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

print_success "حل مشکل دسترسی انجام شد"

echo ""
echo "📋 روش‌های اجرا:"
echo "=================="
echo "1️⃣ روش معمولی (بدون PM2):"
echo "   ./start.sh"
echo ""
echo "2️⃣ روش npm script:"
echo "   npm run dev"
echo ""
echo "3️⃣ روش PM2 (نیاز به sudo tsx):"
echo "   sudo npm install -g tsx"
echo "   pm2 start ecosystem.config.cjs"
echo ""
echo "4️⃣ بررسی وضعیت:"
echo "   pm2 status"
echo "   pm2 logs goldbot"
echo ""

print_warning "تست راه‌اندازی..."
if [ -f "start.sh" ]; then
    print_success "فایل start.sh آماده است"
    print_warning "اجرای تست 5 ثانیه‌ای..."
    timeout 5s ./start.sh &
    sleep 2
    if pgrep -f "server/index.ts" > /dev/null; then
        print_success "سرور در حال اجرا است!"
        killall node 2>/dev/null || true
    else
        print_warning "تست کامل نشد، لطفاً دستی تست کنید"
    fi
fi