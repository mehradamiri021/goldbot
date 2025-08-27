import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Initialize prices on startup
  try {
    console.log('🚀 Starting initial price update...');
    
    const { storage } = await import("./storage");
    
    const response = await fetch(`http://api.navasan.tech/latest/?api_key=freeBY5YCsWyaVmR7DSu2QOLTH0KBsbu`);
    if (response.ok) {
      const data = await response.json();
      
      const prices = {
        usd: parseInt(data.usd_sell?.value || data.usd_buy?.value || '0'),
        eur: parseInt(data.eur?.value || '0'),
        cad: parseInt(data.cad?.value || '0'), 
        aed: parseInt(data.aed?.value || '0'),
        bitcoin: parseInt(data.btc?.value || data.usd_btc?.value || '0'),
        ethereum: parseInt(data.eth?.value || data.usd_eth?.value || '0'),
        tether: parseInt(data.usdt?.value || data.usd_usdt?.value || '0'),
        gold18k: parseInt(data.bub_18ayar?.value || '0'),
        coin: parseInt(data.bub_sekkeh?.value || data.bub_gerami?.value || '0'),
        navasanLastUpdate: new Date().toISOString(),
        goldUSD: 0,
        goldEUR: 0,
        goldAED: 0,
        goldCNY: 0,
        zaryaalLastUpdate: null,
        lastUpdated: new Date().toISOString()
      };
      
      await storage.updatePrices(prices);
      
      await storage.createLog({
        level: 'info',
        message: 'قیمت‌ها در راه‌اندازی سیستم بروزرسانی شد',
        source: 'startup',
        botName: 'price-bot',
        metadata: `Navasan API: ${Object.keys(data).length} currencies updated`
      });
      
      console.log('✅ Initial prices updated successfully from Navasan API');
    }
  } catch (error) {
    console.error('❌ Failed to initialize prices:', error);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`🌟 serving on port ${port}`);
    log(`💰 Price Bot ready - API نوسان connected`);
    log(`📅 Scheduled times: 11:11, 14:14, 17:17 (Saturday to Thursday)`);
    
    // راه‌اندازی ربات قیمت با زمان‌بندی خودکار
    try {
      const { PriceBot } = await import('./bots/price-bot');
      const priceBot = new PriceBot();
      await priceBot.start();
      log("🤖 Price Bot scheduler activated");
    } catch (error) {
      console.error("❌ Failed to start Price Bot:", error);
    }

    // راه‌اندازی ربات تحلیل‌گر
    try {
      const { AnalysisBot } = await import('./bots/analysis-bot');
      const analysisBot = new AnalysisBot();
      await analysisBot.start();
      log("🤖 Analysis Bot scheduler activated");
    } catch (error) {
      console.error("❌ Failed to start Analysis Bot:", error);
    }

    // راه‌اندازی ربات سیگنال‌دهی
    try {
      const { SignalBot } = await import('./bots/signal-bot');
      const signalBot = new SignalBot();
      await signalBot.start();
      log("🤖 Signal Bot scheduler activated");
    } catch (error) {
      console.error("❌ Failed to start Signal Bot:", error);
    }
  });
})();
