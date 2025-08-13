"""
MT5 Configuration for CSV Data Source
تنظیمات متاتریدر 5 برای منبع داده CSV
"""

import os
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# MT5 CSV Configuration
class MT5Config:
    # Get configuration from environment variables with fallbacks
    @staticmethod
    def get_data_dir():
        """Get MT5 data directory from environment or use fallback"""
        # Primary: DATA_DIR environment variable (user preferred method)
        data_dir = os.environ.get('DATA_DIR')
        if data_dir and Path(data_dir).exists():
            logger.info(f"✅ Using DATA_DIR from environment: {data_dir}")
            return data_dir
        
        # Secondary: MT5_CSV_PATH for backward compatibility  
        csv_path = os.environ.get('MT5_CSV_PATH')
        if csv_path:
            csv_path = csv_path.rstrip('/')  # Remove trailing slash
            if Path(csv_path).exists():
                logger.info(f"✅ Using MT5_CSV_PATH from environment: {csv_path}")
                return csv_path
        
        # Fallback to default paths
        return MT5Config.find_mt5_path()
    
    @staticmethod
    def get_symbol():
        """Get trading symbol from environment"""
        return os.environ.get('SYMBOL', 'XAUUSD')
    
    @staticmethod
    def get_timeframes():
        """Get timeframes list from environment"""
        timeframes_str = os.environ.get('TIMEFRAMES', 'M1,M5,M15,H1,H4,D1,W1')
        return [tf.strip() for tf in timeframes_str.split(',')]
    
    # Default path for Wine MT5 installation on Linux server (your exact path)
    DEFAULT_CSV_PATH = "/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files"
    
    # Alternative paths to check (in order of preference)
    ALTERNATIVE_PATHS = [
        "/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files",  # Your primary server path
        "/home/trader/.wine/drive_c/Program Files/MetaTrader 5/MQL5/Files",
        "/home/trader/.wine/drive_c/MT5/MQL5/Files",
        "/root/.wine/drive_c/MT5-CX/MQL5/Files",
        "/root/.wine_mt5/drive_c/MT5-CX/MQL5/Files",
        "./data/mt5_csv",  # Local fallback for testing
        "./mt5_data"       # Alternative local path
    ]
    
    @staticmethod
    def find_mt5_path():
        """Find the first available MT5 data path"""
        # First try the default path (your specific setup)
        if Path(MT5Config.DEFAULT_CSV_PATH).exists():
            logger.info(f"✅ Found MT5 data at default path: {MT5Config.DEFAULT_CSV_PATH}")
            return MT5Config.DEFAULT_CSV_PATH
        
        # Try alternative paths
        for path in MT5Config.ALTERNATIVE_PATHS:
            if Path(path).exists():
                logger.info(f"✅ Found MT5 data at alternative path: {path}")
                return path
        
        # No valid path found - use default and log warning
        logger.warning(f"⚠️ No MT5 data directory found. Using default: {MT5Config.DEFAULT_CSV_PATH}")
        return MT5Config.DEFAULT_CSV_PATH
    
    @classmethod
    def get_csv_path(cls):
        """Legacy method for backward compatibility"""
        return cls.get_data_dir()
    
    # CSV file names for different timeframes
    CSV_FILES = {
        'M1': 'XAUUSD_M1.csv',
        'M5': 'XAUUSD_M5.csv', 
        'M15': 'XAUUSD_M15.csv',
        'H1': 'XAUUSD_H1.csv',
        'H4': 'XAUUSD_H4.csv',
        'D1': 'XAUUSD_D1.csv',
        'W1': 'XAUUSD_W1.csv'
    }
    
    # CSV format configuration
    CSV_SEPARATOR = ';'
    CSV_COLUMNS = ['datetime', 'open', 'high', 'low', 'close', 'volume']
    DATE_FORMAT = '%Y.%m.%d %H:%M:%S'

# For easy import
def get_mt5_csv_path():
    """Convenience function to get MT5 CSV path"""
    return MT5Config.get_data_dir()

def get_csv_files():
    """Convenience function to get CSV file mapping"""
    return MT5Config.CSV_FILES.copy()
    
    @classmethod
    def get_csv_path(cls):
        """Get the correct CSV path for this system"""
        
        # Check environment variable first
        env_path = os.getenv('MT5_CSV_PATH')
        if env_path and os.path.exists(env_path):
            return env_path
            
        # Check default path
        if os.path.exists(cls.DEFAULT_CSV_PATH):
            return cls.DEFAULT_CSV_PATH
        
        # Check alternative paths
        for path in cls.ALTERNATIVE_PATHS:
            if os.path.exists(path):
                return path
        
        # Return default even if it doesn't exist (will be created or cause error)
        return cls.DEFAULT_CSV_PATH
    
    # CSV file names for different timeframes
    CSV_FILES = {
        'M1': 'XAUUSD_M1.csv',
        'M5': 'XAUUSD_M5.csv', 
        'M15': 'XAUUSD_M15.csv',
        'H1': 'XAUUSD_H1.csv',
        'H4': 'XAUUSD_H4.csv',
        'D1': 'XAUUSD_D1.csv',
        'W1': 'XAUUSD_W1.csv'
    }
    
    # CSV format configuration
    CSV_SEPARATOR = ';'
    CSV_COLUMNS = ['datetime', 'open', 'high', 'low', 'close', 'volume']
    DATE_FORMAT = '%Y.%m.%d %H:%M:%S'

# For easy import
def get_mt5_csv_path():
    """Convenience function to get MT5 CSV path"""
    return MT5Config.get_csv_path()

def get_csv_files():
    """Convenience function to get CSV file mapping"""
    return MT5Config.CSV_FILES.copy()