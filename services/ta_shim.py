"""
Technical Analysis Shim Layer
شیم لایه تحلیل تکنیکال

Provides unified interface for technical indicators using either:
- TA-Lib (if available) 
- pandas-ta (fallback)
"""

import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)

# Try importing TA-Lib first
# TA-Lib completely removed - using custom implementations
_ta = None
_pta = None
HAVE_TALIB = False
logger.info("✅ Using custom RSI implementation (no TA-Lib)")

class TA:
    """Unified technical analysis interface"""
    
    @staticmethod
    def rsi(series: pd.Series, length: int = 14) -> pd.Series:
        """Calculate RSI (Relative Strength Index) - Custom Implementation"""
        try:
            # Custom RSI calculation (no TA-Lib dependency)
            delta = series.diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=length).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=length).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            return rsi
        except Exception as e:
            logger.error(f"Error calculating RSI: {e}")
            return pd.Series([50] * len(series), index=series.index)
    
    @staticmethod
    def sma(series: pd.Series, length: int = 20) -> pd.Series:
        """Calculate Simple Moving Average"""
        try:
            if HAVE_TALIB:
                values = _ta.SMA(series.values.astype('float64'), timeperiod=length)
                return pd.Series(values, index=series.index)
            elif _pta:
                return _pta.sma(series, length=length)
            else:
                return series.rolling(window=length).mean()
        except Exception as e:
            logger.error(f"Error calculating SMA: {e}")
            return series.rolling(window=length).mean()
    
    @staticmethod
    def ema(series: pd.Series, length: int = 20) -> pd.Series:
        """Calculate Exponential Moving Average"""
        try:
            if HAVE_TALIB:
                values = _ta.EMA(series.values.astype('float64'), timeperiod=length)
                return pd.Series(values, index=series.index)
            elif _pta:
                return _pta.ema(series, length=length)
            else:
                return series.ewm(span=length).mean()
        except Exception as e:
            logger.error(f"Error calculating EMA: {e}")
            return series.ewm(span=length).mean()
    
    @staticmethod
    def macd(series: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> dict:
        """Calculate MACD (returns macd, signal, histogram)"""
        try:
            if HAVE_TALIB:
                macd, signal_line, histogram = _ta.MACD(
                    series.values.astype('float64'), 
                    fastperiod=fast, 
                    slowperiod=slow, 
                    signalperiod=signal
                )
                return {
                    'macd': pd.Series(macd, index=series.index),
                    'signal': pd.Series(signal_line, index=series.index),
                    'histogram': pd.Series(histogram, index=series.index)
                }
            elif _pta:
                macd_df = _pta.macd(series, fast=fast, slow=slow, signal=signal)
                return {
                    'macd': macd_df.iloc[:, 0],  # MACD line
                    'signal': macd_df.iloc[:, 2],  # Signal line
                    'histogram': macd_df.iloc[:, 1]   # Histogram
                }
            else:
                # Simple MACD calculation
                ema_fast = series.ewm(span=fast).mean()
                ema_slow = series.ewm(span=slow).mean()
                macd_line = ema_fast - ema_slow
                signal_line = macd_line.ewm(span=signal).mean()
                histogram = macd_line - signal_line
                return {
                    'macd': macd_line,
                    'signal': signal_line,
                    'histogram': histogram
                }
        except Exception as e:
            logger.error(f"Error calculating MACD: {e}")
            # Return empty series on error
            empty = pd.Series([0] * len(series), index=series.index)
            return {'macd': empty, 'signal': empty, 'histogram': empty}
    
    @staticmethod
    def bbands(series: pd.Series, length: int = 20, std: float = 2.0) -> dict:
        """Calculate Bollinger Bands (returns upper, middle, lower)"""
        try:
            if HAVE_TALIB:
                upper, middle, lower = _ta.BBANDS(
                    series.values.astype('float64'),
                    timeperiod=length,
                    nbdevup=std,
                    nbdevdn=std,
                    matype=0
                )
                return {
                    'upper': pd.Series(upper, index=series.index),
                    'middle': pd.Series(middle, index=series.index),
                    'lower': pd.Series(lower, index=series.index)
                }
            elif _pta:
                bb_df = _pta.bbands(series, length=length, std=std)
                return {
                    'upper': bb_df.iloc[:, 0],
                    'middle': bb_df.iloc[:, 1], 
                    'lower': bb_df.iloc[:, 2]
                }
            else:
                # Simple Bollinger Bands calculation
                middle = series.rolling(window=length).mean()
                rolling_std = series.rolling(window=length).std()
                upper = middle + (rolling_std * std)
                lower = middle - (rolling_std * std)
                return {'upper': upper, 'middle': middle, 'lower': lower}
        except Exception as e:
            logger.error(f"Error calculating Bollinger Bands: {e}")
            middle = series.rolling(window=length).mean()
            return {'upper': middle, 'middle': middle, 'lower': middle}
    
    @staticmethod
    def stoch(high: pd.Series, low: pd.Series, close: pd.Series, 
              k_period: int = 14, d_period: int = 3) -> dict:
        """Calculate Stochastic Oscillator (returns %K, %D)"""
        try:
            if HAVE_TALIB:
                k, d = _ta.STOCH(
                    high.values.astype('float64'),
                    low.values.astype('float64'),
                    close.values.astype('float64'),
                    fastk_period=k_period,
                    slowk_period=d_period,
                    slowd_period=d_period
                )
                return {
                    'k': pd.Series(k, index=close.index),
                    'd': pd.Series(d, index=close.index)
                }
            elif _pta:
                stoch_df = _pta.stoch(high, low, close, k=k_period, d=d_period)
                return {
                    'k': stoch_df.iloc[:, 0],
                    'd': stoch_df.iloc[:, 1]
                }
            else:
                # Simple Stochastic calculation
                lowest_low = low.rolling(window=k_period).min()
                highest_high = high.rolling(window=k_period).max()
                k_percent = 100 * ((close - lowest_low) / (highest_high - lowest_low))
                d_percent = k_percent.rolling(window=d_period).mean()
                return {'k': k_percent, 'd': d_percent}
        except Exception as e:
            logger.error(f"Error calculating Stochastic: {e}")
            empty = pd.Series([50] * len(close), index=close.index)
            return {'k': empty, 'd': empty}

    @staticmethod
    def atr(high: pd.Series, low: pd.Series, close: pd.Series, length: int = 14) -> pd.Series:
        """Calculate Average True Range"""
        try:
            if HAVE_TALIB:
                atr_values = _ta.ATR(
                    high.values.astype('float64'),
                    low.values.astype('float64'),
                    close.values.astype('float64'),
                    timeperiod=length
                )
                return pd.Series(atr_values, index=close.index)
            elif _pta:
                return _pta.atr(high, low, close, length=length)
            else:
                # Simple ATR calculation
                tr1 = high - low
                tr2 = (high - close.shift()).abs()
                tr3 = (low - close.shift()).abs()
                true_range = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
                return true_range.rolling(window=length).mean()
        except Exception as e:
            logger.error(f"Error calculating ATR: {e}")
            return pd.Series([1.0] * len(close), index=close.index)

# Convenience function for easy import
def get_ta():
    """Get TA class instance"""
    return TA()