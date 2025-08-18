"""
Simple Technical Analysis without TA-Lib
تحلیل تکنیکال ساده بدون استفاده از TA-Lib
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class SimpleTA:
    """Simple technical analysis class without TA-Lib dependency"""
    
    @staticmethod
    def sma(data: pd.Series, period: int) -> pd.Series:
        """Simple Moving Average"""
        return data.rolling(window=period).mean()
    
    @staticmethod
    def ema(data: pd.Series, period: int) -> pd.Series:
        """Exponential Moving Average"""
        return data.ewm(span=period).mean()
    
    @staticmethod
    def rsi(data: pd.Series, period: int = 14) -> pd.Series:
        """Relative Strength Index"""
        try:
            delta = data.diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
            
            # Prevent division by zero
            rs = gain / (loss + 1e-8)
            rsi = 100 - (100 / (1 + rs))
            return rsi
        except Exception as e:
            logger.warning(f"Error calculating RSI: {e}")
            return pd.Series(index=data.index, dtype=float).fillna(50)
    
    @staticmethod
    def macd(data: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> Dict[str, pd.Series]:
        """MACD Indicator"""
        try:
            ema_fast = SimpleTA.ema(data, fast)
            ema_slow = SimpleTA.ema(data, slow)
            macd_line = ema_fast - ema_slow
            signal_line = SimpleTA.ema(macd_line, signal)
            histogram = macd_line - signal_line
            
            return {
                'macd': macd_line,
                'signal': signal_line,
                'histogram': histogram
            }
        except Exception as e:
            logger.warning(f"Error calculating MACD: {e}")
            return {
                'macd': pd.Series(index=data.index, dtype=float).fillna(0),
                'signal': pd.Series(index=data.index, dtype=float).fillna(0),
                'histogram': pd.Series(index=data.index, dtype=float).fillna(0)
            }
    
    @staticmethod
    def bollinger_bands(data: pd.Series, period: int = 20, std: float = 2) -> Dict[str, pd.Series]:
        """Bollinger Bands"""
        try:
            middle = SimpleTA.sma(data, period)
            std_dev = data.rolling(window=period).std()
            upper = middle + (std_dev * std)
            lower = middle - (std_dev * std)
            
            return {
                'upper': upper,
                'middle': middle,
                'lower': lower
            }
        except Exception as e:
            logger.warning(f"Error calculating Bollinger Bands: {e}")
            return {
                'upper': pd.Series(index=data.index, dtype=float).fillna(data.mean()),
                'middle': pd.Series(index=data.index, dtype=float).fillna(data.mean()),
                'lower': pd.Series(index=data.index, dtype=float).fillna(data.mean())
            }
    
    @staticmethod
    def stochastic(high: pd.Series, low: pd.Series, close: pd.Series, k_period: int = 14, d_period: int = 3) -> Dict[str, pd.Series]:
        """Stochastic Oscillator"""
        try:
            lowest_low = low.rolling(window=k_period).min()
            highest_high = high.rolling(window=k_period).max()
            
            k_percent = 100 * ((close - lowest_low) / (highest_high - lowest_low))
            d_percent = k_percent.rolling(window=d_period).mean()
            
            return {
                'k': k_percent,
                'd': d_percent
            }
        except Exception as e:
            logger.warning(f"Error calculating Stochastic: {e}")
            return {
                'k': pd.Series(index=close.index, dtype=float).fillna(50),
                'd': pd.Series(index=close.index, dtype=float).fillna(50)
            }
    
    @staticmethod
    def atr(high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> pd.Series:
        """Average True Range"""
        try:
            high_low = high - low
            high_close = np.abs(high - close.shift())
            low_close = np.abs(low - close.shift())
            
            true_range = np.maximum(high_low.fillna(0), np.maximum(high_close.fillna(0), low_close.fillna(0)))
            atr = pd.Series(true_range).rolling(window=period).mean()
            
            return atr
        except Exception as e:
            logger.warning(f"Error calculating ATR: {e}")
            return pd.Series(index=close.index, dtype=float).fillna(1.0)

class PriceActionAnalyzer:
    """Price Action Analysis without external libraries"""
    
    @staticmethod
    def find_support_resistance(df: pd.DataFrame, window: int = 20) -> Dict[str, float]:
        """Find key support and resistance levels"""
        try:
            if len(df) < window * 2:
                return {'support': df['low'].min(), 'resistance': df['high'].max()}
            
            # Recent data for more relevant levels
            recent_data = df.tail(window * 3)
            
            # Support levels (recent lows)
            support_candidates = []
            for i in range(window, len(recent_data) - window):
                current_low = recent_data.iloc[i]['low']
                left_lows = recent_data.iloc[i-window:i]['low'].min()
                right_lows = recent_data.iloc[i+1:i+window+1]['low'].min()
                
                if current_low <= left_lows and current_low <= right_lows:
                    support_candidates.append(current_low)
            
            # Resistance levels (recent highs)
            resistance_candidates = []
            for i in range(window, len(recent_data) - window):
                current_high = recent_data.iloc[i]['high']
                left_highs = recent_data.iloc[i-window:i]['high'].max()
                right_highs = recent_data.iloc[i+1:i+window+1]['high'].max()
                
                if current_high >= left_highs and current_high >= right_highs:
                    resistance_candidates.append(current_high)
            
            # Get most relevant levels
            current_price = df.iloc[-1]['close']
            
            # Support: highest level below current price
            valid_supports = [s for s in support_candidates if s < current_price]
            support = max(valid_supports) if valid_supports else df['low'].min()
            
            # Resistance: lowest level above current price
            valid_resistances = [r for r in resistance_candidates if r > current_price]
            resistance = min(valid_resistances) if valid_resistances else df['high'].max()
            
            return {'support': support, 'resistance': resistance}
            
        except Exception as e:
            logger.warning(f"Error finding support/resistance: {e}")
            return {
                'support': df['low'].min() if len(df) > 0 else 0,
                'resistance': df['high'].max() if len(df) > 0 else 0
            }
    
    @staticmethod
    def detect_trend(df: pd.DataFrame, period: int = 20) -> str:
        """Detect overall trend direction"""
        try:
            if len(df) < period:
                return 'SIDEWAYS'
            
            close_prices = df['close'].tail(period)
            ma_short = SimpleTA.sma(close_prices, period // 2)
            ma_long = SimpleTA.sma(close_prices, period)
            
            recent_short = ma_short.iloc[-1]
            recent_long = ma_long.iloc[-1]
            
            if recent_short > recent_long:
                return 'UPTREND'
            elif recent_short < recent_long:
                return 'DOWNTREND'
            else:
                return 'SIDEWAYS'
                
        except Exception as e:
            logger.warning(f"Error detecting trend: {e}")
            return 'SIDEWAYS'

class SimpleAnalyzer:
    """Main analyzer class using only RSI + Price Action"""
    
    def __init__(self):
        self.ta = SimpleTA()
        self.price_action = PriceActionAnalyzer()
    
    def analyze_market(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Complete market analysis with RSI + Price Action only"""
        try:
            if len(df) == 0 or len(df) < 20:
                logger.warning("Insufficient data for analysis")
                return self._get_default_analysis()
            
            close = df['close']
            high = df['high']
            low = df['low']
            current_price = close.iloc[-1]
            
            # RSI only (as requested)
            rsi = self.ta.rsi(close, 14)
            current_rsi = rsi.iloc[-1] if len(rsi) > 0 else 50
            
            # Price Action Analysis
            sr_levels = self.price_action.find_support_resistance(df)
            trend = self.price_action.detect_trend(df)
            
            # Simple trend based on price vs MA20
            ma20 = self.ta.sma(close, 20)
            current_ma20 = ma20.iloc[-1] if len(ma20) > 0 else current_price
            
            # Analysis results
            analysis = {
                'price': float(current_price),
                'rsi': float(current_rsi),
                'rsi_signal': self._interpret_rsi(current_rsi),
                'support': float(sr_levels['support']),
                'resistance': float(sr_levels['resistance']),
                'trend': trend,
                'ma20': float(current_ma20),
                'price_vs_ma20': 'ABOVE' if current_price > current_ma20 else 'BELOW',
                'overall_signal': self._get_overall_signal(current_rsi, trend, current_price, current_ma20),
                'confidence': self._calculate_confidence(current_rsi, trend),
                'timestamp': df.index[-1] if len(df) > 0 else None
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error in market analysis: {e}")
            return self._get_default_analysis()
    
    def _interpret_rsi(self, rsi: float) -> str:
        """Interpret RSI value"""
        if rsi >= 70:
            return 'OVERBOUGHT'
        elif rsi <= 30:
            return 'OVERSOLD'
        else:
            return 'NEUTRAL'
    
    def _get_overall_signal(self, rsi: float, trend: str, price: float, ma20: float) -> str:
        """Get overall market signal"""
        signals = []
        
        # RSI signals
        if rsi <= 30:
            signals.append('BUY')
        elif rsi >= 70:
            signals.append('SELL')
        
        # Trend signals
        if trend == 'UPTREND' and price > ma20:
            signals.append('BUY')
        elif trend == 'DOWNTREND' and price < ma20:
            signals.append('SELL')
        
        # Count signals
        buy_signals = signals.count('BUY')
        sell_signals = signals.count('SELL')
        
        if buy_signals > sell_signals:
            return 'BUY'
        elif sell_signals > buy_signals:
            return 'SELL'
        else:
            return 'NEUTRAL'
    
    def _calculate_confidence(self, rsi: float, trend: str) -> float:
        """Calculate confidence score"""
        confidence = 50.0  # Base confidence
        
        # RSI extreme values increase confidence
        if rsi <= 25 or rsi >= 75:
            confidence += 30
        elif rsi <= 30 or rsi >= 70:
            confidence += 20
        
        # Clear trend increases confidence
        if trend in ['UPTREND', 'DOWNTREND']:
            confidence += 15
        
        return min(confidence, 95.0)  # Max 95% confidence
    
    def _get_default_analysis(self) -> Dict[str, Any]:
        """Default analysis when data is insufficient"""
        return {
            'price': 0.0,
            'rsi': 50.0,
            'rsi_signal': 'NEUTRAL',
            'support': 0.0,
            'resistance': 0.0,
            'trend': 'SIDEWAYS',
            'ma20': 0.0,
            'price_vs_ma20': 'NEUTRAL',
            'overall_signal': 'NEUTRAL',
            'confidence': 0.0,
            'timestamp': None
        }