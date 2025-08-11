import pandas as pd
import numpy as np
import talib
from datetime import datetime, timedelta
import logging
from services.data_service import get_gold_data, get_multiple_timeframes
from services.smart_money_service import SmartMoneyAnalyzer

logger = logging.getLogger(__name__)

class TechnicalAnalyzer:
    def __init__(self):
        self.smc_analyzer = SmartMoneyAnalyzer()
    
    def calculate_indicators(self, df):
        """Calculate technical indicators"""
        try:
            if df.empty or len(df) < 50:
                logger.warning("Insufficient data for technical analysis")
                return {}
            
            # Price data
            close = df['close'].values
            high = df['high'].values
            low = df['low'].values
            open_prices = df['open'].values
            
            indicators = {}
            
            # Moving Averages
            indicators['ma20'] = talib.SMA(close, timeperiod=20)
            indicators['ma50'] = talib.SMA(close, timeperiod=50)
            indicators['ma200'] = talib.SMA(close, timeperiod=200)
            indicators['ema20'] = talib.EMA(close, timeperiod=20)
            
            # RSI
            indicators['rsi'] = talib.RSI(close, timeperiod=14)
            
            # MACD
            macd, macdsignal, macdhist = talib.MACD(close)
            indicators['macd'] = macd
            indicators['macd_signal'] = macdsignal
            indicators['macd_histogram'] = macdhist
            
            # Bollinger Bands
            bb_upper, bb_middle, bb_lower = talib.BBANDS(close)
            indicators['bb_upper'] = bb_upper
            indicators['bb_middle'] = bb_middle
            indicators['bb_lower'] = bb_lower
            
            # Stochastic
            slowk, slowd = talib.STOCH(high, low, close)
            indicators['stoch_k'] = slowk
            indicators['stoch_d'] = slowd
            
            # ATR
            indicators['atr'] = talib.ATR(high, low, close, timeperiod=14)
            
            # Support and Resistance
            indicators['support_resistance'] = self.find_support_resistance(df)
            
            return indicators
            
        except Exception as e:
            logger.error(f"Error calculating indicators: {e}")
            return {}
    
    def find_support_resistance(self, df, window=20):
        """Find support and resistance levels"""
        try:
            if len(df) < window * 2:
                return {'support': [], 'resistance': []}
            
            highs = df['high'].values
            lows = df['low'].values
            
            # Find local maxima and minima
            resistance_levels = []
            support_levels = []
            
            for i in range(window, len(highs) - window):
                # Check if current high is local maximum
                if highs[i] == max(highs[i-window:i+window+1]):
                    resistance_levels.append(highs[i])
                
                # Check if current low is local minimum
                if lows[i] == min(lows[i-window:i+window+1]):
                    support_levels.append(lows[i])
            
            # Remove duplicates and sort
            resistance_levels = sorted(list(set(resistance_levels)), reverse=True)[:5]
            support_levels = sorted(list(set(support_levels)))[:5]
            
            return {
                'resistance': resistance_levels,
                'support': support_levels
            }
            
        except Exception as e:
            logger.error(f"Error finding support/resistance: {e}")
            return {'support': [], 'resistance': []}
    
    def detect_candlestick_patterns(self, df):
        """Detect candlestick patterns"""
        try:
            if len(df) < 10:
                return {}
            
            open_prices = df['open'].values
            high = df['high'].values
            low = df['low'].values
            close = df['close'].values
            
            patterns = {}
            
            # Bullish patterns
            patterns['hammer'] = talib.CDLHAMMER(open_prices, high, low, close)
            patterns['doji'] = talib.CDLDOJI(open_prices, high, low, close)
            patterns['engulfing_bullish'] = talib.CDLENGULFING(open_prices, high, low, close)
            patterns['morning_star'] = talib.CDLMORNINGSTAR(open_prices, high, low, close)
            patterns['piercing_pattern'] = talib.CDLPIERCING(open_prices, high, low, close)
            
            # Bearish patterns
            patterns['shooting_star'] = talib.CDLSHOOTINGSTAR(open_prices, high, low, close)
            patterns['evening_star'] = talib.CDLEVENINGSTAR(open_prices, high, low, close)
            patterns['dark_cloud'] = talib.CDLDARKCLOUDCOVER(open_prices, high, low, close)
            patterns['hanging_man'] = talib.CDLHANGINGMAN(open_prices, high, low, close)
            
            # Filter recent patterns (last 5 candles)
            recent_patterns = {}
            for pattern, values in patterns.items():
                recent = values[-5:] if len(values) >= 5 else values
                if any(recent != 0):
                    recent_patterns[pattern] = recent.tolist()
            
            return recent_patterns
            
        except Exception as e:
            logger.error(f"Error detecting patterns: {e}")
            return {}
    
    def analyze_trend(self, df):
        """Analyze overall trend"""
        try:
            if len(df) < 50:
                return "UNKNOWN"
            
            # Calculate slope of 20-period MA
            ma20 = talib.SMA(df['close'].values, timeperiod=20)
            
            if len(ma20) < 10:
                return "UNKNOWN"
            
            recent_ma = ma20[-10:]
            slope = np.polyfit(range(len(recent_ma)), recent_ma, 1)[0]
            
            # Determine trend based on slope and price position relative to MA
            current_price = df['close'].iloc[-1]
            current_ma = ma20[-1]
            
            if slope > 0.1 and current_price > current_ma:
                return "BULLISH"
            elif slope < -0.1 and current_price < current_ma:
                return "BEARISH"
            else:
                return "SIDEWAYS"
                
        except Exception as e:
            logger.error(f"Error analyzing trend: {e}")
            return "UNKNOWN"
    
    def generate_signals(self, df, timeframe='H1'):
        """Generate trading signals based on analysis"""
        try:
            if len(df) < 50:
                return []
            
            signals = []
            indicators = self.calculate_indicators(df)
            patterns = self.detect_candlestick_patterns(df)
            smc_analysis = self.smc_analyzer.analyze(df)
            
            current_price = df['close'].iloc[-1]
            rsi = indicators.get('rsi', np.array([]))[-1] if len(indicators.get('rsi', [])) > 0 else 50
            
            # RSI Divergence Signals
            if rsi < 30:  # Oversold
                if any(patterns.get('hammer', [0])[-1:]) or any(patterns.get('morning_star', [0])[-1:]):
                    signals.append({
                        'type': 'BUY',
                        'reason': 'RSI Oversold + Bullish Pattern',
                        'confidence': 0.7,
                        'entry': current_price,
                        'stop_loss': current_price - (current_price * 0.005),  # 0.5% SL
                        'take_profit': current_price + (current_price * 0.015),  # 1.5% TP
                        'pattern': 'RSI_REVERSAL'
                    })
            
            elif rsi > 70:  # Overbought
                if any(patterns.get('shooting_star', [0])[-1:]) or any(patterns.get('evening_star', [0])[-1:]):
                    signals.append({
                        'type': 'SELL',
                        'reason': 'RSI Overbought + Bearish Pattern',
                        'confidence': 0.7,
                        'entry': current_price,
                        'stop_loss': current_price + (current_price * 0.005),  # 0.5% SL
                        'take_profit': current_price - (current_price * 0.015),  # 1.5% TP
                        'pattern': 'RSI_REVERSAL'
                    })
            
            # Smart Money Concepts Signals
            if smc_analysis.get('bos_signal'):
                bos = smc_analysis['bos_signal']
                signals.append({
                    'type': bos['direction'],
                    'reason': f'Break of Structure - {bos["type"]}',
                    'confidence': 0.8,
                    'entry': current_price,
                    'stop_loss': bos.get('stop_loss', current_price * 0.995 if bos['direction'] == 'BUY' else current_price * 1.005),
                    'take_profit': bos.get('take_profit', current_price * 1.02 if bos['direction'] == 'BUY' else current_price * 0.98),
                    'pattern': 'BOS'
                })
            
            # Order Block Signals
            if smc_analysis.get('order_blocks'):
                for ob in smc_analysis['order_blocks'][-2:]:  # Last 2 order blocks
                    if ob['type'] == 'bullish' and current_price <= ob['high'] * 1.001:
                        signals.append({
                            'type': 'BUY',
                            'reason': 'Bullish Order Block Touch',
                            'confidence': 0.75,
                            'entry': current_price,
                            'stop_loss': ob['low'] * 0.999,
                            'take_profit': current_price * 1.02,
                            'pattern': 'ORDER_BLOCK'
                        })
                    elif ob['type'] == 'bearish' and current_price >= ob['low'] * 0.999:
                        signals.append({
                            'type': 'SELL',
                            'reason': 'Bearish Order Block Touch',
                            'confidence': 0.75,
                            'entry': current_price,
                            'stop_loss': ob['high'] * 1.001,
                            'take_profit': current_price * 0.98,
                            'pattern': 'ORDER_BLOCK'
                        })
            
            # Filter and rank signals by confidence
            signals = sorted(signals, key=lambda x: x['confidence'], reverse=True)
            
            return signals[:3]  # Return top 3 signals
            
        except Exception as e:
            logger.error(f"Error generating signals: {e}")
            return []

