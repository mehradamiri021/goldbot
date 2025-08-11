import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class GoldDataService:
    def __init__(self):
        # Pre-configured API URL - no need for manual setup
        self.api_url = "http://46.100.50.194:5050/get_data"
        self.cache = {}
        self.cache_expiry = {}
    
    def get_gold_data(self, timeframe='H1', limit=1000):
        """Get gold price data from API"""
        try:
            cache_key = f"{timeframe}_{limit}"
            current_time = datetime.now()
            
            # Check cache
            if cache_key in self.cache:
                if current_time < self.cache_expiry[cache_key]:
                    logger.info(f"Using cached data for {cache_key}")
                    return self.cache[cache_key]
            
            params = {
                'symbol': 'XAUUSD',
                'timeframe': timeframe,
                'limit': limit
            }
            
            response = requests.get(self.api_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Convert to DataFrame
            df = pd.DataFrame(data)
            
            # Ensure proper column names and types
            expected_columns = ['timestamp', 'open', 'high', 'low', 'close', 'volume']
            for col in expected_columns:
                if col not in df.columns:
                    logger.warning(f"Missing column: {col}")
                    if col == 'volume':
                        df[col] = 0
                    else:
                        raise ValueError(f"Required column {col} missing from API response")
            
            # Convert timestamp to datetime
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            # Convert price columns to float
            price_columns = ['open', 'high', 'low', 'close']
            for col in price_columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            
            # Sort by timestamp
            df = df.sort_values('timestamp')
            
            # Cache the data (5 minutes for M15, 15 minutes for H1, 1 hour for H4/D1)
            cache_duration = {
                'M15': 5,
                'H1': 15,
                'H4': 60,
                'D1': 240
            }.get(timeframe, 15)
            
            self.cache[cache_key] = df
            self.cache_expiry[cache_key] = current_time + timedelta(minutes=cache_duration)
            
            logger.info(f"Successfully fetched {len(df)} candles for {timeframe}")
            return df
            
        except requests.exceptions.RequestException as e:
            logger.error(f"API request error: {e}")
            # Return fallback data structure for demo/development
            return self._generate_fallback_data(timeframe, limit)
        except Exception as e:
            logger.error(f"Error processing gold data: {e}")
            return self._generate_fallback_data(timeframe, limit)
    
    def _generate_fallback_data(self, timeframe='H1', limit=100):
        """Generate fallback data when API is unavailable (for development/demo only)"""
        try:
            # Base price around current gold price
            base_price = 2650.00  # Approximate gold price
            
            # Generate timestamps
            if timeframe == 'M15':
                interval = timedelta(minutes=15)
            elif timeframe == 'H1':
                interval = timedelta(hours=1)
            elif timeframe == 'H4':
                interval = timedelta(hours=4)
            else:  # D1
                interval = timedelta(days=1)
            
            end_time = datetime.now()
            start_time = end_time - (interval * limit)
            
            timestamps = []
            current_time = start_time
            while current_time <= end_time:
                timestamps.append(current_time)
                current_time += interval
            
            # Generate realistic price data with trends
            data = []
            price = base_price
            
            for i, ts in enumerate(timestamps):
                # Add some random price movement
                change_percent = np.random.normal(0, 0.002)  # 0.2% volatility
                price_change = price * change_percent
                price += price_change
                
                # Ensure realistic OHLC relationships
                high = price + abs(np.random.normal(0, price * 0.001))
                low = price - abs(np.random.normal(0, price * 0.001))
                open_price = price + np.random.normal(0, price * 0.0005)
                close_price = price
                
                # Adjust if invalid OHLC
                high = max(high, open_price, close_price)
                low = min(low, open_price, close_price)
                
                data.append({
                    'timestamp': ts.strftime('%Y-%m-%d %H:%M:%S'),
                    'open': round(open_price, 2),
                    'high': round(high, 2),
                    'low': round(low, 2),
                    'close': round(close_price, 2),
                    'volume': np.random.randint(50, 500)
                })
            
            df = pd.DataFrame(data)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            logger.warning(f"Using fallback demo data for {timeframe} - {len(df)} candles generated")
            return df
            
        except Exception as e:
            logger.error(f"Error generating fallback data: {e}")
            return pd.DataFrame()  # Empty DataFrame
    
    def get_multiple_timeframes(self):
        """Get data for multiple timeframes"""
        timeframes = ['M15', 'H1', 'H4', 'D1']
        data = {}
        
        for tf in timeframes:
            try:
                limit = {'M15': 200, 'H1': 200, 'H4': 100, 'D1': 50}[tf]
                data[tf] = self.get_gold_data(tf, limit)
                logger.info(f"Fetched {len(data[tf])} candles for {tf}")
            except Exception as e:
                logger.error(f"Error fetching {tf} data: {e}")
                data[tf] = None
        
        return data
    
    def get_current_price(self):
        """Get current gold price"""
        try:
            df = self.get_gold_data('M15', 1)
            if not df.empty:
                return float(df.iloc[-1]['close'])
            return None
        except Exception as e:
            logger.error(f"Error getting current price: {e}")
            return None

# Global instance
data_service = GoldDataService()

def get_gold_data(timeframe='H1', limit=1000):
    """Convenience function to get gold data"""
    return data_service.get_gold_data(timeframe, limit)

def get_multiple_timeframes():
    """Convenience function to get multiple timeframes"""
    return data_service.get_multiple_timeframes()

def get_current_price():
    """Convenience function to get current price"""
    return data_service.get_current_price()
