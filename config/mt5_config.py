"""
MT5 Configuration for CSV Data Source
تنظیمات متاتریدر 5 برای منبع داده CSV
"""

import os

# MT5 CSV Configuration
class MT5Config:
    # Default path for Wine MT5 installation on Linux server
    DEFAULT_CSV_PATH = "/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files/"
    
    # Alternative paths to check (in order)
    ALTERNATIVE_PATHS = [
        "/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files/",  # Primary path for production server
        "/home/trader/.wine/drive_c/Program Files/MetaTrader 5/MQL5/Files/",
        "/home/trader/.wine/drive_c/MT5/MQL5/Files/",
        "/root/.wine/drive_c/MT5-CX/MQL5/Files/",
        "/root/.wine_mt5/drive_c/MT5-CX/MQL5/Files/",
        "./data/mt5_csv/",  # Local fallback for testing
        "./mt5_data/"       # Alternative local path
    ]
    
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