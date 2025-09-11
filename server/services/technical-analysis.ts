// تحلیل فنی پیشرفته برای طلا
import { storage } from '../storage';

export interface CandleData {
  date: string;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AnalysisResult {
  timeframe: string;
  price_action: {
    trend: 'bullish' | 'bearish' | 'sideways';
    support_level: number;
    resistance_level: number;
    key_levels: number[];
  };
  smart_money: {
    institutional_flow: 'buying' | 'selling' | 'neutral';
    order_blocks: Array<{ type: 'demand' | 'supply', level: number }>;
    fair_value_gaps: Array<{ type: 'bullish' | 'bearish', high: number, low: number }>;
  };
  indicators: {
    rsi: number;
    ma20: number;
    ma50: number;
    trend_strength: 'strong' | 'medium' | 'weak';
  };
  signal: {
    direction: 'buy' | 'sell' | 'hold';
    strength: number; // 1-10
    entry_price: number;
    stop_loss: number;
    take_profit: number;
    risk_reward: number;
  };
}

export class TechnicalAnalyzer {

  // محاسبه RSI
  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // محاسبه میانگین متحرک
  private calculateMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    
    const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
    return sum / period;
  }

  // تشخیص سطوح کلیدی Price Action
  private findKeyLevels(candles: CandleData[]): { support: number, resistance: number, levels: number[] } {
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const closes = candles.map(c => c.close);
    
    // سطح مقاومت: بالاترین قیمت اخیر
    const resistance = Math.max(...highs.slice(-20));
    
    // سطح حمایت: پایین‌ترین قیمت اخیر
    const support = Math.min(...lows.slice(-20));
    
    // سطوح کلیدی بر اساس نقاط بازگشت
    const keyLevels: number[] = [];
    
    // پیدا کردن سطوح مهم قیمتی
    for (let i = 2; i < candles.length - 2; i++) {
      const current = candles[i];
      const prev = candles[i - 1];
      const next = candles[i + 1];
      
      // Peak (مقاومت محلی)
      if (current.high > prev.high && current.high > next.high) {
        keyLevels.push(current.high);
      }
      
      // Valley (حمایت محلی)
      if (current.low < prev.low && current.low < next.low) {
        keyLevels.push(current.low);
      }
    }
    
    // حذف سطوح تکراری و مرتب‌سازی
    const uniqueLevels = [...new Set(keyLevels)].sort((a, b) => b - a).slice(0, 5);
    
    return { support, resistance, levels: uniqueLevels };
  }

  // تشخیص Smart Money Concepts
  private analyzeSmartMoney(candles: CandleData[]): {
    institutional_flow: 'buying' | 'selling' | 'neutral';
    order_blocks: Array<{ type: 'demand' | 'supply', level: number }>;
    fair_value_gaps: Array<{ type: 'bullish' | 'bearish', high: number, low: number }>;
  } {
    const recentCandles = candles.slice(-50);
    const volumes = recentCandles.map(c => c.volume);
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    
    // تشخیص جریان نهادی بر اساس حجم و قیمت
    const highVolumeCandles = recentCandles.filter(c => c.volume > avgVolume * 1.5);
    const bullishHighVolume = highVolumeCandles.filter(c => c.close > c.open).length;
    const bearishHighVolume = highVolumeCandles.filter(c => c.close < c.open).length;
    
    let institutional_flow: 'buying' | 'selling' | 'neutral' = 'neutral';
    if (bullishHighVolume > bearishHighVolume * 1.5) institutional_flow = 'buying';
    else if (bearishHighVolume > bullishHighVolume * 1.5) institutional_flow = 'selling';
    
    // Order Blocks - سطوح قیمتی با حجم بالا
    const order_blocks: Array<{ type: 'demand' | 'supply', level: number }> = [];
    
    highVolumeCandles.forEach(candle => {
      if (candle.close > candle.open) {
        order_blocks.push({ type: 'demand', level: candle.low });
      } else {
        order_blocks.push({ type: 'supply', level: candle.high });
      }
    });
    
    // Fair Value Gaps - شکاف‌های قیمتی
    const fair_value_gaps: Array<{ type: 'bullish' | 'bearish', high: number, low: number }> = [];
    
    for (let i = 1; i < recentCandles.length - 1; i++) {
      const prev = recentCandles[i - 1];
      const current = recentCandles[i];
      const next = recentCandles[i + 1];
      
      // Bullish FVG
      if (prev.high < next.low && current.close > current.open) {
        fair_value_gaps.push({
          type: 'bullish',
          high: next.low,
          low: prev.high
        });
      }
      
      // Bearish FVG
      if (prev.low > next.high && current.close < current.open) {
        fair_value_gaps.push({
          type: 'bearish',
          high: prev.low,
          low: next.high
        });
      }
    }
    
    return { institutional_flow, order_blocks, fair_value_gaps };
  }

