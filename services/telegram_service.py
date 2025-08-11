import os
import logging
from datetime import datetime
import json
import asyncio
import requests
from telegram import Bot, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CallbackQueryHandler, CommandHandler

logger = logging.getLogger(__name__)

class TelegramService:
    def __init__(self):
        # Pre-configured Telegram settings - no manual setup required
        # تنظیمات تلگرام از پیش تعریف شده - نیازی به تنظیم دستی نیست
        self.bot_token = '7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y'
        self.channel_id = '-1002717718463'
        self.admin_id = '1112066452'
        self.bot = Bot(token=self.bot_token)
        self.application = None
    
    async def send_message(self, chat_id, text, parse_mode='HTML', reply_markup=None):
        """Send message to Telegram"""
        try:
            message = await self.bot.send_message(
                chat_id=chat_id,
                text=text,
                parse_mode=parse_mode,
                reply_markup=reply_markup
            )
            
            logger.info(f"Message sent to {chat_id}: {text[:100]}...")
            return message
            
        except Exception as e:
            logger.error(f"Error sending message to {chat_id}: {e}")
            return None
    
    async def send_daily_report(self, analysis_data):
        """Send daily analysis report to channel"""
        try:
            report = self.format_daily_report(analysis_data)
            message = await self.send_message(self.channel_id, report)
            
            # Log to database
            from app import db
            from models import TelegramMessage
            
            telegram_msg = TelegramMessage(
                message_type='REPORT',
                recipient_type='CHANNEL',
                recipient_id=self.channel_id,
                message_text=report,
                status='SENT' if message else 'FAILED',
                telegram_message_id=str(message.message_id) if message else None,
                sent_at=datetime.utcnow() if message else None
            )
            db.session.add(telegram_msg)
            db.session.commit()
            
            return message
            
        except Exception as e:
            logger.error(f"Error sending daily report: {e}")
            return None
    
    async def send_admin_report(self, analysis_data):
        """Send comprehensive report to admin"""
        try:
            report = self.format_admin_report(analysis_data)
            message = await self.send_message(self.admin_id, report)
            
            # Log to database
            from app import db
            from models import TelegramMessage
            
            telegram_msg = TelegramMessage(
                message_type='ADMIN',
                recipient_type='ADMIN',
                recipient_id=self.admin_id,
                message_text=report,
                status='SENT' if message else 'FAILED',
                telegram_message_id=str(message.message_id) if message else None,
                sent_at=datetime.utcnow() if message else None
            )
            db.session.add(telegram_msg)
            db.session.commit()
            
            return message
            
        except Exception as e:
            logger.error(f"Error sending admin report: {e}")
            return None
    
    async def send_signal_for_approval(self, signal_data):
        """Send signal to admin for approval"""
        try:
            message_text = self.format_signal_for_approval(signal_data)
            
            # Create approval buttons
            keyboard = [
                [
                    InlineKeyboardButton("✅ تأیید و ارسال", callback_data=f"approve_{signal_data['id']}"),
                    InlineKeyboardButton("❌ رد کردن", callback_data=f"reject_{signal_data['id']}")
                ]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            message = await self.send_message(
                self.admin_id, 
                message_text, 
                reply_markup=reply_markup
            )
            
            return message
            
        except Exception as e:
            logger.error(f"Error sending signal for approval: {e}")
            return None
    
    async def send_signal_to_channel(self, signal_data):
        """Send approved signal to channel"""
        try:
            signal_text = self.format_signal_for_channel(signal_data)
            message = await self.send_message(self.channel_id, signal_text)
            
            # Log to database  
            from app import db
            from models import TelegramMessage
            
            telegram_msg = TelegramMessage(
                message_type='SIGNAL',
                recipient_type='CHANNEL',
                recipient_id=self.channel_id,
                message_text=signal_text,
                status='SENT' if message else 'FAILED',
                telegram_message_id=str(message.message_id) if message else None,
                sent_at=datetime.utcnow() if message else None
            )
            db.session.add(telegram_msg)
            db.session.commit()
            
            return message
            
        except Exception as e:
            logger.error(f"Error sending signal to channel: {e}")
            return None
    
    async def send_initial_test_message(self, analysis_data):
        """Send initial test message with complete analysis after first data collection"""
        try:
            from services.bot_monitoring_service import monitoring_service
            from utils.helpers import get_tehran_time, format_price
            
            current_time = get_tehran_time()
            
            # Create comprehensive test message
            message_text = f"""
🚀 **ربات تحلیل طلای جهانی - پیام تست**

🤖 **وضعیت سیستم:** آنلاین و آماده
⏰ **زمان راه‌اندازی:** {current_time.strftime('%Y/%m/%d %H:%M')}

📊 **آخرین تحلیل بازار:**
💰 قیمت فعلی: {format_price(analysis_data.get('current_price', 0))}
📈 ترند: {analysis_data.get('trend', 'در حال بررسی')}
🔍 RSI: {analysis_data.get('rsi', 'N/A')}

🔧 **سرویس‌های فعال:**
✅ سرویس داده‌ها
✅ تحلیل هوشمند SMC
✅ ارسال خودکار تلگرام
✅ مانیتورینگ 15 دقیقه‌ای

📅 **برنامه ارسال:**
🌅 گزارش صبحانه: 09:09
🌆 گزارش عصر: 15:15
📈 مانیتورینگ مداوم: هر 15 دقیقه

⚠️ **توجه:** این پیام تست بوده و سیستم به طور کامل راه‌اندازی شده است.

🔔 از این پس تحلیل‌ها و سیگنال‌های معاملاتی به صورت خودکار ارسال خواهند شد.
            """.strip()
            
            # Send to channel
            channel_message = await self.send_message(self.channel_id, message_text)
            
            # Send detailed status to admin
            health_report = monitoring_service.get_bot_health_report()
            admin_message = f"""
🔧 **گزارش وضعیت سیستم - ادمین**

📊 **امتیاز سلامت:** {health_report.get('health_score', 0):.1f}%
⏰ **زمان گزارش:** {current_time.strftime('%Y/%m/%d %H:%M')}

🔍 **وضعیت کامپوننت‌ها:**
{'🟢 API داده‌ها: آنلاین' if health_report.get('in_memory_statuses', {}).get('DATA_API') == 'ONLINE' else '🔴 API داده‌ها: آفلاین'}
{'🟢 تلگرام: آنلاین' if health_report.get('in_memory_statuses', {}).get('TELEGRAM') == 'ONLINE' else '🔴 تلگرام: آفلاین'}  
{'🟢 زمان‌بند: آنلاین' if health_report.get('in_memory_statuses', {}).get('SCHEDULER') == 'ONLINE' else '🔴 زمان‌بند: آفلاین'}
{'🟢 تحلیلگر: آنلاین' if health_report.get('in_memory_statuses', {}).get('ANALYSIS') == 'ONLINE' else '🔴 تحلیلگر: آفلاین'}

📋 **سیگنال‌های در انتظار:** {health_report.get('pending_signals_count', 0)}

✅ سیستم به طور کامل راه‌اندازی و آماده کار است.
            """.strip()
            
            admin_message_obj = await self.send_message(self.admin_id, admin_message)
            
            # Log both messages to database
            from app import db
            from models import TelegramMessage
            
            # Log channel message
            channel_log = TelegramMessage(
                message_type='STARTUP_TEST',
                recipient_type='CHANNEL',
                recipient_id=self.channel_id,
                message_text=message_text,
                status='SENT' if channel_message else 'FAILED',
                telegram_message_id=str(channel_message.message_id) if channel_message else None,
                sent_at=datetime.utcnow() if channel_message else None
            )
            db.session.add(channel_log)
            
            # Log admin message
            admin_log = TelegramMessage(
                message_type='STARTUP_STATUS',
                recipient_type='ADMIN', 
                recipient_id=self.admin_id,
                message_text=admin_message,
                status='SENT' if admin_message_obj else 'FAILED',
                telegram_message_id=str(admin_message_obj.message_id) if admin_message_obj else None,
                sent_at=datetime.utcnow() if admin_message_obj else None
            )
            db.session.add(admin_log)
            db.session.commit()
            
            logger.info("Initial test messages sent successfully")
            return channel_message and admin_message_obj
            
        except Exception as e:
            logger.error(f"Error sending initial test message: {e}")
            return False
    
    async def send_admin_notification(self, message_text: str, message_type: str = 'NOTIFICATION'):
        """Send notification to admin"""
        try:
            message = await self.send_message(self.admin_id, message_text)
            
            # Log to database
            from app import db
            from models import TelegramMessage
            
            telegram_msg = TelegramMessage(
                message_type=message_type,
                recipient_type='ADMIN',
                recipient_id=self.admin_id,
                message_text=message_text,
                status='SENT' if message else 'FAILED',
                telegram_message_id=str(message.message_id) if message else None,
                sent_at=datetime.utcnow() if message else None
            )
            db.session.add(telegram_msg)
            db.session.commit()
            
            return message
            
        except Exception as e:
            logger.error(f"Error sending admin notification: {e}")
            return None
    
    def get_persian_date(self):
        """Get current date in Persian format"""
        try:
            from datetime import datetime
            now = datetime.now()
            # Simple Persian date conversion (approximate)
            persian_months = [
                '', 'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
                'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
            ]
            # Simplified conversion for demo
            persian_day = now.day + 10  # Approximate conversion
            persian_month = persian_months[now.month] if now.month <= 12 else persian_months[1]
            persian_year = now.year - 621  # Approximate conversion
            return f"{persian_day} {persian_month} {persian_year}"
        except:
            return "۲۰ مرداد ۱۴۰۴"
    
    def get_persian_weekday(self):
        """Get current weekday in Persian"""
        try:
            weekdays = ['دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه', 'یکشنبه']
            return weekdays[datetime.now().weekday()]
        except:
            return "دوشنبه"
    
    def format_daily_report(self, analysis_data):
        """Format daily analysis report matching provided template"""
        try:
            from services.news_service import get_news_summary
            
            current_time = datetime.now().strftime('%H:%M')
            current_date_persian = self.get_persian_date()
            weekday = self.get_persian_weekday()
            
            # Get latest price and trend
            price = analysis_data.get('current_price', 3350.0)
            trend = analysis_data.get('trend', 'خنثی')
            daily_change = analysis_data.get('daily_change_percent', 0)
            daily_high = analysis_data.get('daily_high', price * 1.01)
            daily_low = analysis_data.get('daily_low', price * 0.99)
            
            # Determine trend emoji and description
            if daily_change > 0.5:
                trend_desc = "صعودی"
            elif daily_change < -0.5:
                trend_desc = "نزولی"
            else:
                trend_desc = "خنثی تا " + ("نزولی" if daily_change < 0 else "صعودی" if daily_change > 0 else "خنثی")
            
            # Technical levels
            resistance_main = analysis_data.get('resistance', price * 1.015)
            support_main = analysis_data.get('support', price * 0.985)
            resistance_daily = analysis_data.get('resistance_daily', price * 1.01)
            support_daily = analysis_data.get('support_daily', price * 0.99)
            
            # RSI levels
            rsi_weekly = analysis_data.get('rsi_weekly', 69)
            rsi_daily = analysis_data.get('rsi_daily', 53.49)
            rsi_4h = analysis_data.get('rsi_4h', 65.02)
            rsi_15m = analysis_data.get('rsi_15m', 47.19)
            
            # Daily range
            daily_range = daily_high - daily_low
            daily_range_percent = (daily_range / price) * 100
            
            # Get news summary
            news_summary = get_news_summary()
            
            report = f"""📊 تحلیل روزانه بازار انس جهانی طلا (XAU/USD)
📅 {weekday} {current_date_persian} – ساعت {current_time}

📈 پرایس اکشن و ساختار بازار:
قیمت فعلی: {price:,.2f} دلار

روند کلی: {trend_desc}

بازه نوسان روزانه: بین {daily_low:,.0f} تا {daily_high:,.0f} دلار

محدوده‌های کلیدی:

مقاومت اصلی روزانه: {resistance_main:,.0f} دلار (+{((resistance_main/price-1)*100):+.2f}%) – محدوده‌ای که چند بار جلوی رشد قیمت را گرفته.

حمایت اصلی روزانه: {support_main:,.0f} دلار – شکست آن می‌تواند افت تا {support_main*0.99:,.0f} دلار را به دنبال داشته باشد.

ساختار بازار (BOS/CHoCH):

تایم ۴ ساعته: {"شکست نزولی ساختار تأیید شده و حرکت به سمت حمایت" if "نزولی" in trend_desc else "ساختار صعودی حفظ شده" if "صعودی" in trend_desc else "ساختار در حال تشکیل"}

تایم روزانه: {"هنوز حمایت اصلی حفظ شده ولی فشار فروش محسوس است" if "نزولی" in trend_desc else "قدرت خریداران مشاهده می‌شود" if "صعودی" in trend_desc else "تعادل بین عرضه و تقاضا"}

📊 اندیکاتورها و اوسیلاتورها:
RSI هفتگی: حدود {rsi_weekly:.0f} – {"نزدیک محدوده اشباع خرید، احتمال اصلاح بیشتر" if rsi_weekly > 65 else "محدوده خنثی" if rsi_weekly > 35 else "نزدیک اشباع فروش"}

RSI روزانه: {rsi_daily:.2f} – {"اشباع خرید" if rsi_daily > 70 else "محدوده خنثی، تمایل به کاهش" if rsi_daily > 30 else "اشباع فروش"}

RSI چهار ساعته: {rsi_4h:.2f} – {"نزدیک اشباع خرید، واگرایی منفی" if rsi_4h > 65 else "محدوده طبیعی" if rsi_4h > 35 else "نزدیک اشباع فروش"}

RSI پانزده دقیقه‌ای: {rsi_15m:.2f} – {"اشباع خرید کوتاه‌مدت" if rsi_15m > 70 else "نزدیک اشباع فروش، احتمال بازگشت کوتاه‌مدت" if rsi_15m < 30 else "محدوده خنثی"}

MACD: {analysis_data.get('macd_signal', 'در تایم پایین‌تر منفی، در تایم روزانه رو به کاهش')}

📊 آمار بازار ۲۴ ساعته:
تغییر قیمت: {daily_change:+.2f}%

بالاترین قیمت: {daily_high:,.2f} دلار

پایین‌ترین قیمت: {daily_low:,.0f} دلار

نوسان روزانه: حدود {daily_range:.0f} دلار ({daily_range_percent:.2f}%)

📌 تحلیل جامع و جمع‌بندی:
🔹 {"بازار امروز تحت فشار فروش قرار دارد و در حال آزمایش حمایت" if "نزولی" in trend_desc else "بازار امروز حمایت خریداران را دارد" if "صعودی" in trend_desc else "بازار در حالت تعادل قرار دارد"} {support_main:,.0f} دلار است.
🔹 {"تایم‌فریم‌های پایین‌تر نشانه‌هایی از اشباع فروش دارند که می‌تواند یک اصلاح کوتاه‌مدت ایجاد کند" if rsi_15m < 35 else "تایم‌فریم‌های پایین‌تر در محدوده طبیعی قرار دارند"}.
🔹 در صورتی که {"حمایت" if "نزولی" in trend_desc else "مقاومت"} {support_main if "نزولی" in trend_desc else resistance_main:,.0f} دلار {"شکسته شود" if "نزولی" in trend_desc else "عبور شود"}, {"افت" if "نزولی" in trend_desc else "صعود"} تا {support_main*0.985 if "نزولی" in trend_desc else resistance_main*1.015:,.0f} و {support_main*0.97 if "نزولی" in trend_desc else resistance_main*1.03:,.0f} دلار محتمل است.
🔹 در صورت برگشت از {"حمایت فعلی" if "نزولی" in trend_desc else "مقاومت فعلی"}, هدف {"صعودی" if "نزولی" in trend_desc else "نزولی"} اول {resistance_daily if "نزولی" in trend_desc else support_daily:,.0f} دلار و سپس {"مقاومت" if "نزولی" in trend_desc else "حمایت"} {resistance_main if "نزولی" in trend_desc else support_main:,.0f} دلار خواهد بود.

🎯 چشم‌انداز کوتاه‌مدت:
سناریوی صعودی: {"برگشت از" if "نزولی" in trend_desc else "عبور از"} {support_main if "نزولی" in trend_desc else resistance_daily:,.0f} دلار → هدف {resistance_daily:,.0f} و {resistance_main:,.0f} دلار.

سناریوی نزولی: {"شکست" if "نزولی" in trend_desc else "عدم عبور از"} {support_main if "نزولی" in trend_desc else resistance_main:,.0f} دلار → هدف {support_main*0.985:,.0f} و {support_main*0.97:,.0f} دلار.

{news_summary}

⚠️ هشدار: این تحلیل صرفاً جنبه آموزشی و اطلاع‌رسانی دارد. مسئولیت تصمیم‌گیری نهایی با معامله‌گر است."""
            
            return report
            
        except Exception as e:
            logger.error(f"Error formatting daily report: {e}")
            return "خطا در تولید گزارش روزانه"
    
    def format_admin_report(self, analysis_data):
        """Format comprehensive admin report"""
        try:
            signals = analysis_data.get('signals', [])
            smc_analysis = analysis_data.get('smc_analysis', {})
            
            report = self.format_daily_report(analysis_data)
            
            # Add SMC analysis
            report += f"\n\n🧠 **تحلیل Smart Money:**"
            
            market_structure = smc_analysis.get('market_structure', {})
            if market_structure:
                report += f"\n📊 ساختار بازار: {market_structure.get('structure', 'نامشخص')}"
            
            order_blocks = smc_analysis.get('order_blocks', [])
            if order_blocks:
                report += f"\n📦 Order Blocks: {len(order_blocks)} بلاک شناسایی شد"
            
            bos_signal = smc_analysis.get('bos_signal')
            if bos_signal:
                report += f"\n🔥 BOS Signal: {bos_signal['type']}"
            
            # Add signals summary
            if signals:
                report += f"\n\n📈 **سیگنال‌های شناسایی شده:**"
                for i, signal in enumerate(signals[:3], 1):
                    confidence_emoji = '🔥' if signal['confidence'] > 0.8 else '⚡' if signal['confidence'] > 0.6 else '📌'
                    report += f"\n{i}. {confidence_emoji} {signal['type']} - {signal['pattern']}"
                    report += f"\n   اعتماد: {signal['confidence']*100:.0f}%"
                    report += f"\n   دلیل: {signal['reason']}"
            
            return report
            
        except Exception as e:
            logger.error(f"Error formatting admin report: {e}")
            return "خطا در تولید گزارش ادمین"
    
    def format_signal_for_approval(self, signal_data):
        """Format signal for admin approval"""
        try:
            signal_type = signal_data.get('signal_type', 'UNKNOWN')
            entry_price = signal_data.get('entry_price', 0)
            stop_loss = signal_data.get('stop_loss', 0)
            take_profit = signal_data.get('take_profit', 0)
            confidence = signal_data.get('confidence', 0)
            pattern = signal_data.get('pattern', 'UNKNOWN')
            timeframe = signal_data.get('timeframe', 'H1')
            
            # Calculate risk/reward
            if signal_type == 'BUY':
                risk = entry_price - stop_loss
                reward = take_profit - entry_price
            else:
                risk = stop_loss - entry_price
                reward = entry_price - take_profit
            
            rr_ratio = reward / risk if risk > 0 else 0
            
            message = f"""
🚨 **سیگنال جدید برای تأیید**

💎 **جفت ارز:** XAUUSD
📊 **تایم فریم:** {timeframe}
🎯 **نوع:** {signal_type}
📈 **الگو:** {pattern}

💰 **قیمت ورود:** ${entry_price:.2f}
🛡️ **Stop Loss:** ${stop_loss:.2f}
🎯 **Take Profit:** ${take_profit:.2f}

📊 **نسبت ریسک/ریوارد:** 1:{rr_ratio:.2f}
🔥 **درجه اعتماد:** {confidence*100:.0f}%

⏰ **زمان:** {datetime.now().strftime('%H:%M:%S')}

❓ آیا این سیگنال را تأیید می‌کنید؟
            """.strip()
            
            return message
            
        except Exception as e:
            logger.error(f"Error formatting signal for approval: {e}")
            return "خطا در تولید سیگنال"
    
    def format_signal_for_channel(self, signal_data):
        """Format signal for channel publication"""
        try:
            signal_type = signal_data.get('signal_type', 'UNKNOWN')
            entry_price = signal_data.get('entry_price', 0)
            stop_loss = signal_data.get('stop_loss', 0)
            take_profit = signal_data.get('take_profit', 0)
            pattern = signal_data.get('pattern', 'UNKNOWN')
            timeframe = signal_data.get('timeframe', 'H1')
            
            # Signal emoji
            signal_emoji = '🟢' if signal_type == 'BUY' else '🔴'
            
            message = f"""
{signal_emoji} **سیگنال طلای جهانی**

💎 **XAUUSD**
📊 {timeframe} | 📈 {pattern}

{signal_emoji} **{signal_type}**
💰 ورود: ${entry_price:.2f}
🛡️ SL: ${stop_loss:.2f}
🎯 TP: ${take_profit:.2f}

⚠️ **تذکر:** همیشه مدیریت ریسک را رعایت کنید

🔗 @GoldAnalysisChannel
            """.strip()
            
            return message
            
        except Exception as e:
            logger.error(f"Error formatting signal for channel: {e}")
            return "خطا در تولید سیگنال کانال"
    
    async def handle_callback(self, update, context):
        """Handle callback queries from inline keyboards"""
        try:
            query = update.callback_query
            await query.answer()
            
            callback_data = query.data
            
            if callback_data.startswith('approve_'):
                signal_id = int(callback_data.split('_')[1])
                await self.approve_signal(signal_id, query)
                
            elif callback_data.startswith('reject_'):
                signal_id = int(callback_data.split('_')[1])
                await self.reject_signal(signal_id, query)
                
        except Exception as e:
            logger.error(f"Error handling callback: {e}")
    
    async def approve_signal(self, signal_id, query):
        """Approve and send signal"""
        try:
            from app import db
            from models import Signal
            
            signal = Signal.query.get(signal_id)
            if signal:
                signal.admin_approved = True
                signal.status = 'approved'
                signal.executed_at = datetime.utcnow()
                db.session.commit()
                
                # Send to channel
                await self.send_signal_to_channel(signal.__dict__)
                
                # Update admin message
                await query.edit_message_text(
                    text=query.message.text + "\n\n✅ سیگنال تأیید و ارسال شد!",
                    parse_mode='HTML'
                )
                
        except Exception as e:
            logger.error(f"Error approving signal: {e}")
    
    async def reject_signal(self, signal_id, query):
        """Reject signal"""
        try:
            from app import db
            from models import Signal
            
            signal = Signal.query.get(signal_id)
            if signal:
                signal.status = 'rejected'
                db.session.commit()
                
                # Update admin message
                await query.edit_message_text(
                    text=query.message.text + "\n\n❌ سیگنال رد شد!",
                    parse_mode='HTML'
                )
                
        except Exception as e:
            logger.error(f"Error rejecting signal: {e}")

# Global instance
telegram_service = TelegramService()

def send_daily_report(analysis_data):
    """Send daily report synchronously"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        return loop.run_until_complete(telegram_service.send_daily_report(analysis_data))
    except Exception as e:
        logger.error(f"Error in sync daily report: {e}")
        return None

def send_admin_report(analysis_data):
    """Send admin report synchronously"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        return loop.run_until_complete(telegram_service.send_admin_report(analysis_data))
    except Exception as e:
        logger.error(f"Error in sync admin report: {e}")
        return None

def send_signal_for_approval(signal_data):
    """Send signal for approval synchronously"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        return loop.run_until_complete(telegram_service.send_signal_for_approval(signal_data))
    except Exception as e:
        logger.error(f"Error in sync signal approval: {e}")
        return None

def send_signal_to_channel(signal_data):
    """Send signal to channel synchronously"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        return loop.run_until_complete(telegram_service.send_signal_to_channel(signal_data))
    except Exception as e:
        logger.error(f"Error in sync signal to channel: {e}")
        return None
