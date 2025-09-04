import cron from 'node-cron';
import TelegramBot from 'node-telegram-bot-api';

const BOT_TOKEN = process.env.BOT_TOKEN || '7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y';
const CHANNEL_ID = process.env.CHANNEL_ID || '-1002717718463';

export class PriceBot {
  private bot: TelegramBot;
  private isRunning: boolean = false;

  constructor() {
    this.bot = new TelegramBot(BOT_TOKEN, { polling: false });
    console.log('💰 Price Bot initialized');
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️ Price Bot is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Price Bot with schedule...');

    // زمان‌بندی: 11:11، 14:14، 17:17 (شنبه تا پنج‌شنبه)
    // کرون پترن: دقیقه ساعت * * روز_هفته
    // 6=شنبه, 0=یکشنبه, 1=دوشنبه, 2=سه‌شنبه, 3=چهارشنبه, 4=پنج‌شنبه

    // 11:11 صبح
    cron.schedule('11 11 * * 6,0,1,2,3,4', async () => {
      console.log('⏰ Scheduled price announcement: 11:11');
      await this.sendPriceAnnouncement();
    }, {
      scheduled: true,
      timezone: "Asia/Tehran"
    });

    // 14:14 ظهر
    cron.schedule('14 14 * * 6,0,1,2,3,4', async () => {
      console.log('⏰ Scheduled price announcement: 14:14');
      await this.sendPriceAnnouncement();
    }, {
      scheduled: true,
      timezone: "Asia/Tehran"
    });

    // 17:17 عصر
    cron.schedule('17 17 * * 6,0,1,2,3,4', async () => {
      console.log('⏰ Scheduled price announcement: 17:17');
      await this.sendPriceAnnouncement();
    }, {
      scheduled: true,
      timezone: "Asia/Tehran"
    });

    console.log('📅 Price Bot scheduled for: 11:11, 14:14, 17:17 (Saturday to Thursday)');
  }

  async sendPriceAnnouncement() {
    try {
      console.log('💰 Fetching latest prices for announcement...');
      
      // دریافت آخرین قیمت‌ها از سرور
      const response = await fetch('http://localhost:5000/api/prices/latest');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch prices: ${response.status}`);
      }

      const prices = await response.json();
      const message = this.formatPriceMessage(prices);

      // ارسال پیام به کانال
      await this.bot.sendMessage(CHANNEL_ID, message, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      });

      console.log('✅ Price announcement sent successfully');
      
      // ثبت لاگ عملیات موفق
      await this.logActivity('SUCCESS', 'Price announcement sent', { 
        timestamp: new Date().toISOString(),
        pricesCount: Object.keys(prices).length
      });

    } catch (error) {
      console.error('❌ Failed to send price announcement:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // ثبت لاگ خطا
      await this.logActivity('ERROR', 'Failed to send price announcement', { 
        error: errorMessage,
        timestamp: new Date().toISOString()
      });

      // اطلاع به ادمین در صورت خطا
      await this.notifyAdmin(`خطا در ارسال اعلان قیمت‌ها: ${errorMessage}`);
    }
  }

  private formatPriceMessage(prices: any): string {
    const formatNumber = (num: number): string => {
      if (num === 0 || !num) return '0';
      return num.toLocaleString('fa-IR');
    };

    const getCurrentDateTime = (): string => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Tehran',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      return new Intl.DateTimeFormat('fa-IR', options).format(now);
    };

    return `🔔 *اعلان قیمت‌های بازار*
📅 ${getCurrentDateTime()}

💱 *ارزهای خارجی:*
🇺🇸 دلار آمریکا: ${formatNumber(prices.usd)} تومان
🇪🇺 یورو: ${formatNumber(prices.eur)} تومان
🇨🇦 دلار کانادا: ${formatNumber(prices.cad)} تومان
🇦🇪 درهم امارات: ${formatNumber(prices.aed)} تومان

🪙 *رمزارزها:*
₿ بیت‌کوین: ${formatNumber(prices.bitcoin)} تومان
⧫ اتریوم: ${formatNumber(prices.ethereum)} تومان  
💎 تتر (USDT): ${formatNumber(prices.tether)} تومان

🥇 *طلا و سکه:*
🔶 طلای 18 عیار (گرم): ${formatNumber(prices.gold18k)} ریال
🟡 سکه امامی: ${formatNumber(prices.coin)} تومان

💰 *شمش طلا 995 - فروش:*
🇺🇸 ${formatNumber(prices.goldUSD)} USD
🇪🇺 ${formatNumber(prices.goldEUR)} EUR  
🇦🇪 ${formatNumber(prices.goldAED)} AED
🇨🇳 ${formatNumber(prices.goldCNY)} CNY

💵 *شمش طلا 995 - خرید:*
🏛️ بازار آزاد: ${formatNumber(prices.buyTomanFree)} تومان
🏢 مرکز مبادله: ${formatNumber(prices.buyTomanCenter)} تومان
💸 دلار آزاد: ${formatNumber(prices.buyUSDFree)} USD
🥇 دلار طلا: ${formatNumber(prices.buyUSDGold)} USD
📋 دلار رفع تعهد: ${formatNumber(prices.buyUSDDebt)} USD

🕐 آخرین بروزرسانی: ${getCurrentDateTime()}`;
  }

  private async logActivity(level: string, message: string, details: any = {}) {
    try {
      console.log(`📝 [${level}] Price Bot: ${message}`, details ? JSON.stringify(details) : '');
      // حذف درخواست API برای لاگ‌گیری - استفاده از کنسول
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  private async notifyAdmin(message: string) {
    const ADMIN_ID = process.env.ADMIN_ID || '1112066452';
    try {
      await this.bot.sendMessage(ADMIN_ID, `🚨 *خطای ربات قیمت*\n\n${message}`, { 
        parse_mode: 'Markdown' 
      });
    } catch (error) {
      console.error('Failed to notify admin:', error);
    }
  }

  async stop() {
    if (!this.isRunning) {
      console.log('⚠️ Price Bot is not running');
      return;
    }

    this.isRunning = false;
    console.log('🛑 Price Bot stopped');
  }

  getStatus() {
    return {
      name: 'Price Bot',
      status: this.isRunning ? 'RUNNING' : 'STOPPED',
      description: 'اعلام قیمت‌های طلا و ارز',
      schedule: '11:11، 14:14، 17:17 (شنبه تا پنج‌شنبه)',
      lastRun: new Date().toISOString()
    };
  }

  // متد برای تست دستی
  async testAnnouncement() {
    console.log('🧪 Testing price announcement...');
    await this.sendPriceAnnouncement();
  }
}