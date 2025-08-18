# 📊 راهنمای کامل GoldBot - چه کاری می‌کند؟

## 🎯 هدف اصلی برنامه
GoldBot یک ربات هوشمند تحلیل و معاملات طلا است که:
- قیمت طلا را از منابع مختلف دریافت می‌کند
- تحلیل‌های تکنیکال و هوشمند انجام می‌دهد  
- سیگنال‌های خرید/فروش تولید می‌کند
- گزارش‌های روزانه و هفتگی ارسال می‌کند

---

## 🔧 قسمت‌های اصلی سیستم

### 1️⃣ **دریافت داده‌ها (Data Collection)**

#### 🏗️ MetaTrader 5 (MT5) - منبع اصلی
- **مکان فایل‌ها**: `/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files`
- **نوع داده**: CSV files شامل قیمت‌های OHLC (Open/High/Low/Close)
- **تایم‌فریم‌ها**: M15، H1، H4، D1
- **تعداد کندل**: 500 کندل برای هر تایم‌فریم

#### 💱 Navasan API - قیمت ارز
- **API Key**: `freeBY5YCs...`
- **آدرس**: `http://api.navasan.tech/latest`
- **داده‌ها**: قیمت خرید/فروش دلار، یورو، طلا

#### 📱 تلگرام @ZaryaalGold - قیمت طلای آبشده
- **نوع**: کانال تلگرام
- **داده‌ها**: قیمت طلای 18 عیار، 24 عیار، سکه

---

### 2️⃣ **تحلیل‌های انجام شده**

#### 📈 تحلیل تکنیکال
```python
# محاسبه RSI (Relative Strength Index)
rsi = calculate_rsi(prices, period=14)

# تشخیص ترند  
if rsi > 70: trend = "OVERBOUGHT"
elif rsi < 30: trend = "OVERSOLD" 
else: trend = "NEUTRAL"
```

#### 🧠 Smart Money Concepts (SMC)
- **Order Blocks**: نواحی مهم خرید/فروش نهادها
- **Fair Value Gaps**: خلأهای قیمتی
- **Break of Structure**: شکست ساختار
- **Change of Character**: تغییر شخصیت ترند

#### 📊 تحلیل الگو (Pattern Recognition)
- **Pin Bar**: کندل‌های برگشتی
- **Engulfing**: کندل‌های بلعنده
- **Inside Bar**: کندل‌های درونی

---

### 3️⃣ **سیستم سیگنال‌گیری**

#### 🎯 تولید سیگنال (هر 15 دقیقه)
```python
def generate_signal():
    # تحلیل RSI
    rsi = get_rsi()
    
    # تحلیل SMC
    smc_analysis = analyze_smart_money()
    
    # تحلیل الگو
    pattern = detect_patterns()
    
    # تولید سیگنال نهایی
    if rsi < 30 and smc_analysis == "BULLISH" and pattern == "PIN_BAR":
        return "BUY_SIGNAL"
    elif rsi > 70 and smc_analysis == "BEARISH" and pattern == "ENGULFING":
        return "SELL_SIGNAL"
```

#### ✅ سیستم تایید ادمین
1. سیگنال تولید می‌شود
2. به ادمین ارسال می‌شود برای تایید
3. ادمین می‌تواند ویرایش کند (Entry، Stop Loss، Take Profit)
4. پس از تایید به کانال ارسال می‌شود

---

### 4️⃣ **گزارش‌های خودکار**

#### 🌅 گزارش صبحگاهی (08:30)
```
🌅 تحلیل صبحگاهی طلا - 1403/05/28

📊 قیمت فعلی: $2,034.50 (+0.8%)
📈 RSI: 45.2 (خنثی)
🎯 ترند: صعودی
⚡ سیگنال: خرید ضعیف

📰 اخبار مهم:
• بانک مرکزی آمریکا نرخ بهره را ثابت نگه داشت
• تنش‌های ژئوپلیتیکی در حال افزایش

🎯 نواحی مهم:
• مقاومت: $2,040
• حمایت: $2,025
```

#### 🌆 گزارش عصرگاهی (17:30)
- خلاصه معاملات روز
- تحلیل عملکرد سیگنال‌ها
- پیش‌بینی روز بعد

#### 📅 گزارش هفتگی (یکشنبه‌ها 12:12)
- تحلیل چندتایم‌فریمی
- خلاصه اخبار مهم هفته
- آمار عملکرد کل

---

### 5️⃣ **پنل مدیریت وب**

