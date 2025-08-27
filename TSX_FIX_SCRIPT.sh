#!/bin/bash

# 🔧 حل فوری مشکل tsx not found - goldbot
# ==========================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

echo "🔧 حل فوری مشکل tsx - goldbot"
echo "=================================="

# توقف PM2
print_warning "توقف PM2..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# نصب tsx globally
if ! command -v tsx &> /dev/null; then
    print_warning "نصب tsx globally..."
    npm install -g tsx
else
    print_success "tsx قبلاً نصب شده"
fi

# بررسی tsx
print_warning "بررسی tsx..."
if command -v tsx &> /dev/null; then
    print_success "tsx در PATH موجود است: $(which tsx)"
else
    print_error "tsx هنوز در PATH موجود نیست"
    print_warning "تلاش برای اضافه کردن به PATH..."
    
    # اضافه کردن npm global bin به PATH
    NPM_BIN=$(npm bin -g 2>/dev/null)
    if [ -d "$NPM_BIN" ]; then
        export PATH="$NPM_BIN:$PATH"
        echo "export PATH=\"$NPM_BIN:\$PATH\"" >> ~/.bashrc
        print_success "PATH بروزرسانی شد"
    fi
fi

# رفتن به مسیر پروژه
cd $HOME/goldbot 2>/dev/null || {
    print_error "مسیر goldbot یافت نشد"
    print_warning "آیا پروژه نصب شده است؟"
    exit 1
}

# بررسی ecosystem.config.cjs
if [ -f "ecosystem.config.cjs" ]; then
    print_success "فایل ecosystem.config.cjs موجود است"
else
    print_warning "ایجاد ecosystem.config.cjs..."
    cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'goldbot',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx/esm',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF
fi

# ایجاد مسیر لاگ
mkdir -p logs

# بررسی نهایی tsx
print_warning "تست نهایی tsx..."
if command -v tsx &> /dev/null; then
    print_success "tsx آماده استفاده: $(tsx --version)"
    
    # راه‌اندازی مجدد با PM2
    print_warning "راه‌اندازی مجدد با PM2..."
    pm2 start ecosystem.config.cjs
    pm2 save
    
    sleep 3
    
    # تست API
    API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/prices 2>/dev/null || echo "000")
    
    if [ "$API_STATUS" = "200" ]; then
        print_success "🎉 مشکل حل شد! سیستم فعال است"
        print_success "وب پنل: http://localhost:5000"
    else
        print_warning "سیستم راه‌اندازی شد اما API پاسخ نمی‌دهد"
        print_warning "لاگ PM2 را بررسی کنید: pm2 logs goldbot"
    fi
else
    print_error "tsx هنوز کار نمی‌کند"
    print_warning "لطفاً دستی اجرا کنید:"
    echo "sudo npm install -g tsx"
    echo "pm2 start ecosystem.config.cjs"
fi

echo ""
echo "📋 دستورات مفید:"
echo "   pm2 status              # وضعیت"
echo "   pm2 logs goldbot        # لاگ‌ها"  
echo "   pm2 restart goldbot     # راه‌اندازی مجدد"
echo "   which tsx               # بررسی tsx"
echo ""