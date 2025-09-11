import TelegramBot from 'node-telegram-bot-api';
import { storage } from '../storage';

class TelegramService {
  private bot: TelegramBot | null = null;
  private botToken: string = '';
  private channelId: string = '';
  private adminId: string = '';

  async initialize() {
    const tokenSetting = await storage.getSetting('telegram_bot_token');
    const channelSetting = await storage.getSetting('telegram_channel_id');
    const adminSetting = await storage.getSetting('admin_telegram_id');

    if (!tokenSetting || !channelSetting || !adminSetting) {
      throw new Error('Telegram settings not configured');
    }

    this.botToken = tokenSetting.value;
    this.channelId = channelSetting.value;
    this.adminId = adminSetting.value;

    this.bot = new TelegramBot(this.botToken, { polling: false });
    
    await storage.createLog({
      level: 'info',
      message: 'Telegram service initialized',
      source: 'telegram-service'
    });
  }

  async sendToChannel(message: string, options?: any) {
    if (!this.bot) {
      await this.initialize();
    }

    try {
      const result = await this.bot!.sendMessage(this.channelId, message, {
        parse_mode: 'HTML',
        ...options
      });
      
      await storage.createLog({
        level: 'info',
        message: `Message sent to channel: ${message.substring(0, 100)}...`,
        source: 'telegram-service'
      });
      
      return result;
    } catch (error) {
      await storage.createLog({
        level: 'error',
        message: `Failed to send message to channel: ${error}`,
        source: 'telegram-service'
      });
      throw error;
    }
  }

  async sendToAdmin(message: string, options?: any) {
    if (!this.bot) {
      await this.initialize();
    }

    try {
      const result = await this.bot!.sendMessage(this.adminId, message, {
        parse_mode: 'HTML',
        ...options
      });
      
      await storage.createLog({
        level: 'info',
        message: `Message sent to admin: ${message.substring(0, 100)}...`,
        source: 'telegram-service'
      });
      
      return result;
    } catch (error) {
      await storage.createLog({
        level: 'error',
        message: `Failed to send message to admin: ${error}`,
        source: 'telegram-service'
      });
      throw error;
    }
  }

  async sendPhoto(chatId: string, photo: Buffer | string, caption?: string) {
    if (!this.bot) {
      await this.initialize();
    }

    try {
      const result = await this.bot!.sendPhoto(chatId, photo, {
        caption,
        parse_mode: 'HTML'
      });
      
      return result;
    } catch (error) {
      await storage.createLog({
        level: 'error',
        message: `Failed to send photo: ${error}`,
        source: 'telegram-service'
      });
      throw error;
    }
  }

  formatAnalysisReport(report: any) {
    const emoji = {
      'daily_morning': '🌅',
      'daily_evening': '🌆',
      'weekly_news': '📅',
      'weekly_technical': '📊'
    };

    const time = new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' });
    const header = `${emoji[report.reportType]} گزارش تحلیلی\n📅 ${time}\n\n`;
    
    return header + report.content;
  }

  formatTradingSignal(signal: any) {
    const typeEmoji = signal.type === 'buy' ? '🟢' : '🔴';
    const typeText = signal.type === 'buy' ? 'خرید' : 'فروش';
    
    const riskReward = signal.riskReward ? signal.riskReward.toFixed(2) : 'محاسبه نشده';
    
    return `⚡ سیگنال معاملاتی ${typeEmoji}
    
📊 نماد: ${signal.symbol}
${typeEmoji} نوع: ${typeText}
💰 ورود: ${signal.entryPrice}
🛑 توقف ضرر: ${signal.stopLoss}
🎯 هدف سود: ${signal.takeProfit}
📈 نسبت ریسک/ریوارد: ${riskReward}
🔥 اطمینان: ${signal.confidence}%

💡 منطق معامله:
${signal.reasoning}

⏰ زمان: ${new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}`;
  }

  formatPriceUpdate(prices: any) {
    const time = new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' });
    
    return `💰 قیمت‌های لحظه‌ای
⏰ ${time}

${prices.content}

📊 @gold_analysis021_bot`;
  }
}

export const telegramService = new TelegramService();
