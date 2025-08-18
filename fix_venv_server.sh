#!/bin/bash

# GoldBot Server - Virtual Environment Fix
echo "🔧 حل مشکل Virtual Environment سرور"
echo "====================================="

# Check current directory
pwd
echo "📁 Current directory: $(pwd)"

# Deactivate current venv if active
if [[ "$VIRTUAL_ENV" != "" ]]; then
    echo "⏹️ Deactivating current venv..."
    deactivate || true
fi

# Remove broken venv
if [ -d "venv" ]; then
    echo "🗑️ Removing broken virtual environment..."
    rm -rf venv
    echo "✅ Old venv removed"
fi

# Create new virtual environment
echo "🏗️ Creating new virtual environment..."
python3 -m venv venv

# Activate new venv
echo "🔄 Activating new virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
python -m pip install --upgrade pip

# Install requirements
echo "📦 Installing production requirements..."
if [ -f "install_requirements_production.txt" ]; then
    pip install -r install_requirements_production.txt
elif [ -f "install_requirements.txt" ]; then
    pip install -r install_requirements.txt
else
    echo "📋 Installing core dependencies manually..."
    pip install flask flask-sqlalchemy gunicorn requests beautifulsoup4 
    pip install python-telegram-bot pandas numpy plotly apscheduler pytz
    pip install psycopg2-binary sqlalchemy werkzeug jdatetime trafilatura
fi

# Test installation
echo "🧪 Testing Python imports..."
python -c "
import flask
import requests
import pandas
import telegram
print('✅ Core imports successful')
"

echo ""
echo "✅ Virtual Environment fixed!"
echo "🚀 Now you can run:"
echo "   source venv/bin/activate"
echo "   python main.py"
echo "   # or"
echo "   gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app"