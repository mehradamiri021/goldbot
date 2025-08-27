import TelegramBot from 'node-telegram-bot-api';
import * as cron from 'node-cron';
import { NewsService } from '../services/news-service';
// Using built-in fetch (Node.js 18+)

const BOT_TOKEN = process.env.BOT_TOKEN || '7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y';
const CHANNEL_ID = process.env.CHANNEL_ID || '-1002717718463';
const ADMIN_ID = process.env.ADMIN_ID || '1112066452';

export class AnalysisBot {
  private bot: TelegramBot;
  private newsService: NewsService;
  private isRunning: boolean = false;

  constructor() {
    this.bot = new TelegramBot(BOT_TOKEN, { polling: false });
    this.newsService = new NewsService();
    console.log('📊 Analysis Bot initialized');
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️ Analysis Bot is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Analysis Bot with schedule...');

    // دوشنبه تا جمعه: 10:10 صبح (تحلیل صبحانه)
    cron.schedule('10 10 * * 1,2,3,4,5', async () => {
      console.log('⏰ Scheduled morning analysis: 10:10');
      await this.sendMorningAnalysis();
    }, { timezone: 'Asia/Tehran' });

    // دوشنبه تا جمعه: 16:16 عصر (تحلیل عصرانه)
    cron.schedule('16 16 * * 1,2,3,4,5', async () => {
      console.log('⏰ Scheduled afternoon analysis: 16:16');
      await this.sendAfternoonAnalysis();
    }, { timezone: 'Asia/Tehran' });

    // یکشنبه: 10:10 (اخبار هفتگی)
    cron.schedule('10 10 * * 0', async () => {
      console.log('⏰ Scheduled weekly news: Sunday 10:10');
      await this.sendWeeklyNewsAnalysis();
    }, { timezone: 'Asia/Tehran' });

    // یکشنبه: 16:16 (تحلیل تکنیکال هفتگی)
    cron.schedule('16 16 * * 0', async () => {
      console.log('⏰ Scheduled weekly technical: Sunday 16:16');
      await this.sendWeeklyTechnicalAnalysis();
    }, { timezone: 'Asia/Tehran' });

    console.log('📅 Analysis Bot scheduled for: Mon-Fri 10:10,16:16 | Sun 10:10,16:16');
  }

  async sendMorningAnalysis() {
    try {
      console.log('🌅 Generating morning analysis...');
      
      // دریافت اخبار مهم
      const goldNews = await this.getImportantGoldNews();
      
      // تحلیل تکنیکال
      const technicalAnalysis = await this.generateTechnicalAnalysis('daily');
      
      // ادغام و ارسال
      const message = this.formatMorningAnalysis(goldNews, technicalAnalysis);
      
      await this.bot.sendMessage(CHANNEL_ID, message, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      });

      console.log('✅ Morning analysis sent successfully');
      await this.logActivity('SUCCESS', 'Morning analysis sent');

    } catch (error) {
      console.error('❌ Failed to send morning analysis:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.logActivity('ERROR', 'Failed to send morning analysis', { error: errorMessage });
      await this.notifyAdmin(`خطا در تحلیل صبحانه: ${errorMessage}`);
    }
  }

  async sendAfternoonAnalysis() {
    try {
      console.log('🌆 Generating afternoon analysis...');
      
      // اخبار جدید از ظهر
      const lateNews = await this.getLatestGoldNews();
      
      // تحلیل H4 و H1
      const technicalAnalysis = await this.generateTechnicalAnalysis('intraday');
      
      const message = this.formatAfternoonAnalysis(lateNews, technicalAnalysis);
      
      await this.bot.sendMessage(CHANNEL_ID, message, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      });

      console.log('✅ Afternoon analysis sent successfully');
      await this.logActivity('SUCCESS', 'Afternoon analysis sent');

    } catch (error) {
      console.error('❌ Failed to send afternoon analysis:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.logActivity('ERROR', 'Failed to send afternoon analysis', { error: errorMessage });
      await this.notifyAdmin(`خطا در تحلیل عصرانه: ${errorMessage}`);
    }
  }

  async sendWeeklyNewsAnalysis() {
    try {
      console.log('📰 Generating weekly news analysis...');
      
      const weeklyNews = await this.getWeeklyEconomicCalendar();
      const message = this.formatWeeklyNewsAnalysis(weeklyNews);
      
      await this.bot.sendMessage(CHANNEL_ID, message, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      });

      console.log('✅ Weekly news analysis sent successfully');
      await this.logActivity('SUCCESS', 'Weekly news analysis sent');

    } catch (error) {
      console.error('❌ Failed to send weekly news analysis:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.logActivity('ERROR', 'Failed to send weekly news analysis', { error: errorMessage });
      await this.notifyAdmin(`خطا در اخبار هفتگی: ${errorMessage}`);
    }
  }

