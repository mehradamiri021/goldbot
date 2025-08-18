#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MetaTrader 5 Data Service for Gold Trading Bot
سرویس دریافت داده از متاتریدر ۵ برای ربات تحلیل طلا
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

try:
    import MetaTrader5 as mt5
    MT5_AVAILABLE = True
    logger.info("MetaTrader5 module loaded successfully")
except ImportError:
    MT5_AVAILABLE = False
    logger.warning("MetaTrader5 module not available - Windows only package")
import time
from typing import Optional, Dict, List

logger = logging.getLogger(__name__)

class MT5DataService:
    def __init__(self):
        self.connected = False
        self.symbol = "XAUUSD"
        self.cache = {}
        self.cache_expiry = {}
        self.initialize_mt5()
    
    def initialize_mt5(self):
        """Initialize MetaTrader 5 connection"""
        if not MT5_AVAILABLE:
            logger.info("MetaTrader 5 not available on this platform")
            return False
            
        try:
            # Initialize MT5
            if not mt5.initialize():
                logger.error("❌ MetaTrader 5 initialization failed")
                logger.error(f"❌ MT5 Error: {mt5.last_error()}")
                return False
            
            # Get account info
            account_info = mt5.account_info()
            if account_info is None:
                logger.error("❌ Failed to get account info")
                return False
            
            self.connected = True
            logger.info(f"✅ MetaTrader 5 connected successfully")
            logger.info(f"Account: {account_info.login}")
            logger.info(f"Server: {account_info.server}")
            logger.info(f"Company: {account_info.company}")
            
            # Check if XAUUSD symbol is available
            if not self.check_symbol_availability():
                logger.warning("⚠️ XAUUSD symbol not available, using fallback data")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"❌ MT5 initialization error: {e}")
            self.connected = False
            return False
    
    def check_symbol_availability(self):
        """Check if XAUUSD symbol is available"""
        try:
            symbol_info = mt5.symbol_info(self.symbol)
            if symbol_info is None:
                logger.error(f"❌ Symbol {self.symbol} not found")
                return False
            
            if not symbol_info.visible:
                if not mt5.symbol_select(self.symbol, True):
                    logger.error(f"❌ Failed to select symbol {self.symbol}")
                    return False
            
            logger.info(f"✅ Symbol {self.symbol} is available")
            logger.info(f"Spread: {symbol_info.spread}")
            logger.info(f"Point: {symbol_info.point}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error checking symbol: {e}")
            return False
    
    def get_gold_data(self, timeframe='H1', limit=1000):
        """Get gold price data from MetaTrader 5"""
        if not self.connected:
            logger.warning("⚠️ MT5 not connected, attempting reconnection...")
            if not self.initialize_mt5():
                logger.error("❌ Failed to reconnect to MT5, using fallback data")
                return self._generate_fallback_data(timeframe, limit)
        
        try:
            cache_key = f"{timeframe}_{limit}"
            current_time = datetime.now()
            
            # Check cache
            if cache_key in self.cache:
                if current_time < self.cache_expiry[cache_key]:
                    logger.info(f"Using cached MT5 data for {cache_key}")
                    return self.cache[cache_key]
            
            # Convert timeframe to MT5 format
            mt5_timeframe = self._convert_timeframe(timeframe)
            if mt5_timeframe is None:
                logger.error(f"❌ Invalid timeframe: {timeframe}")
                return self._generate_fallback_data(timeframe, limit)
            
            # Get current time and calculate start time
            utc_to = datetime.now()
            utc_from = utc_to - timedelta(days=self._get_days_for_limit(timeframe, limit))
            
            # Get rates from MT5
            rates = mt5.copy_rates_range(self.symbol, mt5_timeframe, utc_from, utc_to)
            
            if rates is None or len(rates) == 0:
                logger.error(f"❌ No data received from MT5 for {self.symbol}")
                logger.error(f"MT5 Error: {mt5.last_error()}")
                return self._generate_fallback_data(timeframe, limit)
            
            # Convert to DataFrame
            df = pd.DataFrame(rates)
            
            # Convert time to datetime
            df['timestamp'] = pd.to_datetime(df['time'], unit='s')
            
            # Rename columns to match expected format
            df = df.rename(columns={
                'open': 'open',
                'high': 'high', 
                'low': 'low',
                'close': 'close',
                'tick_volume': 'volume'
            })
            
            # Select required columns
            df = df[['timestamp', 'open', 'high', 'low', 'close', 'volume']]
            
            # Sort by timestamp and get last 'limit' records
            df = df.sort_values('timestamp').tail(limit).reset_index(drop=True)
            
            # Cache the data
            cache_duration = self._get_cache_duration(timeframe)
            self.cache[cache_key] = df
            self.cache_expiry[cache_key] = current_time + timedelta(minutes=cache_duration)
            
            logger.info(f"✅ Successfully fetched {len(df)} candles from MT5 for {timeframe}")
            logger.info(f"Latest price: {df.iloc[-1]['close']:.2f}")
            
            return df
            
        except Exception as e:
            logger.error(f"❌ Error getting MT5 data: {e}")
            return self._generate_fallback_data(timeframe, limit)
    
    def get_current_price(self):
        """Get current gold price from MT5"""
        try:
            if not self.connected:
                if not self.initialize_mt5():
                    return None
            
            tick = mt5.symbol_info_tick(self.symbol)
            if tick is None:
                logger.error(f"❌ Failed to get current price for {self.symbol}")
                return None
            
            return {
                'bid': tick.bid,
                'ask': tick.ask,
                'time': datetime.fromtimestamp(tick.time),
                'spread': tick.ask - tick.bid
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting current price: {e}")
            return None
    
    def get_market_info(self):
        """Get market information for XAUUSD"""
        try:
            if not self.connected:
                if not self.initialize_mt5():
                    return None
            
            symbol_info = mt5.symbol_info(self.symbol)
            if symbol_info is None:
                return None
            
            return {
                'symbol': symbol_info.name,
                'spread': symbol_info.spread,
                'digits': symbol_info.digits,
                'point': symbol_info.point,
                'trade_mode': symbol_info.trade_mode,
                'min_lot': symbol_info.volume_min,
                'max_lot': symbol_info.volume_max,
                'lot_step': symbol_info.volume_step,
                'margin_initial': symbol_info.margin_initial,
                'swap_long': symbol_info.swap_long,
                'swap_short': symbol_info.swap_short
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting market info: {e}")
            return None
    
    def _convert_timeframe(self, timeframe):
        """Convert string timeframe to MT5 timeframe constant"""
        timeframe_map = {
            'M1': mt5.TIMEFRAME_M1,
            'M5': mt5.TIMEFRAME_M5,
            'M15': mt5.TIMEFRAME_M15,
            'M30': mt5.TIMEFRAME_M30,
            'H1': mt5.TIMEFRAME_H1,
            'H4': mt5.TIMEFRAME_H4,
            'D1': mt5.TIMEFRAME_D1,
            'W1': mt5.TIMEFRAME_W1,
            'MN1': mt5.TIMEFRAME_MN1
        }
        return timeframe_map.get(timeframe)
    
    def _get_days_for_limit(self, timeframe, limit):
        """Calculate number of days needed for the given limit"""
        days_map = {
            'M1': limit / (24 * 60),
            'M5': limit / (24 * 12),
            'M15': limit / (24 * 4),
            'M30': limit / (24 * 2),
            'H1': limit / 24,
            'H4': limit / 6,
            'D1': limit,
            'W1': limit * 7,
            'MN1': limit * 30
        }
        return max(1, int(days_map.get(timeframe, limit / 24)))
    
    def _get_cache_duration(self, timeframe):
        """Get cache duration in minutes based on timeframe"""
        duration_map = {
            'M1': 1,
            'M5': 2,
            'M15': 5,
            'M30': 10,
            'H1': 15,
            'H4': 60,
            'D1': 240,
            'W1': 1440,
            'MN1': 10080
        }
        return duration_map.get(timeframe, 15)
    
    def _generate_fallback_data(self, timeframe='H1', limit=1000):
        """Generate realistic fallback gold price data when MT5 is unavailable"""
        try:
            logger.warning(f"⚠️ Using fallback demo data for {timeframe} - {limit} candles generated")
            
            # Base gold price around current market levels
            base_price = 2650.0
            
            # Time intervals based on timeframe
            intervals = {
                'M1': 1,     # 1 minute
                'M5': 5,     # 5 minutes
                'M15': 15,   # 15 minutes
                'M30': 30,   # 30 minutes
                'H1': 60,    # 1 hour
                'H4': 240,   # 4 hours
                'D1': 1440,  # 1 day
                'W1': 10080, # 1 week
                'MN1': 43200 # 1 month
            }
            
            interval_minutes = intervals.get(timeframe, 60)
            end_time = datetime.now()
            
            data = []
            current_price = base_price
            
            for i in range(limit):
                # Generate realistic price movements
                volatility = np.random.normal(0, 2.5)  # Gold volatility
                price_change = volatility
                
                # Add some trend and mean reversion
                if i % 50 == 0:  # Trend changes
                    trend = np.random.uniform(-0.5, 0.5)
                else:
                    trend = 0
                
                # Calculate OHLC
                open_price = current_price
                
                # Random high/low within reasonable range
                high_offset = abs(np.random.normal(0, 1.5))
                low_offset = abs(np.random.normal(0, 1.5))
                
                high_price = open_price + high_offset
                low_price = open_price - low_offset
                
                close_price = open_price + price_change + trend
                
                # Ensure high is highest and low is lowest
                high_price = max(high_price, open_price, close_price)
                low_price = min(low_price, open_price, close_price)
                
                # Calculate timestamp
                timestamp = end_time - timedelta(minutes=interval_minutes * (limit - i - 1))
                
                data.append({
                    'timestamp': timestamp,
                    'open': round(open_price, 2),
                    'high': round(high_price, 2),
                    'low': round(low_price, 2),
                    'close': round(close_price, 2),
                    'volume': np.random.randint(1000, 5000)
                })
                
                current_price = close_price
                
                # Add some mean reversion
                if abs(current_price - base_price) > 50:
                    current_price += (base_price - current_price) * 0.1
            
            df = pd.DataFrame(data)
            df = df.sort_values('timestamp')
            
            return df
            
        except Exception as e:
            logger.error(f"❌ Error generating fallback data: {e}")
            # Return minimal fallback
            return pd.DataFrame({
                'timestamp': [datetime.now()],
                'open': [2650.0],
                'high': [2655.0],
                'low': [2645.0],
                'close': [2652.0],
                'volume': [1000]
            })
    
    def test_connection(self):
        """Test MetaTrader 5 connection"""
        try:
            if not self.connected:
                return self.initialize_mt5()
            
            # Test by getting current price
            current_price = self.get_current_price()
            if current_price:
                logger.info(f"✅ MT5 connection test successful - Current price: {current_price['bid']:.2f}")
                return True
            else:
                logger.error("❌ MT5 connection test failed")
                return False
                
        except Exception as e:
            logger.error(f"❌ MT5 connection test error: {e}")
            return False
    
    def close_connection(self):
        """Close MetaTrader 5 connection"""
        try:
            if self.connected:
                mt5.shutdown()
                self.connected = False
                logger.info("✅ MT5 connection closed")
        except Exception as e:
            logger.error(f"❌ Error closing MT5 connection: {e}")
    
    def __del__(self):
        """Destructor to ensure MT5 connection is closed"""
        self.close_connection()


# Global instance for use across the application
mt5_service = MT5DataService()