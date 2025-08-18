//+------------------------------------------------------------------+
//| Gold Data Sender Expert Advisor                                   |
//| برای ارسال داده‌های زنده طلا به ربات تحلیل                           |
//| Live Gold Data Sender for Trading Bot Integration                 |
//+------------------------------------------------------------------+
#property copyright "Gold Trading Bot"
#property link      ""
#property version   "1.00"
#property strict

#include <Trade\Trade.mqh>

// پارامترهای ورودی - Input Parameters
input string    ServerIP = "127.0.0.1";        // آدرس IP سرور - Server IP Address
input int       ServerPort = 9090;              // پورت اتصال - Connection Port  
input string    Symbol = "XAUUSD";              // نماد معاملاتی - Trading Symbol
input int       SendInterval = 15;              // فاصله ارسال (ثانیه) - Send Interval (seconds)
input bool      EnableLogging = true;           // فعال‌سازی لاگ - Enable Logging

// متغیرهای سراسری - Global Variables
int socketHandle = INVALID_HANDLE;
datetime lastSendTime = 0;
bool isConnected = false;

//+------------------------------------------------------------------+
//| تابع مقداردهی اولیه - Expert initialization function             |
//+------------------------------------------------------------------+
int OnInit() {
    Print("=== Gold Data Sender EA Started ===");
    Print("سرور: ", ServerIP, ":", ServerPort);
    Print("Server: ", ServerIP, ":", ServerPort);
    Print("نماد: ", Symbol);
    Print("Symbol: ", Symbol);
    Print("فاصله ارسال: ", SendInterval, " ثانیه");
    Print("Send Interval: ", SendInterval, " seconds");
    
    // بررسی دسترسی به نماد
    if(!SymbolSelect(Symbol, true)) {
        Print("خطا: نماد ", Symbol, " در دسترس نیست");
        Print("Error: Symbol ", Symbol, " not available");
        return INIT_FAILED;
    }
    
    // اتصال به سرور
    if(!ConnectToServer()) {
        Print("خطا در اتصال اولیه - تلاش مجدد در تیک بعدی");
        Print("Initial connection failed - will retry on next tick");
    }
    
    return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| تابع اصلی - Expert tick function                                 |
//+------------------------------------------------------------------+
void OnTick() {
    datetime currentTime = TimeCurrent();
    
    // بررسی اتصال
    if(!isConnected) {
        // تلاش برای اتصال مجدد هر 30 ثانیه
        static datetime lastConnectionAttempt = 0;
        if(currentTime - lastConnectionAttempt >= 30) {
            ConnectToServer();
            lastConnectionAttempt = currentTime;
        }
        return;
    }
    
    // ارسال داده‌ها با فاصله مشخص
    if(currentTime - lastSendTime >= SendInterval) {
        SendMarketData();
        lastSendTime = currentTime;
    }
}

//+------------------------------------------------------------------+
//| تابع پایان - Expert deinitialization function                    |
//+------------------------------------------------------------------+
void OnDeinit(const int reason) {
    if(socketHandle != INVALID_HANDLE) {
        SocketClose(socketHandle);
        Print("اتصال بسته شد");
        Print("Connection closed");
    }
    
    Print("=== Gold Data Sender EA Stopped ===");
}

//+------------------------------------------------------------------+
//| اتصال به سرور - Connect to Server                                |
//+------------------------------------------------------------------+
bool ConnectToServer() {
    // بستن اتصال قبلی در صورت وجود
    if(socketHandle != INVALID_HANDLE) {
        SocketClose(socketHandle);
    }
    
    // ایجاد socket جدید
    socketHandle = SocketCreate();
    if(socketHandle == INVALID_HANDLE) {
        Print("خطا در ایجاد socket");
        Print("Error creating socket");
        return false;
    }
    
    // اتصال به سرور
    if(!SocketConnect(socketHandle, ServerIP, ServerPort, 5000)) {
        Print("خطا در اتصال به سرور: ", ServerIP, ":", ServerPort);
        Print("Error connecting to server: ", ServerIP, ":", ServerPort);
        SocketClose(socketHandle);
        socketHandle = INVALID_HANDLE;
        isConnected = false;
        return false;
    }
    
    Print("اتصال موفقیت‌آمیز به سرور");
    Print("Successfully connected to server");
    isConnected = true;
    
    // ارسال پیام خوشآمدگویی
    SendHandshake();
    
    return true;
}

//+------------------------------------------------------------------+
//| ارسال پیام خوشآمدگویی - Send Handshake Message                  |
//+------------------------------------------------------------------+
void SendHandshake() {
    string jsonMessage = StringFormat(
        "{\"type\":\"HANDSHAKE\",\"data\":{\"version\":\"1.0\",\"symbol\":\"%s\",\"account\":%d,\"server\":\"%s\",\"timestamp\":\"%s\"}}",
        Symbol,
        AccountInfoInteger(ACCOUNT_LOGIN),
        AccountInfoString(ACCOUNT_SERVER),
        TimeToString(TimeCurrent(), TIME_DATE|TIME_SECONDS)
    );
    
    if(SendJsonMessage(jsonMessage)) {
        Print("پیام خوشآمدگویی ارسال شد");
        Print("Handshake message sent");
    }
}

//+------------------------------------------------------------------+
//| ارسال داده‌های بازار - Send Market Data                           |
//+------------------------------------------------------------------+
void SendMarketData() {
    // دریافت آخرین تیک
    MqlTick tick;
    if(!SymbolInfoTick(Symbol, tick)) {
        Print("خطا در دریافت اطلاعات تیک برای ", Symbol);
        Print("Error getting tick info for ", Symbol);
        return;
    }
    
    // دریافت اطلاعات کندل فعلی
    MqlRates rates[1];
    if(CopyRates(Symbol, PERIOD_M1, 0, 1, rates) != 1) {
        Print("خطا در دریافت اطلاعات کندل");
        Print("Error getting candle info");
        return;
    }
    
    // آماده‌سازی JSON
    string jsonMessage = StringFormat(
        "{\"type\":\"MARKET_DATA\",\"data\":{" +
        "\"symbol\":\"%s\"," +
        "\"timestamp\":\"%s\"," +
        "\"bid\":%.5f," +
        "\"ask\":%.5f," +
        "\"spread\":%.1f," +
        "\"volume\":%d," +
        "\"candle\":{" +
            "\"open\":%.5f," +
            "\"high\":%.5f," +
            "\"low\":%.5f," +
            "\"close\":%.5f," +
            "\"volume\":%d" +
        "}," +
        "\"account\":{" +
            "\"balance\":%.2f," +
            "\"equity\":%.2f," +
            "\"margin\":%.2f," +
            "\"free_margin\":%.2f," +
            "\"margin_level\":%.2f" +
        "}" +
        "}}",
        Symbol,
        TimeToString(tick.time, TIME_DATE|TIME_SECONDS),
        tick.bid,
        tick.ask,
        (tick.ask - tick.bid) / _Point,
        (int)tick.volume_real,
        rates[0].open,
        rates[0].high,
        rates[0].low,
        rates[0].close,
        (int)rates[0].tick_volume,
        AccountInfoDouble(ACCOUNT_BALANCE),
        AccountInfoDouble(ACCOUNT_EQUITY),
        AccountInfoDouble(ACCOUNT_MARGIN),
        AccountInfoDouble(ACCOUNT_FREEMARGIN),
        AccountInfoDouble(ACCOUNT_MARGIN_LEVEL)
    );
    
    // ارسال پیام
    if(!SendJsonMessage(jsonMessage)) {
        Print("خطا در ارسال داده‌ها - تلاش برای اتصال مجدد");
        Print("Error sending data - attempting to reconnect");
        isConnected = false;
    } else if(EnableLogging) {
        Print(StringFormat("داده ارسال شد - قیمت: %.5f | حجم: %d", 
            tick.bid, (int)tick.volume_real));
        Print(StringFormat("Data sent - Price: %.5f | Volume: %d", 
            tick.bid, (int)tick.volume_real));
    }
}

//+------------------------------------------------------------------+
//| ارسال پیام JSON - Send JSON Message                              |
//+------------------------------------------------------------------+
bool SendJsonMessage(string message) {
    if(socketHandle == INVALID_HANDLE) {
        return false;
    }
    
    // اضافه کردن خط جدید برای جداسازی پیام‌ها
    string fullMessage = message + "\n";
    
    // تبدیل به array بایت
    uchar data[];
    StringToCharArray(fullMessage, data, 0, WHOLE_ARRAY, CP_UTF8);
    
    // ارسال داده‌ها
    int bytesSent = SocketSend(socketHandle, data, ArraySize(data) - 1);
    
    if(bytesSent <= 0) {
        Print("خطا در ارسال پیام");
        Print("Error sending message");
        return false;
    }
    
    return true;
}

//+------------------------------------------------------------------+
//| مدیریت رویدادهای تجارت - Trade Transaction Event                  |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction& trans,
                       const MqlTradeRequest& request,
                       const MqlTradeResult& result) {
    // ارسال اطلاعات معامله در صورت نیاز
    if(trans.type == TRADE_TRANSACTION_DEAL_ADD) {
        string tradeJson = StringFormat(
            "{\"type\":\"TRADE_EVENT\",\"data\":{" +
            "\"ticket\":%d," +
            "\"type\":\"%s\"," +
            "\"volume\":%.2f," +
            "\"price\":%.5f," +
            "\"profit\":%.2f," +
            "\"timestamp\":\"%s\"" +
            "}}",
            trans.deal,
            EnumToString((ENUM_DEAL_TYPE)trans.deal_type),
            trans.volume,
            trans.price,
            trans.profit,
            TimeToString(trans.time, TIME_DATE|TIME_SECONDS)
        );
        
        if(isConnected) {
            SendJsonMessage(tradeJson);
        }
    }
}

//+------------------------------------------------------------------+
//| تایمر - Timer Event                                               |
//+------------------------------------------------------------------+
void OnTimer() {
    // بررسی دوره‌ای اتصال
    if(!isConnected) {
        ConnectToServer();
    }
}

//+------------------------------------------------------------------+
//| مدیریت رویدادهای چارت - Chart Event                               |
//+------------------------------------------------------------------+
void OnChartEvent(const int id,
                 const long &lparam,
                 const double &dparam,
                 const string &sparam) {
    // مدیریت رویدادهای چارت در صورت نیاز
}