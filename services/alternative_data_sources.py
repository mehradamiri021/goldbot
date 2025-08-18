"""
Alternative Data Sources for Gold Trading Bot
منابع جایگزین داده برای ربات تحلیل طلا

Best alternatives to OANDA API for real-time gold data
"""

import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
import json

logger = logging.getLogger(__name__)

class AlphaVantageService:
    """Alpha Vantage - Professional financial data API"""
    
    def __init__(self, api_key=None):
        self.api_key = api_key
        self.base_url = "https://www.alphavantage.co/query"
        self.cache = {}
        self.cache_expiry = {}
        
    def get_gold_data(self, timeframe='1h', limit=1000):
        """Get XAUUSD data from Alpha Vantage"""
        try:
            if not self.api_key:
                logger.error("Alpha Vantage API key required")
                return None
            
            # Map timeframes
            function_map = {
                '1min': 'FX_INTRADAY',
                '5min': 'FX_INTRADAY', 
                '15min': 'FX_INTRADAY',
                '30min': 'FX_INTRADAY',
                '1h': 'FX_INTRADAY',
                '1day': 'FX_DAILY'
            }
            
            params = {
                'function': function_map.get(timeframe, 'FX_INTRADAY'),
                'from_symbol': 'XAU',
                'to_symbol': 'USD',
                'interval': timeframe if timeframe != '1day' else None,
                'apikey': self.api_key,
                'outputsize': 'full'
            }
            
            response = requests.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Process data
            time_series_key = None
            for key in data.keys():
                if 'Time Series' in key:
                    time_series_key = key
                    break
            
            if not time_series_key:
                logger.error("No time series data found")
                return None
            
            time_series = data[time_series_key]
            
            # Convert to DataFrame
            df_data = []
            for timestamp, values in time_series.items():
                df_data.append({
                    'timestamp': pd.to_datetime(timestamp),
                    'open': float(values['1. open']),
                    'high': float(values['2. high']),
                    'low': float(values['3. low']),
                    'close': float(values['4. close']),
                    'volume': 0  # FX doesn't have volume
                })
            
            df = pd.DataFrame(df_data).sort_values('timestamp').tail(limit)
            logger.info(f"✅ Alpha Vantage: {len(df)} candles retrieved")
            return df
            
        except Exception as e:
            logger.error(f"Alpha Vantage error: {e}")
            return None

class TwelveDataService:
    """Twelve Data - Professional market data API"""
    
    def __init__(self, api_key=None):
        self.api_key = api_key
        self.base_url = "https://api.twelvedata.com"
        
    def get_gold_data(self, timeframe='1h', limit=1000):
        """Get XAUUSD data from Twelve Data"""
        try:
            if not self.api_key:
                logger.error("Twelve Data API key required")
                return None
            
            url = f"{self.base_url}/time_series"
            params = {
                'symbol': 'XAUUSD',
                'interval': timeframe,
                'outputsize': min(limit, 5000),
                'apikey': self.api_key
            }
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if 'values' not in data:
                logger.error("No values in Twelve Data response")
                return None
            
            # Convert to DataFrame
            df_data = []
            for item in data['values']:
                df_data.append({
                    'timestamp': pd.to_datetime(item['datetime']),
                    'open': float(item['open']),
                    'high': float(item['high']),
                    'low': float(item['low']),
                    'close': float(item['close']),
                    'volume': int(item.get('volume', 0))
                })
            
            df = pd.DataFrame(df_data).sort_values('timestamp')
            logger.info(f"✅ Twelve Data: {len(df)} candles retrieved")
            return df
            
        except Exception as e:
            logger.error(f"Twelve Data error: {e}")
            return None

class PolygonService:
    """Polygon.io - Financial market data"""
    
    def __init__(self, api_key=None):
        self.api_key = api_key
        self.base_url = "https://api.polygon.io"
        
    def get_gold_data(self, timeframe='1h', limit=1000):
        """Get XAUUSD data from Polygon"""
        try:
            if not self.api_key:
                logger.error("Polygon API key required")
                return None
            
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)
            
            # Map timeframes
            timespan_map = {
                '1min': 'minute',
                '5min': 'minute',
                '15min': 'minute', 
                '30min': 'minute',
                '1h': 'hour',
                '1day': 'day'
            }
            
            multiplier_map = {
                '1min': 1,
                '5min': 5,
                '15min': 15,
                '30min': 30,
                '1h': 1,
                '1day': 1
            }
            
            url = f"{self.base_url}/v2/aggs/ticker/C:XAUUSD/range/{multiplier_map[timeframe]}/{timespan_map[timeframe]}/{start_date.strftime('%Y-%m-%d')}/{end_date.strftime('%Y-%m-%d')}"
            
            params = {
                'adjusted': 'true',
                'sort': 'asc',
                'limit': limit,
                'apikey': self.api_key
            }
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if 'results' not in data:
                logger.error("No results in Polygon response")
                return None
            
            # Convert to DataFrame
            df_data = []
            for item in data['results']:
                df_data.append({
                    'timestamp': pd.to_datetime(item['t'], unit='ms'),
                    'open': float(item['o']),
                    'high': float(item['h']),
                    'low': float(item['l']),
                    'close': float(item['c']),
                    'volume': int(item['v'])
                })
            
            df = pd.DataFrame(df_data).sort_values('timestamp')
            logger.info(f"✅ Polygon: {len(df)} candles retrieved")
            return df
            
        except Exception as e:
            logger.error(f"Polygon error: {e}")
            return None

