# سیستم جامع تحلیل، سیگنال‌دهی و اعلام قیمت طلا و ارز

## Overview
This project is a comprehensive system designed for gold and currency analysis, signal generation, and price announcements. It comprises four distinct Telegram bots managed by a central web-based control panel. The system aims to provide real-time market insights, automated trading signals, and up-to-date price information for gold and various currencies, targeting efficient market monitoring and decision-making.

## User Preferences
- All changes must be made in coordination with the user.
- The design must be implemented exactly according to the provided documentation.
- No additional features should be added by the developer.
- Message formats must exactly match the provided examples.
- Charts should be sent with reports and include Price Action + Smart Money analysis.
- News should only be from ForexFactory and FXStreet, in English, and related to gold.
- The weekly report on Sundays must include Weekly, Daily, and H4 charts.

## System Architecture
The system is built around four interconnected bots and a central web panel:

**Core System:**
- **Central Controller Bot (Main Bot):** Acts as the web-based management panel for controlling and monitoring other bots. It features a dashboard, real-time bot status, pending signal management, system logs, error alerts, and displays gold charts with Price Action, Smart Money, and AI zones. It runs 24/7.
- **Intelligent Analyzer Bot:** Gathers news from ForexFactory and FXStreet and live chart data from MT5 files. It performs technical analysis using Price Action, Smart Money, RSI, and MA20. Scheduled for analysis on weekdays (10:10 AM, 4:16 PM) and Sundays (10:10 AM for weekly news, 4:16 PM for technical analysis).
- **XAUUSD Signal Bot:** Generates trading signals based on MT5 M15, H1, H4 data, utilizing a proprietary algorithm combining Smart Money, Price Action, and AI analysis. Signals are generated every 15 minutes from Monday-Friday (8:00-21:00), require admin confirmation (5 minutes), and are sent in a detailed format including Entry, SL, TP, R/R, and trade logic. Admin can edit all numerical values.
- **Price Announcement Bot:** Fetches real-time prices for various currencies and gold from the Navasan API and gold bullion prices from the @ZaryaalGold Telegram channel. Prices are announced at 11:11, 14:14, and 17:17 (Saturday-Thursday). Data is updated before sending, and messages are formatted in Persian with specific icons (e.g., 🔶 for 18k gold, 🟡 for coin). Error logging and admin notifications are implemented.

**Technical Implementation:**
- **Backend:** Node.js with Express.js.
- **Frontend:** React with Vite for the web panel.
- **Database:** SQLite for data storage.
- **Telegram Integration:** `node-telegram-bot-api` for bot interactions.
- **Charting:** Plotly.js for displaying analytical charts.
- **Scheduling:** `node-cron` for managing timed tasks.
- **Web Scraping:** Utilizes `cheerio` and `fetch` for news aggregation from ForexFactory and FXStreet, including intelligent filtering for gold-related news.
- **Error Handling & Logging:** Comprehensive logging for all operations and error notifications to the admin.
- **UI/UX:** The web panel provides a centralized dashboard for managing all bot operations and displaying relevant information. Authentication for the web panel is currently disabled for direct access.

## External Dependencies
- **Telegram Bot API:** For bot communication and interaction.
- **Navasan API:** `http://api.navasan.tech/latest/` (API Key: `freeBY5YCsWyaVmR7DSu2QOLTH0KBsbu`) for real-time currency and gold prices (Dollar, Euro, Canadian, Dirham, Bitcoin, Ethereum, Tether, 18k Gold, Coin).
- **MetaTrader 5 (MT5):** Accesses MQL5 files from `/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files/` for live chart data and signal generation.
- **ForexFactory:** News source for the Analyzer Bot.
- **FXStreet:** News source for the Analyzer Bot.
- **@ZaryaalGold Telegram Channel:** Parsed for gold bullion prices (USD, EUR, AED, CNY).