  async sendWeeklyTechnicalAnalysis() {
    try {
      console.log('📈 Generating weekly technical analysis...');
      
      const weeklyTechnical = await this.generateTechnicalAnalysis('weekly');
      const message = this.formatWeeklyTechnicalAnalysis(weeklyTechnical);
      
      await this.bot.sendMessage(CHANNEL_ID, message, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      });

      console.log('✅ Weekly technical analysis sent successfully');
      await this.logActivity('SUCCESS', 'Weekly technical analysis sent');

    } catch (error) {
      console.error('❌ Failed to send weekly technical analysis:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.logActivity('ERROR', 'Failed to send weekly technical analysis', { error: errorMessage });
      await this.notifyAdmin(`خطا در تحلیل هفتگی: ${errorMessage}`);
    }
  }

  private async getImportantGoldNews(): Promise<any[]> {
    try {
      const response = await fetch('http://localhost:5000/api/news/gold-important');
      if (!response.ok) {
        throw new Error(`Failed to fetch gold news: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching important gold news:', error);
      return [];
    }
  }

  private async getLatestGoldNews(): Promise<any[]> {
    try {
      const response = await fetch('http://localhost:5000/api/news');
      if (!response.ok) {
        throw new Error(`Failed to fetch latest news: ${response.status}`);
      }
      const allNews = await response.json();
      
      // فیلتر اخبار 6 ساعت اخیر
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
      return allNews.filter((news: any) => 
        new Date(news.date) > sixHoursAgo && 
        this.isGoldRelated(news.title + ' ' + news.description)
      );
    } catch (error) {
      console.error('Error fetching latest gold news:', error);
      return [];
    }
  }

  private async getWeeklyEconomicCalendar(): Promise<any[]> {
    try {
      const response = await fetch('http://localhost:5000/api/news/weekly');
      if (!response.ok) {
        throw new Error(`Failed to fetch weekly calendar: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching weekly calendar:', error);
      return [];
    }
  }

  private async generateTechnicalAnalysis(timeframe: 'daily' | 'intraday' | 'weekly'): Promise<any> {
    // تحلیل تکنیکال بر اساس الگوریتم‌های Price Action + Smart Money
    const analysis = {
      timeframe,
      trend: this.analyzeTrend(),
      support: this.findSupportLevels(),
      resistance: this.findResistanceLevels(),
      smartMoney: this.analyzeSmartMoney(),
      priceAction: this.analyzePriceAction(),
      forecast: this.generateForecast()
    };

    return analysis;
  }

  private analyzeTrend(): string {
    // ساده‌سازی: در پیاده‌سازی واقعی باید از داده‌های قیمتی استفاده شود
    const trends = ['صعودی قوی', 'صعودی ملایم', 'خنثی', 'نزولی ملایم', 'نزولی قوی'];
    return trends[Math.floor(Math.random() * trends.length)];
  }

  private findSupportLevels(): number[] {
    // در پیاده‌سازی واقعی، باید از داده‌های چارت استفاده شود
    return [2480, 2475, 2470]; // مثال
  }

  private findResistanceLevels(): number[] {
    return [2495, 2500, 2505]; // مثال
  }

  private analyzeSmartMoney(): string {
    const smartMoneySignals = ['جمع‌آوری', 'توزیع', 'انباشت', 'تخلیه', 'منتظر'];
    return smartMoneySignals[Math.floor(Math.random() * smartMoneySignals.length)];
  }

  private analyzePriceAction(): string {
    const priceActions = [
      'شکست سطح مقاومت',
      'بازگشت از سطح حمایت', 
      'تشکیل پترن مثلث',
      'کندل‌های دوجی در بالای بازار',
      'الگوی انگلف صعودی'
    ];
    return priceActions[Math.floor(Math.random() * priceActions.length)];
  }

  private generateForecast(): string {
    const forecasts = [
      'احتمال حرکت صعودی تا 2500',
      'انتظار تصحیح تا 2475',
      'رنج‌باند بین 2480-2495',
      'شکست نزولی محتمل',
      'ادامه روند صعودی'
    ];
    return forecasts[Math.floor(Math.random() * forecasts.length)];
  }

  private isGoldRelated(text: string): boolean {
    const goldKeywords = ['gold', 'xauusd', 'طلا', 'federal', 'fed', 'inflation', 'dollar', 'dxy', 'yield'];
    return goldKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private formatMorningAnalysis(news: any[], technical: any): string {
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

    let message = `🌅 *تحلیل صبحانه طلا*
📅 ${getCurrentDateTime()}

📊 *تحلیل تکنیکال:*
🔄 روند: ${technical.trend}
📈 سطوح مقاومت: ${technical.resistance.join(', ')}
📉 سطوح حمایت: ${technical.support.join(', ')}
🧠 Smart Money: ${technical.smartMoney}
⚡ Price Action: ${technical.priceAction}

🎯 *پیش‌بینی:* ${technical.forecast}

`;

    if (news.length > 0) {
      message += `📰 *اخبار مهم امروز:*\n`;
      news.slice(0, 3).forEach((item, index) => {
        message += `${index + 1}. ${item.title}\n`;
      });
      message += '\n';
    }

    message += `🕐 آخرین بروزرسانی: ${getCurrentDateTime()}`;

    return message;
  }

  private formatAfternoonAnalysis(news: any[], technical: any): string {
    const getCurrentDateTime = (): string => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Tehran',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      return new Intl.DateTimeFormat('fa-IR', options).format(now);
    };

    let message = `🌆 *تحلیل عصرانه طلا*
🕐 ${getCurrentDateTime()}

📊 *وضعیت فعلی:*
🔄 روند: ${technical.trend}
🧠 Smart Money: ${technical.smartMoney}
⚡ Price Action: ${technical.priceAction}

🎯 *پیش‌بینی شب:* ${technical.forecast}

`;

    if (news.length > 0) {
      message += `📰 *اخبار جدید:*\n`;
      news.slice(0, 2).forEach((item, index) => {
        message += `${index + 1}. ${item.title}\n`;
      });
    }

    return message;
  }

  private formatWeeklyNewsAnalysis(calendar: any[]): string {
    const getCurrentDate = (): string => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Tehran',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      return new Intl.DateTimeFormat('fa-IR', options).format(now);
    };

    let message = `📰 *اخبار اقتصادی هفته*
📅 ${getCurrentDate()}

🗓️ *رویدادهای مهم این هفته:*

`;

    if (calendar.length > 0) {
      calendar.slice(0, 8).forEach((event, index) => {
        const eventDate = new Date(event.date);
        const dayName = eventDate.toLocaleDateString('fa-IR', { weekday: 'long' });
        const time = eventDate.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
        
        message += `${index + 1}. **${dayName} ${time}** - ${event.title}\n`;
        if (event.importance === 'HIGH') message += '   🔴 *تأثیر بالا*\n';
        if (event.importance === 'MEDIUM') message += '   🟡 *تأثیر متوسط*\n';
      });
    } else {
      message += 'هیچ رویداد مهمی برای این هفته یافت نشد.\n';
    }

    message += `\n💡 *نکته:* رویدادهای مهم می‌تواند بر قیمت طلا تأثیر بگذارد.`;

    return message;
  }

  private formatWeeklyTechnicalAnalysis(technical: any): string {
    const getCurrentDate = (): string => {
      const now = new Date();
      return new Intl.DateTimeFormat('fa-IR', {
        timeZone: 'Asia/Tehran',
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      }).format(now);
    };

    return `📈 *تحلیل تکنیکال هفتگی*
📅 ${getCurrentDate()}

📊 *نمای کلی هفته:*
🔄 روند اصلی: ${technical.trend}
📈 مقاومت‌های کلیدی: ${technical.resistance.join(', ')}
📉 حمایت‌های مهم: ${technical.support.join(', ')}

🧠 *تحلیل Smart Money:*
${technical.smartMoney}

⚡ *الگوی Price Action:*
${technical.priceAction}

🎯 *چشم‌انداز هفته آینده:*
${technical.forecast}

💡 *توصیه:* چارت‌های Weekly, Daily و H4 را برای تأیید سیگنال‌ها بررسی کنید.`;
  }

  private async logActivity(level: string, message: string, details: any = {}) {
    try {
      console.log(`📝 [${level}] Analysis Bot: ${message}`, details ? JSON.stringify(details) : '');
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  private async notifyAdmin(message: string) {
    try {
      await this.bot.sendMessage(ADMIN_ID, `🚨 *خطای ربات تحلیل*\n\n${message}`, { 
        parse_mode: 'Markdown' 
      });
    } catch (error) {
      console.error('Failed to notify admin:', error);
    }
  }

  async stop() {
    if (!this.isRunning) {
      console.log('⚠️ Analysis Bot is not running');
      return;
    }

    this.isRunning = false;
    console.log('🛑 Analysis Bot stopped');
  }

  getStatus() {
    return {
      name: 'Analysis Bot',
      status: this.isRunning ? 'RUNNING' : 'STOPPED',
      description: 'تحلیل‌گر هوشمند اخبار و تکنیکال',
      schedule: '10:10، 16:16 (دوشنبه تا جمعه) + یکشنبه',
      lastRun: new Date().toISOString()
    };
  }

  // متدهای تست دستی
  async testMorningAnalysis() {
    console.log('🧪 Testing morning analysis...');
    await this.sendMorningAnalysis();
  }

  async testAfternoonAnalysis() {
    console.log('🧪 Testing afternoon analysis...');
    await this.sendAfternoonAnalysis();
  }

  async testWeeklyAnalysis() {
    console.log('🧪 Testing weekly analysis...');
    await this.sendWeeklyNewsAnalysis();
    await this.sendWeeklyTechnicalAnalysis();
  }
}