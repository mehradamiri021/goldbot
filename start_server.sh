#!/bin/bash

# Gold Trading Bot - Server Startup Script
# اسکریپت راه‌اندازی سرور ربات طلا

echo "🚀 Starting Gold Trading Bot Server..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/Update dependencies
echo "📚 Installing dependencies..."
pip install --upgrade pip
pip install -r install_requirements.txt

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p instance
mkdir -p data/mt5_csv
mkdir -p backups

# Set permissions
chmod +x start_server.sh
chmod +x install_ubuntu.sh

# Load environment variables
if [ -f .env ]; then
    echo "🔧 Loading environment variables..."
    export $(grep -v '^#' .env | xargs)
fi

# Set timezone
export TZ=Asia/Tehran

# Check MT5 CSV path
if [ -n "$MT5_CSV_PATH" ] && [ -d "$MT5_CSV_PATH" ]; then
    echo "✅ MT5 CSV path found: $MT5_CSV_PATH"
    ls -la "$MT5_CSV_PATH"/*.csv 2>/dev/null || echo "⚠️  No CSV files found yet"
else
    echo "⚠️  MT5 CSV path not found. Using fallback data for testing."
fi

# Start the server
echo "🎯 Starting Gold Trading Bot..."
echo "📊 Dashboard will be available at: http://localhost:5000"
echo "🌐 External access: http://your-server-ip:5000"
echo "📝 Logs: tail -f logs/goldbot.log"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================"

# Run with gunicorn for production
exec gunicorn \
    --bind 0.0.0.0:5000 \
    --workers 2 \
    --timeout 120 \
    --keep-alive 2 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --access-logfile logs/access.log \
    --error-logfile logs/error.log \
    --log-level info \
    --reload \
    main:app