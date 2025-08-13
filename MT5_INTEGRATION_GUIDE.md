# راهنمای یکپارچه‌سازی MetaTrader 5 با Wine
# MT5 Wine Integration Guide

## 🎯 سیستم جدید: فقط MT5 CSV

سیستم به‌روزرسانی شده تا **فقط از فایل‌های CSV متاتریدر 5** استفاده کند که در Wine نصب شده.

### ✅ **تغییرات انجام شده:**

#### **1. حذف منابع داده اضافی:**
- ❌ OANDA API (حذف شد)
- ❌ Alpha Vantage (حذف شد) 
- ❌ Twelve Data (حذف شد)
- ❌ Yahoo Finance (حذف شد)
- ❌ External APIs (حذف شد)
- ✅ **فقط MT5 CSV files** (فعال)

#### **2. مسیر فایل‌های CSV:**
```
/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files/
├── XAUUSD_M1.csv   (1-minute)
├── XAUUSD_M5.csv   (5-minute)
├── XAUUSD_M15.csv  (15-minute)
├── XAUUSD_H1.csv   (1-hour)
├── XAUUSD_H4.csv   (4-hour)
├── XAUUSD_D1.csv   (daily)
└── XAUUSD_W1.csv   (weekly)
```

#### **3. فرمت CSV:**
```csv
DateTime;Open;High;Low;Close;Volume
2025.08.13 21:00:00;3353.700000;3354.220000;3351.390000;3354.180000;770
2025.08.13 21:05:00;3352.070000;3354.220000;3351.600000;3354.180000;269
```

## 🔧 **راه‌اندازی Expert Advisor در MT5:**

### **نصب EA برای اکسپورت CSV:**

#### **1. کد Expert Advisor:**
```mql5
//+------------------------------------------------------------------+
//| Expert advisor Name: XAUUSD_CSV_Exporter
//| Description: Export XAUUSD data to CSV files
//+------------------------------------------------------------------+

#property copyright "Gold Bot"
#property version   "1.00"
#property strict

// Timer interval in seconds (60 = 1 minute updates)
#define TIMER_INTERVAL 60

string symbol = "XAUUSD";
string timeframes[] = {"M1", "M5", "M15", "H1", "H4", "D1", "W1"};
ENUM_TIMEFRAMES periods[] = {PERIOD_M1, PERIOD_M5, PERIOD_M15, PERIOD_H1, PERIOD_H4, PERIOD_D1, PERIOD_W1};

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
    EventSetTimer(TIMER_INTERVAL);
    Print("XAUUSD CSV Exporter started");
    
    // Export initial data
    ExportAllTimeframes();
    
    return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
    EventKillTimer();
    Print("XAUUSD CSV Exporter stopped");
}

//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
{
    ExportAllTimeframes();
}

//+------------------------------------------------------------------+
//| Export all timeframes                                            |
//+------------------------------------------------------------------+
void ExportAllTimeframes()
{
    for(int i = 0; i < ArraySize(timeframes); i++)
    {
        ExportToCSV(symbol, periods[i], timeframes[i], 3000);
    }
}

//+------------------------------------------------------------------+
//| Export symbol data to CSV                                        |
//+------------------------------------------------------------------+
void ExportToCSV(string sym, ENUM_TIMEFRAMES period, string tf_name, int count)
{
    string filename = sym + "_" + tf_name + ".csv";
    int file_handle = FileOpen(filename, FILE_WRITE|FILE_CSV);
    
    if(file_handle != INVALID_HANDLE)
    {
        // Get historical data
        MqlRates rates[];
        int copied = CopyRates(sym, period, 0, count, rates);
        
        if(copied > 0)
        {
            // Write data to CSV
            for(int i = 0; i < copied; i++)
            {
                datetime time = rates[i].time;
                double open = rates[i].open;
                double high = rates[i].high;
                double low = rates[i].low;
                double close = rates[i].close;
                long volume = rates[i].tick_volume;
                
                FileWrite(file_handle, 
                    TimeToString(time, TIME_DATE|TIME_SECONDS) + ";" +
                    DoubleToString(open, Digits) + ";" +
                    DoubleToString(high, Digits) + ";" +
                    DoubleToString(low, Digits) + ";" +
                    DoubleToString(close, Digits) + ";" +
                    IntegerToString(volume)
                );
            }
            
            Print("Exported ", copied, " records for ", tf_name, " to ", filename);
        }
        else
        {
            Print("Failed to copy rates for ", tf_name);
        }
        
        FileClose(file_handle);
    }
    else
    {
        Print("Failed to open file: ", filename);
    }
}
```

