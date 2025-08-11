# راهنمای نصب ربات تحلیل طلا بر روی سرور شخصی

## پیش‌نیازها

### 1. سیستم‌عامل
- Windows Server 2016/2019/2022 یا Windows 10/11
- Ubuntu 20.04+ یا CentOS 8+
- RAM: حداقل 4GB (پیشنهادی 8GB)
- فضای هارد: 20GB

### 2. نرم‌افزارها

#### Python (اجباری)
```bash
# برای Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3.11-venv python3.11-dev python-is-python3

# برای Windows - دانلود از https://www.python.org/downloads/
# حتماً "Add to PATH" را انتخاب کنید
```

#### MetaTrader 5 (اختیاری - برای داده‌های زنده)
- دانلود و نصب MetaTrader 5 از سایت رسمی
- ایجاد حساب Demo یا Real
- فعال کردن Expert Advisors

#### Git
```bash
# Ubuntu/Debian
sudo apt install git

# Windows - دانلود از https://git-scm.com/
```

## مراحل نصب

### 1. کلون کردن پروژه
```bash
git clone <repository-url>
cd gold-trading-bot
```

### 2. ایجاد محیط مجازی Python
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3.11 -m venv venv
source venv/bin/activate
```

### 3. نصب وابستگی‌ها
```bash
pip install --upgrade pip
pip install -r requirements.txt

# یا نصب دستی پکیج‌ها:
pip install flask flask-sqlalchemy python-telegram-bot pandas numpy ta-lib plotly apscheduler pytz requests beautifulsoup4 gunicorn trafilatura
```

### 4. تنظیم متغیرهای محیطی
یک فایل `.env` در روت پروژه ایجاد کنید:

```env
# تنظیمات تلگرام (اجباری)
TELEGRAM_BOT_TOKEN=7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y
TELEGRAM_CHANNEL_ID=-1002717718463
TELEGRAM_ADMIN_ID=1112066452

# تنظیمات پایگاه‌داده (اختیاری)
DATABASE_URL=sqlite:///gold_bot.db
# یا برای PostgreSQL:
# DATABASE_URL=postgresql://username:password@localhost:5432/goldbot

# کلید امنیتی Flask (اختیاری)
SESSION_SECRET=your-secret-key-here

# تنظیمات MetaTrader (اختیاری)
MT5_HOST=127.0.0.1
MT5_PORT=9090
MT5_ENABLED=true

# تنظیمات API داده‌ها
DATA_API_URL=http://46.100.50.194:5050/get_data
API_TIMEOUT=30
```

### 5. راه‌اندازی پایگاه‌داده
```bash
# فعال کردن محیط مجازی
source venv/bin/activate  # Linux/Mac
# یا
venv\Scripts\activate  # Windows

# اجرای برنامه برای ایجاد جداول
python main.py
```

## راه‌اندازی MetaTrader Integration (اختیاری)

### 1. نصب Expert Advisor برای ارسال داده‌ها

فایل `GoldDataSender.mq5` را در پوشه `MQL5\Experts` کپی کنید:

```mql5
//+------------------------------------------------------------------+
//| Gold Data Sender Expert Advisor                                   |
//| برای ارسال داده‌های زنده به ربات                                    |
//+------------------------------------------------------------------+
#property copyright "Gold Trading Bot"
#property link      ""
#property version   "1.00"
#property strict

#include <Trade\Trade.mqh>
#include <Json.mqh>

// پارامترها
input string    ServerIP = "127.0.0.1";    // آدرس IP سرور
input int       ServerPort = 9090;          // پورت اتصال
input string    Symbol = "XAUUSD";         // نماد معاملاتی
input int       SendInterval = 1;           // فاصله ارسال (ثانیه)

int socketHandle = INVALID_HANDLE;
datetime lastSendTime = 0;

