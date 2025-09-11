import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { MT5DataService } from "./services/mt5-data-service";
import { 
  insertTradingSignalSchema,
  insertAnalysisReportSchema,
  insertSystemLogSchema,
  insertSettingSchema
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { parse } from "csv-parse/sync";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv') || 
        file.originalname.includes('.fxstreet') || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('فقط فایل‌های CSV، .fxstreet و .txt مجاز هستند'));
    }
  }
});

// Navasan API Configuration
const NAVASAN_API_URL = process.env.NAVASAN_API_URL || 'http://api.navasan.tech/latest/';
const NAVASAN_API_KEY = process.env.NAVASAN_API_KEY || 'freeZMjxxD3BIuMxg0xzZzXhl8KHDyxk';

export function registerRoutes(app: Express): Server {
  const mt5Service = new MT5DataService();

  // Basic Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Prices API
  app.get("/api/prices", async (req, res) => {
    try {
      const prices = await storage.getLatestPrices();
      res.json(prices || {});
    } catch (error) {
      console.error('Error fetching prices:', error);
      res.status(500).json({ error: "Failed to fetch prices" });
    }
  });

  // API برای دریافت آخرین قیمت‌ها - مشابه /api/prices
  app.get("/api/prices/latest", async (req, res) => {
    try {
      const prices = await storage.getLatestPrices();
      res.json(prices || {});
    } catch (error) {
      console.error('Error fetching latest prices:', error);
      res.status(500).json({ error: "Failed to fetch latest prices" });
    }
  });

  // Settings API
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const parsed = insertSettingSchema.parse(req.body);
      const setting = await storage.setSetting(parsed);
      res.json(setting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid setting data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create setting" });
    }
  });

  app.put("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      
      if (!key || value === undefined) {
        return res.status(400).json({ error: "Key and value are required" });
      }

      await storage.setSetting({ key, value });
      res.json({ success: true, key, value });
    } catch (error) {
      res.status(500).json({ error: "Failed to update setting" });
    }
  });

  // Price Update API
  app.post("/api/prices/update", async (req, res) => {
    try {
      // Import priceFetcher dynamically to avoid circular dependencies
      const { priceFetcher } = await import('./services/price-fetcher');
      await priceFetcher.updateAllPrices();
      res.json({ success: true, message: "Prices updated successfully" });
    } catch (error) {
      console.error('Error updating prices:', error);
      res.status(500).json({ error: "Failed to update prices" });
    }
  });

  // Actions API - مسیر صحیح برای فرانت‌اند
  app.post("/api/actions/update-prices", async (req, res) => {
    try {
      // Import priceFetcher dynamically to avoid circular dependencies
      const { priceFetcher } = await import('./services/price-fetcher');
      await priceFetcher.updateAllPrices();
      
      // بازگردانی داده‌های بروزرسانی شده
      const latestPrices = await storage.getLatestPrices();
      
      res.json({ 
        success: true, 
        message: "Prices updated successfully",
        data: latestPrices
      });
    } catch (error) {
      console.error('Error updating prices:', error);
      res.status(500).json({ error: "Failed to update prices" });
    }
  });

  // Test Send API - برای compatibility
  app.post("/api/actions/send-test", async (req, res) => {
    try {
      // بروزرسانی قیمت‌ها قبل از ارسال
      const { priceFetcher } = await import('./services/price-fetcher');
      await priceFetcher.updateAllPrices();

      // ارسال به کانال
      const { PriceBot } = await import('./bots/price-bot');
      const priceBot = new PriceBot();
      await priceBot.sendPriceAnnouncement();
      
      res.json({ 
        success: true, 
        message: "قیمت‌ها بروزرسانی و به کانال ارسال شدند" 
      });
    } catch (error) {
      console.error('Error sending price announcement:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: `خطا در ارسال: ${errorMessage}` });
    }
  });

  // Test price announcement API - ارسال به کانال
  app.post("/api/actions/test-price-announcement", async (req, res) => {
    try {
      // بروزرسانی قیمت‌ها قبل از ارسال
      const { priceFetcher } = await import('./services/price-fetcher');
      await priceFetcher.updateAllPrices();

      // ارسال به کانال
      const { PriceBot } = await import('./bots/price-bot');
      const priceBot = new PriceBot();
      await priceBot.sendPriceAnnouncement();
      
      res.json({ 
        success: true, 
        message: "قیمت‌ها بروزرسانی و به کانال ارسال شدند" 
      });
    } catch (error) {
      console.error('Error sending price announcement:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: `خطا در ارسال: ${errorMessage}` });
    }
  });

  // Bot Status API
  app.get("/api/bots/status", async (req, res) => {
    try {
      const statuses = await storage.getAllBotStatuses();
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bot statuses" });
    }
  });

  // Trading Signals API
  app.get("/api/signals/pending", async (req, res) => {
    try {
      const signals = await storage.getPendingSignals();
      res.json(signals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending signals" });
    }
  });

  app.get("/api/signals/today", async (req, res) => {
    try {
      const signals = await storage.getTodaysSignals();
      res.json(signals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's signals" });
    }
  });

  // News API
  app.get("/api/news", async (req, res) => {
    try {
      const news = await storage.getLatestNews();
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // Logs API
  app.get("/api/logs", async (req, res) => {
    try {
      const { source, level, limit } = req.query;
      let logs;
      
      if (source || level) {
        logs = await storage.getRecentLogs(limit ? parseInt(limit as string) : 50);
      } else {
        logs = await storage.getRecentLogs(limit ? parseInt(limit as string) : 50);
      }
      
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  app.post("/api/logs", async (req, res) => {
    try {
      const logData = insertSystemLogSchema.parse(req.body);
      const log = await storage.createLog(logData);
      res.json(log);
    } catch (error) {
      res.status(400).json({ error: "Invalid log data" });
    }
  });


  // Settings Update Routes for API and MT5 paths
  app.post('/api/settings/update-navasan-key', async (req, res) => {
    try {
      const { apiKey } = req.body;
      if (!apiKey) {
        return res.status(400).json({ error: 'کلید API ضروری است' });
      }
      
      // Test the API key first
      const testResponse = await fetch(`${NAVASAN_API_URL}?api_key=${apiKey}`);
      if (!testResponse.ok) {
        return res.status(400).json({ error: 'کلید API نامعتبر است' });
      }
      
      // Save new API key
      await storage.setSetting({ key: 'navasan_api_key', value: apiKey });
      
      await storage.createLog({
        level: 'info',
        message: `✅ کلید API نوسان بروزرسانی شد`,
        source: 'settings',
        metadata: JSON.stringify({ updatedAt: new Date().toISOString() })
      });
      
      res.json({ success: true, message: 'کلید API با موفقیت بروزرسانی شد' });
    } catch (error) {
      res.status(500).json({ error: 'خطا در بروزرسانی کلید API' });
    }
  });

  app.post('/api/settings/update-mt5-path', async (req, res) => {
    try {
      const { mt5Path } = req.body;
      if (!mt5Path) {
        return res.status(400).json({ error: 'مسیر MT5 ضروری است' });
      }
      
      // Save new MT5 path
      await storage.setSetting({ key: 'mt5_data_path', value: mt5Path });
      
      await storage.createLog({
        level: 'info',
        message: `✅ مسیر داده‌های MT5 بروزرسانی شد: ${mt5Path}`,
        source: 'settings',
        metadata: JSON.stringify({ newPath: mt5Path, updatedAt: new Date().toISOString() })
      });
      
      res.json({ success: true, message: 'مسیر MT5 با موفقیت بروزرسانی شد' });
    } catch (error) {
      res.status(500).json({ error: 'خطا در بروزرسانی مسیر MT5' });
    }
  });

  app.get('/api/settings/test-navasan', async (req, res) => {
    try {
      const apiKeySetting = await storage.getSetting('navasan_api_key');
      const apiKey = apiKeySetting?.value || NAVASAN_API_KEY;
      
      const response = await fetch(`${NAVASAN_API_URL}?api_key=${apiKey}`);
      const data = await response.json();
      
      if (response.ok) {
        res.json({ success: true, data, message: 'اتصال با API نوسان برقرار است' });
      } else {
        res.status(400).json({ success: false, error: 'خطا در اتصال با API نوسان', details: data });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'خطا در تست API نوسان' });
    }
  });

  // Price Update API
  app.post("/api/prices/update", async (req, res) => {
    try {
      console.log('🔄 Manual price update requested...');
      
      const apiKeySetting = await storage.getSetting('navasan_api_key');
      const apiKey = apiKeySetting?.value || NAVASAN_API_KEY;
      
      const response = await fetch(`${NAVASAN_API_URL}?api_key=${apiKey}`);
      
      if (!response.ok) {
        throw new Error(`Navasan API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && typeof data === 'object') {
        // Store exactly what Navasan API returns
        await storage.updatePrices(data);
        
        await storage.createLog({
          level: 'info',
          message: 'قیمت‌ها به‌روزرسانی شد (دستی)',
          source: 'manual-update',
          metadata: `Updated ${Object.keys(data).length} currencies`
        });
        
        console.log('✅ Manual price update successful');
        res.json({ 
          success: true, 
          message: 'قیمت‌ها با موفقیت بروزرسانی شد',
          prices: data,
          source: 'navasan_api'
        });
      } else {
        throw new Error('Invalid response from Navasan API');
      }
      
    } catch (error) {
      console.error('❌ Price update failed:', error);
      
      await storage.createLog({
        level: 'error',
        message: `خطا در بروزرسانی قیمت‌ها: ${error instanceof Error ? error.message : 'نامشخص'}`,
        source: 'manual-update',
        metadata: error instanceof Error ? error.stack : undefined
      });
      
      res.status(500).json({ 
        success: false, 
        error: 'خطا در بروزرسانی قیمت‌ها',
        details: error instanceof Error ? error.message : 'نامشخص'
      });
    }
  });

  // Bot Control APIs
  app.post("/api/bots/start", async (req, res) => {
    try {
      const { botId } = req.body;
      if (!botId) {
        return res.status(400).json({ error: 'شناسه ربات ضروری است' });
      }

      const bot = await storage.getBotStatusById(botId);
      if (!bot) {
        return res.status(404).json({ error: 'ربات یافت نشد' });
      }

      await storage.updateBotStatusById(botId, { 
        status: 'active', 
        lastRun: new Date() 
      });

      await storage.createLog({
        level: 'info',
        message: `ربات ${bot.botName} فعال شد`,
        source: 'bot-control',
        metadata: JSON.stringify({ botId, action: 'start' })
      });

      console.log(`✅ Bot ${bot.botName} started`);
      
      res.json({ 
        success: true, 
        message: `ربات ${bot.botName} با موفقیت فعال شد` 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'خطا در فعال‌سازی ربات' 
      });
    }
  });

  app.post("/api/bots/stop", async (req, res) => {
    try {
      const { botId } = req.body;
      if (!botId) {
        return res.status(400).json({ error: 'شناسه ربات ضروری است' });
      }

      const bot = await storage.getBotStatusById(botId);
      if (!bot) {
        return res.status(404).json({ error: 'ربات یافت نشد' });
      }

      await storage.updateBotStatusById(botId, { status: 'stopped' });

      await storage.createLog({
        level: 'info',
        message: `ربات ${bot.botName} متوقف شد`,
        source: 'bot-control',
        metadata: JSON.stringify({ botId, action: 'stop' })
      });

      console.log(`⏹️ Bot ${bot.botName} stopped`);
      
      res.json({ 
        success: true, 
        message: `ربات ${bot.botName} با موفقیت متوقف شد` 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'خطا در متوقف کردن ربات' 
      });
    }
  });

  app.post("/api/bots/restart", async (req, res) => {
    try {
      const { botId } = req.body;
      if (!botId) {
        return res.status(400).json({ error: 'شناسه ربات ضروری است' });
      }

      const bot = await storage.getBotStatusById(botId);
      if (!bot) {
        return res.status(404).json({ error: 'ربات یافت نشد' });
      }

      await storage.updateBotStatusById(botId, { 
        status: 'active', 
        lastRun: new Date() 
      });

      await storage.createLog({
        level: 'info',
        message: `ربات ${bot.botName} ریستارت شد`,
        source: 'bot-control',
        metadata: JSON.stringify({ botId, action: 'restart' })
      });

      console.log(`🔄 Bot ${bot.botName} restarted`);
      
      res.json({ 
        success: true, 
        message: `ربات ${bot.botName} با موفقیت ریستارت شد` 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'خطا در ریستارت ربات' 
      });
    }
  });

  // CSV Upload for FXStreet
  app.post('/api/news/upload-csv', upload.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'فایل CSV ارسال نشده است' });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const fileName = req.file.originalname;
      
      // Parse CSV and count records
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true
      });
      
      const recordCount = records.length;
      
      await storage.createLog({
        level: 'info',
        message: `فایل CSV هفتگی بارگذاری شد: ${recordCount} رویداد`,
        source: 'csv-upload',
        metadata: JSON.stringify({ fileName, recordCount })
      });
      
      // Confirm upload using NewsService
      const { NewsService } = await import('./services/news-service');
      const newsService = new NewsService();
      await newsService.confirmManualCSVUpload(fileName, recordCount);
      
      res.json({ 
        success: true, 
        message: `فایل CSV با موفقیت بارگذاری شد. ${recordCount} رویداد پردازش شد.`,
        fileName,
        recordCount
      });
      
    } catch (error) {
      console.error('خطا در بارگذاری فایل CSV:', error);
      res.status(500).json({ 
        error: 'خطا در بارگذاری فایل CSV',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}