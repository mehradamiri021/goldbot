from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz
import logging
from datetime import datetime, time
from services.analysis_service import perform_daily_analysis, get_current_market_status
from services.telegram_service import send_daily_report, send_admin_report, send_signal_for_approval
from services.news_service import get_daily_news, get_news_summary
from app import app, db
from models import Signal, Analysis
import threading

logger = logging.getLogger(__name__)

class SchedulerService:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.timezone = pytz.timezone('Asia/Tehran')  # Tehran timezone
        self.is_running = False
        
        # Market hours (Tehran time)
        self.market_start_time = time(7, 30)  # 07:30
        self.market_end_time = time(22, 0)    # 22:00
        
    def init_scheduler(self):
        """Initialize and start the scheduler"""
        try:
            if self.is_running:
                logger.warning("Scheduler is already running")
                return
            
            # Daily reports
            # Morning report at 09:09
            self.scheduler.add_job(
                func=self.morning_report,
                trigger=CronTrigger(hour=9, minute=9, timezone=self.timezone),
                id='morning_report',
                name='Morning Gold Analysis Report',
                replace_existing=True
            )
            
            # Evening report at 15:15
            self.scheduler.add_job(
                func=self.evening_report,
                trigger=CronTrigger(hour=15, minute=15, timezone=self.timezone),
                id='evening_report',
                name='Evening Gold Analysis Report',
                replace_existing=True
            )
            
            # Admin report at 12:00
            self.scheduler.add_job(
                func=self.admin_report,
                trigger=CronTrigger(hour=12, minute=0, timezone=self.timezone),
                id='admin_report',
                name='Daily Admin Report',
                replace_existing=True
            )
            
            # Weekly report on Sunday at 12:12
            self.scheduler.add_job(
                func=self.weekly_report,
                trigger=CronTrigger(day_of_week='sun', hour=12, minute=12, timezone=self.timezone),
                id='weekly_report',
                name='Weekly Gold Analysis',
                replace_existing=True
            )
            
            # Signal monitoring every 15 minutes during market hours
            self.scheduler.add_job(
                func=self.signal_monitoring,
                trigger=CronTrigger(minute='*/15', timezone=self.timezone),
                id='signal_monitoring',
                name='15-Minute Signal Monitor',
                replace_existing=True
            )
            
            # Market status check every 5 minutes during market hours
            self.scheduler.add_job(
                func=self.market_status_check,
                trigger=CronTrigger(minute='*/5', timezone=self.timezone),
                id='market_status_check',
                name='Market Status Check',
                replace_existing=True
            )
            
            # Daily cleanup at midnight
            self.scheduler.add_job(
                func=self.daily_cleanup,
                trigger=CronTrigger(hour=0, minute=0, timezone=self.timezone),
                id='daily_cleanup',
                name='Daily Database Cleanup',
                replace_existing=True
            )
            
            self.scheduler.start()
            self.is_running = True
            logger.info("Scheduler started successfully with all jobs")
            
        except Exception as e:
            logger.error(f"Error initializing scheduler: {e}")
    
    def is_market_hours(self):
        """Check if current time is within market hours"""
        try:
            current_time = datetime.now(self.timezone).time()
            current_weekday = datetime.now(self.timezone).weekday()
            
            # Monday to Friday (0-4), not Saturday (5) or Sunday (6)
            if current_weekday >= 5:
                return False
            
            return self.market_start_time <= current_time <= self.market_end_time
            
        except Exception as e:
            logger.error(f"Error checking market hours: {e}")
            return False
    
    def morning_report(self):
        """Generate and send morning analysis report"""
        try:
            logger.info("Starting morning report generation")
            
            with app.app_context():
                # Perform analysis
                analysis_data = perform_daily_analysis()
                
                if 'error' not in analysis_data:
                    # Add news summary
                    news_summary = get_news_summary()
                    analysis_data['news_summary'] = news_summary
                    
                    # Save to database
                    analysis = Analysis(
                        analysis_type='daily',
                        timeframe='D1',
                        price=analysis_data.get('current_price'),
                        trend=analysis_data.get('daily_trend'),
                        support_levels=analysis_data.get('key_levels'),
                        technical_indicators=analysis_data.get('technical_summary'),
                        smc_data=analysis_data.get('smc_analysis'),
                        recommendation=analysis_data.get('recommendation')
                    )
                    
                    db.session.add(analysis)
                    db.session.commit()
                    
                    # Send to Telegram
                    result = send_daily_report(analysis_data)
                    
                    if result:
                        analysis.sent_to_telegram = True
                        db.session.commit()
                        logger.info("Morning report sent successfully")
                    else:
                        logger.error("Failed to send morning report")
                else:
                    logger.error(f"Analysis error: {analysis_data.get('error')}")
                    
        except Exception as e:
            logger.error(f"Error in morning report: {e}")
    
    def evening_report(self):
        """Generate and send evening analysis report"""
        try:
            logger.info("Starting evening report generation")
            
            with app.app_context():
                # Perform analysis
                analysis_data = perform_daily_analysis()
                
                if 'error' not in analysis_data:
                    # Add session summary
                    analysis_data['session'] = 'Evening Session Summary'
                    
                    # Save to database
                    analysis = Analysis(
                        analysis_type='daily',
                        timeframe='H4',
                        price=analysis_data.get('current_price'),
                        trend=analysis_data.get('daily_trend'),
                        support_levels=analysis_data.get('key_levels'),
                        technical_indicators=analysis_data.get('technical_summary'),
                        smc_data=analysis_data.get('smc_analysis'),
                        recommendation=analysis_data.get('recommendation')
                    )
                    
                    db.session.add(analysis)
                    db.session.commit()
                    
                    # Send to Telegram
                    result = send_daily_report(analysis_data)
                    
                    if result:
                        analysis.sent_to_telegram = True
                        db.session.commit()
                        logger.info("Evening report sent successfully")
                    else:
                        logger.error("Failed to send evening report")
                        
        except Exception as e:
            logger.error(f"Error in evening report: {e}")
    
    def admin_report(self):
        """Generate and send comprehensive admin report"""
        try:
            logger.info("Starting admin report generation")
            
            with app.app_context():
                # Perform comprehensive analysis
                analysis_data = perform_daily_analysis()
                
                if 'error' not in analysis_data:
                    # Add performance statistics
                    total_signals = Signal.query.count()
                    approved_signals = Signal.query.filter_by(admin_approved=True).count()
                    pending_signals = Signal.query.filter_by(status='pending').count()
                    
                    analysis_data['statistics'] = {
                        'total_signals': total_signals,
                        'approved_signals': approved_signals,
                        'pending_signals': pending_signals
                    }
                    
                    # Send to admin
                    result = send_admin_report(analysis_data)
                    
                    if result:
                        logger.info("Admin report sent successfully")
                    else:
                        logger.error("Failed to send admin report")
                        
        except Exception as e:
            logger.error(f"Error in admin report: {e}")
    
    def weekly_report(self):
        """Generate and send weekly analysis report"""
        try:
            logger.info("Starting weekly report generation")
            
            with app.app_context():
                # Perform comprehensive weekly analysis
                analysis_data = perform_daily_analysis()
                
                if 'error' not in analysis_data:
                    analysis_data['report_type'] = 'weekly'
                    analysis_data['period'] = 'Weekly Summary'
                    
                    # Send weekly report
                    result = send_daily_report(analysis_data)
                    
                    if result:
                        logger.info("Weekly report sent successfully")
                    else:
                        logger.error("Failed to send weekly report")
                        
        except Exception as e:
            logger.error(f"Error in weekly report: {e}")
    
    def signal_monitoring(self):
        """Monitor for new trading signals every 15 minutes"""
        try:
            if not self.is_market_hours():
                logger.debug("Outside market hours, skipping signal monitoring")
                return
            
            logger.info("Starting signal monitoring")
            
            with app.app_context():
                # Get current market status and signals
                market_status = get_current_market_status()
                
                if 'error' not in market_status:
                    # Process signals from different timeframes
                    for timeframe, signals in market_status.get('signals', {}).items():
                        for signal_data in signals:
                            # Check if we already have this signal
                            existing_signal = Signal.query.filter_by(
                                entry_price=signal_data['entry'],
                                signal_type=signal_data['type'],
                                timeframe=timeframe,
                                created_at=db.func.date(datetime.utcnow())
                            ).first()
                            
                            if not existing_signal:
                                # Create new signal
                                new_signal = Signal(
                                    signal_type=signal_data['type'],
                                    entry_price=signal_data['entry'],
                                    stop_loss=signal_data['stop_loss'],
                                    take_profit=signal_data['take_profit'],
                                    timeframe=timeframe,
                                    confidence=signal_data['confidence'],
                                    pattern=signal_data['pattern'],
                                    smc_analysis=market_status.get('smc_analysis', {}),
                                    status='pending'
                                )
                                
                                db.session.add(new_signal)
                                db.session.commit()
                                
                                # Send for admin approval
                                send_signal_for_approval(new_signal.__dict__)
                                
                                logger.info(f"New signal created and sent for approval: {signal_data['type']} at {signal_data['entry']}")
                
        except Exception as e:
            logger.error(f"Error in signal monitoring: {e}")
    
    def market_status_check(self):
        """Check market status every 5 minutes"""
        try:
            if not self.is_market_hours():
                return
            
            logger.debug("Checking market status")
            
            with app.app_context():
                status = get_current_market_status()
                
                # Log important market events
                if 'error' not in status:
                    current_price = status.get('current_price')
                    if current_price:
                        logger.debug(f"Gold price: ${current_price:.2f}")
                        
                        # Check for significant price movements
                        # This could trigger alerts or additional analysis
                        
        except Exception as e:
            logger.error(f"Error in market status check: {e}")
    
    def daily_cleanup(self):
        """Perform daily database cleanup"""
        try:
            logger.info("Starting daily cleanup")
            
            with app.app_context():
                # Clean up old rejected signals (older than 7 days)
                from datetime import timedelta
                
                cutoff_date = datetime.utcnow() - timedelta(days=7)
                
                old_rejected_signals = Signal.query.filter(
                    Signal.status == 'rejected',
                    Signal.created_at < cutoff_date
                ).all()
                
                for signal in old_rejected_signals:
                    db.session.delete(signal)
                
                # Clean up old telegram messages (older than 30 days)
                from models import TelegramMessage
                
                cutoff_date = datetime.utcnow() - timedelta(days=30)
                
                old_messages = TelegramMessage.query.filter(
                    TelegramMessage.sent_at < cutoff_date
                ).all()
                
                for message in old_messages:
                    db.session.delete(message)
                
                db.session.commit()
                
                logger.info(f"Cleaned up {len(old_rejected_signals)} old signals and {len(old_messages)} old messages")
                
        except Exception as e:
            logger.error(f"Error in daily cleanup: {e}")
    
    def stop_scheduler(self):
        """Stop the scheduler"""
        try:
            if self.scheduler.running:
                self.scheduler.shutdown()
                self.is_running = False
                logger.info("Scheduler stopped")
        except Exception as e:
            logger.error(f"Error stopping scheduler: {e}")

