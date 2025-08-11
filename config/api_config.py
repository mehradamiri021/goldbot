#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API Configuration - Pre-configured for immediate use
تنظیمات API - از پیش تنظیم شده برای استفاده فوری
"""

class APIConfig:
    # Gold Data API - Pre-configured
    # API داده‌های طلا - از پیش تنظیم شده
    GOLD_DATA_API = 'http://46.100.50.194:5050/get_data'
    
    # Default parameters - پارامترهای پیش‌فرض
    DEFAULT_SYMBOL = 'XAUUSD'
    DEFAULT_TIMEFRAME = 'H1'
    DEFAULT_LIMIT = 1000
    
    # API settings - تنظیمات API
    TIMEOUT = 30
    MAX_RETRIES = 3
    CACHE_DURATION = 300  # 5 minutes
    
    # Supported timeframes - بازه‌های زمانی پشتیبانی شده
    SUPPORTED_TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1']
    
    # Fallback data settings - تنظیمات داده‌های پشتیبان
    FALLBACK_ENABLED = True
    FALLBACK_PRICE_BASE = 2650.0  # Base gold price for fallback
    FALLBACK_VOLATILITY = 0.02    # 2% volatility
    
    @classmethod
    def get_api_url(cls):
        """Get API URL"""
        return cls.GOLD_DATA_API
    
    @classmethod
    def get_default_params(cls):
        """Get default API parameters"""
        return {
            'symbol': cls.DEFAULT_SYMBOL,
            'timeframe': cls.DEFAULT_TIMEFRAME,
            'limit': cls.DEFAULT_LIMIT
        }
    
    @classmethod
    def get_config(cls):
        """Get complete API configuration"""
        return {
            'api_url': cls.GOLD_DATA_API,
            'timeout': cls.TIMEOUT,
            'max_retries': cls.MAX_RETRIES,
            'cache_duration': cls.CACHE_DURATION,
            'supported_timeframes': cls.SUPPORTED_TIMEFRAMES,
            'fallback_enabled': cls.FALLBACK_ENABLED,
            'default_params': cls.get_default_params()
        }

# Global configuration instance
api_config = APIConfig()

# Export for easy import
__all__ = ['APIConfig', 'api_config']