#### 🖥️ صفحه اصلی (`/`)
```
✅ وضعیت MT5: متصل (500 کندل)
✅ وضعیت Navasan API: آنلاین  
✅ وضعیت تلگرام: فعال
⏰ آخرین به‌روزرسانی: 16:30:25

💰 قیمت‌های فعلی:
• طلا: $2,034.50
• دلار خرید: 58,500 تومان
• طلای 18 عیار: 4,200,000 تومان
```

#### 📊 داشبورد (`/dashboard`)
- نمودارهای تحلیلی
- آمار سیگنال‌ها
- درصد موفقیت

#### 🎯 مدیریت سیگنال‌ها (`/signals`)
- لیست تمام سیگنال‌ها
- وضعیت هر سیگنال (Pending/Approved/Executed)

#### 👑 پنل ادمین (`/admin`)
- تایید/رد سیگنال‌ها
- ویرایش پارامترها
- تست ارسال گزارش

---

### 6️⃣ **پایگاه داده (PostgreSQL)**

#### 📋 جداول اصلی:
```sql
-- سیگنال‌ها
signals (
    id, symbol, signal_type, entry_price, 
    stop_loss, take_profit, status, 
    admin_approved, created_at
)

-- تحلیل‌ها  
analysis (
    id, symbol, timeframe, rsi_value,
    trend, chart_data, created_at
)

-- پیام‌های تلگرام
telegram_messages (
    id, message_type, recipient_id, 
    message_text, status, sent_at
)
```

---

### 7️⃣ **زمان‌بندی خودکار (Scheduler)**

```python
# هر 15 دقیقه - تولید سیگنال (اولویت 1)
@scheduler.scheduled_job('cron', minute='*/15')
def signal_monitor():
    generate_and_check_signals()

# روزانه 08:30 - گزارش صبحگاهی
@scheduler.scheduled_job('cron', hour=8, minute=30)
def morning_report():
    send_daily_analysis_report()

# روزانه 17:30 - گزارش عصرگاهی  
@scheduler.scheduled_job('cron', hour=17, minute=30)
def evening_report():
    send_daily_summary()

# یکشنبه‌ها 12:12 - گزارش هفتگی
@scheduler.scheduled_job('cron', day_of_week=6, hour=12, minute=12)
def weekly_report():
    send_comprehensive_weekly_report()
```

---

## 🔄 جریان کاری کامل (Workflow)

### 1. **هر 15 دقیقه**:
```
📥 دریافت داده از MT5 → 
📊 تحلیل RSI + SMC → 
🎯 تولید سیگنال → 
📱 ارسال به ادمین → 
✅ تایید ادمین → 
📢 ارسال به کانال
```

### 2. **هر روز صبح**:
```  
📈 تحلیل بازار شب → 
📰 جمع‌آوری اخبار → 
📝 تهیه گزارش → 
📱 ارسال به کانال
```

### 3. **هر روز عصر**:
```
📊 جمع‌بندی روز → 
📈 آمار سیگنال‌ها → 
🔮 پیش‌بینی فردا → 
📱 ارسال گزارش
```

---

## 💡 ویژگی‌های هوشمند

### 🧠 تصمیم‌گیری خودکار
```python
# منطق تولید سیگنال
if (rsi < 30 and 
    smc_trend == "BULLISH" and 
    pattern == "HAMMER" and
    volume > average_volume):
    
    signal = {
        'type': 'BUY',
        'entry': current_price,
        'stop_loss': support_level,
        'take_profit': resistance_level,
        'confidence': 85%
    }
```

### 📊 نمایش بصری
- نمودارهای کندل استیک
- اندیکاتورهای رنگی
- آپدیت خودکار هر 10 ثانیه

### 🔔 اعلان‌های هوشمند
- سیگنال‌های فوری
- گزارش‌های زمان‌بندی شده
- هشدارهای مهم بازار

---

## 🎚️ تنظیمات قابل تغییر

### ⚙️ پارامترهای تحلیلی:
- دوره RSI (پیش‌فرض: 14)
- سطوح خرید بیش از حد/فروش بیش از حد
- حساسیت تشخیص الگو

### 📱 تنظیمات تلگرام:
- کانال اصلی: `-1002717718463`
- ادمین: `1112066452`
- Bot Token: `7522433521:AAF...`

### ⏰ زمان‌بندی:
- گزارش صبح: 08:30
- گزارش عصر: 17:30  
- گزارش هفتگی: یکشنبه 12:12

---

**این سیستم کاملاً خودکار است و 24/7 بازار طلا را زیر نظر دارد! 🚀**