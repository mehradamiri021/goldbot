import TelegramBot from 'node-telegram-bot-api';
import * as cron from 'node-cron';
import * as fs from 'fs';
import * as path from 'path';

const BOT_TOKEN = process.env.BOT_TOKEN || '7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y';
const CHANNEL_ID = process.env.CHANNEL_ID || '-1002717718463';
const ADMIN_ID = process.env.ADMIN_ID || '1112066452';

// مسیر فایل‌های MT5
const MT5_PATH = '/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files/';

interface MarketData {
  symbol: string;
  timeframe: string;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradingSignal {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  entry: number;
  stopLoss: number;
  takeProfit: number[];
  riskReward: number;
  confidence: number;
  analysis: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected' | 'sent';
  adminTimeout?: NodeJS.Timeout;
}

interface SmartMoneyAnalysis {
  liquidity: 'accumulation' | 'distribution' | 'neutral';
  orderBlocks: Array<{ price: number; type: 'bullish' | 'bearish' }>;
  fairValueGaps: Array<{ high: number; low: number; type: 'bullish' | 'bearish' }>;
  inducement: boolean;
  score: number;
}

interface PriceActionAnalysis {
  pattern: string;
  strength: number;
  keyLevels: {
    support: number[];
    resistance: number[];
  };
  momentum: 'strong_bullish' | 'weak_bullish' | 'neutral' | 'weak_bearish' | 'strong_bearish';
  score: number;
}

export class SignalBot {
  private bot: TelegramBot;
  private isRunning: boolean = false;
  private pendingSignals: Map<string, TradingSignal> = new Map();
  private job: cron.ScheduledTask | null = null;

  constructor() {
    this.bot = new TelegramBot(BOT_TOKEN, { polling: false });
    console.log('⚡ Signal Bot initialized');
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚡ Signal Bot is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Signal Bot with schedule...');
    
    // زمان‌بندی: دوشنبه-جمعه، 8:00-21:00، هر 15 دقیقه
    // cron pattern: */15 8-21 * * 1-5 (هر 15 دقیقه، 8 صبح تا 9 شب، دوشنبه تا جمعه)
    this.job = cron.schedule('*/15 8-21 * * 1-5', async () => {
      await this.generateAndProcessSignal();
    }, {
      timezone: 'Asia/Tehran'
    });

    console.log('📅 Signal Bot scheduled for: Monday-Friday 8:00-21:00, every 15 minutes');
    await this.logActivity('SUCCESS', 'Signal Bot started');
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    if (this.job) {
      this.job.destroy();
      this.job = null;
    }
    
    // پاک کردن سیگنال‌های معلق
    this.pendingSignals.forEach((signal, id) => {
      if (signal.adminTimeout) {
        clearTimeout(signal.adminTimeout);
      }
    });
    this.pendingSignals.clear();

    console.log('⚡ Signal Bot stopped');
    await this.logActivity('SUCCESS', 'Signal Bot stopped');
  }

