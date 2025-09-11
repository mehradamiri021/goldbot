#!/bin/bash

# 🚀 Goldbot Dashboard Builder
# این اسکریپت dashboard کامل را در سرور می‌سازد

echo "🔧 Building Goldbot Dashboard..."

# بررسی وجود Node.js
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js first"
    exit 1
fi

# نصب وابستگی‌ها (در صورت نیاز)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# ساخت فایل‌های production
echo "🏗️ Building frontend..."
npm run build

# کپی فایل‌ها به مکان صحیح
if [ -d "dist/public" ]; then
    echo "📁 Copying files to server/public..."
    cp -r dist/public/* server/public/
    echo "✅ Dashboard files copied successfully!"
else
    echo "❌ Build failed - dist/public not found"
    exit 1
fi

# بررسی فایل‌های ضروری
if [ -f "server/public/index.html" ]; then
    echo "✅ Dashboard ready! Access at: http://your-server:5000"
    echo "📊 Features available:"
    echo "   - Live price updates"
    echo "   - Bot status monitoring"  
    echo "   - Trading signals"
    echo "   - Persian RTL interface"
else
    echo "❌ Dashboard files not found in server/public/"
    exit 1
fi

echo "🎉 Build completed successfully!"