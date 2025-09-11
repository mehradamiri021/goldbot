# راهنمای نصب Goldbot در سرور

## مراحل نصب

1. **آپلود فایل‌ها:**
   ```bash
   # آپلود و استخراج فایل tar.gz
   tar -xzf goldbot-server-ready.tar.gz
   cd goldbot/
   ```

2. **نصب Dependencies:**
   ```bash
   npm install
   ```

3. **تنظیم Environment Variables:**
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   **ویرایش کنید:**
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_ADMIN_ID=your_admin_id  
   TELEGRAM_CHANNEL_ID=your_channel_id
   NAVASAN_API_KEY=your_navasan_key
   PORT=5000
   ```

4. **Build برای Production:**
   ```bash
   npm run build
   ```

5. **اجرای سرور:**
   ```bash
   # روش 1: مستقیم
   npm start
   
   # روش 2: با PM2
   npm install -g pm2
   pm2 start dist/index.js --name goldbot
   ```

6. **دسترسی به وب کنسول:**
   - آدرس: `http://server-ip:5000`
   - پنل مدیریت کامل ربات‌ها
   - قابلیت بروزرسانی قیمت‌ها
   - نمایش وضعیت لایو ربات‌ها

## نکات مهم

✅ **وب کنسول شامل:**
- داشبورد اصلی با header زیبا
- مدیریت 4 ربات تلگرام
- بروزرسانی قیمت‌ها
- نمایش سیگنال‌ها و اخبار
- لاگ‌ها و تنظیمات

✅ **پورت‌ها:**
- پورت 5000: وب کنسول اصلی
- API endpoints در همان پورت

✅ **امنیت:**
- همه کلیدها در .env محفوظ
- دسترسی محلی یا VPN توصیه می‌شود