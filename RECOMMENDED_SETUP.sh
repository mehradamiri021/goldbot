#!/bin/bash
# Recommended Setup Script for Your VPS
# اسکریپت نصب توصیه شده برای VPS شما

set -e

echo "🎯 Gold Trading Bot - Recommended Setup for Your VPS"
echo "=================================================="
echo "📋 VPS: Debian 12 x64, 1GB RAM, 25GB Storage, Amsterdam"
echo "📦 Package: goldbot_vps_final_20250817_161951.tar.gz"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check system compatibility
log "Checking system compatibility..."

# Check OS
if [ -f /etc/debian_version ]; then
    DEBIAN_VERSION=$(cat /etc/debian_version)
    if [[ $DEBIAN_VERSION == 12* ]]; then
        success "Debian 12 detected - Perfect compatibility!"
    else
        warning "Debian version: $DEBIAN_VERSION (may work but not tested)"
    fi
else
    error "Not a Debian system. This script is optimized for Debian 12."
    exit 1
fi

# Check RAM
TOTAL_RAM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
if [ $TOTAL_RAM -ge 900 ] && [ $TOTAL_RAM -le 1200 ]; then
    success "RAM: ${TOTAL_RAM}MB - Perfect for goldbot!"
elif [ $TOTAL_RAM -ge 500 ]; then
    warning "RAM: ${TOTAL_RAM}MB - Should work with optimization"
else
    error "RAM: ${TOTAL_RAM}MB - Too low, minimum 512MB required"
    exit 1
fi

# Check storage
AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
AVAILABLE_GB=$((AVAILABLE_SPACE / 1024 / 1024))
if [ $AVAILABLE_GB -ge 1 ]; then
    success "Storage: ${AVAILABLE_GB}GB available - Plenty of space!"
else
    error "Storage: ${AVAILABLE_GB}GB - Need at least 1GB free space"
    exit 1
fi

# Check if goldbot package exists
GOLDBOT_PACKAGE="goldbot_vps_final_20250817_161951.tar.gz"
if [ -f "$GOLDBOT_PACKAGE" ]; then
    success "Goldbot package found: $GOLDBOT_PACKAGE"
else
    warning "Goldbot package not found in current directory"
    echo "Please upload $GOLDBOT_PACKAGE to $(pwd)"
    echo "Command: scp $GOLDBOT_PACKAGE root@$(hostname -I | awk '{print $1}'):$(pwd)/"
    read -p "Press Enter when package is uploaded..."
fi

log "Starting optimized installation for your VPS..."

# Update system
log "Updating system packages..."
apt update && apt upgrade -y
success "System updated"

# Install essential packages optimized for 1GB RAM
log "Installing essential packages..."
apt install -y \
    python3 python3-pip python3-venv python3-dev \
    build-essential pkg-config \
    libpq-dev libffi-dev libssl-dev \
    curl wget git nano htop \
    postgresql postgresql-contrib \
    nginx-light \
    supervisor \
    ufw fail2ban

success "Essential packages installed"

# Create optimized swap for 1GB RAM
log "Creating optimized swap file..."
if [ ! -f /swapfile ]; then
    # Create 1.5GB swap for better performance
    fallocate -l 1536M /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    
    # Optimize swappiness for VPS
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf
    sysctl -p
    
    success "1.5GB swap created and optimized"
else
    warning "Swap file already exists"
fi

# Install TA-Lib optimized compilation
log "Installing TA-Lib with optimized compilation..."
cd /tmp
wget -q http://prdownloads.sourceforge.net/ta-lib/ta-lib-0.4.0-src.tar.gz
tar -xzf ta-lib-0.4.0-src.tar.gz
cd ta-lib/
# Optimize for single CPU
./configure --prefix=/usr CFLAGS="-O2 -march=native"
make -j1  # Single thread to avoid memory issues
make install
ldconfig
cd /
rm -rf /tmp/ta-lib*
success "TA-Lib installed with optimization"

# Setup PostgreSQL with memory optimization
log "Configuring PostgreSQL for 1GB RAM..."
systemctl start postgresql
systemctl enable postgresql

# Optimize PostgreSQL for 1GB RAM
PG_VERSION=$(ls /etc/postgresql/)
PG_CONFIG="/etc/postgresql/$PG_VERSION/main/postgresql.conf"

# Backup original config
cp $PG_CONFIG $PG_CONFIG.backup

# Apply memory optimizations
cat >> $PG_CONFIG << 'EOF'

# Optimizations for 1GB RAM VPS
shared_buffers = 128MB
effective_cache_size = 512MB
maintenance_work_mem = 32MB
checkpoint_completion_target = 0.9
wal_buffers = 4MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2MB
min_wal_size = 512MB
max_wal_size = 1GB
EOF

systemctl restart postgresql
success "PostgreSQL optimized for 1GB RAM"

# Create goldbot database
log "Creating goldbot database..."
sudo -u postgres psql << 'EOF'
CREATE DATABASE goldbot;
CREATE USER goldbot WITH ENCRYPTED PASSWORD 'goldbot_secure_2025!';
GRANT ALL PRIVILEGES ON DATABASE goldbot TO goldbot;
\q
EOF
success "Database created"

# Setup goldbot directory
GOLDBOT_DIR="/opt/goldbot"
mkdir -p $GOLDBOT_DIR
cd $GOLDBOT_DIR

# Extract goldbot if package exists
if [ -f "$(pwd)/$GOLDBOT_PACKAGE" ]; then
    log "Extracting goldbot package..."
    tar -xzf $GOLDBOT_PACKAGE --strip-components=1
    success "Goldbot extracted"
