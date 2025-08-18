#!/bin/bash
# اسکریپت نصب سرویس لینوکس
# Linux Service Installation Script

set -e

# رنگ‌ها برای خروجی
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== نصب سرویس ربات تحلیل طلا ===${NC}"
echo -e "${GREEN}=== Gold Trading Bot Service Installation ===${NC}"

# بررسی دسترسی root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}لطفاً با دسترسی sudo اجرا کنید${NC}"
    echo -e "${RED}Please run with sudo privileges${NC}"
    exit 1
fi

# دریافت مسیر پروژه
PROJECT_DIR=$(pwd)
echo -e "${YELLOW}مسیر پروژه: ${PROJECT_DIR}${NC}"
echo -e "${YELLOW}Project path: ${PROJECT_DIR}${NC}"

# دریافت نام کاربری
read -p "نام کاربری برای اجرای سرویس (Username to run service): " USERNAME

# بررسی وجود کاربر
if ! id "$USERNAME" &>/dev/null; then
    echo -e "${RED}کاربر $USERNAME وجود ندارد${NC}"
    echo -e "${RED}User $USERNAME does not exist${NC}"
    exit 1
fi

# آماده‌سازی فایل سرویس
SERVICE_FILE="/etc/systemd/system/goldbot.service"
echo -e "${YELLOW}ایجاد فایل سرویس...${NC}"
echo -e "${YELLOW}Creating service file...${NC}"

cat > $SERVICE_FILE << EOF
[Unit]
Description=Gold Trading Bot - ربات تحلیل طلا
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
WorkingDirectory=${PROJECT_DIR}
User=${USERNAME}
Group=${USERNAME}

Environment=PATH=${PROJECT_DIR}/venv/bin
Environment=PYTHONPATH=${PROJECT_DIR}

ExecStart=${PROJECT_DIR}/venv/bin/python ${PROJECT_DIR}/main.py

Restart=always
RestartSec=10
KillMode=mixed
TimeoutStopSec=5

StandardOutput=journal
StandardError=journal
SyslogIdentifier=goldbot

[Install]
WantedBy=multi-user.target
EOF

# تنظیم مجوزها
chown ${USERNAME}:${USERNAME} ${PROJECT_DIR} -R
chmod +x ${PROJECT_DIR}/main.py

# بارگذاری مجدد systemd
echo -e "${YELLOW}بارگذاری مجدد systemd...${NC}"
echo -e "${YELLOW}Reloading systemd...${NC}"
systemctl daemon-reload

# فعال‌سازی سرویس
echo -e "${YELLOW}فعال‌سازی سرویس...${NC}"
echo -e "${YELLOW}Enabling service...${NC}"
systemctl enable goldbot.service

# راه‌اندازی سرویس
echo -e "${YELLOW}راه‌اندازی سرویس...${NC}"
echo -e "${YELLOW}Starting service...${NC}"
systemctl start goldbot.service

# بررسی وضعیت
echo -e "${GREEN}بررسی وضعیت سرویس:${NC}"
echo -e "${GREEN}Service status check:${NC}"
systemctl status goldbot.service --no-pager

echo -e "${GREEN}=== نصب سرویس کامل شد ===${NC}"
echo -e "${GREEN}=== Service installation completed ===${NC}"

echo -e "${YELLOW}دستورات مفید:${NC}"
echo -e "${YELLOW}Useful commands:${NC}"
echo "sudo systemctl start goldbot     # راه‌اندازی"
echo "sudo systemctl stop goldbot      # توقف"
echo "sudo systemctl restart goldbot   # راه‌اندازی مجدد"
echo "sudo systemctl status goldbot    # وضعیت"
echo "sudo journalctl -u goldbot -f    # مشاهده لاگ‌ها"