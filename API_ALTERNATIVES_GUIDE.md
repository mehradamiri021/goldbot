# راهنمای APIهای جایگزین - ربات طلا

## وضعیت فعلی APIها (17 آگوست 2025)

### ❌ مشکل اصلی: API نوسان
**مشکل:** `webservice.navasan.net` در دسترس نیست (DNS error)
**تاثیر:** Price Bot Service initialize نمی‌شود

### ✅ کانال تلگرام
- کانال @ZaryaalGold: ✅ قابل دسترسی
- Bot Token: ✅ فعال

### ⚠️ سایت‌های اخبار
- Forex Factory: ✅ قابل دسترسی (نیاز به scraper بهتر)
- FXStreet: ✅ قابل دسترسی (نیاز به RSS parser)

## راه‌حل‌های پیشنهادی

### 1. جایگزین API نوسان

#### گزینه A: CurrencyLayer API
```
Endpoint: http://api.currencyLayer.com/live
Key: رایگان 1000 درخواست/ماه
```

#### گزینه B: Fixer.io API
```
Endpoint: http://data.fixer.io/api/latest
Key: رایگان 100 درخواست/ماه
```

#### گزینه C: ExchangeRate-API
```
Endpoint: https://api.exchangerate-api.com/v4/latest/USD
Key: رایگان 1500 درخواست/ماه
```

### 2. بهبود اخبار

#### JBlanked API (بهترین جایگزین Forex Factory)
```
Endpoint: https://www.jblanked.com/news/api/forex-factory/calendar/today/
Key: رایگان 86400 درخواست/روز
```

#### FXStreet RSS
```
URL: https://www.fxstreet.com/rss/news
Format: RSS/XML
```

## پیاده‌سازی فوری

### 1. غیرفعال کردن موقت API نوسان
```python
# در navasan_service.py
NAVASAN_ENABLED = False  # موقتاً غیرفعال
```

### 2. استفاده از API جایگزین
```python
# ExchangeRate-API (رایگان)
EXCHANGE_API_URL = "https://api.exchangerate-api.com/v4/latest/USD"
```

### 3. بهبود سیستم اخبار
```python
# استفاده از FXStreet RSS
RSS_URLS = [
    "https://www.fxstreet.com/rss/news",
    "https://www.fxstreet.com/rss/analysis"
]
```

## اقدام فوری مورد نیاز

1. **حل مشکل initialize:** غیرفعال کردن navasan_service موقتاً
2. **API جایگزین:** پیاده‌سازی ExchangeRate-API
3. **بهبود news service:** استفاده از RSS feeds
4. **تست عملکرد:** اطمینان از اجرای صحیح سیستم

## کلیدهای API مورد نیاز

- ExchangeRate-API: رایگان، بدون کلید
- JBlanked API: ثبت‌نام در https://www.jblanked.com/profile/
- CurrencyLayer: ثبت‌نام در https://currencylayer.com/