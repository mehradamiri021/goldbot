from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz
import logging
from datetime import datetime, time
from services.analysis_service import perform_daily_analysis, get_current_market_status
from services.telegram_service import send_daily_report, send_admin_report, send_signal_for_approval

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
            
            # 🥇 PRIMARY: Daily AI Reports and Signal Analysis
            # Morning report at 09:09
            self.scheduler.add_job(
                func=self.morning_report,
                trigger=CronTrigger(hour=9, minute=9, timezone=self.timezone),
                id='morning_report',
                name='🎯 Morning AI Analysis Report (PRIMARY)',
                replace_existing=True
            )
            
            # Evening report at 15:15
            self.scheduler.add_job(
                func=self.evening_report,
                trigger=CronTrigger(hour=15, minute=15, timezone=self.timezone),
                id='evening_report',
                name='🎯 Evening AI Analysis Report (PRIMARY)',
                replace_existing=True
            )
            
            # 🥈 SECONDARY: Price announcements (11:11, 14:14, 17:17) on weekdays only
            self.scheduler.add_job(
                func=self.navasan_price_announcement,
                trigger=CronTrigger(hour=11, minute=11, day_of_week='mon-fri', timezone=self.timezone),
                id='navasan_morning',
                name='📊 Morning Price Update (11:11) - SECONDARY',
                replace_existing=True
            )
            
            self.scheduler.add_job(
                func=self.navasan_price_announcement,
                trigger=CronTrigger(hour=14, minute=14, day_of_week='mon-fri', timezone=self.timezone),
                id='navasan_afternoon',
                name='📊 Afternoon Price Update (14:14) - SECONDARY',
                replace_existing=True
            )
            
            self.scheduler.add_job(
                func=self.navasan_price_announcement,
                trigger=CronTrigger(hour=17, minute=17, day_of_week='mon-fri', timezone=self.timezone),
                id='navasan_evening',
                name='📊 Evening Price Update (17:17) - SECONDARY',
                replace_existing=True
            )
            
            # Enhanced Admin report at 19:00 (after all daily activities)
            self.scheduler.add_job(
                func=self.enhanced_admin_report,
                trigger=CronTrigger(hour=19, minute=0, timezone=self.timezone),
                id='enhanced_admin_report',
                name='Enhanced Daily Admin Report',
                replace_existing=True
            )
            
            # Weekly comprehensive report on Sunday at 12:12
            self.scheduler.add_job(
                func=self.weekly_comprehensive_report,
                trigger=CronTrigger(day_of_week='sun', hour=12, minute=12, timezone=self.timezone),
                id='weekly_comprehensive_report',
                name='Weekly Comprehensive Report',
                replace_existing=True
            )
            
            # 🥇 PRIMARY: Signal monitoring every 15 minutes during market hours
            self.scheduler.add_job(
                func=self.signal_monitoring,
                trigger=CronTrigger(minute='*/15', timezone=self.timezone),
                id='signal_monitoring',
                name='🎯 15-Minute Signal Monitor (PRIMARY)',
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
                    
                    if result is not None and len(result) > 0:
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
                    
                    if result is not None and len(result) > 0:
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
                    
                    if result is not None and len(result) > 0:
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
                    
                    if result is not None and len(result) > 0:
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
                            # Check if we already have this signal - Fixed SQLAlchemy query
                            from models import Signal
                            existing_signal = Signal.query.filter_by(
                                entry_price=signal_data['entry'],
                                signal_type=signal_data['type'],
                                timeframe=timeframe
                            ).filter(
                                db.func.date(Signal.created_at) == datetime.utcnow().date()
                            ).first()
                            
                            if existing_signal is None or len(existing_signal) == 0:
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
                    if current_price is not None and len(current_price) > 0:
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
                
                # Fixed SQLAlchemy query
                from models import Signal
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
    
    def navasan_price_announcement(self):
        """Send scheduled Navasan price announcement"""
        with app.app_context():
            try:
                from services.price_bot_service import price_bot_service
                from services.telegram_service_helper import send_admin_notification
                import asyncio
                
                # Get current time for logging
                current_time = datetime.now(self.timezone).strftime("%H:%M")
                logger.info(f"🕒 Starting scheduled Navasan price announcement at {current_time}")
                
                # Execute price update
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                try:
                    result = loop.run_until_complete(price_bot_service.scheduled_price_update())
                    
                    # Notify admin about the result
                    if result.get('status') == 'success':
                        admin_msg = f"✅ قیمت‌های نوسان در ساعت {current_time} با موفقیت ارسال شد\n"
                        admin_msg += f"🎯 وضعیت: {result.get('message', 'ارسال موفق')}\n"
                        admin_msg += f"📊 ارسال به کانال: {'✅ بله' if result.get('sent_to_channel') else '❌ خیر'}"
                        
                        loop.run_until_complete(send_admin_notification(admin_msg, "SUCCESS"))
                        logger.info(f"✅ Navasan price announcement at {current_time} successful")
                    else:
                        admin_msg = f"❌ خطا در ارسال قیمت‌های نوسان در ساعت {current_time}\n"
                        admin_msg += f"🔍 علت: {result.get('message', 'خطای نامشخص')}"
                        
                        loop.run_until_complete(send_admin_notification(admin_msg, "ERROR"))
                        logger.error(f"❌ Navasan price announcement at {current_time} failed")
                        
                finally:
                    loop.close()
                    
            except Exception as e:
                logger.error(f"❌ Failed to send Navasan price announcement: {e}")
                # Notify admin about the error
                try:
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    error_msg = f"🚨 خطای سیستمی در ارسال قیمت‌های نوسان\n⏰ زمان: {datetime.now(self.timezone).strftime('%H:%M')}\n🔍 خطا: {str(e)}"
                    loop.run_until_complete(send_admin_notification(error_msg, "ERROR"))
                    loop.close()
                except:
                    pass

    def enhanced_admin_report(self):
        """Send enhanced daily admin report including Navasan activities"""
        with app.app_context():
            try:
                from services.telegram_service_helper import send_admin_notification
                from models import PriceRecord, BotStatistics
                import asyncio
                
                # Get today's statistics
                today = datetime.now(self.timezone).date()
                
                # Count signals
                total_signals = Signal.query.filter(
                    Signal.created_at >= datetime.combine(today, datetime.min.time())
                ).count()
                
                approved_signals = Signal.query.filter(
                    Signal.created_at >= datetime.combine(today, datetime.min.time()),
                    Signal.admin_approved == True
                ).count()
                
                # Count price records today
                try:
                    price_records_today = PriceRecord.query.filter(
                        PriceRecord.timestamp >= datetime.combine(today, datetime.min.time())
                    ).count()
                    
                    successful_price_sends = PriceRecord.query.filter(
                        PriceRecord.timestamp >= datetime.combine(today, datetime.min.time()),
                        PriceRecord.channel_sent == True
                    ).count()
                except:
                    price_records_today = 0
                    successful_price_sends = 0
                
                # Get bot statistics
                try:
                    bot_stats = BotStatistics.query.filter_by(date=today).first()
                except:
                    bot_stats = None
                
                # Prepare enhanced report
                report = f"📊 گزارش روزانه کامل - {today.strftime('%Y/%m/%d')}\n\n"
                
                # Trading signals section
                report += f"🎯 **بخش سیگنال‌های معاملاتی:**\n"
                report += f"├ کل سیگنال‌ها: {total_signals}\n"
                report += f"├ تایید شده: {approved_signals}\n"
                report += f"└ در انتظار: {total_signals - approved_signals}\n\n"
                
                # Navasan price section
                report += f"💰 **بخش قیمت‌های نوسان:**\n"
                report += f"├ کل به‌روزرسانی‌ها: {price_records_today}\n"
                report += f"├ ارسال موفق به کانال: {successful_price_sends}\n"
                if price_records_today > 0:
                    report += f"└ نرخ موفقیت: {(successful_price_sends/price_records_today*100):.1f}%\n\n"
                else:
                    report += f"└ نرخ موفقیت: 0%\n\n"
                
                # System statistics
                if bot_stats is not None and len(bot_stats) > 0:
                    report += f"🤖 **آمار سیستم:**\n"
                    report += f"├ فراخوانی API: {bot_stats.total_api_calls}\n"
                    report += f"├ پیام‌های موفق: {bot_stats.successful_messages}\n"
                    report += f"└ خطاها: {bot_stats.error_count}\n\n"
                
                report += f"⏰ زمان گزارش: {datetime.now(self.timezone).strftime('%H:%M:%S')}\n"
                report += f"✅ سیستم در حال اجرای عادی"
                
                # Send report to admin
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                loop.run_until_complete(send_admin_notification(report, "INFO"))
                loop.close()
                
                logger.info("✅ Enhanced daily admin report sent successfully")
                
            except Exception as e:
                logger.error(f"❌ Failed to send enhanced admin report: {e}")

    def weekly_comprehensive_report(self):
        """Send comprehensive weekly report with charts and news on Sundays at 12:12"""
        with app.app_context():
            try:
                from services.data_service import get_gold_data
                from services.analysis_service import analyze_market_data
                from services.news_service import get_weekly_news_summary
                from services.telegram_service_helper import send_telegram_message
                import asyncio
                import jdatetime
                
                logger.info("🗓️ Starting weekly comprehensive report generation")
                
                # Get current Persian date
                persian_date = jdatetime.datetime.now().strftime('%Y/%m/%d')
                
                # Get market data for different timeframes
                weekly_data = get_gold_data('W1', 20)
                daily_data = get_gold_data('D1', 30)
                h4_data = get_gold_data('H4', 100)
                
                report_parts = []
                
                # Header
                report_parts.append("📊 گزارش هفتگی جامع طلا")
                report_parts.append(f"📅 تاریخ: {persian_date} شمسی")
                report_parts.append("═" * 35)
                report_parts.append("")
                
                # Weekly analysis
                if weekly_data is not None and len(weekly_data) > 0:
                    weekly_analysis = analyze_market_data(weekly_data, 'W1')
                    latest_weekly = weekly_data[-1]
                    
                    report_parts.append("📈 **تحلیل تایم‌فریم هفتگی:**")
                    report_parts.append(f"💰 قیمت فعلی: ${latest_weekly.get('close', 0):.2f}")
                    report_parts.append(f"📊 روند هفتگی: {weekly_analysis.get('trend', 'در حال بررسی')}")
                    report_parts.append(f"🎯 RSI هفتگی: {weekly_analysis.get('rsi', 'N/A')}")
                    
                    # Weekly support/resistance
                    if weekly_analysis.get('support_resistance'):
                        sr = weekly_analysis['support_resistance']
                        report_parts.append(f"🔴 مقاومت: ${sr.get('resistance', 0):.2f}")
                        report_parts.append(f"🟢 حمایت: ${sr.get('support', 0):.2f}")
                    
                    report_parts.append("")
                
                # Daily analysis
                if daily_data is not None and len(daily_data) > 0:
                    daily_analysis = analyze_market_data(daily_data, 'D1')
                    latest_daily = daily_data[-1]
                    
                    report_parts.append("📈 **تحلیل تایم‌فریم روزانه:**")
                    report_parts.append(f"📊 روند روزانه: {daily_analysis.get('trend', 'در حال بررسی')}")
                    report_parts.append(f"🎯 RSI روزانه: {daily_analysis.get('rsi', 'N/A')}")
                    
                    # Price movement this week
                    if len(daily_data) >= 7:
                        week_start = daily_data[-7]['close']
                        week_current = latest_daily['close']
                        week_change = ((week_current - week_start) / week_start) * 100
                        
                        change_emoji = "🟢" if week_change > 0 else "🔴"
                        report_parts.append(f"{change_emoji} تغییر هفتگی: {week_change:+.2f}%")
                    
                    report_parts.append("")
                
                # 4-hour analysis
                if h4_data is not None and len(h4_data) > 0:
                    h4_analysis = analyze_market_data(h4_data, 'H4')
                    
                    report_parts.append("📈 **تحلیل تایم‌فریم 4 ساعته:**")
                    report_parts.append(f"📊 روند 4 ساعته: {h4_analysis.get('trend', 'در حال بررسی')}")
                    report_parts.append(f"🎯 RSI (4H): {h4_analysis.get('rsi', 'N/A')}")
                    
                    # Recent momentum
                    if h4_analysis.get('momentum'):
                        momentum = h4_analysis['momentum']
                        report_parts.append(f"⚡ مومنتوم: {momentum}")
                    
                    report_parts.append("")
                
                # Get weekly news summary
                try:
                    news_summary = get_weekly_news_summary()
                    if news_summary is not None and len(news_summary) > 0:
                        report_parts.append("📰 **اخبار مهم هفته:**")
                        report_parts.append("")
                        
                        for i, news in enumerate(news_summary[:5], 1):  # Top 5 news
                            title = news.get('title', 'بدون عنوان')[:80]
                            impact = news.get('impact', 'متوسط')
                            
                            impact_emoji = {
                                'high': '🔴',
                                'medium': '🟡', 
                                'low': '🟢'
                            }.get(impact.lower(), '🟡')
                            
                            report_parts.append(f"{impact_emoji} **{i}.** {title}")
                            
                            if news.get('summary'):
                                summary = news['summary'][:120]
                                report_parts.append(f"   💭 {summary}...")
                            
                            report_parts.append("")
                        
                    else:
                        report_parts.append("📰 **اخبار مهم هفته:**")
                        report_parts.append("🔍 در حال جمع‌آوری اخبار مهم...")
                        report_parts.append("")
                        
                except Exception as e:
                    logger.error(f"Error getting weekly news: {e}")
                    report_parts.append("📰 **اخبار مهم هفته:**")
                    report_parts.append("⚠️ خطا در دریافت اخبار")
                    report_parts.append("")
                
                # Weekly outlook
                report_parts.append("🔮 **چشم‌انداز هفته آینده:**")
                
                # Calculate overall sentiment
                overall_trend = "خنثی"
                if weekly_data and daily_data and h4_data:
                    weekly_trend = analyze_market_data(weekly_data, 'W1').get('trend', 'neutral')
                    daily_trend = analyze_market_data(daily_data, 'D1').get('trend', 'neutral')
                    
                    if 'bullish' in weekly_trend.lower() or 'صعودی' in weekly_trend:
                        overall_trend = "صعودی"
                    elif 'bearish' in weekly_trend.lower() or 'نزولی' in weekly_trend:
                        overall_trend = "نزولی"
                
                report_parts.append(f"📊 روند کلی پیش‌بینی: {overall_trend}")
                report_parts.append("⚠️ توجه: این تحلیل بر اساس داده‌های فنی است")
                report_parts.append("")
                
                # Footer
                report_parts.append("═" * 35)
                report_parts.append("🤖 ربات تحلیل و سیگنال طلا")
                report_parts.append("📈 Smart Money Concepts")
                
                # Prepare final message
                weekly_report = "\n".join(report_parts)
                
                # Send to channel
                channel_id = "-1002717718463"
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                try:
                    success = loop.run_until_complete(
                        send_telegram_message(channel_id, weekly_report)
                    )
                    
                    if success is not None and len(success) > 0:
                        logger.info("✅ Weekly comprehensive report sent successfully")
                        
                        # Send admin notification
                        from services.telegram_service_helper import send_admin_notification
                        admin_msg = f"✅ گزارش هفتگی جامع با موفقیت ارسال شد\n📅 تاریخ: {persian_date}\n📊 شامل تحلیل چارت و اخبار هفته"
                        loop.run_until_complete(send_admin_notification(admin_msg, "SUCCESS"))
                        
                    else:
                        logger.error("❌ Failed to send weekly comprehensive report")
                        # Send error notification to admin
                        from services.telegram_service_helper import send_admin_notification
                        admin_msg = f"❌ خطا در ارسال گزارش هفتگی\n📅 تاریخ: {persian_date}"
                        loop.run_until_complete(send_admin_notification(admin_msg, "ERROR"))
                        
                finally:
                    loop.close()
                
            except Exception as e:
                logger.error(f"❌ Failed to generate weekly comprehensive report: {e}")
                # Send error notification to admin
                try:
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    error_msg = f"🚨 خطای سیستمی در گزارش هفتگی\n⏰ زمان: {datetime.now(self.timezone).strftime('%H:%M')}\n🔍 خطا: {str(e)}"
                    from services.telegram_service_helper import send_admin_notification
                    loop.run_until_complete(send_admin_notification(error_msg, "ERROR"))
                    loop.close()
                except:
                    pass
    
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
                data = get_gold_data('H1', 10)
                if data is not None and len(data) > 0:
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
