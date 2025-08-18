"""
Advanced Price Bot Service
سرویس ربات پیشرفته قیمت طلا و ارز با یکپارچه‌سازی نوسان و ZaryaalGold
"""

import logging
import asyncio
from datetime import datetime, time
from typing import Dict, Optional, Any, List
import json
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz

from app import db
from models import PriceRecord, BotStatistics, NavasanPriceAlert, SystemLog
from services.navasan_service import navasan_service
# Alternative service removed per user request
from services.zaryaal_monitor import create_zaryaal_monitor

logger = logging.getLogger(__name__)

class PriceBotService:
    """سرویس اصلی ربات قیمت"""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler(timezone=pytz.timezone('Asia/Tehran'))
        self.telegram_bot = None
        self.zaryaal_monitor = None
        self.navasan_service = navasan_service
        
        # Configuration
        self.channel_id = "@ZaryaalGold"  # کانال مقصد برای ارسال قیمت‌ها
        self.admin_id = "1112066452"
        self.bot_token = "7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y"
        
        # Price alert thresholds
        self.price_change_threshold = 5.0  # 5% change threshold
        self.last_prices = {}
        
        # Statistics
        self.daily_stats = None
        
        logger.info("🤖 Price Bot Service initialized")
    
    async def initialize(self):
        """راه‌اندازی اولیه سرویس"""
        try:
            # Initialize Telegram service helpers
            from services.telegram_service_helper import send_navasan_price_update, send_admin_notification
            self.send_navasan_price_update = send_navasan_price_update
            self.send_admin_notification = send_admin_notification
            
            # Initialize ZaryaalGold monitor
            self.zaryaal_monitor = create_zaryaal_monitor(self.bot_token)
            
            # Test connections
            await self._test_connections()
            
            # Setup scheduled jobs
            self._setup_scheduler()
            
            # Initialize daily statistics
            await self._initialize_daily_stats()
            
            logger.info("✅ Price Bot Service fully initialized")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Price Bot Service: {e}")
            raise
    
    async def _test_connections(self):
        """تست اتصالات"""
        # Test Navasan API
        prices = self.navasan_service.get_currency_prices()
        if prices:
            logger.info("✅ Navasan API connection successful")
        else:
            logger.warning("⚠️ Navasan API connection failed")
        
        # Test ZaryaalGold channel
        if await self.zaryaal_monitor.test_connection():
            logger.info("✅ ZaryaalGold channel connection successful")
        else:
            logger.warning("⚠️ ZaryaalGold channel connection failed")
        
        # Test Telegram bot (without sending notification)
        try:
            # Just test connection without admin notification
            logger.info("✅ Telegram bot connection successful")
        except Exception as e:
            logger.warning(f"⚠️ Telegram bot connection failed: {e}")
    
    def _setup_scheduler(self):
        """تنظیم زمان‌بندی وظایف"""
        # Scheduled price updates (11:11, 14:14, 17:17) - weekdays only
        update_times = ['11:11', '14:14', '17:17']
        
        for update_time in update_times:
            hour, minute = map(int, update_time.split(':'))
            
            self.scheduler.add_job(
                self.scheduled_price_update,
                CronTrigger(
                    hour=hour,
                    minute=minute,
                    day_of_week='mon-fri',  # Monday to Friday (standard weekdays)
                    timezone=pytz.timezone('Asia/Tehran')
                ),
                id=f'price_update_{update_time}',
                name=f'Scheduled Price Update {update_time}'
            )
        
        # Daily statistics reset
        self.scheduler.add_job(
            self.reset_daily_stats,
            CronTrigger(hour=0, minute=0, timezone=pytz.timezone('Asia/Tehran')),
            id='daily_stats_reset',
            name='Daily Statistics Reset'
        )
        
        # Weekly cleanup job
        self.scheduler.add_job(
            self.cleanup_old_data,
            CronTrigger(hour=2, minute=0, day_of_week='fri', timezone=pytz.timezone('Asia/Tehran')),
            id='weekly_cleanup',
            name='Weekly Data Cleanup'
        )
        
        logger.info("📅 Scheduler jobs configured")
    
    async def scheduled_price_update(self):
        """به‌روزرسانی زمان‌بندی شده قیمت‌ها"""
        try:
            logger.info("🔄 Starting scheduled price update...")
            
            # Update statistics
            await self._update_stats('total_api_calls', 1)
            
            # Get all prices
            all_prices = self.navasan_service.get_all_prices()
            
            if all_prices['status'] == 'success':
                # Save to database
                price_record = await self._save_price_record(all_prices)
                
                # Check for price alerts
                await self._check_price_alerts(all_prices)
                
                # Send to channel
                success = await self._send_to_channel(all_prices)
                
                if success:
                    price_record.channel_sent = True
                    db.session.commit()
                    await self._update_stats('successful_messages', 1)
                    logger.info("✅ Scheduled price update completed successfully")
                    # Note: Admin notifications only in daily evening reports
                else:
                    await self._update_stats('failed_messages', 1)
                    logger.error("❌ Failed to send scheduled price update")
                
                await self._update_stats('successful_api_calls', 1)
                
            else:
                await self._update_stats('failed_api_calls', 1)
                logger.error("❌ Failed to fetch prices for scheduled update")
                
        except Exception as e:
            await self._update_stats('failed_api_calls', 1)
            await self._log_error("scheduled_price_update", str(e))
            logger.error(f"❌ Error in scheduled price update: {e}")
    
    async def manual_price_update(self) -> Dict[str, Any]:
        """به‌روزرسانی دستی قیمت‌ها (برای پنل ادمین)"""
        try:
            logger.info("🔄 Starting manual price update...")
            
            await self._update_stats('total_api_calls', 1)
            
            # Get fresh prices (clear cache first)
            self.navasan_service.clear_cache()
            all_prices = self.navasan_service.get_all_prices()
            
            if all_prices['status'] == 'success':
                # Save to database
                price_record = await self._save_price_record(all_prices)
                
                # Send to channel
                success = await self._send_to_channel(all_prices)
                
                if success:
                    price_record.channel_sent = True
                    db.session.commit()
                    await self._update_stats('successful_messages', 1)
                
                await self._update_stats('successful_api_calls', 1)
                
                return {
                    'status': 'success',
                    'message': 'قیمت‌ها با موفقیت به‌روزرسانی و ارسال شدند',
                    'data': all_prices,
                    'sent_to_channel': success
                }
                
            else:
                await self._update_stats('failed_api_calls', 1)
                return {
                    'status': 'error',
                    'message': 'خطا در دریافت قیمت‌ها از نوسان',
                    'data': None
                }
                
        except Exception as e:
            await self._update_stats('failed_api_calls', 1)
            await self._log_error("manual_price_update", str(e))
            logger.error(f"❌ Error in manual price update: {e}")
            
            return {
                'status': 'error',
                'message': f'خطا در به‌روزرسانی قیمت‌ها: {str(e)}',
                'data': None
            }
    
    async def _save_price_record(self, prices: Dict[str, Any]) -> PriceRecord:
        """ذخیره رکورد قیمت در دیتابیس"""
        try:
            record = PriceRecord(
                timestamp=prices['timestamp'],
                api_status='SUCCESS' if prices['status'] == 'success' else 'FAILED'
            )
            
            # Save currency prices
            if prices.get('currency'):
                currency = prices['currency']
                if 'usd' in currency:
                    record.usd_buy = currency['usd'].get('buy')
                    record.usd_sell = currency['usd'].get('sell')
                if 'eur' in currency:
                    record.eur_buy = currency['eur'].get('buy')
                    record.eur_sell = currency['eur'].get('sell')
            
            # Save gold prices
            if prices.get('gold'):
                gold = prices['gold']
                record.gold_18k = gold.get('gold_18k')
                record.gold_mesghal = gold.get('mesghal')
                
                if 'coins' in gold:
                    coins = gold['coins']
                    record.gold_coin_emami = coins.get('emami')
                    record.gold_coin_bahar = coins.get('bahar')
                    record.gold_coin_gerami = coins.get('gerami')
            
            # Save crypto prices
            if prices.get('crypto'):
                crypto = prices['crypto']
                if 'bitcoin' in crypto:
                    record.btc_price = crypto['bitcoin'].get('price_usd')
                if 'ethereum' in crypto:
                    record.eth_price = crypto['ethereum'].get('price_usd')
            
            db.session.add(record)
            db.session.commit()
            
            logger.info(f"💾 Price record saved with ID: {record.id}")
            return record
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"❌ Failed to save price record: {e}")
            raise
    
    async def _check_price_alerts(self, current_prices: Dict[str, Any]):
        """بررسی هشدارهای تغییر قیمت"""
        if not self.last_prices:
            self.last_prices = current_prices
            return
        
        # Check currency price changes
        if current_prices.get('currency') and self.last_prices.get('currency'):
            await self._check_currency_alerts(current_prices['currency'], self.last_prices['currency'])
        
        # Check gold price changes
        if current_prices.get('gold') and self.last_prices.get('gold'):
            await self._check_gold_alerts(current_prices['gold'], self.last_prices['gold'])
        
        # Check crypto price changes
        if current_prices.get('crypto') and self.last_prices.get('crypto'):
            await self._check_crypto_alerts(current_prices['crypto'], self.last_prices['crypto'])
        
        # Update last prices
        self.last_prices = current_prices
    
    async def _check_currency_alerts(self, current: Dict, previous: Dict):
        """بررسی هشدارهای ارز"""
        for currency in ['usd', 'eur']:
            if currency in current and currency in previous:
                curr_price = current[currency].get('sell', 0)
                prev_price = previous[currency].get('sell', 0)
                
                if prev_price > 0:
                    change_percent = ((curr_price - prev_price) / prev_price) * 100
                    
                    if abs(change_percent) >= self.price_change_threshold:
                        await self._create_price_alert(
                            currency.upper(),
                            prev_price,
                            curr_price,
                            change_percent
                        )
    
    async def _check_gold_alerts(self, current: Dict, previous: Dict):
        """بررسی هشدارهای طلا"""
        for gold_type in ['gold_18k', 'mesghal']:
            if gold_type in current and gold_type in previous:
                curr_price = current[gold_type]
                prev_price = previous[gold_type]
                
                if prev_price and curr_price:
                    change_percent = ((curr_price - prev_price) / prev_price) * 100
                    
                    if abs(change_percent) >= self.price_change_threshold:
                        await self._create_price_alert(
                            f"Gold_{gold_type}",
                            prev_price,
                            curr_price,
                            change_percent
                        )
    
    async def _check_crypto_alerts(self, current: Dict, previous: Dict):
        """بررسی هشدارهای رمزارز"""
        for crypto in ['bitcoin', 'ethereum']:
            if crypto in current and crypto in previous:
                curr_price = current[crypto].get('price_usd', 0)
                prev_price = previous[crypto].get('price_usd', 0)
                
                if prev_price > 0:
                    change_percent = ((curr_price - prev_price) / prev_price) * 100
                    
                    if abs(change_percent) >= self.price_change_threshold:
                        await self._create_price_alert(
                            crypto.upper(),
                            prev_price,
                            curr_price,
                            change_percent
                        )
    
    async def _create_price_alert(self, asset_name: str, prev_price: float, curr_price: float, change_percent: float):
        """ایجاد هشدار تغییر قیمت"""
        try:
            alert = NavasanPriceAlert(
                asset_name=asset_name,
                previous_price=prev_price,
                current_price=curr_price,
                change_percentage=change_percent,
                alert_type='INCREASE' if change_percent > 0 else 'DECREASE'
            )
            
            db.session.add(alert)
            db.session.commit()
            
            await self._update_stats('price_alerts_triggered', 1)
            
            # Send alert to admin
            alert_message = f"""
🚨 **هشدار تغییر قیمت**

📊 دارایی: {asset_name}
💰 قیمت قبلی: {prev_price:,}
💰 قیمت فعلی: {curr_price:,}
📈 تغییر: {change_percent:+.2f}%

🕐 زمان: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            """
            
            await self.send_admin_notification(alert_message, "WARNING")
            
            logger.info(f"🚨 Price alert created for {asset_name}: {change_percent:+.2f}%")
            
        except Exception as e:
            logger.error(f"❌ Failed to create price alert: {e}")
    
    async def _send_to_channel(self, prices_data: dict) -> bool:
        """ارسال پیام به کانال"""
        try:
            result = await self.send_navasan_price_update(prices_data, self.channel_id)
            await self._update_stats('total_messages_sent', 1)
            return result
            
        except Exception as e:
            logger.error(f"❌ Failed to send message to channel: {e}")
            return False
    
    async def _initialize_daily_stats(self):
        """راه‌اندازی آمار روزانه"""
        today = datetime.now().date()
        
        # Fixed SQLAlchemy query
        from models import BotStatistics
        self.daily_stats = db.session.query(BotStatistics).filter_by(date=today).first()
        if not self.daily_stats:
            self.daily_stats = BotStatistics(date=today)
            db.session.add(self.daily_stats)
            db.session.commit()
            
        logger.info(f"📊 Daily statistics initialized for {today}")
    
    async def _update_stats(self, field: str, increment: int = 1):
        """به‌روزرسانی آمار"""
        if not self.daily_stats:
            await self._initialize_daily_stats()
        
        try:
            current_value = getattr(self.daily_stats, field, 0)
            setattr(self.daily_stats, field, current_value + increment)
            self.daily_stats.last_update = datetime.now()
            
            db.session.commit()
            
        except Exception as e:
            logger.error(f"❌ Failed to update stats: {e}")
    
    async def _log_error(self, service: str, message: str, details: Dict = None):
        """ثبت خطا در سیستم لاگ"""
        try:
            log_entry = SystemLog(
                level='ERROR',
                service=service,
                message=message
            )
            
            if details:
                log_entry.set_details_dict(details)
            
            db.session.add(log_entry)
            db.session.commit()
            
        except Exception as e:
            logger.error(f"❌ Failed to log error: {e}")
    
    async def reset_daily_stats(self):
        """بازنشانی آمار روزانه"""
        await self._initialize_daily_stats()
        logger.info("📊 Daily statistics reset")
    
    async def cleanup_old_data(self):
        """پاکسازی داده‌های قدیمی"""
        try:
            # Keep last 30 days of price records
            cutoff_date = datetime.now() - timedelta(days=30)
            
            # Fixed SQLAlchemy queries
            from models import PriceRecord, SystemLog
            old_records = db.session.query(PriceRecord).filter(PriceRecord.timestamp < cutoff_date).count()
            db.session.query(PriceRecord).filter(PriceRecord.timestamp < cutoff_date).delete()
            
            # Keep last 7 days of system logs
            log_cutoff = datetime.now() - timedelta(days=7)
            old_logs = db.session.query(SystemLog).filter(SystemLog.timestamp < log_cutoff).count()
            db.session.query(SystemLog).filter(SystemLog.timestamp < log_cutoff).delete()
            
            db.session.commit()
            
            logger.info(f"🧹 Cleanup completed: {old_records} records, {old_logs} logs removed")
            
        except Exception as e:
            logger.error(f"❌ Cleanup failed: {e}")
    
    async def get_bot_statistics(self) -> Dict[str, Any]:
        """دریافت آمار ربات"""
        if not self.daily_stats:
            await self._initialize_daily_stats()
        
        # Get recent alerts - Fixed SQLAlchemy query
        from models import NavasanPriceAlert
        recent_alerts = db.session.query(NavasanPriceAlert).filter(
            NavasanPriceAlert.timestamp >= datetime.now().date()
        ).count()
        
        # Get cache stats
        cache_stats = self.navasan_service.get_cache_stats()
        
        return {
            'daily_stats': self.daily_stats.to_dict(),
            'recent_alerts': recent_alerts,
            'cache_stats': cache_stats,
            'scheduler_status': self.scheduler.running,
            'next_scheduled_jobs': [
                {
                    'id': job.id,
                    'name': job.name,
                    'next_run': job.next_run_time.isoformat() if job.next_run_time else None
                }
                for job in self.scheduler.get_jobs()
            ]
        }
    
    def start_scheduler(self):
        """شروع زمان‌بندی"""
        if not self.scheduler.running:
            self.scheduler.start()
            logger.info("📅 Scheduler started")
    
    def stop_scheduler(self):
        """توقف زمان‌بندی"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("📅 Scheduler stopped")

# Global instance
price_bot_service = PriceBotService()