def get_current_market_status():
    """Get comprehensive market status"""
    try:
        analyzer = TechnicalAnalyzer()
        
        # Get data for multiple timeframes
        data = get_multiple_timeframes()
        
        status = {
            'timestamp': datetime.now().isoformat(),
            'current_price': None,
            'trends': {},
            'signals': {},
            'smc_analysis': {}
        }
        
        for tf, df in data.items():
            if df is not None and not df.empty:
                status['trends'][tf] = analyzer.analyze_trend(df)
                status['signals'][tf] = analyzer.generate_signals(df, tf)
                
                if tf == 'H1':  # Use H1 for current price
                    status['current_price'] = float(df['close'].iloc[-1])
                    status['smc_analysis'] = analyzer.smc_analyzer.analyze(df)
        
        return status
        
    except Exception as e:
        logger.error(f"Error getting market status: {e}")
        return {'error': str(e)}

def perform_daily_analysis():
    """Perform comprehensive daily analysis"""
    try:
        analyzer = TechnicalAnalyzer()
        data = get_multiple_timeframes()
        
        analysis = {
            'timestamp': datetime.now(),
            'symbol': 'XAUUSD',
            'daily_trend': None,
            'key_levels': {},
            'technical_summary': {},
            'signals': [],
            'smc_analysis': {},
            'recommendation': ''
        }
        
        # Analyze daily timeframe
        if data['D1'] is not None and not data['D1'].empty:
            daily_df = data['D1']
            analysis['daily_trend'] = analyzer.analyze_trend(daily_df)
            analysis['current_price'] = float(daily_df['close'].iloc[-1])
            
            # Calculate key levels
            indicators = analyzer.calculate_indicators(daily_df)
            analysis['key_levels'] = indicators.get('support_resistance', {})
            
            # Technical summary
            rsi = indicators.get('rsi', np.array([]))[-1] if len(indicators.get('rsi', [])) > 0 else 50
            ma20 = indicators.get('ma20', np.array([]))[-1] if len(indicators.get('ma20', [])) > 0 else analysis['current_price']
            
            analysis['technical_summary'] = {
                'rsi': float(rsi),
                'rsi_signal': 'Oversold' if rsi < 30 else 'Overbought' if rsi > 70 else 'Neutral',
                'ma20': float(ma20),
                'price_vs_ma20': 'Above' if analysis['current_price'] > ma20 else 'Below'
            }
            
            # SMC Analysis
            analysis['smc_analysis'] = analyzer.smc_analyzer.analyze(daily_df)
        
        # Collect signals from all timeframes
        for tf, df in data.items():
            if df is not None:
                signals = analyzer.generate_signals(df, tf)
                for signal in signals:
                    signal['timeframe'] = tf
                    analysis['signals'].append(signal)
        
        # Generate recommendation
        analysis['recommendation'] = generate_daily_recommendation(analysis)
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error in daily analysis: {e}")
        return {'error': str(e)}

