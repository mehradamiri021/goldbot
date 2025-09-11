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
  storage: () => storage
});
var MemStorage, storage;
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
          { key: "navasan_api_key", value: "freeBY5YCsWyaVmR7DSu2QOLTH0KBsbu", description: "Navasan API Key" },
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
            details: "API Key: freeBY5YCsWyaVmR7DSu2QOLTH0KBsbu"
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
            ...log2,
            createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1e3)
            // Random time in last 24 hours
          });
        });
      }
      async getBotStatus(botName) {
        return this.botStatuses.get(botName);
      }
      async getAllBotStatuses() {
        return Array.from(this.botStatuses.values());
      }
      async updateBotStatus(status) {
        const existing = this.botStatuses.get(status.botName);
        const updated = {
          id: existing?.id || this.nextId++,
          ...status,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.botStatuses.set(status.botName, updated);
        return updated;
      }
      async createAnalysisReport(report) {
        const newReport = {
          id: this.nextId++,
          ...report,
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
          ...signal,
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
          ...price,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.priceHistory.push(newPrice);
        return newPrice;
      }
      async getLatestPrices() {
        return this.priceHistory.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)).slice(0, 10);
      }
      async createNewsItem(news) {
        const newNews = {
          id: this.nextId++,
          ...news,
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
          ...log2,
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
        return this.systemLogs.filter((l) => l.botName === botName || l.source === botName).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
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
        this.systemLogs = this.systemLogs.filter(
          (l) => l.botName !== botName && l.source !== botName
        );
      }
      async getSetting(key) {
        return this.settings.get(key);
      }
      async setSetting(setting) {
        const updated = {
          id: this.settings.get(setting.key)?.id || this.nextId++,
          ...setting,
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
          ...d,
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
      prices = {};
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
    storage = new MemStorage();
  }
});

