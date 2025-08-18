"""
OANDA Data Service for Gold Trading Bot
سرویس دریافت داده از OANDA برای ربات تحلیل طلا

OANDA API Benefits:
- Real-time XAUUSD data
- High-quality historical data
- Reliable and fast
- Professional trading data
"""

import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class OandaDataService:
    def __init__(self, api_key=None, account_type='practice'):
        """
        Initialize OANDA data service
        
        Args:
            api_key (str): OANDA API key (will be requested if not provided)
            account_type (str): 'practice' or 'live'
        """
        self.api_key = api_key
        self.account_type = account_type
        
        # OANDA API endpoints
        if account_type == 'practice':
            self.base_url = "https://api-fxpractice.oanda.com"
        else:
            self.base_url = "https://api-fxtrade.oanda.com"
        
        self.headers = {
            'Authorization': f'Bearer {self.api_key}' if self.api_key else '',
            'Content-Type': 'application/json'
        }
        
        # Cache for performance
        self.cache = {}
        self.cache_expiry = {}
        
        logger.info(f"🏦 OANDA Data Service initialized ({account_type} mode)")
    
    def set_api_key(self, api_key):
        """Set API key after initialization"""
        self.api_key = api_key
        self.headers['Authorization'] = f'Bearer {api_key}'
        logger.info("✅ OANDA API key configured")
    
    def test_connection(self):
        """Test OANDA API connection"""
        try:
            if not self.api_key:
                logger.warning("⚠️ OANDA API key not provided")
                return False
            
            # Test with a simple account info request
            url = f"{self.base_url}/v3/accounts"
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                logger.info("✅ OANDA API connection successful")
                return True
            else:
                logger.error(f"❌ OANDA API error: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ OANDA connection test failed: {e}")
            return False
    
    def _convert_timeframe(self, timeframe):
        """Convert our timeframe to OANDA granularity"""
        mapping = {
            'M1': 'M1',
            'M5': 'M5', 
            'M15': 'M15',
            'M30': 'M30',
            'H1': 'H1',
            'H4': 'H4',
            'D1': 'D',
            'W1': 'W',
            'MN1': 'M'
        }
        return mapping.get(timeframe, 'H1')
    
    def get_gold_data(self, timeframe='H1', limit=1000):
        """
        Get XAUUSD data from OANDA
        
        Args:
            timeframe (str): Time frame (M1, M5, M15, M30, H1, H4, D1, W1, MN1)
            limit (int): Number of candles to fetch
            
        Returns:
            pd.DataFrame: OHLCV data with timestamp
        """
        try:
            if not self.api_key:
                logger.error("❌ OANDA API key required")
                return None
            
            # Check cache first
            cache_key = f"XAUUSD_{timeframe}_{limit}"
            if self._is_cache_valid(cache_key):
                logger.info(f"📦 Using cached data for {timeframe}")
                return self.cache[cache_key]
            
            # Convert timeframe
            granularity = self._convert_timeframe(timeframe)
            
            # Prepare request
            url = f"{self.base_url}/v3/instruments/XAU_USD/candles"
            params = {
                'granularity': granularity,
                'count': min(limit, 5000),  # OANDA max is 5000
                'price': 'MBA'  # Mid, Bid, Ask prices
            }
            
            logger.info(f"🏦 Fetching {timeframe} data from OANDA...")
            response = requests.get(url, headers=self.headers, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            candles = data.get('candles', [])
            
            if not candles:
                logger.warning("⚠️ No data received from OANDA")
                return None
            
            # Convert to DataFrame
            df_data = []
            for candle in candles:
                if candle.get('complete', True):  # Only complete candles
                    mid = candle.get('mid', {})
                    timestamp = candle.get('time', '')
                    
                    # Parse timestamp
                    dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    
                    df_data.append({
                        'timestamp': dt,
                        'open': float(mid.get('o', 0)),
                        'high': float(mid.get('h', 0)),
                        'low': float(mid.get('l', 0)),
                        'close': float(mid.get('c', 0)),
                        'volume': int(candle.get('volume', 0))
                    })
            
            if not df_data:
                logger.warning("⚠️ No valid candles processed")
                return None
            
            df = pd.DataFrame(df_data)
            df = df.sort_values('timestamp').reset_index(drop=True)
            
            # Cache the result
            self._cache_data(cache_key, df, timeframe)
            
            logger.info(f"✅ Retrieved {len(df)} candles from OANDA")
            return df
            
        except Exception as e:
            logger.error(f"❌ Error fetching OANDA data: {e}")
            return None
    
    def get_current_price(self):
        """Get current XAUUSD price from OANDA"""
        try:
            if not self.api_key:
                logger.error("❌ OANDA API key required")
                return None
            
            url = f"{self.base_url}/v3/instruments/XAU_USD/candles"
            params = {
                'granularity': 'M1',
                'count': 1,
                'price': 'MBA'
            }
            
            response = requests.get(url, headers=self.headers, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            candles = data.get('candles', [])
            
            if candles:
                latest = candles[-1]
                mid = latest.get('mid', {})
                bid = latest.get('bid', {})
                ask = latest.get('ask', {})
                
                return {
                    'bid': float(bid.get('c', 0)) if bid else float(mid.get('c', 0)),
                    'ask': float(ask.get('c', 0)) if ask else float(mid.get('c', 0)),
                    'mid': float(mid.get('c', 0)),
                    'spread': float(ask.get('c', 0)) - float(bid.get('c', 0)) if ask and bid else 0,
                    'time': datetime.now()
                }
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Error getting current price from OANDA: {e}")
            return None
    
    def get_market_info(self):
        """Get XAUUSD market information"""
        try:
            if not self.api_key:
                return None
            
            url = f"{self.base_url}/v3/instruments/XAU_USD"
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            instrument = data.get('instruments', [{}])[0]
            
            return {
                'symbol': 'XAUUSD',
                'display_name': instrument.get('displayName', 'Gold/USD'),
                'pip_location': instrument.get('pipLocation', -2),
                'margin_rate': float(instrument.get('marginRate', 0.02)),
                'minimum_trade_size': float(instrument.get('minimumTradeSize', 1)),
                'maximum_trade_size': float(instrument.get('maximumTradeSize', 100000)),
                'financing': instrument.get('financing', {})
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting market info: {e}")
            return None
    
    def _is_cache_valid(self, cache_key):
        """Check if cached data is still valid"""
        if cache_key not in self.cache:
            return False
        
        if cache_key not in self.cache_expiry:
            return False
        
        return datetime.now() < self.cache_expiry[cache_key]
    
    def _cache_data(self, cache_key, data, timeframe):
        """Cache data with appropriate expiry time"""
        # Set cache expiry based on timeframe
        expiry_minutes = {
            'M1': 1, 'M5': 2, 'M15': 5, 'M30': 10,
            'H1': 15, 'H4': 60, 'D1': 240, 'W1': 1440, 'MN1': 4320
        }
        
        minutes = expiry_minutes.get(timeframe, 15)
        expiry_time = datetime.now() + timedelta(minutes=minutes)
        
        self.cache[cache_key] = data
        self.cache_expiry[cache_key] = expiry_time
        
        logger.debug(f"📦 Cached {timeframe} data for {minutes} minutes")

# Global instance (will be initialized when API key is provided)
oanda_service = None

def initialize_oanda_service(api_key, account_type='practice'):
    """Initialize global OANDA service"""
    global oanda_service
    oanda_service = OandaDataService(api_key, account_type)
    return oanda_service

def get_oanda_data(timeframe='H1', limit=1000):
    """Convenience function to get OANDA data"""
    if oanda_service:
        return oanda_service.get_gold_data(timeframe, limit)
    return None

def get_oanda_current_price():
    """Convenience function to get current price"""
    if oanda_service:
        return oanda_service.get_current_price()
    return None