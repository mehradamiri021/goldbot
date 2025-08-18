# راهنمای کامل نصب ربات طلای هوشمند
# Complete Installation Guide - Gold Trading Bot

## 🚀 **راه‌اندازی سریع (Quick Install)**

### **گام 1: استخراج فایل‌ها**
```bash
# استخراج فایل ZIP
unzip goldbot_deployment_*.zip
cd goldbot_deployment_*/

# اجازه اجرا برای اسکریپت‌ها
chmod +x start_server.sh
chmod +x install_ubuntu.sh
```

### **گام 2: پیکربندی محیط**
```bash
# ایجاد فایل تنظیمات (روش A - ترجیحی)
cat > .env << 'EOF'
# مسیر داده‌های MT5 شما
DATA_DIR=/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files
SYMBOL=XAUUSD
TIMEFRAMES=M1,M5,M15,H1,H4,D1,W1

# تنظیمات پایگاه داده
DATABASE_URL=sqlite:///./goldbot.db
SESSION_SECRET=change-this-secret-key-in-production

# منطقه زمانی
TZ=Asia/Tehran
LOG_LEVEL=INFO
EOF
```

### **گام 3: نصب (دو روش)**

#### **🅰️ روش A: با TA-Lib (کامل)**
```bash
# نصب خودکار Ubuntu
./install_ubuntu.sh

# یا نصب دستی
python3 -m venv venv
source venv/bin/activate
pip install -r install_requirements.txt
```

#### **🅱️ روش B: بدون TA-Lib (سریع)**
```bash
# اگر TA-Lib مشکل داشت
python3 -m venv venv
source venv/bin/activate
pip install -r install_requirements_no_talib.txt

# شروع سرور
./start_server.sh
```

### **گام 4: راه‌اندازی**
```bash
# شروع دستی
./start_server.sh

# یا به عنوان سرویس سیستم
sudo systemctl start goldbot
sudo systemctl enable goldbot  # شروع خودکار
```

---

## 🔧 **نصب تفصیلی (Detailed Installation)**

### **پیش‌نیازهای سیستم**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y python3 python3-pip python3-venv git curl
sudo apt install -y wine xvfb  # برای MT5

# CentOS/RHEL
sudo yum install -y python3 python3-pip git curl wine
```

### **نصب MetaTrader 5**
```bash
# راه‌اندازی Wine
export WINEPREFIX=/home/trader/.wine_mt5
winecfg  # تنظیم بر روی Windows 10

# دانلود و نصب MT5
cd /tmp
wget "https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/mt5setup.exe"
wine mt5setup.exe

# اجرای MT5 در پس‌زمینه
Xvfb :1 -screen 0 1024x768x16 &
export DISPLAY=:1
wine ~/.wine_mt5/drive_c/Program\ Files/MetaTrader\ 5/terminal64.exe &
```

### **Expert Advisor برای اکسپورت CSV**
در MT5 یک EA جدید ایجاد کنید (`XAUUSD_CSV_Exporter.mq5`):

```mql5
//+------------------------------------------------------------------+
//| Expert advisor: XAUUSD CSV Exporter v2.0
//| Description: Export XAUUSD data to CSV every minute
//+------------------------------------------------------------------+

#property copyright "Gold Bot 2025"
#property version   "2.00"

string symbol = "XAUUSD";
string timeframes[] = {"M1", "M5", "M15", "H1", "H4", "D1", "W1"};
ENUM_TIMEFRAMES periods[] = {PERIOD_M1, PERIOD_M5, PERIOD_M15, PERIOD_H1, PERIOD_H4, PERIOD_D1, PERIOD_W1};

//+------------------------------------------------------------------+
int OnInit()
{
    EventSetTimer(60);  // هر دقیقه یکبار
    Print("XAUUSD CSV Exporter v2.0 started");
    ExportAllTimeframes();
    return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
void OnTimer()
{
    ExportAllTimeframes();
    Print("CSV updated: ", TimeToString(TimeCurrent(), TIME_SECONDS));
}

//+------------------------------------------------------------------+
void ExportAllTimeframes()
{
    for(int i = 0; i < ArraySize(timeframes); i++)
    {
        string filename = symbol + "_" + timeframes[i] + ".csv";
        int file = FileOpen(filename, FILE_WRITE|FILE_CSV);
        
        if(file != INVALID_HANDLE)
        {
            MqlRates rates[];
            int copied = CopyRates(symbol, periods[i], 0, 3000, rates);
            
            for(int j = 0; j < copied; j++)
            {
                FileWrite(file,
                    TimeToString(rates[j].time, TIME_DATE|TIME_SECONDS) + ";" +
                    DoubleToString(rates[j].open, Digits) + ";" +
                    DoubleToString(rates[j].high, Digits) + ";" +
                    DoubleToString(rates[j].low, Digits) + ";" +
                    DoubleToString(rates[j].close, Digits) + ";" +
                    IntegerToString(rates[j].tick_volume)
                );
            }
            FileClose(file);
        }
    }
}

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
    EventKillTimer();
    Print("XAUUSD CSV Exporter stopped");
}
```

---

## 🐛 **حل مشکلات (Troubleshooting)**

### **مشکل 1: TA-Lib نصب نمی‌شود**
```bash
# حل: استفاده از نسخه بدون TA-Lib
pip install -r install_requirements_no_talib.txt

