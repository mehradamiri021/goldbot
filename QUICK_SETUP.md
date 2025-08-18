# راهنمای سریع نصب ربات طلا
# Quick Setup Guide - Gold Trading Bot

## 🚀 نصب سریع (5 دقیقه)

### **گام 1: استخراج**
```bash
unzip goldbot.zip
cd goldbot_deployment_*/
chmod +x *.sh
```

### **گام 2: تنظیم داده‌های MT5**
```bash
# روش A (ترجیحی): فایل .env  
cat > .env << 'EOF'
DATA_DIR=/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files
SYMBOL=XAUUSD
TIMEFRAMES=M1,M5,M15,H1,H4,D1,W1
DATABASE_URL=sqlite:///./goldbot.db
SESSION_SECRET=your-secret-key-change-this
TZ=Asia/Tehran
EOF
```

### **گام 3: نصب**
```bash
# با TA-Lib (کامل)
./install_ubuntu.sh

# یا بدون TA-Lib (سریع)
python3 -m venv venv
source venv/bin/activate
pip install -r install_requirements_no_talib.txt
```

### **گام 4: اجرا**
```bash
./start_server.sh
```

## ✅ **تست موفقیت**
- 🌐 باز کردن: `http://your-server:5000`
- 📊 API تست: `curl http://localhost:5000/api/status`
- 📝 لاگ‌ها: `tail -f logs/goldbot.log`

## 🔧 **حل سریع مشکلات**

**❌ TA-Lib نصب نشد؟**
```bash
pip install -r install_requirements_no_talib.txt
```

**❌ فایل‌های CSV پیدا نشد؟**
```bash
# بررسی مسیر
ls /home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files/

# یا تنظیم مسیر دستی
echo "DATA_DIR=/your/actual/path" >> .env
```

**❌ پورت اشغال؟**
```bash
echo "PORT=8080" >> .env
./start_server.sh
```

## 🎯 **Expert Advisor سریع**

در MT5 یک EA جدید بسازید:
```mql5
string symbol = "XAUUSD";
string tfs[] = {"M1", "M5", "M15", "H1", "H4", "D1", "W1"};

int OnInit() {
    EventSetTimer(60);
    return INIT_SUCCEEDED;
}

void OnTimer() {
    for(int i = 0; i < ArraySize(tfs); i++) {
        string filename = symbol + "_" + tfs[i] + ".csv";
        int file = FileOpen(filename, FILE_WRITE|FILE_CSV);
        
        if(file != INVALID_HANDLE) {
            MqlRates rates[];
            ENUM_TIMEFRAMES period = StringToTimeframe("PERIOD_" + tfs[i]);
            int copied = CopyRates(symbol, period, 0, 3000, rates);
            
            for(int j = 0; j < copied; j++) {
                FileWrite(file, TimeToString(rates[j].time, TIME_DATE|TIME_SECONDS) + ";" +
                    DoubleToString(rates[j].open, Digits) + ";" +
                    DoubleToString(rates[j].high, Digits) + ";" +
                    DoubleToString(rates[j].low, Digits) + ";" +
                    DoubleToString(rates[j].close, Digits) + ";" +
                    IntegerToString(rates[j].tick_volume));
            }
            FileClose(file);
        }
    }
}
```

**🎉 آماده است! ربات شما در `http://server:5000` در دسترس است.**