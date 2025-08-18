#!/bin/bash
# Gold Trading Bot - Debian 12 Auto Installation
# اسکریپت نصب خودکار برای Debian 12

set -e  # Exit on any error

echo "🚀 Gold Trading Bot - Debian 12 Installation"
echo "=============================================="
echo "📋 VPS Specs: 1GB RAM, 25GB Disk, 1 vCPU"
echo "📋 OS: Debian 12 x64"
echo "📋 Location: Amsterdam"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root: sudo $0"
    exit 1
fi

print_status "Starting installation process..."

# Step 1: System Update
print_status "Updating system packages..."
apt update && apt upgrade -y
print_success "System updated"

# Step 2: Install basic dependencies
print_status "Installing basic dependencies..."
apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    curl \
    wget \
    git \
    nano \
    htop \
    screen \
    ufw \
    software-properties-common \
    ca-certificates \
    lsb-release \
    gnupg

print_success "Basic dependencies installed"

# Step 3: Install PostgreSQL (optional but recommended)
print_status "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib libpq-dev
systemctl enable postgresql
systemctl start postgresql
print_success "PostgreSQL installed and started"

# Step 4: Install TA-Lib for technical analysis
print_status "Installing TA-Lib..."
cd /tmp
wget -q http://prdownloads.sourceforge.net/ta-lib/ta-lib-0.4.0-src.tar.gz
tar -xzf ta-lib-0.4.0-src.tar.gz
cd ta-lib/
./configure --prefix=/usr
make -j$(nproc)
make install
ldconfig
cd /
rm -rf /tmp/ta-lib*
print_success "TA-Lib installed"

# Step 5: Setup swap for 1GB RAM VPS
print_status "Setting up swap file for better memory management..."
if [ ! -f /swapfile ]; then
    fallocate -l 1G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    print_success "1GB swap file created and activated"
else
    print_warning "Swap file already exists"
fi

# Step 6: Configure firewall
print_status "Configuring firewall..."
ufw allow ssh
ufw allow 5000/tcp  # Flask app port
ufw --force enable
print_success "Firewall configured"

# Step 7: Create goldbot user and directory
print_status "Setting up goldbot environment..."
GOLDBOT_DIR="/opt/goldbot"
mkdir -p $GOLDBOT_DIR
cd $GOLDBOT_DIR

# Step 8: Install Python packages
print_status "Installing Python packages..."
pip3 install --upgrade pip setuptools wheel

# Install packages commonly needed
pip3 install \
    flask \
    flask-sqlalchemy \
    psycopg2-binary \
    pandas \
    numpy \
    requests \
    python-telegram-bot \
    apscheduler \
    pytz \
    plotly \
    beautifulsoup4 \
    ta-lib

print_success "Python packages installed"

# Step 9: Create systemd service template
print_status "Creating systemd service template..."
cat > /etc/systemd/system/goldbot.service << 'EOF'
[Unit]
Description=Gold Trading Bot
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/goldbot
ExecStart=/usr/bin/python3 main.py
Restart=always
RestartSec=10
Environment=PYTHONPATH=/opt/goldbot
Environment=PYTHONUNBUFFERED=1

# Memory and process limits for 1GB RAM VPS
MemoryMax=800M
MemorySwapMax=200M
TasksMax=50

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
print_success "Systemd service template created"

# Step 10: Create database setup script
print_status "Creating database setup script..."
cat > $GOLDBOT_DIR/setup_database.sh << 'EOF'
#!/bin/bash
# Database setup for goldbot

# Create PostgreSQL database and user
sudo -u postgres psql << PSQL
CREATE DATABASE goldbot;
CREATE USER goldbot WITH ENCRYPTED PASSWORD 'goldbot123';
GRANT ALL PRIVILEGES ON DATABASE goldbot TO goldbot;
\q
PSQL

echo "Database 'goldbot' created with user 'goldbot'"
echo "Connection string: postgresql://goldbot:goldbot123@localhost/goldbot"
EOF

chmod +x $GOLDBOT_DIR/setup_database.sh

# Step 11: Create deployment script
print_status "Creating deployment script..."
cat > $GOLDBOT_DIR/deploy.sh << 'EOF'
#!/bin/bash
# Deployment script for goldbot

