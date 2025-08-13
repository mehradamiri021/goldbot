# راهنمای جایگزین‌های API برای دریافت داده طلا
# Gold Data API Alternatives Guide

## 🎯 بهترین جایگزین‌ها برای OANDA

### 🆓 **گزینه‌های رایگان / Free Options**

#### **1. Yahoo Finance** ⭐⭐⭐
```python
# مزایا:
✅ کاملاً رایگان
✅ بدون نیاز به API key
✅ راه‌اندازی فوری
✅ داده‌های معقول

# معایب:
❌ محدودیت در timeframe ها
❌ کیفیت متوسط
❌ ممکن است قطع شود
```

**نحوه استفاده:**
```python
from services.alternative_data_sources import YahooFinanceService

yahoo_service = YahooFinanceService()
data = yahoo_service.get_gold_data('1h', 1000)
```

### 💰 **گزینه‌های حرفه‌ای / Premium Options**

#### **1. Alpha Vantage** ⭐⭐⭐⭐⭐ (پیشنهاد شماره 1)
```python
# مزایا:
✅ کیفیت فوق‌العاده بالا
✅ API ساده و قابل اعتماد  
✅ پشتیبانی عالی
✅ 500 calls رایگان روزانه

# قیمت:
🆓 500 calls/day رایگان
💰 $25/ماه برای unlimited

# وب‌سایت: https://alphavantage.co
```

#### **2. Twelve Data** ⭐⭐⭐⭐ (بهترین ارزش)
```python
# مزایا:
✅ قیمت عالی ($8/ماه)
✅ 800 calls رایگان روزانه
✅ کیفیت خوب
✅ Real-time data

# قیمت:
🆓 800 calls/day رایگان  
💰 $8/ماه برای premium

# وب‌سایت: https://twelvedata.com
```

#### **3. Polygon.io** ⭐⭐⭐⭐⭐ (برای حرفه‌ای‌ها)
```python
# مزایا:
✅ کیفیت بالا
✅ حجم بالا
✅ Real-time
✅ پشتیبانی کامل

# قیمت:
💰 $99/ماه

# وب‌سایت: https://polygon.io
```

#### **4. Finnhub** ⭐⭐⭐⭐
```python
# مزایا:
✅ Real-time data
✅ API ساده
✅ قیمت متوسط

# قیمت:
💰 $60/ماه

# وب‌سایت: https://finnhub.io
```

## 🏆 **پیشنهاد من برای شما:**

### **گزینه 1: Alpha Vantage (بهترین انتخاب)**
```python
# چرا Alpha Vantage؟
✅ 500 call رایگان روزانه (کافی برای شروع)
✅ کیفیت داده عالی
✅ API ساده مثل OANDA
✅ پشتیبانی خوب
✅ اگر نیاز بود، $25/ماه ارزان است

# مناسب برای:
- شروع پروژه
- تست و توسعه  
- استفاده روزانه متوسط
```

### **گزینه 2: Twelve Data (ارزان‌ترین)**
```python
# چرا Twelve Data؟
✅ فقط $8/ماه (خیلی ارزان)
✅ 800 call رایگان روزانه
✅ کیفیت قابل قبول
✅ Real-time data

# مناسب برای:
- بودجه محدود
- حجم متوسط استفاده
```

### **گزینه 3: Yahoo Finance (رایگان کامل)**
```python
# چرا Yahoo Finance؟
✅ کاملاً رایگان
✅ بدون API key
✅ راه‌اندازی فوری

# مناسب برای:
- تست سریع
- دمو و نمایش
- بودجه صفر
```

## 🚀 **راه‌اندازی سریع Alpha Vantage:**

### **مرحله 1: دریافت API Key**
1. برو به: https://alphavantage.co
2. کلیک "Get Free API Key"
3. ثبت‌نام ساده (ایمیل + رمز)
4. API Key را کپی کن

### **مرحله 2: پیکربندی در ربات**
```python
from services.alternative_data_sources import AlphaVantageService

# تنظیم API key
alpha_service = AlphaVantageService('YOUR_API_KEY_HERE')

# تست
data = alpha_service.get_gold_data('1h', 100)
if data is not None:
    print(f"✅ Success! Got {len(data)} candles")
    print(f"💰 Latest price: ${data.iloc[-1]['close']:.2f}")
```

### **مرحله 3: یکپارچگی با سیستم**
```python
# اضافه به data_service.py
def _initialize_alpha_vantage(self):
    try:
        from services.alternative_data_sources import AlphaVantageService
        api_key = os.getenv('ALPHA_VANTAGE_API_KEY')
        if api_key:
            self.alpha_service = AlphaVantageService(api_key)
            self.use_alpha = True
        else:
            self.use_alpha = False
    except Exception as e:
        self.use_alpha = False
```

## 📊 **مقایسه جامع:**

| سرویس | قیمت/ماه | کیفیت | Real-time | API Key | راه‌اندازی |
|--------|----------|--------|-----------|---------|-------------|
| **Yahoo Finance** | 🆓 رایگان | ⭐⭐⭐ | ✅ | ❌ نیاز نیست | ⭐ آسان |
| **Alpha Vantage** | 🆓/💰$25 | ⭐⭐⭐⭐⭐ | ✅ | ✅ | ⭐⭐ آسان |
| **Twelve Data** | 🆓/💰$8 | ⭐⭐⭐⭐ | ✅ | ✅ | ⭐⭐ آسان |
| **Polygon.io** | 💰$99 | ⭐⭐⭐⭐⭐ | ✅ | ✅ | ⭐⭐⭐ متوسط |
| **Finnhub** | 💰$60 | ⭐⭐⭐⭐ | ✅ | ✅ | ⭐⭐ آسان |
| **OANDA** | 🆓 رایگان | ⭐⭐⭐⭐⭐ | ✅ | ✅ | ⭐⭐ آسان |

## 🎯 **نتیجه‌گیری و توصیه:**

### **برای شروع فوری: Yahoo Finance**
- رایگان کامل
- راه‌اندازی در 1 دقیقه
- کیفیت قابل قبول

### **برای کار حرفه‌ای: Alpha Vantage**
- 500 call رایگان روزانه
- کیفیت عالی
- API ساده
- قابلیت ارتقا

### **برای بودجه محدود: Twelve Data**
- $8/ماه فقط
- کیفیت خوب
- Real-time data

**کدام یک را ترجیح می‌دهید تا پیاده‌سازی کنم؟**