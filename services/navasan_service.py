"""
Navasan API Service
سرویس API نوسان برای دریافت قیمت طلا و ارز
"""

import requests
import logging
from datetime import datetime, timedelta
import time
from typing import Dict, Optional, Any
import json

logger = logging.getLogger(__name__)

class NavasanService:
    """سرویس نوسان برای دریافت قیمت‌ها"""
    
    def __init__(self, api_key: Optional[str] = None):
        import os
        # Clean API key from environment or use default
        raw_key = api_key or os.environ.get('NAVASAN_API_KEY', "freeL3ceMoJUrCj7fqNjLh3xST")
        self.api_key = raw_key.strip() if isinstance(raw_key, str) else raw_key
        self.base_url = "http://api.navasan.tech"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'GoldBot/1.0 (Navasan Price Monitor)',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
        
        # Cache and retry settings
        self.cache = {}
        self.cache_duration = 300  # 5 minutes
        self.max_retries = 3
        self.retry_delay = 2
        
        logger.info(f"🏗️ Navasan Service initialized with API key: {self.api_key[:10]}...")
    
    def _make_request(self, endpoint: str, params: Optional[dict] = None) -> Optional[Dict]:
        """درخواست API با retry mechanism"""
        # Use exact URL format from Navasan documentation
        if endpoint == 'latest':
            url = f"{self.base_url}/dailyCurrency/"
        else:
            url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        if params is None:
            params = {}
        
        # Add API key as query parameter (correct Navasan format)
        params['api_key'] = self.api_key
        
        for attempt in range(self.max_retries):
            try:
                logger.debug(f"📡 API Request attempt {attempt + 1}: {url}")
                
                response = self.session.get(
                    url,
                    params=params,
                    timeout=30
                )
                
                response.raise_for_status()
                data = response.json()
                
                # Navasan API returns data directly without status wrapper
                if isinstance(data, dict) and len(data) > 0:
                    # Check if it contains expected currency data
                    if 'usd_sell' in data or 'usd_buy' in data:
                        logger.info(f"✅ API call successful: {endpoint}")
                        return {'status': 'success', 'data': data}
                    else:
                        logger.warning(f"⚠️ Unexpected API response format")
                        return {'status': 'success', 'data': data}
                else:
                    error_msg = data.get('message', 'Unknown API error') if isinstance(data, dict) else 'Invalid response'
                    logger.warning(f"⚠️ API returned error: {error_msg}")
                    
                    if attempt == self.max_retries - 1:
                        return None
                        
            except requests.exceptions.RequestException as e:
                logger.error(f"❌ API request failed (attempt {attempt + 1}): {e}")
                
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay * (attempt + 1))
                else:
                    return None
                    
            except json.JSONDecodeError as e:
                logger.error(f"❌ Invalid JSON response: {e}")
                return None
                
        return None
    
    def get_currency_prices(self) -> Optional[Dict]:
        """دریافت قیمت ارزها"""
        cache_key = "currency_prices"
        
        # Check cache
        if self._is_cache_valid(cache_key):
            logger.info("📦 Using cached currency prices")
            return self.cache[cache_key]['data']
        
        logger.info("📊 Fetching currency prices from Navasan API...")
        
        data = self._make_request('/latest')
        if data:
            # Cache the result
            self._cache_data(cache_key, data)
            return data
        
        logger.error("❌ Failed to fetch currency prices")
        return None
    
    def get_gold_prices(self) -> Optional[Dict]:
        """دریافت قیمت طلا"""
        cache_key = "gold_prices"
        
        # Check cache
        if self._is_cache_valid(cache_key):
            logger.info("📦 Using cached gold prices")
            return self.cache[cache_key]['data']
        
        logger.info("📊 Fetching gold prices from Navasan API...")
        
        data = self._make_request('/gold')
        if data:
            # Cache the result
            self._cache_data(cache_key, data)
            return data
        
        logger.error("❌ Failed to fetch gold prices")
        return None
    
    def get_crypto_prices(self) -> Optional[Dict]:
        """دریافت قیمت رمزارزها"""
        cache_key = "crypto_prices"
        
        # Check cache
        if self._is_cache_valid(cache_key):
            logger.info("📦 Using cached crypto prices")
            return self.cache[cache_key]['data']
        
        logger.info("📊 Fetching crypto prices from Navasan API...")
        
        data = self._make_request('/crypto')
        if data:
            # Cache the result
            self._cache_data(cache_key, data)
            return data
        
        logger.error("❌ Failed to fetch crypto prices")
        return None
    
    def get_all_prices(self) -> Dict[str, Any]:
        """دریافت تمام قیمت‌ها"""
        logger.info("🔄 Fetching all prices from Navasan API...")
        
        result = {
            'timestamp': datetime.now(),
            'currency': self.get_currency_prices(),
            'gold': self.get_gold_prices(),
            'crypto': self.get_crypto_prices(),
            'status': 'success'
        }
        
        # Check if any data was fetched
        if not any([result['currency'], result['gold'], result['crypto']]):
            result['status'] = 'failed'
            logger.error("❌ Failed to fetch any price data")
        else:
            success_count = sum(1 for x in [result['currency'], result['gold'], result['crypto']] if x)
            logger.info(f"✅ Successfully fetched {success_count}/3 price categories")
        
        return result
    
    def test_connection(self) -> bool:
        """تست اتصال به API نوسان"""
        try:
            logger.info("🔍 Testing Navasan API connection...")
            result = self._make_request('latest')
            
            if result and result.get('status') == 'success':
                logger.info("✅ Navasan API connection test successful")
                return True
            else:
                logger.warning("⚠️ Navasan API connection test failed")
                return False
                
        except Exception as e:
            logger.error(f"❌ Navasan API connection test error: {e}")
            return False
    
    def format_price_message(self, prices: Dict[str, Any]) -> str:
        """فرمت کردن پیام قیمت‌ها برای تلگرام با استفاده از helper"""
        if prices['status'] == 'failed':
            return "❌ خطا در دریافت قیمت‌ها از نوسان"
        
        try:
            from services.telegram_service_helper import format_navasan_message
            return format_navasan_message(prices)
        except ImportError:
            # Fallback to simple format
            return self._simple_format_message(prices)
    
    def _simple_format_message(self, prices: Dict[str, Any]) -> str:
        """فرمت ساده در صورت خطا در import"""
        message_parts = []
        
        # Header
        timestamp = prices['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
        message_parts.append(f"💰 قیمت‌های لحظه‌ای نوسان")
        message_parts.append(f"🕐 تاریخ: {timestamp}")
        message_parts.append("")
        
        # Currency prices
        if prices['currency']:
            currency = prices['currency']
            message_parts.append("💵 قیمت ارز:")
            
            if 'usd' in currency:
                usd = currency['usd']
                message_parts.append(f"🇺🇸 دلار: خرید {usd.get('buy', 'N/A')} | فروش {usd.get('sell', 'N/A')}")
            
            if 'eur' in currency:
                eur = currency['eur']
                message_parts.append(f"🇪🇺 یورو: خرید {eur.get('buy', 'N/A')} | فروش {eur.get('sell', 'N/A')}")
            
            message_parts.append("")
        
        # Gold prices
        if prices['gold']:
            gold = prices['gold']
            message_parts.append("🥇 قیمت طلا:")
            
            if 'gold_18k' in gold:
                message_parts.append(f"✨ طلای 18 عیار: {gold['gold_18k']:,} تومان")
            
            if 'mesghal' in gold:
                message_parts.append(f"⚖️ مثقال طلا: {gold['mesghal']:,} تومان")
            
            if 'coins' in gold:
                coins = gold['coins']
                message_parts.append(f"🪙 سکه امامی: {coins.get('emami', 'N/A'):,} تومان")
                message_parts.append(f"🪙 سکه بهار آزادی: {coins.get('bahar', 'N/A'):,} تومان")
                message_parts.append(f"🪙 سکه گرمی: {coins.get('gerami', 'N/A'):,} تومان")
            
            message_parts.append("")
        
        # Crypto prices
        if prices['crypto']:
            crypto = prices['crypto']
            message_parts.append("₿ قیمت رمزارز:")
            
            if 'bitcoin' in crypto:
                btc_price = crypto['bitcoin'].get('price_usd', 'N/A')
                message_parts.append(f"₿ بیت‌کوین: ${btc_price:,}")
            
            if 'ethereum' in crypto:
                eth_price = crypto['ethereum'].get('price_usd', 'N/A')
                message_parts.append(f"Ξ اتریوم: ${eth_price:,}")
            
            message_parts.append("")
        
        # Footer
        message_parts.append("📊 منبع: API نوسان")
        message_parts.append("🤖 ربات اعلام قیمت طلا و ارز")
        
        return "\n".join(message_parts)
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """بررسی معتبر بودن کش"""
        if cache_key not in self.cache:
            return False
        
        cache_time = self.cache[cache_key]['timestamp']
        return (datetime.now() - cache_time).total_seconds() < self.cache_duration
    
    def _cache_data(self, cache_key: str, data: Any):
        """ذخیره داده در کش"""
        self.cache[cache_key] = {
            'data': data,
            'timestamp': datetime.now()
        }
    
    def clear_cache(self):
        """پاک کردن کش"""
        self.cache.clear()
        logger.info("🧹 Cache cleared")
    
    def get_cache_stats(self) -> Dict:
        """آمار کش"""
        return {
            'cache_entries': len(self.cache),
            'cache_keys': list(self.cache.keys()),
            'last_update': max([entry['timestamp'] for entry in self.cache.values()]) if self.cache else None
        }

# Singleton instance
navasan_service = NavasanService()