//+------------------------------------------------------------------+
//| تابع مقداردهی اولیه                                                 |
//+------------------------------------------------------------------+
int OnInit() {
    // اتصال به سرور
    socketHandle = SocketCreate();
    if(socketHandle == INVALID_HANDLE) {
        Print("خطا در ایجاد socket");
        return INIT_FAILED;
    }
    
    if(!SocketConnect(socketHandle, ServerIP, ServerPort, 5000)) {
        Print("خطا در اتصال به سرور: ", ServerIP, ":", ServerPort);
        SocketClose(socketHandle);
        return INIT_FAILED;
    }
    
    Print("اتصال موفقیت‌آمیز به سرور");
    
    // ارسال پیام خوشآمدگویی
    SendHandshake();
    
    return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| تابع اصلی (هر تیک)                                                |
//+------------------------------------------------------------------+
void OnTick() {
    datetime currentTime = TimeCurrent();
    
    // ارسال داده‌ها با فاصله مشخص
    if(currentTime - lastSendTime >= SendInterval) {
        SendTickData();
        lastSendTime = currentTime;
    }
}

//+------------------------------------------------------------------+
//| تابع پایان                                                       |
//+------------------------------------------------------------------+
void OnDeinit(const int reason) {
    if(socketHandle != INVALID_HANDLE) {
        SocketClose(socketHandle);
        Print("اتصال socket بسته شد");
    }
}

//+------------------------------------------------------------------+
//| ارسال پیام خوشآمدگویی                                             |
//+------------------------------------------------------------------+
void SendHandshake() {
    CJAVal json;
    json["type"] = "HANDSHAKE";
    json["data"]["version"] = "1.0";
    json["data"]["symbol"] = Symbol;
    json["data"]["account"] = AccountInfoInteger(ACCOUNT_LOGIN);
    
    string jsonString = json.Serialize();
    SocketSend(socketHandle, jsonString + "\n");
    Print("Handshake ارسال شد");
}

//+------------------------------------------------------------------+
//| ارسال داده‌های تیک                                                |
//+------------------------------------------------------------------+
void SendTickData() {
    MqlTick tick;
    if(!SymbolInfoTick(Symbol, tick)) {
        Print("خطا در دریافت اطلاعات تیک");
        return;
    }
    
    CJAVal json;
    json["type"] = "TICK";
    json["data"]["symbol"] = Symbol;
    json["data"]["bid"] = tick.bid;
    json["data"]["ask"] = tick.ask;
    json["data"]["volume"] = tick.volume_real;
    json["data"]["time"] = TimeToString(tick.time, TIME_DATE|TIME_SECONDS);
    
    // اطلاعات حساب
    json["account"]["balance"] = AccountInfoDouble(ACCOUNT_BALANCE);
    json["account"]["equity"] = AccountInfoDouble(ACCOUNT_EQUITY);
    json["account"]["margin"] = AccountInfoDouble(ACCOUNT_MARGIN);
    json["account"]["free_margin"] = AccountInfoDouble(ACCOUNT_FREEMARGIN);
    
    string jsonString = json.Serialize();
    
    if(!SocketSend(socketHandle, jsonString + "\n")) {
        Print("خطا در ارسال داده‌ها");
        // سعی در اتصال مجدد
        ReconnectSocket();
    }
}

//+------------------------------------------------------------------+
//| اتصال مجدد Socket                                                |
//+------------------------------------------------------------------+
void ReconnectSocket() {
    if(socketHandle != INVALID_HANDLE) {
        SocketClose(socketHandle);
    }
    
    socketHandle = SocketCreate();
    if(socketHandle != INVALID_HANDLE) {
        if(SocketConnect(socketHandle, ServerIP, ServerPort, 5000)) {
            Print("اتصال مجدد موفقیت‌آمیز");
            SendHandshake();
        }
    }
}
```

### 2. فعال کردن Socket در MetaTrader
1. در MetaTrader به `Tools > Options > Expert Advisors` بروید
2. گزینه `Allow automated trading` را فعال کنید  
3. گزینه `Allow DLL imports` را فعال کنید
4. Expert Advisor را روی چارت XAUUSD اعمال کنید

## اجرای ربات

### 1. اجرای در محیط Development
```bash
# فعال کردن محیط مجازی
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# اجرای برنامه
python main.py

# یا با Gunicorn (پیشنهادی برای Production)
gunicorn --bind 0.0.0.0:5000 --workers 1 --timeout 120 main:app
```

### 2. اجرای به عنوان سرویس در Linux

ایجاد فایل سرویس:
```bash
sudo nano /etc/systemd/system/goldbot.service
```

محتوای فایل:
```ini
[Unit]
Description=Gold Trading Bot
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/gold-trading-bot
Environment=PATH=/path/to/gold-trading-bot/venv/bin
ExecStart=/path/to/gold-trading-bot/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

فعال کردن سرویس:
```bash
sudo systemctl daemon-reload
sudo systemctl enable goldbot
sudo systemctl start goldbot
sudo systemctl status goldbot
```

### 3. اجرای در Windows (به عنوان Service)

استفاده از NSSM:
```cmd
# دانلود NSSM از https://nssm.cc/
nssm install GoldBot
# Path: C:\path\to\venv\Scripts\python.exe  
# Arguments: C:\path\to\gold-trading-bot\main.py
# Start directory: C:\path\to\gold-trading-bot

nssm start GoldBot
```

## مانیتورینگ و نگهداری

### 1. لاگ‌ها
```bash
# مشاهده لاگ‌ها در Linux
sudo journalctl -u goldbot -f

# مشاهده لاگ‌های فایل
tail -f logs/goldbot.log
```

### 2. وب پنل مدیریت
پس از اجرای برنامه، به آدرس زیر بروید:
```
http://localhost:5000
```

### 3. دستورات تلگرام برای ادمین
- `/status` - نمایش وضعیت سیستم
- `/health` - گزارش سلامت کامپوننت‌ها  
- `/logs` - آخرین لاگ‌ها
- `/restart` - راه‌اندازی مجدد سیستم

## عیب‌یابی رایج

### 1. خطای اتصال به API
```python
# بررسی دسترسی به API
curl http://46.100.50.194:5050/get_data?symbol=XAUUSD&timeframe=H1&limit=10
```

### 2. خطای تلگرام
- بررسی صحت Token
- اطمینان از اضافه شدن ربات به کانال
- بررسی مجوزهای ادمین

### 3. خطای پایگاه‌داده
```bash
# بازسازی پایگاه‌داده
rm instance/gold_bot.db
python -c "from app import db; db.create_all()"
```

### 4. مشکلات MetaTrader
- بررسی فعال بودن Expert Advisors
- کنترل تنظیمات Firewall
- اطمینان از باز بودن پورت 9090

## بروزرسانی

```bash
# دریافت آخرین تغییرات
git pull origin main

# بروزرسانی وابستگی‌ها
pip install -r requirements.txt --upgrade

# راه‌اندازی مجدد
sudo systemctl restart goldbot  # Linux
nssm restart GoldBot           # Windows
```

## پشتیبانی

در صورت بروز مشکل:
1. لاگ‌های سیستم را بررسی کنید
2. تنظیمات متغیرهای محیطی را کنترل کنید
3. اتصال اینترنت و دسترسی به API را تست کنید
4. با ادمین سیستم تماس بگیرید

## امنیت

⚠️ **نکات امنیتی مهم:**
- هرگز Token تلگرام را عمومی نکنید
- از رمزهای قوی برای پایگاه‌داده استفاده کنید
- Firewall را به درستی تنظیم کنید
- بروزرسانی‌های امنیتی را نصب کنید
- فایل `.env` را در `.gitignore` قرار دهید