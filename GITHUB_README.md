# سیستم جامع تحلیل، سیگنال‌دهی و اعلام قیمت طلا و ارز (Goldbot)

## معرفی
این پروژه یک سیستم جامع برای تحلیل، سیگنال‌دهی و اعلام قیمت طلا و ارز است که شامل چهار ربات تلگرام متصل و یک پنل کنترل وب‌-based است.

## ویژگی‌ها
- 🤖 **چهار ربات تلگرام تخصصی**
  - ربات کنترل مرکزی (پنل مدیریت)
  - ربات تحلیل هوشمند
  - ربات سیگنال XAUUSD
  - ربات اعلام قیمت

- 💰 **منابع داده زنده**
  - API نوسان برای قیمت‌های ارز
  - کانال تلگرام @ZaryaalGold برای قیمت شمش طلا
  - داده‌های زنده MetaTrader 5

- 📊 **پنل کنترل وب**
  - داشبورد فارسی RTL
  - نمایش قیمت‌های زنده
  - مدیریت ربات‌ها
  - نمایش لاگ‌ها و گزارش‌ها

## نصب و راه‌اندازی

### پیش‌نیازها
- Node.js 18+ 
- PostgreSQL Database
- کلیدهای API مربوطه

### نصب سریع
```bash
# کپی کردن پروژه
git clone <your-repo-url>
cd goldbot

# نصب dependencies
npm install

# تنظیم environment variables
cp .env.example .env
# ویرایش .env با کلیدهای خود

# اجرای پروژه
npm run dev
```

### متغیرهای محیطی مورد نیاز
```env
# Telegram Bot Credentials
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHANNEL_ID=your_channel_id
TELEGRAM_ADMIN_ID=your_admin_id

# API Keys
NAVASAN_API_KEY=your_navasan_api_key

# Database
DATABASE_URL=your_postgres_connection_string
```

## ساختار پروژه
```
goldbot/
├── client/                 # Frontend React با Vite
├── server/                 # Backend Express.js
│   ├── bots/              # ربات‌های تلگرام
│   ├── services/          # سرویس‌های پردازش داده
│   └── routes.ts          # API endpoints
├── shared/                # Schema های مشترک
└── deployment/            # اسکریپت‌های deployment
```

## API Endpoints
- `GET /api/prices` - دریافت قیمت‌های جاری
- `POST /api/actions/update-prices` - بروزرسانی قیمت‌ها
- `POST /api/actions/test-price-announcement` - تست ارسال به کانال
- `GET /api/bots/status` - وضعیت ربات‌ها
- `GET /api/logs` - مشاهده لاگ‌ها

## مجوز
این پروژه تحت مجوز MIT منتشر شده است.

## پشتیبانی
برای پشتیبانی و راهنمایی، لطفاً از طریق Issues در گیت‌هاب تماس بگیرید.