#!/bin/bash

# Gold Trading Bot - Ubuntu Installation Script
# اسکریپت نصب روی اوبونتو

echo "🐧 Installing Gold Trading Bot on Ubuntu..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install system dependencies
echo "🔧 Installing system dependencies..."
sudo apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    wget \
    curl \
    git \
    nginx \
    supervisor \
    wine \
    xvfb

# Install TA-Lib dependencies
echo "📊 Installing TA-Lib..."
cd /tmp
wget http://prdownloads.sourceforge.net/ta-lib/ta-lib-0.4.0-src.tar.gz
tar -xzf ta-lib-0.4.0-src.tar.gz
cd ta-lib/
./configure --prefix=/usr
make
sudo make install
cd -

# Setup Wine for MT5
echo "🍷 Setting up Wine for MetaTrader 5..."
sudo mkdir -p /home/trader
sudo chown $USER:$USER /home/trader
export WINEPREFIX=/home/trader/.wine_mt5
winecfg  # Configure Wine (set to Windows 10)

# Create project directory
echo "📁 Setting up project directory..."
PROJECT_DIR="/home/trader/gold-trading-bot"
sudo mkdir -p "$PROJECT_DIR"
sudo chown $USER:$USER "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Create virtual environment
echo "🐍 Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python packages
echo "📚 Installing Python packages..."
pip install --upgrade pip
pip install -r install_requirements.txt

# Create systemd service
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/goldbot.service > /dev/null << EOF
[Unit]
Description=Gold Trading Bot
After=network.target

[Service]
Type=simple
User=trader
WorkingDirectory=/home/trader/gold-trading-bot
Environment=PATH=/home/trader/gold-trading-bot/venv/bin
Environment=TZ=Asia/Tehran
ExecStart=/home/trader/gold-trading-bot/venv/bin/gunicorn --bind 0.0.0.0:5000 --workers 2 main:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
echo "🚀 Enabling Gold Bot service..."
sudo systemctl daemon-reload
sudo systemctl enable goldbot

# Setup firewall
echo "🛡️  Setting up firewall..."
sudo ufw allow 5000
sudo ufw allow ssh
sudo ufw --force enable

# Setup log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/goldbot > /dev/null << EOF
/home/trader/gold-trading-bot/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    postrotate
        systemctl reload goldbot
    endscript
}
EOF

# Create backup script
echo "💾 Setting up backup script..."
tee backup.sh > /dev/null << EOF
#!/bin/bash
BACKUP_DIR="/home/trader/gold-trading-bot/backups"
DATE=\$(date +%Y%m%d_%H%M%S)

# Backup database
cp goldbot.db "\$BACKUP_DIR/goldbot_\$DATE.db"

# Backup logs
tar -czf "\$BACKUP_DIR/logs_\$DATE.tar.gz" logs/

# Keep only last 7 days of backups
find "\$BACKUP_DIR" -name "*.db" -mtime +7 -delete
find "\$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: \$DATE"
EOF

chmod +x backup.sh

# Add cron job for backups
echo "⏰ Setting up automated backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * cd /home/trader/gold-trading-bot && ./backup.sh") | crontab -

echo ""
echo "✅ Installation completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure .env file with your settings"
echo "2. Install MetaTrader 5 in Wine"
echo "3. Setup Expert Advisor for CSV export"
echo "4. Start the service: sudo systemctl start goldbot"
echo "5. Check status: sudo systemctl status goldbot"
echo "6. View logs: tail -f logs/goldbot.log"
echo ""
echo "🌐 Bot will be available at: http://your-server-ip:5000"
echo "📊 Dashboard: http://your-server-ip:5000/dashboard"
echo ""