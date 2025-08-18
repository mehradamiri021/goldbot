#!/bin/bash

# GoldBot - System-wide Installation (No Virtual Environment)
echo "🌍 نصب سیستمی GoldBot (بدون Virtual Environment)"
echo "================================================="

# Update system packages
echo "⬆️ بروزرسانی packages سیستم..."
sudo apt update

# Install Python dependencies system-wide
echo "📦 نصب dependencies پایتون..."
sudo apt install -y python3-pip python3-dev python3-venv

# Install Python packages system-wide
echo "🐍 نصب packages پایتون به صورت سیستمی..."
sudo pip3 install --upgrade pip

# Core web framework
sudo pip3 install flask==3.0.0 flask-sqlalchemy==3.1.1 gunicorn==21.2.0

# Database
sudo pip3 install sqlalchemy==2.0.23 psycopg2-binary==2.9.9

# Telegram bot
sudo pip3 install python-telegram-bot==20.8

# Data processing  
sudo pip3 install pandas==2.1.4 numpy==1.24.4

# Utilities
sudo pip3 install requests==2.31.0 beautifulsoup4==4.12.2
sudo pip3 install plotly==5.17.0 apscheduler==3.10.4 pytz==2023.3.post1
sudo pip3 install werkzeug==3.0.1 jdatetime==5.2.0 trafilatura==1.6.4

# Test installation
echo "🧪 تست نصب..."
python3 -c "
import flask, requests, pandas, telegram, plotly
print('✅ All packages imported successfully')
print(f'Flask: {flask.__version__}')
print(f'Pandas: {pandas.__version__}')
print(f'Telegram: {telegram.__version__}')
"

echo ""
echo "✅ نصب سیستمی کامل شد!"
echo ""
echo "🚀 برای اجرا:"
echo "python3 main.py"
echo ""
echo "🌐 یا با gunicorn:"
echo "gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app"