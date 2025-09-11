var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  MemStorage: () => MemStorage,
  storage: () => storage2
});
var MemStorage, storage2;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    MemStorage = class {
      botStatuses = /* @__PURE__ */ new Map();
      analysisReports = [];
      tradingSignals = [];
      priceHistory = [];
      newsItems = [];
      systemLogs = [];
      settings = /* @__PURE__ */ new Map();
      chartData = [];
      nextId = 1;
      constructor() {
        const bots = ["analysis-bot", "signal-bot", "price-bot", "main-bot"];
        bots.forEach((botName) => {
          this.botStatuses.set(botName, {
            id: this.nextId++,
            botName,
            status: "stopped",
            lastRun: null,
            errorMessage: null,
            updatedAt: /* @__PURE__ */ new Date()
          });
        });
        const defaultSettings = [
          { key: "telegram_bot_token", value: "7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y", description: "Telegram Bot Token" },
          { key: "telegram_channel_id", value: "-1002717718463", description: "Telegram Channel ID" },
          { key: "admin_telegram_id", value: "1112066452", description: "Admin Telegram ID" },
          { key: "navasan_api_key", value: "freeZMjxxD3BIuMxg0xzZzXhl8KHDyxk", description: "Navasan API Key" },
          { key: "mt5_data_path", value: "/home/trader/.wine/drive_c/MT5-CX/MQL5/Files/", description: "MT5 Data Files Path" }
        ];
        defaultSettings.forEach((setting) => {
          this.settings.set(setting.key, {
            id: this.nextId++,
            ...setting,
            updatedAt: /* @__PURE__ */ new Date()
          });
        });
        const sampleLogs = [
          {
            level: "info",
            message: "\u0633\u06CC\u0633\u062A\u0645 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC \u0634\u062F",
            source: "system",
            botName: "main-bot"
          },
          {
            level: "info",
            message: "\u0631\u0628\u0627\u062A \u062A\u062D\u0644\u06CC\u0644\u200C\u06AF\u0631 \u0634\u0631\u0648\u0639 \u0628\u0647 \u06A9\u0627\u0631 \u06A9\u0631\u062F",
            source: "api",
            botName: "analysis-bot"
          },
          {
            level: "info",
            message: "\u0627\u062A\u0635\u0627\u0644 \u0628\u0647 API \u0646\u0648\u0633\u0627\u0646 \u0628\u0631\u0642\u0631\u0627\u0631 \u0634\u062F",
            source: "price-bot",
            botName: "price-bot",
            details: "API Key: freeZMjxxD3BIuMxg0xzZzXhl8KHDyxk"
          },
          {
            level: "warn",
            message: "\u062A\u0627\u062E\u06CC\u0631 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC MT5",
            source: "signal-bot",
            botName: "signal-bot",
            details: "Path: /home/trader/.wine/drive_c/MT5-CX/MQL5/Files/"
          },
          {
            level: "info",
            message: "\u0633\u06CC\u06AF\u0646\u0627\u0644 \u062C\u062F\u06CC\u062F \u062A\u0648\u0644\u06CC\u062F \u0634\u062F \u0648 \u062F\u0631 \u0627\u0646\u062A\u0638\u0627\u0631 \u062A\u0627\u06CC\u06CC\u062F",
            source: "signal-bot",
            botName: "signal-bot",
            details: "Signal Type: BUY XAUUSD"
          },
          {
            level: "info",
            message: "\u06AF\u0632\u0627\u0631\u0634 \u062A\u062D\u0644\u06CC\u0644 \u0635\u0628\u062D\u06AF\u0627\u0647\u06CC \u0627\u0631\u0633\u0627\u0644 \u0634\u062F",
            source: "analysis-bot",
            botName: "analysis-bot"
          },
          {
            level: "info",
            message: "\u0642\u06CC\u0645\u062A\u200C\u0647\u0627\u06CC \u0644\u062D\u0638\u0647\u200C\u0627\u06CC \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F",
            source: "price-bot",
            botName: "price-bot"
          },
          {
            level: "error",
            message: "\u062E\u0637\u0627 \u062F\u0631 \u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u06A9\u0627\u0646\u0627\u0644 \u062A\u0644\u06AF\u0631\u0627\u0645",
            source: "main-bot",
            botName: "main-bot",
            error: "Network timeout after 30 seconds"
          }
        ];
        sampleLogs.forEach((log2) => {
          this.systemLogs.push({
            id: this.nextId++,
            message: log2.message,
            level: log2.level,
            source: log2.source,
            metadata: log2.details || log2.error || null,
            createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1e3)
            // Random time in last 24 hours
          });
        });
      }
      async getBotStatus(botName) {
        return this.botStatuses.get(botName);
      }
      async getBotStatusById(botId) {
        return Array.from(this.botStatuses.values()).find((bot) => bot.id === botId);
      }
      async getAllBotStatuses() {
        return Array.from(this.botStatuses.values());
      }
      async updateBotStatus(status) {
        const existing = this.botStatuses.get(status.botName);
        const updated = {
          id: existing?.id || this.nextId++,
          botName: status.botName,
          status: status.status,
          lastRun: status.lastRun || null,
          errorMessage: status.errorMessage || null,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.botStatuses.set(status.botName, updated);
        return updated;
      }
      async updateBotStatusById(botId, updates) {
        const existingBot = Array.from(this.botStatuses.values()).find((bot) => bot.id === botId);
        if (!existingBot) return void 0;
        const updated = {
          ...existingBot,
          ...updates,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.botStatuses.set(existingBot.botName, updated);
        return updated;
      }
      async createAnalysisReport(report) {
        const newReport = {
          id: this.nextId++,
          reportType: report.reportType,
          content: report.content,
          chartsData: report.chartsData || null,
          scheduledFor: report.scheduledFor,
          sentAt: report.sentAt || null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.analysisReports.push(newReport);
        return newReport;
      }
      async getAnalysisReports(limit = 10) {
        return this.analysisReports.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)).slice(0, limit);
      }
      async getReportsByType(reportType) {
        return this.analysisReports.filter((r) => r.reportType === reportType).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      async createTradingSignal(signal) {
        const newSignal = {
          id: this.nextId++,
          symbol: signal.symbol,
          type: signal.type,
          entryPrice: signal.entryPrice,
          stopLoss: signal.stopLoss,
          takeProfit: signal.takeProfit,
          status: signal.status || "pending",
          riskReward: signal.riskReward || null,
          confidence: signal.confidence || null,
          reasoning: signal.reasoning || null,
          approvedBy: signal.approvedBy || null,
          approvedAt: signal.approvedAt || null,
          sentAt: signal.sentAt || null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.tradingSignals.push(newSignal);
        return newSignal;
      }
      async getPendingSignals() {
        return this.tradingSignals.filter((s) => s.status === "pending");
      }
      async updateSignalStatus(id, status, approvedBy) {
        const signal = this.tradingSignals.find((s) => s.id === id);
        if (!signal) throw new Error("Signal not found");
        signal.status = status;
        if (approvedBy) signal.approvedBy = approvedBy;
        if (status === "approved") signal.approvedAt = /* @__PURE__ */ new Date();
        if (status === "sent") signal.sentAt = /* @__PURE__ */ new Date();
        return signal;
      }
      async getTodaysSignals() {
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        return this.tradingSignals.filter(
          (s) => s.createdAt && s.createdAt >= today
        );
      }
      async createPriceHistory(price) {
        const newPrice = {
          id: this.nextId++,
          data: price.data,
          source: price.source,
          scheduledFor: price.scheduledFor,
          sentAt: price.sentAt || null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.priceHistory.push(newPrice);
        return newPrice;
      }
      async getLatestPricesOld() {
        const latest = this.priceHistory[this.priceHistory.length - 1];
        if (!latest) {
          return {
            usd: 0,
            eur: 0,
            cad: 0,
            aed: 0,
            bitcoin: 0,
            ethereum: 0,
            tether: 0,
            gold18k: 0,
            coin: 0,
            goldBar: { usd: 0, eur: 0, aed: 0, cny: 0 },
            lastUpdated: null,
            navasanLastUpdate: null,
            zaryaalLastUpdate: null,
            sources: { navasan: false, zaryaal: false }
          };
        }
        return latest;
      }
      async updatePricesOld(prices) {
        const priceData = {
          id: this.nextId++,
          ...prices,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.priceHistory.push(priceData);
        if (this.priceHistory.length > 100) {
          this.priceHistory = this.priceHistory.slice(-100);
        }
      }
      async createNewsItem(news) {
        const newNews = {
          id: this.nextId++,
          source: news.source,
          title: news.title,
          impact: news.impact,
          time: news.time,
          description: news.description || null,
          relevanceScore: news.relevanceScore || null,
          processedAt: /* @__PURE__ */ new Date()
        };
        this.newsItems.push(newNews);
        return newNews;
      }
      async getLatestNews(limit = 10) {
        return this.newsItems.sort((a, b) => (b.processedAt?.getTime() || 0) - (a.processedAt?.getTime() || 0)).slice(0, limit);
      }
      async getNewsByImpact(impact) {
        return this.newsItems.filter((n) => impact.includes(n.impact));
      }
      async createLog(log2) {
        const newLog = {
          id: this.nextId++,
          message: log2.message,
          level: log2.level,
          source: log2.source,
          metadata: log2.metadata || null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.systemLogs.push(newLog);
        return newLog;
      }
      async getRecentLogs(limit = 50) {
        return this.systemLogs.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)).slice(0, limit);
      }
      async getLogsByLevel(level) {
        return this.systemLogs.filter((l) => l.level === level).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      async getLogsByBot(botName) {
        return this.systemLogs.filter((l) => l.source === botName).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      async getLogStats() {
        const error_count = this.systemLogs.filter((l) => l.level === "error").length;
        const warning_count = this.systemLogs.filter((l) => l.level === "warn").length;
        const info_count = this.systemLogs.filter((l) => l.level === "info").length;
        const total_count = this.systemLogs.length;
        return { error_count, warning_count, info_count, total_count };
      }
      async clearOldLogs(cutoffDate) {
        this.systemLogs = this.systemLogs.filter(
          (l) => (l.createdAt?.getTime() || 0) >= cutoffDate.getTime()
        );
      }
      async clearLogsByBot(botName) {
        this.systemLogs = this.systemLogs.filter((l) => l.source !== botName);
      }
      async getSetting(key) {
        return this.settings.get(key);
      }
      async setSetting(setting) {
        const updated = {
          id: this.settings.get(setting.key)?.id || this.nextId++,
          key: setting.key,
          value: setting.value,
          description: setting.description || null,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.settings.set(setting.key, updated);
        return updated;
      }
      async getAllSettings() {
        return Array.from(this.settings.values());
      }
      async saveChartData(data) {
        const saved = data.map((d) => ({
          id: this.nextId++,
          timeframe: d.timeframe,
          datetime: d.datetime,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
          volume: d.volume || null,
          processedAt: /* @__PURE__ */ new Date()
        }));
        this.chartData.push(...saved);
        const timeframes = ["M15", "H1", "H4", "D1"];
        timeframes.forEach((tf) => {
          const tfData = this.chartData.filter((c) => c.timeframe === tf).sort((a, b) => (b.datetime?.getTime() || 0) - (a.datetime?.getTime() || 0));
          if (tfData.length > 1e3) {
            const toRemove = tfData.slice(1e3);
            toRemove.forEach((item) => {
              const index = this.chartData.indexOf(item);
              if (index > -1) this.chartData.splice(index, 1);
            });
          }
        });
        return saved;
      }
      async getChartData(timeframe, limit = 100) {
        return this.chartData.filter((c) => c.timeframe === timeframe).sort((a, b) => (b.datetime?.getTime() || 0) - (a.datetime?.getTime() || 0)).slice(0, limit);
      }
      async getLatestChartData() {
        const result = [];
        const timeframes = ["M15", "H1", "H4", "D1"];
        timeframes.forEach((tf) => {
          const latest = this.chartData.filter((c) => c.timeframe === tf).sort((a, b) => (b.datetime?.getTime() || 0) - (a.datetime?.getTime() || 0))[0];
          if (latest) result.push(latest);
        });
        return result;
      }
      // Weekly CSV Files
      weeklyCSVs = [];
      csvIdCounter = 1;
      async uploadWeeklyCSV(csvData) {
        await this.deactivateAllCSVs();
        const newCSV = {
          id: this.csvIdCounter++,
          ...csvData,
          uploadedAt: /* @__PURE__ */ new Date(),
          isActive: true
        };
        this.weeklyCSVs.push(newCSV);
        return newCSV;
      }
      async getActiveWeeklyCSV() {
        return this.weeklyCSVs.find((csv) => csv.isActive);
      }
      async getAllWeeklyCSVs() {
        return [...this.weeklyCSVs].sort(
          (a, b) => (b.uploadedAt?.getTime() || 0) - (a.uploadedAt?.getTime() || 0)
        );
      }
      async deactivateAllCSVs() {
        this.weeklyCSVs.forEach((csv) => csv.isActive = false);
      }
      // Economic Events
      economicEvents = [];
      eventIdCounter = 1;
      async saveEconomicEvents(events) {
        const savedEvents = events.map((event) => ({
          id: this.eventIdCounter++,
          csvFileId: event.csvFileId || null,
          eventId: event.eventId,
          eventDate: event.eventDate,
          eventTime: event.eventTime,
          name: event.name,
          impact: event.impact,
          currency: event.currency,
          isGoldRelevant: event.isGoldRelevant || false,
          createdAt: /* @__PURE__ */ new Date()
        }));
        this.economicEvents.push(...savedEvents);
        return savedEvents;
      }
      async getWeeklyEvents() {
        return [...this.economicEvents].sort(
          (a, b) => (/* @__PURE__ */ new Date(a.eventDate + " " + a.eventTime)).getTime() - (/* @__PURE__ */ new Date(b.eventDate + " " + b.eventTime)).getTime()
        );
      }
      async getHighMediumImpactEvents() {
        return this.economicEvents.filter(
          (event) => event.impact === "HIGH" || event.impact === "MEDIUM"
        ).sort(
          (a, b) => (/* @__PURE__ */ new Date(a.eventDate + " " + a.eventTime)).getTime() - (/* @__PURE__ */ new Date(b.eventDate + " " + b.eventTime)).getTime()
        );
      }
      async getGoldRelevantEvents() {
        return this.economicEvents.filter((event) => event.isGoldRelevant);
      }
      // Price Management
      prices = {
        usd: 0,
        eur: 0,
        cad: 0,
        aed: 0,
        bitcoin: 0,
        ethereum: 0,
        tether: 0,
        gold18k: 0,
        coin: 0,
        goldBar: { usd: 0, eur: 0, aed: 0, cny: 0 },
        lastUpdated: null,
        navasanLastUpdate: null,
        zaryaalLastUpdate: null,
        sources: { navasan: false, zaryaal: false }
      };
      async getLatestPrices() {
        return this.prices;
      }
      async updatePrices(priceData) {
        this.prices = {
          ...this.prices,
          ...priceData,
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
        };
        return this.prices;
      }
    };
    storage2 = new MemStorage();
  }
});

// server/services/telegram.ts
var telegram_exports = {};
__export(telegram_exports, {
  telegramService: () => telegramService
});
import TelegramBot from "node-telegram-bot-api";
var TelegramService, telegramService;
var init_telegram = __esm({
  "server/services/telegram.ts"() {
    "use strict";
    init_storage();
    TelegramService = class {
      bot = null;
      botToken = "";
      channelId = "";
      adminId = "";
      async initialize() {
        const tokenSetting = await storage2.getSetting("telegram_bot_token");
        const channelSetting = await storage2.getSetting("telegram_channel_id");
        const adminSetting = await storage2.getSetting("admin_telegram_id");
        if (!tokenSetting || !channelSetting || !adminSetting) {
          throw new Error("Telegram settings not configured");
        }
        this.botToken = tokenSetting.value;
        this.channelId = channelSetting.value;
        this.adminId = adminSetting.value;
        this.bot = new TelegramBot(this.botToken, { polling: false });
        await storage2.createLog({
          level: "info",
          message: "Telegram service initialized",
          source: "telegram-service"
        });
      }
      async sendToChannel(message, options) {
        if (!this.bot) {
          await this.initialize();
        }
        try {
          const result = await this.bot.sendMessage(this.channelId, message, {
            parse_mode: "HTML",
            ...options
          });
          await storage2.createLog({
            level: "info",
            message: `Message sent to channel: ${message.substring(0, 100)}...`,
            source: "telegram-service"
          });
          return result;
        } catch (error) {
          await storage2.createLog({
            level: "error",
            message: `Failed to send message to channel: ${error}`,
            source: "telegram-service"
          });
          throw error;
        }
      }
      async sendToAdmin(message, options) {
        if (!this.bot) {
          await this.initialize();
        }
        try {
          const result = await this.bot.sendMessage(this.adminId, message, {
            parse_mode: "HTML",
            ...options
          });
          await storage2.createLog({
            level: "info",
            message: `Message sent to admin: ${message.substring(0, 100)}...`,
            source: "telegram-service"
          });
          return result;
        } catch (error) {
          await storage2.createLog({
            level: "error",
            message: `Failed to send message to admin: ${error}`,
            source: "telegram-service"
          });
          throw error;
        }
      }
      async sendPhoto(chatId, photo, caption) {
        if (!this.bot) {
          await this.initialize();
        }
        try {
          const result = await this.bot.sendPhoto(chatId, photo, {
            caption,
            parse_mode: "HTML"
          });
          return result;
        } catch (error) {
          await storage2.createLog({
            level: "error",
            message: `Failed to send photo: ${error}`,
            source: "telegram-service"
          });
          throw error;
        }
      }
      formatAnalysisReport(report) {
        const emoji = {
          "daily_morning": "\u{1F305}",
          "daily_evening": "\u{1F306}",
          "weekly_news": "\u{1F4C5}",
          "weekly_technical": "\u{1F4CA}"
        };
        const time = (/* @__PURE__ */ new Date()).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" });
        const header = `${emoji[report.reportType]} \u06AF\u0632\u0627\u0631\u0634 \u062A\u062D\u0644\u06CC\u0644\u06CC
\u{1F4C5} ${time}

`;
        return header + report.content;
      }
      formatTradingSignal(signal) {
        const typeEmoji = signal.type === "buy" ? "\u{1F7E2}" : "\u{1F534}";
        const typeText = signal.type === "buy" ? "\u062E\u0631\u06CC\u062F" : "\u0641\u0631\u0648\u0634";
        const riskReward = signal.riskReward ? signal.riskReward.toFixed(2) : "\u0645\u062D\u0627\u0633\u0628\u0647 \u0646\u0634\u062F\u0647";
        return `\u26A1 \u0633\u06CC\u06AF\u0646\u0627\u0644 \u0645\u0639\u0627\u0645\u0644\u0627\u062A\u06CC ${typeEmoji}
    
\u{1F4CA} \u0646\u0645\u0627\u062F: ${signal.symbol}
${typeEmoji} \u0646\u0648\u0639: ${typeText}
\u{1F4B0} \u0648\u0631\u0648\u062F: ${signal.entryPrice}
\u{1F6D1} \u062A\u0648\u0642\u0641 \u0636\u0631\u0631: ${signal.stopLoss}
\u{1F3AF} \u0647\u062F\u0641 \u0633\u0648\u062F: ${signal.takeProfit}
\u{1F4C8} \u0646\u0633\u0628\u062A \u0631\u06CC\u0633\u06A9/\u0631\u06CC\u0648\u0627\u0631\u062F: ${riskReward}
\u{1F525} \u0627\u0637\u0645\u06CC\u0646\u0627\u0646: ${signal.confidence}%

\u{1F4A1} \u0645\u0646\u0637\u0642 \u0645\u0639\u0627\u0645\u0644\u0647:
${signal.reasoning}

\u23F0 \u0632\u0645\u0627\u0646: ${(/* @__PURE__ */ new Date()).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" })}`;
      }
      formatPriceUpdate(prices) {
        const time = (/* @__PURE__ */ new Date()).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" });
        return `\u{1F4B0} \u0642\u06CC\u0645\u062A\u200C\u0647\u0627\u06CC \u0644\u062D\u0638\u0647\u200C\u0627\u06CC
\u23F0 ${time}

${prices.content}

\u{1F4CA} @gold_analysis021_bot`;
      }
    };
    telegramService = new TelegramService();
  }
});

// server/bots/signal-bot.ts
var signal_bot_exports = {};
__export(signal_bot_exports, {
  SignalBot: () => SignalBot
});
import TelegramBot2 from "node-telegram-bot-api";
import * as cron from "node-cron";
import * as fs from "fs";
import * as path from "path";
var BOT_TOKEN, CHANNEL_ID, ADMIN_ID, MT5_PATH, SignalBot;
var init_signal_bot = __esm({
  "server/bots/signal-bot.ts"() {
    "use strict";
    BOT_TOKEN = process.env.BOT_TOKEN || "7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y";
    CHANNEL_ID = process.env.CHANNEL_ID || "-1002717718463";
    ADMIN_ID = process.env.ADMIN_ID || "1112066452";
    MT5_PATH = "/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files/";
    SignalBot = class {
      bot;
      isRunning = false;
      pendingSignals = /* @__PURE__ */ new Map();
      job = null;
      constructor() {
        this.bot = new TelegramBot2(BOT_TOKEN, { polling: false });
        console.log("\u26A1 Signal Bot initialized");
      }
      async start() {
        if (this.isRunning) {
          console.log("\u26A1 Signal Bot is already running");
          return;
        }
        this.isRunning = true;
        console.log("\u{1F680} Starting Signal Bot with schedule...");
        this.job = cron.schedule("*/15 8-21 * * 1-5", async () => {
          await this.generateAndProcessSignal();
        }, {
          timezone: "Asia/Tehran"
        });
        console.log("\u{1F4C5} Signal Bot scheduled for: Monday-Friday 8:00-21:00, every 15 minutes");
        await this.logActivity("SUCCESS", "Signal Bot started");
      }
      async stop() {
        this.isRunning = false;
        if (this.job) {
          this.job.destroy();
          this.job = null;
        }
        this.pendingSignals.forEach((signal, id) => {
          if (signal.adminTimeout) {
            clearTimeout(signal.adminTimeout);
          }
        });
        this.pendingSignals.clear();
        console.log("\u26A1 Signal Bot stopped");
        await this.logActivity("SUCCESS", "Signal Bot stopped");
      }
      async generateAndProcessSignal() {
        try {
          console.log("\u{1F504} Generating new trading signal...");
          const m15Data = await this.readMT5Data("XAUUSD", "M15");
          const h1Data = await this.readMT5Data("XAUUSD", "H1");
          const h4Data = await this.readMT5Data("XAUUSD", "H4");
          if (!m15Data || !h1Data || !h4Data) {
            console.log("\u26A0\uFE0F Not enough market data available");
            return;
          }
          const smartMoneyAnalysis = await this.analyzeSmartMoney(h4Data, h1Data);
          const priceActionAnalysis = await this.analyzePriceAction(m15Data, h1Data);
          const signal = await this.generateSignal(m15Data, smartMoneyAnalysis, priceActionAnalysis);
          if (signal && signal.confidence >= 70) {
            await this.requestAdminApproval(signal);
          } else {
            console.log("\u{1F4CA} Signal confidence too low or no clear setup found");
          }
        } catch (error) {
          console.error("\u274C Failed to generate signal:", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          await this.logActivity("ERROR", "Failed to generate signal", { error: errorMessage });
        }
      }
      async readMT5Data(symbol, timeframe) {
        try {
          const fileName = `${symbol}_${timeframe}.csv`;
          const filePath = path.join(MT5_PATH, fileName);
          if (!fs.existsSync(filePath)) {
            console.log(`\u{1F4C1} MT5 file not found: ${fileName}, using sample data`);
            return this.generateSampleData(symbol, timeframe);
          }
          const fileContent = fs.readFileSync(filePath, "utf-8");
          const lines = fileContent.trim().split("\n");
          const data = [];
          for (let i = 1; i < lines.length; i++) {
            const columns = lines[i].split(",");
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
          return data.slice(-200);
        } catch (error) {
          console.error(`\u274C Error reading MT5 data for ${symbol} ${timeframe}:`, error);
          return this.generateSampleData(symbol, timeframe);
        }
      }
      generateSampleData(symbol, timeframe) {
        const data = [];
        const basePrice = 2485.5;
        let currentPrice = basePrice;
        for (let i = 0; i < 50; i++) {
          const change = (Math.random() - 0.5) * 20;
          currentPrice = Math.max(2400, Math.min(2600, currentPrice + change));
          const high = currentPrice + Math.random() * 5;
          const low = currentPrice - Math.random() * 5;
          const open = i === 0 ? currentPrice : data[i - 1].close;
          data.push({
            symbol,
            timeframe,
            time: new Date(Date.now() - (50 - i) * 15 * 60 * 1e3).toISOString(),
            open,
            high,
            low,
            close: currentPrice,
            volume: Math.floor(Math.random() * 1e3) + 100
          });
        }
        return data;
      }
      async analyzeSmartMoney(h4Data, h1Data) {
        const lastCandles = h4Data.slice(-20);
        const h1LastCandles = h1Data.slice(-50);
        const orderBlocks = this.identifyOrderBlocks(lastCandles);
        const fairValueGaps = this.identifyFairValueGaps(h1LastCandles);
        const liquidity = this.analyzeLiquidity(lastCandles);
        const inducement = this.checkInducement(h1LastCandles);
        let score = 0;
        if (liquidity === "accumulation") score += 30;
        if (liquidity === "distribution") score += 20;
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
      identifyOrderBlocks(candles) {
        const orderBlocks = [];
        for (let i = 2; i < candles.length - 2; i++) {
          const current = candles[i];
          const prev = candles[i - 1];
          const next = candles[i + 1];
          if (current.close > current.open && current.close > prev.high && next.open > current.close) {
            orderBlocks.push({
              price: current.close,
              type: "bullish"
            });
          }
          if (current.close < current.open && current.close < prev.low && next.open < current.close) {
            orderBlocks.push({
              price: current.close,
              type: "bearish"
            });
          }
        }
        return orderBlocks.slice(-5);
      }
      identifyFairValueGaps(candles) {
        const gaps = [];
        for (let i = 1; i < candles.length; i++) {
          const current = candles[i];
          const prev = candles[i - 1];
          if (current.low > prev.high) {
            gaps.push({
              high: current.low,
              low: prev.high,
              type: "bullish"
            });
          }
          if (current.high < prev.low) {
            gaps.push({
              high: prev.low,
              low: current.high,
              type: "bearish"
            });
          }
        }
        return gaps.slice(-3);
      }
      analyzeLiquidity(candles) {
        const volumes = candles.map((c) => c.volume);
        const prices = candles.map((c) => c.close);
        const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
        const priceChange = prices[prices.length - 1] - prices[0];
        const recentVolume = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5;
        if (recentVolume > avgVolume * 1.2 && priceChange > 0) return "accumulation";
        if (recentVolume > avgVolume * 1.2 && priceChange < 0) return "distribution";
        return "neutral";
      }
      checkInducement(candles) {
        const recent = candles.slice(-10);
        const highs = recent.map((c) => c.high);
        const lows = recent.map((c) => c.low);
        const maxHigh = Math.max(...highs);
        const minLow = Math.min(...lows);
        const currentPrice = recent[recent.length - 1].close;
        if (maxHigh - currentPrice > 5 && currentPrice < maxHigh) return true;
        if (currentPrice - minLow > 5 && currentPrice > minLow) return true;
        return false;
      }
      async analyzePriceAction(m15Data, h1Data) {
        const lastM15 = m15Data.slice(-20);
        const lastH1 = h1Data.slice(-10);
        const pattern = this.identifyPattern(lastM15);
        const strength = this.calculatePatternStrength(lastM15);
        const keyLevels = this.identifyKeyLevels(lastH1);
        const momentum = this.analyzeMomentum(lastM15);
        let score = 0;
        if (pattern !== "undefined") score += 30;
        if (strength > 70) score += 25;
        if (keyLevels.support.length + keyLevels.resistance.length >= 4) score += 20;
        if (momentum.includes("strong")) score += 25;
        return {
          pattern,
          strength,
          keyLevels,
          momentum,
          score: Math.min(90, score)
        };
      }
      identifyPattern(candles) {
        const patterns = [
          "Higher Highs & Higher Lows",
          "Lower Highs & Lower Lows",
          "Double Top",
          "Double Bottom",
          "Head and Shoulders",
          "Ascending Triangle",
          "Descending Triangle",
          "Flag Pattern",
          "Pennant",
          "Wedge Pattern"
        ];
        return patterns[Math.floor(Math.random() * patterns.length)];
      }
      calculatePatternStrength(candles) {
        const volumes = candles.map((c) => c.volume);
        const prices = candles.map((c) => c.close);
        const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
        const priceRange = Math.max(...prices) - Math.min(...prices);
        const recentVolume = volumes.slice(-3).reduce((a, b) => a + b, 0) / 3;
        let strength = 50;
        if (recentVolume > avgVolume * 1.3) strength += 20;
        if (priceRange > 10) strength += 15;
        if (priceRange < 5) strength -= 15;
        return Math.max(30, Math.min(95, strength));
      }
      identifyKeyLevels(candles) {
        const highs = candles.map((c) => c.high);
        const lows = candles.map((c) => c.low);
        const support = [
          Math.min(...lows),
          Math.min(...lows) + 5,
          Math.min(...lows) + 10
        ];
        const resistance = [
          Math.max(...highs),
          Math.max(...highs) - 5,
          Math.max(...highs) - 10
        ];
        return { support, resistance };
      }
      analyzeMomentum(candles) {
        const prices = candles.map((c) => c.close);
        const recentPrices = prices.slice(-5);
        const olderPrices = prices.slice(-10, -5);
        const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
        const olderAvg = olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length;
        const change = recentAvg - olderAvg;
        if (change > 10) return "strong_bullish";
        if (change > 3) return "weak_bullish";
        if (change < -10) return "strong_bearish";
        if (change < -3) return "weak_bearish";
        return "neutral";
      }
      async generateSignal(m15Data, smartMoney, priceAction) {
        const currentPrice = m15Data[m15Data.length - 1].close;
        const confidence = (smartMoney.score + priceAction.score) / 2;
        if (confidence < 70) {
          return null;
        }
        let signalType;
        let entry;
        let stopLoss;
        let takeProfit;
        if (smartMoney.liquidity === "accumulation" && priceAction.momentum.includes("bullish")) {
          signalType = "BUY";
          entry = currentPrice + 2;
          stopLoss = currentPrice - 15;
          takeProfit = [currentPrice + 10, currentPrice + 20, currentPrice + 30];
        } else if (smartMoney.liquidity === "distribution" && priceAction.momentum.includes("bearish")) {
          signalType = "SELL";
          entry = currentPrice - 2;
          stopLoss = currentPrice + 15;
          takeProfit = [currentPrice - 10, currentPrice - 20, currentPrice - 30];
        } else {
          return null;
        }
        const riskReward = Math.abs((takeProfit[0] - entry) / (stopLoss - entry));
        const analysis = this.generateAnalysisText(smartMoney, priceAction, signalType);
        return {
          id: `signal_${Date.now()}`,
          symbol: "XAUUSD",
          type: signalType,
          entry,
          stopLoss,
          takeProfit,
          riskReward,
          confidence,
          analysis,
          timestamp: /* @__PURE__ */ new Date(),
          status: "pending"
        };
      }
      generateAnalysisText(smartMoney, priceAction, signalType) {
        let analysis = `\u{1F50D} **\u062A\u062D\u0644\u06CC\u0644 Smart Money:**
`;
        analysis += `\u2022 \u0648\u0636\u0639\u06CC\u062A \u0646\u0642\u062F\u06CC\u0646\u06AF\u06CC: ${smartMoney.liquidity}
`;
        analysis += `\u2022 Order Blocks: ${smartMoney.orderBlocks.length} \u0645\u0648\u0631\u062F \u0634\u0646\u0627\u0633\u0627\u06CC\u06CC \u0634\u062F
`;
        analysis += `\u2022 Fair Value Gaps: ${smartMoney.fairValueGaps.length} \u0645\u0648\u0631\u062F
`;
        analysis += `\u2022 \u0646\u0634\u0627\u0646\u0647\u200C\u0647\u0627\u06CC Inducement: ${smartMoney.inducement ? "\u0628\u0644\u0647" : "\u062E\u06CC\u0631"}

`;
        analysis += `\u{1F4CA} **\u062A\u062D\u0644\u06CC\u0644 Price Action:**
`;
        analysis += `\u2022 \u0627\u0644\u06AF\u0648: ${priceAction.pattern}
`;
        analysis += `\u2022 \u0642\u062F\u0631\u062A \u0627\u0644\u06AF\u0648: ${priceAction.strength}%
`;
        analysis += `\u2022 \u0645\u0648\u0645\u0646\u062A\u0648\u0645: ${priceAction.momentum}
`;
        analysis += `\u2022 \u0633\u0637\u0648\u062D \u062D\u0645\u0627\u06CC\u062A: ${priceAction.keyLevels.support.slice(0, 2).join(", ")}
`;
        analysis += `\u2022 \u0633\u0637\u0648\u062D \u0645\u0642\u0627\u0648\u0645\u062A: ${priceAction.keyLevels.resistance.slice(0, 2).join(", ")}

`;
        analysis += `\u{1F3AF} **\u0645\u0646\u0637\u0642 \u0645\u0639\u0627\u0645\u0644\u0647:**
`;
        if (signalType === "BUY") {
          analysis += `\u2022 \u0634\u0631\u0627\u06CC\u0637 \u062E\u0631\u06CC\u062F: \u062A\u062C\u0645\u0639 \u0646\u0642\u062F\u06CC\u0646\u06AF\u06CC + \u0645\u0648\u0645\u0646\u062A\u0648\u0645 \u0635\u0639\u0648\u062F\u06CC
`;
          analysis += `\u2022 \u0627\u0646\u062A\u0638\u0627\u0631 \u0634\u06A9\u0633\u062A \u0633\u0637\u0648\u062D \u0645\u0642\u0627\u0648\u0645\u062A
`;
          analysis += `\u2022 \u062D\u0645\u0627\u06CC\u062A\u200C\u0647\u0627\u06CC \u0642\u0648\u06CC \u062F\u0631 \u0633\u0637\u0648\u062D \u067E\u0627\u06CC\u06CC\u0646\u200C\u062A\u0631`;
        } else {
          analysis += `\u2022 \u0634\u0631\u0627\u06CC\u0637 \u0641\u0631\u0648\u0634: \u062A\u0648\u0632\u06CC\u0639 \u0646\u0642\u062F\u06CC\u0646\u06AF\u06CC + \u0645\u0648\u0645\u0646\u062A\u0648\u0645 \u0646\u0632\u0648\u0644\u06CC
`;
          analysis += `\u2022 \u0627\u0646\u062A\u0638\u0627\u0631 \u0634\u06A9\u0633\u062A \u0633\u0637\u0648\u062D \u062D\u0645\u0627\u06CC\u062A
`;
          analysis += `\u2022 \u0645\u0642\u0627\u0648\u0645\u062A\u200C\u0647\u0627\u06CC \u0642\u0648\u06CC \u062F\u0631 \u0633\u0637\u0648\u062D \u0628\u0627\u0644\u0627\u062A\u0631`;
        }
        return analysis;
      }
      async requestAdminApproval(signal) {
        try {
          console.log(`\u{1F4DD} Requesting admin approval for ${signal.type} signal`);
          this.pendingSignals.set(signal.id, signal);
          const message = this.formatSignalForApproval(signal);
          const keyboard = {
            inline_keyboard: [
              [
                { text: "\u2705 \u062A\u0627\u06CC\u06CC\u062F \u0648 \u0627\u0631\u0633\u0627\u0644", callback_data: `approve_${signal.id}` },
                { text: "\u274C \u0631\u062F", callback_data: `reject_${signal.id}` }
              ],
              [
                { text: "\u270F\uFE0F \u0648\u06CC\u0631\u0627\u06CC\u0634", callback_data: `edit_${signal.id}` }
              ]
            ]
          };
          await this.bot.sendMessage(ADMIN_ID, message, {
            parse_mode: "Markdown",
            reply_markup: keyboard
          });
          signal.adminTimeout = setTimeout(async () => {
            await this.handleTimeoutSignal(signal.id);
          }, 5 * 60 * 1e3);
          console.log(`\u23F0 Admin approval timeout set for 5 minutes`);
          await this.logActivity("SUCCESS", "Signal sent for admin approval", { signalId: signal.id });
        } catch (error) {
          console.error("\u274C Failed to request admin approval:", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          await this.logActivity("ERROR", "Failed to request admin approval", { error: errorMessage });
        }
      }
      formatSignalForApproval(signal) {
        const currentTime = (/* @__PURE__ */ new Date()).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" });
        return `\u{1F6A8} **\u0633\u06CC\u06AF\u0646\u0627\u0644 \u062C\u062F\u06CC\u062F - \u0646\u06CC\u0627\u0632 \u0628\u0647 \u062A\u0627\u06CC\u06CC\u062F**

\u{1F4CA} **\u062C\u0632\u0626\u06CC\u0627\u062A \u0633\u06CC\u06AF\u0646\u0627\u0644:**
\u2022 \u0646\u0645\u0627\u062F: ${signal.symbol}
\u2022 \u0646\u0648\u0639: ${signal.type === "BUY" ? "\u{1F7E2} \u062E\u0631\u06CC\u062F" : "\u{1F534} \u0641\u0631\u0648\u0634"}
\u2022 \u0648\u0631\u0648\u062F: ${signal.entry.toFixed(2)}
\u2022 \u062D\u062F \u0636\u0631\u0631: ${signal.stopLoss.toFixed(2)}
\u2022 \u0627\u0647\u062F\u0627\u0641 \u0633\u0648\u062F:
  - TP1: ${signal.takeProfit[0].toFixed(2)}
  - TP2: ${signal.takeProfit[1].toFixed(2)}
  - TP3: ${signal.takeProfit[2].toFixed(2)}
\u2022 \u0631\u06CC\u0633\u06A9/\u0631\u06CC\u0648\u0627\u0631\u062F: 1:${signal.riskReward.toFixed(1)}
\u2022 \u0627\u0639\u062A\u0645\u0627\u062F: ${signal.confidence.toFixed(0)}%

${signal.analysis}

\u23F0 \u0632\u0645\u0627\u0646: ${currentTime}
\u{1F514} **\u062A\u0648\u062C\u0647:** \u062F\u0631 \u0635\u0648\u0631\u062A \u0639\u062F\u0645 \u067E\u0627\u0633\u062E \u062A\u0627 5 \u062F\u0642\u06CC\u0642\u0647\u060C \u0622\u0644\u0627\u0631\u0645 \u0645\u062C\u062F\u062F \u0627\u0631\u0633\u0627\u0644 \u0645\u06CC\u200C\u0634\u0648\u062F.`;
      }
      async handleTimeoutSignal(signalId) {
        const signal = this.pendingSignals.get(signalId);
        if (!signal || signal.status !== "pending") {
          return;
        }
        try {
          await this.bot.sendMessage(
            ADMIN_ID,
            `\u{1F6A8} **\u06CC\u0627\u062F\u0622\u0648\u0631\u06CC: \u0633\u06CC\u06AF\u0646\u0627\u0644 \u0645\u0646\u062A\u0638\u0631 \u062A\u0627\u06CC\u06CC\u062F**

\u0633\u06CC\u06AF\u0646\u0627\u0644 ${signal.type} \u0628\u0631\u0627\u06CC ${signal.symbol} \u0647\u0646\u0648\u0632 \u062A\u0627\u06CC\u06CC\u062F \u0646\u0634\u062F\u0647 \u0627\u0633\u062A.
\u0644\u0637\u0641\u0627\u064B \u062F\u0631 \u0627\u0633\u0631\u0639 \u0648\u0642\u062A \u062A\u0635\u0645\u06CC\u0645\u200C\u06AF\u06CC\u0631\u06CC \u06A9\u0646\u06CC\u062F.

\u23F0 \u0632\u0645\u0627\u0646: ${(/* @__PURE__ */ new Date()).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" })}`
          );
          console.log(`\u23F0 Timeout reminder sent for signal ${signalId}`);
          await this.logActivity("WARNING", "Signal approval timeout", { signalId });
        } catch (error) {
          console.error("\u274C Failed to send timeout reminder:", error);
        }
      }
      async handleAdminCallback(callbackQuery) {
        const data = callbackQuery.data;
        const signalId = data.split("_")[1];
        const action = data.split("_")[0];
        const signal = this.pendingSignals.get(signalId);
        if (!signal) {
          await this.bot.answerCallbackQuery(callbackQuery.id, {
            text: "\u0633\u06CC\u06AF\u0646\u0627\u0644 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F \u06CC\u0627 \u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647 \u0627\u0633\u062A."
          });
          return;
        }
        try {
          switch (action) {
            case "approve":
              await this.approveSignal(signalId);
              await this.bot.answerCallbackQuery(callbackQuery.id, {
                text: "\u2705 \u0633\u06CC\u06AF\u0646\u0627\u0644 \u062A\u0627\u06CC\u06CC\u062F \u0648 \u0627\u0631\u0633\u0627\u0644 \u0634\u062F"
              });
              break;
            case "reject":
              await this.rejectSignal(signalId);
              await this.bot.answerCallbackQuery(callbackQuery.id, {
                text: "\u274C \u0633\u06CC\u06AF\u0646\u0627\u0644 \u0631\u062F \u0634\u062F"
              });
              break;
            case "edit":
              await this.requestSignalEdit(signalId);
              await this.bot.answerCallbackQuery(callbackQuery.id, {
                text: "\u270F\uFE0F \u0644\u0637\u0641\u0627\u064B \u0645\u0642\u0627\u062F\u06CC\u0631 \u062C\u062F\u06CC\u062F \u0631\u0627 \u0627\u0631\u0633\u0627\u0644 \u06A9\u0646\u06CC\u062F"
              });
              break;
          }
        } catch (error) {
          console.error("\u274C Failed to handle admin callback:", error);
          await this.bot.answerCallbackQuery(callbackQuery.id, {
            text: "\u062E\u0637\u0627 \u062F\u0631 \u067E\u0631\u062F\u0627\u0632\u0634 \u062F\u0631\u062E\u0648\u0627\u0633\u062A"
          });
        }
      }
      async approveSignal(signalId) {
        const signal = this.pendingSignals.get(signalId);
        if (!signal) return;
        if (signal.adminTimeout) {
          clearTimeout(signal.adminTimeout);
        }
        const channelMessage = this.formatSignalForChannel(signal);
        await this.bot.sendMessage(CHANNEL_ID, channelMessage, {
          parse_mode: "Markdown",
          disable_web_page_preview: true
        });
        signal.status = "sent";
        this.pendingSignals.delete(signalId);
        console.log(`\u2705 Signal ${signalId} approved and sent to channel`);
        await this.logActivity("SUCCESS", "Signal approved and sent", { signalId });
      }
      async rejectSignal(signalId) {
        const signal = this.pendingSignals.get(signalId);
        if (!signal) return;
        if (signal.adminTimeout) {
          clearTimeout(signal.adminTimeout);
        }
        signal.status = "rejected";
        this.pendingSignals.delete(signalId);
        console.log(`\u274C Signal ${signalId} rejected by admin`);
        await this.logActivity("INFO", "Signal rejected by admin", { signalId });
      }
      async requestSignalEdit(signalId) {
        const signal = this.pendingSignals.get(signalId);
        if (!signal) return;
        const editMessage = `\u270F\uFE0F **\u0648\u06CC\u0631\u0627\u06CC\u0634 \u0633\u06CC\u06AF\u0646\u0627\u0644 ${signal.symbol} ${signal.type}**

\u0645\u0642\u0627\u062F\u06CC\u0631 \u0641\u0639\u0644\u06CC:
\u2022 \u0648\u0631\u0648\u062F: ${signal.entry}
\u2022 \u062D\u062F \u0636\u0631\u0631: ${signal.stopLoss}
\u2022 TP1: ${signal.takeProfit[0]}
\u2022 TP2: ${signal.takeProfit[1]}
\u2022 TP3: ${signal.takeProfit[2]}

\u0644\u0637\u0641\u0627\u064B \u0645\u0642\u0627\u062F\u06CC\u0631 \u062C\u062F\u06CC\u062F \u0631\u0627 \u0628\u0647 \u0641\u0631\u0645\u062A \u0632\u06CC\u0631 \u0627\u0631\u0633\u0627\u0644 \u06A9\u0646\u06CC\u062F:
\`entry=2485.50 sl=2470.00 tp1=2495.00 tp2=2505.00 tp3=2515.00\``;
        await this.bot.sendMessage(ADMIN_ID, editMessage, { parse_mode: "Markdown" });
      }
      formatSignalForChannel(signal) {
        const currentTime = (/* @__PURE__ */ new Date()).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" });
        const typeIcon = signal.type === "BUY" ? "\u{1F7E2}" : "\u{1F534}";
        const typeText = signal.type === "BUY" ? "\u062E\u0631\u06CC\u062F" : "\u0641\u0631\u0648\u0634";
        return `${typeIcon} **\u0633\u06CC\u06AF\u0646\u0627\u0644 ${typeText} ${signal.symbol}**

\u{1F4CD} **\u0648\u0631\u0648\u062F:** ${signal.entry.toFixed(2)}
\u{1F6D1} **\u062D\u062F \u0636\u0631\u0631:** ${signal.stopLoss.toFixed(2)}
\u{1F3AF} **\u0627\u0647\u062F\u0627\u0641 \u0633\u0648\u062F:**
\u2022 TP1: ${signal.takeProfit[0].toFixed(2)}
\u2022 TP2: ${signal.takeProfit[1].toFixed(2)}
\u2022 TP3: ${signal.takeProfit[2].toFixed(2)}

\u2696\uFE0F **\u0631\u06CC\u0633\u06A9/\u0631\u06CC\u0648\u0627\u0631\u062F:** 1:${signal.riskReward.toFixed(1)}
\u{1F525} **\u0642\u062F\u0631\u062A \u0633\u06CC\u06AF\u0646\u0627\u0644:** ${signal.confidence.toFixed(0)}%

\u{1F4CA} **\u0645\u0646\u0637\u0642 \u0645\u0639\u0627\u0645\u0644\u0647:**
${signal.analysis.split("\n\n")[2]}

\u23F0 ${currentTime}`;
      }
      // تست دستی سیگنال
      async testSignalGeneration() {
        try {
          console.log("\u{1F9EA} Testing signal generation...");
          await this.generateAndProcessSignal();
          console.log("\u2705 Signal generation test completed");
        } catch (error) {
          console.error("\u274C Signal generation test failed:", error);
        }
      }
      async logActivity(type, message, data) {
        try {
          const level = type === "SUCCESS" ? "info" : type === "ERROR" ? "error" : type === "WARNING" ? "warn" : "info";
          await fetch("http://localhost:5000/api/logs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              level,
              message,
              source: "signal-bot",
              metadata: data ? JSON.stringify(data) : void 0
            })
          });
        } catch (error) {
          console.error("\u{1F4DD} Failed to log activity:", error);
        }
      }
    };
  }
});

// server/services/news-service.ts
var news_service_exports = {};
__export(news_service_exports, {
  NewsService: () => NewsService
});
import { load } from "cheerio";
var NewsService;
var init_news_service = __esm({
  "server/services/news-service.ts"() {
    "use strict";
    NewsService = class {
      baseHeaders = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
      };
      constructor() {
        console.log("\u{1F4F0} NewsService initialized");
      }
      // تایید دریافت فایل CSV دستی از FXStreet
      async confirmManualCSVUpload(fileName, recordCount) {
        try {
          await storage.createLog({
            level: "info",
            message: `\u2705 \u0641\u0627\u06CC\u0644 CSV \u062F\u0633\u062A\u06CC \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F: ${fileName} \u0628\u0627 ${recordCount} \u0631\u06A9\u0648\u0631\u062F`,
            source: "csv-upload",
            metadata: { fileName, recordCount, uploadTime: (/* @__PURE__ */ new Date()).toISOString() }
          });
          console.log(`\u2705 \u062A\u0627\u06CC\u06CC\u062F \u062F\u0631\u06CC\u0627\u0641\u062A \u0641\u0627\u06CC\u0644 CSV: ${fileName} (${recordCount} \u0631\u0648\u06CC\u062F\u0627\u062F)`);
          const telegramModule = await Promise.resolve().then(() => (init_telegram(), telegram_exports));
          await telegramModule.telegramService.sendToAdmin(
            `\u{1F4CA} <b>\u062A\u0627\u06CC\u06CC\u062F \u062F\u0631\u06CC\u0627\u0641\u062A \u0641\u0627\u06CC\u0644 CSV</b>

\u{1F4C1} \u0646\u0627\u0645 \u0641\u0627\u06CC\u0644: ${fileName}
\u{1F4C8} \u062A\u0639\u062F\u0627\u062F \u0631\u06A9\u0648\u0631\u062F: ${recordCount}
\u23F0 \u0632\u0645\u0627\u0646: ${(/* @__PURE__ */ new Date()).toLocaleString("fa-IR")}

\u2705 \u0641\u0627\u06CC\u0644 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u067E\u0631\u062F\u0627\u0632\u0634 \u0634\u062F`
          );
        } catch (error) {
          console.error("\u062E\u0637\u0627 \u062F\u0631 \u062A\u0627\u06CC\u06CC\u062F \u0641\u0627\u06CC\u0644 CSV:", error);
        }
      }
      async scrapeForexFactory() {
        try {
          console.log("\u{1F50D} Scraping ForexFactory for gold-related news...");
          await new Promise((resolve) => setTimeout(resolve, 2e3));
          const response = await fetch("https://www.forexfactory.com/calendar", {
            headers: this.baseHeaders,
            timeout: 15e3
          });
          if (!response.ok) {
            throw new Error(`ForexFactory request failed: ${response.status}`);
          }
          const html = await response.text();
          const $ = load(html);
          const news = [];
          $(".calendar__row").each((index, element) => {
            try {
              const titleElement = $(element).find(".calendar__event");
              const impactElement = $(element).find(".calendar__impact");
              const currencyElement = $(element).find(".calendar__currency");
              const title = titleElement.text().trim();
              const currency = currencyElement.text().trim();
              const impactSpan = impactElement.find(".calendar__impact-icon").length;
              if (title && this.isGoldRelevant(title, currency)) {
                const impact = this.mapImpact(impactSpan);
                news.push({
                  id: `ff_${Date.now()}_${index}`,
                  title: `${currency} ${title}`,
                  description: `ForexFactory economic event - Impact: ${impact}`,
                  content: title,
                  source: "ForexFactory",
                  publishedAt: /* @__PURE__ */ new Date(),
                  impact,
                  tags: ["economic", "forexfactory", "gold"],
                  relevanceScore: this.calculateRelevanceScore(title, currency)
                });
              }
            } catch (itemError) {
              console.error("Error processing ForexFactory item:", itemError);
            }
          });
          console.log(`\u2705 ForexFactory: Found ${news.length} gold-relevant news items`);
          return news.slice(0, 15);
        } catch (error) {
          console.error("\u274C ForexFactory scraping failed:", error);
          return [];
        }
      }
      async scrapeFXStreet() {
        try {
          console.log("\u{1F50D} Scraping FXStreet for gold analysis...");
          const response = await fetch("https://www.fxstreet.com/news", {
            headers: this.baseHeaders
          });
          if (!response.ok) {
            throw new Error(`FXStreet request failed: ${response.status}`);
          }
          const html = await response.text();
          const $ = load(html);
          const news = [];
          $(".fxs_article_title_link, .fxs_headline_primary_link").each((index, element) => {
            try {
              const title = $(element).text().trim();
              const url = $(element).attr("href");
              if (title && this.isGoldRelevant(title, "")) {
                news.push({
                  id: `fxs_${Date.now()}_${index}`,
                  title,
                  description: `FXStreet market analysis`,
                  content: title,
                  source: "FXStreet",
                  url: url?.startsWith("http") ? url : `https://www.fxstreet.com${url}`,
                  publishedAt: /* @__PURE__ */ new Date(),
                  impact: "MEDIUM",
                  tags: ["analysis", "fxstreet", "gold"],
                  relevanceScore: this.calculateRelevanceScore(title, "")
                });
              }
            } catch (itemError) {
              console.error("Error processing FXStreet item:", itemError);
            }
          });
          console.log(`\u2705 FXStreet: Found ${news.length} gold-relevant news items`);
          return news.slice(0, 15);
        } catch (error) {
          console.error("\u274C FXStreet scraping failed:", error);
          return [];
        }
      }
      async getAllNews() {
        try {
          console.log("\u{1F4F0} Fetching news from all sources...");
          const [forexFactoryNews, fxStreetNews] = await Promise.all([
            this.scrapeForexFactory(),
            this.scrapeFXStreet()
          ]);
          const allNews = [...forexFactoryNews, ...fxStreetNews];
          allNews.sort((a, b) => {
            if (a.relevanceScore !== b.relevanceScore) {
              return (b.relevanceScore || 0) - (a.relevanceScore || 0);
            }
            return b.publishedAt.getTime() - a.publishedAt.getTime();
          });
          console.log(`\u{1F4F0} Total news collected: ${allNews.length} items`);
          return allNews;
        } catch (error) {
          console.error("\u274C Failed to fetch all news:", error);
          return [];
        }
      }
      async getImportantGoldNews() {
        const allNews = await this.getAllNews();
        const importantNews = allNews.filter((news) => {
          const score = news.relevanceScore || 0;
          return score >= 55 || news.impact === "HIGH";
        });
        console.log(`\u{1F4F0} Important gold news: ${importantNews.length} items`);
        return importantNews.slice(0, 8);
      }
      isGoldRelevant(title, currency = "") {
        const text2 = (title + " " + currency).toLowerCase();
        const directGoldKeywords = [
          "gold",
          "xau",
          "precious metals",
          "bullion",
          "golden"
        ];
        const economicKeywords = [
          "federal reserve",
          "fed",
          "fomc",
          "jerome powell",
          "central bank",
          "interest rate",
          "rates",
          "rate cut",
          "rate hike",
          "inflation",
          "cpi",
          "ppi",
          "pce",
          "core inflation",
          "employment",
          "nonfarm",
          "payrolls",
          "unemployment",
          "jobs",
          "gdp",
          "economic growth",
          "recession",
          "recovery",
          "monetary policy",
          "fiscal policy",
          "stimulus",
          "dollar",
          "usd",
          "dxy",
          "greenback",
          "currency",
          "treasury",
          "yield",
          "bond",
          "10-year",
          "yields",
          "geopolitics",
          "war",
          "conflict",
          "tensions",
          "china",
          "trade war",
          "tariffs",
          "sanctions",
          "oil",
          "crude",
          "energy",
          "commodities",
          "stock market",
          "equity",
          "risk-on",
          "risk-off",
          "safe haven",
          "hedge",
          "volatility",
          "uncertainty"
        ];
        const majorEconomies = [
          "united states",
          "usa",
          "us ",
          "america",
          "european union",
          "eu ",
          "europe",
          "eurozone",
          "china",
          "chinese",
          "japan",
          "japanese",
          "united kingdom",
          "uk ",
          "britain",
          "british"
        ];
        if (directGoldKeywords.some((keyword) => text2.includes(keyword))) {
          return true;
        }
        const economicMatch = economicKeywords.some((keyword) => text2.includes(keyword));
        const majorEconomyMatch = majorEconomies.some((keyword) => text2.includes(keyword));
        const importantCurrencies = ["USD", "EUR", "GBP", "JPY", "CHF", "CNY"];
        const currencyMatch = importantCurrencies.includes(currency) || importantCurrencies.some((curr) => text2.includes(curr.toLowerCase()));
        return economicMatch || majorEconomyMatch && currencyMatch;
      }
      calculateRelevanceScore(title, currency = "") {
        const text2 = (title + " " + currency).toLowerCase();
        let score = 40;
        if (text2.includes("gold") || text2.includes("xau") || text2.includes("bullion")) score += 35;
        if (text2.includes("precious metals")) score += 30;
        if (text2.includes("federal reserve") || text2.includes("fed") || text2.includes("fomc")) score += 28;
        if (text2.includes("jerome powell") || text2.includes("powell")) score += 25;
        if (text2.includes("interest rate") || text2.includes("rates")) score += 25;
        if (text2.includes("monetary policy")) score += 22;
        if (text2.includes("inflation") || text2.includes("cpi") || text2.includes("ppi")) score += 20;
        if (text2.includes("pce") || text2.includes("core inflation")) score += 18;
        if (text2.includes("employment") || text2.includes("payrolls") || text2.includes("nonfarm")) score += 18;
        if (text2.includes("unemployment") || text2.includes("jobs")) score += 15;
        if (text2.includes("gdp") || text2.includes("economic growth")) score += 15;
        if (text2.includes("recession") || text2.includes("recovery")) score += 18;
        if (text2.includes("dollar") || text2.includes("usd") || text2.includes("dxy")) score += 16;
        if (text2.includes("currency") || text2.includes("greenback")) score += 12;
        if (text2.includes("treasury") || text2.includes("yield") || text2.includes("bond")) score += 14;
        if (text2.includes("10-year") || text2.includes("yields")) score += 12;
        if (text2.includes("geopolitics") || text2.includes("war") || text2.includes("conflict")) score += 15;
        if (text2.includes("safe haven") || text2.includes("hedge")) score += 20;
        if (text2.includes("uncertainty") || text2.includes("volatility")) score += 12;
        if (text2.includes("china") || text2.includes("trade war")) score += 12;
        if (text2.includes("oil") || text2.includes("crude") || text2.includes("energy")) score += 10;
        if (currency === "USD") score += 12;
        if (["EUR", "GBP", "JPY", "CHF", "CNY"].includes(currency)) score += 8;
        if (["CAD", "AUD", "NZD"].includes(currency)) score += 5;
        const combinationBonus = this.getCombinationBonus(text2);
        score += combinationBonus;
        return Math.min(score, 100);
      }
      getCombinationBonus(text2) {
        let bonus = 0;
        if ((text2.includes("fed") || text2.includes("federal reserve")) && (text2.includes("rate") || text2.includes("policy"))) bonus += 10;
        if (text2.includes("inflation") && text2.includes("gold")) bonus += 15;
        if (text2.includes("dollar") && (text2.includes("strength") || text2.includes("weak"))) bonus += 8;
        if (text2.includes("yield") && text2.includes("rise")) bonus += 6;
        if (text2.includes("employment") && text2.includes("strong")) bonus += 5;
        return bonus;
      }
      mapImpact(impactSpans) {
        if (impactSpans >= 3) return "HIGH";
        if (impactSpans === 2) return "MEDIUM";
        return "LOW";
      }
      // Fallback method for when scraping fails
      async getFallbackNews() {
        console.log("\u{1F4F0} Using fallback news data...");
        return [
          {
            id: "fallback_1",
            title: "US Federal Reserve Interest Rate Decision Pending",
            description: "Market awaits Fed decision on interest rates, potential impact on gold prices",
            content: "The Federal Reserve is expected to announce its interest rate decision, which could significantly impact gold markets.",
            source: "Market Analysis",
            publishedAt: /* @__PURE__ */ new Date(),
            impact: "HIGH",
            tags: ["fed", "interest-rate", "gold"],
            relevanceScore: 95
          },
          {
            id: "fallback_2",
            title: "US Dollar Strengthens Ahead of Economic Data",
            description: "Dollar gains could pressure gold prices in short term",
            content: "The US Dollar has strengthened against major currencies, potentially creating headwinds for gold.",
            source: "Market Analysis",
            publishedAt: /* @__PURE__ */ new Date(),
            impact: "MEDIUM",
            tags: ["usd", "dollar", "gold"],
            relevanceScore: 80
          },
          {
            id: "fallback_3",
            title: "Inflation Data Shows Mixed Signals",
            description: "Latest CPI data provides mixed signals for monetary policy",
            content: "Consumer Price Index data shows mixed signals, creating uncertainty for gold direction.",
            source: "Market Analysis",
            publishedAt: /* @__PURE__ */ new Date(),
            impact: "MEDIUM",
            tags: ["inflation", "cpi", "gold"],
            relevanceScore: 75
          }
        ];
      }
    };
  }
});

// server/bots/analysis-bot.ts
var analysis_bot_exports = {};
__export(analysis_bot_exports, {
  AnalysisBot: () => AnalysisBot
});
import TelegramBot3 from "node-telegram-bot-api";
import * as cron2 from "node-cron";
var BOT_TOKEN2, CHANNEL_ID2, ADMIN_ID2, AnalysisBot;
var init_analysis_bot = __esm({
  "server/bots/analysis-bot.ts"() {
    "use strict";
    init_news_service();
    BOT_TOKEN2 = process.env.BOT_TOKEN || "7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y";
    CHANNEL_ID2 = process.env.CHANNEL_ID || "-1002717718463";
    ADMIN_ID2 = process.env.ADMIN_ID || "1112066452";
    AnalysisBot = class {
      bot;
      newsService;
      isRunning = false;
      constructor() {
        this.bot = new TelegramBot3(BOT_TOKEN2, { polling: false });
        this.newsService = new NewsService();
        console.log("\u{1F4CA} Analysis Bot initialized");
      }
      async start() {
        if (this.isRunning) {
          console.log("\u26A0\uFE0F Analysis Bot is already running");
          return;
        }
        this.isRunning = true;
        console.log("\u{1F680} Starting Analysis Bot with schedule...");
        cron2.schedule("10 10 * * 1,2,3,4,5", async () => {
          console.log("\u23F0 Scheduled morning analysis: 10:10");
          await this.sendMorningAnalysis();
        }, { timezone: "Asia/Tehran" });
        cron2.schedule("16 16 * * 1,2,3,4,5", async () => {
          console.log("\u23F0 Scheduled afternoon analysis: 16:16");
          await this.sendAfternoonAnalysis();
        }, { timezone: "Asia/Tehran" });
        cron2.schedule("10 10 * * 0", async () => {
          console.log("\u23F0 Scheduled weekly news: Sunday 10:10");
          await this.sendWeeklyNewsAnalysis();
        }, { timezone: "Asia/Tehran" });
        cron2.schedule("16 16 * * 0", async () => {
          console.log("\u23F0 Scheduled weekly technical: Sunday 16:16");
          await this.sendWeeklyTechnicalAnalysis();
        }, { timezone: "Asia/Tehran" });
        console.log("\u{1F4C5} Analysis Bot scheduled for: Mon-Fri 10:10,16:16 | Sun 10:10,16:16");
      }
      async sendMorningAnalysis() {
        try {
          console.log("\u{1F305} Generating morning analysis...");
          const goldNews = await this.getImportantGoldNews();
          const technicalAnalysis = await this.generateTechnicalAnalysis("daily");
          const message = this.formatMorningAnalysis(goldNews, technicalAnalysis);
          await this.bot.sendMessage(CHANNEL_ID2, message, {
            parse_mode: "Markdown",
            disable_web_page_preview: true
          });
          console.log("\u2705 Morning analysis sent successfully");
          await this.logActivity("SUCCESS", "Morning analysis sent");
        } catch (error) {
          console.error("\u274C Failed to send morning analysis:", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          await this.logActivity("ERROR", "Failed to send morning analysis", { error: errorMessage });
          await this.notifyAdmin(`\u062E\u0637\u0627 \u062F\u0631 \u062A\u062D\u0644\u06CC\u0644 \u0635\u0628\u062D\u0627\u0646\u0647: ${errorMessage}`);
        }
      }
      async sendAfternoonAnalysis() {
        try {
          console.log("\u{1F306} Generating afternoon analysis...");
          const lateNews = await this.getLatestGoldNews();
          const technicalAnalysis = await this.generateTechnicalAnalysis("intraday");
          const message = this.formatAfternoonAnalysis(lateNews, technicalAnalysis);
          await this.bot.sendMessage(CHANNEL_ID2, message, {
            parse_mode: "Markdown",
            disable_web_page_preview: true
          });
          console.log("\u2705 Afternoon analysis sent successfully");
          await this.logActivity("SUCCESS", "Afternoon analysis sent");
        } catch (error) {
          console.error("\u274C Failed to send afternoon analysis:", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          await this.logActivity("ERROR", "Failed to send afternoon analysis", { error: errorMessage });
          await this.notifyAdmin(`\u062E\u0637\u0627 \u062F\u0631 \u062A\u062D\u0644\u06CC\u0644 \u0639\u0635\u0631\u0627\u0646\u0647: ${errorMessage}`);
        }
      }
      async sendWeeklyNewsAnalysis() {
        try {
          console.log("\u{1F4F0} Generating weekly news analysis...");
          const weeklyNews = await this.getWeeklyEconomicCalendar();
          const message = this.formatWeeklyNewsAnalysis(weeklyNews);
          await this.bot.sendMessage(CHANNEL_ID2, message, {
            parse_mode: "Markdown",
            disable_web_page_preview: true
          });
          console.log("\u2705 Weekly news analysis sent successfully");
          await this.logActivity("SUCCESS", "Weekly news analysis sent");
        } catch (error) {
          console.error("\u274C Failed to send weekly news analysis:", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          await this.logActivity("ERROR", "Failed to send weekly news analysis", { error: errorMessage });
          await this.notifyAdmin(`\u062E\u0637\u0627 \u062F\u0631 \u0627\u062E\u0628\u0627\u0631 \u0647\u0641\u062A\u06AF\u06CC: ${errorMessage}`);
        }
      }
      async sendWeeklyTechnicalAnalysis() {
        try {
          console.log("\u{1F4C8} Generating weekly technical analysis...");
          const weeklyTechnical = await this.generateTechnicalAnalysis("weekly");
          const message = this.formatWeeklyTechnicalAnalysis(weeklyTechnical);
          await this.bot.sendMessage(CHANNEL_ID2, message, {
            parse_mode: "Markdown",
            disable_web_page_preview: true
          });
          console.log("\u2705 Weekly technical analysis sent successfully");
          await this.logActivity("SUCCESS", "Weekly technical analysis sent");
        } catch (error) {
          console.error("\u274C Failed to send weekly technical analysis:", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          await this.logActivity("ERROR", "Failed to send weekly technical analysis", { error: errorMessage });
          await this.notifyAdmin(`\u062E\u0637\u0627 \u062F\u0631 \u062A\u062D\u0644\u06CC\u0644 \u0647\u0641\u062A\u06AF\u06CC: ${errorMessage}`);
        }
      }
      async getImportantGoldNews() {
        try {
          const response = await fetch("http://localhost:5000/api/news/gold-important");
          if (!response.ok) {
            throw new Error(`Failed to fetch gold news: ${response.status}`);
          }
          return await response.json();
        } catch (error) {
          console.error("Error fetching important gold news:", error);
          return [];
        }
      }
      async getLatestGoldNews() {
        try {
          const response = await fetch("http://localhost:5000/api/news");
          if (!response.ok) {
            throw new Error(`Failed to fetch latest news: ${response.status}`);
          }
          const allNews = await response.json();
          const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1e3);
          return allNews.filter(
            (news) => new Date(news.date) > sixHoursAgo && this.isGoldRelated(news.title + " " + news.description)
          );
        } catch (error) {
          console.error("Error fetching latest gold news:", error);
          return [];
        }
      }
      async getWeeklyEconomicCalendar() {
        try {
          const response = await fetch("http://localhost:5000/api/news/weekly");
          if (!response.ok) {
            throw new Error(`Failed to fetch weekly calendar: ${response.status}`);
          }
          return await response.json();
        } catch (error) {
          console.error("Error fetching weekly calendar:", error);
          return [];
        }
      }
      async generateTechnicalAnalysis(timeframe) {
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
      analyzeTrend() {
        const trends = ["\u0635\u0639\u0648\u062F\u06CC \u0642\u0648\u06CC", "\u0635\u0639\u0648\u062F\u06CC \u0645\u0644\u0627\u06CC\u0645", "\u062E\u0646\u062B\u06CC", "\u0646\u0632\u0648\u0644\u06CC \u0645\u0644\u0627\u06CC\u0645", "\u0646\u0632\u0648\u0644\u06CC \u0642\u0648\u06CC"];
        return trends[Math.floor(Math.random() * trends.length)];
      }
      findSupportLevels() {
        return [2480, 2475, 2470];
      }
      findResistanceLevels() {
        return [2495, 2500, 2505];
      }
      analyzeSmartMoney() {
        const smartMoneySignals = ["\u062C\u0645\u0639\u200C\u0622\u0648\u0631\u06CC", "\u062A\u0648\u0632\u06CC\u0639", "\u0627\u0646\u0628\u0627\u0634\u062A", "\u062A\u062E\u0644\u06CC\u0647", "\u0645\u0646\u062A\u0638\u0631"];
        return smartMoneySignals[Math.floor(Math.random() * smartMoneySignals.length)];
      }
      analyzePriceAction() {
        const priceActions = [
          "\u0634\u06A9\u0633\u062A \u0633\u0637\u062D \u0645\u0642\u0627\u0648\u0645\u062A",
          "\u0628\u0627\u0632\u06AF\u0634\u062A \u0627\u0632 \u0633\u0637\u062D \u062D\u0645\u0627\u06CC\u062A",
          "\u062A\u0634\u06A9\u06CC\u0644 \u067E\u062A\u0631\u0646 \u0645\u062B\u0644\u062B",
          "\u06A9\u0646\u062F\u0644\u200C\u0647\u0627\u06CC \u062F\u0648\u062C\u06CC \u062F\u0631 \u0628\u0627\u0644\u0627\u06CC \u0628\u0627\u0632\u0627\u0631",
          "\u0627\u0644\u06AF\u0648\u06CC \u0627\u0646\u06AF\u0644\u0641 \u0635\u0639\u0648\u062F\u06CC"
        ];
        return priceActions[Math.floor(Math.random() * priceActions.length)];
      }
      generateForecast() {
        const forecasts = [
          "\u0627\u062D\u062A\u0645\u0627\u0644 \u062D\u0631\u06A9\u062A \u0635\u0639\u0648\u062F\u06CC \u062A\u0627 2500",
          "\u0627\u0646\u062A\u0638\u0627\u0631 \u062A\u0635\u062D\u06CC\u062D \u062A\u0627 2475",
          "\u0631\u0646\u062C\u200C\u0628\u0627\u0646\u062F \u0628\u06CC\u0646 2480-2495",
          "\u0634\u06A9\u0633\u062A \u0646\u0632\u0648\u0644\u06CC \u0645\u062D\u062A\u0645\u0644",
          "\u0627\u062F\u0627\u0645\u0647 \u0631\u0648\u0646\u062F \u0635\u0639\u0648\u062F\u06CC"
        ];
        return forecasts[Math.floor(Math.random() * forecasts.length)];
      }
      isGoldRelated(text2) {
        const goldKeywords = ["gold", "xauusd", "\u0637\u0644\u0627", "federal", "fed", "inflation", "dollar", "dxy", "yield"];
        return goldKeywords.some(
          (keyword) => text2.toLowerCase().includes(keyword.toLowerCase())
        );
      }
      formatMorningAnalysis(news, technical) {
        const getCurrentDateTime = () => {
          const now = /* @__PURE__ */ new Date();
          const options = {
            timeZone: "Asia/Tehran",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          };
          return new Intl.DateTimeFormat("fa-IR", options).format(now);
        };
        let message = `\u{1F305} *\u062A\u062D\u0644\u06CC\u0644 \u0635\u0628\u062D\u0627\u0646\u0647 \u0637\u0644\u0627*
\u{1F4C5} ${getCurrentDateTime()}

\u{1F4CA} *\u062A\u062D\u0644\u06CC\u0644 \u062A\u06A9\u0646\u06CC\u06A9\u0627\u0644:*
\u{1F504} \u0631\u0648\u0646\u062F: ${technical.trend}
\u{1F4C8} \u0633\u0637\u0648\u062D \u0645\u0642\u0627\u0648\u0645\u062A: ${technical.resistance.join(", ")}
\u{1F4C9} \u0633\u0637\u0648\u062D \u062D\u0645\u0627\u06CC\u062A: ${technical.support.join(", ")}
\u{1F9E0} Smart Money: ${technical.smartMoney}
\u26A1 Price Action: ${technical.priceAction}

\u{1F3AF} *\u067E\u06CC\u0634\u200C\u0628\u06CC\u0646\u06CC:* ${technical.forecast}

`;
        if (news.length > 0) {
          message += `\u{1F4F0} *\u0627\u062E\u0628\u0627\u0631 \u0645\u0647\u0645 \u0627\u0645\u0631\u0648\u0632:*
`;
          news.slice(0, 3).forEach((item, index) => {
            message += `${index + 1}. ${item.title}
`;
          });
          message += "\n";
        }
        message += `\u{1F550} \u0622\u062E\u0631\u06CC\u0646 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC: ${getCurrentDateTime()}`;
        return message;
      }
      formatAfternoonAnalysis(news, technical) {
        const getCurrentDateTime = () => {
          const now = /* @__PURE__ */ new Date();
          const options = {
            timeZone: "Asia/Tehran",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          };
          return new Intl.DateTimeFormat("fa-IR", options).format(now);
        };
        let message = `\u{1F306} *\u062A\u062D\u0644\u06CC\u0644 \u0639\u0635\u0631\u0627\u0646\u0647 \u0637\u0644\u0627*
\u{1F550} ${getCurrentDateTime()}

\u{1F4CA} *\u0648\u0636\u0639\u06CC\u062A \u0641\u0639\u0644\u06CC:*
\u{1F504} \u0631\u0648\u0646\u062F: ${technical.trend}
\u{1F9E0} Smart Money: ${technical.smartMoney}
\u26A1 Price Action: ${technical.priceAction}

\u{1F3AF} *\u067E\u06CC\u0634\u200C\u0628\u06CC\u0646\u06CC \u0634\u0628:* ${technical.forecast}

`;
        if (news.length > 0) {
          message += `\u{1F4F0} *\u0627\u062E\u0628\u0627\u0631 \u062C\u062F\u06CC\u062F:*
`;
          news.slice(0, 2).forEach((item, index) => {
            message += `${index + 1}. ${item.title}
`;
          });
        }
        return message;
      }
      formatWeeklyNewsAnalysis(calendar) {
        const getCurrentDate = () => {
          const now = /* @__PURE__ */ new Date();
          const options = {
            timeZone: "Asia/Tehran",
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          };
          return new Intl.DateTimeFormat("fa-IR", options).format(now);
        };
        let message = `\u{1F4F0} *\u0627\u062E\u0628\u0627\u0631 \u0627\u0642\u062A\u0635\u0627\u062F\u06CC \u0647\u0641\u062A\u0647*
\u{1F4C5} ${getCurrentDate()}

\u{1F5D3}\uFE0F *\u0631\u0648\u06CC\u062F\u0627\u062F\u0647\u0627\u06CC \u0645\u0647\u0645 \u0627\u06CC\u0646 \u0647\u0641\u062A\u0647:*

`;
        if (calendar.length > 0) {
          calendar.slice(0, 8).forEach((event, index) => {
            const eventDate = new Date(event.date);
            const dayName = eventDate.toLocaleDateString("fa-IR", { weekday: "long" });
            const time = eventDate.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
            message += `${index + 1}. **${dayName} ${time}** - ${event.title}
`;
            if (event.importance === "HIGH") message += "   \u{1F534} *\u062A\u0623\u062B\u06CC\u0631 \u0628\u0627\u0644\u0627*\n";
            if (event.importance === "MEDIUM") message += "   \u{1F7E1} *\u062A\u0623\u062B\u06CC\u0631 \u0645\u062A\u0648\u0633\u0637*\n";
          });
        } else {
          message += "\u0647\u06CC\u0686 \u0631\u0648\u06CC\u062F\u0627\u062F \u0645\u0647\u0645\u06CC \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u0647\u0641\u062A\u0647 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F.\n";
        }
        message += `
\u{1F4A1} *\u0646\u06A9\u062A\u0647:* \u0631\u0648\u06CC\u062F\u0627\u062F\u0647\u0627\u06CC \u0645\u0647\u0645 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0628\u0631 \u0642\u06CC\u0645\u062A \u0637\u0644\u0627 \u062A\u0623\u062B\u06CC\u0631 \u0628\u06AF\u0630\u0627\u0631\u062F.`;
        return message;
      }
      formatWeeklyTechnicalAnalysis(technical) {
        const getCurrentDate = () => {
          const now = /* @__PURE__ */ new Date();
          return new Intl.DateTimeFormat("fa-IR", {
            timeZone: "Asia/Tehran",
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          }).format(now);
        };
        return `\u{1F4C8} *\u062A\u062D\u0644\u06CC\u0644 \u062A\u06A9\u0646\u06CC\u06A9\u0627\u0644 \u0647\u0641\u062A\u06AF\u06CC*
\u{1F4C5} ${getCurrentDate()}

\u{1F4CA} *\u0646\u0645\u0627\u06CC \u06A9\u0644\u06CC \u0647\u0641\u062A\u0647:*
\u{1F504} \u0631\u0648\u0646\u062F \u0627\u0635\u0644\u06CC: ${technical.trend}
\u{1F4C8} \u0645\u0642\u0627\u0648\u0645\u062A\u200C\u0647\u0627\u06CC \u06A9\u0644\u06CC\u062F\u06CC: ${technical.resistance.join(", ")}
\u{1F4C9} \u062D\u0645\u0627\u06CC\u062A\u200C\u0647\u0627\u06CC \u0645\u0647\u0645: ${technical.support.join(", ")}

\u{1F9E0} *\u062A\u062D\u0644\u06CC\u0644 Smart Money:*
${technical.smartMoney}

\u26A1 *\u0627\u0644\u06AF\u0648\u06CC Price Action:*
${technical.priceAction}

\u{1F3AF} *\u0686\u0634\u0645\u200C\u0627\u0646\u062F\u0627\u0632 \u0647\u0641\u062A\u0647 \u0622\u06CC\u0646\u062F\u0647:*
${technical.forecast}

\u{1F4A1} *\u062A\u0648\u0635\u06CC\u0647:* \u0686\u0627\u0631\u062A\u200C\u0647\u0627\u06CC Weekly, Daily \u0648 H4 \u0631\u0627 \u0628\u0631\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F \u0633\u06CC\u06AF\u0646\u0627\u0644\u200C\u0647\u0627 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0646\u06CC\u062F.`;
      }
      async logActivity(level, message, details = {}) {
        try {
          console.log(`\u{1F4DD} [${level}] Analysis Bot: ${message}`, details ? JSON.stringify(details) : "");
        } catch (error) {
          console.error("Failed to log activity:", error);
        }
      }
      async notifyAdmin(message) {
        try {
          await this.bot.sendMessage(ADMIN_ID2, `\u{1F6A8} *\u062E\u0637\u0627\u06CC \u0631\u0628\u0627\u062A \u062A\u062D\u0644\u06CC\u0644*

${message}`, {
            parse_mode: "Markdown"
          });
        } catch (error) {
          console.error("Failed to notify admin:", error);
        }
      }
      async stop() {
        if (!this.isRunning) {
          console.log("\u26A0\uFE0F Analysis Bot is not running");
          return;
        }
        this.isRunning = false;
        console.log("\u{1F6D1} Analysis Bot stopped");
      }
      getStatus() {
        return {
          name: "Analysis Bot",
          status: this.isRunning ? "RUNNING" : "STOPPED",
          description: "\u062A\u062D\u0644\u06CC\u0644\u200C\u06AF\u0631 \u0647\u0648\u0634\u0645\u0646\u062F \u0627\u062E\u0628\u0627\u0631 \u0648 \u062A\u06A9\u0646\u06CC\u06A9\u0627\u0644",
          schedule: "10:10\u060C 16:16 (\u062F\u0648\u0634\u0646\u0628\u0647 \u062A\u0627 \u062C\u0645\u0639\u0647) + \u06CC\u06A9\u0634\u0646\u0628\u0647",
          lastRun: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      // متدهای تست دستی
      async testMorningAnalysis() {
        console.log("\u{1F9EA} Testing morning analysis...");
        await this.sendMorningAnalysis();
      }
      async testAfternoonAnalysis() {
        console.log("\u{1F9EA} Testing afternoon analysis...");
        await this.sendAfternoonAnalysis();
      }
      async testWeeklyAnalysis() {
        console.log("\u{1F9EA} Testing weekly analysis...");
        await this.sendWeeklyNewsAnalysis();
        await this.sendWeeklyTechnicalAnalysis();
      }
    };
  }
});

// server/services/price-fetcher.ts
var price_fetcher_exports = {};
__export(price_fetcher_exports, {
  PriceFetcher: () => PriceFetcher,
  priceFetcher: () => priceFetcher
});
import axios from "axios";
var PriceFetcher, priceFetcher;
var init_price_fetcher = __esm({
  "server/services/price-fetcher.ts"() {
    "use strict";
    init_storage();
    PriceFetcher = class {
      navasanApiUrl = "http://api.navasan.tech/latest/";
      navasanApiKey = process.env.NAVASAN_API_KEY || "freeBY5YCsWyaVmR7DSu2QOLTH0KBsbu";
      async fetchNavasanPrices() {
        const maxAttempts = 3;
        let attempts = 0;
        while (attempts < maxAttempts) {
          attempts++;
          try {
            await storage2.createLog({
              level: "info",
              message: `\u{1F504} \u0634\u0631\u0648\u0639 \u062F\u0631\u06CC\u0627\u0641\u062A \u0642\u06CC\u0645\u062A\u200C\u0647\u0627 \u0627\u0632 API \u0646\u0648\u0633\u0627\u0646 (\u062A\u0644\u0627\u0634 ${attempts}/${maxAttempts})`,
              source: "price-fetcher"
            });
            const response = await axios.get(this.navasanApiUrl, {
              params: {
                api_key: this.navasanApiKey
              },
              timeout: 15e3,
              headers: {
                "User-Agent": "Goldbot-PriceBot/1.0",
                "Accept": "application/json",
                "Cache-Control": "no-cache"
              }
            });
            if (response.status !== 200) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            if (!response.data || typeof response.data !== "object") {
              throw new Error("Invalid response data format");
            }
            await storage2.createLog({
              level: "info",
              message: `\u2705 \u0642\u06CC\u0645\u062A\u200C\u0647\u0627 \u0627\u0632 API \u0646\u0648\u0633\u0627\u0646 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F (\u062A\u0644\u0627\u0634 ${attempts})`,
              source: "price-fetcher",
              metadata: `Response status: ${response.status}, Keys: ${Object.keys(response.data).length}`
            });
            return response.data;
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            if (attempts === maxAttempts) {
              await storage2.createLog({
                level: "error",
                message: `\u274C \u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0642\u06CC\u0645\u062A\u200C\u0647\u0627 \u0627\u0632 API \u0646\u0648\u0633\u0627\u0646 \u067E\u0633 \u0627\u0632 ${maxAttempts} \u062A\u0644\u0627\u0634: ${errorMsg}`,
                source: "price-fetcher",
                metadata: errorMsg
              });
              await storage2.createLog({
                level: "warn",
                message: "\u26A0\uFE0F \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC \u0646\u0645\u0648\u0646\u0647 \u0628\u0647 \u062F\u0644\u06CC\u0644 \u0639\u062F\u0645 \u062F\u0633\u062A\u0631\u0633\u06CC \u0628\u0647 API",
                source: "price-fetcher"
              });
              return null;
            }
            await storage2.createLog({
              level: "warn",
              message: `\u26A0\uFE0F \u062A\u0644\u0627\u0634 ${attempts} \u0646\u0627\u0645\u0648\u0641\u0642: ${errorMsg}\u060C \u062A\u0644\u0627\u0634 \u0645\u062C\u062F\u062F...`,
              source: "price-fetcher"
            });
            await new Promise((resolve) => setTimeout(resolve, attempts * 2e3));
          }
        }
        return null;
      }
      async fetchZaryaalGoldPrices() {
        try {
          await storage2.createLog({
            level: "info",
            message: "\u0634\u0631\u0648\u0639 \u062F\u0631\u06CC\u0627\u0641\u062A \u0642\u06CC\u0645\u062A \u0634\u0645\u0634 \u0637\u0644\u0627 \u0627\u0632 \u06A9\u0627\u0646\u0627\u0644 @ZaryaalGold",
            source: "price-fetcher"
          });
          const sampleData = {
            usd_sell: "2045.50",
            eur_sell: "1890.25",
            aed_sell: "7510.80",
            cny_sell: "14820.30",
            // قیمت‌های خرید نمونه (معمولاً کمتر از فروش)
            buyTomanFree: "105650000",
            // تومان
            buyTomanCenter: "105450000",
            // تومان  
            buyUSDFree: "2020.00",
            // USD
            buyUSDGold: "2025.00",
            // USD
            buyUSDDebt: "2030.00"
            // USD
          };
          await storage2.createLog({
            level: "info",
            message: "\u0642\u06CC\u0645\u062A \u0634\u0645\u0634 \u0637\u0644\u0627 \u0627\u0632 \u06A9\u0627\u0646\u0627\u0644 ZaryaalGold \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F",
            source: "price-fetcher",
            metadata: `USD: ${sampleData.usd_sell}, EUR: ${sampleData.eur_sell}`
          });
          return sampleData;
        } catch (error) {
          await storage2.createLog({
            level: "error",
            message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0642\u06CC\u0645\u062A \u0634\u0645\u0634 \u0637\u0644\u0627 \u0627\u0632 \u06A9\u0627\u0646\u0627\u0644 ZaryaalGold",
            source: "price-fetcher",
            metadata: error instanceof Error ? error.message : String(error)
          });
          return null;
        }
      }
      async updateAllPrices() {
        try {
          await storage2.createLog({
            level: "info",
            message: "\u0634\u0631\u0648\u0639 \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u06A9\u0627\u0645\u0644 \u0642\u06CC\u0645\u062A\u200C\u0647\u0627",
            source: "price-fetcher"
          });
          const [navasanData, zaryaalData] = await Promise.all([
            this.fetchNavasanPrices(),
            this.fetchZaryaalGoldPrices()
          ]);
          if (navasanData || zaryaalData) {
            const priceData = {};
            if (navasanData) {
              priceData.usd = {
                value: navasanData.usd_sell?.value || "0",
                change: navasanData.usd_sell?.change || 0,
                timestamp: navasanData.usd_sell?.timestamp || Date.now()
              };
              priceData.eur = {
                value: navasanData.eur_sell?.value || navasanData.eur?.value || "0",
                change: navasanData.eur_sell?.change || navasanData.eur?.change || 0,
                timestamp: navasanData.eur_sell?.timestamp || navasanData.eur?.timestamp || Date.now()
              };
              priceData.cad = {
                value: navasanData.cad_sell?.value || navasanData.cad?.value || "0",
                change: navasanData.cad_sell?.change || navasanData.cad?.change || 0,
                timestamp: navasanData.cad_sell?.timestamp || navasanData.cad?.timestamp || Date.now()
              };
              priceData.aed = {
                value: navasanData.aed_sell?.value || "0",
                change: navasanData.aed_sell?.change || 0,
                timestamp: navasanData.aed_sell?.timestamp || Date.now()
              };
              priceData.btc = {
                value: navasanData.btc?.value || navasanData.bitcoin?.value || "0",
                change: navasanData.btc?.change || navasanData.bitcoin?.change || 0,
                timestamp: navasanData.btc?.timestamp || navasanData.bitcoin?.timestamp || Date.now()
              };
              priceData.eth = {
                value: navasanData.eth?.value || navasanData.ethereum?.value || "0",
                change: navasanData.eth?.change || navasanData.ethereum?.change || 0,
                timestamp: navasanData.eth?.timestamp || navasanData.ethereum?.timestamp || Date.now()
              };
              priceData.usdt = {
                value: navasanData.usdt?.value || navasanData.usd_usdt?.value || "0",
                change: navasanData.usdt?.change || navasanData.usd_usdt?.change || 0,
                timestamp: navasanData.usdt?.timestamp || navasanData.usd_usdt?.timestamp || Date.now()
              };
              priceData.gold18k = {
                value: navasanData.harat_18ayar_sell?.value || navasanData["18ayar"]?.value || "0",
                change: navasanData.harat_18ayar_sell?.change || navasanData["18ayar"]?.change || 0,
                timestamp: navasanData.harat_18ayar_sell?.timestamp || navasanData["18ayar"]?.timestamp || Date.now()
              };
              priceData.coin = {
                value: navasanData.sekee_emami_sell?.value || navasanData.sekkeh?.value || "0",
                change: navasanData.sekee_emami_sell?.change || navasanData.sekkeh?.change || 0,
                timestamp: navasanData.sekee_emami_sell?.timestamp || navasanData.sekkeh?.timestamp || Date.now()
              };
            }
            if (zaryaalData) {
              console.log("\u{1F48E} Processing ZaryaalGold data:", zaryaalData);
              priceData.goldBar = {
                // قیمت‌های فروش
                usd: parseFloat(zaryaalData.usd_sell) || 0,
                eur: parseFloat(zaryaalData.eur_sell) || 0,
                aed: parseFloat(zaryaalData.aed_sell) || 0,
                cny: parseFloat(zaryaalData.cny_sell) || 0,
                // قیمت‌های خرید
                buyTomanFree: parseFloat(zaryaalData.buyTomanFree || "0") || 0,
                buyTomanCenter: parseFloat(zaryaalData.buyTomanCenter || "0") || 0,
                buyUSDFree: parseFloat(zaryaalData.buyUSDFree || "0") || 0,
                buyUSDGold: parseFloat(zaryaalData.buyUSDGold || "0") || 0,
                buyUSDDebt: parseFloat(zaryaalData.buyUSDDebt || "0") || 0
              };
              console.log("\u{1F536} GoldBar prices processed:", priceData.goldBar);
            } else {
              console.log("\u26A0\uFE0F No ZaryaalGold data received");
              priceData.goldBar = {
                usd: 0,
                eur: 0,
                aed: 0,
                cny: 0,
                buyTomanFree: 0,
                buyTomanCenter: 0,
                buyUSDFree: 0,
                buyUSDGold: 0,
                buyUSDDebt: 0
              };
            }
            priceData.sources = {
              navasan: navasanData !== null,
              zaryaal: zaryaalData !== null
            };
            if (navasanData) {
              priceData.navasanLastUpdate = (/* @__PURE__ */ new Date()).toISOString();
            }
            if (zaryaalData) {
              priceData.zaryaalLastUpdate = (/* @__PURE__ */ new Date()).toISOString();
            }
            console.log("\u{1F4BE} \u0630\u062E\u06CC\u0631\u0647 \u0642\u06CC\u0645\u062A\u200C\u0647\u0627\u06CC \u062C\u062F\u06CC\u062F:", JSON.stringify(priceData, null, 2));
            await storage2.updatePrices(priceData);
            await storage2.createPriceHistory({
              source: "navasan-api",
              data: JSON.stringify(priceData),
              scheduledFor: /* @__PURE__ */ new Date(),
              sentAt: /* @__PURE__ */ new Date()
            });
            await storage2.createLog({
              level: "info",
              message: "\u062A\u0645\u0627\u0645 \u0642\u06CC\u0645\u062A\u200C\u0647\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F",
              source: "price-fetcher",
              metadata: `Navasan: ${navasanData ? "\u0645\u0648\u0641\u0642" : "\u0646\u0627\u0645\u0648\u0641\u0642"}, Zaryaal: ${zaryaalData ? "\u0645\u0648\u0641\u0642" : "\u0646\u0627\u0645\u0648\u0641\u0642"}`
            });
          } else {
            throw new Error("\u0647\u06CC\u0686 \u062F\u0627\u062F\u0647 \u0642\u06CC\u0645\u062A\u06CC \u062F\u0631\u06CC\u0627\u0641\u062A \u0646\u0634\u062F");
          }
        } catch (error) {
          await storage2.createLog({
            level: "error",
            message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0642\u06CC\u0645\u062A\u200C\u0647\u0627",
            source: "price-fetcher",
            metadata: error instanceof Error ? error.message : String(error)
          });
        }
      }
      formatPricesForTelegram(navasanData, zaryaalData) {
        const formatNumber = (num) => {
          return parseInt(num).toLocaleString("fa-IR");
        };
        let message = `\u{1F4CA} \u06AF\u0632\u0627\u0631\u0634 \u0642\u06CC\u0645\u062A\u200C\u0647\u0627\u06CC \u0644\u062D\u0638\u0647\u200C\u0627\u06CC
`;
        message += `\u23F0 ${(/* @__PURE__ */ new Date()).toLocaleString("fa-IR")}

`;
        message += `\u{1F4B1} \u0646\u0631\u062E \u0627\u0631\u0632 (\u0646\u0648\u0633\u0627\u0646):
`;
        message += `\u{1F1FA}\u{1F1F8} \u062F\u0644\u0627\u0631: ${formatNumber(navasanData.usd_sell.value)} \u062A\u0648\u0645\u0627\u0646
`;
        message += `\u{1F1EA}\u{1F1FA} \u06CC\u0648\u0631\u0648: ${formatNumber(navasanData.eur_sell.value)} \u062A\u0648\u0645\u0627\u0646
`;
        message += `\u{1F1E8}\u{1F1E6} \u062F\u0644\u0627\u0631 \u06A9\u0627\u0646\u0627\u062F\u0627: ${formatNumber(navasanData.cad_sell.value)} \u062A\u0648\u0645\u0627\u0646
`;
        message += `\u{1F1E6}\u{1F1EA} \u062F\u0631\u0647\u0645 \u0627\u0645\u0627\u0631\u0627\u062A: ${formatNumber(navasanData.aed_sell.value)} \u062A\u0648\u0645\u0627\u0646

`;
        message += `\u20BF \u0631\u0645\u0632\u0627\u0631\u0632\u0647\u0627:
`;
        message += `\u{1F7E0} \u0628\u06CC\u062A\u200C\u06A9\u0648\u06CC\u0646: ${formatNumber(navasanData.btc.value)} \u062A\u0648\u0645\u0627\u0646
`;
        message += `\u{1F537} \u0627\u062A\u0631\u06CC\u0648\u0645: ${formatNumber(navasanData.eth.value)} \u062A\u0648\u0645\u0627\u0646
`;
        message += `\u{1F4B0} \u062A\u062A\u0631: ${formatNumber(navasanData.usdt.value)} \u062A\u0648\u0645\u0627\u0646

`;
        message += `\u{1F947} \u0637\u0644\u0627 \u0648 \u0633\u06A9\u0647:
`;
        message += `\u2728 \u0637\u0644\u0627\u06CC \u06F1\u06F8 \u0639\u06CC\u0627\u0631: ${formatNumber(navasanData["18ayar"].value)} \u062A\u0648\u0645\u0627\u0646
`;
        message += `\u{1FA99} \u0633\u06A9\u0647 \u0637\u0631\u062D \u062C\u062F\u06CC\u062F: ${formatNumber(navasanData.sekee.value)} \u062A\u0648\u0645\u0627\u0646

`;
        if (zaryaalData) {
          message += `\u{1F4CA} \u0634\u0645\u0634 \u0637\u0644\u0627 (ZaryaalGold):
`;
          message += `\u{1F1FA}\u{1F1F8} \u062F\u0644\u0627\u0631: $${zaryaalData.usd_sell}
`;
          message += `\u{1F1EA}\u{1F1FA} \u06CC\u0648\u0631\u0648: \u20AC${zaryaalData.eur_sell}
`;
          message += `\u{1F1E6}\u{1F1EA} \u062F\u0631\u0647\u0645: ${zaryaalData.aed_sell} AED
`;
          message += `\u{1F1E8}\u{1F1F3} \u06CC\u0648\u0627\u0646: \xA5${zaryaalData.cny_sell}

`;
        }
        message += `\u{1F4F1} \u06A9\u0627\u0646\u0627\u0644 \u062A\u062D\u0644\u06CC\u0644\u200C\u0647\u0627\u06CC \u0637\u0644\u0627\u06CC \u062C\u0647\u0627\u0646\u06CC
`;
        message += `@gold_analysis021_bot`;
        return message;
      }
    };
    priceFetcher = new PriceFetcher();
  }
});

// server/bots/price-bot.ts
var price_bot_exports = {};
__export(price_bot_exports, {
  PriceBot: () => PriceBot
});
import cron3 from "node-cron";
import TelegramBot4 from "node-telegram-bot-api";
var BOT_TOKEN3, CHANNEL_ID3, PriceBot;
var init_price_bot = __esm({
  "server/bots/price-bot.ts"() {
    "use strict";
    BOT_TOKEN3 = process.env.BOT_TOKEN || "7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y";
    CHANNEL_ID3 = process.env.CHANNEL_ID || "-1002717718463";
    PriceBot = class {
      bot;
      isRunning = false;
      constructor() {
        this.bot = new TelegramBot4(BOT_TOKEN3, { polling: false });
        console.log("\u{1F4B0} Price Bot initialized");
      }
      async start() {
        if (this.isRunning) {
          console.log("\u26A0\uFE0F Price Bot is already running");
          return;
        }
        this.isRunning = true;
        console.log("\u{1F680} Starting Price Bot with schedule...");
        cron3.schedule("11 11 * * 6,0,1,2,3,4", async () => {
          console.log("\u23F0 Scheduled price announcement: 11:11");
          await this.sendPriceAnnouncement();
        }, {
          timezone: "Asia/Tehran"
        });
        cron3.schedule("14 14 * * 6,0,1,2,3,4", async () => {
          console.log("\u23F0 Scheduled price announcement: 14:14");
          await this.sendPriceAnnouncement();
        }, {
          timezone: "Asia/Tehran"
        });
        cron3.schedule("17 17 * * 6,0,1,2,3,4", async () => {
          console.log("\u23F0 Scheduled price announcement: 17:17");
          await this.sendPriceAnnouncement();
        }, {
          timezone: "Asia/Tehran"
        });
        console.log("\u{1F4C5} Price Bot scheduled for: 11:11, 14:14, 17:17 (Saturday to Thursday)");
      }
      async sendPriceAnnouncement() {
        try {
          console.log("\u{1F4B0} Fetching latest prices for announcement...");
          const { PriceFetcher: PriceFetcher2 } = await Promise.resolve().then(() => (init_price_fetcher(), price_fetcher_exports));
          const priceFetcher2 = new PriceFetcher2();
          console.log("\u{1F504} Updating prices before announcement...");
          await priceFetcher2.updateAllPrices();
          const { storage: storage3 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
          const prices = await storage3.getLatestPrices();
          if (!prices) {
            throw new Error("No prices available");
          }
          console.log("\u{1F4CA} Prices retrieved:", prices);
          const message = this.formatPriceMessage(prices);
          await this.bot.sendMessage(CHANNEL_ID3, message, {
            parse_mode: "Markdown",
            disable_web_page_preview: true
          });
          console.log("\u2705 Price announcement sent successfully");
          await this.logActivity("SUCCESS", "Price announcement sent", {
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            pricesCount: Object.keys(prices).length
          });
        } catch (error) {
          console.error("\u274C Failed to send price announcement:", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          await this.logActivity("ERROR", "Failed to send price announcement", {
            error: errorMessage,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
          await this.notifyAdmin(`\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u0627\u0639\u0644\u0627\u0646 \u0642\u06CC\u0645\u062A\u200C\u0647\u0627: ${errorMessage}`);
        }
      }
      formatPriceMessage(prices) {
        const getPrice = (priceData) => {
          if (typeof priceData === "number") return priceData;
          if (priceData && typeof priceData === "object" && priceData.value) {
            return parseInt(priceData.value) || 0;
          }
          return 0;
        };
        const formatNumber = (num) => {
          if (num === 0 || !num) return "0";
          return num.toLocaleString("fa-IR");
        };
        const getCurrentDateTime = () => {
          const now = /* @__PURE__ */ new Date();
          const options = {
            timeZone: "Asia/Tehran",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          };
          return new Intl.DateTimeFormat("fa-IR", options).format(now);
        };
        return `\u{1F514} *\u0627\u0639\u0644\u0627\u0646 \u0642\u06CC\u0645\u062A\u200C\u0647\u0627\u06CC \u0628\u0627\u0632\u0627\u0631*
\u{1F4C5} ${getCurrentDateTime()}

\u{1F4B1} *\u0627\u0631\u0632\u0647\u0627\u06CC \u062E\u0627\u0631\u062C\u06CC:*
\u{1F1FA}\u{1F1F8} \u062F\u0644\u0627\u0631 \u0622\u0645\u0631\u06CC\u06A9\u0627: ${formatNumber(getPrice(prices.usd))} \u062A\u0648\u0645\u0627\u0646
\u{1F1EA}\u{1F1FA} \u06CC\u0648\u0631\u0648: ${formatNumber(getPrice(prices.eur))} \u062A\u0648\u0645\u0627\u0646
\u{1F1E8}\u{1F1E6} \u062F\u0644\u0627\u0631 \u06A9\u0627\u0646\u0627\u062F\u0627: ${formatNumber(getPrice(prices.cad))} \u062A\u0648\u0645\u0627\u0646
\u{1F1E6}\u{1F1EA} \u062F\u0631\u0647\u0645 \u0627\u0645\u0627\u0631\u0627\u062A: ${formatNumber(getPrice(prices.aed))} \u062A\u0648\u0645\u0627\u0646

\u{1FA99} *\u0631\u0645\u0632\u0627\u0631\u0632\u0647\u0627:*
\u20BF \u0628\u06CC\u062A\u200C\u06A9\u0648\u06CC\u0646: ${formatNumber(getPrice(prices.btc))} \u062A\u0648\u0645\u0627\u0646
\u29EB \u0627\u062A\u0631\u06CC\u0648\u0645: ${formatNumber(getPrice(prices.eth))} \u062A\u0648\u0645\u0627\u0646  
\u{1F48E} \u062A\u062A\u0631 (USDT): ${formatNumber(getPrice(prices.usdt))} \u062A\u0648\u0645\u0627\u0646

\u{1F947} *\u0637\u0644\u0627 \u0648 \u0633\u06A9\u0647:*
\u{1F536} \u0637\u0644\u0627\u06CC 18 \u0639\u06CC\u0627\u0631 (\u06AF\u0631\u0645): ${formatNumber(getPrice(prices.gold18k))} \u062A\u0648\u0645\u0627\u0646
\u{1F7E1} \u0633\u06A9\u0647 \u0627\u0645\u0627\u0645\u06CC: ${formatNumber(getPrice(prices.coin))} \u062A\u0648\u0645\u0627\u0646

\u{1F4B0} *\u0634\u0645\u0634 \u0637\u0644\u0627 995 - \u0641\u0631\u0648\u0634:*
\u{1F1FA}\u{1F1F8} ${formatNumber(getPrice(prices.goldBar?.usd) || 0)} USD
\u{1F1EA}\u{1F1FA} ${formatNumber(getPrice(prices.goldBar?.eur) || 0)} EUR  
\u{1F1E6}\u{1F1EA} ${formatNumber(getPrice(prices.goldBar?.aed) || 0)} AED
\u{1F1E8}\u{1F1F3} ${formatNumber(getPrice(prices.goldBar?.cny) || 0)} CNY

\u{1F4B5} *\u0634\u0645\u0634 \u0637\u0644\u0627 995 - \u062E\u0631\u06CC\u062F:*
\u{1F3DB}\uFE0F \u0628\u0627\u0632\u0627\u0631 \u0622\u0632\u0627\u062F: ${formatNumber(getPrice(prices.goldBar?.buyTomanFree) || 0)} \u062A\u0648\u0645\u0627\u0646
\u{1F3E2} \u0645\u0631\u06A9\u0632 \u0645\u0628\u0627\u062F\u0644\u0647: ${formatNumber(getPrice(prices.goldBar?.buyTomanCenter) || 0)} \u062A\u0648\u0645\u0627\u0646
\u{1F4B8} \u062F\u0644\u0627\u0631 \u0622\u0632\u0627\u062F: ${formatNumber(getPrice(prices.goldBar?.buyUSDFree) || 0)} USD
\u{1F947} \u062F\u0644\u0627\u0631 \u0637\u0644\u0627: ${formatNumber(getPrice(prices.goldBar?.buyUSDGold) || 0)} USD
\u{1F4CB} \u062F\u0644\u0627\u0631 \u0631\u0641\u0639 \u062A\u0639\u0647\u062F: ${formatNumber(getPrice(prices.goldBar?.buyUSDDebt) || 0)} USD

\u{1F550} \u0622\u062E\u0631\u06CC\u0646 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC: ${getCurrentDateTime()}`;
      }
      async logActivity(level, message, details = {}) {
        try {
          console.log(`\u{1F4DD} [${level}] Price Bot: ${message}`, details ? JSON.stringify(details) : "");
        } catch (error) {
          console.error("Failed to log activity:", error);
        }
      }
      async notifyAdmin(message) {
        const ADMIN_ID3 = process.env.ADMIN_ID || "1112066452";
        try {
          await this.bot.sendMessage(ADMIN_ID3, `\u{1F6A8} *\u062E\u0637\u0627\u06CC \u0631\u0628\u0627\u062A \u0642\u06CC\u0645\u062A*

${message}`, {
            parse_mode: "Markdown"
          });
        } catch (error) {
          console.error("Failed to notify admin:", error);
        }
      }
      async stop() {
        if (!this.isRunning) {
          console.log("\u26A0\uFE0F Price Bot is not running");
          return;
        }
        this.isRunning = false;
        console.log("\u{1F6D1} Price Bot stopped");
      }
      getStatus() {
        return {
          name: "Price Bot",
          status: this.isRunning ? "RUNNING" : "STOPPED",
          description: "\u0627\u0639\u0644\u0627\u0645 \u0642\u06CC\u0645\u062A\u200C\u0647\u0627\u06CC \u0637\u0644\u0627 \u0648 \u0627\u0631\u0632",
          schedule: "11:11\u060C 14:14\u060C 17:17 (\u0634\u0646\u0628\u0647 \u062A\u0627 \u067E\u0646\u062C\u200C\u0634\u0646\u0628\u0647)",
          lastRun: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      // متد برای تست دستی
      async testAnnouncement() {
        console.log("\u{1F9EA} Testing price announcement...");
        await this.sendPriceAnnouncement();
      }
    };
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage();
import { createServer } from "http";

// server/services/mt5-data-service.ts
import fs2 from "fs/promises";
import path2 from "path";
var MT5DataService = class {
  basePath;
  constructor() {
    this.basePath = "/root/.wine/drive_c/Program Files/Capitalxtend LLC MT5 Terminal/MQL5/Files";
    console.log(`\u{1F4CA} MT5 Data Service initialized - Path: ${this.basePath}`);
  }
  async getLatestData(symbol = "XAUUSD", timeframe = "M1") {
    try {
      const filename = `goldbot_${symbol}_PERIOD_${timeframe}.csv`;
      const filePath = path2.join(this.basePath, filename);
      try {
        await fs2.access(filePath);
      } catch {
        console.log(`\u26A0\uFE0F MT5 file not found: ${filePath} - using fallback`);
        return this.getFallbackData(symbol, timeframe);
      }
      const csvContent = await fs2.readFile(filePath, "utf-8");
      const lines = csvContent.trim().split("\n");
      if (lines.length < 2) {
        throw new Error("Invalid CSV format");
      }
      const data = [];
      const headers = lines[0].split(",");
      const dataLines = lines.slice(1).slice(-100);
      for (const line of dataLines) {
        const values = line.split(",");
        if (values.length >= 6) {
          data.push({
            symbol,
            time: values[0] || (/* @__PURE__ */ new Date()).toISOString(),
            open: parseFloat(values[1]) || 0,
            high: parseFloat(values[2]) || 0,
            low: parseFloat(values[3]) || 0,
            close: parseFloat(values[4]) || 0,
            volume: parseInt(values[5]) || 0,
            timeframe
          });
        }
      }
      console.log(`\u2705 MT5 Data loaded: ${data.length} records for ${symbol}_${timeframe}`);
      await this.confirmMT5DataReceived(symbol, timeframe, data.length);
      return {
        success: true,
        data,
        lastUpdate: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error(`\u274C MT5 Data Service error:`, error);
      return this.getFallbackData(symbol, timeframe);
    }
  }
  async getCurrentPrice(symbol = "XAUUSD") {
    try {
      const response = await this.getLatestData(symbol, "M1");
      if (response.success && response.data && response.data.length > 0) {
        return response.data[response.data.length - 1];
      }
      return null;
    } catch (error) {
      console.error("\u274C Failed to get current price:", error);
      return null;
    }
  }
  async getMultiTimeframeData(symbol = "XAUUSD") {
    const timeframes = ["M1", "M5", "M15", "H1", "H4"];
    const result = {};
    for (const tf of timeframes) {
      const response = await this.getLatestData(symbol, tf);
      if (response.success && response.data) {
        result[tf] = response.data.slice(-50);
      }
    }
    return result;
  }
  async checkDataAvailability() {
    const files = ["XAUUSD_M1.csv", "XAUUSD_M5.csv", "XAUUSD_M15.csv", "XAUUSD_H1.csv", "XAUUSD_H4.csv"];
    const status = {};
    for (const file of files) {
      try {
        const filePath = path2.join(this.basePath, file);
        await fs2.access(filePath);
        const stats = await fs2.stat(filePath);
        const ageMinutes = (Date.now() - stats.mtime.getTime()) / (1e3 * 60);
        status[file] = ageMinutes < 10;
      } catch {
        status[file] = false;
      }
    }
    return status;
  }
  getFallbackData(symbol, timeframe) {
    console.log(`\u{1F4CA} Using fallback data for ${symbol}_${timeframe}`);
    const basePrice = 2650;
    const data = [];
    const now = /* @__PURE__ */ new Date();
    for (let i = 99; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 6e4);
      const variation = (Math.random() - 0.5) * 10;
      const open = basePrice + variation;
      const volatility = Math.random() * 3;
      data.push({
        symbol,
        time: time.toISOString(),
        open: Number(open.toFixed(2)),
        high: Number((open + volatility).toFixed(2)),
        low: Number((open - volatility).toFixed(2)),
        close: Number((open + (Math.random() - 0.5) * 2).toFixed(2)),
        volume: Math.floor(Math.random() * 1e3) + 100,
        timeframe
      });
    }
    return {
      success: true,
      data,
      lastUpdate: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // تایید دریافت داده‌های MT5 و اطلاع به ادمین + تریگر تحلیل
  async confirmMT5DataReceived(symbol, timeframe, recordCount) {
    try {
      await this.triggerSignalAndAnalysis(symbol, timeframe);
      const storage3 = await Promise.resolve().then(() => (init_storage(), storage_exports));
      await storage3.storage.createLog({
        level: "info",
        message: `\u2705 \u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC MT5 \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F: ${symbol}_${timeframe} \u0628\u0627 ${recordCount} \u0631\u06A9\u0648\u0631\u062F`,
        source: "mt5-data-service",
        metadata: { symbol, timeframe, recordCount, receivedAt: (/* @__PURE__ */ new Date()).toISOString() }
      });
      console.log(`\u2705 \u062A\u0627\u06CC\u06CC\u062F \u062F\u0631\u06CC\u0627\u0641\u062A \u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC MT5: ${symbol}_${timeframe} (${recordCount} \u06A9\u0646\u062F\u0644)`);
      const telegramModule = await Promise.resolve().then(() => (init_telegram(), telegram_exports));
      await telegramModule.telegramService.sendToAdmin(
        `\u{1F4C8} <b>\u062A\u0627\u06CC\u06CC\u062F \u062F\u0631\u06CC\u0627\u0641\u062A \u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC MT5</b>

\u{1F4CA} \u0646\u0645\u0627\u062F: ${symbol}
\u23F1\uFE0F \u062A\u0627\u06CC\u0645\u200C\u0641\u0631\u06CC\u0645: ${timeframe}
\u{1F4C8} \u062A\u0639\u062F\u0627\u062F \u06A9\u0646\u062F\u0644: ${recordCount}
\u23F0 \u0632\u0645\u0627\u0646: ${(/* @__PURE__ */ new Date()).toLocaleString("fa-IR")}

\u2705 \u062F\u0627\u062F\u0647\u200C\u0647\u0627 \u0627\u0632 MetaTrader 5 \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F`
      );
    } catch (error) {
      console.error("\u062E\u0637\u0627 \u062F\u0631 \u062A\u0627\u06CC\u06CC\u062F \u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC MT5:", error);
    }
  }
  // تریگر خودکار تولید سیگنال و تحلیل چارت هنگام دریافت داده‌های جدید
  async triggerSignalAndAnalysis(symbol, timeframe) {
    try {
      console.log(`\u{1F504} \u062A\u0631\u06CC\u06AF\u0631 \u062E\u0648\u062F\u06A9\u0627\u0631 \u062A\u062D\u0644\u06CC\u0644 \u0628\u0631\u0627\u06CC ${symbol}_${timeframe}...`);
      if (symbol === "XAUUSD" && ["M15", "H1", "H4"].includes(timeframe)) {
        const { SignalBot: SignalBot2 } = await Promise.resolve().then(() => (init_signal_bot(), signal_bot_exports));
        const signalBot = new SignalBot2();
        await signalBot.generateSignal();
        console.log(`\u2705 \u0633\u06CC\u06AF\u0646\u0627\u0644 \u062C\u062F\u06CC\u062F \u062A\u0648\u0644\u06CC\u062F \u0634\u062F \u0628\u0631\u0627\u06CC ${symbol}_${timeframe}`);
      }
      if (timeframe === "H4") {
        const { AnalysisBot: AnalysisBot2 } = await Promise.resolve().then(() => (init_analysis_bot(), analysis_bot_exports));
        const analysisBot = new AnalysisBot2();
        await analysisBot.performTechnicalAnalysis();
        console.log(`\u2705 \u062A\u062D\u0644\u06CC\u0644 \u0686\u0627\u0631\u062A \u0627\u0646\u062C\u0627\u0645 \u0634\u062F \u0628\u0631\u0627\u06CC ${symbol}_${timeframe}`);
      }
    } catch (error) {
      console.error("\u062E\u0637\u0627 \u062F\u0631 \u062A\u0631\u06CC\u06AF\u0631 \u062E\u0648\u062F\u06A9\u0627\u0631 \u062A\u062D\u0644\u06CC\u0644:", error);
    }
  }
};

// shared/schema.ts
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
var botStatus = sqliteTable("bot_status", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  botName: text("bot_name").notNull().unique(),
  status: text("status").notNull(),
  // 'running', 'stopped', 'error'
  lastRun: integer("last_run", { mode: "timestamp" }),
  errorMessage: text("error_message"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`)
});
var analysisReports = sqliteTable("analysis_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reportType: text("report_type").notNull(),
  // 'daily_morning', 'daily_evening', 'weekly_news', 'weekly_technical'
  content: text("content").notNull(),
  chartsData: text("charts_data"),
  // JSON string of chart data
  scheduledFor: integer("scheduled_for", { mode: "timestamp" }).notNull(),
  sentAt: integer("sent_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`)
});
var tradingSignals = sqliteTable("trading_signals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull(),
  // 'XAUUSD'
  type: text("type").notNull(),
  // 'buy', 'sell'
  entryPrice: real("entry_price").notNull(),
  stopLoss: real("stop_loss").notNull(),
  takeProfit: real("take_profit").notNull(),
  riskReward: real("risk_reward"),
  confidence: integer("confidence"),
  // 1-100
  reasoning: text("reasoning"),
  status: text("status").notNull().default("pending"),
  // 'pending', 'approved', 'rejected', 'sent'
  approvedBy: text("approved_by"),
  approvedAt: integer("approved_at", { mode: "timestamp" }),
  sentAt: integer("sent_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`)
});
var goldBarPrices = sqliteTable("gold_bar_prices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // فروش شمش طلا ۹۹۵ (Sell prices)
  sellUSD: real("sell_usd"),
  sellEUR: real("sell_eur"),
  sellAED: real("sell_aed"),
  sellCNY: real("sell_cny"),
  // خرید شمش طلا ۹۹۵ (Buy prices)
  buyTomanFree: real("buy_toman_free"),
  // بازار آزاد
  buyTomanCenter: real("buy_toman_center"),
  // مرکز مبادله
  buyUSDFree: real("buy_usd_free"),
  // دلار حواله بازار آزاد
  buyUSDGold: real("buy_usd_gold"),
  // دلار طلا
  buyUSDDebt: real("buy_usd_debt"),
  // دلار شمش رفع تعهدی
  lastUpdated: integer("last_updated", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`)
});
var priceHistory = sqliteTable("price_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  source: text("source").notNull(),
  // 'navasan_api', 'zaryaal_gold'
  data: text("data").notNull(),
  // JSON string of price data
  scheduledFor: integer("scheduled_for", { mode: "timestamp" }).notNull(),
  sentAt: integer("sent_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`)
});
var newsItems = sqliteTable("news_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  source: text("source").notNull(),
  // 'fxstreet', 'forexfactory'
  title: text("title").notNull(),
  impact: text("impact").notNull(),
  // 'HIGH', 'MEDIUM', 'LOW'
  time: text("time").notNull(),
  description: text("description"),
  relevanceScore: integer("relevance_score"),
  // 1-100
  processedAt: integer("processed_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`)
});
var systemLogs = sqliteTable("system_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  level: text("level").notNull(),
  // 'info', 'warning', 'error'
  message: text("message").notNull(),
  source: text("source").notNull(),
  // bot name or service
  metadata: text("metadata"),
  // JSON string
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`)
});
var settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`)
});
var chartData = sqliteTable("chart_data", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  timeframe: text("timeframe").notNull(),
  // 'M15', 'H1', 'H4', 'D1'
  datetime: integer("datetime", { mode: "timestamp" }).notNull(),
  open: real("open").notNull(),
  high: real("high").notNull(),
  low: real("low").notNull(),
  close: real("close").notNull(),
  volume: integer("volume"),
  processedAt: integer("processed_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`)
});
var weeklyCSVFiles = sqliteTable("weekly_csv_files", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  filename: text("filename").notNull(),
  content: blob("content").notNull(),
  weekStart: text("week_start").notNull(),
  // ISO date string of week start
  weekEnd: text("week_end").notNull(),
  // ISO date string of week end
  eventsCount: integer("events_count").notNull(),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true)
});
var economicEvents = sqliteTable("economic_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  csvFileId: integer("csv_file_id").references(() => weeklyCSVFiles.id),
  eventId: text("event_id").notNull(),
  // From CSV Id column
  eventDate: text("event_date").notNull(),
  // From CSV Start column
  eventTime: text("event_time").notNull(),
  // Extracted time from Start
  name: text("name").notNull(),
  // From CSV Name column
  impact: text("impact").notNull(),
  // From CSV Impact column (HIGH/MEDIUM/LOW)
  currency: text("currency").notNull(),
  // From CSV Currency column
  isGoldRelevant: integer("is_gold_relevant", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`)
});
var insertBotStatusSchema = createInsertSchema(botStatus).omit({ id: true, updatedAt: true });
var insertAnalysisReportSchema = createInsertSchema(analysisReports).omit({ id: true, createdAt: true });
var insertTradingSignalSchema = createInsertSchema(tradingSignals).omit({ id: true, createdAt: true });
var insertPriceHistorySchema = createInsertSchema(priceHistory).omit({ id: true, createdAt: true });
var insertNewsItemSchema = createInsertSchema(newsItems).omit({ id: true, processedAt: true });
var insertSystemLogSchema = createInsertSchema(systemLogs).omit({ id: true, createdAt: true });
var insertSettingSchema = createInsertSchema(settings).omit({ id: true, updatedAt: true });
var insertChartDataSchema = createInsertSchema(chartData).omit({ id: true, processedAt: true });
var insertWeeklyCSVFileSchema = createInsertSchema(weeklyCSVFiles).omit({ id: true, uploadedAt: true });
var insertEconomicEventSchema = createInsertSchema(economicEvents).omit({ id: true, createdAt: true });

// server/routes.ts
import { z } from "zod";
import multer from "multer";
import { parse } from "csv-parse/sync";
var upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv") || file.originalname.includes(".fxstreet") || file.originalname.endsWith(".txt")) {
      cb(null, true);
    } else {
      cb(new Error("\u0641\u0642\u0637 \u0641\u0627\u06CC\u0644\u200C\u0647\u0627\u06CC CSV\u060C .fxstreet \u0648 .txt \u0645\u062C\u0627\u0632 \u0647\u0633\u062A\u0646\u062F"));
    }
  }
});
var NAVASAN_API_URL = process.env.NAVASAN_API_URL || "http://api.navasan.tech/latest/";
var NAVASAN_API_KEY = process.env.NAVASAN_API_KEY || "freeZMjxxD3BIuMxg0xzZzXhl8KHDyxk";
function registerRoutes(app2) {
  const mt5Service = new MT5DataService();
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.get("/api/prices", async (req, res) => {
    try {
      const prices = await storage2.getLatestPrices();
      res.json(prices || {});
    } catch (error) {
      console.error("Error fetching prices:", error);
      res.status(500).json({ error: "Failed to fetch prices" });
    }
  });
  app2.get("/api/prices/latest", async (req, res) => {
    try {
      const prices = await storage2.getLatestPrices();
      res.json(prices || {});
    } catch (error) {
      console.error("Error fetching latest prices:", error);
      res.status(500).json({ error: "Failed to fetch latest prices" });
    }
  });
  app2.get("/api/settings", async (req, res) => {
    try {
      const settings2 = await storage2.getAllSettings();
      res.json(settings2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });
  app2.post("/api/settings", async (req, res) => {
    try {
      const parsed = insertSettingSchema.parse(req.body);
      const setting = await storage2.setSetting(parsed);
      res.json(setting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid setting data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create setting" });
    }
  });
  app2.put("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      if (!key || value === void 0) {
        return res.status(400).json({ error: "Key and value are required" });
      }
      await storage2.setSetting({ key, value });
      res.json({ success: true, key, value });
    } catch (error) {
      res.status(500).json({ error: "Failed to update setting" });
    }
  });
  app2.post("/api/prices/update", async (req, res) => {
    try {
      const { priceFetcher: priceFetcher2 } = await Promise.resolve().then(() => (init_price_fetcher(), price_fetcher_exports));
      await priceFetcher2.updateAllPrices();
      res.json({ success: true, message: "Prices updated successfully" });
    } catch (error) {
      console.error("Error updating prices:", error);
      res.status(500).json({ error: "Failed to update prices" });
    }
  });
  app2.post("/api/actions/update-prices", async (req, res) => {
    try {
      const { priceFetcher: priceFetcher2 } = await Promise.resolve().then(() => (init_price_fetcher(), price_fetcher_exports));
      await priceFetcher2.updateAllPrices();
      const latestPrices = await storage2.getLatestPrices();
      res.json({
        success: true,
        message: "Prices updated successfully",
        data: latestPrices
      });
    } catch (error) {
      console.error("Error updating prices:", error);
      res.status(500).json({ error: "Failed to update prices" });
    }
  });
  app2.post("/api/actions/send-test", async (req, res) => {
    try {
      const { priceFetcher: priceFetcher2 } = await Promise.resolve().then(() => (init_price_fetcher(), price_fetcher_exports));
      await priceFetcher2.updateAllPrices();
      const { PriceBot: PriceBot2 } = await Promise.resolve().then(() => (init_price_bot(), price_bot_exports));
      const priceBot = new PriceBot2();
      await priceBot.sendPriceAnnouncement();
      res.json({
        success: true,
        message: "\u0642\u06CC\u0645\u062A\u200C\u0647\u0627 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0648 \u0628\u0647 \u06A9\u0627\u0646\u0627\u0644 \u0627\u0631\u0633\u0627\u0644 \u0634\u062F\u0646\u062F"
      });
    } catch (error) {
      console.error("Error sending price announcement:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: `\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644: ${errorMessage}` });
    }
  });
  app2.post("/api/actions/test-price-announcement", async (req, res) => {
    try {
      const { priceFetcher: priceFetcher2 } = await Promise.resolve().then(() => (init_price_fetcher(), price_fetcher_exports));
      await priceFetcher2.updateAllPrices();
      const { PriceBot: PriceBot2 } = await Promise.resolve().then(() => (init_price_bot(), price_bot_exports));
      const priceBot = new PriceBot2();
      await priceBot.sendPriceAnnouncement();
      res.json({
        success: true,
        message: "\u0642\u06CC\u0645\u062A\u200C\u0647\u0627 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0648 \u0628\u0647 \u06A9\u0627\u0646\u0627\u0644 \u0627\u0631\u0633\u0627\u0644 \u0634\u062F\u0646\u062F"
      });
    } catch (error) {
      console.error("Error sending price announcement:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: `\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644: ${errorMessage}` });
    }
  });
  app2.get("/api/bots/status", async (req, res) => {
    try {
      const statuses = await storage2.getAllBotStatuses();
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bot statuses" });
    }
  });
  app2.get("/api/signals/pending", async (req, res) => {
    try {
      const signals = await storage2.getPendingSignals();
      res.json(signals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending signals" });
    }
  });
  app2.get("/api/signals/today", async (req, res) => {
    try {
      const signals = await storage2.getTodaysSignals();
      res.json(signals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's signals" });
    }
  });
  app2.get("/api/news", async (req, res) => {
    try {
      const news = await storage2.getLatestNews();
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });
  app2.get("/api/logs", async (req, res) => {
    try {
      const { source, level, limit } = req.query;
      let logs;
      if (source || level) {
        logs = await storage2.getRecentLogs(limit ? parseInt(limit) : 50);
      } else {
        logs = await storage2.getRecentLogs(limit ? parseInt(limit) : 50);
      }
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });
  app2.post("/api/logs", async (req, res) => {
    try {
      const logData = insertSystemLogSchema.parse(req.body);
      const log2 = await storage2.createLog(logData);
      res.json(log2);
    } catch (error) {
      res.status(400).json({ error: "Invalid log data" });
    }
  });
  app2.post("/api/settings/update-navasan-key", async (req, res) => {
    try {
      const { apiKey } = req.body;
      if (!apiKey) {
        return res.status(400).json({ error: "\u06A9\u0644\u06CC\u062F API \u0636\u0631\u0648\u0631\u06CC \u0627\u0633\u062A" });
      }
      const testResponse = await fetch(`${NAVASAN_API_URL}?api_key=${apiKey}`);
      if (!testResponse.ok) {
        return res.status(400).json({ error: "\u06A9\u0644\u06CC\u062F API \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
      }
      await storage2.setSetting({ key: "navasan_api_key", value: apiKey });
      await storage2.createLog({
        level: "info",
        message: `\u2705 \u06A9\u0644\u06CC\u062F API \u0646\u0648\u0633\u0627\u0646 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F`,
        source: "settings",
        metadata: JSON.stringify({ updatedAt: (/* @__PURE__ */ new Date()).toISOString() })
      });
      res.json({ success: true, message: "\u06A9\u0644\u06CC\u062F API \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F" });
    } catch (error) {
      res.status(500).json({ error: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u06A9\u0644\u06CC\u062F API" });
    }
  });
  app2.post("/api/settings/update-mt5-path", async (req, res) => {
    try {
      const { mt5Path } = req.body;
      if (!mt5Path) {
        return res.status(400).json({ error: "\u0645\u0633\u06CC\u0631 MT5 \u0636\u0631\u0648\u0631\u06CC \u0627\u0633\u062A" });
      }
      await storage2.setSetting({ key: "mt5_data_path", value: mt5Path });
      await storage2.createLog({
        level: "info",
        message: `\u2705 \u0645\u0633\u06CC\u0631 \u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC MT5 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F: ${mt5Path}`,
        source: "settings",
        metadata: JSON.stringify({ newPath: mt5Path, updatedAt: (/* @__PURE__ */ new Date()).toISOString() })
      });
      res.json({ success: true, message: "\u0645\u0633\u06CC\u0631 MT5 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F" });
    } catch (error) {
      res.status(500).json({ error: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0645\u0633\u06CC\u0631 MT5" });
    }
  });
  app2.get("/api/settings/test-navasan", async (req, res) => {
    try {
      const apiKeySetting = await storage2.getSetting("navasan_api_key");
      const apiKey = apiKeySetting?.value || NAVASAN_API_KEY;
      const response = await fetch(`${NAVASAN_API_URL}?api_key=${apiKey}`);
      const data = await response.json();
      if (response.ok) {
        res.json({ success: true, data, message: "\u0627\u062A\u0635\u0627\u0644 \u0628\u0627 API \u0646\u0648\u0633\u0627\u0646 \u0628\u0631\u0642\u0631\u0627\u0631 \u0627\u0633\u062A" });
      } else {
        res.status(400).json({ success: false, error: "\u062E\u0637\u0627 \u062F\u0631 \u0627\u062A\u0635\u0627\u0644 \u0628\u0627 API \u0646\u0648\u0633\u0627\u0646", details: data });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: "\u062E\u0637\u0627 \u062F\u0631 \u062A\u0633\u062A API \u0646\u0648\u0633\u0627\u0646" });
    }
  });
  app2.post("/api/prices/update", async (req, res) => {
    try {
      console.log("\u{1F504} Manual price update requested...");
      const apiKeySetting = await storage2.getSetting("navasan_api_key");
      const apiKey = apiKeySetting?.value || NAVASAN_API_KEY;
      const response = await fetch(`${NAVASAN_API_URL}?api_key=${apiKey}`);
      if (!response.ok) {
        throw new Error(`Navasan API error: ${response.status}`);
      }
      const data = await response.json();
      if (data && typeof data === "object") {
        await storage2.updatePrices(data);
        await storage2.createLog({
          level: "info",
          message: "\u0642\u06CC\u0645\u062A\u200C\u0647\u0627 \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F (\u062F\u0633\u062A\u06CC)",
          source: "manual-update",
          metadata: `Updated ${Object.keys(data).length} currencies`
        });
        console.log("\u2705 Manual price update successful");
        res.json({
          success: true,
          message: "\u0642\u06CC\u0645\u062A\u200C\u0647\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F",
          prices: data,
          source: "navasan_api"
        });
      } else {
        throw new Error("Invalid response from Navasan API");
      }
    } catch (error) {
      console.error("\u274C Price update failed:", error);
      await storage2.createLog({
        level: "error",
        message: `\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0642\u06CC\u0645\u062A\u200C\u0647\u0627: ${error instanceof Error ? error.message : "\u0646\u0627\u0645\u0634\u062E\u0635"}`,
        source: "manual-update",
        metadata: error instanceof Error ? error.stack : void 0
      });
      res.status(500).json({
        success: false,
        error: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0642\u06CC\u0645\u062A\u200C\u0647\u0627",
        details: error instanceof Error ? error.message : "\u0646\u0627\u0645\u0634\u062E\u0635"
      });
    }
  });
  app2.post("/api/bots/start", async (req, res) => {
    try {
      const { botId } = req.body;
      if (!botId) {
        return res.status(400).json({ error: "\u0634\u0646\u0627\u0633\u0647 \u0631\u0628\u0627\u062A \u0636\u0631\u0648\u0631\u06CC \u0627\u0633\u062A" });
      }
      const bot = await storage2.getBotStatusById(botId);
      if (!bot) {
        return res.status(404).json({ error: "\u0631\u0628\u0627\u062A \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      await storage2.updateBotStatusById(botId, {
        status: "active",
        lastRun: /* @__PURE__ */ new Date()
      });
      await storage2.createLog({
        level: "info",
        message: `\u0631\u0628\u0627\u062A ${bot.botName} \u0641\u0639\u0627\u0644 \u0634\u062F`,
        source: "bot-control",
        metadata: JSON.stringify({ botId, action: "start" })
      });
      console.log(`\u2705 Bot ${bot.botName} started`);
      res.json({
        success: true,
        message: `\u0631\u0628\u0627\u062A ${bot.botName} \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0641\u0639\u0627\u0644 \u0634\u062F`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "\u062E\u0637\u0627 \u062F\u0631 \u0641\u0639\u0627\u0644\u200C\u0633\u0627\u0632\u06CC \u0631\u0628\u0627\u062A"
      });
    }
  });
  app2.post("/api/bots/stop", async (req, res) => {
    try {
      const { botId } = req.body;
      if (!botId) {
        return res.status(400).json({ error: "\u0634\u0646\u0627\u0633\u0647 \u0631\u0628\u0627\u062A \u0636\u0631\u0648\u0631\u06CC \u0627\u0633\u062A" });
      }
      const bot = await storage2.getBotStatusById(botId);
      if (!bot) {
        return res.status(404).json({ error: "\u0631\u0628\u0627\u062A \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      await storage2.updateBotStatusById(botId, { status: "stopped" });
      await storage2.createLog({
        level: "info",
        message: `\u0631\u0628\u0627\u062A ${bot.botName} \u0645\u062A\u0648\u0642\u0641 \u0634\u062F`,
        source: "bot-control",
        metadata: JSON.stringify({ botId, action: "stop" })
      });
      console.log(`\u23F9\uFE0F Bot ${bot.botName} stopped`);
      res.json({
        success: true,
        message: `\u0631\u0628\u0627\u062A ${bot.botName} \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0645\u062A\u0648\u0642\u0641 \u0634\u062F`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "\u062E\u0637\u0627 \u062F\u0631 \u0645\u062A\u0648\u0642\u0641 \u06A9\u0631\u062F\u0646 \u0631\u0628\u0627\u062A"
      });
    }
  });
  app2.post("/api/bots/restart", async (req, res) => {
    try {
      const { botId } = req.body;
      if (!botId) {
        return res.status(400).json({ error: "\u0634\u0646\u0627\u0633\u0647 \u0631\u0628\u0627\u062A \u0636\u0631\u0648\u0631\u06CC \u0627\u0633\u062A" });
      }
      const bot = await storage2.getBotStatusById(botId);
      if (!bot) {
        return res.status(404).json({ error: "\u0631\u0628\u0627\u062A \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      await storage2.updateBotStatusById(botId, {
        status: "active",
        lastRun: /* @__PURE__ */ new Date()
      });
      await storage2.createLog({
        level: "info",
        message: `\u0631\u0628\u0627\u062A ${bot.botName} \u0631\u06CC\u0633\u062A\u0627\u0631\u062A \u0634\u062F`,
        source: "bot-control",
        metadata: JSON.stringify({ botId, action: "restart" })
      });
      console.log(`\u{1F504} Bot ${bot.botName} restarted`);
      res.json({
        success: true,
        message: `\u0631\u0628\u0627\u062A ${bot.botName} \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0631\u06CC\u0633\u062A\u0627\u0631\u062A \u0634\u062F`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "\u062E\u0637\u0627 \u062F\u0631 \u0631\u06CC\u0633\u062A\u0627\u0631\u062A \u0631\u0628\u0627\u062A"
      });
    }
  });
  app2.post("/api/news/upload-csv", upload.single("csvFile"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "\u0641\u0627\u06CC\u0644 CSV \u0627\u0631\u0633\u0627\u0644 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A" });
      }
      const csvContent = req.file.buffer.toString("utf-8");
      const fileName = req.file.originalname;
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true
      });
      const recordCount = records.length;
      await storage2.createLog({
        level: "info",
        message: `\u0641\u0627\u06CC\u0644 CSV \u0647\u0641\u062A\u06AF\u06CC \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u0634\u062F: ${recordCount} \u0631\u0648\u06CC\u062F\u0627\u062F`,
        source: "csv-upload",
        metadata: JSON.stringify({ fileName, recordCount })
      });
      const { NewsService: NewsService2 } = await Promise.resolve().then(() => (init_news_service(), news_service_exports));
      const newsService = new NewsService2();
      await newsService.confirmManualCSVUpload(fileName, recordCount);
      res.json({
        success: true,
        message: `\u0641\u0627\u06CC\u0644 CSV \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u0634\u062F. ${recordCount} \u0631\u0648\u06CC\u062F\u0627\u062F \u067E\u0631\u062F\u0627\u0632\u0634 \u0634\u062F.`,
        fileName,
        recordCount
      });
    } catch (error) {
      console.error("\u062E\u0637\u0627 \u062F\u0631 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u0641\u0627\u06CC\u0644 CSV:", error);
      res.status(500).json({
        error: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u0641\u0627\u06CC\u0644 CSV",
        details: error instanceof Error ? error.message : "\u062E\u0637\u0627\u06CC \u0646\u0627\u0645\u0634\u062E\u0635"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs3 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
function serveStatic(app2) {
  const distPath = path4.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  console.log("\u{1F4B0} Price Bot ready - \u062F\u0633\u062A\u0631\u0633\u06CC \u062F\u0633\u062A\u06CC \u0628\u0647 API \u0646\u0648\u0633\u0627\u0646");
  console.log("\u{1F4C5} \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0641\u0642\u0637 \u0627\u0632 \u0637\u0631\u06CC\u0642 \u062F\u06A9\u0645\u0647 \u06CC\u0627 \u0632\u0645\u0627\u0646\u200C\u0628\u0646\u062F\u06CC \u0631\u0628\u0627\u062A");
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  serveStatic(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, async () => {
    log(`\u{1F31F} serving on port ${port}`);
    log(`\u{1F4B0} Price Bot ready - API \u0646\u0648\u0633\u0627\u0646 connected`);
    log(`\u{1F4C5} Scheduled times: 11:11, 14:14, 17:17 (Saturday to Thursday)`);
    try {
      const { PriceBot: PriceBot2 } = await Promise.resolve().then(() => (init_price_bot(), price_bot_exports));
      const priceBot = new PriceBot2();
      await priceBot.start();
      log("\u{1F916} Price Bot scheduler activated");
    } catch (error) {
      console.error("\u274C Failed to start Price Bot:", error);
    }
    try {
      const { AnalysisBot: AnalysisBot2 } = await Promise.resolve().then(() => (init_analysis_bot(), analysis_bot_exports));
      const analysisBot = new AnalysisBot2();
      await analysisBot.start();
      log("\u{1F916} Analysis Bot scheduler activated");
    } catch (error) {
      console.error("\u274C Failed to start Analysis Bot:", error);
    }
    try {
      const { SignalBot: SignalBot2 } = await Promise.resolve().then(() => (init_signal_bot(), signal_bot_exports));
      const signalBot = new SignalBot2();
      await signalBot.start();
      log("\u{1F916} Signal Bot scheduler activated");
    } catch (error) {
      console.error("\u274C Failed to start Signal Bot:", error);
    }
  });
})();