#### **2. کامپایل و نصب EA:**
1. **Expert Advisor را در MT5 ایجاد کنید**
2. **کد بالا را کپی کنید**  
3. **کامپایل و اجرا کنید**
4. **چک کنید که فایل‌های CSV ساخته شوند**

## 📊 **وضعیت فعلی سیستم:**

### **✅ آنچه فعال است:**
```python
🏗️ MT5 CSV Reader initialized
📊 Reading H1 data from MT5 CSV: XAUUSD_H1.csv
✅ Successfully loaded 3001 H1 candles from MT5
📈 Price range: $2024.86 - $3405.22
🕐 Latest: 2025-08-13 21:00:00 - $3354.18
💰 Current gold price: $3354.18
```

### **📁 محل فایل‌های CSV:**
```bash
/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files/
total 1.4M
-rw-r--r-- 1 trader trader 221K Aug 13 21:37 XAUUSD_D1.csv
-rw-r--r-- 1 trader trader 219K Aug 13 21:37 XAUUSD_H1.csv
-rw-r--r-- 1 trader trader 220K Aug 13 21:37 XAUUSD_H4.csv
-rw-r--r-- 1 trader trader 213K Aug 13 21:37 XAUUSD_M1.csv
-rw-r--r-- 1 trader trader 217K Aug 13 21:37 XAUUSD_M15.csv
-rw-r--r-- 1 trader trader 215K Aug 13 21:37 XAUUSD_M5.csv
-rw-r--r-- 1 trader trader  68K Aug 13 21:37 XAUUSD_W1.csv
```

## 🚀 **مزایای سیستم جدید:**

### **✅ مزایا:**
- **🎯 Real-time data** از MT5
- **🔄 بروزرسانی خودکار** (EA)
- **📊 همه timeframe ها** موجود
- **💰 هیچ هزینه API** ندارد
- **⚡ سرعت بالا** (local files)
- **🛡️ قابلیت اطمینان بالا**

### **🎛️ کنترل کامل:**
- **شما کنترل کامل** روی داده‌ها دارید
- **هیچ محدودیت API** ندارد
- **هیچ API key** لازم نیست
- **آفلاین** هم کار می‌کند

## 🔧 **تست و تایید:**

### **تست اتصال:**
```bash
# Check CSV files
ls -lh /home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files/XAUUSD_*.csv

# Test latest data
tail -n 3 /home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files/XAUUSD_M1.csv
```

### **تست سیستم:**
```python
from services.data_service import data_service

# Test connection
status = data_service.test_connections()
print(status)

# Get live data
data = data_service.get_gold_data('H1', 100)
print(f"Records: {len(data)}")
print(f"Latest price: ${data.iloc[-1]['close']:.2f}")

# Current price
price = data_service.get_current_price()
print(f"Current: ${price:.2f}")
```

## 📈 **نتیجه:**

سیستم شما حالا **100% وابسته به MT5** است و:

1. **✅ فقط از MT5 CSV استفاده می‌کند**
2. **✅ همه API های اضافی حذف شدند**
3. **✅ Real-time data از Wine MT5**
4. **✅ بدون وابستگی خارجی**
5. **✅ کنترل کامل توسط شما**

**ربات شما حالا کاملاً وابسته به MetaTrader 5 شما است و از داده‌های live استفاده می‌کند!** 🎯