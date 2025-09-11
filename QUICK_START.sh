#!/bin/bash

# راه‌اندازی سریع گلدربات - Goldbot Quick Start
echo "🚀 Goldbot Quick Start"

# بررسی نصب Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# نصب dependencies
echo "📦 Installing dependencies..."
npm install

# اجرای برنامه
echo "🎯 Starting Goldbot..."
npm run dev

echo "✅ Goldbot is now running!"
echo "🌐 Access web panel: http://localhost:5000"