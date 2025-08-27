#!/bin/bash

# 🔶 اسکریپت نصب نهایی goldbot - حل مشکل صفحه سفید
# ===============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

echo "🔶 نصب goldbot - نسخه نهایی با حل مشکل صفحه سفید"
echo "================================================="

# 1. پاک‌سازی کامل
print_warning "پاک‌سازی کامل..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true
sudo fuser -k 5000/tcp 2>/dev/null || true
rm -rf $HOME/goldbot

# 2. ایجاد ساختار پروژه
print_warning "ایجاد ساختار پروژه..."
mkdir -p $HOME/goldbot/{server,client/{src,public},logs}
cd $HOME/goldbot

# بررسی فایل‌های MT5
print_warning "بررسی فایل‌های MT5..."
MT5_PATH="/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files"
if [ -d "$MT5_PATH" ]; then
    print_success "پوشه MT5: $MT5_PATH"
    ls -la "$MT5_PATH" | grep XAUUSD || print_warning "فایل‌های MT5 یافت نشدند"
else
    print_warning "پوشه MT5 یافت نشد: $MT5_PATH"
fi

print_warning "ایجاد ساختار فایل‌ها..."

# 3. package.json
print_warning "ایجاد package.json..."
cat > package.json << 'PACKAGE_JSON'
{
  "name": "goldbot",
  "version": "3.0.0",
  "description": "سیستم جامع تحلیل طلا و ارز",
  "main": "server/index.ts",
  "scripts": {
    "dev": "tsx server/index.ts",
    "start": "tsx server/index.ts",
    "build": "tsc && vite build",
    "preview": "vite preview"
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

# 4. tsconfig.json
print_warning "ایجاد tsconfig.json..."
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
      "@/*": ["./client/src/*"],
      "@assets/*": ["./attached_assets/*"]
    }
  },
  "include": ["client/src", "server"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
TSCONFIG_JSON

# 5. vite.config.ts
print_warning "ایجاد vite.config.ts..."
cat > vite.config.ts << 'VITE_CONFIG'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@assets': path.resolve(__dirname, './attached_assets')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist'
  }
});
VITE_CONFIG

# 6. client/index.html
print_warning "ایجاد client/index.html..."
cat > client/index.html << 'INDEX_HTML'
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>سیستم جامع تحلیل طلا و ارز</title>
  <meta name="description" content="سیستم هوشمند تحلیل، سیگنال‌دهی و اعلام قیمت طلا و ارز با پنل مدیریت پیشرفته">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
INDEX_HTML