else
    warning "Please ensure $GOLDBOT_PACKAGE is in $GOLDBOT_DIR"
fi

# Install Python packages with memory optimization
log "Installing Python packages with memory constraints..."
pip3 install --no-cache-dir --upgrade pip setuptools wheel

# Install packages one by one to avoid memory issues
PACKAGES=(
    "flask==2.3.3"
    "flask-sqlalchemy==3.0.5"
    "psycopg2-binary==2.9.7"
    "pandas==2.0.3"
    "numpy==1.24.4"
    "requests==2.31.0"
    "python-telegram-bot==20.6"
    "apscheduler==3.10.4"
    "pytz==2023.3"
    "plotly==5.17.0"
    "beautifulsoup4==4.12.2"
    "ta-lib==0.4.25"
)

for package in "${PACKAGES[@]}"; do
    log "Installing $package..."
    pip3 install --no-cache-dir "$package"
done

success "Python packages installed"

# Create optimized environment file
log "Creating optimized configuration..."
cat > .env << 'EOF'
# Goldbot Configuration - Optimized for 1GB RAM VPS
DATABASE_URL=postgresql://goldbot:goldbot_secure_2025!@localhost/goldbot
NAVASAN_API_KEY=freeL3ceMoBm2EaeVeuvHJvuGKTJcNcg
FLASK_ENV=production
FLASK_DEBUG=False
PYTHONHASHSEED=0
PYTHONOPTIMIZE=1

# Memory optimizations
MALLOC_MMAP_THRESHOLD_=65536
MALLOC_TRIM_THRESHOLD_=131072
MALLOC_TOP_PAD_=131072
MALLOC_MMAP_MAX_=65536
EOF

# Run auto-fix scripts if they exist
if [ -f "VPS_AUTO_FIX.py" ]; then
    log "Running VPS auto-fix..."
    python3 VPS_AUTO_FIX.py
fi

if [ -f "FINAL_PRODUCTION_FIXES.py" ]; then
    log "Running production fixes..."
    python3 FINAL_PRODUCTION_FIXES.py
fi

# Create systemd service with memory limits
log "Creating optimized systemd service..."
cat > /etc/systemd/system/goldbot.service << 'EOF'
[Unit]
Description=Gold Trading Bot - Optimized for 1GB RAM
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/goldbot
ExecStart=/usr/bin/python3 main.py
Restart=always
RestartSec=10

# Memory optimizations for 1GB RAM VPS
MemoryMax=700M
MemorySwapMax=300M
TasksMax=100
CPUQuota=80%

# Environment
Environment=PYTHONPATH=/opt/goldbot
Environment=PYTHONUNBUFFERED=1
Environment=PYTHONHASHSEED=0
Environment=PYTHONOPTIMIZE=1

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable goldbot

# Configure firewall
log "Configuring firewall..."
ufw allow ssh
ufw allow 5000/tcp
ufw --force enable

# Configure fail2ban for security
log "Configuring security..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
EOF

systemctl enable fail2ban
systemctl start fail2ban

# Create monitoring script
log "Creating monitoring tools..."
cat > monitor.sh << 'EOF'
#!/bin/bash
echo "🔍 Goldbot VPS Monitor - $(date)"
echo "==============================="
echo "💾 Memory Usage:"
free -h
echo ""
echo "💽 Disk Usage:"
df -h /opt/goldbot
echo ""
echo "🔧 Service Status:"
systemctl status goldbot --no-pager -l
echo ""
echo "🌐 Network:"
netstat -tlnp | grep :5000
echo ""
echo "📊 Top Processes:"
ps aux --sort=-%mem | head -10
EOF

chmod +x monitor.sh

# Create maintenance script
cat > maintenance.sh << 'EOF'
#!/bin/bash
echo "🔧 Running maintenance..."
# Clear logs older than 7 days
journalctl --vacuum-time=7d
# Clear Python cache
find /opt/goldbot -name "*.pyc" -delete
find /opt/goldbot -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
# Optimize database
sudo -u postgres vacuumdb --all --analyze
# Clear system cache
sync && echo 3 > /proc/sys/vm/drop_caches
echo "✅ Maintenance completed"
EOF

chmod +x maintenance.sh

# Set proper permissions
chown -R root:root $GOLDBOT_DIR
chmod 755 $GOLDBOT_DIR

# Start the service
log "Starting goldbot service..."
systemctl start goldbot

# Wait a moment for startup
sleep 5

# Check status
if systemctl is-active goldbot > /dev/null; then
    success "Goldbot service started successfully!"
else
    warning "Service may need manual check. Run: systemctl status goldbot"
fi

# Final summary
echo ""
echo "🎉 Installation completed successfully!"
echo "=============================================="
echo "📊 System Summary:"
echo "   RAM: ${TOTAL_RAM}MB (${AVAILABLE_GB}GB available)"
echo "   Swap: 1.5GB optimized"
echo "   Database: PostgreSQL (optimized)"
echo "   Service: goldbot (auto-start enabled)"
echo ""
echo "🌐 Access Information:"
echo "   Web Interface: http://$(curl -s ifconfig.me):5000"
echo "   Local Access: http://localhost:5000"
echo ""
echo "🔧 Management Commands:"
echo "   Status: systemctl status goldbot"
echo "   Logs: journalctl -u goldbot -f"
echo "   Monitor: ./monitor.sh"
echo "   Maintenance: ./maintenance.sh"
echo ""
echo "✅ Your 1GB RAM VPS is perfectly optimized for goldbot!"
echo "=============================================="