# یا نصب دستی TA-Lib
sudo apt install -y build-essential wget
cd /tmp
wget http://prdownloads.sourceforge.net/ta-lib/ta-lib-0.4.0-src.tar.gz
tar -xzf ta-lib-0.4.0-src.tar.gz
cd ta-lib/
./configure --prefix=/usr
make && sudo make install
pip install ta-lib
```

### **مشکل 2: فایل‌های CSV پیدا نمی‌شوند**
```bash
# بررسی مسیر MT5
ls -la /home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files/

# یا تنظیم مسیر دستی در .env
echo "DATA_DIR=/path/to/your/mt5/files" >> .env

# تست اتصال
python3 -c "
from services.data_service import data_service
status = data_service.test_connections()
print('MT5 Connection:', status)
"
```

### **مشکل 3: مجوزها (Permissions)**
```bash
# اعطای مجوز به کاربر trader
sudo chown -R trader:trader /home/trader/
chmod +x start_server.sh install_ubuntu.sh

# اجرا با کاربر trader
sudo -u trader ./start_server.sh
```

### **مشکل 4: پورت 5000 اشغال است**
```bash
# تغییر پورت در .env
echo "PORT=8080" >> .env

# یا کشتن فرآیند
sudo lsof -ti:5000 | xargs sudo kill -9
```

---

## 📊 **تست و مانیتورینگ**

### **تست سیستم**
```bash
# تست کامل
curl http://localhost:5000/api/status
curl http://localhost:5000/api/current_price

# بررسی لاگ‌ها
tail -f logs/goldbot.log

# وضعیت سرویس
sudo systemctl status goldbot
```

### **مانیتورینگ مداوم**
```bash
# مشاهده لاگ‌های زنده
tail -f logs/goldbot.log | grep "Latest price"

# بررسی داده‌های MT5
watch "ls -la /home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files/*.csv"

# مانیتورینگ CPU و Memory
htop | grep goldbot
```

---

## 🔐 **امنیت و بکاپ**

### **تنظیمات امنیت**
```bash
# Firewall
sudo ufw allow 5000
sudo ufw enable

# تغییر کلیدهای امنیتی
sed -i 's/change-this-secret/your-secure-key/' .env
```

### **بکاپ خودکار**
```bash
# اضافه کردن کرون‌جاب
crontab -e

# خط زیر را اضافه کنید:
0 2 * * * cd /home/trader/gold-trading-bot && cp goldbot.db backups/goldbot_$(date +\%Y\%m\%d).db
```

---

## 🚀 **آماده‌سازی نهایی**

### **بررسی نهایی قبل از اجرا**
```bash
# 1. فایل‌های CSV موجودند
ls -la /home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files/*.csv

# 2. تنظیمات .env صحیح است
cat .env

# 3. MT5 در حال اجرا است
ps aux | grep MT5

# 4. سرویس ربات آماده است
./start_server.sh
```

### **دسترسی به ربات**
- 🌐 **وب داشبورد:** `http://your-server-ip:5000`
- 📊 **API Status:** `http://your-server-ip:5000/api/status`
- 📱 **تلگرام:** کانال خودکار فعال
- 📝 **لاگ‌ها:** `tail -f logs/goldbot.log`

---

## ✅ **تایید موفقیت‌آمیز**

اگر همه مراحل زیر موفق بود، ربات آماده است:

1. ✅ فایل‌های CSV در مسیر صحیح هستند
2. ✅ پیام‌های "Latest price" در لاگ نمایش می‌یابند  
3. ✅ وب داشبورد در `http://server:5000` در دسترس است
4. ✅ پیام‌های تلگرام دریافت می‌شوند
5. ✅ سرویس systemd فعال است

**🎉 ربات طلای هوشمند آماده تحلیل و سیگنال‌دهی است!**