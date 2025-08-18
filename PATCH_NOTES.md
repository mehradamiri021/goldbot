# نکات رفع مشکلات سرور - Gold Trading Bot
# Server Fix Notes - Gold Trading Bot

## ✅ مشکلات برطرف شده (Fixed Issues)

### 🔧 **مشکل 1: خطای SQL** 
```
Column expression, FROM clause, or other columns clause element expected, got <class 'models.Signal'>
```
**حل شده:** تصحیح مقادیر Status در مدل Signal:
- `'pending'` → `'PENDING'`
- `'approved'` → `'APPROVED'`  
- `'rejected'` → `'REJECTED'`

### 🔧 **مشکل 2: خطای MT5 CSV Reader**
```
name 'get_mt5_csv_path' is not defined
```
**حل شده:** بازنویسی کامل سیستم پیکربندی MT5:
- استفاده از `MT5Config.get_data_dir()` 
- پشتیبانی از متغیر محیطی `DATA_DIR`
- مدیریت خطا بهبود یافته

### 🔧 **مشکل 3: TA-Lib نصب نمی‌شود**
**حل شده:** ایجاد `ta_shim.py` با پشتیبانی چندلایه:
1. **TA-Lib** (اولویت اول)
2. **pandas-ta** (جایگزین)
3. **محاسبه ساده** (پشتیبان)

## 🚀 **بهبودهای جدید (New Improvements)**

### **📁 سیستم پیکربندی بهبود یافته**
```bash
# در فایل .env
DATA_DIR=/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files
SYMBOL=XAUUSD
TIMEFRAMES=M1,M5,M15,H1,H4,D1,W1
```

### **⚡ نصب سریع بدون TA-Lib**
```bash
# استفاده از فایل جدید
pip install -r install_requirements_no_talib.txt
pip install pandas-ta  # جایگزین سبک
```

### **📊 مدیریت خطای هوشمند**
- تشخیص خودکار مسیر MT5
- پیام‌های خطای واضح و راهنما
- بازگشت به داده‌های نمونه در صورت نیاز

## 🔧 **دستورات رفع مشکل در سرور**

### **اگر سیستم قبلی مشکل دارد:**
```bash
cd ~/goldbot
source venv/bin/activate

# نصب جایگزین سریع TA-Lib
pip install pandas-ta

# ایجاد فایل شیم (اگر وجود ندارد)
cat > services/ta_shim.py << 'EOF'
[محتوای فایل ta_shim.py]
EOF

# تنظیم مسیر صحیح
echo "DATA_DIR=/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files" >> .env

# راه‌اندازی مجدد
python main.py
```

### **تست سیستم:**
```bash
# بررسی اتصال MT5
ls -la /home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files/*.csv

# تست API
curl http://localhost:5000/api/status

# بررسی لاگ
tail -f logs/*.log
```

## 📦 **محتویات فایل ZIP جدید**

- ✅ **ta_shim.py**: لایه شیم برای تحلیل تکنیکال
- ✅ **install_requirements_no_talib.txt**: نصب بدون TA-Lib
- ✅ **config/mt5_config.py**: پیکربندی بهبود یافته
- ✅ **INSTALL_GUIDE.md**: راهنمای کامل نصب
- ✅ **QUICK_SETUP.md**: نصب سریع 5 دقیقه‌ای
- ✅ **models.py**: اصلاح مقادیر SQL
- ✅ **routes.py**: رفع خطاهای Status

## 🎯 **برای کاربران جدید**

### **نصب از صفر:**
```bash
unzip goldbot.zip
cd goldbot_deployment_*/
chmod +x *.sh
./install_ubuntu.sh
```

### **پیکربندی سریع:**
```bash
cat > .env << 'EOF'
DATA_DIR=/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files
SYMBOL=XAUUSD
TIMEFRAMES=M1,M5,M15,H1,H4,D1,W1
DATABASE_URL=sqlite:///./goldbot.db
SESSION_SECRET=your-secret-key
TZ=Asia/Tehran
EOF
```

### **اجرا:**
```bash
./start_server.sh
```

## ✅ **تایید عملکرد**

پس از اجرای سیستم، باید این پیام‌ها را مشاهده کنید:
- ✅ `✅ Using DATA_DIR from environment`
- ✅ `✅ Successfully loaded X candles from MT5`
- ✅ `✅ Bot ready at http://0.0.0.0:5000`
- ✅ `✅ Admin notification sent: SUCCESS`

**🎉 سیستم آماده تحلیل و سیگنال‌دهی طلا!**