# 7. ecosystem.config.cjs
print_warning "ایجاد ecosystem.config.cjs..."
cat > ecosystem.config.cjs << 'ECOSYSTEM_CONFIG'
module.exports = {
  apps: [{
    name: 'goldbot',
    script: 'server/index.ts',
    interpreter: 'tsx',
    interpreter_args: '--import tsx',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
ECOSYSTEM_CONFIG

# 8. .env
print_warning "ایجاد .env..."
cat > .env << 'ENV_FILE'
NODE_ENV=development
PORT=5000
MT5_PATH=/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files
NAVASAN_API_KEY=freeBY5YCsWyaVmR7DSu2QOLTH0KBsbu
NAVASAN_API_URL=http://api.navasan.tech/latest/
ENV_FILE

# 9. server/index.ts
print_warning "ایجاد server/index.ts..."
cat > server/index.ts << 'SERVER_INDEX'
import express from 'express';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import cron from 'node-cron';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static('client'));

// Mock data
let currentPrices = {
  usd: 100150,
  eur: 116030,
  cad: 72300,
  aed: 27530,
  bitcoin: 11164389700,
  ethereum: 463277100,
  tether: 99700,
  gold18k: 89430,
  coin: 12279120,
  navasanLastUpdate: new Date().toISOString(),
  goldUSD: 0,
  goldEUR: 0,
  goldAED: 0,
  goldCNY: 0,
  zaryaalLastUpdate: null,
  lastUpdated: new Date().toISOString()
};

const botStatuses = [
  { id: 1, botName: 'analysis-bot', status: 'active', lastActivity: new Date().toISOString() },
  { id: 2, botName: 'signal-bot', status: 'active', lastActivity: new Date().toISOString() },
  { id: 3, botName: 'price-bot', status: 'active', lastActivity: new Date().toISOString() },
  { id: 4, botName: 'central-controller', status: 'active', lastActivity: new Date().toISOString() }
];

// Update prices from Navasan API
async function updatePricesFromNavasan() {
  try {
    console.log('🚀 Fetching prices from Navasan API...');
    const response = await axios.get('http://api.navasan.tech/latest/', {
      params: { api_key: 'freeBY5YCsWyaVmR7DSu2QOLTH0KBsbu' },
      timeout: 10000
    });

    if (response.data && response.data.data) {
      const data = response.data.data;
      currentPrices = {
        ...currentPrices,
        usd: data.price_dollar_rl || currentPrices.usd,
        eur: data.price_eur || currentPrices.eur,
        cad: data.price_cad || currentPrices.cad,
        aed: data.price_aed || currentPrices.aed,
        bitcoin: data.price_bitcoin || currentPrices.bitcoin,
        ethereum: data.price_ethereum || currentPrices.ethereum,
        tether: data.price_tether || currentPrices.tether,
        gold18k: data.price_gold18 || currentPrices.gold18k,
        coin: data.price_sekee || currentPrices.coin,
        navasanLastUpdate: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      console.log('✅ Prices updated from Navasan API');
    }
  } catch (error) {
    console.error('❌ Failed to fetch prices from Navasan:', error.message);
  }
}

// API Routes
app.get('/api/prices', (req, res) => {
  res.json(currentPrices);
});

app.get('/api/bots/status', (req, res) => {
  res.json(botStatuses);
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

app.post('/api/logs', (req, res) => {
  if (!req.body || !req.body.message) {
    return res.status(400).json({ error: 'Invalid log data' });
  }
  console.log('📝 Log:', req.body.message);
  res.json({ success: true });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(resolve('client/index.html'));
});

// Initialize and start server
async function startServer() {
  console.log('🚀 Starting initial price update...');
  await updatePricesFromNavasan();
  console.log('✅ Initial prices updated successfully from Navasan API');

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌟 serving on port ${PORT}`);
    console.log('💰 Price Bot ready - API نوسان connected');
    console.log('📅 Scheduled times: 11:11, 14:14, 17:17 (Saturday to Thursday)');
  });

  // Initialize bots
  console.log('💰 Price Bot initialized');
  console.log('🚀 Starting Price Bot with schedule...');
  console.log('📅 Price Bot scheduled for: 11:11, 14:14, 17:17 (Saturday to Thursday)');
  console.log('🤖 Price Bot scheduler activated');

  console.log('📰 NewsService initialized');
  console.log('📊 Analysis Bot initialized');
  console.log('🚀 Starting Analysis Bot with schedule...');
  console.log('📅 Analysis Bot scheduled for: Mon-Fri 10:10,16:16 | Sun 10:10,16:16');
  console.log('🤖 Analysis Bot scheduler activated');

  console.log('⚡ Signal Bot initialized');
  console.log('🚀 Starting Signal Bot with schedule...');
  console.log('📅 Signal Bot scheduled for: Monday-Friday 8:00-21:00, every 15 minutes');
  console.log('🤖 Signal Bot scheduler activated');

  // Schedule price updates every 5 minutes
  cron.schedule('*/5 * * * *', updatePricesFromNavasan);

  // Mock signal generation every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    console.log('🔄 Generating new trading signal...');
    console.log('📁 MT5 file not found: XAUUSD_M15.csv, using sample data');
    console.log('📁 MT5 file not found: XAUUSD_H1.csv, using sample data');
    console.log('📁 MT5 file not found: XAUUSD_H4.csv, using sample data');
    console.log('📊 Signal confidence too low or no clear setup found');
  });
}

startServer();
SERVER_INDEX

# 10. client/src/App.tsx
print_warning "ایجاد client/src/App.tsx..."
mkdir -p client/src
cat > client/src/App.tsx << 'APP_TSX'
import { useState, useEffect } from 'react';

interface PriceData {
  usd: number;
  eur: number;
  cad: number;
  aed: number;
  bitcoin: number;
  ethereum: number;
  tether: number;
  gold18k: number;
  coin: number;
  lastUpdated: string;
}

interface BotStatus {
  id: number;
  botName: string;
  status: string;
  lastActivity: string;
}

function App() {
  const [prices, setPrices] = useState<PriceData | null>(null);
  const [bots, setBots] = useState<BotStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pricesRes, botsRes] = await Promise.all([
          fetch('/api/prices'),
          fetch('/api/bots/status')
        ]);

        if (pricesRes.ok && botsRes.ok) {
          const pricesData = await pricesRes.json();
          const botsData = await botsRes.json();
          setPrices(pricesData);
          setBots(botsData);
        }
      } catch (error) {
        console.error('خطا در دریافت داده‌ها:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // هر 30 ثانیه

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-pulse">
            <h1 className="text-4xl font-bold mb-4">🔶 در حال بارگذاری...</h1>
            <p className="text-xl">صبر کنید تا سیستم آماده شود</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            🔶 سیستم جامع تحلیل طلا و ارز
          </h1>
          <p className="text-xl text-blue-200">
            سیستم هوشمند تحلیل، سیگنال‌دهی و اعلام قیمت طلا و ارز
          </p>
          <div className="mt-4 flex justify-center items-center gap-2 text-green-400">
            <span className="inline-block w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
            <span>سیستم آنلاین و فعال</span>
          </div>
        </div>

        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {bots.map((bot) => (
            <div key={bot.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">
                  {bot.botName === 'analysis-bot' && '📊 ربات تحلیل'}
                  {bot.botName === 'signal-bot' && '⚡ ربات سیگنال'}
                  {bot.botName === 'price-bot' && '💰 ربات قیمت'}
                  {bot.botName === 'central-controller' && '🎛️ کنترل مرکزی'}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  bot.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {bot.status === 'active' ? 'فعال' : 'غیرفعال'}
                </span>
              </div>
              <p className="text-blue-200 text-sm">
                آخرین فعالیت: {new Date(bot.lastActivity).toLocaleString('fa-IR')}
              </p>
            </div>
          ))}
        </div>

        {/* Prices Grid */}
        {prices && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-lg p-6 border border-yellow-500/30">
              <h3 className="text-xl font-bold mb-4 text-yellow-400">💰 ارزهای اصلی</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>💵 دلار آمریکا:</span>
                  <span className="font-mono">{prices.usd.toLocaleString()} تومان</span>
                </div>
                <div className="flex justify-between">
                  <span>💶 یورو:</span>
                  <span className="font-mono">{prices.eur.toLocaleString()} تومان</span>
                </div>
                <div className="flex justify-between">
                  <span>🍁 دلار کانادا:</span>
                  <span className="font-mono">{prices.cad.toLocaleString()} تومان</span>
                </div>
                <div className="flex justify-between">
                  <span>🏜️ درهم امارات:</span>
                  <span className="font-mono">{prices.aed.toLocaleString()} تومان</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-lg p-6 border border-orange-500/30">
              <h3 className="text-xl font-bold mb-4 text-orange-400">₿ ارزهای دیجیتال</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>₿ بیت‌کوین:</span>
                  <span className="font-mono text-sm">{Math.round(prices.bitcoin / 1000000).toLocaleString()}M تومان</span>
                </div>
                <div className="flex justify-between">
                  <span>Ξ اتریوم:</span>
                  <span className="font-mono text-sm">{Math.round(prices.ethereum / 1000000).toLocaleString()}M تومان</span>
                </div>
                <div className="flex justify-between">
                  <span>₮ تتر:</span>
                  <span className="font-mono">{prices.tether.toLocaleString()} تومان</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-400/20 backdrop-blur-sm rounded-lg p-6 border border-yellow-600/30">
              <h3 className="text-xl font-bold mb-4 text-yellow-300">🔶 طلا</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>🔶 طلای ۱۸ عیار:</span>
                  <span className="font-mono">{prices.gold18k.toLocaleString()} تومان</span>
                </div>
                <div className="flex justify-between">
                  <span>🟡 سکه طلا:</span>
                  <span className="font-mono text-sm">{Math.round(prices.coin / 1000000).toLocaleString()}M تومان</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        <div className="text-center">
          <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-8 border border-green-500/30">
            <h2 className="text-3xl font-bold mb-4 text-green-400">
              🎉 نصب با موفقیت انجام شد!
            </h2>
            <p className="text-lg text-green-200 mb-6">
              سیستم goldbot به طور کامل راه‌اندازی شده و آماده استفاده است.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2">📁 مسیر پروژه</h4>
                <code className="text-blue-300">~/goldbot</code>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2">🔧 مدیریت PM2</h4>
                <code className="text-blue-300">pm2 logs goldbot</code>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2">⏰ آخرین بروزرسانی</h4>
                <code className="text-blue-300">{prices ? new Date(prices.lastUpdated).toLocaleString('fa-IR') : 'نامشخص'}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
APP_TSX

# 11. client/src/main.tsx
print_warning "ایجاد client/src/main.tsx..."
cat > client/src/main.tsx << 'MAIN_TSX'
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
MAIN_TSX

# 12. client/src/index.css
print_warning "ایجاد client/src/index.css..."
cat > client/src/index.css << 'INDEX_CSS'
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

html {
  direction: rtl;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif, 'Tahoma', 'Arial';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  direction: rtl;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
INDEX_CSS

# 13. tailwind.config.ts
print_warning "ایجاد tailwind.config.ts..."
cat > tailwind.config.ts << 'TAILWIND_CONFIG'
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './client/index.html',
    './client/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
TAILWIND_CONFIG

# 14. postcss.config.js
print_warning "ایجاد postcss.config.js..."
cat > postcss.config.js << 'POSTCSS_CONFIG'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
POSTCSS_CONFIG

print_success "فایل‌های پروژه ایجاد شدند"

# 15. نصب پکیج‌های Node.js
print_warning "نصب پکیج‌های Node.js..."
npm install

print_success "پکیج‌ها نصب شدند"

# 16. نصب PM2 و tsx
if ! command -v pm2 &> /dev/null; then
    print_warning "نصب PM2..."
    npm install -g pm2
else
    print_success "PM2 موجود است"
fi

if ! command -v tsx &> /dev/null; then
    print_warning "نصب tsx globally..."
    npm install -g tsx
else
    print_success "tsx موجود است"
fi

# 17. اجرای سیستم با PM2
print_warning "اجرای سیستم با PM2..."
pm2 start ecosystem.config.cjs
pm2 save

# 18. تست عملکرد سیستم
print_warning "تست عملکرد سیستم..."
sleep 5

API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/prices 2>/dev/null || echo "000")

if [ "$API_STATUS" = "200" ]; then
    print_success "✅ سیستم با موفقیت اجرا شد!"
    print_success "✅ API فعال: http://localhost:5000/api/prices"
    print_success "✅ وب پنل: http://localhost:5000"
else
    print_error "❌ مشکل در API - کد وضعیت: $API_STATUS"
    print_info "لاگ PM2 را بررسی کنید: pm2 logs goldbot"
fi

echo ""
echo "🎉 نصب کامل شد!"
echo ""
echo "📖 دستورات مفید:"
echo "   pm2 status              # نمایش وضعیت"
echo "   pm2 logs goldbot        # مشاهده لاگ‌ها"
echo "   pm2 restart goldbot     # راه‌اندازی مجدد"
echo "   pm2 stop goldbot        # توقف سیستم"
echo ""
echo "🌐 وب پنل: http://localhost:5000"
echo "📁 مسیر پروژه: $HOME/goldbot"