def generate_daily_recommendation(analysis):
    """Generate daily trading recommendation"""
    try:
        recommendation = []
        
        trend = analysis.get('daily_trend', 'UNKNOWN')
        technical = analysis.get('technical_summary', {})
        signals = analysis.get('signals', [])
        
        # Trend analysis
        if trend == 'BULLISH':
            recommendation.append("📈 روند کلی صعودی است - موقعیت‌های خرید را در نظر بگیرید")
        elif trend == 'BEARISH':
            recommendation.append("📉 روند کلی نزولی است - موقعیت‌های فروش را در نظر بگیرید")
        else:
            recommendation.append("↔️ بازار در حالت خنثی قرار دارد - منتظر شکست سطوح کلیدی باشید")
        
        # RSI analysis
        rsi_signal = technical.get('rsi_signal', 'Neutral')
        if rsi_signal == 'Oversold':
            recommendation.append("🔄 RSI در ناحیه اشباع فروش - احتمال بازگشت قیمت وجود دارد")
        elif rsi_signal == 'Overbought':
            recommendation.append("🔄 RSI در ناحیه اشباع خرید - احتمال تصحیح قیمت وجود دارد")
        
        # Signal summary
        buy_signals = [s for s in signals if s['type'] == 'BUY']
        sell_signals = [s for s in signals if s['type'] == 'SELL']
        
        if len(buy_signals) > len(sell_signals):
            recommendation.append(f"🟢 تعداد سیگنال‌های خرید بیشتر است ({len(buy_signals)} خرید vs {len(sell_signals)} فروش)")
        elif len(sell_signals) > len(buy_signals):
            recommendation.append(f"🔴 تعداد سیگنال‌های فروش بیشتر است ({len(sell_signals)} فروش vs {len(buy_signals)} خرید)")
        else:
            recommendation.append("⚪ تعداد سیگنال‌های خرید و فروش برابر است")
        
        # Risk management
        recommendation.append("⚠️ همیشه از Stop Loss استفاده کنید و مدیریت ریسک را رعایت کنید")
        
        return "\n".join(recommendation)
        
    except Exception as e:
        logger.error(f"Error generating recommendation: {e}")
        return "خطا در تولید توصیه"

