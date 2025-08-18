#!/bin/bash
# GoldBot v2.1 Production Installation Script
# Zero-config installation for Debian 12 VPS

set -e

echo "🚀 Installing GoldBot v2.1 Production..."
echo "=================================="

# Update system
echo "📦 Updating system packages..."
sudo apt update -qq

# Install Python and pip if not available
echo "🐍 Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "Installing Python 3..."
    sudo apt install -y python3 python3-pip python3-venv
fi

# Install system dependencies for TA-Lib
echo "📊 Installing TA-Lib system dependencies..."
sudo apt install -y build-essential wget
if [ ! -f /usr/local/lib/libta_lib.a ]; then
    cd /tmp
    wget http://prdownloads.sourceforge.net/ta-lib/ta-lib-0.4.0-src.tar.gz
    tar -xzf ta-lib-0.4.0-src.tar.gz
    cd ta-lib/
    ./configure --prefix=/usr/local
    make -j$(nproc)
    sudo make install
    sudo ldconfig
fi

# Create virtual environment
echo "🔧 Creating Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate virtual environment
echo "✅ Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📚 Installing Python dependencies..."
if [ -f "install_requirements_production.txt" ]; then
    pip install -r install_requirements_production.txt
else
    echo "❌ install_requirements_production.txt not found!"
    exit 1
fi

# Verify Flask installation
echo "🧪 Verifying Flask installation..."
python3 -c "import flask; print(f'✅ Flask {flask.__version__} installed')"

echo ""
echo "🎉 GoldBot v2.1 Production Installation Complete!"
echo "================================================="
echo ""
echo "🚀 To start the bot:"
echo "   source venv/bin/activate"
echo "   python3 main.py"
echo ""
echo "🌐 The bot will be available at: http://localhost:5000"
echo ""
echo "✅ All dependencies installed successfully!"