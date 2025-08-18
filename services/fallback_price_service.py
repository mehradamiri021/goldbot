"""
Fallback Price Service - Alternative data when APIs are offline
سرویس قیمت جایگزین - داده‌های جایگزین وقتی APIها آفلاین هستند
"""

import logging
import requests
from datetime import datetime
from typing import Dict, Optional, Any
import json

logger = logging.getLogger(__name__)

class FallbackPriceService:
    """Fallback service for when main APIs are offline"""
    
    def __init__(self):
        self.last_prices = {
            'usd_buy': 58500,  # Default fallback prices
            'usd_sell': 59000,
            'gold_18k': 4200000,  # Gold per gram in Toman
            'gold_24k': 5600000,
            'timestamp': datetime.now()
        }
        
        # Alternative API endpoints
        self.alternative_apis = [
            {
                'name': 'Bonbast',
                'url': 'https://api.bonbast.com/api/v1/latest',
                'parser': self._parse_bonbast
            },
            {
                'name': 'Tgju',
                'url': 'https://api.tgju.org/v1/market/indicator/summary-table-data/price_dollar_rl',
                'parser': self._parse_tgju
            }
        ]
    
    def get_currency_prices(self) -> Dict[str, Any]:
        """Get currency prices from alternative sources"""
        try:
            # Try alternative APIs
            for api in self.alternative_apis:
                try:
                    logger.info(f"🔄 Trying fallback API: {api['name']}")
                    response = requests.get(api['url'], timeout=10)
                    
                    if response.status_code == 200:
                        data = api['parser'](response.json())
                        if data:
                            self.last_prices.update(data)
                            self.last_prices['timestamp'] = datetime.now()
                            logger.info(f"✅ Got prices from {api['name']}")
                            return self.last_prices
                            
                except Exception as e:
                    logger.warning(f"❌ {api['name']} failed: {e}")
                    continue
            
            # If all APIs fail, return last known prices
            logger.warning("⚠️ All alternative APIs failed, using cached prices")
            return self.last_prices
            
        except Exception as e:
            logger.error(f"Error in fallback price service: {e}")
            return self.last_prices
    
    def _parse_bonbast(self, data: Dict) -> Optional[Dict]:
        """Parse Bonbast API response"""
        try:
            if 'usd' in data:
                return {
                    'usd_buy': float(data['usd']['buy']),
                    'usd_sell': float(data['usd']['sell']),
                    'source': 'Bonbast'
                }
        except Exception as e:
            logger.warning(f"Error parsing Bonbast data: {e}")
        return None
    
    def _parse_tgju(self, data: Dict) -> Optional[Dict]:
        """Parse TGJU API response"""
        try:
            if 'current' in data and 'info' in data:
                current_price = float(data['current'])
                return {
                    'usd_buy': current_price * 0.98,  # Approximate buy rate
                    'usd_sell': current_price * 1.02,  # Approximate sell rate
                    'source': 'TGJU'
                }
        except Exception as e:
            logger.warning(f"Error parsing TGJU data: {e}")
        return None
    
    def get_gold_bar_prices(self) -> Dict[str, Any]:
        """Get fallback gold bar prices"""
        try:
            # Calculate gold prices based on USD rate and international gold price
            usd_rate = self.last_prices.get('usd_sell', 59000)
            
            # Approximate international gold price (per ounce)
            gold_usd_per_ounce = 2500  # Default fallback
            gold_usd_per_gram = gold_usd_per_ounce / 31.1  # Convert to gram
            
            # Convert to Toman with margin
            gold_18k_per_gram = (gold_usd_per_gram * usd_rate * 0.75) * 1.1  # 18k + margin
            gold_24k_per_gram = (gold_usd_per_gram * usd_rate) * 1.1  # 24k + margin
            
            return {
                'gold_18k': int(gold_18k_per_gram),
                'gold_24k': int(gold_24k_per_gram),
                'gold_mesghal': int(gold_18k_per_gram * 4.6),  # Mesghal = 4.6 gram
                'gold_coin_emami': int(gold_24k_per_gram * 8.133 * 1.15),  # Coin with premium
                'gold_coin_half': int(gold_24k_per_gram * 4.066 * 1.15),
                'gold_coin_quarter': int(gold_24k_per_gram * 2.033 * 1.15),
                'gold_coin_eighth': int(gold_24k_per_gram * 1.016 * 1.15),
                'source': 'Calculated',
                'timestamp': datetime.now()
            }
            
        except Exception as e:
            logger.error(f"Error calculating fallback gold prices: {e}")
            return {
                'gold_18k': 4200000,
                'gold_24k': 5600000,
                'gold_mesghal': 19300000,
                'gold_coin_emami': 64000000,
                'gold_coin_half': 32000000,
                'gold_coin_quarter': 16000000,
                'gold_coin_eighth': 8000000,
                'source': 'Default',
                'timestamp': datetime.now()
            }
    
    def update_cache(self, new_data: Dict):
        """Update cached prices"""
        try:
            self.last_prices.update(new_data)
            self.last_prices['timestamp'] = datetime.now()
            logger.info("📦 Price cache updated")
        except Exception as e:
            logger.error(f"Error updating price cache: {e}")