def analyze_market_data(data, timeframe='H1'):
    """Analyze market data for given timeframe"""
    try:
        if not data or len(data) == 0:
            return {
                'trend': 'No Data',
                'rsi': 'N/A',
                'current_price': 0,
                'signal': 'WAIT'
            }
        
        # Convert to DataFrame
        if isinstance(data, list):
            df = pd.DataFrame(data)
        else:
            df = data
            
        analyzer = TechnicalAnalyzer()
        
        # Calculate indicators
        indicators = analyzer.calculate_indicators(df)
        
        # Get current price
        current_price = float(df['close'].iloc[-1]) if not df.empty else 0
        
        # Determine trend
        trend = analyzer.analyze_trend(df)
        
        # Get RSI
        rsi_values = indicators.get('rsi', np.array([]))
        rsi = float(rsi_values[-1]) if len(rsi_values) > 0 and not np.isnan(rsi_values[-1]) else 50
        
        # Generate signals
        signals = analyzer.generate_signals(df, timeframe)
        signal_type = signals[0]['type'] if signals else 'WAIT'
        
        return {
            'trend': trend,
            'rsi': rsi,
            'current_price': current_price,
            'signal': signal_type,
            'indicators': indicators,
            'signals': signals
        }
        
    except Exception as e:
        logger.error(f"Error analyzing market data: {e}")
        return {
            'trend': 'Error',
            'rsi': 'N/A',
            'current_price': 0,
            'signal': 'WAIT',
            'error': str(e)
        }