class FinnhubService:
    """Finnhub - Financial data API"""
    
    def __init__(self, api_key=None):
        self.api_key = api_key
        self.base_url = "https://finnhub.io/api/v1"
        
    def get_gold_data(self, timeframe='60', limit=1000):
        """Get XAUUSD data from Finnhub"""
        try:
            if not self.api_key:
                logger.error("Finnhub API key required")
                return None
            
            # Calculate timestamps
            end_time = int(datetime.now().timestamp())
            start_time = end_time - (86400 * 30)  # 30 days back
            
            # Map timeframes to minutes
            resolution_map = {
                '1min': '1',
                '5min': '5',
                '15min': '15',
                '30min': '30', 
                '1h': '60',
                '1day': 'D'
            }
            
            url = f"{self.base_url}/forex/candle"
            params = {
                'symbol': 'OANDA:XAU_USD',
                'resolution': resolution_map.get(timeframe, '60'),
                'from': start_time,
                'to': end_time,
                'token': self.api_key
            }
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('s') != 'ok':
                logger.error("Finnhub API returned error status")
                return None
            
            # Convert to DataFrame
            df_data = []
            for i in range(len(data['t'])):
                df_data.append({
                    'timestamp': pd.to_datetime(data['t'][i], unit='s'),
                    'open': float(data['o'][i]),
                    'high': float(data['h'][i]),
                    'low': float(data['l'][i]),
                    'close': float(data['c'][i]),
                    'volume': int(data['v'][i]) if 'v' in data else 0
                })
            
            df = pd.DataFrame(df_data).sort_values('timestamp').tail(limit)
            logger.info(f"✅ Finnhub: {len(df)} candles retrieved")
            return df
            
        except Exception as e:
            logger.error(f"Finnhub error: {e}")
            return None

class YahooFinanceService:
    """Yahoo Finance - Free financial data (limited)"""
    
    def __init__(self):
        self.base_url = "https://query1.finance.yahoo.com"
        
    def get_gold_data(self, timeframe='1h', limit=1000):
        """Get gold data from Yahoo Finance"""
        try:
            # Yahoo Finance intervals
            interval_map = {
                '1min': '1m',
                '5min': '5m',
                '15min': '15m',
                '30min': '30m',
                '1h': '1h',
                '1day': '1d'
            }
            
            # Calculate period
            period_map = {
                '1min': '7d',
                '5min': '60d',
                '15min': '60d',
                '30min': '60d',
                '1h': '730d',
                '1day': '10y'
            }
            
            symbol = 'GC=F'  # Gold futures
            interval = interval_map.get(timeframe, '1h')
            period = period_map.get(timeframe, '730d')
            
            url = f"{self.base_url}/v8/finance/chart/{symbol}"
            params = {
                'interval': interval,
                'period1': int((datetime.now() - timedelta(days=365)).timestamp()),
                'period2': int(datetime.now().timestamp()),
                'includePrePost': 'false'
            }
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if 'chart' not in data or not data['chart']['result']:
                logger.error("No chart data from Yahoo Finance")
                return None
            
            result = data['chart']['result'][0]
            timestamps = result['timestamp']
            ohlc = result['indicators']['quote'][0]
            
            # Convert to DataFrame
            df_data = []
            for i, ts in enumerate(timestamps):
                if (ohlc['open'][i] is not None and 
                    ohlc['high'][i] is not None and 
                    ohlc['low'][i] is not None and 
                    ohlc['close'][i] is not None):
                    
                    df_data.append({
                        'timestamp': pd.to_datetime(ts, unit='s'),
                        'open': float(ohlc['open'][i]),
                        'high': float(ohlc['high'][i]),
                        'low': float(ohlc['low'][i]),
                        'close': float(ohlc['close'][i]),
                        'volume': int(ohlc['volume'][i]) if ohlc['volume'][i] else 0
                    })
            
            df = pd.DataFrame(df_data).sort_values('timestamp').tail(limit)
            logger.info(f"✅ Yahoo Finance: {len(df)} candles retrieved")
            return df
            
        except Exception as e:
            logger.error(f"Yahoo Finance error: {e}")
            return None

# Service comparison and recommendations
def get_api_recommendations():
    """Get recommendations for different API services"""
    return {
        'free_options': [
            {
                'name': 'Yahoo Finance',
                'cost': 'رایگان',
                'quality': '⭐⭐⭐',
                'setup_difficulty': '⭐ آسان',
                'api_key_required': False,
                'limits': 'محدودیت نرم',
                'best_for': 'تست و توسعه'
            }
        ],
        'premium_options': [
            {
                'name': 'Alpha Vantage',
                'cost': '$25/ماه',
                'quality': '⭐⭐⭐⭐⭐',
                'setup_difficulty': '⭐⭐ آسان',
                'api_key_required': True,
                'limits': '500 calls/day (free tier)',
                'best_for': 'حرفه‌ای - کیفیت بالا'
            },
            {
                'name': 'Twelve Data',
                'cost': '$8/ماه',
                'quality': '⭐⭐⭐⭐',
                'setup_difficulty': '⭐⭐ آسان',
                'api_key_required': True,
                'limits': '800 calls/day (free tier)', 
                'best_for': 'ارزان - کیفیت خوب'
            },
            {
                'name': 'Polygon.io',
                'cost': '$99/ماه',
                'quality': '⭐⭐⭐⭐⭐',
                'setup_difficulty': '⭐⭐⭐ متوسط',
                'api_key_required': True,
                'limits': 'Unlimited',
                'best_for': 'حرفه‌ای - حجم بالا'
            },
            {
                'name': 'Finnhub',
                'cost': '$60/ماه',
                'quality': '⭐⭐⭐⭐',
                'setup_difficulty': '⭐⭐ آسان',
                'api_key_required': True,
                'limits': '60 calls/minute',
                'best_for': 'متوسط - real-time'
            }
        ]
    }