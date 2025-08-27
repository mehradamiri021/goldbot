#!/bin/bash

# 🚨 اسکریپت حل مشکل فوری - صفحه سفید وب پنل
# ===============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

echo "🚨 حل مشکل صفحه سفید goldbot"
echo "============================"

# بررسی وجود پروژه
if [ ! -d "$HOME/goldbot" ]; then
    print_error "پروژه goldbot موجود نیست"
    exit 1
fi

cd $HOME/goldbot

print_warning "حل مشکل فایل‌های frontend..."

# 1. ایجاد App.tsx کامل
print_warning "ایجاد App.tsx..."
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

# 2. تصحیح main.tsx
print_warning "تصحیح main.tsx..."
cat > client/src/main.tsx << 'MAIN_TSX'
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
MAIN_TSX

# 3. تصحیح index.css (حذف font خارجی که مشکل ساز است)
print_warning "تصحیح index.css..."
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

print_success "فایل‌های frontend تصحیح شدند"

# راه‌اندازی مجدد PM2
print_warning "راه‌اندازی مجدد PM2..."
pm2 restart goldbot

# تست عملکرد
print_warning "تست عملکرد..."
sleep 5

API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/prices 2>/dev/null || echo "000")

if [ "$API_STATUS" = "200" ]; then
    print_success "✅ مشکل حل شد! وب پنل باید کار کند"
    print_success "✅ API فعال: http://localhost:5000/api/prices"
    print_success "✅ وب پنل: http://localhost:5000"
else
    print_error "❌ مشکل در API - کد وضعیت: $API_STATUS"
fi

echo ""
echo "🎯 مراحل بعدی:"
echo "   1. صفحه وب را refresh کنید"
echo "   2. چند ثانیه صبر کنید تا داده‌ها بارگذاری شوند"
echo "   3. اگر باز هم مشکل داشت: pm2 logs goldbot"
echo ""
echo "🌐 وب پنل: http://localhost:5000"