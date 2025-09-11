# 🚀 GOLDBOT نصب ساده

## فایل‌های مورد نیاز:

✅ `SIMPLE_INSTALL.sh` - اسکریپت نصب  
✅ `goldbot.tar.gz` - کدهای برنامه  

## نحوه نصب:

### 1. آپلود فایل‌ها به سرور:
```bash
scp SIMPLE_INSTALL.sh root@YOUR-SERVER:/root/
scp goldbot.tar.gz root@YOUR-SERVER:/root/
```

### 2. ورود به سرور و نصب:
```bash
ssh root@YOUR-SERVER
cd /root
sudo bash SIMPLE_INSTALL.sh
```

## تست عملکرد:
```bash
pm2 status           # بررسی وضعیت
pm2 logs goldbot      # مشاهده لاگ‌ها
curl http://localhost:5000/api/prices   # تست API
```

## دسترسی:
- **وب کنسول:** `http://YOUR-SERVER-IP`
- **API:** `http://YOUR-SERVER-IP/api`

## مدیریت:
```bash
pm2 restart goldbot   # ریستارت
pm2 stop goldbot      # توقف  
pm2 start goldbot     # شروع
```

---
**✅ ساده، مطمئن، بدون پیچیدگی اضافی**