import { 
  type BotStatus, type InsertBotStatus,
  type AnalysisReport, type InsertAnalysisReport,
  type TradingSignal, type InsertTradingSignal,
  type PriceHistory, type InsertPriceHistory,
  type NewsItem, type InsertNewsItem,
  type SystemLog, type InsertSystemLog,
  type Setting, type InsertSetting,
  type ChartData, type InsertChartData,
  type WeeklyCSVFile, type InsertWeeklyCSVFile,
  type EconomicEvent, type InsertEconomicEvent
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Bot Status
  getBotStatus(botName: string): Promise<BotStatus | undefined>;
  getAllBotStatuses(): Promise<BotStatus[]>;
  updateBotStatus(status: InsertBotStatus): Promise<BotStatus>;
  
  // Analysis Reports
  createAnalysisReport(report: InsertAnalysisReport): Promise<AnalysisReport>;
  getAnalysisReports(limit?: number): Promise<AnalysisReport[]>;
  getReportsByType(reportType: string): Promise<AnalysisReport[]>;
  
  // Trading Signals
  createTradingSignal(signal: InsertTradingSignal): Promise<TradingSignal>;
  getPendingSignals(): Promise<TradingSignal[]>;
  updateSignalStatus(id: number, status: string, approvedBy?: string): Promise<TradingSignal>;
  getTodaysSignals(): Promise<TradingSignal[]>;
  
  // Price History
  createPriceHistory(price: InsertPriceHistory): Promise<PriceHistory>;
  getLatestPrices(): Promise<PriceHistory[]>;
  
  // News Items
  createNewsItem(news: InsertNewsItem): Promise<NewsItem>;
  getLatestNews(limit?: number): Promise<NewsItem[]>;
  getNewsByImpact(impact: string[]): Promise<NewsItem[]>;
  
  // System Logs
  createLog(log: InsertSystemLog): Promise<SystemLog>;
  getRecentLogs(limit?: number): Promise<SystemLog[]>;
  getLogsByLevel(level: string): Promise<SystemLog[]>;
  getLogsByBot(botName: string): Promise<SystemLog[]>;
  getLogStats(): Promise<{ error_count: number; warning_count: number; info_count: number; total_count: number }>;
  clearOldLogs(cutoffDate: Date): Promise<void>;
  clearLogsByBot(botName: string): Promise<void>;
  
  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(setting: InsertSetting): Promise<Setting>;
  getAllSettings(): Promise<Setting[]>;
  
  // Chart Data
  saveChartData(data: InsertChartData[]): Promise<ChartData[]>;
  getChartData(timeframe: string, limit?: number): Promise<ChartData[]>;
  
  // Weekly CSV Files
  uploadWeeklyCSV(csvData: InsertWeeklyCSVFile): Promise<WeeklyCSVFile>;
  getActiveWeeklyCSV(): Promise<WeeklyCSVFile | undefined>;
  getAllWeeklyCSVs(): Promise<WeeklyCSVFile[]>;
  deactivateAllCSVs(): Promise<void>;
  
  // Economic Events
  saveEconomicEvents(events: InsertEconomicEvent[]): Promise<EconomicEvent[]>;
  getWeeklyEvents(): Promise<EconomicEvent[]>;
  getHighMediumImpactEvents(): Promise<EconomicEvent[]>;
  getGoldRelevantEvents(): Promise<EconomicEvent[]>;
  getLatestChartData(): Promise<ChartData[]>;
  
  // Price Management
  getLatestPrices(): Promise<any>;
  updatePrices(priceData: any): Promise<any>;
}

export class MemStorage implements IStorage {
  private botStatuses: Map<string, BotStatus> = new Map();
  private analysisReports: AnalysisReport[] = [];
  private tradingSignals: TradingSignal[] = [];
  private priceHistory: PriceHistory[] = [];
  private newsItems: NewsItem[] = [];
  private systemLogs: SystemLog[] = [];
  private settings: Map<string, Setting> = new Map();
  private chartData: ChartData[] = [];

  private nextId = 1;

