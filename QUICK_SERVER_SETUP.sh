#!/bin/bash

# GoldBot v2.1 Production - Quick Server Setup
echo "🚀 راه‌اندازی سریع GoldBot v2.1 Production"
echo "=========================================="

# Check Python version
python3 --version
if [ $? -ne 0 ]; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

# Install dependencies
echo "📦 نصب dependencies..."
pip3 install --upgrade pip
pip3 install -r install_requirements_production.txt

# Check PostgreSQL
echo "🗄️ بررسی PostgreSQL..."
if command -v psql >/dev/null 2>&1; then
    echo "✅ PostgreSQL found"
else
    echo "⚠️ PostgreSQL not found. Installing..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
fi

# Set environment variables (if not set)
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️ DATABASE_URL not set. Using default SQLite"
    export DATABASE_URL="sqlite:///goldbot.db"
fi

if [ -z "$NAVASAN_API_KEY" ]; then
    echo "⚠️ NAVASAN_API_KEY not set. Using default"
    export NAVASAN_API_KEY="freeBY5YCs..."
fi

# Initialize database
echo "🗄️ راه‌اندازی database..."
python3 -c "
from app import app, db
with app.app_context():
    db.create_all()
    print('✅ Database initialized')
"

# Test the application
echo "🧪 تست اپلیکیشن..."
python3 -c "
import requests
import time
from app import app
import threading

def run_server():
    app.run(host='0.0.0.0', port=5001, debug=False)

# Start server in background
server_thread = threading.Thread(target=run_server)
server_thread.daemon = True
server_thread.start()

time.sleep(3)

try:
    response = requests.get('http://localhost:5001/api/live_status', timeout=5)
    if response.status_code == 200:
        print('✅ Application test successful')
    else:
        print(f'⚠️ Application response: {response.status_code}')
except Exception as e:
    print(f'❌ Application test failed: {e}')
"

echo ""
echo "✅ راه‌اندازی کامل شد!"
echo ""
echo "🚀 برای اجرای سرور:"
echo "gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app"
echo ""
echo "🌐 دسترسی وب:"
echo "http://your-server-ip:5000"