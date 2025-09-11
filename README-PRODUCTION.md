# 🔥 GOLDBOT - Production Ready Package

## سیستم جامع تحلیل، سیگنال‌دهی و اعلام قیمت طلا و ارز

### ✨ ویژگی‌های جدید در این نسخه:

#### 🔄 **MT5 Auto-Trigger Integration**
- **تریگر خودکار تولید سیگنال**: وقتی داده‌های جدید از MT5 دریافت می‌شود، سیستم خودکار signal generation را فعال می‌کند
- **تحلیل چارت خودکار**: برای timeframe های H4، تحلیل چارت به صورت خودکار انجام می‌شود
- **اطلاع‌رسانی فوری**: ادمین فوراً از دریافت داده‌های MT5 مطلع می‌شود

#### 📊 **سیستم تایید فایل‌ها**
- **CSV Upload Confirmation**: تایید خودکار بارگذاری فایل‌های FXStreet
- **MT5 Data Confirmation**: تایید و شمارش داده‌های دریافتی از MetaTrader 5
- **Telegram Notifications**: اطلاع‌رسانی کامل به ادمین

#### ⚙️ **مدیریت تنظیمات**
- **API Key Management**: تغییر کلید API نوسان از وب پنل
- **MT5 Path Settings**: تنظیم مسیر داده‌های MT5
- **Live Testing**: تست فوری API ها از پنل ادمین

---

## 🚀 **نصب یک‌خطی (تضمینی)**

```bash
curl -s https://raw.githubusercontent.com/mehradamiri021/goldbot/main/GOLDBOT_FINAL_COMPLETE.sh | bash
```

### 📋 **مراحل نصب:**

1. **بروزرسانی سیستم** - Ubuntu/Debian packages
2. **نصب Node.js 20+** - آخرین نسخه پایدار
3. **نصب PM2** - مدیریت فرآیندها
4. **دانلود Goldbot** - از GitHub releases
5. **تنظیم Nginx** - Proxy و دسترسی
6. **راه‌اندازی خودکار** - PM2 ecosystem
7. **ایجاد اسکریپت‌های مدیریت** - کنترل آسان

---

## 🌐 **دسترسی پس از نصب:**

| سرویس | پورت | دسترسی | توضیحات |
|--------|------|---------|---------|
| **ادمین پنل** | `:3000` | کامل | مدیریت کامل سیستم |
| **عمومی** | `:80` | محدود | فقط API قیمت‌ها |

```
🔧 ادمین پنل: http://YOUR_IP:3000
🌍 دسترسی عمومی: http://YOUR_IP
```

---

## 🛠️ **دستورات مدیریت:**

| اسکریپت | عملکرد | دستور |
|----------|---------|--------|
| `status.sh` | نمایش وضعیت | `./status.sh` |
| `restart.sh` | راه‌اندازی مجدد | `./restart.sh` |
| `logs.sh` | نمایش لاگ‌ها | `./logs.sh` |
| `web-console.sh` | اطلاعات دسترسی | `./web-console.sh` |

---

## 📁 **ساختار فایل‌ها:**

```
/root/goldbot/
├── server/                 # Backend Node.js
├── client/                 # Frontend React
├── shared/                 # Shared schemas
├── ecosystem.config.cjs    # PM2 configuration
├── package.json           # Dependencies
├── *.sh                   # Management scripts
└── logs/                  # System logs
```

**مسیر MT5:**
```
/root/.wine/drive_c/Program Files/Capitalxtend LLC MT5 Terminal/MQL5/Files/
├── goldbot_XAUUSD_PERIOD_M15.csv
├── goldbot_XAUUSD_PERIOD_H1.csv
└── goldbot_XAUUSD_PERIOD_H4.csv
```

---

## 🤖 **ربات‌های فعال:**

1. **📊 Analysis Bot** - تحلیل فنی و اخبار
2. **⚡ Signal Bot** - تولید سیگنال‌های معاملاتی  
3. **💰 Price Bot** - اعلام قیمت‌ها
4. **🎛️ Main Bot** - کنترل مرکزی

---

## 🔧 **تنظیمات مهم:**

### API نوسان:
- **URL**: `http://api.navasan.tech/latest/`
- **Key**: `freeBY5YCsWyaVmR7DSu2QOLTH0KBsbu`
- **قابل تغییر**: از پنل ادمین

### کانال ZaryaalGold:
- **شناسه**: `@ZaryaalGold`
- **هدف**: قیمت‌های شمش طلا

---

## 🔄 **Auto-Trigger جدید:**

### Signal Generation:
```javascript
// وقتی داده‌های MT5 دریافت می‌شود:
if (symbol === 'XAUUSD' && ['M15', 'H1', 'H4'].includes(timeframe)) {
  await signalBot.generateSignal();
}
```

### Chart Analysis:
```javascript
// برای timeframe H4:
if (timeframe === 'H4') {
  await analysisBot.performTechnicalAnalysis();
}
```

---

## 📞 **پشتیبانی:**

- **GitHub**: [mehradamiri021/goldbot](https://github.com/mehradamiri021/goldbot)
- **Issues**: GitHub Issues tab
- **Documentation**: Repository README

---

## ⚡ **Performance:**

- **Memory Usage**: < 1GB RAM
- **CPU Usage**: < 10% average
- **Storage**: ~ 100MB total
- **Network**: Minimal bandwidth

---

## 🔐 **امنیت:**

- **Root Access**: مورد نیاز برای نصب
- **Port Management**: Nginx proxy
- **API Protection**: Rate limiting
- **Log Monitoring**: PM2 + Nginx logs

---

**✅ Production Ready - Tested & Stable**

*آخرین بروزرسانی: ۱۴۰۳/۶/۱۴*