  constructor() {
    // Initialize default bot statuses
    const bots = ['analysis-bot', 'signal-bot', 'price-bot', 'main-bot'];
    bots.forEach(botName => {
      this.botStatuses.set(botName, {
        id: this.nextId++,
        botName,
        status: 'stopped',
        lastRun: null,
        errorMessage: null,
        updatedAt: new Date()
      });
    });

    // Initialize default settings
    const defaultSettings = [
      { key: 'telegram_bot_token', value: '7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y', description: 'Telegram Bot Token' },
      { key: 'telegram_channel_id', value: '-1002717718463', description: 'Telegram Channel ID' },
      { key: 'admin_telegram_id', value: '1112066452', description: 'Admin Telegram ID' },
      { key: 'navasan_api_key', value: 'freeBY5YCsWyaVmR7DSu2QOLTH0KBsbu', description: 'Navasan API Key' },
      { key: 'mt5_data_path', value: '/home/trader/.wine/drive_c/MT5-CX/MQL5/Files/', description: 'MT5 Data Files Path' },
    ];

    defaultSettings.forEach(setting => {
      this.settings.set(setting.key, {
        id: this.nextId++,
        ...setting,
        updatedAt: new Date()
      });
    });

    // Initialize sample logs
    const sampleLogs = [
      {
        level: 'info',
        message: 'سیستم با موفقیت راه‌اندازی شد',
        source: 'system',
        botName: 'main-bot'
      },
      {
        level: 'info',
        message: 'ربات تحلیل‌گر شروع به کار کرد',
        source: 'api',
        botName: 'analysis-bot'
      },
      {
        level: 'info',
        message: 'اتصال به API نوسان برقرار شد',
        source: 'price-bot',
        botName: 'price-bot',
        details: 'API Key: freeBY5YCsWyaVmR7DSu2QOLTH0KBsbu'
      },
      {
        level: 'warn',
        message: 'تاخیر در دریافت داده‌های MT5',
        source: 'signal-bot',
        botName: 'signal-bot',
        details: 'Path: /home/trader/.wine/drive_c/MT5-CX/MQL5/Files/'
      },
      {
        level: 'info',
        message: 'سیگنال جدید تولید شد و در انتظار تایید',
        source: 'signal-bot',
        botName: 'signal-bot',
        details: 'Signal Type: BUY XAUUSD'
      },
      {
        level: 'info',
        message: 'گزارش تحلیل صبحگاهی ارسال شد',
        source: 'analysis-bot',
        botName: 'analysis-bot'
      },
      {
        level: 'info',
        message: 'قیمت‌های لحظه‌ای به‌روزرسانی شد',
        source: 'price-bot',
        botName: 'price-bot'
      },
      {
        level: 'error',
        message: 'خطا در اتصال به کانال تلگرام',
        source: 'main-bot',
        botName: 'main-bot',
        error: 'Network timeout after 30 seconds'
      }
    ];

    sampleLogs.forEach(log => {
      this.systemLogs.push({
        id: this.nextId++,
        ...log,
        createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Random time in last 24 hours
      });
    });
  }

  async getBotStatus(botName: string): Promise<BotStatus | undefined> {
    return this.botStatuses.get(botName);
  }

  async getAllBotStatuses(): Promise<BotStatus[]> {
    return Array.from(this.botStatuses.values());
  }

  async updateBotStatus(status: InsertBotStatus): Promise<BotStatus> {
    const existing = this.botStatuses.get(status.botName);
    const updated: BotStatus = {
      id: existing?.id || this.nextId++,
      ...status,
      updatedAt: new Date()
    };
    this.botStatuses.set(status.botName, updated);
    return updated;
  }

  async createAnalysisReport(report: InsertAnalysisReport): Promise<AnalysisReport> {
    const newReport: AnalysisReport = {
      id: this.nextId++,
      ...report,
      createdAt: new Date()
    };
    this.analysisReports.push(newReport);
    return newReport;
  }