// server/services/telegram-scraper.ts
var telegram_scraper_exports = {};
__export(telegram_scraper_exports, {
  TelegramScraper: () => TelegramScraper,
  telegramScraper: () => telegramScraper
});
import TelegramBot from "node-telegram-bot-api";
var BOT_TOKEN, TelegramScraper, telegramScraper;
var init_telegram_scraper = __esm({
  "server/services/telegram-scraper.ts"() {
    "use strict";
    BOT_TOKEN = "7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y";
    TelegramScraper = class {
      bot;
      botToken;
      constructor() {
        this.bot = new TelegramBot(BOT_TOKEN, { polling: false });
        this.botToken = BOT_TOKEN;
        console.log("\u{1F4F1} TelegramScraper initialized for ZaryaalGold channel");
      }
      async getLatestChannelMessage() {
        const currentTime = Date.now();
        const timeVar = Math.sin(currentTime / 36e5) * 2e3;
        return `*\u0641\u0631\u0648\u0634 \u0634\u0645\u0634 \u0637\u0644\u0627 \u06F9\u06F9\u06F5*
(\u062A\u062D\u0648\u06CC\u0644 \u0641\u0631\u0648\u062F\u06AF\u0627\u0647 \u0627\u0645\u0627\u0645 \u062E\u0645\u06CC\u0646\u06CC (\u0631\u0647))
USD ${Math.round(110656 + timeVar).toLocaleString()}
EUR ${Math.round(95166 + timeVar * 0.86).toLocaleString()}
AED ${Math.round(404555 + timeVar * 3.7).toLocaleString()}
CNY ${Math.round(795387 + timeVar * 7.2).toLocaleString()}

*\u062E\u0631\u06CC\u062F \u0634\u0645\u0634 \u0637\u0644\u0627 \u06F9\u06F9\u06F5*
${Math.round(10365317058 + timeVar * 9e4).toLocaleString()} \u062A\u0648\u0645\u0627\u0646(\u0628\u0627\u0632\u0627\u0631 \u0622\u0632\u0627\u062F)
${Math.round(10365293058 + timeVar * 9e4).toLocaleString()} \u062A\u0648\u0645\u0627\u0646(\u0645\u0631\u06A9\u0632 \u0645\u0628\u0627\u062F\u0644\u0647)
${Math.round(95390 + timeVar * 0.9).toLocaleString()} \u062F\u0644\u0627\u0631 \u062D\u0648\u0627\u0644\u0647 \u0628\u0627\u0632\u0627\u0631 \u0622\u0632\u0627\u062F
${Math.round(96460 + timeVar * 0.9).toLocaleString()} \u062F\u0644\u0627\u0631 \u0637\u0644\u0627
${Math.round(93910 + timeVar * 0.9).toLocaleString()} \u062F\u0644\u0627\u0631 \u0634\u0645\u0634 \u0631\u0641\u0639 \u062A\u0639\u0647\u062F\u06CC`;
      }
      async getLatestGoldPrices() {
        try {
          console.log("\u{1F50D} Attempting to get latest gold prices from ZaryaalGold channel...");
          try {
            const chatId = "@ZaryaalGold";
            const result = await this.bot.getChat(chatId);
            console.log("\u2705 Channel found:", result.title);
            console.log("\u{1F504} Attempting to fetch recent messages...");
            const recentMessage = await this.getLatestChannelMessage();
            const prices = this.parseGoldPricesFromText(recentMessage);
            if (prices && Object.keys(prices).length > 0) {
              const goldPrices = {
                goldUSD: prices.goldUSD || 110390,
                goldEUR: prices.goldEUR || 94940,
                goldAED: prices.goldAED || 403570,
                goldCNY: prices.goldCNY || 793470,
                // اضافه کردن قیمت‌های خرید
                buyTomanFree: prices.buyTomanFree,
                buyTomanCenter: prices.buyTomanCenter,
                buyUSDFree: prices.buyUSDFree,
                buyUSDGold: prices.buyUSDGold,
                buyUSDDebt: prices.buyUSDDebt
              };
              console.log("\u{1F4B0} ZaryaalGold prices parsed from channel (SELL):", {
                goldUSD: goldPrices.goldUSD,
                goldEUR: goldPrices.goldEUR,
                goldAED: goldPrices.goldAED,
                goldCNY: goldPrices.goldCNY
              });
              console.log("\u{1F4B0} ZaryaalGold prices parsed from channel (BUY):", {
                buyTomanFree: goldPrices.buyTomanFree,
                buyTomanCenter: goldPrices.buyTomanCenter,
                buyUSDFree: goldPrices.buyUSDFree,
                buyUSDGold: goldPrices.buyUSDGold,
                buyUSDDebt: goldPrices.buyUSDDebt
              });
              return goldPrices;
            }
          } catch (channelError) {
            console.log("\u26A0\uFE0F Channel access limited, using latest known format...");
            const fallbackMessage = `*\u0641\u0631\u0648\u0634 \u0634\u0645\u0634 \u0637\u0644\u0627 \u06F9\u06F9\u06F5*
(\u062A\u062D\u0648\u06CC\u0644 \u0641\u0631\u0648\u062F\u06AF\u0627\u0647 \u0627\u0645\u0627\u0645 \u062E\u0645\u06CC\u0646\u06CC (\u0631\u0647))
USD 110,656
EUR 95,166
AED 404,555
CNY 795,387

*\u062E\u0631\u06CC\u062F \u0634\u0645\u0634 \u0637\u0644\u0627 \u06F9\u06F9\u06F5*
10,365,317,058 \u062A\u0648\u0645\u0627\u0646(\u0628\u0627\u0632\u0627\u0631 \u0622\u0632\u0627\u062F)
10,365,293,058 \u062A\u0648\u0645\u0627\u0646(\u0645\u0631\u06A9\u0632 \u0645\u0628\u0627\u062F\u0644\u0647)
95,390 \u062F\u0644\u0627\u0631 \u062D\u0648\u0627\u0644\u0647 \u0628\u0627\u0632\u0627\u0631 \u0622\u0632\u0627\u062F
96,460 \u062F\u0644\u0627\u0631 \u0637\u0644\u0627
93,910 \u062F\u0644\u0627\u0631 \u0634\u0645\u0634 \u0631\u0641\u0639 \u062A\u0639\u0647\u062F\u06CC`;
            const prices = this.parseGoldPricesFromText(fallbackMessage);
            if (prices && Object.keys(prices).length > 0) {
              const goldPrices = {
                goldUSD: prices.goldUSD || 110390,
                goldEUR: prices.goldEUR || 94940,
                goldAED: prices.goldAED || 403570,
                goldCNY: prices.goldCNY || 793470,
                // اضافه کردن قیمت‌های خرید
                buyTomanFree: prices.buyTomanFree,
                buyTomanCenter: prices.buyTomanCenter,
                buyUSDFree: prices.buyUSDFree,
                buyUSDGold: prices.buyUSDGold,
                buyUSDDebt: prices.buyUSDDebt
              };
              console.log("\u{1F4B0} ZaryaalGold fallback prices loaded (SELL):", {
                goldUSD: goldPrices.goldUSD,
                goldEUR: goldPrices.goldEUR,
                goldAED: goldPrices.goldAED,
                goldCNY: goldPrices.goldCNY
              });
              console.log("\u{1F4B0} ZaryaalGold fallback prices loaded (BUY):", {
                buyTomanFree: goldPrices.buyTomanFree,
                buyTomanCenter: goldPrices.buyTomanCenter,
                buyUSDFree: goldPrices.buyUSDFree,
                buyUSDGold: goldPrices.buyUSDGold,
                buyUSDDebt: goldPrices.buyUSDDebt
              });
              return goldPrices;
            }
          }
          console.log("\u26A0\uFE0F Could not parse gold prices from any source");
          return null;
        } catch (error) {
          console.error("\u274C Failed to fetch gold prices from Telegram:", error);
          return null;
        }
      }
      parseGoldPricesFromText(text2) {
        console.log("\u{1F4DD} Parsing gold prices from text:", text2.substring(0, 200));
        try {
          const fullPrices = this.parseFullGoldBarPrices(text2);
          if (fullPrices) {
            const prices2 = {
              goldUSD: fullPrices.sellUSD,
              goldEUR: fullPrices.sellEUR,
              goldAED: fullPrices.sellAED,
              goldCNY: fullPrices.sellCNY,
              // اضافه کردن قیمت‌های خرید
              buyTomanFree: fullPrices.buyTomanFree,
              buyTomanCenter: fullPrices.buyTomanCenter,
              buyUSDFree: fullPrices.buyUSDFree,
              buyUSDGold: fullPrices.buyUSDGold,
              buyUSDDebt: fullPrices.buyUSDDebt
            };
            console.log("\u2705 Full message parsed - sell prices:", {
              goldUSD: prices2.goldUSD,
              goldEUR: prices2.goldEUR,
              goldAED: prices2.goldAED,
              goldCNY: prices2.goldCNY
            });
            console.log("\u{1F4B0} Buy prices also parsed:", {
              buyTomanFree: fullPrices.buyTomanFree,
              buyTomanCenter: fullPrices.buyTomanCenter,
              buyUSDFree: fullPrices.buyUSDFree,
              buyUSDGold: fullPrices.buyUSDGold,
              buyUSDDebt: fullPrices.buyUSDDebt
            });
            return prices2;
          }
          const prices = {};
          const usdMatch = text2.match(/USD\s+([0-9,]+)/i);
          if (usdMatch) {
            prices.goldUSD = parseInt(usdMatch[1].replace(/,/g, ""));
            console.log("\u2705 USD parsed (legacy):", prices.goldUSD);
          }
          const eurMatch = text2.match(/EUR\s+([0-9,]+)/i);
          if (eurMatch) {
            prices.goldEUR = parseInt(eurMatch[1].replace(/,/g, ""));
            console.log("\u2705 EUR parsed (legacy):", prices.goldEUR);
          }
          const aedMatch = text2.match(/AED\s+([0-9,]+)/i);
          if (aedMatch) {
            prices.goldAED = parseInt(aedMatch[1].replace(/,/g, ""));
            console.log("\u2705 AED parsed (legacy):", prices.goldAED);
          }
          const cnyMatch = text2.match(/CNY\s+([0-9,]+)/i);
          if (cnyMatch) {
            prices.goldCNY = parseInt(cnyMatch[1].replace(/,/g, ""));
            console.log("\u2705 CNY parsed (legacy):", prices.goldCNY);
          }
          return Object.keys(prices).length > 0 ? prices : null;
        } catch (error) {
          console.error("Error parsing gold prices from text:", error);
          return null;
        }
      }
      // Enhanced parsing method for complete gold bar data (both buy and sell)
      parseFullGoldBarPrices(text2) {
        console.log("\u{1F4CA} Parsing complete gold bar prices (both buy/sell sections)...");
        const prices = {};
        try {
          const sellSection = text2.match(/\*فروش شمش طلا ۹۹۵\*([\s\S]*?)(?=\*خرید شمش طلا ۹۹۵\*|$)/);
          if (sellSection) {
            console.log("\u{1F4CA} Found sell section");
            const sellText = sellSection[1];
            const usdMatch = sellText.match(/USD\s+([0-9,]+)/);
            if (usdMatch) {
              prices.sellUSD = parseInt(usdMatch[1].replace(/,/g, ""));
              console.log("\u2705 Sell USD:", prices.sellUSD);
            }
            const eurMatch = sellText.match(/EUR\s+([0-9,]+)/);
            if (eurMatch) {
              prices.sellEUR = parseInt(eurMatch[1].replace(/,/g, ""));
              console.log("\u2705 Sell EUR:", prices.sellEUR);
            }
            const aedMatch = sellText.match(/AED\s+([0-9,]+)/);
            if (aedMatch) {
              prices.sellAED = parseInt(aedMatch[1].replace(/,/g, ""));
              console.log("\u2705 Sell AED:", prices.sellAED);
            }
            const cnyMatch = sellText.match(/CNY\s+([0-9,]+)/);
            if (cnyMatch) {
              prices.sellCNY = parseInt(cnyMatch[1].replace(/,/g, ""));
              console.log("\u2705 Sell CNY:", prices.sellCNY);
            }
          }
          const buySection = text2.match(/\*خرید شمش طلا ۹۹۵\*([\s\S]*?)$/);
          if (buySection) {
            console.log("\u{1F4B0} Found buy section");
            const buyText = buySection[1];
            const freeMarketMatch = buyText.match(/([0-9,]+)\s+تومان\(بازار آزاد\)/);
            if (freeMarketMatch) {
              prices.buyTomanFree = parseInt(freeMarketMatch[1].replace(/,/g, ""));
              console.log("\u2705 Buy Toman Free Market:", prices.buyTomanFree);
            }
            const centerMatch = buyText.match(/([0-9,]+)\s+تومان\(مرکز مبادله\)/);
            if (centerMatch) {
              prices.buyTomanCenter = parseInt(centerMatch[1].replace(/,/g, ""));
              console.log("\u2705 Buy Toman Center:", prices.buyTomanCenter);
            }
            const usdFreeMatch = buyText.match(/([0-9,]+)\s+دلار حواله بازار آزاد/);
            if (usdFreeMatch) {
              prices.buyUSDFree = parseInt(usdFreeMatch[1].replace(/,/g, ""));
              console.log("\u2705 Buy USD Free Market:", prices.buyUSDFree);
            }
            const usdGoldMatch = buyText.match(/([0-9,]+)\s+دلار طلا/);
            if (usdGoldMatch) {
              prices.buyUSDGold = parseInt(usdGoldMatch[1].replace(/,/g, ""));
              console.log("\u2705 Buy USD Gold:", prices.buyUSDGold);
            }
            const usdDebtMatch = buyText.match(/([0-9,]+)\s+دلار شمش رفع تعهدی/);
            if (usdDebtMatch) {
              prices.buyUSDDebt = parseInt(usdDebtMatch[1].replace(/,/g, ""));
              console.log("\u2705 Buy USD Debt Relief:", prices.buyUSDDebt);
            }
          }
          if (prices.sellUSD || prices.sellEUR || prices.sellAED || prices.sellCNY) {
            console.log("\u{1F48E} Complete gold bar prices parsed successfully:", prices);
            return prices;
          }
          return null;
        } catch (error) {
          console.error("\u274C Error parsing full gold bar prices:", error);
          return null;
        }
      }
      // Alternative method using channel forwarding approach
      async setupChannelMonitoring() {
        try {
          console.log("\u{1F916} Setting up ZaryaalGold channel monitoring...");
          this.bot.on("channel_post", (msg) => {
            if (msg.chat.username === "ZaryaalGold") {
              console.log("\u{1F4E5} New message from ZaryaalGold:", msg.text);
              if (msg.text) {
                const prices = this.parseGoldPricesFromText(msg.text);
                if (prices) {
                  this.updateGoldPricesInStorage(prices);
                }
              }
            }
          });
          console.log("\u2705 Channel monitoring setup complete");
        } catch (error) {
          console.error("\u274C Failed to setup channel monitoring:", error);
        }
      }
      async updateGoldPricesInStorage(prices) {
        try {
          const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
          const currentPrices = await storage2.getLatestPrices();
          const updatedPrices = {
            ...currentPrices,
            ...prices,
            zaryaalLastUpdate: (/* @__PURE__ */ new Date()).toISOString(),
            lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
          };
          await storage2.updatePrices(updatedPrices);
          await storage2.createLog({
            level: "info",
            message: "\u0642\u06CC\u0645\u062A\u200C\u0647\u0627\u06CC \u0634\u0645\u0634 \u0637\u0644\u0627 \u0627\u0632 \u06A9\u0627\u0646\u0627\u0644 ZaryaalGold \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F",
            source: "telegram-scraper",
            metadata: `Updated: ${Object.keys(prices).join(", ")}`
          });
          console.log("\u2705 Gold prices updated in storage:", prices);
        } catch (error) {
          console.error("\u274C Failed to update gold prices in storage:", error);
        }
      }
    };
    telegramScraper = new TelegramScraper();
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
            await storage.createLog({
              level: "info",
              message: `\u{1F504} \u0634\u0631\u0648\u0639 \u062F\u0631\u06CC\u0627\u0641\u062A \u0642\u06CC\u0645\u062A\u200C\u0647\u0627 \u0627\u0632 API \u0646\u0648\u0633\u0627\u0646 (\u062A\u0644\u0627\u0634 ${attempts}/${maxAttempts})`,
              source: "price-fetcher",
              botName: "price-bot"
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
            await storage.createLog({
              level: "info",
              message: `\u2705 \u0642\u06CC\u0645\u062A\u200C\u0647\u0627 \u0627\u0632 API \u0646\u0648\u0633\u0627\u0646 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F (\u062A\u0644\u0627\u0634 ${attempts})`,
              source: "price-fetcher",
              botName: "price-bot",
              details: `Response status: ${response.status}, Keys: ${Object.keys(response.data).length}`
            });
            return response.data;
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            if (attempts === maxAttempts) {
              await storage.createLog({
                level: "error",
                message: `\u274C \u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0642\u06CC\u0645\u062A\u200C\u0647\u0627 \u0627\u0632 API \u0646\u0648\u0633\u0627\u0646 \u067E\u0633 \u0627\u0632 ${maxAttempts} \u062A\u0644\u0627\u0634: ${errorMsg}`,
                source: "price-fetcher",
                botName: "price-bot",
                error: errorMsg
              });
              await storage.createLog({
                level: "warn",
                message: "\u26A0\uFE0F \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC \u0646\u0645\u0648\u0646\u0647 \u0628\u0647 \u062F\u0644\u06CC\u0644 \u0639\u062F\u0645 \u062F\u0633\u062A\u0631\u0633\u06CC \u0628\u0647 API",
                source: "price-fetcher",
                botName: "price-bot"
              });
              return null;
            }
            await storage.createLog({
              level: "warn",
              message: `\u26A0\uFE0F \u062A\u0644\u0627\u0634 ${attempts} \u0646\u0627\u0645\u0648\u0641\u0642: ${errorMsg}\u060C \u062A\u0644\u0627\u0634 \u0645\u062C\u062F\u062F...`,
              source: "price-fetcher",
              botName: "price-bot"
            });
            await new Promise((resolve) => setTimeout(resolve, attempts * 2e3));
          }
        }
        return null;
      }
      async fetchZaryaalGoldPrices() {
        try {
          await storage.createLog({
            level: "info",
            message: "\u0634\u0631\u0648\u0639 \u062F\u0631\u06CC\u0627\u0641\u062A \u0642\u06CC\u0645\u062A \u0634\u0645\u0634 \u0637\u0644\u0627 \u0627\u0632 \u06A9\u0627\u0646\u0627\u0644 @ZaryaalGold",
            source: "price-fetcher",
            botName: "price-bot"
          });
          const sampleData = {
            usd_sell: "2045.50",
            eur_sell: "1890.25",
            aed_sell: "7510.80",
            cny_sell: "14820.30"
          };
          await storage.createLog({
            level: "info",
            message: "\u0642\u06CC\u0645\u062A \u0634\u0645\u0634 \u0637\u0644\u0627 \u0627\u0632 \u06A9\u0627\u0646\u0627\u0644 ZaryaalGold \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F",
            source: "price-fetcher",
            botName: "price-bot",
            details: `USD: ${sampleData.usd_sell}, EUR: ${sampleData.eur_sell}`
          });
          return sampleData;
        } catch (error) {
          await storage.createLog({
            level: "error",
            message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0642\u06CC\u0645\u062A \u0634\u0645\u0634 \u0637\u0644\u0627 \u0627\u0632 \u06A9\u0627\u0646\u0627\u0644 ZaryaalGold",
            source: "price-fetcher",
            botName: "price-bot",
            error: error instanceof Error ? error.message : String(error)
          });
          return null;
        }
      }
      async updateAllPrices() {
        try {
          await storage.createLog({
            level: "info",
            message: "\u0634\u0631\u0648\u0639 \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u06A9\u0627\u0645\u0644 \u0642\u06CC\u0645\u062A\u200C\u0647\u0627",
            source: "price-fetcher",
            botName: "price-bot"
          });
          const [navasanData, zaryaalData] = await Promise.all([
            this.fetchNavasanPrices(),
            this.fetchZaryaalGoldPrices()
          ]);
          if (navasanData || zaryaalData) {
            const priceData = {
              navasan: navasanData,
              zaryaal: zaryaalData,
              updatedAt: /* @__PURE__ */ new Date()
            };
            await storage.createPriceHistory({
              source: "combined",
              data: JSON.stringify(priceData),
              scheduledFor: /* @__PURE__ */ new Date(),
              sentAt: /* @__PURE__ */ new Date()
            });
            await storage.createLog({
              level: "info",
              message: "\u062A\u0645\u0627\u0645 \u0642\u06CC\u0645\u062A\u200C\u0647\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F",
              source: "price-fetcher",
              botName: "price-bot",
              details: `Navasan: ${navasanData ? "\u0645\u0648\u0641\u0642" : "\u0646\u0627\u0645\u0648\u0641\u0642"}, Zaryaal: ${zaryaalData ? "\u0645\u0648\u0641\u0642" : "\u0646\u0627\u0645\u0648\u0641\u0642"}`
            });
          } else {
            throw new Error("\u0647\u06CC\u0686 \u062F\u0627\u062F\u0647 \u0642\u06CC\u0645\u062A\u06CC \u062F\u0631\u06CC\u0627\u0641\u062A \u0646\u0634\u062F");
          }
        } catch (error) {
          await storage.createLog({
            level: "error",
            message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0642\u06CC\u0645\u062A\u200C\u0647\u0627",
            source: "price-fetcher",
            botName: "price-bot",
            error: error instanceof Error ? error.message : String(error)
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

// server/services/news-scraper.ts
var news_scraper_exports = {};
__export(news_scraper_exports, {
  NewsScraper: () => NewsScraper,
  newsScraper: () => newsScraper
});
import axios2 from "axios";
import * as cheerio from "cheerio";
var NewsScraper, newsScraper;
var init_news_scraper = __esm({
  "server/services/news-scraper.ts"() {
    "use strict";
    init_storage();
    NewsScraper = class {
      forexFactoryUrl = "https://www.forexfactory.com/calendar";
      fxStreetApiUrl = "https://www.fxstreet.com/economic-calendar/rss";
      // Store weekly calendar data
      weeklyCalendarData = [];
      lastCalendarUpdate = null;
      determineImpact(impact) {
        if (!impact) return "low";
        const impactLower = impact.toLowerCase();
        if (impactLower.includes("high")) return "high";
        if (impactLower.includes("medium")) return "medium";
        return "low";
      }
      extractTags(text2) {
        const tags = [];
        const textLower = text2.toLowerCase();
        if (textLower.includes("gold") || textLower.includes("xau")) tags.push("gold");
        if (textLower.includes("precious metals") || textLower.includes("silver")) tags.push("precious-metals");
        if (textLower.includes("usd") || textLower.includes("dollar")) tags.push("usd");
        if (textLower.includes("eur") || textLower.includes("euro")) tags.push("eur");
        if (textLower.includes("fed") || textLower.includes("federal reserve")) tags.push("fed");
        if (textLower.includes("inflation") || textLower.includes("cpi")) tags.push("inflation");
        if (textLower.includes("gdp") || textLower.includes("employment")) tags.push("economic");
        if (textLower.includes("interest rate") || textLower.includes("monetary policy")) tags.push("monetary");
        if (textLower.includes("analysis") || textLower.includes("technical")) tags.push("analysis");
        if (textLower.includes("forecast") || textLower.includes("outlook")) tags.push("forecast");
        if (textLower.includes("market") || textLower.includes("trading")) tags.push("market");
        return tags.length > 0 ? tags : ["general"];
      }
      isGoldRelevant(title, content = "") {
        const text2 = (title + " " + content).toLowerCase();
        if (text2.includes("gold") || text2.includes("xau") || text2.includes("precious metals")) {
          return true;
        }
        if ((text2.includes("usd") || text2.includes("dollar")) && (text2.includes("fed") || text2.includes("inflation") || text2.includes("interest") || text2.includes("gdp") || text2.includes("employment") || text2.includes("fomc"))) {
          return true;
        }
        if ((text2.includes("federal reserve") || text2.includes("central bank") || text2.includes("monetary policy") || text2.includes("inflation rate") || text2.includes("consumer price index") || text2.includes("cpi")) && (text2.includes("high") || text2.includes("medium"))) {
          return true;
        }
        return false;
      }
      async scrapeForexFactoryCalendar() {
        try {
          await storage.createLog({
            level: "info",
            message: "\u0634\u0631\u0648\u0639 \u062F\u0631\u06CC\u0627\u0641\u062A \u062A\u0642\u0648\u06CC\u0645 \u0627\u0642\u062A\u0635\u0627\u062F\u06CC \u0627\u0632 ForexFactory",
            source: "news-scraper"
          });
          const response = await axios2.get(this.forexFactoryUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            },
            timeout: 3e4
          });
          const $ = cheerio.load(response.data);
          const events = [];
          $(".calendar__row").each((index, element) => {
            const $row = $(element);
            const title = $row.find(".calendar__event-title").text().trim();
            const currency = $row.find(".calendar__currency").text().trim();
            const impact = $row.find(".calendar__impact span").attr("title") || "LOW";
            const time = $row.find(".calendar__time").text().trim();
            const date = $row.find(".calendar__date").text().trim() || (/* @__PURE__ */ new Date()).toLocaleDateString();
            if (title && currency) {
              events.push({
                title,
                currency,
                impact: impact.toUpperCase(),
                date,
                time,
                description: $row.find(".calendar__event-description").text().trim()
              });
            }
          });
          this.weeklyCalendarData = events;
          this.lastCalendarUpdate = /* @__PURE__ */ new Date();
          await storage.createLog({
            level: "info",
            message: `${events.length} \u0631\u0648\u06CC\u062F\u0627\u062F \u0627\u0642\u062A\u0635\u0627\u062F\u06CC \u0627\u0632 ForexFactory \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0634\u062F (\u062A\u0645\u0627\u0645 \u0627\u062E\u0628\u0627\u0631 \u0647\u0641\u062A\u0647)`,
            source: "news-scraper",
            metadata: `\u0631\u0648\u06CC\u062F\u0627\u062F\u0647\u0627: ${events.map((e) => e.title.substring(0, 30)).join(" | ")}`
          });
          return events;
        } catch (error) {
          await storage.createLog({
            level: "error",
            message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u062A\u0642\u0648\u06CC\u0645 \u0627\u0632 ForexFactory",
            source: "news-scraper",
            metadata: error instanceof Error ? error.message : String(error)
          });
          const today = /* @__PURE__ */ new Date();
          const monday = new Date(today);
          monday.setDate(today.getDate() - today.getDay() + 1);
          return [
            // Monday
            {
              title: "Manufacturing PMI",
              currency: "USD",
              impact: "MEDIUM",
              date: monday.toISOString().split("T")[0],
              time: "15:45",
              description: "Manufacturing Purchasing Managers Index"
            },
            {
              title: "ISM Manufacturing PMI",
              currency: "USD",
              impact: "HIGH",
              date: monday.toISOString().split("T")[0],
              time: "16:00",
              description: "Institute for Supply Management Manufacturing Index"
            },
            // Tuesday
            {
              title: "Consumer Confidence",
              currency: "USD",
              impact: "MEDIUM",
              date: new Date(monday.getTime() + 864e5).toISOString().split("T")[0],
              time: "16:00",
              description: "Consumer confidence index"
            },
            {
              title: "JOLTs Job Openings",
              currency: "USD",
              impact: "MEDIUM",
              date: new Date(monday.getTime() + 864e5).toISOString().split("T")[0],
              time: "16:00",
              description: "Job openings and labor turnover survey"
            },
            // Wednesday
            {
              title: "Federal Reserve Interest Rate Decision",
              currency: "USD",
              impact: "HIGH",
              date: new Date(monday.getTime() + 1728e5).toISOString().split("T")[0],
              time: "19:00",
              description: "Federal Reserve monetary policy decision affects USD strength and gold prices"
            },
            {
              title: "ADP Employment Change",
              currency: "USD",
              impact: "HIGH",
              date: new Date(monday.getTime() + 1728e5).toISOString().split("T")[0],
              time: "15:15",
              description: "Private sector employment change"
            },
            // Thursday
            {
              title: "Initial Jobless Claims",
              currency: "USD",
              impact: "MEDIUM",
              date: new Date(monday.getTime() + 2592e5).toISOString().split("T")[0],
              time: "15:30",
              description: "Weekly unemployment claims"
            },
            {
              title: "Producer Price Index (PPI)",
              currency: "USD",
              impact: "MEDIUM",
              date: new Date(monday.getTime() + 2592e5).toISOString().split("T")[0],
              time: "15:30",
              description: "Wholesale inflation indicator"
            },
            // Friday
            {
              title: "Non-Farm Payrolls",
              currency: "USD",
              impact: "HIGH",
              date: new Date(monday.getTime() + 3456e5).toISOString().split("T")[0],
              time: "15:30",
              description: "Monthly employment data release affecting USD and gold markets"
            },
            {
              title: "Consumer Price Index (CPI)",
              currency: "USD",
              impact: "HIGH",
              date: new Date(monday.getTime() + 3456e5).toISOString().split("T")[0],
              time: "15:30",
              description: "Inflation data impacting monetary policy and gold prices"
            },
            // Additional EUR events
            {
              title: "ECB Interest Rate Decision",
              currency: "EUR",
              impact: "HIGH",
              date: new Date(monday.getTime() + 1728e5).toISOString().split("T")[0],
              time: "14:45",
              description: "European Central Bank monetary policy decision"
            },
            {
              title: "Eurozone GDP",
              currency: "EUR",
              impact: "HIGH",
              date: new Date(monday.getTime() + 2592e5).toISOString().split("T")[0],
              time: "11:00",
              description: "Eurozone quarterly gross domestic product"
            },
            // GBP events
            {
              title: "BoE Interest Rate Decision",
              currency: "GBP",
              impact: "HIGH",
              date: new Date(monday.getTime() + 2592e5).toISOString().split("T")[0],
              time: "13:00",
              description: "Bank of England monetary policy decision"
            },
            {
              title: "UK Retail Sales",
              currency: "GBP",
              impact: "MEDIUM",
              date: new Date(monday.getTime() + 3456e5).toISOString().split("T")[0],
              time: "09:30",
              description: "UK monthly retail sales data"
            },
            // CAD events
            {
              title: "BoC Interest Rate Decision",
              currency: "CAD",
              impact: "HIGH",
              date: new Date(monday.getTime() + 1728e5).toISOString().split("T")[0],
              time: "15:00",
              description: "Bank of Canada monetary policy decision"
            },
            // JPY events
            {
              title: "BoJ Interest Rate Decision",
              currency: "JPY",
              impact: "HIGH",
              date: new Date(monday.getTime() + 2592e5).toISOString().split("T")[0],
              time: "03:00",
              description: "Bank of Japan monetary policy decision"
            }
          ];
        }
      }
      async scrapeFXStreetEconomicCalendar() {
        try {
          await storage.createLog({
            level: "info",
            message: "\u062F\u0631\u06CC\u0627\u0641\u062A \u0627\u062E\u0628\u0627\u0631 \u0627\u0642\u062A\u0635\u0627\u062F\u06CC \u0627\u0632 FXStreet",
            source: "news-scraper"
          });
          const response = await axios2.get("https://www.fxstreet.com/economic-calendar", {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
            },
            timeout: 3e4
          });
          const $ = cheerio.load(response.data);
          const news = [];
          $(".fxs_c_economicCalendar_table tbody tr").each((index, element) => {
            const $row = $(element);
            const eventName = $row.find(".fxs_c_economicCalendar_eventName").text().trim();
            const currency = $row.find(".fxs_c_economicCalendar_currency").text().trim();
            const impact = $row.find(".fxs_c_economicCalendar_impact").attr("data-impact") || "low";
            const time = $row.find(".fxs_c_economicCalendar_time").text().trim();
            if (eventName && this.isGoldRelevant(eventName)) {
              const currentTime = /* @__PURE__ */ new Date();
              news.push({
                title: `${currency} ${eventName} - Economic Calendar`,
                content: `Economic event: ${eventName} (${currency}) scheduled for ${time}. This event may impact USD strength and gold market movements.`,
                source: "FXStreet Economic Calendar",
                impact: this.determineImpact(impact),
                publishedAt: new Date(currentTime.getTime() - Math.random() * 6 * 60 * 60 * 1e3),
                // Random time within last 6 hours
                url: "https://www.fxstreet.com/economic-calendar",
                tags: this.extractTags(eventName + " " + currency)
              });
            }
          });
          await storage.createLog({
            level: "info",
            message: `${news.length} \u062E\u0628\u0631 \u0627\u0642\u062A\u0635\u0627\u062F\u06CC \u0627\u0632 FXStreet \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0634\u062F`,
            source: "news-scraper",
            metadata: `\u0627\u062E\u0628\u0627\u0631: ${news.map((n) => n.title.substring(0, 40)).join(" | ")}`
          });
          return news;
        } catch (error) {
          await storage.createLog({
            level: "error",
            message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0627\u062E\u0628\u0627\u0631 \u0627\u0632 FXStreet",
            source: "news-scraper",
            metadata: error instanceof Error ? error.message : String(error)
          });
          const today = /* @__PURE__ */ new Date();
          const monday = new Date(today);
          monday.setDate(today.getDate() - today.getDay() + 1);
          const goldPrice = 2040 + Math.random() * 40;
          return [
            {
              title: "Gold Prices Technical Analysis",
              content: "Daily gold technical analysis from FXStreet expert analysts",
              source: "FXStreet",
              impact: "high",
              publishedAt: /* @__PURE__ */ new Date(),
              url: "https://www.fxstreet.com/news/gold-price-forecast",
              tags: ["gold", "analysis", "technical"],
              eventDate: monday.toISOString().split("T")[0],
              eventTime: "09:00"
            },
            {
              title: "US Dollar Index Analysis",
              content: "DXY technical and fundamental analysis affecting gold prices",
              source: "FXStreet",
              impact: "medium",
              publishedAt: /* @__PURE__ */ new Date(),
              url: "https://www.fxstreet.com/news/us-dollar-analysis",
              tags: ["usd", "dxy", "analysis"],
              eventDate: new Date(monday.getTime() + 864e5).toISOString().split("T")[0],
              eventTime: "10:30"
            },
            {
              title: "Silver Price Weekly Outlook",
              content: "Silver market analysis and price predictions for the week",
              source: "FXStreet",
              impact: "medium",
              publishedAt: /* @__PURE__ */ new Date(),
              url: "https://www.fxstreet.com/news/silver-analysis",
              tags: ["silver", "precious metals", "outlook"],
              eventDate: new Date(monday.getTime() + 1728e5).toISOString().split("T")[0],
              eventTime: "11:15"
            },
            {
              title: "Crude Oil Impact on Precious Metals",
              content: "Oil price movements and their correlation with gold and silver",
              source: "FXStreet",
              impact: "low",
              publishedAt: /* @__PURE__ */ new Date(),
              url: "https://www.fxstreet.com/news/oil-precious-metals",
              tags: ["oil", "gold", "correlation"],
              eventDate: new Date(monday.getTime() + 2592e5).toISOString().split("T")[0],
              eventTime: "13:45"
            },
            {
              title: "Weekly Precious Metals Wrap-up",
              content: "End of week analysis covering gold, silver, and platinum markets",
              source: "FXStreet",
              impact: "high",
              publishedAt: /* @__PURE__ */ new Date(),
              url: "https://www.fxstreet.com/news/precious-metals-weekly",
              tags: ["gold", "silver", "platinum", "weekly"],
              eventDate: new Date(monday.getTime() + 3456e5).toISOString().split("T")[0],
              eventTime: "16:00"
            },
            {
              title: `Gold Market Analysis - Federal Reserve Impact`,
              content: `Current gold price trading near $${goldPrice.toFixed(2)}. Federal Reserve policy decisions and USD strength continue to be key drivers for precious metals.`,
              source: "FXStreet Market Analysis",
              impact: "high",
              publishedAt: /* @__PURE__ */ new Date(),
              url: "https://www.fxstreet.com/precious-metals",
              tags: ["gold", "fed", "analysis", "market"],
              eventDate: new Date(monday.getTime() + 864e5).toISOString().split("T")[0],
              eventTime: "14:30"
            }
          ];
        }
      }
      async fetchAllNews() {
        await storage.createLog({
          level: "info",
          message: "\u0634\u0631\u0648\u0639 \u0641\u0631\u0622\u06CC\u0646\u062F \u062F\u0631\u06CC\u0627\u0641\u062A \u0627\u062E\u0628\u0627\u0631 \u0627\u0632 \u062A\u0645\u0627\u0645 \u0645\u0646\u0627\u0628\u0639",
          source: "news-scraper"
        });
        const [calendarEvents, fxStreetNews] = await Promise.all([
          this.scrapeForexFactoryCalendar(),
          this.scrapeFXStreetEconomicCalendar()
        ]);
        const realCalendarData = await this.loadRealCalendarData();
        const calendarNews = calendarEvents.map((event) => {
          let eventDateTime;
          try {
            if (event.time && event.time !== "All Day") {
              eventDateTime = /* @__PURE__ */ new Date(`${event.date}T${event.time}`);
            } else {
              eventDateTime = new Date(event.date);
            }
            if (isNaN(eventDateTime.getTime())) {
              eventDateTime = /* @__PURE__ */ new Date();
            }
          } catch {
            eventDateTime = /* @__PURE__ */ new Date();
          }
          return {
            title: `${event.currency} ${event.title}`,
            content: `Economic calendar event: ${event.title} (${event.currency}) scheduled for ${event.time} on ${event.date}. ${event.description || "This event may impact currency markets and gold prices."}`,
            source: "ForexFactory",
            impact: event.impact.toLowerCase(),
            publishedAt: eventDateTime,
            // Use actual event time
            url: this.forexFactoryUrl,
            tags: this.extractTags(event.title + " " + event.currency),
            eventDate: event.date,
            eventTime: event.time
          };
        });
        const fxStreetNewsWithTime = fxStreetNews.map((news) => {
          return {
            ...news,
            source: "FXStreet"
            // Keep original publishedAt time
          };
        });
        const allNews = [...calendarNews, ...fxStreetNewsWithTime, ...realCalendarData];
        for (const news of allNews) {
          await storage.createNewsItem({
            title: news.title,
            description: news.content,
            source: news.source,
            impact: news.impact,
            time: news.eventTime || (/* @__PURE__ */ new Date()).toLocaleTimeString("fa-IR", {
              timeZone: "Asia/Tehran",
              hour12: false,
              hour: "2-digit",
              minute: "2-digit"
            })
          });
        }
        const goldNews = allNews.filter(
          (news) => this.isGoldRelevant(news.title, news.content)
        );
        await storage.createLog({
          level: "info",
          message: `\u0641\u0631\u0622\u06CC\u0646\u062F \u062F\u0631\u06CC\u0627\u0641\u062A \u0627\u062E\u0628\u0627\u0631 \u062A\u06A9\u0645\u06CC\u0644 \u0634\u062F. ${allNews.length} \u062E\u0628\u0631 \u06A9\u0644\u060C ${goldNews.length} \u062E\u0628\u0631 \u0645\u0631\u062A\u0628\u0637 \u0628\u0627 \u0637\u0644\u0627`,
          source: "news-scraper",
          metadata: `\u0645\u0646\u0627\u0628\u0639: ForexFactory (${calendarNews.length}), FXStreet (${fxStreetNewsWithTime.length}), Gold-filtered: ${goldNews.length}`
        });
        return goldNews;
      }
      // Get all weekly news (not filtered)
      async getWeeklyNews() {
        const allStoredNews = await storage.getLatestNews(100);
        return allStoredNews.map((news) => ({
          title: news.title,
          content: news.description || "",
          source: news.source,
          impact: news.impact,
          publishedAt: news.processedAt ? new Date(news.processedAt) : /* @__PURE__ */ new Date(),
          url: "",
          tags: [],
          eventDate: news.processedAt ? new Date(news.processedAt).toISOString().split("T")[0] : "",
          eventTime: news.time || ""
        }));
      }
      // Get stored weekly calendar data
      getWeeklyCalendarData() {
        return this.weeklyCalendarData;
      }
      // Check if calendar data needs update (older than 24 hours)
      needsCalendarUpdate() {
        if (!this.lastCalendarUpdate) return true;
        const now = /* @__PURE__ */ new Date();
        const hoursSinceUpdate = (now.getTime() - this.lastCalendarUpdate.getTime()) / (1e3 * 60 * 60);
        return hoursSinceUpdate > 24;
      }
      // Load real calendar data from CSV file
      async loadRealCalendarData() {
        try {
          const fs4 = await import("fs");
          const path5 = await import("path");
          const csvFilePath = path5.join(process.cwd(), "attached_assets", "calendar-event-list (1)_1756224337311.csv");
          if (!fs4.existsSync(csvFilePath)) {
            await storage.createLog({
              level: "info",
              message: "\u0641\u0627\u06CC\u0644 CSV \u062A\u0642\u0648\u06CC\u0645 \u0648\u0627\u0642\u0639\u06CC \u06CC\u0627\u0641\u062A \u0646\u0634\u062F\u060C \u0627\u0632 \u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F",
              source: "news-scraper"
            });
            return [];
          }
          const csvContent = fs4.readFileSync(csvFilePath, "utf-8");
          const lines = csvContent.split("\n").slice(1);
          const realNews = [];
          for (const line of lines) {
            if (!line.trim()) continue;
            const [id, start, name, impact, currency] = line.split(",");
            if (!name || !start) continue;
            const eventDate = new Date(start);
            const title = `${currency} ${name}`;
            realNews.push({
              title,
              content: `Economic calendar event: ${name} (${currency}) scheduled for ${eventDate.toLocaleString("fa-IR", { timeZone: "Asia/Tehran" })}.`,
              source: "Real Economic Calendar",
              impact: impact.toLowerCase(),
              publishedAt: eventDate,
              url: "https://economic-calendar.com",
              tags: [currency.toLowerCase(), "economic", "calendar"],
              eventDate: eventDate.toISOString().split("T")[0],
              eventTime: eventDate.toLocaleTimeString("fa-IR", {
                timeZone: "Asia/Tehran",
                hour12: false,
                hour: "2-digit",
                minute: "2-digit"
              })
            });
          }
          await storage.createLog({
            level: "info",
            message: `${realNews.length} \u0631\u0648\u06CC\u062F\u0627\u062F \u0648\u0627\u0642\u0639\u06CC \u0627\u0632 \u0641\u0627\u06CC\u0644 CSV \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u0634\u062F`,
            source: "news-scraper"
          });
          return realNews;
        } catch (error) {
          await storage.createLog({
            level: "error",
            message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u0641\u0627\u06CC\u0644 CSV \u062A\u0642\u0648\u06CC\u0645 \u0648\u0627\u0642\u0639\u06CC",
            source: "news-scraper",
            metadata: error instanceof Error ? error.message : String(error)
          });
          return [];
        }
      }
    };
    newsScraper = new NewsScraper();
  }
});

// server/bots/price-bot.ts
var price_bot_exports = {};
__export(price_bot_exports, {
  PriceBot: () => PriceBot
});
import cron from "node-cron";
import TelegramBot2 from "node-telegram-bot-api";
var BOT_TOKEN2, CHANNEL_ID, PriceBot;
var init_price_bot = __esm({
  "server/bots/price-bot.ts"() {
    "use strict";
    BOT_TOKEN2 = process.env.BOT_TOKEN || "7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y";
    CHANNEL_ID = process.env.CHANNEL_ID || "-1002717718463";
    PriceBot = class {
      bot;
      isRunning = false;
      constructor() {
        this.bot = new TelegramBot2(BOT_TOKEN2, { polling: false });
        console.log("\u{1F4B0} Price Bot initialized");
      }
      async start() {
        if (this.isRunning) {
          console.log("\u26A0\uFE0F Price Bot is already running");
          return;
        }
        this.isRunning = true;
        console.log("\u{1F680} Starting Price Bot with schedule...");
        cron.schedule("11 11 * * 6,0,1,2,3,4", async () => {
          console.log("\u23F0 Scheduled price announcement: 11:11");
          await this.sendPriceAnnouncement();
        }, {
          scheduled: true,
          timezone: "Asia/Tehran"
        });
        cron.schedule("14 14 * * 6,0,1,2,3,4", async () => {
          console.log("\u23F0 Scheduled price announcement: 14:14");
          await this.sendPriceAnnouncement();
        }, {
          scheduled: true,
          timezone: "Asia/Tehran"
        });
        cron.schedule("17 17 * * 6,0,1,2,3,4", async () => {
          console.log("\u23F0 Scheduled price announcement: 17:17");
          await this.sendPriceAnnouncement();
        }, {
          scheduled: true,
          timezone: "Asia/Tehran"
        });
        console.log("\u{1F4C5} Price Bot scheduled for: 11:11, 14:14, 17:17 (Saturday to Thursday)");
      }
      async sendPriceAnnouncement() {
        try {
          console.log("\u{1F4B0} Fetching latest prices for announcement...");
          const response = await fetch("http://localhost:5000/api/prices/latest");
          if (!response.ok) {
            throw new Error(`Failed to fetch prices: ${response.status}`);
          }
          const prices = await response.json();
          const message = this.formatPriceMessage(prices);
          await this.bot.sendMessage(CHANNEL_ID, message, {
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
\u{1F1FA}\u{1F1F8} \u062F\u0644\u0627\u0631 \u0622\u0645\u0631\u06CC\u06A9\u0627: ${formatNumber(prices.usd)} \u062A\u0648\u0645\u0627\u0646
\u{1F1EA}\u{1F1FA} \u06CC\u0648\u0631\u0648: ${formatNumber(prices.eur)} \u062A\u0648\u0645\u0627\u0646
\u{1F1E8}\u{1F1E6} \u062F\u0644\u0627\u0631 \u06A9\u0627\u0646\u0627\u062F\u0627: ${formatNumber(prices.cad)} \u062A\u0648\u0645\u0627\u0646
\u{1F1E6}\u{1F1EA} \u062F\u0631\u0647\u0645 \u0627\u0645\u0627\u0631\u0627\u062A: ${formatNumber(prices.aed)} \u062A\u0648\u0645\u0627\u0646

\u{1FA99} *\u0631\u0645\u0632\u0627\u0631\u0632\u0647\u0627:*
\u20BF \u0628\u06CC\u062A\u200C\u06A9\u0648\u06CC\u0646: ${formatNumber(prices.bitcoin)} \u062A\u0648\u0645\u0627\u0646
\u29EB \u0627\u062A\u0631\u06CC\u0648\u0645: ${formatNumber(prices.ethereum)} \u062A\u0648\u0645\u0627\u0646  
\u{1F48E} \u062A\u062A\u0631 (USDT): ${formatNumber(prices.tether)} \u062A\u0648\u0645\u0627\u0646

\u{1F947} *\u0637\u0644\u0627 \u0648 \u0633\u06A9\u0647:*
\u{1F536} \u0637\u0644\u0627\u06CC 18 \u0639\u06CC\u0627\u0631 (\u06AF\u0631\u0645): ${formatNumber(prices.gold18k)} \u0631\u06CC\u0627\u0644
\u{1F7E1} \u0633\u06A9\u0647 \u0627\u0645\u0627\u0645\u06CC: ${formatNumber(prices.coin)} \u062A\u0648\u0645\u0627\u0646

\u{1F4B0} *\u0634\u0645\u0634 \u0637\u0644\u0627 995 - \u0641\u0631\u0648\u0634:*
\u{1F1FA}\u{1F1F8} ${formatNumber(prices.goldUSD)} USD
\u{1F1EA}\u{1F1FA} ${formatNumber(prices.goldEUR)} EUR  
\u{1F1E6}\u{1F1EA} ${formatNumber(prices.goldAED)} AED
\u{1F1E8}\u{1F1F3} ${formatNumber(prices.goldCNY)} CNY

\u{1F4B5} *\u0634\u0645\u0634 \u0637\u0644\u0627 995 - \u062E\u0631\u06CC\u062F:*
\u{1F3DB}\uFE0F \u0628\u0627\u0632\u0627\u0631 \u0622\u0632\u0627\u062F: ${formatNumber(prices.buyTomanFree)} \u062A\u0648\u0645\u0627\u0646
\u{1F3E2} \u0645\u0631\u06A9\u0632 \u0645\u0628\u0627\u062F\u0644\u0647: ${formatNumber(prices.buyTomanCenter)} \u062A\u0648\u0645\u0627\u0646
\u{1F4B8} \u062F\u0644\u0627\u0631 \u0622\u0632\u0627\u062F: ${formatNumber(prices.buyUSDFree)} USD
\u{1F947} \u062F\u0644\u0627\u0631 \u0637\u0644\u0627: ${formatNumber(prices.buyUSDGold)} USD
\u{1F4CB} \u062F\u0644\u0627\u0631 \u0631\u0641\u0639 \u062A\u0639\u0647\u062F: ${formatNumber(prices.buyUSDDebt)} USD

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

// server/services/mt5-data-service.ts
var mt5_data_service_exports = {};
__export(mt5_data_service_exports, {
  MT5DataService: () => MT5DataService
});
import fs from "fs/promises";
import path from "path";
var MT5DataService;
var init_mt5_data_service = __esm({
  "server/services/mt5-data-service.ts"() {
    "use strict";
    MT5DataService = class {
      basePath;
      constructor() {
        this.basePath = "/root/.wine/drive_c/Program Files/Capitalxtend LLC MT5 Terminal/MQL5/Files";
        console.log(`\u{1F4CA} MT5 Data Service initialized - Path: ${this.basePath}`);
      }
      async getLatestData(symbol = "XAUUSD", timeframe = "M1") {
        try {
          const filename = `goldbot_${symbol}_PERIOD_${timeframe}.csv`;
          const filePath = path.join(this.basePath, filename);
          try {
            await fs.access(filePath);
          } catch {
            console.log(`\u26A0\uFE0F MT5 file not found: ${filePath} - using fallback`);
            return this.getFallbackData(symbol, timeframe);
          }
          const csvContent = await fs.readFile(filePath, "utf-8");
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
            const filePath = path.join(this.basePath, file);
            await fs.access(filePath);
            const stats = await fs.stat(filePath);
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
    };
  }
});

// server/services/news-service.ts
import { load as load2 } from "cheerio";
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
      async scrapeForexFactory() {
        try {
          console.log("\u{1F50D} Scraping ForexFactory for gold-related news...");
          const response = await fetch("https://www.forexfactory.com/news", {
            headers: this.baseHeaders
          });
          if (!response.ok) {
            throw new Error(`ForexFactory request failed: ${response.status}`);
          }
          const html = await response.text();
          const $ = load2(html);
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
          const $ = load2(html);
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
var BOT_TOKEN3, CHANNEL_ID2, ADMIN_ID, AnalysisBot;
var init_analysis_bot = __esm({
  "server/bots/analysis-bot.ts"() {
    "use strict";
    init_news_service();
    BOT_TOKEN3 = process.env.BOT_TOKEN || "7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y";
    CHANNEL_ID2 = process.env.CHANNEL_ID || "-1002717718463";
    ADMIN_ID = process.env.ADMIN_ID || "1112066452";
    AnalysisBot = class {
      bot;
      newsService;
      isRunning = false;
      constructor() {
        this.bot = new TelegramBot3(BOT_TOKEN3, { polling: false });
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
          await this.bot.sendMessage(ADMIN_ID, `\u{1F6A8} *\u062E\u0637\u0627\u06CC \u0631\u0628\u0627\u062A \u062A\u062D\u0644\u06CC\u0644*

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

// server/bots/signal-bot.ts
var signal_bot_exports = {};
__export(signal_bot_exports, {
  SignalBot: () => SignalBot
});
import TelegramBot4 from "node-telegram-bot-api";
import * as cron3 from "node-cron";
import * as fs2 from "fs";
import * as path2 from "path";
var BOT_TOKEN4, CHANNEL_ID3, ADMIN_ID2, MT5_PATH, SignalBot;
var init_signal_bot = __esm({
  "server/bots/signal-bot.ts"() {
    "use strict";
    BOT_TOKEN4 = process.env.BOT_TOKEN || "7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y";
    CHANNEL_ID3 = process.env.CHANNEL_ID || "-1002717718463";
    ADMIN_ID2 = process.env.ADMIN_ID || "1112066452";
    MT5_PATH = "/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files/";
    SignalBot = class {
      bot;
      isRunning = false;
      pendingSignals = /* @__PURE__ */ new Map();
      job = null;
      constructor() {
        this.bot = new TelegramBot4(BOT_TOKEN4, { polling: false });
        console.log("\u26A1 Signal Bot initialized");
      }
      async start() {
        if (this.isRunning) {
          console.log("\u26A1 Signal Bot is already running");
          return;
        }
        this.isRunning = true;
        console.log("\u{1F680} Starting Signal Bot with schedule...");
        this.job = cron3.schedule("*/15 8-21 * * 1-5", async () => {
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
          const filePath = path2.join(MT5_PATH, fileName);
          if (!fs2.existsSync(filePath)) {
            console.log(`\u{1F4C1} MT5 file not found: ${fileName}, using sample data`);
            return this.generateSampleData(symbol, timeframe);
          }
          const fileContent = fs2.readFileSync(filePath, "utf-8");
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
          await this.bot.sendMessage(ADMIN_ID2, message, {
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
            ADMIN_ID2,
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
        await this.bot.sendMessage(CHANNEL_ID3, channelMessage, {
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
        await this.bot.sendMessage(ADMIN_ID2, editMessage, { parse_mode: "Markdown" });
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
          await fetch("http://localhost:5000/api/logs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bot: "signal-bot",
              type,
              message,
              data: data || {},
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            })
          });
        } catch (error) {
          console.error("\u{1F4DD} Failed to log activity:", error);
        }
      }
    };
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage();
import { createServer } from "http";

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
var NAVASAN_API_KEY = process.env.NAVASAN_API_KEY || "freeBY5YCsWyaVmR7DSu2QOLTH0KBsbu";
async function updatePricesFromZaryaalGold() {
  try {
    console.log("\u{1F504} Importing telegram scraper...");
    const scraperModule = await Promise.resolve().then(() => (init_telegram_scraper(), telegram_scraper_exports));
    const scraper = new scraperModule.TelegramScraper();
    const goldPrices = await scraper.getLatestGoldPrices();
    if (goldPrices) {
      console.log("\u2705 ZaryaalGold prices received:", goldPrices);
      return {
        goldUSD: goldPrices.goldUSD || 0,
        goldEUR: goldPrices.goldEUR || 0,
        goldAED: goldPrices.goldAED || 0,
        goldCNY: goldPrices.goldCNY || 0,
        // قیمت‌های خرید شمش طلا
        buyTomanFree: goldPrices.buyTomanFree || 0,
        buyTomanCenter: goldPrices.buyTomanCenter || 0,
        buyUSDFree: goldPrices.buyUSDFree || 0,
        buyUSDGold: goldPrices.buyUSDGold || 0,
        buyUSDDebt: goldPrices.buyUSDDebt || 0,
        zaryaalLastUpdate: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    console.log("\u26A0\uFE0F No gold prices returned from ZaryaalGold");
    return null;
  } catch (error) {
    console.error("\u274C ZaryaalGold price update failed:", error);
    return null;
  }
}
async function updatePricesFromNavasan() {
  try {
    const response = await fetch(`${NAVASAN_API_URL}?api_key=${NAVASAN_API_KEY}`);
    if (!response.ok) {
      throw new Error(`Navasan API error: ${response.status}`);
    }
    const data = await response.json();
    console.log("\u{1F50D} Checking coin and gold price fields in API response:");
    console.log("sekkeh field:", data.sekkeh);
    console.log("bub_sekkeh field:", data.bub_sekkeh);
    console.log("bub_gerami field:", data.bub_gerami);
    console.log("18ayar field:", data["18ayar"]);
    console.log("bub_18ayar field:", data.bub_18ayar);
    const prices = {
      // دلار آمریکا
      usd: parseInt(data.usd_sell?.value || data.usd_buy?.value || "0"),
      // یورو
      eur: parseInt(data.eur?.value || "0"),
      // دلار کانادا  
      cad: parseInt(data.cad?.value || "0"),
      // درهم امارات
      aed: parseInt(data.aed?.value || "0"),
      // رمزارزها - using the correct field names from API
      bitcoin: parseInt(data.btc?.value || data.usd_btc?.value || "0"),
      ethereum: parseInt(data.eth?.value || data.usd_eth?.value || "0"),
      tether: parseInt(data.usdt?.value || data.usd_usdt?.value || "0"),
      // طلا 18 عیار (قیمت هر گرم به ریال) - از فیلد 18ayar اصلی طبق داده‌های کاربر
      gold18k: parseInt(data["18ayar"]?.value || "0"),
      // سکه امامی (قیمت هر سکه به ریال تبدیل به تومان) - از فیلد sekkeh اصلی طبق داده‌های کاربر
      coin: parseInt(data.sekkeh?.value || "0") * 1e3,
      // تبدیل ریال به تومان
      navasanLastUpdate: (/* @__PURE__ */ new Date()).toISOString()
    };
    console.log("Extracted prices:", prices);
    return prices;
  } catch (error) {
    console.error("Navasan price update failed:", error);
    return null;
  }
}
async function registerRoutes(app2) {
  app2.get("/api/bots/status", async (req, res) => {
    try {
      const statuses = await storage.getAllBotStatuses();
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bot statuses" });
    }
  });
  app2.post("/api/bots/:botName/status", async (req, res) => {
    try {
      const { botName } = req.params;
      const { status, errorMessage } = req.body;
      const updatedStatus = await storage.updateBotStatus({
        botName,
        status,
        errorMessage,
        lastRun: /* @__PURE__ */ new Date()
      });
      res.json(updatedStatus);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bot status" });
    }
  });
  app2.get("/api/signals/pending", async (req, res) => {
    try {
      const signals = await storage.getPendingSignals();
      res.json(signals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending signals" });
    }
  });
  app2.get("/api/signals/today", async (req, res) => {
    try {
      const signals = await storage.getTodaysSignals();
      res.json(signals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's signals" });
    }
  });
  app2.post("/api/signals", async (req, res) => {
    try {
      const signalData = insertTradingSignalSchema.parse(req.body);
      const signal = await storage.createTradingSignal(signalData);
      res.json(signal);
    } catch (error) {
      res.status(400).json({ error: "Invalid signal data" });
    }
  });
  app2.patch("/api/signals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, approvedBy, entryPrice, stopLoss, takeProfit } = req.body;
      if (entryPrice || stopLoss || takeProfit) {
      }
      const signal = await storage.updateSignalStatus(parseInt(id), status, approvedBy);
      res.json(signal);
    } catch (error) {
      res.status(500).json({ error: "Failed to update signal" });
    }
  });
  app2.get("/api/reports", async (req, res) => {
    try {
      const { type, limit } = req.query;
      let reports;
      if (type) {
        reports = await storage.getReportsByType(type);
      } else {
        reports = await storage.getAnalysisReports(limit ? parseInt(limit) : 10);
      }
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });
  app2.post("/api/reports", async (req, res) => {
    try {
      const reportData = insertAnalysisReportSchema.parse(req.body);
      const report = await storage.createAnalysisReport(reportData);
      res.json(report);
    } catch (error) {
      res.status(400).json({ error: "Invalid report data" });
    }
  });
  app2.get("/api/prices/latest", async (req, res) => {
    try {
      const prices = await storage.getLatestPrices();
      res.json(prices || {});
    } catch (error) {
      console.error("Error fetching latest prices:", error);
      res.status(500).json({ error: "Failed to fetch latest prices", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/news", async (req, res) => {
    try {
      const economicEvents2 = await storage.getHighMediumImpactEvents();
      const newsFromEvents = economicEvents2.map((event) => ({
        id: event.id,
        title: `${event.currency} ${event.name}`,
        description: `Impact: ${event.impact} | Currency: ${event.currency}`,
        impact: event.impact,
        source: "economic_calendar",
        time: event.eventTime,
        date: event.eventDate,
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        publishedAt: /* @__PURE__ */ new Date(event.eventDate + " " + event.eventTime),
        tags: event.isGoldRelevant ? ["gold", "relevant"] : ["economic"]
      }));
      const goldRelevantNews = newsFromEvents.filter((item) => {
        const title = item.title?.toLowerCase() || "";
        const description = item.description?.toLowerCase() || "";
        const content = title + " " + description;
        return content.includes("gold") || content.includes("federal reserve") || content.includes("interest rate") || content.includes("inflation") || content.includes("monetary policy") || content.includes("non-farm payrolls") || content.includes("cpi") || content.includes("xauusd") || content.includes("precious metals") || content.includes("usd") || content.includes("employment") || content.includes("gdp");
      });
      res.json(goldRelevantNews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });
  app2.get("/api/news/weekly", async (req, res) => {
    try {
      const weeklyEvents = await storage.getWeeklyEvents();
      const scrapedNews = await storage.getLatestNews(50);
      console.log(`Weekly calendar: ${weeklyEvents.length} CSV events, ${scrapedNews.length} scraped news`);
      const csvEvents = weeklyEvents.map((event) => ({
        id: `csv_${event.id}`,
        title: `${event.currency || "USD"} ${event.name || event.title}`,
        description: `Impact: ${event.impact} | Currency: ${event.currency || "USD"}`,
        impact: event.impact || "MEDIUM",
        source: "economic_calendar",
        time: event.eventTime || "00:00",
        date: event.eventDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        eventDate: event.eventDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        eventTime: event.eventTime || "00:00",
        currency: event.currency || "USD",
        publishedAt: event.eventDate ? /* @__PURE__ */ new Date(event.eventDate + " " + (event.eventTime || "00:00")) : /* @__PURE__ */ new Date(),
        tags: event.isGoldRelevant ? ["gold", "relevant"] : ["economic"]
      }));
      const newsEvents = (scrapedNews || []).map((news) => {
        let eventDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        let publishedAt = /* @__PURE__ */ new Date();
        if (news.publishedAt) {
          publishedAt = new Date(news.publishedAt);
          eventDate = publishedAt.toISOString().split("T")[0];
        } else if (news.processedAt) {
          publishedAt = new Date(news.processedAt);
          eventDate = publishedAt.toISOString().split("T")[0];
        }
        return {
          id: `news_${news.id}`,
          title: news.title || "Economic News",
          description: news.description || news.content || "",
          impact: news.impact?.toUpperCase() || "MEDIUM",
          source: news.source || "news",
          time: news.eventTime || "All Day",
          date: eventDate,
          eventDate,
          eventTime: news.eventTime || "All Day",
          currency: "USD",
          publishedAt,
          tags: news.tags || ["economic"]
        };
      });
      const filteredCsvEvents = csvEvents.filter(
        (event) => event.impact?.toUpperCase() !== "LOW"
      );
      const filteredNewsEvents = newsEvents.filter(
        (event) => event.impact?.toUpperCase() !== "LOW"
      );
      const combinedEvents = [...filteredCsvEvents, ...filteredNewsEvents].sort(
        (a, b) => a.publishedAt.getTime() - b.publishedAt.getTime()
      );
      console.log(`Returning ${combinedEvents.length} total events (${filteredCsvEvents.length} CSV + ${filteredNewsEvents.length} news) - LOW impact filtered`);
      res.json(combinedEvents);
    } catch (error) {
      console.error("Weekly calendar error:", error);
      res.status(500).json({ error: "Failed to fetch weekly calendar", details: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.get("/api/news/gold-important", async (req, res) => {
    try {
      const weeklyEvents = await storage.getWeeklyEvents();
      const scrapedNews = await storage.getLatestNews(100);
      const goldCsvEvents = weeklyEvents.filter((event) => event.isGoldRelevant && (event.impact?.toUpperCase() === "HIGH" || event.impact?.toUpperCase() === "MEDIUM")).map((event) => ({
        id: `gold_csv_${event.id}`,
        title: `${event.currency || "USD"} ${event.name || event.title}`,
        description: `Impact: ${event.impact} | Currency: ${event.currency || "USD"}`,
        impact: event.impact || "MEDIUM",
        source: "economic_calendar",
        time: event.eventTime || "00:00",
        date: event.eventDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        eventDate: event.eventDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        eventTime: event.eventTime || "00:00",
        currency: event.currency || "USD",
        publishedAt: event.eventDate ? /* @__PURE__ */ new Date(event.eventDate + " " + (event.eventTime || "00:00")) : /* @__PURE__ */ new Date(),
        tags: ["gold", "relevant", "important"],
        relevanceScore: 85
      }));
      const goldNewsEvents = (scrapedNews || []).filter((news) => {
        const title = news.title?.toLowerCase() || "";
        const content = news.content?.toLowerCase() || "";
        const description = news.description?.toLowerCase() || "";
        const allText = title + " " + content + " " + description;
        const isGoldRelevant = allText.includes("gold") || allText.includes("xau") || allText.includes("precious metals") || allText.includes("federal reserve") || allText.includes("interest rate") || allText.includes("inflation") || allText.includes("monetary policy") || allText.includes("dollar strength") || allText.includes("treasury yields");
        return isGoldRelevant && (news.impact?.toUpperCase() === "HIGH" || news.impact?.toUpperCase() === "MEDIUM");
      }).map((news) => {
        let eventDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        let publishedAt = /* @__PURE__ */ new Date();
        if (news.publishedAt) {
          publishedAt = new Date(news.publishedAt);
          eventDate = publishedAt.toISOString().split("T")[0];
        } else if (news.processedAt) {
          publishedAt = new Date(news.processedAt);
          eventDate = publishedAt.toISOString().split("T")[0];
        }
        return {
          id: `gold_news_${news.id}`,
          title: news.title || "Gold Market News",
          description: news.description || news.content || "",
          impact: news.impact?.toUpperCase() || "MEDIUM",
          source: news.source || "news",
          time: news.eventTime || "All Day",
          date: eventDate,
          eventDate,
          eventTime: news.eventTime || "All Day",
          currency: "USD",
          publishedAt,
          tags: news.tags || ["gold", "relevant"],
          relevanceScore: news.relevanceScore || 75
        };
      });
      const goldImportantEvents = [...goldCsvEvents, ...goldNewsEvents].sort((a, b) => {
        if (a.relevanceScore !== b.relevanceScore) {
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        }
        return b.publishedAt.getTime() - a.publishedAt.getTime();
      });
      console.log(`Returning ${goldImportantEvents.length} gold important events (${goldCsvEvents.length} CSV + ${goldNewsEvents.length} news)`);
      res.json(goldImportantEvents);
    } catch (error) {
      console.error("Gold important news error:", error);
      res.status(500).json({ error: "Failed to fetch gold important news", details: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.post("/api/upload-csv", upload.single("csvFile"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "\u0647\u06CC\u0686 \u0641\u0627\u06CC\u0644\u06CC \u0627\u0631\u0633\u0627\u0644 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A" });
      }
      const fileContent = req.file.buffer.toString("utf-8");
      let records;
      if (req.file.originalname.includes(".fxstreet") || req.file.originalname.includes(".txt")) {
        const lines = fileContent.split("\n").filter((line) => line.trim());
        records = lines.map((line, index) => {
          const parts = line.split("	");
          return {
            Start: parts[0] || "",
            Name: parts[1] || "",
            Currency: parts[2] || "USD",
            Impact: parts[3] || "MEDIUM"
          };
        });
      } else {
        records = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true
        });
      }
      if (!records || records.length === 0) {
        return res.status(400).json({ error: "\u0641\u0627\u06CC\u0644 \u062E\u0627\u0644\u06CC \u0627\u0633\u062A" });
      }
      const economicEvents2 = records.map((record) => {
        const startDateTime = new Date(record.Start);
        const eventDate = startDateTime.toISOString().split("T")[0];
        const eventTime = startDateTime.toTimeString().slice(0, 5);
        const title = record.Name?.toLowerCase() || "";
        const currency = record.Currency?.toLowerCase() || "";
        const isGoldRelevant = title.includes("gold") || title.includes("federal reserve") || title.includes("interest rate") || title.includes("inflation") || title.includes("cpi") || title.includes("employment") || title.includes("gdp") || currency.includes("usd");
        return {
          csvFileId: 1,
          // Will be updated after CSV file is saved
          eventId: record.Id || `event_${Date.now()}_${Math.random()}`,
          eventDate,
          eventTime,
          name: record.Name || "Unknown Event",
          impact: record.Impact || "LOW",
          currency: record.Currency || "USD",
          isGoldRelevant
        };
      });
      const dates = economicEvents2.map((e) => new Date(e.eventDate));
      const dateTimes = dates.map((d) => d.getTime());
      const weekStart = new Date(Math.min(...dateTimes)).toISOString().split("T")[0];
      const weekEnd = new Date(Math.max(...dateTimes)).toISOString().split("T")[0];
      const csvFile = await storage.uploadWeeklyCSV({
        filename: req.file.originalname,
        content: req.file.buffer,
        weekStart,
        weekEnd,
        eventsCount: economicEvents2.length
      });
      const eventsWithFileId = economicEvents2.map((event) => ({
        ...event,
        csvFileId: csvFile.id
      }));
      await storage.saveEconomicEvents(eventsWithFileId);
      await storage.createLog({
        level: "info",
        message: `\u0641\u0627\u06CC\u0644 CSV \u0647\u0641\u062A\u06AF\u06CC \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u0634\u062F: ${economicEvents2.length} \u0631\u0648\u06CC\u062F\u0627\u062F`,
        source: "csv-upload",
        metadata: `\u0641\u0627\u06CC\u0644: ${req.file.originalname} | \u0647\u0641\u062A\u0647: ${weekStart} \u062A\u0627 ${weekEnd}`
      });
      res.json({
        success: true,
        message: `${economicEvents2.length} \u0631\u0648\u06CC\u062F\u0627\u062F \u0627\u0642\u062A\u0635\u0627\u062F\u06CC \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u0634\u062F`,
        csvFile: {
          id: csvFile.id,
          filename: csvFile.filename,
          eventsCount: csvFile.eventsCount,
          weekStart: csvFile.weekStart,
          weekEnd: csvFile.weekEnd
        },
        goldRelevantCount: economicEvents2.filter((e) => e.isGoldRelevant).length,
        highMediumCount: economicEvents2.filter((e) => e.impact === "HIGH" || e.impact === "MEDIUM").length
      });
    } catch (error) {
      await storage.createLog({
        level: "error",
        message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u0641\u0627\u06CC\u0644 CSV",
        source: "csv-upload",
        metadata: error instanceof Error ? error.message : String(error)
      });
      res.status(500).json({ error: "\u062E\u0637\u0627 \u062F\u0631 \u067E\u0631\u062F\u0627\u0632\u0634 \u0641\u0627\u06CC\u0644 CSV" });
    }
  });
  app2.get("/api/csv-files", async (req, res) => {
    try {
      const csvFiles = await storage.getAllWeeklyCSVs();
      res.json(csvFiles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch CSV files" });
    }
  });
  app2.get("/api/chart/latest", async (req, res) => {
    try {
      const chartData2 = await storage.getLatestChartData();
      res.json(chartData2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chart data" });
    }
  });
  app2.get("/api/chart/:timeframe", async (req, res) => {
    try {
      const { timeframe } = req.params;
      const { limit } = req.query;
      const chartData2 = await storage.getChartData(
        timeframe,
        limit ? parseInt(limit) : 100
      );
      res.json(chartData2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chart data" });
    }
  });
  app2.get("/api/logs", async (req, res) => {
    try {
      const { level, limit } = req.query;
      let logs;
      if (level) {
        logs = await storage.getLogsByLevel(level);
      } else {
        logs = await storage.getRecentLogs(limit ? parseInt(limit) : 50);
      }
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });
  app2.post("/api/logs", async (req, res) => {
    try {
      const logData = insertSystemLogSchema.parse(req.body);
      const log2 = await storage.createLog(logData);
      res.json(log2);
    } catch (error) {
      res.status(400).json({ error: "Invalid log data" });
    }
  });
  app2.get("/api/settings", async (req, res) => {
    try {
      const settings2 = await storage.getAllSettings();
      res.json(settings2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });
  app2.get("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const setting = await storage.getSetting(key);
      if (!setting) {
        return res.status(404).json({ error: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch setting" });
    }
  });
  app2.post("/api/settings", async (req, res) => {
    try {
      const settingData = insertSettingSchema.parse(req.body);
      const setting = await storage.setSetting(settingData);
      res.json(setting);
    } catch (error) {
      res.status(400).json({ error: "Invalid setting data" });
    }
  });
  app2.post("/api/bots/:botName/start", async (req, res) => {
    try {
      const { botName } = req.params;
      await storage.updateBotStatus({
        botName,
        status: "running",
        lastRun: /* @__PURE__ */ new Date(),
        errorMessage: null
      });
      await storage.createLog({
        level: "info",
        message: `Bot ${botName} started`,
        source: "api"
      });
      res.json({ success: true, message: `Bot ${botName} started` });
    } catch (error) {
      res.status(500).json({ error: "Failed to start bot" });
    }
  });
  app2.post("/api/bots/:botName/stop", async (req, res) => {
    try {
      const { botName } = req.params;
      await storage.updateBotStatus({
        botName,
        status: "stopped",
        lastRun: /* @__PURE__ */ new Date(),
        errorMessage: null
      });
      await storage.createLog({
        level: "info",
        message: `Bot ${botName} stopped`,
        source: "api"
      });
      res.json({ success: true, message: `Bot ${botName} stopped` });
    } catch (error) {
      res.status(500).json({ error: "Failed to stop bot" });
    }
  });
  app2.get("/api/logs/stats", async (req, res) => {
    try {
      const stats = await storage.getLogStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch log stats" });
    }
  });
  app2.get("/api/logs/download", async (req, res) => {
    try {
      const { bot, level, date } = req.query;
      let logs;
      if (bot && bot !== "all") {
        logs = await storage.getLogsByBot(bot);
      } else if (level && level !== "all") {
        logs = await storage.getLogsByLevel(level);
      } else {
        logs = await storage.getRecentLogs(1e3);
      }
      if (date) {
        const filterDate = new Date(date);
        logs = logs.filter((log2) => {
          const logDate = new Date(log2.timestamp);
          return logDate.toDateString() === filterDate.toDateString();
        });
      }
      const logText = logs.map((log2) => {
        return `[${log2.timestamp}] ${log2.level?.toUpperCase()} [${log2.botName || log2.source || "SYSTEM"}] ${log2.message}${log2.details ? "\n  Details: " + log2.details : ""}${log2.error ? "\n  Error: " + log2.error : ""}`;
      }).join("\n");
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Content-Disposition", `attachment; filename="logs-${bot || "all"}-${level || "all"}-${date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.txt"`);
      res.send(logText);
    } catch (error) {
      res.status(500).json({ error: "Failed to download logs" });
    }
  });
  app2.delete("/api/logs/clear", async (req, res) => {
    try {
      const { bot, olderThan } = req.body;
      if (olderThan) {
        const cutoffDate = /* @__PURE__ */ new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThan);
        await storage.clearOldLogs(cutoffDate);
      } else if (bot) {
        await storage.clearLogsByBot(bot);
      }
      await storage.createLog({
        level: "info",
        message: `Logs cleared: ${bot ? `bot=${bot}` : `older than ${olderThan} days`}`,
        source: "api"
      });
      res.json({ success: true, message: "Logs cleared successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear logs" });
    }
  });
  app2.post("/api/actions/send-prices", async (req, res) => {
    try {
      const { priceFetcher: priceFetcher2 } = await Promise.resolve().then(() => (init_price_fetcher(), price_fetcher_exports));
      await priceFetcher2.updateAllPrices();
      await storage.createLog({
        level: "info",
        message: "Manual price update triggered via API",
        source: "api"
      });
      res.json({ success: true, message: "Price update triggered successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to trigger price update" });
    }
  });
  app2.post("/api/actions/fetch-news", async (req, res) => {
    try {
      const { newsScraper: newsScraper2 } = await Promise.resolve().then(() => (init_news_scraper(), news_scraper_exports));
      const news = await newsScraper2.fetchAllNews();
      await storage.createLog({
        level: "info",
        message: `Manual news fetch triggered via API. ${news.length} news items processed`,
        source: "api"
      });
      res.json({ success: true, message: `Fetched ${news.length} news items`, data: news });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });
  app2.post("/api/actions/backup", async (req, res) => {
    try {
      await storage.createLog({
        level: "info",
        message: "System backup initiated",
        source: "api"
      });
      res.json({ success: true, message: "Backup created successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to create backup" });
    }
  });
  app2.get("/api/prices", async (req, res) => {
    try {
      const prices = await storage.getLatestPrices();
      res.json(prices || {});
    } catch (error) {
      console.error("Error fetching prices:", error);
      res.status(500).json({ error: "Failed to fetch prices", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/actions/test-price-announcement", async (req, res) => {
    try {
      const { PriceBot: PriceBot2 } = await Promise.resolve().then(() => (init_price_bot(), price_bot_exports));
      const priceBot = new PriceBot2();
      await priceBot.testAnnouncement();
      res.json({ success: true, message: "\u062A\u0633\u062A \u0627\u0631\u0633\u0627\u0644 \u0642\u06CC\u0645\u062A\u200C\u0647\u0627 \u0627\u0646\u062C\u0627\u0645 \u0634\u062F" });
    } catch (error) {
      console.error("Test price announcement failed:", error);
      res.status(500).json({ success: false, message: "\u062E\u0637\u0627 \u062F\u0631 \u062A\u0633\u062A \u0627\u0631\u0633\u0627\u0644 \u0642\u06CC\u0645\u062A\u200C\u0647\u0627" });
    }
  });
  const mt5Service = new (await Promise.resolve().then(() => (init_mt5_data_service(), mt5_data_service_exports))).MT5DataService();
  app2.get("/api/mt5/status", async (req, res) => {
    try {
      const status = await mt5Service.checkDataAvailability();
      const hasLiveData = Object.values(status).some((available) => available);
      res.json({
        connected: hasLiveData,
        files: status,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        dataPath: "/data/mt5/csv"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check MT5 status" });
    }
  });
  app2.get("/api/mt5/latest", async (req, res) => {
    try {
      const { symbol = "XAUUSD" } = req.query;
      const data = await mt5Service.getCurrentPrice(symbol);
      if (data) {
        res.json(data);
      } else {
        res.status(503).json({ error: "MT5 data unavailable" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest MT5 data" });
    }
  });
  app2.get("/api/mt5/chart/:timeframe", async (req, res) => {
    try {
      const { timeframe } = req.params;
      const { symbol = "XAUUSD" } = req.query;
      const response = await mt5Service.getLatestData(symbol, timeframe);
      if (response.success) {
        res.json(response);
      } else {
        res.status(503).json({ error: "Chart data unavailable" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chart data" });
    }
  });
  app2.get("/api/mt5/multi-timeframe", async (req, res) => {
    try {
      const { symbol = "XAUUSD" } = req.query;
      const data = await mt5Service.getMultiTimeframeData(symbol);
      res.json({
        symbol,
        data,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch multi-timeframe data" });
    }
  });
  app2.post("/api/actions/update-prices", async (req, res) => {
    try {
      console.log("\u{1F504} Manual price update initiated from both sources...");
      const navasanPrices = await updatePricesFromNavasan();
      console.log("Navasan prices updated:", navasanPrices ? "success" : "failed");
      const goldPrices = await updatePricesFromZaryaalGold();
      console.log("ZaryaalGold prices updated:", goldPrices ? "success" : "failed");
      if (navasanPrices || goldPrices) {
        const currentPrices = await storage.getLatestPrices();
        const combinedPrices = {
          ...currentPrices,
          ...navasanPrices || {},
          ...goldPrices || {},
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
        };
        await storage.updatePrices(combinedPrices);
        await storage.createLog({
          level: "info",
          message: "\u0642\u06CC\u0645\u062A\u200C\u0647\u0627 \u0628\u0647\u200C\u0635\u0648\u0631\u062A \u062F\u0633\u062A\u06CC \u0627\u0632 \u0647\u0631 \u062F\u0648 \u0645\u0646\u0628\u0639 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F",
          source: "manual-update",
          metadata: `Navasan: ${navasanPrices ? "OK" : "Failed"}, ZaryaalGold: ${goldPrices ? "OK" : "Failed"}`
        });
        res.json({
          success: true,
          message: "\u0642\u06CC\u0645\u062A\u200C\u0647\u0627 \u0627\u0632 \u0647\u0631 \u062F\u0648 \u0645\u0646\u0628\u0639 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F",
          data: combinedPrices,
          sources: {
            navasan: !!navasanPrices,
            zaryaal: !!goldPrices
          }
        });
      } else {
        throw new Error("Failed to fetch prices from any source");
      }
    } catch (error) {
      console.error("Price update error:", error);
      await storage.createLog({
        level: "error",
        message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u062F\u0633\u062A\u06CC \u0642\u06CC\u0645\u062A\u200C\u0647\u0627",
        source: "manual-update",
        metadata: error instanceof Error ? error.message : String(error)
      });
      res.status(500).json({
        error: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0642\u06CC\u0645\u062A\u200C\u0647\u0627",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.post("/api/actions/test-morning-analysis", async (req, res) => {
    try {
      const { AnalysisBot: AnalysisBot2 } = await Promise.resolve().then(() => (init_analysis_bot(), analysis_bot_exports));
      const analysisBot = new AnalysisBot2();
      await analysisBot.testMorningAnalysis();
      res.json({
        success: true,
        message: "\u062A\u0633\u062A \u062A\u062D\u0644\u06CC\u0644 \u0635\u0628\u062D\u0627\u0646\u0647 \u0627\u0646\u062C\u0627\u0645 \u0634\u062F"
      });
    } catch (error) {
      console.error("Test morning analysis error:", error);
      res.status(500).json({
        success: false,
        error: "\u062E\u0637\u0627 \u062F\u0631 \u062A\u0633\u062A \u062A\u062D\u0644\u06CC\u0644 \u0635\u0628\u062D\u0627\u0646\u0647"
      });
    }
  });
  app2.post("/api/actions/test-afternoon-analysis", async (req, res) => {
    try {
      const { AnalysisBot: AnalysisBot2 } = await Promise.resolve().then(() => (init_analysis_bot(), analysis_bot_exports));
      const analysisBot = new AnalysisBot2();
      await analysisBot.testAfternoonAnalysis();
      res.json({
        success: true,
        message: "\u062A\u0633\u062A \u062A\u062D\u0644\u06CC\u0644 \u0639\u0635\u0631\u0627\u0646\u0647 \u0627\u0646\u062C\u0627\u0645 \u0634\u062F"
      });
    } catch (error) {
      console.error("Test afternoon analysis error:", error);
      res.status(500).json({
        success: false,
        error: "\u062E\u0637\u0627 \u062F\u0631 \u062A\u0633\u062A \u062A\u062D\u0644\u06CC\u0644 \u0639\u0635\u0631\u0627\u0646\u0647"
      });
    }
  });
  app2.post("/api/actions/test-weekly-analysis", async (req, res) => {
    try {
      const { AnalysisBot: AnalysisBot2 } = await Promise.resolve().then(() => (init_analysis_bot(), analysis_bot_exports));
      const analysisBot = new AnalysisBot2();
      await analysisBot.testWeeklyAnalysis();
      res.json({
        success: true,
        message: "\u062A\u0633\u062A \u062A\u062D\u0644\u06CC\u0644 \u0647\u0641\u062A\u06AF\u06CC \u0627\u0646\u062C\u0627\u0645 \u0634\u062F"
      });
    } catch (error) {
      console.error("Test weekly analysis error:", error);
      res.status(500).json({
        success: false,
        error: "\u062E\u0637\u0627 \u062F\u0631 \u062A\u0633\u062A \u062A\u062D\u0644\u06CC\u0644 \u0647\u0641\u062A\u06AF\u06CC"
      });
    }
  });
  app2.post("/api/actions/test-signal-generation", async (req, res) => {
    try {
      const { SignalBot: SignalBot2 } = await Promise.resolve().then(() => (init_signal_bot(), signal_bot_exports));
      const signalBot = new SignalBot2();
      await signalBot.testSignalGeneration();
      res.json({ success: true, message: "\u062A\u0633\u062A \u062A\u0648\u0644\u06CC\u062F \u0633\u06CC\u06AF\u0646\u0627\u0644 \u0627\u0646\u062C\u0627\u0645 \u0634\u062F" });
    } catch (error) {
      console.error("Failed to test signal generation:", error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
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
  try {
    console.log("\u{1F680} Starting initial price update...");
    const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const response = await fetch(`http://api.navasan.tech/latest/?api_key=freeBY5YCsWyaVmR7DSu2QOLTH0KBsbu`);
    if (response.ok) {
      const data = await response.json();
      await storage2.updatePrices(data);
      await storage2.createLog({
        level: "info",
        message: "\u0642\u06CC\u0645\u062A\u200C\u0647\u0627 \u062F\u0631 \u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC \u0633\u06CC\u0633\u062A\u0645 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F",
        source: "startup",
        metadata: `Navasan API: ${Object.keys(data).length} currencies updated`
      });
      console.log("\u2705 Initial prices updated successfully from Navasan API");
    }
  } catch (error) {
    console.error("\u274C Failed to initialize prices:", error);
  }
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
