# راهنمای راه‌اندازی OANDA API
# OANDA API Setup Guide

## 🎯 چرا OANDA؟ / Why OANDA?

### ✅ **مزایای OANDA:**
- **داده‌های Real-time** با کیفیت بالا
- **API ساده و قابل اعتماد**
- **حساب Demo رایگان** 
- **پشتیبانی کامل از XAUUSD**
- **Spread واقعی بازار**
- **بدون محدودیت تماس API سخت**

### 🏆 **مقایسه با سایر روش‌ها:**

| روش | کیفیت داده | سختی راه‌اندازی | هزینه | Real-time |
|-----|-------------|------------------|--------|-----------|
| **OANDA API** | ⭐⭐⭐⭐⭐ | ⭐⭐ آسان | 🆓 رایگان | ✅ |
| MetaTrader 5 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ سخت | 🆓 رایگان | ✅ |
| External APIs | ⭐⭐⭐ | ⭐⭐⭐ متوسط | 💰 پولی | ❓ |

## 🚀 راه‌اندازی گام به گام / Step-by-Step Setup

### **گام 1: ایجاد حساب OANDA**

#### 🌐 رفتن به سایت:
```
https://oanda.com
```

#### 📝 ثبت‌نام:
1. کلیک روی **"Create Account"** یا **"Open Account"**
2. انتخاب **"Demo Account"** (رایگان - توصیه می‌شود)
3. تکمیل فرم ثبت‌نام:
   - **نام و نام خانوادگی**
   - **ایمیل**
   - **رمز عبور**
   - **کشور**
4. تایید ایمیل

### **گام 2: دریافت API Key**

#### 🔑 دسترسی به API:
1. **ورود** به حساب OANDA
2. رفتن به منو **"Manage Funds"** یا **"My Account"**
3. کلیک روی **"API Access"** یا **"Manage API Access"**
4. **"Generate Personal Access Token"**

#### 📋 کپی API Key:
```
مثال API Key:
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**⚠️ مهم:** این کلید را در جای امن نگه دارید!

### **گام 3: پیکربندی در ربات**

#### 🔧 روش 1: استفاده از کد Python
```python
from config.oanda_setup import setup_oanda_api

# جایگزین کنید با API Key واقعی خود
api_key = "YOUR_OANDA_API_KEY_HERE"

# راه‌اندازی (demo account)
success = setup_oanda_api(api_key, 'practice')

if success:
    print("✅ OANDA API configured successfully!")
    print("🏦 Now receiving real-time gold data!")
else:
    print("❌ Setup failed. Check your API key.")
```

#### 🔧 روش 2: متغیر Environment
```bash
# در ترمینال یا .env file
export OANDA_API_KEY="YOUR_API_KEY_HERE"
export OANDA_ACCOUNT_TYPE="practice"  # یا "live"
```

#### 🔧 روش 3: اضافه به .env فایل
```bash
# در فایل .env
OANDA_API_KEY=YOUR_API_KEY_HERE
OANDA_ACCOUNT_TYPE=practice
```

## 📊 تست و تایید / Testing & Verification

### **تست اتصال:**
```python
from services.oanda_data_service import oanda_service

# تست اتصال
if oanda_service and oanda_service.test_connection():
    print("✅ OANDA connection successful!")
    
    # دریافت داده‌های نمونه
    data = oanda_service.get_gold_data('H1', 10)
    print(f"📊 Retrieved {len(data)} candles")
    print(f"💰 Latest price: ${data.iloc[-1]['close']:.2f}")
else:
    print("❌ Connection failed")
```

### **تست قیمت فعلی:**
```python
current_price = oanda_service.get_current_price()
if current_price:
    print(f"💰 Gold Price: ${current_price['mid']:.2f}")
    print(f"📈 Bid: ${current_price['bid']:.2f}")
    print(f"📉 Ask: ${current_price['ask']:.2f}")
    print(f"📏 Spread: ${current_price['spread']:.2f}")
```

## 🔄 یکپارچگی با سیستم / System Integration

### **اولویت‌بندی منابع داده:**
```
1. 🏦 OANDA API (اولویت اول)
2. 📊 MetaTrader 5 (اولویت دوم)  
3. 🌐 External API (اولویت سوم)
4. 📁 Fallback Data (اولویت چهارم)
```

### **کانفیگ خودکار:**
سیستم به صورت خودکار:
- **OANDA را تست می‌کند**
- **در صورت موفقیت به عنوان منبع اصلی استفاده می‌کند**
- **در صورت خطا به MT5 یا API fallback می‌کند**

## 🎯 مثال کامل / Complete Example

### **Python Code:**
```python
# راه‌اندازی اولیه
from config.oanda_setup import setup_oanda_api, get_oanda_setup_instructions

# نمایش راهنما
print(get_oanda_setup_instructions())

# راه‌اندازی با API Key
api_key = input("Enter your OANDA API Key: ")
success = setup_oanda_api(api_key)

if success:
    # تست عملکرد
    from services.data_service import data_service
    
    # دریافت داده
    data = data_service.get_gold_data('H1', 100)
    print(f"📊 Data source: OANDA")
    print(f"📈 Records: {len(data)}")
    print(f"💰 Latest close: ${data.iloc[-1]['close']:.2f}")
    
    # قیمت فعلی
    current = data_service.get_current_price()
    print(f"🔄 Current price: ${current:.2f}")
```

## ⚠️ رفع مشکلات / Troubleshooting

### **مشکلات رایج:**

#### 1. **API Key نامعتبر:**
```
Error: 401 Unauthorized
```
**حل:** 
- چک کنید API Key درست کپی شده
- مطمئن شوید از Demo account استفاده می‌کنید

#### 2. **محدودیت تماس:**
```
Error: 429 Too Many Requests
```
**حل:**
- OANDA محدودیت بسیار مناسب دارد
- سیستم cache پیاده‌سازی شده

#### 3. **مشکل اتصال شبکه:**
```
Error: Connection timeout
```
**حل:**
- چک کنید اتصال اینترنت
- سیستم خودکار به fallback می‌کند

### **راه‌های تست:**

#### **تست مستقل:**
```bash
cd /path/to/project
python -c "
from config.oanda_setup import setup_oanda_api
result = setup_oanda_api('YOUR_API_KEY')
print('Success:', result)
"
```

#### **لاگ debugging:**
```python
import logging
logging.basicConfig(level=logging.DEBUG)

# سپس کدهای OANDA را اجرا کنید
```

## 🏆 نتیجه‌گیری / Conclusion

### ✅ **مزایای نهایی:**
- **راه‌اندازی در کمتر از 5 دقیقه**
- **داده‌های real-time با کیفیت بالا**
- **API رایگان و قابل اعتماد**
- **یکپارچگی کامل با سیستم موجود**
- **Fallback خودکار در صورت مشکل**

### 🚀 **مراحل بعدی:**
1. **دریافت API Key از OANDA**
2. **تنظیم با کد بالا**
3. **تست و تایید عملکرد**
4. **لذت بردن از داده‌های آنلاین!**

**🎯 با OANDA API ربات شما قدرت دریافت داده‌های واقعی و real-time را خواهد داشت!**