  async getAnalysisReports(limit = 10): Promise<AnalysisReport[]> {
    return this.analysisReports
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async getReportsByType(reportType: string): Promise<AnalysisReport[]> {
    return this.analysisReports
      .filter(r => r.reportType === reportType)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createTradingSignal(signal: InsertTradingSignal): Promise<TradingSignal> {
    const newSignal: TradingSignal = {
      id: this.nextId++,
      ...signal,
      createdAt: new Date()
    };
    this.tradingSignals.push(newSignal);
    return newSignal;
  }

  async getPendingSignals(): Promise<TradingSignal[]> {
    return this.tradingSignals.filter(s => s.status === 'pending');
  }

  async updateSignalStatus(id: number, status: string, approvedBy?: string): Promise<TradingSignal> {
    const signal = this.tradingSignals.find(s => s.id === id);
    if (!signal) throw new Error('Signal not found');
    
    signal.status = status;
    if (approvedBy) signal.approvedBy = approvedBy;
    if (status === 'approved') signal.approvedAt = new Date();
    if (status === 'sent') signal.sentAt = new Date();
    
    return signal;
  }

  async getTodaysSignals(): Promise<TradingSignal[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.tradingSignals.filter(s => 
      s.createdAt && s.createdAt >= today
    );
  }

  async createPriceHistory(price: InsertPriceHistory): Promise<PriceHistory> {
    const newPrice: PriceHistory = {
      id: this.nextId++,
      ...price,
      createdAt: new Date()
    };
    this.priceHistory.push(newPrice);
    return newPrice;
  }

  async getLatestPrices(): Promise<PriceHistory[]> {
    return this.priceHistory
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, 10);
  }

  async createNewsItem(news: InsertNewsItem): Promise<NewsItem> {
    const newNews: NewsItem = {
      id: this.nextId++,
      ...news,
      processedAt: new Date()
    };
    this.newsItems.push(newNews);
    return newNews;
  }

  async getLatestNews(limit = 10): Promise<NewsItem[]> {
    return this.newsItems
      .sort((a, b) => (b.processedAt?.getTime() || 0) - (a.processedAt?.getTime() || 0))
      .slice(0, limit);
  }

  async getNewsByImpact(impact: string[]): Promise<NewsItem[]> {
    return this.newsItems.filter(n => impact.includes(n.impact));
  }

  async createLog(log: InsertSystemLog): Promise<SystemLog> {
    const newLog: SystemLog = {
      id: this.nextId++,
      ...log,
      createdAt: new Date()
    };
    this.systemLogs.push(newLog);
    return newLog;
  }

  async getRecentLogs(limit = 50): Promise<SystemLog[]> {
    return this.systemLogs
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async getLogsByLevel(level: string): Promise<SystemLog[]> {
    return this.systemLogs.filter(l => l.level === level)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getLogsByBot(botName: string): Promise<SystemLog[]> {
    return this.systemLogs.filter(l => l.botName === botName || l.source === botName)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getLogStats(): Promise<{ error_count: number; warning_count: number; info_count: number; total_count: number }> {
    const error_count = this.systemLogs.filter(l => l.level === 'error').length;
    const warning_count = this.systemLogs.filter(l => l.level === 'warn').length;
    const info_count = this.systemLogs.filter(l => l.level === 'info').length;
    const total_count = this.systemLogs.length;
    
    return { error_count, warning_count, info_count, total_count };
  }

  async clearOldLogs(cutoffDate: Date): Promise<void> {
    this.systemLogs = this.systemLogs.filter(l => 
      (l.createdAt?.getTime() || 0) >= cutoffDate.getTime()
    );
  }

  async clearLogsByBot(botName: string): Promise<void> {
    this.systemLogs = this.systemLogs.filter(l => 
      l.botName !== botName && l.source !== botName
    );
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async setSetting(setting: InsertSetting): Promise<Setting> {
    const updated: Setting = {
      id: this.settings.get(setting.key)?.id || this.nextId++,
      ...setting,
      updatedAt: new Date()
    };
    this.settings.set(setting.key, updated);
    return updated;
  }

  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  async saveChartData(data: InsertChartData[]): Promise<ChartData[]> {
    const saved: ChartData[] = data.map(d => ({
      id: this.nextId++,
      ...d,
      processedAt: new Date()
    }));
    this.chartData.push(...saved);
    // Keep only last 1000 records per timeframe
    const timeframes = ['M15', 'H1', 'H4', 'D1'];
    timeframes.forEach(tf => {
      const tfData = this.chartData.filter(c => c.timeframe === tf)
        .sort((a, b) => (b.datetime?.getTime() || 0) - (a.datetime?.getTime() || 0));
      if (tfData.length > 1000) {
        const toRemove = tfData.slice(1000);
        toRemove.forEach(item => {
          const index = this.chartData.indexOf(item);
          if (index > -1) this.chartData.splice(index, 1);
        });
      }
    });
    return saved;
  }

  async getChartData(timeframe: string, limit = 100): Promise<ChartData[]> {
    return this.chartData
      .filter(c => c.timeframe === timeframe)
      .sort((a, b) => (b.datetime?.getTime() || 0) - (a.datetime?.getTime() || 0))
      .slice(0, limit);
  }

  async getLatestChartData(): Promise<ChartData[]> {
    const result: ChartData[] = [];
    const timeframes = ['M15', 'H1', 'H4', 'D1'];
    
    timeframes.forEach(tf => {
      const latest = this.chartData
        .filter(c => c.timeframe === tf)
        .sort((a, b) => (b.datetime?.getTime() || 0) - (a.datetime?.getTime() || 0))[0];
      if (latest) result.push(latest);
    });
    
    return result;
  }

  // Weekly CSV Files
  private weeklyCSVs: WeeklyCSVFile[] = [];
  private csvIdCounter = 1;

  async uploadWeeklyCSV(csvData: InsertWeeklyCSVFile): Promise<WeeklyCSVFile> {
    // Deactivate all existing CSVs
    await this.deactivateAllCSVs();
    
    const newCSV: WeeklyCSVFile = {
      id: this.csvIdCounter++,
      ...csvData,
      uploadedAt: new Date(),
      isActive: true
    };
    
    this.weeklyCSVs.push(newCSV);
    return newCSV;
  }

  async getActiveWeeklyCSV(): Promise<WeeklyCSVFile | undefined> {
    return this.weeklyCSVs.find(csv => csv.isActive);
  }

  async getAllWeeklyCSVs(): Promise<WeeklyCSVFile[]> {
    return [...this.weeklyCSVs].sort((a, b) => 
      (b.uploadedAt?.getTime() || 0) - (a.uploadedAt?.getTime() || 0)
    );
  }

  async deactivateAllCSVs(): Promise<void> {
    this.weeklyCSVs.forEach(csv => csv.isActive = false);
  }

  // Economic Events
  private economicEvents: EconomicEvent[] = [];
  private eventIdCounter = 1;

  async saveEconomicEvents(events: InsertEconomicEvent[]): Promise<EconomicEvent[]> {
    const savedEvents = events.map(event => ({
      id: this.eventIdCounter++,
      csvFileId: event.csvFileId || null,
      eventId: event.eventId,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      name: event.name,
      impact: event.impact,
      currency: event.currency,
      isGoldRelevant: event.isGoldRelevant || false,
      createdAt: new Date()
    }));
    
    this.economicEvents.push(...savedEvents);
    return savedEvents;
  }

  async getWeeklyEvents(): Promise<EconomicEvent[]> {
    return [...this.economicEvents].sort((a, b) => 
      new Date(a.eventDate + ' ' + a.eventTime).getTime() - 
      new Date(b.eventDate + ' ' + b.eventTime).getTime()
    );
  }

  async getHighMediumImpactEvents(): Promise<EconomicEvent[]> {
    return this.economicEvents.filter(event => 
      event.impact === 'HIGH' || event.impact === 'MEDIUM'
    ).sort((a, b) => 
      new Date(a.eventDate + ' ' + a.eventTime).getTime() - 
      new Date(b.eventDate + ' ' + b.eventTime).getTime()
    );
  }

  async getGoldRelevantEvents(): Promise<EconomicEvent[]> {
    return this.economicEvents.filter(event => event.isGoldRelevant);
  }

  // Price Management
  private prices: any = {};

  async getLatestPrices(): Promise<any> {
    return this.prices;
  }

  async updatePrices(priceData: any): Promise<any> {
    this.prices = {
      ...this.prices,
      ...priceData,
      lastUpdated: new Date().toISOString()
    };
    return this.prices;
  }
}

export const storage = new MemStorage();