class DataSourceManager:
    """Manages multiple data sources with fallback"""
    
    def __init__(self):
        self.fallback = FallbackPriceService()
        self.primary_sources = ['Navasan', 'ZaryaalGold']
        self.status = {
            'navasan': 'UNKNOWN',
            'zaryaal': 'UNKNOWN',
            'fallback': 'ACTIVE'
        }
    
    def get_best_currency_data(self, navasan_service=None) -> Dict[str, Any]:
        """Get best available currency data"""
        try:
            # Try primary Navasan first
            if navasan_service:
                try:
                    navasan_data = navasan_service.get_currency_prices()
                    if navasan_data and navasan_data.get('usd_buy', 0) > 0:
                        self.status['navasan'] = 'CONNECTED'
                        return {**navasan_data, 'primary_source': 'Navasan'}
                    else:
                        self.status['navasan'] = 'NO_DATA'
                except Exception as e:
                    self.status['navasan'] = 'ERROR'
                    logger.warning(f"Navasan failed: {e}")
            
            # Fallback to alternative sources
            self.status['navasan'] = 'OFFLINE'
            fallback_data = self.fallback.get_currency_prices()
            self.status['fallback'] = 'ACTIVE'
            
            return {**fallback_data, 'primary_source': 'Fallback'}
            
        except Exception as e:
            logger.error(f"Error getting currency data: {e}")
            return self.fallback.get_currency_prices()
    
    def get_best_gold_data(self, zaryaal_service=None) -> Dict[str, Any]:
        """Get best available gold data"""
        try:
            # Try ZaryaalGold first
            if zaryaal_service:
                try:
                    zaryaal_data = zaryaal_service.get_latest_prices()
                    if zaryaal_data and zaryaal_data.get('gold_18k', 0) > 0:
                        self.status['zaryaal'] = 'CONNECTED'
                        return {**zaryaal_data, 'primary_source': 'ZaryaalGold'}
                    else:
                        self.status['zaryaal'] = 'NO_DATA'
                except Exception as e:
                    self.status['zaryaal'] = 'ERROR'
                    logger.warning(f"ZaryaalGold failed: {e}")
            
            # Fallback to calculated prices
            self.status['zaryaal'] = 'OFFLINE'
            fallback_data = self.fallback.get_gold_bar_prices()
            
            return {**fallback_data, 'primary_source': 'Calculated'}
            
        except Exception as e:
            logger.error(f"Error getting gold data: {e}")
            return self.fallback.get_gold_bar_prices()
    
    def get_system_status(self) -> Dict[str, str]:
        """Get status of all data sources"""
        return {
            'navasan_api': self.status.get('navasan', 'UNKNOWN'),
            'zaryaal_channel': self.status.get('zaryaal', 'UNKNOWN'),
            'fallback_service': self.status.get('fallback', 'ACTIVE'),
            'overall_health': 'HEALTHY' if any(s in ['CONNECTED', 'ACTIVE'] for s in self.status.values()) else 'DEGRADED'
        }