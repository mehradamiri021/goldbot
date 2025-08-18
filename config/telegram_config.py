#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Telegram Configuration - Pre-configured for immediate use
تنظیمات تلگرام - از پیش تنظیم شده برای استفاده فوری
"""

# تنظیمات اصلی تلگرام - نیازی به تغییر نیست
# Main Telegram settings - no need to change
class TelegramConfig:
    # Bot Token - ثابت و از قبل تنظیم شده
    BOT_TOKEN = '7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y'
    
    # Channel ID for public announcements - کانال عمومی اعلانات
    CHANNEL_ID = '-1002717718463'
    
    # Admin ID for private notifications - آیدی ادمین برای اعلانات خصوصی
    ADMIN_ID = '1112066452'
    
    # Additional settings - تنظیمات اضافی
    PARSE_MODE = 'HTML'
    TIMEOUT = 30
    RETRY_ATTEMPTS = 3
    
    # Report timing settings (Tehran timezone) - زمان‌بندی گزارش‌ها (ساعت تهران)
    MORNING_REPORT_TIME = '09:09'
    EVENING_REPORT_TIME = '15:15'
    WEEKLY_REPORT_TIME = '12:12'
    
    # Persian messages - پیام‌های فارسی
    MESSAGES = {
        'startup': '🟢 ربات تحلیل طلا راه‌اندازی شد',
        'shutdown': '🔴 ربات تحلیل طلا متوقف شد',
        'error': '❌ خطا در عملکرد سیستم',
        'analysis_complete': '✅ تحلیل بازار تکمیل شد',
        'signal_generated': '📊 سیگنال جدید تولید شد',
        'data_updated': '📈 داده‌های بازار بروزرسانی شد'
    }
    
    @classmethod
    def get_bot_token(cls):
        """Get bot token"""
        return cls.BOT_TOKEN
    
    @classmethod
    def get_channel_id(cls):
        """Get channel ID"""
        return cls.CHANNEL_ID
    
    @classmethod
    def get_admin_id(cls):
        """Get admin ID"""
        return cls.ADMIN_ID
    
    @classmethod
    def get_config(cls):
        """Get complete configuration"""
        return {
            'bot_token': cls.BOT_TOKEN,
            'channel_id': cls.CHANNEL_ID,
            'admin_id': cls.ADMIN_ID,
            'parse_mode': cls.PARSE_MODE,
            'timeout': cls.TIMEOUT,
            'retry_attempts': cls.RETRY_ATTEMPTS
        }

# Global configuration instance
telegram_config = TelegramConfig()

# Export for easy import
__all__ = ['TelegramConfig', 'telegram_config']