# Global instance
scheduler_service = SchedulerService()

def send_initial_test_message():
    """Send initial test message after system startup"""
    try:
        import asyncio
        from services.data_service import get_gold_data
        from services.analysis_service import analyze_market_data
        from services.telegram_service import TelegramService
        from services.bot_monitoring_service import monitoring_service
        
        with app.app_context():
            logger.info("Sending initial test message")
            
            # Update component statuses
            monitoring_service.update_component_status('DATA_API', 'ONLINE')
            monitoring_service.update_component_status('TELEGRAM', 'ONLINE')
            monitoring_service.update_component_status('SCHEDULER', 'ONLINE')
            monitoring_service.update_component_status('ANALYSIS', 'ONLINE')
            
            # Get current market data
            try:
                data = get_gold_data('XAUUSD', 'H1', 10)
                if data and len(data) > 0:
                    latest_data = data[-1]
                    
                    # Perform analysis
                    analysis_result = analyze_market_data(data, 'H1')
                    
                    # Prepare analysis data for message
                    analysis_data = {
                        'current_price': latest_data.get('close', 0),
                        'trend': analysis_result.get('trend', 'Analyzing'),
                        'rsi': analysis_result.get('rsi', 'N/A')
                    }
                else:
                    analysis_data = {
                        'current_price': 0,
                        'trend': 'Data Loading',
                        'rsi': 'N/A'
                    }
            except Exception as e:
                logger.error(f"Error getting data for test message: {e}")
                analysis_data = {
                    'current_price': 0,
                    'trend': 'System Starting',
                    'rsi': 'N/A'
                }
            
            # Send test message
            telegram_service = TelegramService()
            
            # Use asyncio to run the async function
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                result = loop.run_until_complete(
                    telegram_service.send_initial_test_message(analysis_data)
                )
                logger.info(f"Initial test message sent: {result}")
            finally:
                loop.close()
                
    except Exception as e:
        logger.error(f"Error sending initial test message: {e}")

def init_scheduler():
    """Initialize scheduler"""
    # Run in separate thread to avoid blocking
    thread = threading.Thread(target=scheduler_service.init_scheduler)
    thread.daemon = True
    thread.start()
    
    # Schedule initial test message after 30 seconds
    def schedule_test_message():
        import time
        time.sleep(30)  # Wait 30 seconds for system to stabilize
        send_initial_test_message()
    
    test_thread = threading.Thread(target=schedule_test_message)
    test_thread.daemon = True
    test_thread.start()

def stop_scheduler():
    """Stop scheduler"""
    scheduler_service.stop_scheduler()
