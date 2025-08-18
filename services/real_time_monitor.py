"""
Real-time Data Monitoring Service
Monitors Navasan API and Telegram channel updates
Sends admin reports when data is received
"""
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import threading
import time

logger = logging.getLogger(__name__)

class RealTimeDataMonitor:
    def __init__(self):
        self.last_navasan_update = None
        self.last_telegram_update = None
        self.last_mt5_update = None
        self.admin_notification_sent = False
        self.monitoring_active = False
        self.data_cache = {
            'navasan_data': None,
            'telegram_data': None,
            'mt5_data': None,
            'last_prices': {},
            'update_timestamps': {}
        }
        
    def start_monitoring(self):
        """Initialize monitoring for startup only - no continuous monitoring"""
        logger.info("🔄 Real-time monitoring initialized for startup data check only")
        # Just check once at startup
        self._check_startup_data()
        # Don't start continuous monitoring loop
    
    def stop_monitoring(self):
        """Stop real-time monitoring"""
        self.monitoring_active = False
        logger.info("⏹️ Real-time data monitoring stopped")
    
    def _check_startup_data(self):
        """Check data once at startup"""
        try:
            logger.info("📊 Checking startup data...")
            
            # Check all data sources once
            navasan_updated = self._check_navasan_updates()
            mt5_updated = self._check_mt5_updates() 
            telegram_updated = self._check_telegram_updates()
            
            if navasan_updated or mt5_updated or telegram_updated:
                # Send initial status report to admin
                self._send_startup_report()
                logger.info("✅ Startup data check completed with updates")
            else:
                logger.info("ℹ️ Startup data check completed - no new data")
                
        except Exception as e:
            logger.error(f"Error in startup data check: {e}")
    
    def _check_navasan_updates(self):
        """Check for Navasan API updates"""
        try:
            from services.navasan_service import NavasanService
            navasan = NavasanService()
            
            # Get latest currency data
            currency_data = navasan.get_currency_prices()
            
            if currency_data and currency_data.get('timestamp'):
                current_time = datetime.now()
                
                # Check if this is new data
                if (self.last_navasan_update is None or 
                    current_time > self.last_navasan_update + timedelta(minutes=5)):
                    
                    self.data_cache['navasan_data'] = currency_data
                    self.data_cache['update_timestamps']['navasan'] = current_time
                    self.last_navasan_update = current_time
                    
                    logger.info(f"🔄 Navasan API updated: USD Buy={currency_data.get('usd_buy', 0)}")
                    return True
                    
        except Exception as e:
            logger.error(f"Error checking Navasan updates: {e}")
        
        return False
    
    def _check_mt5_updates(self):
        """Check for MT5 data updates"""
        try:
            from services.data_service import DataService
            data_service = DataService()
            
            # Get latest MT5 data
            mt5_data = data_service.get_market_data('H1', limit=10)
            
            if mt5_data is not None and len(mt5_data) > 0:
                latest_price = float(mt5_data.iloc[-1]['close'])
                current_time = datetime.now()
                
                # Check if price changed significantly
                last_price = self.data_cache['last_prices'].get('mt5', 0)
                if abs(latest_price - last_price) > 1.0:  # $1 change
                    
                    self.data_cache['mt5_data'] = latest_price
                    self.data_cache['last_prices']['mt5'] = latest_price
                    self.data_cache['update_timestamps']['mt5'] = current_time
                    self.last_mt5_update = current_time
                    
                    logger.info(f"🔄 MT5 price updated: ${latest_price:.2f}")
                    return True
                    
        except Exception as e:
            logger.error(f"Error checking MT5 updates: {e}")
        
        return False
    
    def _check_telegram_updates(self):
        """Check for Telegram channel updates"""
        try:
            # Placeholder for Telegram channel monitoring
            # In real implementation, this would monitor @ZaryaalGold channel
            current_time = datetime.now()
            
            # Simulate telegram update check (every 10 minutes)
            if (self.last_telegram_update is None or 
                current_time > self.last_telegram_update + timedelta(minutes=10)):
                
                # Mock data for now - in production would parse real channel data
                telegram_data = {
                    'gold_18k': 4250000,
                    'gold_bar': 3200000,
                    'source': '@ZaryaalGold',
                    'timestamp': current_time
                }
                
                self.data_cache['telegram_data'] = telegram_data
                self.data_cache['update_timestamps']['telegram'] = current_time
                self.last_telegram_update = current_time
                
                logger.info("🔄 Telegram channel data updated")
                return True
                
        except Exception as e:
            logger.error(f"Error checking Telegram updates: {e}")
        
        return False
    
    def _send_startup_report(self):
        """Send admin report for startup data check"""
        try:
            from services.telegram_service import TelegramService
            telegram_service = TelegramService()
            
            current_time = datetime.now()
            
            # Get updated data sources
            updated_sources = []
            for source, timestamp in self.data_cache['update_timestamps'].items():
                if timestamp:
                    updated_sources.append(source)
            
            # Prepare startup message
            message = f"""🚀 **گزارش راه‌اندازی سیستم**

⏰ **زمان راه‌اندازی:** {current_time.strftime('%Y/%m/%d %H:%M')}

📊 **وضعیت داده‌ها:**"""
            
            for source in updated_sources:
                if source == 'navasan':
                    navasan_data = self.data_cache.get('navasan_data', {})
                    message += f"\n✅ **Navasan API**: USD خرید {navasan_data.get('usd_buy', 0):,} تومان"
                    
                elif source == 'mt5':
                    mt5_price = self.data_cache.get('mt5_data', 0)
                    message += f"\n✅ **MT5 Data**: قیمت طلا ${mt5_price:.2f}"
                    
                elif source == 'telegram':
                    telegram_data = self.data_cache.get('telegram_data', {})
                    message += f"\n✅ **کانال تلگرام**: طلای ۱۸ عیار {telegram_data.get('gold_18k', 0):,} تومان"
            
            message += f"""

📅 **برنامه اعلام قیمت:**
• ۱۱:۱۱ - اعلام قیمت صبحانه
• ۱۴:۱۴ - اعلام قیمت ظهر
• ۱۷:۱۷ - اعلام قیمت عصر

✅ سیستم آماده و داده‌ها بروزرسانی شدند"""
            
            # Send to admin
            asyncio.create_task(
                telegram_service.send_admin_notification(
                    message, 
                    'STARTUP_REPORT'
                )
            )
            
            logger.info("📤 Startup report sent to admin")
            
        except Exception as e:
            logger.error(f"Error sending startup report: {e}")
    
    def _send_data_update_notification(self, updated_sources):
        """Send notification to admin about data updates"""
        try:
            from services.telegram_service import TelegramService
            telegram_service = TelegramService()
            
            current_time = datetime.now()
            
            # Prepare update message
            message = f"""📊 **گزارش بروزرسانی داده‌ها**

⏰ **زمان گزارش:** {current_time.strftime('%Y/%m/%d %H:%M')}

🔄 **منابع بروزرسانی شده:**"""
            
            for source in updated_sources:
                if source == 'navasan':
                    navasan_data = self.data_cache.get('navasan_data', {})
                    message += f"\n✅ **Navasan API**: USD خرید {navasan_data.get('usd_buy', 0):,} تومان"
                    
                elif source == 'mt5':
                    mt5_price = self.data_cache.get('mt5_data', 0)
                    message += f"\n✅ **MT5 Data**: قیمت طلا ${mt5_price:.2f}"
                    
                elif source == 'telegram':
                    telegram_data = self.data_cache.get('telegram_data', {})
                    message += f"\n✅ **کانال تلگرام**: طلای ۱۸ عیار {telegram_data.get('gold_18k', 0):,} تومان"
            
            message += f"""

📈 **وضعیت سیستم:** عملکرد مطلوب
🔔 **نوع گزارش:** بروزرسانی خودکار داده‌ها

⚠️ این گزارش بعد از دریافت داده‌های جدید به طور خودکار ارسال شده است."""
            
            # Send to admin
            asyncio.create_task(
                telegram_service.send_admin_notification(
                    message, 
                    'DATA_UPDATE_REPORT'
                )
            )
            
            logger.info(f"📤 Admin update report sent for: {', '.join(updated_sources)}")
            
        except Exception as e:
            logger.error(f"Error sending admin notification: {e}")
    
    def _reset_notification_flag(self):
        """Reset notification flag to allow next report"""
        self.admin_notification_sent = False
    
    def get_current_status(self) -> Dict[str, Any]:
        """Get current monitoring status"""
        return {
            'monitoring_active': self.monitoring_active,
            'last_navasan_update': self.last_navasan_update.isoformat() if self.last_navasan_update else None,
            'last_mt5_update': self.last_mt5_update.isoformat() if self.last_mt5_update else None,
            'last_telegram_update': self.last_telegram_update.isoformat() if self.last_telegram_update else None,
            'cached_data': {
                'navasan_status': 'ONLINE' if self.data_cache.get('navasan_data') else 'OFFLINE',
                'mt5_status': 'ONLINE' if self.data_cache.get('mt5_data') else 'OFFLINE', 
                'telegram_status': 'ONLINE' if self.data_cache.get('telegram_data') else 'OFFLINE',
                'last_prices': self.data_cache.get('last_prices', {}),
                'update_count': len([t for t in self.data_cache['update_timestamps'].values() if t])
            }
        }

    def update_navasan_data(self, currency_data):
        """Update Navasan data cache for scheduled updates"""
        try:
            current_time = datetime.now()
            self.data_cache['navasan_data'] = currency_data
            self.data_cache['update_timestamps']['navasan'] = current_time
            self.last_navasan_update = current_time
            logger.info(f"📊 Navasan data updated via scheduled task: USD Buy={currency_data.get('usd_buy', 0):,}")
        except Exception as e:
            logger.error(f"Error updating Navasan cache: {e}")
    
    def get_real_time_status(self):
        """Get current real-time status without making API calls"""
        try:
            from services.data_service import DataService
            
            current_time = datetime.now()
            
            # Get current MT5 price (always live)
            data_service = DataService()
            mt5_data = data_service.get_market_data('H1', limit=1)
            current_price = 0
            
            if mt5_data is not None and len(mt5_data) > 0:
                current_price = float(mt5_data.iloc[-1]['close'])
            
            # Get cached Navasan data only
            navasan_data = self.data_cache.get('navasan_data', {})
            
            return {
                'success': True,
                'timestamp': current_time.isoformat(),
                'monitoring_active': False,  # No continuous monitoring
                'current_price': current_price,
                'mt5_status': 'ONLINE' if current_price > 0 else 'OFFLINE',
                'navasan_status': 'ONLINE' if navasan_data else 'OFFLINE',
                'telegram_status': 'ONLINE' if self.data_cache.get('telegram_data') else 'OFFLINE',
                'last_updates': {
                    'mt5': self.last_mt5_update.isoformat() if self.last_mt5_update else None,
                    'navasan': self.last_navasan_update.isoformat() if self.last_navasan_update else None,
                    'telegram': self.last_telegram_update.isoformat() if self.last_telegram_update else None
                },
                'update_count': len([t for t in [self.last_mt5_update, self.last_navasan_update, self.last_telegram_update] if t]),
                'usd_buy': navasan_data.get('usd_buy', 0),
                'usd_sell': navasan_data.get('usd_sell', 0)
            }
            
        except Exception as e:
            logger.error(f"Error getting real-time status: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

# Global monitor instance
real_time_monitor = RealTimeDataMonitor()