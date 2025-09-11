import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { storage } from '../storage';

interface ChartDataPoint {
  timeframe: string;
  datetime: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface TechnicalAnalysis {
  rsi: number;
  ma20: number;
  support: number;
  resistance: number;
  trend: 'bullish' | 'bearish' | 'sideways';
  priceAction: {
    pattern?: string;
    signal?: 'buy' | 'sell' | 'neutral';
  };
  smartMoney: {
    orderBlocks: Array<{ price: number; type: 'bullish' | 'bearish' }>;
    fvg: Array<{ high: number; low: number; type: 'bullish' | 'bearish' }>;
  };
}

class ChartProcessorService {
  private mt5DataPath: string = '/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files/';

  async initialize() {
    const pathSetting = await storage.getSetting('mt5_data_path');
    if (pathSetting) {
      this.mt5DataPath = pathSetting.value;
    }
  }

  async readChartData(): Promise<ChartDataPoint[]> {
    try {
      const filePath = path.join(this.mt5DataPath, 'XAUUSD_MultiTimeframe.csv');
      
      // Check if file exists, if not try alternative name
      let actualPath = filePath;
      if (!fs.existsSync(filePath)) {
        actualPath = path.join(this.mt5DataPath, 'XAUUSD_Data.csv');
        if (!fs.existsSync(actualPath)) {
          throw new Error('MT5 data file not found');
        }
      }

      const csvContent = fs.readFileSync(actualPath, 'utf-8');
      const records = parse(csvContent, {
        columns: ['Timeframe', 'DateTime', 'Open', 'High', 'Low', 'Close', 'Volume'],
        skip_empty_lines: true,
        from_line: 2 // Skip header
      });

      const chartData: ChartDataPoint[] = records.map((record: any) => ({
        timeframe: record.Timeframe,
        datetime: new Date(record.DateTime),
        open: parseFloat(record.Open),
        high: parseFloat(record.High),
        low: parseFloat(record.Low),
        close: parseFloat(record.Close),
        volume: record.Volume ? parseInt(record.Volume) : undefined
      }));

      // Save to storage
      const insertData = chartData.map(point => ({
        timeframe: point.timeframe,
        datetime: point.datetime,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
        volume: point.volume || 0
      }));

      await storage.saveChartData(insertData);

      await storage.createLog({
        level: 'info',
        message: `Processed ${chartData.length} chart data points`,
        source: 'chart-processor'
      });

      return chartData;
    } catch (error) {
      await storage.createLog({
        level: 'error',
        message: `Failed to read chart data: ${error}`,
        source: 'chart-processor'
      });
      return [];
    }
  }