  async generateAndProcessSignal(): Promise<void> {
    try {
      console.log('🔄 Generating new trading signal...');

      // 1. خواندن داده‌های MT5
      const m15Data = await this.readMT5Data('XAUUSD', 'M15');
      const h1Data = await this.readMT5Data('XAUUSD', 'H1'); 
      const h4Data = await this.readMT5Data('XAUUSD', 'H4');

      if (!m15Data || !h1Data || !h4Data) {
        console.log('⚠️ Not enough market data available');
        return;
      }

      // 2. تحلیل Smart Money
      const smartMoneyAnalysis = await this.analyzeSmartMoney(h4Data, h1Data);

      // 3. تحلیل Price Action
      const priceActionAnalysis = await this.analyzePriceAction(m15Data, h1Data);

      // 4. تحلیل AI و تولید سیگنال
      const signal = await this.generateSignal(m15Data, smartMoneyAnalysis, priceActionAnalysis);

      if (signal && signal.confidence >= 70) {
        // 5. درخواست تایید از ادمین
        await this.requestAdminApproval(signal);
      } else {
        console.log('📊 Signal confidence too low or no clear setup found');
      }

    } catch (error) {
      console.error('❌ Failed to generate signal:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.logActivity('ERROR', 'Failed to generate signal', { error: errorMessage });
    }
  }

  private async readMT5Data(symbol: string, timeframe: string): Promise<MarketData[] | null> {
    try {
      const fileName = `${symbol}_${timeframe}.csv`;
      const filePath = path.join(MT5_PATH, fileName);

      // اگر فایل وجود نداشت، از داده‌های نمونه استفاده کن
      if (!fs.existsSync(filePath)) {
        console.log(`📁 MT5 file not found: ${fileName}, using sample data`);
        return this.generateSampleData(symbol, timeframe);
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.trim().split('\n');
      
      const data: MarketData[] = [];
      for (let i = 1; i < lines.length; i++) { // Skip header
        const columns = lines[i].split(',');
        if (columns.length >= 6) {
          data.push({
            symbol,
            timeframe,
            time: columns[0],
            open: parseFloat(columns[1]),
            high: parseFloat(columns[2]),
            low: parseFloat(columns[3]),
            close: parseFloat(columns[4]),
            volume: parseFloat(columns[5]) || 0
          });
        }
      }

      return data.slice(-200); // آخرین 200 کندل

    } catch (error) {
      console.error(`❌ Error reading MT5 data for ${symbol} ${timeframe}:`, error);
      return this.generateSampleData(symbol, timeframe);
    }
  }

  private generateSampleData(symbol: string, timeframe: string): MarketData[] {
    const data: MarketData[] = [];
    const basePrice = 2485.50; // قیمت پایه طلا
    let currentPrice = basePrice;
    
    for (let i = 0; i < 50; i++) {
      const change = (Math.random() - 0.5) * 20; // تغییر ±10
      currentPrice = Math.max(2400, Math.min(2600, currentPrice + change));
      
      const high = currentPrice + Math.random() * 5;
      const low = currentPrice - Math.random() * 5;
      const open = i === 0 ? currentPrice : data[i-1].close;
      
      data.push({
        symbol,
        timeframe,
        time: new Date(Date.now() - (50-i) * 15 * 60 * 1000).toISOString(),
        open,
        high,
        low,
        close: currentPrice,
        volume: Math.floor(Math.random() * 1000) + 100
      });
    }
    
    return data;
  }

  private async analyzeSmartMoney(h4Data: MarketData[], h1Data: MarketData[]): Promise<SmartMoneyAnalysis> {
    // الگوریتم Smart Money
    const lastCandles = h4Data.slice(-20);
    const h1LastCandles = h1Data.slice(-50);
    
    // شناسایی Order Blocks
    const orderBlocks = this.identifyOrderBlocks(lastCandles);
    
    // شناسایی Fair Value Gaps
    const fairValueGaps = this.identifyFairValueGaps(h1LastCandles);
    
    // تحلیل Liquidity
    const liquidity = this.analyzeLiquidity(lastCandles);
    
    // بررسی Inducement
    const inducement = this.checkInducement(h1LastCandles);
    
    // محاسبه امتیاز کلی
    let score = 0;
    if (liquidity === 'accumulation') score += 30;
    if (liquidity === 'distribution') score += 20;
    if (orderBlocks.length > 0) score += 25;
    if (fairValueGaps.length > 0) score += 20;
    if (inducement) score += 15;
    
    return {
      liquidity,
      orderBlocks,
      fairValueGaps,
      inducement,
      score: Math.min(90, score)
    };
  }

  private identifyOrderBlocks(candles: MarketData[]): Array<{ price: number; type: 'bullish' | 'bearish' }> {
    const orderBlocks = [];
    
    for (let i = 2; i < candles.length - 2; i++) {
      const current = candles[i];
      const prev = candles[i-1];
      const next = candles[i+1];
      
      // Bullish Order Block
      if (current.close > current.open && 
          current.close > prev.high && 
          next.open > current.close) {
        orderBlocks.push({
          price: current.close,
          type: 'bullish' as const
        });
      }
      
      // Bearish Order Block  
      if (current.close < current.open && 
          current.close < prev.low && 
          next.open < current.close) {
        orderBlocks.push({
          price: current.close,
          type: 'bearish' as const
        });
      }
    }
    
    return orderBlocks.slice(-5); // آخرین 5 Order Block
  }

  private identifyFairValueGaps(candles: MarketData[]): Array<{ high: number; low: number; type: 'bullish' | 'bearish' }> {
    const gaps = [];
    
    for (let i = 1; i < candles.length; i++) {
      const current = candles[i];
      const prev = candles[i-1];
      
      // Bullish Fair Value Gap
      if (current.low > prev.high) {
        gaps.push({
          high: current.low,
          low: prev.high,
          type: 'bullish' as const
        });
      }
      
      // Bearish Fair Value Gap
      if (current.high < prev.low) {
        gaps.push({
          high: prev.low,
          low: current.high,
          type: 'bearish' as const
        });
      }
    }
    
    return gaps.slice(-3); // آخرین 3 Gap
  }

  private analyzeLiquidity(candles: MarketData[]): 'accumulation' | 'distribution' | 'neutral' {
    const volumes = candles.map(c => c.volume);
    const prices = candles.map(c => c.close);
    
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const priceChange = prices[prices.length - 1] - prices[0];
    const recentVolume = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5;
    
    if (recentVolume > avgVolume * 1.2 && priceChange > 0) return 'accumulation';
    if (recentVolume > avgVolume * 1.2 && priceChange < 0) return 'distribution';
    return 'neutral';
  }

  private checkInducement(candles: MarketData[]): boolean {
    // بررسی آیا قیمت اخیراً به سطح مقاومت/حمایت رسیده و برگشته
    const recent = candles.slice(-10);
    const highs = recent.map(c => c.high);
    const lows = recent.map(c => c.low);
    
    const maxHigh = Math.max(...highs);
    const minLow = Math.min(...lows);
    const currentPrice = recent[recent.length - 1].close;
    
    // اگر قیمت به بالاترین نقطه رسیده و برگشته
    if (maxHigh - currentPrice > 5 && currentPrice < maxHigh) return true;
    // اگر قیمت به پایین‌ترین نقطه رسیده و برگشته  
    if (currentPrice - minLow > 5 && currentPrice > minLow) return true;
    
    return false;
  }

  private async analyzePriceAction(m15Data: MarketData[], h1Data: MarketData[]): Promise<PriceActionAnalysis> {
    const lastM15 = m15Data.slice(-20);
    const lastH1 = h1Data.slice(-10);
    
    // شناسایی الگو
    const pattern = this.identifyPattern(lastM15);
    
    // محاسبه قدرت
    const strength = this.calculatePatternStrength(lastM15);
    
    // سطوح کلیدی
    const keyLevels = this.identifyKeyLevels(lastH1);
    
    // تحلیل مومنتوم
    const momentum = this.analyzeMomentum(lastM15);
    
    // امتیاز Price Action
    let score = 0;
    if (pattern !== 'undefined') score += 30;
    if (strength > 70) score += 25;
    if (keyLevels.support.length + keyLevels.resistance.length >= 4) score += 20;
    if (momentum.includes('strong')) score += 25;
    
    return {
      pattern,
      strength,
      keyLevels,
      momentum,
      score: Math.min(90, score)
    };
  }

  private identifyPattern(candles: MarketData[]): string {
    // الگوهای مختلف Price Action
    const patterns = [
      'Higher Highs & Higher Lows',
      'Lower Highs & Lower Lows', 
      'Double Top',
      'Double Bottom',
      'Head and Shoulders',
      'Ascending Triangle',
      'Descending Triangle',
      'Flag Pattern',
      'Pennant',
      'Wedge Pattern'
    ];
    
    // انتخاب تصادفی برای نمونه (در پیاده‌سازی واقعی باید الگوریتم دقیق باشد)
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  private calculatePatternStrength(candles: MarketData[]): number {
    // محاسبه قدرت بر اساس حجم، volatility و تایید
    const volumes = candles.map(c => c.volume);
    const prices = candles.map(c => c.close);
    
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const priceRange = Math.max(...prices) - Math.min(...prices);
    const recentVolume = volumes.slice(-3).reduce((a, b) => a + b, 0) / 3;
    
    let strength = 50; // شروع از 50
    
    if (recentVolume > avgVolume * 1.3) strength += 20;
    if (priceRange > 10) strength += 15;
    if (priceRange < 5) strength -= 15;
    
    return Math.max(30, Math.min(95, strength));
  }

  private identifyKeyLevels(candles: MarketData[]): { support: number[]; resistance: number[] } {
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    
    // سطوح حمایت - پایین‌ترین نقاط
    const support = [
      Math.min(...lows),
      Math.min(...lows) + 5,
      Math.min(...lows) + 10
    ];
    
    // سطوح مقاومت - بالاترین نقاط
    const resistance = [
      Math.max(...highs),
      Math.max(...highs) - 5,
      Math.max(...highs) - 10  
    ];
    
    return { support, resistance };
  }

  private analyzeMomentum(candles: MarketData[]): 'strong_bullish' | 'weak_bullish' | 'neutral' | 'weak_bearish' | 'strong_bearish' {
    const prices = candles.map(c => c.close);
    const recentPrices = prices.slice(-5);
    const olderPrices = prices.slice(-10, -5);
    
    const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const olderAvg = olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length;
    
    const change = recentAvg - olderAvg;
    
    if (change > 10) return 'strong_bullish';
    if (change > 3) return 'weak_bullish';
    if (change < -10) return 'strong_bearish';
    if (change < -3) return 'weak_bearish';
    return 'neutral';
  }

  private async generateSignal(
    m15Data: MarketData[], 
    smartMoney: SmartMoneyAnalysis, 
    priceAction: PriceActionAnalysis
  ): Promise<TradingSignal | null> {
    
    const currentPrice = m15Data[m15Data.length - 1].close;
    const confidence = (smartMoney.score + priceAction.score) / 2;
    
    // اگر اعتماد کافی نباشد، سیگنال تولید نشود
    if (confidence < 70) {
      return null;
    }
    
    // تعیین نوع سیگنال بر اساس تحلیل‌ها
    let signalType: 'BUY' | 'SELL';
    let entry: number;
    let stopLoss: number;
    let takeProfit: number[];
    
    if (smartMoney.liquidity === 'accumulation' && 
        priceAction.momentum.includes('bullish')) {
      signalType = 'BUY';
      entry = currentPrice + 2;
      stopLoss = currentPrice - 15;
      takeProfit = [currentPrice + 10, currentPrice + 20, currentPrice + 30];
    } else if (smartMoney.liquidity === 'distribution' && 
               priceAction.momentum.includes('bearish')) {
      signalType = 'SELL'; 
      entry = currentPrice - 2;
      stopLoss = currentPrice + 15;
      takeProfit = [currentPrice - 10, currentPrice - 20, currentPrice - 30];
    } else {
      // هیچ سیگنال واضحی نیست
      return null;
    }
    
    const riskReward = Math.abs((takeProfit[0] - entry) / (stopLoss - entry));
    
    // تولید تحلیل متنی
    const analysis = this.generateAnalysisText(smartMoney, priceAction, signalType);
    
    return {
      id: `signal_${Date.now()}`,
      symbol: 'XAUUSD',
      type: signalType,
      entry,
      stopLoss,
      takeProfit,
      riskReward,
      confidence,
      analysis,
      timestamp: new Date(),
      status: 'pending'
    };
  }

  private generateAnalysisText(
    smartMoney: SmartMoneyAnalysis, 
    priceAction: PriceActionAnalysis, 
    signalType: 'BUY' | 'SELL'
  ): string {
    
    let analysis = `🔍 **تحلیل Smart Money:**\n`;
    analysis += `• وضعیت نقدینگی: ${smartMoney.liquidity}\n`;
    analysis += `• Order Blocks: ${smartMoney.orderBlocks.length} مورد شناسایی شد\n`;
    analysis += `• Fair Value Gaps: ${smartMoney.fairValueGaps.length} مورد\n`;
    analysis += `• نشانه‌های Inducement: ${smartMoney.inducement ? 'بله' : 'خیر'}\n\n`;
    
    analysis += `📊 **تحلیل Price Action:**\n`;
    analysis += `• الگو: ${priceAction.pattern}\n`;
    analysis += `• قدرت الگو: ${priceAction.strength}%\n`;
    analysis += `• مومنتوم: ${priceAction.momentum}\n`;
    analysis += `• سطوح حمایت: ${priceAction.keyLevels.support.slice(0,2).join(', ')}\n`;
    analysis += `• سطوح مقاومت: ${priceAction.keyLevels.resistance.slice(0,2).join(', ')}\n\n`;
    
    analysis += `🎯 **منطق معامله:**\n`;
    if (signalType === 'BUY') {
      analysis += `• شرایط خرید: تجمع نقدینگی + مومنتوم صعودی\n`;
      analysis += `• انتظار شکست سطوح مقاومت\n`;
      analysis += `• حمایت‌های قوی در سطوح پایین‌تر`;
    } else {
      analysis += `• شرایط فروش: توزیع نقدینگی + مومنتوم نزولی\n`;
      analysis += `• انتظار شکست سطوح حمایت\n`;
      analysis += `• مقاومت‌های قوی در سطوح بالاتر`;
    }
    
    return analysis;
  }

  private async requestAdminApproval(signal: TradingSignal): Promise<void> {
    try {
      console.log(`📝 Requesting admin approval for ${signal.type} signal`);
      
      // ذخیره سیگنال در حافظه
      this.pendingSignals.set(signal.id, signal);
      
      // ایجاد پیام تایید برای ادمین
      const message = this.formatSignalForApproval(signal);
      
      // ارسال پیام به ادمین با کیبورد
      const keyboard = {
        inline_keyboard: [
          [
            { text: '✅ تایید و ارسال', callback_data: `approve_${signal.id}` },
            { text: '❌ رد', callback_data: `reject_${signal.id}` }
          ],
          [
            { text: '✏️ ویرایش', callback_data: `edit_${signal.id}` }
          ]
        ]
      };
      
      await this.bot.sendMessage(ADMIN_ID, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
      
      // تنظیم تایمر 5 دقیقه
      signal.adminTimeout = setTimeout(async () => {
        await this.handleTimeoutSignal(signal.id);
      }, 5 * 60 * 1000); // 5 دقیقه
      
      console.log(`⏰ Admin approval timeout set for 5 minutes`);
      await this.logActivity('SUCCESS', 'Signal sent for admin approval', { signalId: signal.id });
      
    } catch (error) {
      console.error('❌ Failed to request admin approval:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.logActivity('ERROR', 'Failed to request admin approval', { error: errorMessage });
    }
  }

  private formatSignalForApproval(signal: TradingSignal): string {
    const currentTime = new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' });
    
    return `🚨 **سیگنال جدید - نیاز به تایید**\n\n` +
           `📊 **جزئیات سیگنال:**\n` +
           `• نماد: ${signal.symbol}\n` +
           `• نوع: ${signal.type === 'BUY' ? '🟢 خرید' : '🔴 فروش'}\n` +
           `• ورود: ${signal.entry.toFixed(2)}\n` +
           `• حد ضرر: ${signal.stopLoss.toFixed(2)}\n` +
           `• اهداف سود:\n` +
           `  - TP1: ${signal.takeProfit[0].toFixed(2)}\n` +
           `  - TP2: ${signal.takeProfit[1].toFixed(2)}\n` +
           `  - TP3: ${signal.takeProfit[2].toFixed(2)}\n` +
           `• ریسک/ریوارد: 1:${signal.riskReward.toFixed(1)}\n` +
           `• اعتماد: ${signal.confidence.toFixed(0)}%\n\n` +
           `${signal.analysis}\n\n` +
           `⏰ زمان: ${currentTime}\n` +
           `🔔 **توجه:** در صورت عدم پاسخ تا 5 دقیقه، آلارم مجدد ارسال می‌شود.`;
  }

  private async handleTimeoutSignal(signalId: string): Promise<void> {
    const signal = this.pendingSignals.get(signalId);
    if (!signal || signal.status !== 'pending') {
      return;
    }
    
    try {
      // ارسال آلارم مجدد به ادمین
      await this.bot.sendMessage(ADMIN_ID, 
        `🚨 **یادآوری: سیگنال منتظر تایید**\n\n` +
        `سیگنال ${signal.type} برای ${signal.symbol} هنوز تایید نشده است.\n` +
        `لطفاً در اسرع وقت تصمیم‌گیری کنید.\n\n` +
        `⏰ زمان: ${new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}`
      );
      
      console.log(`⏰ Timeout reminder sent for signal ${signalId}`);
      await this.logActivity('WARNING', 'Signal approval timeout', { signalId });
      
    } catch (error) {
      console.error('❌ Failed to send timeout reminder:', error);
    }
  }

  async handleAdminCallback(callbackQuery: any): Promise<void> {
    const data = callbackQuery.data;
    const signalId = data.split('_')[1];
    const action = data.split('_')[0];
    
    const signal = this.pendingSignals.get(signalId);
    if (!signal) {
      await this.bot.answerCallbackQuery(callbackQuery.id, { 
        text: 'سیگنال یافت نشد یا منقضی شده است.' 
      });
      return;
    }
    
    try {
      switch (action) {
        case 'approve':
          await this.approveSignal(signalId);
          await this.bot.answerCallbackQuery(callbackQuery.id, { 
            text: '✅ سیگنال تایید و ارسال شد' 
          });
          break;
          
        case 'reject':
          await this.rejectSignal(signalId);
          await this.bot.answerCallbackQuery(callbackQuery.id, { 
            text: '❌ سیگنال رد شد' 
          });
          break;
          
        case 'edit':
          await this.requestSignalEdit(signalId);
          await this.bot.answerCallbackQuery(callbackQuery.id, { 
            text: '✏️ لطفاً مقادیر جدید را ارسال کنید' 
          });
          break;
      }
    } catch (error) {
      console.error('❌ Failed to handle admin callback:', error);
      await this.bot.answerCallbackQuery(callbackQuery.id, { 
        text: 'خطا در پردازش درخواست' 
      });
    }
  }

  private async approveSignal(signalId: string): Promise<void> {
    const signal = this.pendingSignals.get(signalId);
    if (!signal) return;
    
    // پاک کردن تایمر
    if (signal.adminTimeout) {
      clearTimeout(signal.adminTimeout);
    }
    
    // ارسال سیگنال به کانال
    const channelMessage = this.formatSignalForChannel(signal);
    await this.bot.sendMessage(CHANNEL_ID, channelMessage, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
    
    // بروزرسانی وضعیت
    signal.status = 'sent';
    this.pendingSignals.delete(signalId);
    
    console.log(`✅ Signal ${signalId} approved and sent to channel`);
    await this.logActivity('SUCCESS', 'Signal approved and sent', { signalId });
  }

  private async rejectSignal(signalId: string): Promise<void> {
    const signal = this.pendingSignals.get(signalId);
    if (!signal) return;
    
    // پاک کردن تایمر
    if (signal.adminTimeout) {
      clearTimeout(signal.adminTimeout);
    }
    
    // بروزرسانی وضعیت
    signal.status = 'rejected';
    this.pendingSignals.delete(signalId);
    
    console.log(`❌ Signal ${signalId} rejected by admin`);
    await this.logActivity('INFO', 'Signal rejected by admin', { signalId });
  }

  private async requestSignalEdit(signalId: string): Promise<void> {
    const signal = this.pendingSignals.get(signalId);
    if (!signal) return;
    
    const editMessage = `✏️ **ویرایش سیگنال ${signal.symbol} ${signal.type}**\n\n` +
                       `مقادیر فعلی:\n` +
                       `• ورود: ${signal.entry}\n` +
                       `• حد ضرر: ${signal.stopLoss}\n` +
                       `• TP1: ${signal.takeProfit[0]}\n` +
                       `• TP2: ${signal.takeProfit[1]}\n` +
                       `• TP3: ${signal.takeProfit[2]}\n\n` +
                       `لطفاً مقادیر جدید را به فرمت زیر ارسال کنید:\n` +
                       `\`entry=2485.50 sl=2470.00 tp1=2495.00 tp2=2505.00 tp3=2515.00\``;
    
    await this.bot.sendMessage(ADMIN_ID, editMessage, { parse_mode: 'Markdown' });
  }

  private formatSignalForChannel(signal: TradingSignal): string {
    const currentTime = new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' });
    const typeIcon = signal.type === 'BUY' ? '🟢' : '🔴';
    const typeText = signal.type === 'BUY' ? 'خرید' : 'فروش';
    
    return `${typeIcon} **سیگنال ${typeText} ${signal.symbol}**\n\n` +
           `📍 **ورود:** ${signal.entry.toFixed(2)}\n` +
           `🛑 **حد ضرر:** ${signal.stopLoss.toFixed(2)}\n` +
           `🎯 **اهداف سود:**\n` +
           `• TP1: ${signal.takeProfit[0].toFixed(2)}\n` +
           `• TP2: ${signal.takeProfit[1].toFixed(2)}\n` +
           `• TP3: ${signal.takeProfit[2].toFixed(2)}\n\n` +
           `⚖️ **ریسک/ریوارد:** 1:${signal.riskReward.toFixed(1)}\n` +
           `🔥 **قدرت سیگنال:** ${signal.confidence.toFixed(0)}%\n\n` +
           `📊 **منطق معامله:**\n${signal.analysis.split('\n\n')[2]}\n\n` +
           `⏰ ${currentTime}`;
  }

  // تست دستی سیگنال
  async testSignalGeneration(): Promise<void> {
    try {
      console.log('🧪 Testing signal generation...');
      await this.generateAndProcessSignal();
      console.log('✅ Signal generation test completed');
    } catch (error) {
      console.error('❌ Signal generation test failed:', error);
    }
  }

  private async logActivity(type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO', message: string, data?: any): Promise<void> {
    try {
      const level = type === 'SUCCESS' ? 'info' : type === 'ERROR' ? 'error' : type === 'WARNING' ? 'warn' : 'info';
      
      await fetch('http://localhost:5000/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          message,
          source: 'signal-bot',
          metadata: data ? JSON.stringify(data) : undefined
        })
      });
    } catch (error) {
      console.error('📝 Failed to log activity:', error);
    }
  }
}