import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class GoldDataService:
    def __init__(self):
        # Primary data source: MT5 CSV files (Wine installation)
        self.use_mt5_csv = True
        self.mt5_csv_reader = None
        
        # Backup fallback only (disabled by default)
        self.use_fallback = False
        self.api_url = "http://46.100.50.194:5050/get_data"
        self.cache = {}
        self.cache_expiry = {}
        
        # Initialize MT5 CSV reader
        self._initialize_mt5_csv()
    
    def _initialize_mt5_csv(self):
        """Initialize MT5 CSV reader for Wine installation"""
        try:
            from services.mt5_csv_reader import mt5_csv_reader
            self.mt5_csv_reader = mt5_csv_reader
            
            if self.mt5_csv_reader.test_connection():
                logger.info("✅ MT5 CSV reader initialized successfully")
                logger.info("🏗️ Using MetaTrader 5 data from Wine installation")
                self.use_mt5_csv = True
            else:
                logger.error("❌ MT5 CSV files not accessible")
                logger.warning("⚠️ Check MT5 Wine installation and CSV export")
                self.use_mt5_csv = False
                self.use_fallback = True
        except Exception as e:
            logger.error(f"❌ Error initializing MT5 CSV reader: {e}")
            self.use_mt5_csv = False
            self.use_fallback = True
    
    def get_gold_data(self, timeframe='H1', limit=1000):
        """Get gold price data from MT5 CSV files (Wine installation)"""
        
        # Primary source: MT5 CSV files
        if self.use_mt5_csv and self.mt5_csv_reader:
            try:
                logger.info(f"🏗️ Getting {timeframe} data from MT5 CSV files...")
                df = self.mt5_csv_reader.get_gold_data(timeframe, limit)
                if df is not None and len(df) > 0:
                    logger.info(f"✅ Successfully got {len(df)} candles from MT5 CSV")
                    logger.info(f"📊 Latest price: ${df.iloc[-1]['close']:.2f}")
                    return df
                else:
                    logger.error("❌ MT5 CSV returned empty data")
            except Exception as e:
                logger.error(f"❌ MT5 CSV error: {e}")
                
        # Emergency fallback only if MT5 completely fails
        if self.use_fallback:
            logger.warning("⚠️ Using emergency fallback data")
            return self._get_api_data(timeframe, limit)
        else:
            logger.error("❌ No data source available - MT5 CSV files required")
            return None
    
    def _get_api_data(self, timeframe='H1', limit=1000):
        """Get gold price data from external API"""
        try:
            cache_key = f"api_{timeframe}_{limit}"
            current_time = datetime.now()
            
            # Check cache
            if cache_key in self.cache:
                if current_time < self.cache_expiry[cache_key]:
                    logger.info(f"Using cached API data for {cache_key}")
                    return self.cache[cache_key]
            
            params = {
                'symbol': 'XAUUSD',
                'timeframe': timeframe,
                'limit': limit
            }
            
            logger.info(f"📡 Fetching data from external API: {self.api_url}")
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
            
            # Cache the data
            cache_duration = {
                'M15': 5,
                'H1': 15,
                'H4': 60,
                'D1': 240
            }.get(timeframe, 15)
            
            self.cache[cache_key] = df
            self.cache_expiry[cache_key] = current_time + timedelta(minutes=cache_duration)
            
            logger.info(f"✅ Successfully fetched {len(df)} candles from API for {timeframe}")
            return df
            
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ API request error: {e}")
            # Generate fallback demo data
            return self._generate_fallback_data(timeframe, limit)
            
        except Exception as e:
            logger.error(f"❌ Error processing API response: {e}")
            # Generate fallback demo data
            return self._generate_fallback_data(timeframe, limit)
    
    def get_current_price(self):
        """Get current gold price from MT5 CSV"""
        try:
            if self.use_mt5_csv and self.mt5_csv_reader:
                price_data = self.mt5_csv_reader.get_current_price()
                if price_data:
                    logger.info(f"💰 Current gold price: ${price_data['price']:.2f}")
                    return price_data['price']
            
            # Fallback: get from latest 1-minute data
            df = self.get_gold_data('M1', 1)
            if df is not None and len(df) > 0:
                current_price = float(df.iloc[-1]['close'])
                logger.info(f"💰 Current gold price: ${current_price:.2f}")
                return current_price
            else:
                logger.warning("⚠️ Unable to get current price")
                return None
        except Exception as e:
            logger.error(f"❌ Error getting current price: {e}")
            return None
    
    def get_market_info(self):
        """Get market information"""
        # Return standard gold market info
        return {
            'symbol': 'XAUUSD',
            'spread': 0.5,
            'digits': 2,
            'point': 0.01,
            'min_lot': 0.01,
            'max_lot': 100.0,
            'lot_step': 0.01,
            'source': 'MT5_CSV'
        }
    
    def _generate_fallback_data(self, timeframe='H1', limit=1000):
        """Generate realistic fallback gold price data when API is unavailable"""
        try:
            logger.warning(f"Using fallback demo data for {timeframe} - {limit+1} candles generated")
            
            # Base gold price around current market levels
            base_price = 2650.0
            
            # Generate timestamps
            from datetime import datetime, timedelta
            
            # Time intervals based on timeframe
            intervals = {
                'M15': 15,  # 15 minutes
                'H1': 60,   # 1 hour
                'H4': 240,  # 4 hours
                'D1': 1440  # 1 day
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
            logger.error(f"Error generating fallback data: {e}")
            # Return minimal fallback
            from datetime import datetime
            return pd.DataFrame({
                'timestamp': [datetime.now()],
                'open': [2650.0],
                'high': [2655.0],
                'low': [2645.0],
                'close': [2652.0],
                'volume': [1000]
            })
    
    def test_connections(self):
        """Test MT5 CSV data source connection"""
        results = {
            'mt5_csv': False,
            'fallback': False,
            'status': 'No data sources available'
        }
        
        # Test MT5 CSV connection
        if self.use_mt5_csv and self.mt5_csv_reader:
            try:
                results['mt5_csv'] = self.mt5_csv_reader.test_connection()
                if results['mt5_csv']:
                    results['status'] = 'MT5 CSV files connected'
                    logger.info("✅ MT5 CSV connection test passed")
                    
                    # Get status of all CSV files
                    status = self.mt5_csv_reader.get_data_status()
                    available_timeframes = [tf for tf, info in status.items() if info.get('available', False)]
                    results['available_timeframes'] = available_timeframes
                    results['csv_status'] = status
                else:
                    results['status'] = 'MT5 CSV files not accessible'
            except Exception as e:
                logger.error(f"❌ MT5 CSV connection test failed: {e}")
                results['status'] = f'MT5 CSV error: {e}'
        
        # Test fallback if enabled
        if self.use_fallback:
            try:
                params = {
                    'symbol': 'XAUUSD',
                    'timeframe': 'H1', 
                    'limit': 10
                }
                response = requests.get(self.api_url, params=params, timeout=10)
                response.raise_for_status()
                results['fallback'] = True
                if not results['mt5_csv']:
                    results['status'] = 'Using fallback API (MT5 CSV unavailable)'
            except Exception as e:
                logger.error(f"❌ Fallback API failed: {e}")
                if not results['mt5_csv']:
                    results['status'] = 'All data sources failed'
        
        return results


# Global instance for use across the application
data_service = GoldDataService()

def get_gold_data(timeframe='H1', limit=1000):
    """Convenience function to get gold data"""
    return data_service.get_gold_data(timeframe, limit)

def get_multiple_timeframes():
    """Convenience function to get multiple timeframes"""
    timeframes = ['M15', 'H1', 'H4', 'D1']
    data = {}
    
    for tf in timeframes:
        try:
            limit = {'M15': 200, 'H1': 200, 'H4': 100, 'D1': 50}[tf]
            data[tf] = data_service.get_gold_data(tf, limit)
            logger.info(f"Fetched {len(data[tf])} candles for {tf}")
        except Exception as e:
            logger.error(f"Error fetching {tf} data: {e}")
            data[tf] = None
    
    return data

def get_current_price():
    """Convenience function to get current price"""
    current_price = data_service.get_current_price()
    if current_price and isinstance(current_price, dict):
        return current_price.get('bid', current_price.get('close', 2650.0))
    return 2650.0  # Default fallback price
