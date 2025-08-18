#!/bin/bash
# نصب یک کلیکه ربات طلا
# One-Click Install for Gold Trading Bot

set -e

# تنظیم رنگ‌ها
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_banner() {
    echo -e "${BLUE}"
    echo "=================================="
    echo "🤖 ربات هوشمند تحلیل طلا"
    echo "🚀 نصب خودکار یک کلیکه"
    echo "=================================="
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Main installation function
main() {
    print_banner
    
    # بررسی کاربر
    if [[ $EUID -eq 0 ]]; then
        print_error "لطفاً این اسکریپت را با کاربر عادی اجرا کنید (نه root)"
        exit 1
    fi
    
    # بررسی پایتون
    if ! command -v python3 &> /dev/null; then
        print_error "پایتون 3 یافت نشد"
        print_info "Ubuntu/Debian: sudo apt install python3 python3-pip"
        print_info "CentOS/RHEL: sudo yum install python3 python3-pip"
        exit 1
    fi
    
    print_success "پایتون یافت شد: $(python3 --version)"
    
    # نصب پیش‌نیازها
    print_info "نصب پیش‌نیازهای سیستم..."
    if command -v apt &> /dev/null; then
        sudo apt update -qq
        sudo apt install -y python3-pip python3-venv postgresql-client build-essential python3-dev libpq-dev curl git &> /dev/null
    elif command -v yum &> /dev/null; then
        sudo yum install -y python3-pip python3-devel postgresql-devel gcc curl git &> /dev/null
    elif command -v dnf &> /dev/null; then
        sudo dnf install -y python3-pip python3-devel postgresql-devel gcc curl git &> /dev/null
    fi
    print_success "پیش‌نیازها نصب شدند"
    
    # ایجاد محیط مجازی
    print_info "ایجاد محیط مجازی..."
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    source venv/bin/activate
    pip install --upgrade pip &> /dev/null
    print_success "محیط مجازی آماده"
    
    # نصب پکیج‌های پایتون
    print_info "نصب پکیج‌های پایتون..."
    
    # نصب پکیج‌های اصلی با ورژن‌های سازگار
    if [ -f "install_requirements_fixed.txt" ]; then
        pip install -r install_requirements_fixed.txt &> /dev/null
        print_success "پکیج‌ها از فایل نصب شدند"
    else
        # نصب دستی پکیج‌های اصلی با ورژن‌های درست
        pip install "flask>=3.0.0" "flask-sqlalchemy>=3.1.1" "psycopg2-binary>=2.9.9" "python-telegram-bot>=20.7" "pandas>=2.1.4" "numpy>=1.24.4" "plotly>=5.17.0" "apscheduler>=3.10.4" "pytz>=2023.3" "requests>=2.31.0" "beautifulsoup4>=4.12.2" "lxml>=4.9.4" "trafilatura>=1.6.4" "gunicorn>=21.2.0" "python-dotenv>=1.0.0" "python-dateutil>=2.8.2" &> /dev/null
        print_success "پکیج‌های اصلی نصب شدند"
    fi
    
    # تلاش برای نصب TA-Lib
    if pip install ta-lib &> /dev/null; then
        print_success "TA-Lib نصب شد"
    else
        print_warning "TA-Lib نصب نشد - نصب pandas-ta..."
        pip install "pandas-ta>=0.3.14" &> /dev/null
        print_success "pandas-ta نصب شد"
    fi
    
    # ایجاد فایل .env پیش‌فرض
    if [ ! -f ".env" ]; then
        print_info "ایجاد فایل تنظیمات پیش‌فرض..."
        cat > .env << 'EOF'
# تنظیمات ربات طلا - نصب خودکار
DATABASE_URL=sqlite:///goldbot.db
FLASK_SECRET_KEY=goldbot-auto-generated-secret-key
SERVER_PORT=5000
FLASK_ENV=production
TZ=Asia/Tehran

# اطلاعات تلگرام (از قبل تنظیم شده در کد)
TELEGRAM_BOT_TOKEN=7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y
TELEGRAM_CHANNEL_ID=-1002717718463
TELEGRAM_ADMIN_ID=1112066452

# API نواسان (کلید رایگان)
NAVASAN_API_KEY=freeL3ceMoBm2EaeVeuvHJvuGKTJcNcg

# تنظیمات اختیاری
ENABLE_TELEGRAM=true
ENABLE_PRICE_ALERTS=true
ENABLE_SIGNALS=true
ENABLE_ADMIN_PANEL=true
EOF
        print_success "فایل .env ایجاد شد"
    else
        print_warning "فایل .env موجود است - تغییری داده نشد"
    fi
    
    # ایجاد اسکریپت راه‌اندازی
    print_info "ایجاد اسکریپت راه‌اندازی..."
    cat > start.sh << 'EOF'
#!/bin/bash
# اسکریپت راه‌اندازی ربات طلا

echo "🚀 راه‌اندازی ربات طلا..."

# بارگذاری متغیرهای محیطی
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# فعال‌سازی محیط مجازی
source venv/bin/activate

# راه‌اندازی سرور
echo "🌐 شروع سرور روی پورت ${SERVER_PORT:-5000}"
exec gunicorn --bind 0.0.0.0:${SERVER_PORT:-5000} --workers 2 --timeout 120 --reload main:app
EOF
    chmod +x start.sh
    print_success "اسکریپت start.sh ایجاد شد"
    
    # ایجاد اسکریپت توقف
    cat > stop.sh << 'EOF'
#!/bin/bash
# توقف ربات طلا
echo "⏹️ توقف ربات طلا..."
pkill -f "gunicorn.*main:app" || echo "فرآیند یافت نشد"
echo "✅ ربات متوقف شد"
EOF
    chmod +x stop.sh
    print_success "اسکریپت stop.sh ایجاد شد"
    
    # مقداردهی دیتابیس
    print_info "مقداردهی دیتابیس..."
    export $(cat .env | grep -v '^#' | xargs)
    source venv/bin/activate
    python3 -c "
from main import initialize_app
try:
    app = initialize_app()
    print('✅ دیتابیس آماده شد')
except Exception as e:
    print(f'⚠️ خطا در دیتابیس: {e}')
" 2>/dev/null
    
    # ایجاد سرویس systemd (اختیاری)
    if command -v systemctl &> /dev/null; then
        print_info "ایجاد سرویس systemd..."
        cat > goldbot.service << EOF
[Unit]
Description=Gold Trading Bot
After=network.target

[Service]
Type=exec
User=$(whoami)
WorkingDirectory=$(pwd)
ExecStart=$(pwd)/start.sh
Restart=always
RestartSec=10
Environment=PATH=$(pwd)/venv/bin
EnvironmentFile=$(pwd)/.env

[Install]
WantedBy=multi-user.target
EOF
        print_success "فایل سرویس goldbot.service ایجاد شد"
        print_info "برای فعال‌سازی سرویس:"
        print_info "  sudo cp goldbot.service /etc/systemd/system/"
        print_info "  sudo systemctl daemon-reload"
        print_info "  sudo systemctl enable goldbot.service"
        print_info "  sudo systemctl start goldbot.service"
    fi
    
    # تست سریع
    print_info "تست سریع سیستم..."
    source venv/bin/activate
    if python3 -c "from main import initialize_app; initialize_app()" &> /dev/null; then
        print_success "تست موفق - سیستم آماده کار است"
    else
        print_warning "تست ناموفق - ممکن است نیاز به تنظیمات اضافی باشد"
    fi
    
    # نمایش نتیجه نهایی
    echo
    print_banner
    print_success "نصب کامل شد!"
    echo
    print_info "🚀 برای شروع:"
    echo "   ./start.sh"
    echo
    print_info "🌐 آدرس دسترسی:"
    echo "   http://localhost:${SERVER_PORT:-5000}"
    echo "   http://$(hostname -I | awk '{print $1}'):${SERVER_PORT:-5000}"
    echo
    print_info "⏹️ برای توقف:"
    echo "   ./stop.sh"
    echo
    print_info "📁 فایل‌های مهم:"
    echo "   .env        - تنظیمات"
    echo "   start.sh    - راه‌اندازی"
    echo "   stop.sh     - توقف"
    echo "   goldbot.db  - دیتابیس"
    echo
    print_success "ربات آماده استفاده است!"
}

# اجرای تابع اصلی
main "$@"