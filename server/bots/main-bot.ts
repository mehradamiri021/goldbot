import { telegramService } from '../services/telegram';
import { storage } from '../storage';
import { analysisBot } from './analysis-bot';
import { signalBot } from './signal-bot';
import { priceBot } from './price-bot';

class MainBot {
  private isRunning = false;
  private checkInterval: NodeJS.Timeout | null = null;

  async start() {
    if (this.isRunning) return;

    try {
      this.isRunning = true;
      
      // Initialize Telegram service
      await telegramService.initialize();

      // Update bot status
      await storage.updateBotStatus({
        botName: 'main-bot',
        status: 'running',
        lastRun: new Date(),
        errorMessage: null
      });

      // Start monitoring other bots
      this.startMonitoring();

      // Start other bots
      await this.startAllBots();

      await storage.createLog({
        level: 'info',
        message: 'Main bot started successfully',
        source: 'main-bot'
      });

    } catch (error) {
      await storage.updateBotStatus({
        botName: 'main-bot',
        status: 'error',
        lastRun: new Date(),
        errorMessage: `Failed to start: ${error}`
      });

      await storage.createLog({
        level: 'error',
        message: `Failed to start main bot: ${error}`,
        source: 'main-bot'
      });

      throw error;
    }
  }

  async stop() {
    if (!this.isRunning) return;

    try {
      this.isRunning = false;

      // Stop monitoring
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }

      // Stop all bots
      await this.stopAllBots();

      // Update status
      await storage.updateBotStatus({
        botName: 'main-bot',
        status: 'stopped',
        lastRun: new Date(),
        errorMessage: null
      });

      await storage.createLog({
        level: 'info',
        message: 'Main bot stopped successfully',
        source: 'main-bot'
      });

    } catch (error) {
      await storage.createLog({
        level: 'error',
        message: `Error stopping main bot: ${error}`,
        source: 'main-bot'
      });
    }
  }

  private startMonitoring() {
    // Check bot status every 5 minutes
    this.checkInterval = setInterval(async () => {
      await this.checkBotStatuses();
    }, 5 * 60 * 1000);
  }

  private async checkBotStatuses() {
    try {
      const statuses = await storage.getAllBotStatuses();
      
      for (const status of statuses) {
        if (status.botName === 'main-bot') continue;

        // Check if bot hasn't run in the last 10 minutes and should be running
        const lastRun = status.lastRun;
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        if (status.status === 'running' && lastRun && lastRun < tenMinutesAgo) {
          await storage.createLog({
            level: 'warning',
            message: `Bot ${status.botName} appears to be stalled`,
            source: 'main-bot'
          });

          // Notify admin
          await telegramService.sendToAdmin(
            `⚠️ هشدار: ربات ${status.botName} از ${lastRun.toLocaleString('fa-IR')} فعالیت نداشته است.`
          );
        }

        if (status.status === 'error') {
          await telegramService.sendToAdmin(
            `❌ خطا در ربات ${status.botName}: ${status.errorMessage}`
          );
        }
      }

    } catch (error) {
      await storage.createLog({
        level: 'error',
        message: `Error checking bot statuses: ${error}`,
        source: 'main-bot'
      });
    }
  }

  private async startAllBots() {
    const bots = [
      { name: 'analysis-bot', instance: analysisBot },
      { name: 'signal-bot', instance: signalBot },
      { name: 'price-bot', instance: priceBot }
    ];

    for (const bot of bots) {
      try {
        await bot.instance.start();
        await storage.createLog({
          level: 'info',
          message: `Started ${bot.name}`,
          source: 'main-bot'
        });
      } catch (error) {
        await storage.createLog({
          level: 'error',
          message: `Failed to start ${bot.name}: ${error}`,
          source: 'main-bot'
        });
      }
    }
  }

  private async stopAllBots() {
    const bots = [
      { name: 'analysis-bot', instance: analysisBot },
      { name: 'signal-bot', instance: signalBot },
      { name: 'price-bot', instance: priceBot }
    ];

    for (const bot of bots) {
      try {
        await bot.instance.stop();
        await storage.createLog({
          level: 'info',
          message: `Stopped ${bot.name}`,
          source: 'main-bot'
        });
      } catch (error) {
        await storage.createLog({
          level: 'error',
          message: `Failed to stop ${bot.name}: ${error}`,
          source: 'main-bot'
        });
      }
    }
  }

  async handleAdminCommand(command: string, params?: any) {
    try {
      switch (command) {
        case 'start_all':
          await this.startAllBots();
          return { success: true, message: 'تمام ربات‌ها راه‌اندازی شدند' };

        case 'stop_all':
          await this.stopAllBots();
          return { success: true, message: 'تمام ربات‌ها متوقف شدند' };

        case 'send_manual_prices':
          await priceBot.sendManualPrices();
          return { success: true, message: 'قیمت‌ها به صورت دستی ارسال شد' };

        case 'force_analysis':
          await analysisBot.generateManualReport();
          return { success: true, message: 'گزارش تحلیلی دستی تولید شد' };

        default:
          return { success: false, message: 'دستور نامعتبر' };
      }
    } catch (error) {
      await storage.createLog({
        level: 'error',
        message: `Error handling admin command ${command}: ${error}`,
        source: 'main-bot'
      });
      
      return { success: false, message: `خطا در اجرای دستور: ${error}` };
    }
  }

  getStatus(): { isRunning: boolean; uptime?: number } {
    return {
      isRunning: this.isRunning,
      uptime: this.isRunning ? Date.now() : undefined
    };
  }
}

export const mainBot = new MainBot();
