"""
Windows compatible analysis service using 'ta' library instead of TA-Lib
سرویس تحلیل سازگار با ویندوز با استفاده از کتابخانه 'ta' به جای TA-Lib
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging

# Use 'ta' library instead of TA-Lib for Windows compatibility
import ta
from ta.trend import EMAIndicator, SMAIndicator, MACD
from ta.momentum import RSIIndicator
from ta.volatility import BollingerBands
from ta.volume import VolumeSMAIndicator

logger = logging.getLogger(__name__)

class WindowsAnalysisService:
    """Windows-compatible analysis service"""
    
    def __init__(self):
        self.logger = logger
        self.logger.info("Windows Analysis Service initialized with 'ta' library")
    
    def calculate_rsi(self, data, window=14):
        """Calculate RSI using ta library"""
        try:
            if len(data) < window:
                return [50] * len(data)  # Default neutral RSI
            
            rsi_indicator = RSIIndicator(close=data, window=window)
            return rsi_indicator.rsi().fillna(50).tolist()
        except Exception as e:
            self.logger.error(f"Error calculating RSI: {e}")
            return [50] * len(data)
    
    def calculate_macd(self, data, fast=12, slow=26, signal=9):
        """Calculate MACD using ta library"""
        try:
            if len(data) < slow:
                return {'macd': [0] * len(data), 'signal': [0] * len(data), 'histogram': [0] * len(data)}
            
            macd_indicator = MACD(close=data, window_fast=fast, window_slow=slow, window_sign=signal)
            
            return {
                'macd': macd_indicator.macd().fillna(0).tolist(),
                'signal': macd_indicator.macd_signal().fillna(0).tolist(),
                'histogram': macd_indicator.macd_diff().fillna(0).tolist()
            }
        except Exception as e:
            self.logger.error(f"Error calculating MACD: {e}")
            return {'macd': [0] * len(data), 'signal': [0] * len(data), 'histogram': [0] * len(data)}
    
    def calculate_bollinger_bands(self, data, window=20, std_dev=2):
        """Calculate Bollinger Bands using ta library"""
        try:
            if len(data) < window:
                return {'upper': data, 'middle': data, 'lower': data}
            
            bb_indicator = BollingerBands(close=data, window=window, window_dev=std_dev)
            
            return {
                'upper': bb_indicator.bollinger_hband().fillna(data.iloc[-1]).tolist(),
                'middle': bb_indicator.bollinger_mavg().fillna(data.iloc[-1]).tolist(),
                'lower': bb_indicator.bollinger_lband().fillna(data.iloc[-1]).tolist()
            }
        except Exception as e:
            self.logger.error(f"Error calculating Bollinger Bands: {e}")
            return {'upper': data.tolist(), 'middle': data.tolist(), 'lower': data.tolist()}
    
    def calculate_moving_averages(self, data, periods=[20, 50, 200]):
        """Calculate multiple moving averages"""
        try:
            result = {}
            for period in periods:
                if len(data) >= period:
                    sma_indicator = SMAIndicator(close=data, window=period)
                    result[f'sma_{period}'] = sma_indicator.sma_indicator().fillna(data.iloc[-1]).tolist()
                    
                    ema_indicator = EMAIndicator(close=data, window=period)
                    result[f'ema_{period}'] = ema_indicator.ema_indicator().fillna(data.iloc[-1]).tolist()
                else:
                    result[f'sma_{period}'] = data.tolist()
                    result[f'ema_{period}'] = data.tolist()
            
            return result
        except Exception as e:
            self.logger.error(f"Error calculating moving averages: {e}")
            return {}
    
    def analyze_market_data(self, df, timeframe='H1'):
        """Complete market analysis for Windows"""
        try:
            if df.empty or len(df) < 50:
                return self.get_fallback_analysis()
            
            # Ensure we have the required columns
            if 'close' not in df.columns:
                if 'Close' in df.columns:
                    df['close'] = df['Close']
                else:
                    self.logger.error("No close price data found")
                    return self.get_fallback_analysis()
            
            close_prices = df['close']
            current_price = close_prices.iloc[-1]
            
            # Calculate technical indicators
            rsi = self.calculate_rsi(close_prices)
            macd_data = self.calculate_macd(close_prices)
            bb_data = self.calculate_bollinger_bands(close_prices)
            ma_data = self.calculate_moving_averages(close_prices)
            
            # Support and resistance levels
            high_prices = df.get('high', df.get('High', close_prices))
            low_prices = df.get('low', df.get('Low', close_prices))
            
            resistance = high_prices.rolling(window=20).max().iloc[-1]
            support = low_prices.rolling(window=20).min().iloc[-1]
            
            # Trend analysis
            sma_20 = ma_data.get('sma_20', [current_price])[-1]
            sma_50 = ma_data.get('sma_50', [current_price])[-1]
            
            if current_price > sma_20 > sma_50:
                trend = "صعودی"
            elif current_price < sma_20 < sma_50:
                trend = "نزولی"
            else:
                trend = "خنثی"
            
            # Smart Money Concepts (simplified for Windows)
            smc_analysis = self.analyze_smart_money_concepts(df)
            
            analysis_result = {
                'timestamp': datetime.now(),
                'timeframe': timeframe,
                'price': current_price,
                'rsi': rsi[-1] if rsi else 50,
                'macd': {
                    'value': macd_data['macd'][-1] if macd_data['macd'] else 0,
                    'signal': macd_data['signal'][-1] if macd_data['signal'] else 0,
                    'histogram': macd_data['histogram'][-1] if macd_data['histogram'] else 0
                },
                'bollinger_bands': {
                    'upper': bb_data['upper'][-1] if bb_data['upper'] else current_price,
                    'middle': bb_data['middle'][-1] if bb_data['middle'] else current_price,
                    'lower': bb_data['lower'][-1] if bb_data['lower'] else current_price
                },
                'ma_20': sma_20,
                'ma_50': sma_50,
                'support_level': support,
                'resistance_level': resistance,
                'trend': trend,
                'smc_analysis': smc_analysis,
                'signal_strength': self.calculate_signal_strength(rsi[-1] if rsi else 50, macd_data, trend)
            }
            
            return analysis_result
            
        except Exception as e:
            self.logger.error(f"Error in market analysis: {e}")
            return self.get_fallback_analysis()
    
    def analyze_smart_money_concepts(self, df):
        """Simplified SMC analysis for Windows"""
        try:
            close_prices = df['close']
            high_prices = df.get('high', df.get('High', close_prices))
            low_prices = df.get('low', df.get('Low', close_prices))
            
            # Simple BOS detection
            recent_highs = high_prices.rolling(window=10).max()
            recent_lows = low_prices.rolling(window=10).min()
            
            current_high = high_prices.iloc[-1]
            current_low = low_prices.iloc[-1]
            
            bos_detected = "بله" if current_high > recent_highs.iloc[-5] else "خیر"
            
            return {
                'bos_detected': bos_detected,
                'market_structure': "صعودی" if current_high > recent_highs.iloc[-10] else "نزولی",
                'liquidity_zones': {
                    'high': recent_highs.iloc[-1],
                    'low': recent_lows.iloc[-1]
                },
                'order_blocks': "شناسایی شده" if bos_detected == "بله" else "عدم وجود"
            }
        except Exception as e:
            self.logger.error(f"Error in SMC analysis: {e}")
            return {
                'bos_detected': "خیر",
                'market_structure': "خنثی",
                'liquidity_zones': {'high': 0, 'low': 0},
                'order_blocks': "عدم وجود"
            }
    
    def calculate_signal_strength(self, rsi, macd_data, trend):
        """Calculate overall signal strength"""
        try:
            strength = 0
            
            # RSI contribution
            if rsi > 70:
                strength -= 0.3  # Overbought
            elif rsi < 30:
                strength += 0.3  # Oversold
            
            # MACD contribution
            if macd_data['histogram'][-1] > 0:
                strength += 0.2
            else:
                strength -= 0.2
            
            # Trend contribution
            if trend == "صعودی":
                strength += 0.3
            elif trend == "نزولی":
                strength -= 0.3
            
            # Normalize to 0-100
            strength = max(0, min(100, (strength + 1) * 50))
            
            return strength
            
        except Exception as e:
            self.logger.error(f"Error calculating signal strength: {e}")
            return 50
    
    def get_fallback_analysis(self):
        """Fallback analysis for Windows when calculations fail"""
        return {
            'timestamp': datetime.now(),
            'timeframe': 'H1',
            'price': 2650.0,  # Approximate gold price
            'rsi': 50,
            'macd': {'value': 0, 'signal': 0, 'histogram': 0},
            'bollinger_bands': {'upper': 2670, 'middle': 2650, 'lower': 2630},
            'ma_20': 2650,
            'ma_50': 2645,
            'support_level': 2630,
            'resistance_level': 2670,
            'trend': 'خنثی',
            'smc_analysis': {
                'bos_detected': 'خیر',
                'market_structure': 'خنثی',
                'liquidity_zones': {'high': 2670, 'low': 2630},
                'order_blocks': 'عدم وجود'
            },
            'signal_strength': 50
        }

# Create Windows-compatible instance
windows_analysis_service = WindowsAnalysisService()

# Export functions for compatibility
def get_current_market_status():
    """Get current market status - Windows compatible"""
    try:
        from services.data_service import get_gold_data
        data = get_gold_data()
        
        if hasattr(data, 'empty') and data.empty:
            return windows_analysis_service.get_fallback_analysis()
        
        return windows_analysis_service.analyze_market_data(data)
    except Exception as e:
        logger.error(f"Error getting market status: {e}")
        return windows_analysis_service.get_fallback_analysis()