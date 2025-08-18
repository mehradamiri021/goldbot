#!/bin/bash

echo "🔧 Quick Fix for Flask Installation Issue"
echo "========================================"

# Activate virtual environment if exists
if [ -d "venv" ]; then
    echo "📁 Activating virtual environment..."
    source venv/bin/activate
fi

# Upgrade pip first
echo "📦 Upgrading pip..."
python -m pip install --upgrade pip

# Install Flask and essential packages
echo "🚀 Installing Flask and core dependencies..."
python -m pip install flask>=3.0.0
python -m pip install flask-sqlalchemy>=3.0.0
python -m pip install gunicorn>=21.0.0
python -m pip install werkzeug>=3.0.0

# Install from requirements file if exists
if [ -f "install_requirements.txt" ]; then
    echo "📋 Installing from install_requirements.txt..."
    python -m pip install -r install_requirements.txt
elif [ -f "requirements.txt" ]; then
    echo "📋 Installing from requirements.txt..."
    python -m pip install -r requirements.txt
fi

# Verify Flask installation
echo "🔍 Verifying Flask installation..."
python -c "import flask; print(f'✅ Flask {flask.__version__} installed successfully')" 2>/dev/null || echo "❌ Flask installation failed"

echo ""
echo "✅ Installation complete!"
echo "🎯 Now you can run: python main.py"