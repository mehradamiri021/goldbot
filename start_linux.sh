#!/bin/bash
# اسکریپت راه‌اندازی لینوکس/مک
# Linux/Mac Startup Script

# رنگ‌ها
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}     ربات تحلیل طلا${NC}"
echo -e "${BLUE}     Gold Trading Bot${NC}"
echo -e "${BLUE}====================================${NC}"
echo

# انتقال به دایرکتوری پروژه
cd "$(dirname "$0")"

# بررسی وجود محیط مجازی
if [ ! -d "venv" ]; then
    echo -e "${RED}❌ محیط مجازی یافت نشد. لطفاً ابتدا install.py را اجرا کنید${NC}"
    echo -e "${RED}❌ Virtual environment not found. Please run install.py first${NC}"
    exit 1
fi

# بررسی وجود فایل .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  فایل .env یافت نشد. از .env.example کپی می‌شود...${NC}"
    echo -e "${YELLOW}⚠️  .env file not found. Copying from .env.example...${NC}"
    
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ فایل .env ایجاد شد. لطفاً تنظیمات خود را وارد کنید${NC}"
        echo -e "${GREEN}✅ .env file created. Please enter your settings${NC}"
        echo -e "${YELLOW}فایل .env را ویرایش کرده و مجدداً اسکریپت را اجرا کنید${NC}"
        echo -e "${YELLOW}Edit .env file and run the script again${NC}"
        exit 1
    else
        echo -e "${RED}❌ فایل .env.example یافت نشد${NC}"
        echo -e "${RED}❌ .env.example file not found${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}🚀 در حال راه‌اندازی ربات...${NC}"
echo -e "${GREEN}🚀 Starting bot...${NC}"
echo

# فعال‌سازی محیط مجازی
source venv/bin/activate

# بررسی وجود فایل main.py
if [ ! -f "main.py" ]; then
    echo -e "${RED}❌ فایل main.py یافت نشد${NC}"
    echo -e "${RED}❌ main.py file not found${NC}"
    exit 1
fi

# نمایش اطلاعات سیستم
echo -e "${BLUE}📊 اطلاعات سیستم:${NC}"
echo -e "${BLUE}📊 System Information:${NC}"
echo "Python: $(python --version)"
echo "Working Directory: $(pwd)"
echo

# اجرای برنامه
python main.py

# بررسی وضعیت خروج
if [ $? -eq 0 ]; then
    echo
    echo -e "${GREEN}✅ برنامه با موفقیت بسته شد${NC}"
    echo -e "${GREEN}✅ Application closed successfully${NC}"
else
    echo
    echo -e "${RED}❌ خطا در اجرای برنامه${NC}"
    echo -e "${RED}❌ Error running application${NC}"
    echo -e "${YELLOW}برای مشاهده جزئیات خطا، لاگ‌ها را بررسی کنید${NC}"
    echo -e "${YELLOW}Check logs for error details${NC}"
fi

echo
read -p "برای خروج Enter را فشار دهید (Press Enter to exit): " -r