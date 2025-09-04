# 🚀 دستورات نصب گلدربات - Goldbot Installation Commands

## نصب یک‌خطی در سرور (پیشنهادی)

```bash
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/GOLDBOT_INSTALL_FINAL.sh | sudo bash
```

## نصب دستی

```bash
# 1. دانلود بسته
wget https://github.com/mehradamiri021/goldbot/releases/latest/download/goldbot-production-ready.tar.gz

# 2. استخراج  
tar -xzf goldbot-production-ready.tar.gz
cd goldbot

# 3. اجرا
sudo ./GOLDBOT_INSTALL_FINAL.sh
```

## بعد از نصب

- **دسترسی:** http://IP_SERVER
- **مدیریت:** در `/opt/goldbot/` اسکریپت‌های start.sh, stop.sh, status.sh موجود هستند
- **لاگ‌ها:** `sudo -u goldbot pm2 logs goldbot`

## ویژگی‌های فعال

✅ **4 ربات تلگرام:** Price, Analysis, Signal, Main Bot  
✅ **وب پنل فارسی:** طراحی RTL مدرن  
✅ **API کامل:** تمام endpoint ها فعال  
✅ **داده‌های MT5:** از مسیر `/root/.wine/drive_c/Program Files/Capitalxtend LLC MT5 Terminal/MQL5/Files`  
✅ **API نوسان:** کلید فعال `freeBY5YCsWyaVmR7DSu2QOLTH0KBsbu`  
✅ **nginx + PM2:** production-ready deployment

## مشکلات رایج

**مشکل: tsx not found**
```bash
cd /opt/goldbot
npm install tsx --save-dev
sudo -u goldbot pm2 restart goldbot
```

**مشکل: دسترسی خارجی**
```bash
sudo ufw allow 80
sudo systemctl restart nginx
```