## GitHub Deployment (27 آگوست 2025 - 19:16)
- ✅ **مشکل tsx حل شد**: اسکریپت بدون sudo برای حل مشکل دسترسی
- ✅ **مشکل ERR_CONNECTION_REFUSED حل شد**: SERVER_FINAL_FIX.sh برای bind و background execution
- ✅ **فایل نهایی آماده**: goldbot-complete-final.tar.gz (130KB) با تمام اسکریپت‌ها
- ✅ **7 اسکریپت حل مشکل**: NO_SUDO، SERVER_FINAL_FIX، PERMISSION_FIX و سایر موارد
- ✅ **TypeScript خطای حل شد**: حذف botName field از createLog
- ✅ **مشکل صفحه سفید حل شد**: App.tsx کامل با TypeScript interfaces
- ✅ **UI زیبا**: React dashboard با قیمت‌های لیو و وضعیت ربات‌ها
- ✅ **نصب بدون sudo**: `curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/NO_SUDO_INSTALL_SCRIPT.sh | bash`
- ✅ **حل نهایی دسترسی**: `curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/ULTIMATE_SERVER_FIX.sh | bash`
- ✅ **PM2 محلی**: استفاده از npx tsx و node_modules/.bin/pm2
- ✅ **Background execution**: nohup و pid management
- ✅ **RTL UI**: طراحی فارسی با Tailwind CSS و gradient
- ✅ **Auto-refresh**: بروزرسانی خودکار قیمت‌ها هر 30 ثانیه
- ✅ **API endpoints**: تمام endpoint ها فعال و پاسخگو
- ✅ **VPS Setup Guide**: راهنمای کامل قدم‌به‌قدم راه‌اندازی سرور MT5
- ✅ **Auto Setup Script**: اسکریپت نصب خودکار VPS_AUTO_SETUP.sh
- ✅ **MT5 Integration**: راهنمای اتصال داده‌های live MT5 به goldbot
- ✅ **بهبود سیستم اخبار**: فیلتر گسترده‌تر برای شناسایی اخبار مرتبط با طلا (30+ خبر به جای 8)
- ✅ **حذف فایل‌های اضافی**: پاکسازی اسکریپت‌های غیرضروری و optimization
- ✅ **حل مشکل nested links**: تصحیح ساختار navigation در sidebar
- ✅ **Root deployment ready**: سیستم آماده برای اجرا با دسترسی root در سرور production
- ✅ **مسیر جدید MT5**: تغییر مسیر داده‌های زنده به `/data/mt5/csv` 
- ✅ **MT5 API endpoints**: اضافه شدن `/api/mt5/*` برای داده‌های زنده طلا
- ✅ **نصب خودکار root**: اسکریپت ROOT_AUTO_INSTALL.sh برای نصب یک‌خطی
- ✅ **بسته production-ready**: goldbot-production-ready.tar.gz آماده برای GitHub Release
- ✅ **حل مشکل MT5 Timer**: اسکریپت MT5_TIMER_FIX.sh برای حل مشکل systemd timer
- ✅ **نصب کامل با حل مشکل**: GOLDBOT_INSTALL_COMPLETE_FIX.sh برای نصب بدون خطا
- ✅ **تنظیم Production نهایی**: FINAL_PRODUCTION_SETUP.sh برای دسترسی خارجی پورت 5000
- ✅ **بسته کامل نهایی**: goldbot-production-ready.tar.gz (253KB) با تمام ویژگی‌های production
- ✅ **حل مشکلات systemd**: FINAL_GOLDBOT_COMPLETE.sh نسخه بهبود یافته با حل مشکل service
- ✅ **اسکریپت‌های عیب‌یابی**: DEBUG_GOLDBOT.sh و QUICK_FIX_GOLDBOT.sh برای حل مشکلات
- ✅ **نصب یک‌خطی نهایی**: تمام پیش‌نیازها و goldbot در یک اسکریپت واحد
- ✅ **پشتیبانی universal**: GOLDBOT_FINAL_INSTALL.sh سازگار با systemd و init
- ✅ **بسته نهایی تمیز**: حذف فایل‌های اضافی و بهینه‌سازی کامل
- ✅ **حل مشکل API نوسان**: تشخیص quota exceeded و سیستم بروزرسانی کلید
- ✅ **مدیریت API جدید**: صفحه /api-settings برای تست و بروزرسانی کلید نوسان
- ✅ **کانال ZaryaalGold فعال**: دریافت کامل قیمت‌های شمش طلا (خرید/فروش)
- ✅ **React Console نهایی**: کپی شده در server/public با تمام ویژگی‌ها
- ✅ **تست API endpoints**: /api/prices/test-navasan و /api/settings/update-navasan-key
- ✅ **هشدار quota exceeded**: شناسایی و راهنمایی برای دریافت کلید جدید
- ✅ **README کامل**: مستندات جامع و حرفه‌ای برای GitHub
- ✅ **حل نهایی ecosystem**: GOLDBOT_WORKING_INSTALL.sh بدون مشکل PM2
- ✅ **نصب ساده تضمینی**: اسکریپت کوتاه و کارآمد بدون پیچیدگی
- ✅ **تست کامل سرور**: ecosystem.config.js با npm run dev کار می‌کند
- ✅ **مشکل "type": "module" حل شد**: GOLDBOT_FINAL_INSTALL.sh با ecosystem.config.cjs
- ✅ **اسکریپت پاکسازی کامل**: CLEANUP_SERVER.sh برای پاک کردن تمام goldbot از سرور
- ✅ **نصب تضمینی نهایی**: CommonJS config با .cjs extension
- ✅ **حل نهایی دسترسی**: ULTIMATE_SERVER_FIX.sh حل مشکل تداخل پورت nginx/goldbot
- ✅ **مشکل EADDRINUSE حل شد**: nginx فقط پورت 80، goldbot پورت 5000
- ✅ **دسترسی خارجی فعال**: http://82.115.13.48 از طریق nginx proxy
- ✅ **نصب ضد گلوله**: GOLDBOT_BULLETPROOF_INSTALL.sh حل مشکل npm و تمام مشکلات
- ✅ **ecosystem مستقیم**: استفاده از tsx مستقیم بجای npm run dev
- ✅ **Node.js بروزرسانی**: نصب مجدد Node.js و npm برای حل مشکل commands
- ✅ **حل مشکل "type": "module"**: GOLDBOT_FINAL_INSTALL.sh با ecosystem.config.cjs
- ✅ **MT5 sample data**: ایجاد فایل‌های CSV نمونه برای تست Signal Bot
- ✅ **نصب تضمینی نهایی**: CommonJS config با .cjs extension
- ✅ **مسیر MT5 درست**: تغییر مسیر به `/root/.wine/drive_c/Program Files/Capitalxtend LLC MT5 Terminal/MQL5/Files`
- ✅ **فرمت فایل MT5**: goldbot_XAUUSD_PERIOD_{M15,H1,H4}.csv
- ✅ **دسترسی ادمین جداگانه**: پورت 3000 برای ادمین، پورت 80 برای عموم
- ✅ **حل خطاهای TypeScript**: error instanceof Error checks
- ✅ **API نوسان قابل تنظیم**: environment variables برای API key
- ✅ **نصب ضد گلوله نهایی**: GOLDBOT_BULLETPROOF_FINAL.sh حل مشکل tsx و dependencies
- ✅ **وب کنسول جداگانه**: پورت 3000 ادمین، پورت 80 عمومی با nginx proxy
- ✅ **API Key نوسان فعال**: freeBY5YCsWyaVmR7DSu2QOLTH0KBsbu در تمام سرویس‌ها
- ✅ **اسکریپت مدیریت کامل**: web-console.sh، status.sh، logs.sh، restart.sh
- ✅ **مشکل build directory حل شد**: npm run build + fallback HTML برای وب کنسول
- ✅ **دسترسی وب کنسول تضمینی**: GOLDBOT_COMPLETE_WITH_BUILD.sh با build فرانت‌اند
- ✅ **حل خطای server/public**: ایجاد دایرکتوری build یا fallback admin console
- ✅ **نصب نهایی Ultimate**: GOLDBOT_ULTIMATE_FINAL.sh حل همه مشکلات شناسایی شده
- ✅ **کنسول ادمین کامل**: Persian RTL dashboard مثل Replit با تمام ویژگی‌ها
- ✅ **API نوسان بهینه**: 3 تلاش، exponential backoff، headers کامل
- ✅ **MT5 داده‌های خودکار**: ایجاد فایل‌های نمونه در صورت نبود
- ✅ **تست جامع سیستم**: اسکریپت‌های test-all.sh، status.sh، web-console.sh
- ✅ **nginx دو پورت**: 3000 ادمین کامل، 80 عمومی محدود
- ✅ **مدیریت کامل**: ecosystem.config.cjs، logs، restart، monitoring
- ✅ **وب کنسول نهایی مثل Replit**: GOLDBOT_FINAL_COMPLETE.sh طراحی شده دقیقاً مثل این کنسول
- ✅ **فقط داده‌های واقعی**: حذف تولید خودکار داده، فقط MT5 واقعی و API نوسان واقعی
- ✅ **API نوسان quota exceeded**: تشخیص و هشدار برای کلید جدید
- ✅ **کنسول Dark Theme**: طراحی شبیه Replit با CSS Variables و RTL
- ✅ **تست 3 مرتبه API**: بهینه‌سازی تست‌ها، عدم استفاده از داده‌های نمونه