  async performTechnicalAnalysis(timeframe: string = 'H1'): Promise<TechnicalAnalysis> {
    const chartData = await storage.getChartData(timeframe, 100);
    
    if (chartData.length < 20) {
      throw new Error('Insufficient data for technical analysis');
    }

    const prices = chartData.map(d => d.close);
    const highs = chartData.map(d => d.high);
    const lows = chartData.map(d => d.low);

    // Calculate RSI
    const rsi = this.calculateRSI(prices, 14);

    // Calculate MA20
    const ma20 = this.calculateSMA(prices, 20);

    // Convert data to compatible format
    const compatibleData = chartData.map(d => ({ ...d, volume: d.volume ?? 0 }));

    // Find support and resistance
    const { support, resistance } = this.findSupportResistance(compatibleData.slice(0, 50));

    // Determine trend
    const trend = this.determineTrend(prices.slice(0, 20), ma20);

    // Analyze price action
    const priceAction = this.analyzePriceAction(compatibleData.slice(0, 10));

    // Smart Money analysis
    const smartMoney = this.analyzeSmartMoney(compatibleData.slice(0, 20));

    const analysis: TechnicalAnalysis = {
      rsi,
      ma20,
      support,
      resistance,
      trend,
      priceAction,
      smartMoney
    };

    await storage.createLog({
      level: 'info',
      message: `Technical analysis completed for ${timeframe}: RSI=${rsi.toFixed(2)}, Trend=${trend}`,
      source: 'chart-processor'
    });

    return analysis;
  }

  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calculate subsequent values using smoothed averages
    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        avgGain = (avgGain * (period - 1) + change) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
      }
    }

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return isNaN(rsi) ? 50 : rsi;
  }

  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[0] || 0;
    
    const sum = prices.slice(0, period).reduce((acc, price) => acc + price, 0);
    return sum / period;
  }

  private findSupportResistance(data: ChartDataPoint[]): { support: number; resistance: number } {
    const lows = data.map(d => d.low).sort((a, b) => a - b);
    const highs = data.map(d => d.high).sort((a, b) => b - a);

    // Find support (lowest low with some clustering)
    const support = lows[Math.floor(lows.length * 0.1)];

    // Find resistance (highest high with some clustering)
    const resistance = highs[Math.floor(highs.length * 0.1)];

    return { support, resistance };
  }

  private determineTrend(recentPrices: number[], ma20: number): 'bullish' | 'bearish' | 'sideways' {
    const currentPrice = recentPrices[0];
    const previousPrice = recentPrices[recentPrices.length - 1];
    
    const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;
    const priceVsMA = ((currentPrice - ma20) / ma20) * 100;

    if (priceChange > 0.5 && priceVsMA > 0) return 'bullish';
    if (priceChange < -0.5 && priceVsMA < 0) return 'bearish';
    return 'sideways';
  }

  private analyzePriceAction(data: ChartDataPoint[]): { pattern?: string; signal?: 'buy' | 'sell' | 'neutral' } {
    if (data.length < 3) return { signal: 'neutral' };

    const [current, previous, beforePrevious] = data;

    // Simple engulfing pattern detection
    if (current.close > current.open && previous.close < previous.open &&
        current.close > previous.open && current.open < previous.close) {
      return { pattern: 'Bullish Engulfing', signal: 'buy' };
    }

    if (current.close < current.open && previous.close > previous.open &&
        current.close < previous.open && current.open > previous.close) {
      return { pattern: 'Bearish Engulfing', signal: 'sell' };
    }

    return { signal: 'neutral' };
  }

  private analyzeSmartMoney(data: ChartDataPoint[]): TechnicalAnalysis['smartMoney'] {
    const orderBlocks: Array<{ price: number; type: 'bullish' | 'bearish' }> = [];
    const fvg: Array<{ high: number; low: number; type: 'bullish' | 'bearish' }> = [];

    // Simple order block detection (high volume + significant price movement)
    for (let i = 2; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];
      
      const priceChange = Math.abs(current.close - previous.close);
      const avgPrice = (current.high + current.low) / 2;
      const changePercent = (priceChange / avgPrice) * 100;

      if (changePercent > 0.5) { // Significant movement
        orderBlocks.push({
          price: avgPrice,
          type: current.close > previous.close ? 'bullish' : 'bearish'
        });
      }
    }

    // Simple Fair Value Gap detection
    for (let i = 2; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];
      const beforePrevious = data[i - 2];

      // Bullish FVG: current low > previous high
      if (current.low > beforePrevious.high) {
        fvg.push({
          high: current.low,
          low: beforePrevious.high,
          type: 'bullish'
        });
      }

      // Bearish FVG: current high < previous low
      if (current.high < beforePrevious.low) {
        fvg.push({
          high: beforePrevious.low,
          low: current.high,
          type: 'bearish'
        });
      }
    }

    return { orderBlocks, fvg };
  }

  async generateChartImage(timeframe: string = 'H1'): Promise<Buffer | null> {
    // This would integrate with Plotly to generate actual chart images
    // For now, return null as we'll handle this in the frontend
    return null;
  }
}

export const chartProcessorService = new ChartProcessorService();
