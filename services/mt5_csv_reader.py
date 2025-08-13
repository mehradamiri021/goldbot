"""
MetaTrader 5 CSV Reader for Wine Installation
خواننده فایل‌های CSV متاتریدر 5 در محیط Wine

Real-time data from MT5 CSV files exported by Expert Advisor
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)

class MT5CSVReader:
    def __init__(self, csv_path=None):
        """
        Initialize MT5 CSV Reader
        
        Args:
            csv_path (str): Path to MT5 CSV files directory (auto-detect if None)
        """
        # Auto-detect CSV path if not provided
        if csv_path is None:
            try:
                from config.mt5_config import get_mt5_csv_path, get_csv_files
                self.csv_path = Path(get_mt5_csv_path())
                self.timeframes = get_csv_files()
            except ImportError:
                # Fallback to default
                self.csv_path = Path("./data/mt5_csv/")
                self.timeframes = {
                    'M1': 'XAUUSD_M1.csv',
                    'M5': 'XAUUSD_M5.csv', 
                    'M15': 'XAUUSD_M15.csv',
                    'H1': 'XAUUSD_H1.csv',
                    'H4': 'XAUUSD_H4.csv',
                    'D1': 'XAUUSD_D1.csv',
                    'W1': 'XAUUSD_W1.csv'
                }
        else:
            self.csv_path = Path(csv_path)
            # Default timeframes
            self.timeframes = {
                'M1': 'XAUUSD_M1.csv',
                'M5': 'XAUUSD_M5.csv', 
                'M15': 'XAUUSD_M15.csv',
                'H1': 'XAUUSD_H1.csv',
                'H4': 'XAUUSD_H4.csv',
                'D1': 'XAUUSD_D1.csv',
                'W1': 'XAUUSD_W1.csv'
            }
        
        self.symbol = "XAUUSD"
        self.cache = {}
        self.cache_timestamps = {}
        
        logger.info(f"🏗️ MT5 CSV Reader initialized for path: {self.csv_path}")
        
        # Create directory if it doesn't exist (for testing)
        if not self.csv_path.exists():
            logger.warning(f"⚠️ MT5 CSV directory not found: {self.csv_path}")
            logger.info("💡 Creating directory for testing purposes...")
            try:
                self.csv_path.mkdir(parents=True, exist_ok=True)
                logger.info(f"📁 Created directory: {self.csv_path}")
            except Exception as e:
                logger.error(f"❌ Failed to create directory: {e}")
        
    def test_connection(self):
        """Test if MT5 CSV files are accessible and updated"""
        try:
            # Check if directory exists
            if not self.csv_path.exists():
                logger.error(f"❌ MT5 CSV directory not found: {self.csv_path}")
                return False
            
            # Check if H1 file exists and is recent
            h1_file = self.csv_path / self.timeframes['H1']
            if not h1_file.exists():
                logger.error(f"❌ MT5 H1 CSV file not found: {h1_file}")
                return False
            
            # Check file modification time (should be recent)
            file_mtime = datetime.fromtimestamp(h1_file.stat().st_mtime)
            time_diff = datetime.now() - file_mtime
            
            if time_diff > timedelta(hours=2):
                logger.warning(f"⚠️ MT5 CSV file is old ({time_diff}), but continuing...")
            
            # Try to read a few lines
            test_df = self._read_csv_file(h1_file, limit=5)
            if test_df is None or len(test_df) == 0:
                logger.error("❌ Unable to read MT5 CSV data")
                return False
            
            logger.info(f"✅ MT5 CSV connection successful - {len(test_df)} test candles")
            logger.info(f"📊 Latest candle: {test_df.iloc[-1]['timestamp']} - Price: ${test_df.iloc[-1]['close']:.2f}")
            return True
            
        except Exception as e:
            logger.error(f"❌ MT5 CSV connection test failed: {e}")
            return False
    
    def _read_csv_file(self, file_path, limit=1000):
        """Read and parse MT5 CSV file"""
        try:
            if not file_path.exists():
                logger.error(f"CSV file not found: {file_path}")
                return None
            
            # Read CSV file
            # MT5 CSV format: DateTime;Open;High;Low;Close;Volume
            from config.mt5_config import MT5Config
            df = pd.read_csv(
                file_path,
                sep=MT5Config.CSV_SEPARATOR,
                names=MT5Config.CSV_COLUMNS,
                parse_dates=['datetime'],
                date_parser=lambda x: pd.to_datetime(x, format=MT5Config.DATE_FORMAT)
            )
            
            # Clean and validate data
            df = df.dropna()
            df = df[df['close'] > 0]  # Remove invalid prices
            
            # Rename datetime to timestamp for consistency
            df = df.rename(columns={'datetime': 'timestamp'})
            
            # Ensure numeric types
            for col in ['open', 'high', 'low', 'close']:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            df['volume'] = pd.to_numeric(df['volume'], errors='coerce').fillna(0).astype(int)
            
            # Sort by timestamp and get latest data
            df = df.sort_values('timestamp').tail(limit).reset_index(drop=True)
            
            logger.debug(f"📊 Read {len(df)} candles from {file_path.name}")
            return df
            
        except Exception as e:
            logger.error(f"❌ Error reading CSV file {file_path}: {e}")
            return None
    
    def get_gold_data(self, timeframe='H1', limit=1000):
        """
        Get gold data from MT5 CSV files
        
        Args:
            timeframe (str): Timeframe (M1, M5, M15, H1, H4, D1, W1)
            limit (int): Number of candles to return
            
        Returns:
            pd.DataFrame: OHLCV data with timestamp
        """
        try:
            if timeframe not in self.timeframes:
                logger.error(f"❌ Unsupported timeframe: {timeframe}")
                logger.info(f"Available timeframes: {list(self.timeframes.keys())}")
                return None
            
            csv_filename = self.timeframes[timeframe]
            csv_file_path = self.csv_path / csv_filename
            
            # Check cache validity
            cache_key = f"{timeframe}_{limit}"
            if self._is_cache_valid(cache_key, csv_file_path):
                logger.info(f"📦 Using cached {timeframe} data")
                return self.cache[cache_key]
            
            logger.info(f"📊 Reading {timeframe} data from MT5 CSV: {csv_filename}")
            
            # Read CSV file
            df = self._read_csv_file(csv_file_path, limit)
            if df is None or len(df) == 0:
                logger.error(f"❌ No data available for {timeframe}")
                return None
            
            # Cache the result
            self._cache_data(cache_key, df, csv_file_path)
            
            logger.info(f"✅ Successfully loaded {len(df)} {timeframe} candles from MT5")
            logger.info(f"📈 Price range: ${df['low'].min():.2f} - ${df['high'].max():.2f}")
            logger.info(f"🕐 Latest: {df.iloc[-1]['timestamp']} - ${df.iloc[-1]['close']:.2f}")
            
            return df
            
        except Exception as e:
            logger.error(f"❌ Error getting {timeframe} data from MT5: {e}")
            return None
    
    def get_current_price(self):
        """Get current gold price from latest M1 data"""
        try:
            df = self.get_gold_data('M1', 1)
            if df is not None and len(df) > 0:
                latest = df.iloc[-1]
                return {
                    'price': float(latest['close']),
                    'bid': float(latest['close']) - 0.5,  # Approximate spread
                    'ask': float(latest['close']) + 0.5,
                    'timestamp': latest['timestamp'],
                    'volume': int(latest['volume'])
                }
            return None
        except Exception as e:
            logger.error(f"❌ Error getting current price: {e}")
            return None
    
    def get_latest_candle(self, timeframe='H1'):
        """Get the most recent complete candle"""
        try:
            df = self.get_gold_data(timeframe, 1)
            if df is not None and len(df) > 0:
                return df.iloc[-1].to_dict()
            return None
        except Exception as e:
            logger.error(f"❌ Error getting latest candle: {e}")
            return None
    
    def _is_cache_valid(self, cache_key, csv_file_path):
        """Check if cached data is still valid based on file modification time"""
        try:
            if cache_key not in self.cache:
                return False
            
            if cache_key not in self.cache_timestamps:
                return False
            
            # Check if CSV file has been modified since cache
            file_mtime = datetime.fromtimestamp(csv_file_path.stat().st_mtime)
            cache_time = self.cache_timestamps[cache_key]
            
            return file_mtime <= cache_time
            
        except Exception as e:
            logger.debug(f"Cache validation error: {e}")
            return False
    
    def _cache_data(self, cache_key, data, csv_file_path):
        """Cache data with file modification timestamp"""
        try:
            self.cache[cache_key] = data.copy()
            self.cache_timestamps[cache_key] = datetime.fromtimestamp(csv_file_path.stat().st_mtime)
            logger.debug(f"📦 Cached {cache_key}")
        except Exception as e:
            logger.warning(f"⚠️ Cache save error: {e}")
    
    def get_data_status(self):
        """Get status of all available CSV files"""
        status = {}
        
        for tf, filename in self.timeframes.items():
            file_path = self.csv_path / filename
            
            if file_path.exists():
                try:
                    file_size = file_path.stat().st_size
                    file_mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
                    
                    # Count lines quickly
                    with open(file_path, 'r') as f:
                        line_count = sum(1 for line in f)
                    
                    status[tf] = {
                        'available': True,
                        'size_kb': file_size // 1024,
                        'last_update': file_mtime,
                        'record_count': line_count,
                        'age_minutes': (datetime.now() - file_mtime).total_seconds() / 60
                    }
                except Exception as e:
                    status[tf] = {
                        'available': False,
                        'error': str(e)
                    }
            else:
                status[tf] = {
                    'available': False,
                    'error': 'File not found'
                }
        
        return status
    
    def clear_cache(self):
        """Clear all cached data"""
        self.cache.clear()
        self.cache_timestamps.clear()
        logger.info("🗑️ MT5 CSV cache cleared")

# Global instance
mt5_csv_reader = MT5CSVReader()

def get_mt5_data(timeframe='H1', limit=1000):
    """Convenience function to get MT5 data"""
    return mt5_csv_reader.get_gold_data(timeframe, limit)

def get_mt5_current_price():
    """Convenience function to get current price"""
    return mt5_csv_reader.get_current_price()

def test_mt5_connection():
    """Test MT5 CSV connection"""
    return mt5_csv_reader.test_connection()