GOLDBOT_DIR="/opt/goldbot"
cd $GOLDBOT_DIR

echo "🚀 Deploying Gold Trading Bot..."

# Extract goldbot package if exists
if [ -f goldbot_vps_final_*.tar.gz ]; then
    echo "📦 Extracting goldbot package..."
    tar -xzf goldbot_vps_final_*.tar.gz --strip-components=1
    chmod +x *.py *.sh
fi

# Run auto-fix scripts
if [ -f VPS_AUTO_FIX.py ]; then
    echo "🔧 Running VPS auto-fix..."
    python3 VPS_AUTO_FIX.py
fi

if [ -f FINAL_PRODUCTION_FIXES.py ]; then
    echo "🔧 Running production fixes..."
    python3 FINAL_PRODUCTION_FIXES.py
fi

# Install requirements
if [ -f install_requirements.txt ]; then
    echo "📦 Installing requirements..."
    pip3 install -r install_requirements.txt
elif [ -f requirements.txt ]; then
    pip3 install -r requirements.txt
fi

# Setup environment variables
if [ ! -f .env ]; then
    echo "⚙️ Creating environment file..."
    cat > .env << ENV
DATABASE_URL=postgresql://goldbot:goldbot123@localhost/goldbot
NAVASAN_API_KEY=freeL3ceMoBm2EaeVeuvHJvuGKTJcNcg
FLASK_ENV=production
FLASK_DEBUG=False
ENV
fi

# Start service
echo "🚀 Starting goldbot service..."
systemctl enable goldbot
systemctl restart goldbot
systemctl status goldbot

echo "✅ Deployment complete!"
echo "🌐 Access web interface: http://$(curl -s ifconfig.me):5000"
echo "📋 Check logs: journalctl -u goldbot -f"
EOF

chmod +x $GOLDBOT_DIR/deploy.sh

# Step 12: Create monitoring script
print_status "Creating monitoring script..."
cat > $GOLDBOT_DIR/monitor.sh << 'EOF'
#!/bin/bash
# Monitoring script for goldbot

echo "🔍 Gold Trading Bot - System Monitor"
echo "===================================="

# Service status
echo "📊 Service Status:"
systemctl status goldbot --no-pager -l

echo ""
echo "💾 Memory Usage:"
free -h

echo ""
echo "💽 Disk Usage:"
df -h /opt/goldbot

echo ""
echo "🌐 Network Connections:"
netstat -tlnp | grep :5000

echo ""
echo "📋 Last 10 log entries:"
journalctl -u goldbot -n 10 --no-pager
EOF

chmod +x $GOLDBOT_DIR/monitor.sh

# Step 13: Final system optimization
print_status "Applying system optimizations for 1GB RAM..."

# Optimize Python for low memory
cat >> /etc/environment << 'EOF'
PYTHONHASHSEED=0
PYTHONOPTIMIZE=1
EOF

# Create memory management script
cat > $GOLDBOT_DIR/optimize_memory.sh << 'EOF'
#!/bin/bash
# Memory optimization for 1GB VPS

# Clear cache
sync
echo 3 > /proc/sys/vm/drop_caches

# Adjust swappiness for better performance
echo 10 > /proc/sys/vm/swappiness

echo "Memory optimization applied"
EOF

chmod +x $GOLDBOT_DIR/optimize_memory.sh

# Final permissions
chown -R root:root $GOLDBOT_DIR
chmod 755 $GOLDBOT_DIR

print_success "Installation completed successfully!"
echo ""
echo "=============================================="
echo "🎯 Next Steps:"
echo "1. Upload goldbot package to: $GOLDBOT_DIR"
echo "2. Run: cd $GOLDBOT_DIR && ./setup_database.sh"
echo "3. Run: ./deploy.sh"
echo "4. Monitor: ./monitor.sh"
echo ""
echo "🌐 Web Access: http://YOUR_VPS_IP:5000"
echo "📋 Logs: journalctl -u goldbot -f"
echo "🔧 Service: systemctl {start|stop|restart} goldbot"
echo "=============================================="