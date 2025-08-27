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

## GitHub Deployment (27 آگوست 2025 - 17:40)
- ✅ **مشکل tsx حل شد**: اسکریپت بدون sudo برای حل مشکل دسترسی
- ✅ **فایل tar.gz آماده**: goldbot-complete-final.tar.gz (126KB) قابل دانلود
- ✅ **چند روش نصب**: NO_SUDO_INSTALL_SCRIPT.sh، PERMISSION_FIX_SCRIPT.sh
- ✅ **مشکل صفحه سفید حل شد**: App.tsx کامل با TypeScript interfaces
- ✅ **UI زیبا**: React dashboard با قیمت‌های لیو و وضعیت ربات‌ها
- ✅ **نصب بدون sudo**: `curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/NO_SUDO_INSTALL_SCRIPT.sh | bash`
- ✅ **PM2 محلی**: استفاده از npx tsx و node_modules/.bin/pm2
- ✅ **RTL UI**: طراحی فارسی با Tailwind CSS و gradient
- ✅ **Auto-refresh**: بروزرسانی خودکار قیمت‌ها هر 30 ثانیه
- ✅ **API endpoints**: تمام endpoint ها فعال و پاسخگو