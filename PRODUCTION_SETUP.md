# راهنمای استقرار در سرور شخصی
# Production Server Setup Guide

## 🖥️ **راه‌اندازی کامل در سرور شخصی**

### **1. پیش‌نیازهای سیستم**

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y python3 python3-pip python3-venv git curl
sudo apt install -y wine xvfb

# پکیج‌های اضافی برای TA-Lib
sudo apt install -y build-essential wget
```

### **2. نصب MetaTrader 5 در Wine**

```bash
# تنظیم Wine
winecfg  # تنظیم بر روی Windows 10

# دانلود و نصب MT5
cd /tmp
wget "https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/mt5setup.exe"
wine mt5setup.exe

# راه‌اندازی MT5 در پس‌زمینه
Xvfb :1 -screen 0 1024x768x16 &
export DISPLAY=:1
wine ~/.wine/drive_c/Program\ Files/MetaTrader\ 5/terminal64.exe
```

### **3. نصب پروژه**

```bash
# کلون پروژه
git clone <repository-url>
cd gold-trading-bot

# ایجاد محیط مجازی
python3 -m venv venv
source venv/bin/activate

# نصب پکیج‌ها
pip install -r requirements.txt

# یا استفاده از uv (سریع‌تر)
pip install uv
uv pip install -r requirements.txt
```

### **4. تنظیم متغیرهای محیطی**

```bash
# ایجاد فایل .env
cat > .env << EOF
# Database Configuration
DATABASE_URL=sqlite:///./goldbot.db

# Session Configuration  
SESSION_SECRET=your-secret-key-here-change-this

# MT5 CSV Path
MT5_CSV_PATH=/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files/

# Telegram Configuration (hardcoded in code)
# BOT_TOKEN=7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y
# CHANNEL_ID=-1002717718463  
# ADMIN_ID=1112066452

# Timezone
TZ=Asia/Tehran

# Logging
LOG_LEVEL=INFO
LOG_FILE=./logs/goldbot.log
EOF
```

### **5. راه‌اندازی Expert Advisor**

در MT5 یک Expert Advisor ایجاد کنید:

```mql5
//+------------------------------------------------------------------+
//| Expert advisor Name: XAUUSD_CSV_Exporter
//| Description: Export XAUUSD data to CSV files every minute
//+------------------------------------------------------------------+

#property copyright "Gold Bot"
#property version   "2.00"
#property strict

// بروزرسانی هر دقیقه
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
    Print("XAUUSD CSV Exporter v2.0 started - Live data export");
    
    // اکسپورت اولیه
    ExportAllTimeframes();
    
    return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Timer function - اجرا هر دقیقه                                |
//+------------------------------------------------------------------+
void OnTimer()
{
    ExportAllTimeframes();
    Print("CSV files updated at: ", TimeToString(TimeCurrent(), TIME_DATE|TIME_SECONDS));
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
        MqlRates rates[];
        int copied = CopyRates(sym, period, 0, count, rates);
        
        if(copied > 0)
        {
            for(int i = 0; i < copied; i++)
            {
                FileWrite(file_handle, 
                    TimeToString(rates[i].time, TIME_DATE|TIME_SECONDS) + ";" +
                    DoubleToString(rates[i].open, Digits) + ";" +
                    DoubleToString(rates[i].high, Digits) + ";" +
                    DoubleToString(rates[i].low, Digits) + ";" +
                    DoubleToString(rates[i].close, Digits) + ";" +
                    IntegerToString(rates[i].tick_volume)
                );
            }
        }
        
        FileClose(file_handle);
    }
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
    EventKillTimer();
    Print("XAUUSD CSV Exporter stopped");
}
```

### **6. اجرای سرویس**

```bash
# ایجاد دایرکتوری‌های مورد نیاز
mkdir -p logs
mkdir -p instance
mkdir -p data

# تست اجرا
python main.py

# اجرا با gunicorn (برای پروداکشن)
gunicorn --bind 0.0.0.0:5000 --workers 2 --timeout 120 main:app

# یا استفاده از supervisor/systemd برای اجرای دائمی
```

### **7. تنظیم Systemd Service**

```bash
# ایجاد سرویس systemd
sudo tee /etc/systemd/system/goldbot.service > /dev/null << EOF
[Unit]
Description=Gold Trading Bot
After=network.target

[Service]
Type=simple
User=trader
WorkingDirectory=/home/trader/gold-trading-bot
Environment=PATH=/home/trader/gold-trading-bot/venv/bin
ExecStart=/home/trader/gold-trading-bot/venv/bin/gunicorn --bind 0.0.0.0:5000 --workers 2 main:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# فعال‌سازی سرویس
sudo systemctl daemon-reload
sudo systemctl enable goldbot
sudo systemctl start goldbot

# بررسی وضعیت
sudo systemctl status goldbot
```

### **8. مانیتورینگ و لاگ‌ها**

```bash
# مشاهده لاگ‌های زنده
tail -f logs/goldbot.log

# مشاهده لاگ‌های systemd
sudo journalctl -u goldbot -f

# بررسی وضعیت CSV files
ls -la /home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files/

# تست API
curl http://localhost:5000/api/status
curl http://localhost:5000/api/current_price
```

### **9. امنیت و Firewall**

```bash
# تنظیم UFW firewall
sudo ufw allow 5000
sudo ufw allow ssh
sudo ufw --force enable

# اجرا بر روی پورت خاص
# در صورت نیاز، پورت را تغییر دهید
```

### **10. بکاپ و بازیابی**

```bash
# بکاپ دیتابیس
cp goldbot.db backups/goldbot_$(date +%Y%m%d_%H%M%S).db

# بکاپ لاگ‌ها
tar -czf logs_backup_$(date +%Y%m%d).tar.gz logs/

# کرون‌جاب برای بکاپ خودکار
crontab -e
# اضافه کردن این خط:
# 0 2 * * * cd /home/trader/gold-trading-bot && cp goldbot.db backups/goldbot_$(date +\%Y\%m\%d).db
```

## 🚨 **نکات مهم:**

1. **مسیر CSV:** مطمئن شوید MT5 فایل‌های CSV را در مسیر صحیح ایجاد می‌کند
2. **مجوزها:** کاربر trader باید دسترسی نوشتن به پوشه‌ها داشته باشد  
3. **Wine:** MT5 در Wine باید همیشه در حال اجرا باشد
4. **Expert Advisor:** EA باید در MT5 فعال و در حال اجرا باشد
5. **اتصال اینترنت:** برای داده‌های زنده MT5 نیاز به اتصال دارد

## 📊 **تست نهایی:**

```bash
# تست کامل سیستم
python -c "
from services.data_service import data_service
status = data_service.test_connections()
print('Connection Status:', status)

data = data_service.get_gold_data('H1', 10)
print(f'Data Records: {len(data) if data is not None else 0}')

price = data_service.get_current_price()
print(f'Current Price: ${price:.2f}' if price else 'Price not available')
"
```

**سیستم شما آماده اجرا در سرور شخصی است!**