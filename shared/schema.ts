import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Bot status tracking
export const botStatus = sqliteTable("bot_status", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  botName: text("bot_name").notNull().unique(),
  status: text("status").notNull(), // 'running', 'stopped', 'error'
  lastRun: integer("last_run", { mode: 'timestamp' }),
  errorMessage: text("error_message"),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// Analysis reports storage
export const analysisReports = sqliteTable("analysis_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reportType: text("report_type").notNull(), // 'daily_morning', 'daily_evening', 'weekly_news', 'weekly_technical'
  content: text("content").notNull(),
  chartsData: text("charts_data"), // JSON string of chart data
  scheduledFor: integer("scheduled_for", { mode: 'timestamp' }).notNull(),
  sentAt: integer("sent_at", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// Trading signals
export const tradingSignals = sqliteTable("trading_signals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull(), // 'XAUUSD'
  type: text("type").notNull(), // 'buy', 'sell'
  entryPrice: real("entry_price").notNull(),
  stopLoss: real("stop_loss").notNull(),
  takeProfit: real("take_profit").notNull(),
  riskReward: real("risk_reward"),
  confidence: integer("confidence"), // 1-100
  reasoning: text("reasoning"),
  status: text("status").notNull().default('pending'), // 'pending', 'approved', 'rejected', 'sent'
  approvedBy: text("approved_by"),
  approvedAt: integer("approved_at", { mode: 'timestamp' }),
  sentAt: integer("sent_at", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// Gold bar prices from ZaryaalGold (both buy and sell)
export const goldBarPrices = sqliteTable("gold_bar_prices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // فروش شمش طلا ۹۹۵ (Sell prices)
  sellUSD: real("sell_usd"),
  sellEUR: real("sell_eur"),
  sellAED: real("sell_aed"),
  sellCNY: real("sell_cny"),
  // خرید شمش طلا ۹۹۵ (Buy prices)
  buyTomanFree: real("buy_toman_free"), // بازار آزاد
  buyTomanCenter: real("buy_toman_center"), // مرکز مبادله
  buyUSDFree: real("buy_usd_free"), // دلار حواله بازار آزاد
  buyUSDGold: real("buy_usd_gold"), // دلار طلا
  buyUSDDebt: real("buy_usd_debt"), // دلار شمش رفع تعهدی
  lastUpdated: integer("last_updated", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// Price updates history
export const priceHistory = sqliteTable("price_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  source: text("source").notNull(), // 'navasan_api', 'zaryaal_gold'
  data: text("data").notNull(), // JSON string of price data
  scheduledFor: integer("scheduled_for", { mode: 'timestamp' }).notNull(),
  sentAt: integer("sent_at", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// News items
export const newsItems = sqliteTable("news_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  source: text("source").notNull(), // 'fxstreet', 'forexfactory'
  title: text("title").notNull(),
  impact: text("impact").notNull(), // 'HIGH', 'MEDIUM', 'LOW'
  time: text("time").notNull(),
  description: text("description"),
  relevanceScore: integer("relevance_score"), // 1-100
  processedAt: integer("processed_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// System logs
export const systemLogs = sqliteTable("system_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  level: text("level").notNull(), // 'info', 'warning', 'error'
  message: text("message").notNull(),
  source: text("source").notNull(), // bot name or service
  metadata: text("metadata"), // JSON string
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// Settings
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// Chart data from MT5
export const chartData = sqliteTable("chart_data", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  timeframe: text("timeframe").notNull(), // 'M15', 'H1', 'H4', 'D1'
  datetime: integer("datetime", { mode: 'timestamp' }).notNull(),
  open: real("open").notNull(),
  high: real("high").notNull(),
  low: real("low").notNull(),
  close: real("close").notNull(),
  volume: integer("volume"),
  processedAt: integer("processed_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// Weekly CSV files management
export const weeklyCSVFiles = sqliteTable("weekly_csv_files", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  filename: text("filename").notNull(),
  content: blob("content").notNull(),
  weekStart: text("week_start").notNull(), // ISO date string of week start
  weekEnd: text("week_end").notNull(), // ISO date string of week end
  eventsCount: integer("events_count").notNull(),
  uploadedAt: integer("uploaded_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true)
});

// Economic events from CSV
export const economicEvents = sqliteTable("economic_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  csvFileId: integer("csv_file_id").references(() => weeklyCSVFiles.id),
  eventId: text("event_id").notNull(), // From CSV Id column
  eventDate: text("event_date").notNull(), // From CSV Start column
  eventTime: text("event_time").notNull(), // Extracted time from Start
  name: text("name").notNull(), // From CSV Name column
  impact: text("impact").notNull(), // From CSV Impact column (HIGH/MEDIUM/LOW)
  currency: text("currency").notNull(), // From CSV Currency column
  isGoldRelevant: integer("is_gold_relevant", { mode: 'boolean' }).notNull().default(false),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// Insert schemas
export const insertBotStatusSchema = createInsertSchema(botStatus).omit({ id: true, updatedAt: true });
export const insertAnalysisReportSchema = createInsertSchema(analysisReports).omit({ id: true, createdAt: true });
export const insertTradingSignalSchema = createInsertSchema(tradingSignals).omit({ id: true, createdAt: true });
export const insertPriceHistorySchema = createInsertSchema(priceHistory).omit({ id: true, createdAt: true });
export const insertNewsItemSchema = createInsertSchema(newsItems).omit({ id: true, processedAt: true });
export const insertSystemLogSchema = createInsertSchema(systemLogs).omit({ id: true, createdAt: true });
export const insertSettingSchema = createInsertSchema(settings).omit({ id: true, updatedAt: true });
export const insertChartDataSchema = createInsertSchema(chartData).omit({ id: true, processedAt: true });
export const insertWeeklyCSVFileSchema = createInsertSchema(weeklyCSVFiles).omit({ id: true, uploadedAt: true });
export const insertEconomicEventSchema = createInsertSchema(economicEvents).omit({ id: true, createdAt: true });

// Types
export type BotStatus = typeof botStatus.$inferSelect;
export type InsertBotStatus = z.infer<typeof insertBotStatusSchema>;
export type AnalysisReport = typeof analysisReports.$inferSelect;
export type InsertAnalysisReport = z.infer<typeof insertAnalysisReportSchema>;
export type TradingSignal = typeof tradingSignals.$inferSelect;
export type InsertTradingSignal = z.infer<typeof insertTradingSignalSchema>;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
export type NewsItem = typeof newsItems.$inferSelect;
export type InsertNewsItem = z.infer<typeof insertNewsItemSchema>;
export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type ChartData = typeof chartData.$inferSelect;
export type InsertChartData = z.infer<typeof insertChartDataSchema>;
export type WeeklyCSVFile = typeof weeklyCSVFiles.$inferSelect;
export type InsertWeeklyCSVFile = z.infer<typeof insertWeeklyCSVFileSchema>;
export type EconomicEvent = typeof economicEvents.$inferSelect;
export type InsertEconomicEvent = z.infer<typeof insertEconomicEventSchema>;
