# راهنمای نصب سیستم جامع تحلیل، سیگنال‌دهی و اعلام قیمت طلا و ارز

## مشخصات سرور
- **OS**: Debian 12 x64  
- **RAM**: 1 GB
- **Storage**: 25 GB
- **CPU**: 1 vCPU
- **IP**: 45.195.250.226
- **Location**: Amsterdam

## 🚀 مراحل نصب

### 1. آپدیت سیستم
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. نصب Node.js
```bash
# نصب Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# تایید نصب
node --version
npm --version
```

### 3. نصب PM2 برای مدیریت پروسه‌ها
```bash
sudo npm install -g pm2
```

### 4. ایجاد کاربر برای پروژه
```bash
sudo adduser goldbot
sudo usermod -aG sudo goldbot
```

### 5. آپلود و استخراج فایل‌ها
```bash
# انتقال فایل zip به سرور
scp gold-analysis-system.zip goldbot@45.195.250.226:/home/goldbot/

# وارد شدن به سرور
ssh goldbot@45.195.250.226

# استخراج فایل‌ها
cd /home/goldbot
unzip gold-analysis-system.zip
cd gold-analysis-system
```

### 6. نصب Dependencies
```bash
npm install
```

### 7. تنظیم متغیرهای محیطی
```bash
# ایجاد فایل .env
cp .env.example .env

# ویرایش فایل .env
nano .env
```

محتویات `.env`:
```env
# Telegram Bot Configuration
BOT_TOKEN=7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y
ADMIN_ID=1112066452
CHANNEL_ID=-1002717718463

# API Keys
NAVASAN_API_KEY=freeBY5YCsWyaVmR7DSu2QOLTH0KBsbu

# Server Configuration
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=./database.sqlite
```

### 8. ساخت پروژه
```bash
npm run build
```

### 9. راه‌اندازی با PM2
```bash
# شروع پروژه
pm2 start ecosystem.config.js

# ذخیره تنظیمات PM2
pm2 save

# تنظیم PM2 برای شروع خودکار
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u goldbot --hp /home/goldbot
```

### 10. تنظیم Nginx (اختیاری)
```bash
sudo apt install nginx -y

# تنظیم فایل کانفیگ
sudo nano /etc/nginx/sites-available/goldbot
```

محتویات فایل nginx:
```nginx
server {
    listen 80;
    server_name 45.195.250.226;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/goldbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 11. تنظیم فایروال
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5000
sudo ufw enable
```

## 🤖 راهنمای استفاده

### دسترسی به پنل مدیریت
- آدرس: `http://45.195.250.226:5000`
- یا با nginx: `http://45.195.250.226`

### مدیریت سرویس‌ها
```bash
# مشاهده وضعیت
pm2 status

# ری‌استارت
pm2 restart goldbot

# مشاهده لاگ‌ها
pm2 logs goldbot

# توقف
pm2 stop goldbot

# حذف از PM2
pm2 delete goldbot
```

### بک‌آپ دیتابیس
```bash
# بک‌آپ دستی
cp database.sqlite backup_$(date +%Y%m%d_%H%M%S).sqlite

# تنظیم بک‌آپ خودکار (crontab)
crontab -e

# اضافه کردن خط زیر برای بک‌آپ روزانه
0 2 * * * cd /home/goldbot/gold-analysis-system && cp database.sqlite backup_$(date +\%Y\%m\%d).sqlite
```

## 📋 چک‌لیست نصب

- [ ] Node.js و npm نصب شده
- [ ] PM2 نصب شده  
- [ ] فایل‌های پروژه استخراج شده
- [ ] Dependencies نصب شده
- [ ] فایل .env تنظیم شده
- [ ] پروژه build شده
- [ ] PM2 راه‌اندازی شده
- [ ] Nginx تنظیم شده (اختیاری)
- [ ] فایروال تنظیم شده
- [ ] دسترسی به پنل تست شده

## 🛠 عیب‌یابی

### مشکلات رایج:

1. **خطای پورت در حال استفاده**
```bash
sudo lsof -i :5000
sudo kill -9 [PID]
```

2. **خطای دسترسی فایل**
```bash
sudo chown -R goldbot:goldbot /home/goldbot/gold-analysis-system
```

3. **خطای PM2**
```bash
pm2 kill
pm2 start ecosystem.config.js
```

4. **مشاهده لاگ‌های کامل**
```bash
pm2 logs goldbot --lines 100
```

## 🔄 بروزرسانی سیستم

```bash
# دانلود فایل جدید
cd /home/goldbot
rm -rf gold-analysis-system-old
mv gold-analysis-system gold-analysis-system-old
unzip gold-analysis-system-new.zip
cd gold-analysis-system

# کپی تنظیمات قبلی
cp ../gold-analysis-system-old/.env .
cp ../gold-analysis-system-old/database.sqlite .

# نصب و راه‌اندازی مجدد
npm install
npm run build
pm2 restart goldbot
```

## 📞 پشتیبانی

- تمام ربات‌ها باید در وضعیت "running" باشند
- چک کردن وضعیت از پنل: `/api/bots/status`
- در صورت مشکل لاگ‌ها را بررسی کنید: `pm2 logs`

## 🕐 زمان‌بندی ربات‌ها

- **ربات تحلیل‌گر**: دوشنبه-جمعه 10:10 و 16:16، یکشنبه 10:10 و 16:16
- **ربات سیگنال**: دوشنبه-جمعه 8:00-21:00 هر 15 دقیقه  
- **ربات قیمت**: شنبه-پنج‌شنبه 11:11، 14:14، 17:17
- **بارگذاری اخبار**: هر شنبه به صورت دستی

## ✅ تست نهایی

1. دسترسی به `http://45.195.250.226:5000`
2. مشاهده داشبورد و وضعیت ربات‌ها
3. تست دکمه‌های "تست تحلیل"، "تست سیگنال"، "ارسال قیمت"
4. بررسی عملکرد در کانال تلگرام
5. آپلود فایل CSV اخبار در صفحه News

سیستم آماده و عملیاتی است! 🚀