#!/bin/bash

# Quick Dependencies Installation for GoldBot
echo "⚡ نصب سریع Dependencies برای GoldBot"
echo "======================================"

# Check if in virtual environment
if [[ "$VIRTUAL_ENV" != "" ]]; then
    echo "✅ Virtual environment detected: $VIRTUAL_ENV"
else
    echo "⚠️ No virtual environment active"
    echo "🔄 Activating venv..."
    source venv/bin/activate 2>/dev/null || {
        echo "❌ venv not found, creating new one..."
        python3 -m venv venv
        source venv/bin/activate
    }
fi

# Upgrade pip
echo "⬆️ Upgrading pip..."
python -m pip install --upgrade pip

# Install core dependencies
echo "📦 Installing core web dependencies..."
pip install flask==3.0.0 flask-sqlalchemy==3.1.1 gunicorn==21.2.0

echo "📊 Installing database dependencies..."
pip install sqlalchemy==2.0.23 psycopg2-binary==2.9.9

echo "🤖 Installing Telegram bot..."
pip install python-telegram-bot==20.8

echo "🔧 Installing utilities..."
pip install requests==2.31.0 beautifulsoup4==4.12.2

echo "📈 Installing data processing..."
pip install pandas==2.1.4 numpy==1.24.4 plotly==5.17.0

echo "⏰ Installing scheduler..."
pip install apscheduler==3.10.4 pytz==2023.3.post1

echo "🛠️ Installing additional tools..."
pip install werkzeug==3.0.1 jdatetime==5.2.0 trafilatura==1.6.4

# Test imports
echo "🧪 Testing imports..."
python -c "
try:
    import flask
    import flask_sqlalchemy  
    import requests
    import telegram
    import pandas
    import plotly
    print('✅ All critical imports successful!')
    print(f'Flask: {flask.__version__}')
    print(f'Telegram: {telegram.__version__}')
    print(f'Pandas: {pandas.__version__}')
except ImportError as e:
    print(f'❌ Import error: {e}')
    exit(1)
"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installation completed successfully!"
    echo ""
    echo "🚀 Ready to run:"
    echo "python main.py"
    echo ""
    echo "🌐 Or with gunicorn:"
    echo "gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app"
else
    echo "❌ Some dependencies failed to install"
    exit 1
fi