  // تولید سیگنال خرید/فروش
  private generateSignal(analysis: Partial<AnalysisResult>, currentPrice: number): AnalysisResult['signal'] {
    let score = 0;
    let direction: 'buy' | 'sell' | 'hold' = 'hold';
    
    // امتیازدهی بر اساس RSI
    if (analysis.indicators?.rsi) {
      if (analysis.indicators.rsi < 30) score += 3; // oversold = buy signal
      else if (analysis.indicators.rsi > 70) score -= 3; // overbought = sell signal
      else if (analysis.indicators.rsi > 50) score += 1; // bullish momentum
      else score -= 1; // bearish momentum
    }
    
    // امتیازدهی بر اساس Smart Money
    if (analysis.smart_money?.institutional_flow === 'buying') score += 2;
    else if (analysis.smart_money?.institutional_flow === 'selling') score -= 2;
    
    // امتیازدهی بر اساس Price Action
    if (analysis.price_action?.trend === 'bullish') score += 2;
    else if (analysis.price_action?.trend === 'bearish') score -= 2;
    
    // تعیین جهت سیگنال
    if (score >= 3) direction = 'buy';
    else if (score <= -3) direction = 'sell';
    
    // محاسبه Entry, SL, TP
    const strength = Math.min(Math.abs(score), 10);
    let entry_price = currentPrice;
    let stop_loss = currentPrice;
    let take_profit = currentPrice;
    let risk_reward = 1;
    
    if (direction === 'buy') {
      stop_loss = analysis.price_action?.support_level || currentPrice * 0.995;
      take_profit = analysis.price_action?.resistance_level || currentPrice * 1.01;
      risk_reward = Math.abs(take_profit - entry_price) / Math.abs(entry_price - stop_loss);
    } else if (direction === 'sell') {
      stop_loss = analysis.price_action?.resistance_level || currentPrice * 1.005;
      take_profit = analysis.price_action?.support_level || currentPrice * 0.99;
      risk_reward = Math.abs(entry_price - take_profit) / Math.abs(stop_loss - entry_price);
    }
    
    return {
      direction,
      strength,
      entry_price: Number(entry_price.toFixed(2)),
      stop_loss: Number(stop_loss.toFixed(2)),
      take_profit: Number(take_profit.toFixed(2)),
      risk_reward: Number(risk_reward.toFixed(2))
    };
  }

  // تحلیل کامل
  async analyzeGold(candles: CandleData[], timeframe: string): Promise<AnalysisResult> {
    try {
      if (candles.length < 20) {
        throw new Error('حداقل 20 کندل برای تحلیل مورد نیاز است');
      }

      const closes = candles.map(c => c.close);
      const currentPrice = closes[closes.length - 1];
      
      // Price Action Analysis
      const keyLevels = this.findKeyLevels(candles);
      const trend = this.determineTrend(candles);
      
      // Smart Money Analysis
      const smartMoney = this.analyzeSmartMoney(candles);
      
      // Technical Indicators
      const rsi = this.calculateRSI(closes);
      const ma20 = this.calculateMA(closes, 20);
      const ma50 = this.calculateMA(closes, 50);
      
      const trendStrength = this.calculateTrendStrength(candles);
      
      const analysis: Partial<AnalysisResult> = {
        timeframe,
        price_action: {
          trend,
          support_level: keyLevels.support,
          resistance_level: keyLevels.resistance,
          key_levels: keyLevels.levels
        },
        smart_money: smartMoney,
        indicators: {
          rsi,
          ma20,
          ma50,
          trend_strength: trendStrength
        }
      };
      
      // Generate Signal
      const signal = this.generateSignal(analysis, currentPrice);
      
      const result: AnalysisResult = {
        ...analysis,
        signal
      } as AnalysisResult;

      // Log the analysis
      await storage.createLog({
        level: 'info',
        message: `📊 تحلیل ${timeframe} کامل شد - سیگنال: ${signal.direction} (قدرت: ${signal.strength}/10)`,
        source: 'technical-analysis',
        metadata: JSON.stringify({
          timeframe,
          trend,
          rsi: rsi.toFixed(1),
          signal: signal.direction,
          strength: signal.strength,
          rr: signal.risk_reward
        })
      });

      return result;
      
    } catch (error) {
      await storage.createLog({
        level: 'error',
        message: `خطا در تحلیل فنی ${timeframe}: ${error instanceof Error ? error.message : 'نامشخص'}`,
        source: 'technical-analysis',
        metadata: error instanceof Error ? error.stack : undefined
      });
      
      throw error;
    }
  }

  private determineTrend(candles: CandleData[]): 'bullish' | 'bearish' | 'sideways' {
    const recentCandles = candles.slice(-10);
    const firstPrice = recentCandles[0].close;
    const lastPrice = recentCandles[recentCandles.length - 1].close;
    
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    if (change > 1) return 'bullish';
    else if (change < -1) return 'bearish';
    return 'sideways';
  }

  private calculateTrendStrength(candles: CandleData[]): 'strong' | 'medium' | 'weak' {
    const recentCandles = candles.slice(-20);
    const volatility = this.calculateVolatility(recentCandles);
    
    if (volatility > 2) return 'strong';
    else if (volatility > 1) return 'medium';
    return 'weak';
  }

  private calculateVolatility(candles: CandleData[]): number {
    const changes = [];
    for (let i = 1; i < candles.length; i++) {
      const change = Math.abs((candles[i].close - candles[i-1].close) / candles[i-1].close) * 100;
      changes.push(change);
    }
    
    return changes.reduce((a, b) => a + b, 0) / changes.length;
  }
}

export const technicalAnalyzer = new TechnicalAnalyzer();