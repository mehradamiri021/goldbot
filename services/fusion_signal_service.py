"""
Primary Fusion Signal Service - سرویس اصلی سیگنال‌دهی ترکیبی
اولویت اول: MT5 + Price Action + SMC + RSI با لاگ اجباری

This is the main service that integrates all components for the PRIMARY system
"""

import pandas as pd
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from services.price_action_analyzer import PriceActionAnalyzer
from services.smc_analyzer import SmartMoneyAnalyzer
from services.signal_fusion_service import SignalFusionService
from services.data_service import get_gold_data
from services.telegram_service import TelegramService
from models import Signal
from models import SystemLog
from app import db
import asyncio
import threading

logger = logging.getLogger(__name__)

class FusionSignalService:
    """سرویس اصلی سیگنال‌دهی ترکیبی - اولویت اول سیستم"""
    
    def __init__(self):
        self.price_action = PriceActionAnalyzer()
        self.smc_analyzer = SmartMoneyAnalyzer()
        self.signal_fusion = SignalFusionService()
        self.telegram_service = TelegramService()
        self.timeframes = ['M15', 'H1', 'H4']  # تایم‌فریم‌های اصلی
        self.min_confidence_for_approval = 65  # حداقل اعتماد برای ارسال به ادمین
        
        # تنظیمات لاگ اجباری
        self.mandatory_logging = True
        self.admin_notification_required = True
        
    async def run_primary_analysis(self) -> Dict:
        """اجرای تحلیل اصلی - اولویت اول سیستم"""
        
        analysis_start_time = datetime.now()
        self._log_system_activity('PRIMARY_ANALYSIS_START', 'شروع تحلیل اصلی سیستم سیگنال‌دهی')
        
        try:
            logger.info("🎯 شروع تحلیل اصلی سیستم سیگنال‌دهی (PRIMARY)")
            
            # تحلیل چند تایم‌فریم
            multi_timeframe_results = {}
            high_probability_signals = []
            
            for timeframe in self.timeframes:
                try:
                    # دریافت داده
                    df = await self._get_timeframe_data(timeframe)
                    if df is None or len(df) < 50:
                        continue
                    
                    # تحلیل ترکیبی
                    timeframe_analysis = self.signal_fusion.generate_fusion_signals(df, timeframe)
                    multi_timeframe_results[timeframe] = timeframe_analysis
                    
                    # جمع‌آوری سیگنال‌های قوی
                    final_signals = timeframe_analysis.get('final_signals', [])
                    strong_signals = [s for s in final_signals if s.get('confidence', 0) >= self.min_confidence_for_approval]
                    
                    for signal in strong_signals:
                        signal['source_timeframe'] = timeframe
                        high_probability_signals.append(signal)
                    
                    self._log_timeframe_analysis(timeframe, timeframe_analysis)
                    
                except Exception as tf_error:
                    logger.error(f"خطا در تحلیل {timeframe}: {tf_error}")
                    self._log_system_activity('TIMEFRAME_ERROR', f'خطا در تحلیل {timeframe}: {str(tf_error)}')
            
            # پردازش و رتبه‌بندی سیگنال‌های نهایی
            final_analysis = self._process_final_signals(high_probability_signals, multi_timeframe_results)
            
            # ارسال سیگنال‌های قوی برای تایید ادمین
            await self._submit_signals_for_admin_approval(final_analysis.get('top_signals', []))
            
            # گزارش نهایی به ادمین
            await self._send_analysis_report_to_admin(final_analysis, analysis_start_time)
            
            self._log_system_activity('PRIMARY_ANALYSIS_COMPLETE', 
                                    f'تحلیل اصلی تکمیل شد. {len(final_analysis.get("top_signals", []))} سیگنال تولید شد')
            
            return final_analysis
            
        except Exception as e:
            error_msg = f"خطای جدی در تحلیل اصلی: {str(e)}"
            logger.error(error_msg)
            self._log_system_activity('PRIMARY_ANALYSIS_CRITICAL_ERROR', error_msg)
            
            # اطلاع‌رسانی فوری به ادمین در صورت خطای جدی
            await self._notify_admin_critical_error(error_msg)
            
            return {
                'error': error_msg,
                'timestamp': datetime.now(),
                'status': 'FAILED'
            }
    
    async def _get_timeframe_data(self, timeframe: str) -> Optional[pd.DataFrame]:
        """دریافت داده برای تایم‌فریم مشخص"""
        try:
            # دریافت از MT5 CSV یا API
            data = get_gold_data(timeframe=timeframe, limit=200)
            
            if data is not None and len(data) > 0:
                logger.info(f"✅ دریافت {len(data)} کندل برای {timeframe}")
                return data
            else:
                logger.warning(f"❌ داده برای {timeframe} دریافت نشد")
                return None
                
        except Exception as e:
            logger.error(f"خطا در دریافت داده {timeframe}: {e}")
            return None
    
    def _process_final_signals(self, signals: List[Dict], multi_tf_results: Dict) -> Dict:
        """پردازش و رتبه‌بندی سیگنال‌های نهایی"""
        
        if not signals:
            return {
                'top_signals': [],
                'analysis_summary': 'هیچ سیگنال قوی شناسایی نشد',
                'multi_timeframe_results': multi_tf_results,
                'total_signals_found': 0
            }
        
        # حذف تکراری و رتبه‌بندی
        unique_signals = self._remove_duplicate_signals(signals)
        sorted_signals = sorted(unique_signals, key=lambda x: x.get('confidence', 0), reverse=True)
        
        # انتخاب بهترین سیگنال‌ها (حداکثر 3)
        top_signals = sorted_signals[:3]
        
        # محاسبه آمار
        avg_confidence = sum(s.get('confidence', 0) for s in top_signals) / len(top_signals) if top_signals else 0
        
        # تحلیل همپوشانی تایم‌فریم‌ها
        timeframe_consensus = self._analyze_timeframe_consensus(multi_tf_results)
        
        return {
            'top_signals': top_signals,
            'total_signals_found': len(signals),
            'unique_signals': len(unique_signals),
            'average_confidence': avg_confidence,
            'timeframe_consensus': timeframe_consensus,
            'analysis_summary': self._generate_analysis_summary(top_signals, timeframe_consensus),
            'multi_timeframe_results': multi_tf_results,
            'timestamp': datetime.now()
        }
    
    async def _submit_signals_for_admin_approval(self, signals: List[Dict]):
        """ارسال سیگنال‌ها برای تایید ادمین"""
        
        for signal_data in signals:
            try:
                # ایجاد رکورد سیگنال در دیتابیس
                signal = Signal()
                signal.signal_id = signal_data.get('signal_id', f"FUSION_{int(datetime.now().timestamp())}")
                signal.signal_type = signal_data.get('signal_type', 'HOLD')
                signal.symbol = signal_data.get('symbol', 'XAUUSD')
                signal.timeframe = signal_data.get('timeframe', 'H4')
                signal.entry_price = signal_data.get('entry_price', 0.0)
                signal.stop_loss = signal_data.get('stop_loss', 0.0)
                signal.take_profit = signal_data.get('take_profit_1', 0.0)
                signal.confidence = signal_data.get('confidence', 0.0)
                signal.risk_reward_ratio = signal_data.get('risk_reward_ratio', 1.0)
                signal.source = signal_data.get('source', 'FUSION_SYSTEM')
                signal.status = 'PENDING_APPROVAL'
                signal.created_at = datetime.utcnow()
                signal.admin_approved = False
                
                # افزودن اطلاعات تکمیلی در result field
                additional_data = {}
                
                if 'pattern_type' in signal_data:
                    additional_data['pattern_type'] = signal_data['pattern_type']
                
                if 'smc_components' in signal_data:
                    additional_data['smc_components'] = str(signal_data['smc_components'])
                
                if 'description' in signal_data:
                    additional_data['description'] = signal_data['description']
                
                if 'analysis_summary' in signal_data:
                    additional_data['analysis_notes'] = signal_data['analysis_summary']
                
                if additional_data:
                    signal.result = str(additional_data)
                
                db.session.add(signal)
                db.session.commit()
                
                # لاگ اجباری
                self._log_system_activity('SIGNAL_SUBMITTED', 
                                        f'سیگنال {signal.signal_id} برای تایید ادمین ارسال شد')
                
                # ارسال اطلاع به ادمین
                await self._notify_admin_new_signal(signal)
                
            except Exception as e:
                logger.error(f"خطا در ثبت سیگنال: {e}")
                self._log_system_activity('SIGNAL_SUBMISSION_ERROR', f'خطا در ثبت سیگنال: {str(e)}')
    
    async def _send_analysis_report_to_admin(self, analysis_result: Dict, start_time: datetime):
        """ارسال گزارش تحلیل به ادمین"""
        
        try:
            duration = (datetime.now() - start_time).total_seconds()
            
            report = "🎯 **گزارش تحلیل اصلی سیستم**\n\n"
            report += f"⏱️ **مدت تحلیل:** {duration:.1f} ثانیه\n"
            report += f"🔍 **تایم‌فریم‌ها:** {', '.join(self.timeframes)}\n\n"
            
            # آمار سیگنال‌ها
            top_signals = analysis_result.get('top_signals', [])
            report += f"📊 **نتایج:**\n"
            report += f"• سیگنال‌های یافت شده: {analysis_result.get('total_signals_found', 0)}\n"
            report += f"• سیگنال‌های نهایی: {len(top_signals)}\n"
            report += f"• میانگین اعتماد: {analysis_result.get('average_confidence', 0):.1f}%\n\n"
            
            # سیگنال‌های برتر
            if top_signals:
                report += "🏆 **سیگنال‌های برتر:**\n\n"
                for i, signal in enumerate(top_signals, 1):
                    report += f"{i}. **{signal.get('signal_type', 'N/A')}** - اعتماد: {signal.get('confidence', 0):.0f}%\n"
                    report += f"   ورود: {signal.get('entry_price', 0):.2f} | "
                    report += f"R/R: {signal.get('risk_reward_ratio', 0):.1f}\n"
                    report += f"   الگو: {signal.get('pattern_type', 'نامشخص')}\n\n"
            
            # خلاصه تایم‌فریم‌ها
            consensus = analysis_result.get('timeframe_consensus', {})
            if consensus:
                report += "📈 **اجماع تایم‌فریم‌ها:**\n"
                report += f"• جهت غالب: {consensus.get('dominant_direction', 'نامشخص')}\n"
                report += f"• قدرت اجماع: {consensus.get('consensus_strength', 0):.1%}\n\n"
            
            report += "🔗 برای بررسی و تایید سیگنال‌ها به پنل ادمین مراجعه کنید."
            
            # ارسال به ادمین
            await self.telegram_service.send_message(
                chat_id=self.telegram_service.admin_id,
                text=report
            )
            
        except Exception as e:
            logger.error(f"خطا در ارسال گزارش به ادمین: {e}")
    
    async def _notify_admin_new_signal(self, signal: Signal):
        """اطلاع‌رسانی سیگنال جدید به ادمین"""
        
        try:
            message = f"🚨 **سیگنال جدید برای تایید**\n\n"
            message += f"📊 **{signal.signal_type}** {signal.symbol}\n"
            message += f"⏰ تایم‌فریم: {signal.timeframe}\n"
            message += f"🎯 ورود: {signal.entry_price:.2f}\n"
            message += f"🛡️ استاپ: {signal.stop_loss:.2f}\n"
            message += f"🏆 تارگت: {signal.take_profit:.2f}\n"
            message += f"🔥 اعتماد: {signal.confidence:.0f}%\n"
            message += f"📈 الگو: {signal.pattern_type or 'نامشخص'}\n\n"
            message += f"🆔 شناسه: {signal.signal_id}\n"
            message += f"🕐 زمان: {signal.created_at.strftime('%H:%M')}"
            
            await self.telegram_service.send_message(
                chat_id=self.telegram_service.admin_id,
                text=message
            )
            
        except Exception as e:
            logger.error(f"خطا در اطلاع‌رسانی سیگنال به ادمین: {e}")
    
    async def _notify_admin_critical_error(self, error_message: str):
        """اطلاع‌رسانی خطای بحرانی به ادمین"""
        
        try:
            critical_msg = f"🔴 **خطای بحرانی در سیستم اصلی**\n\n"
            critical_msg += f"⚠️ **خطا:** {error_message}\n"
            critical_msg += f"🕐 **زمان:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
            critical_msg += f"📍 **موقعیت:** سیستم سیگنال‌دهی اصلی\n\n"
            critical_msg += "🔧 لطفاً فوراً بررسی کنید!"
            
            await self.telegram_service.send_message(
                chat_id=self.telegram_service.admin_id,
                text=critical_msg
            )
            
        except Exception as e:
            logger.error(f"خطا در اطلاع‌رسانی بحرانی: {e}")
    
    def _remove_duplicate_signals(self, signals: List[Dict]) -> List[Dict]:
        """حذف سیگنال‌های تکراری"""
        
        unique_signals = []
        seen_prices = set()
        
        for signal in signals:
            entry_price = signal.get('entry_price', 0)
            signal_type = signal.get('signal_type', '')
            
            # کلید یکتا بر اساس قیمت و نوع
            key = f"{signal_type}_{entry_price:.0f}"
            
            if key not in seen_prices:
                seen_prices.add(key)
                unique_signals.append(signal)
            else:
                # در صورت تکراری بودن، سیگنال با اعتماد بالاتر را نگه دار
                for i, existing in enumerate(unique_signals):
                    if f"{existing.get('signal_type', '')}_{existing.get('entry_price', 0):.0f}" == key:
                        if signal.get('confidence', 0) > existing.get('confidence', 0):
                            unique_signals[i] = signal
                        break
        
        return unique_signals
    
    def _analyze_timeframe_consensus(self, multi_tf_results: Dict) -> Dict:
        """تحلیل اجماع تایم‌فریم‌ها"""
        
        if not multi_tf_results:
            return {'dominant_direction': 'نامشخص', 'consensus_strength': 0.0}
        
        # جمع‌آوری جهت‌های غالب
        directions = []
        strengths = []
        
        for tf, result in multi_tf_results.items():
            final_signals = result.get('final_signals', [])
            if final_signals:
                # قوی‌ترین سیگنال این تایم‌فریم
                strongest = max(final_signals, key=lambda x: x.get('confidence', 0))
                directions.append(strongest.get('signal_type', ''))
                strengths.append(strongest.get('confidence', 0) / 100.0)
        
        if not directions:
            return {'dominant_direction': 'نامشخص', 'consensus_strength': 0.0}
        
        # تشخیص جهت غالب
        buy_count = directions.count('BUY')
        sell_count = directions.count('SELL')
        
        if buy_count > sell_count:
            dominant = 'BUY'
            consensus_strength = buy_count / len(directions)
        elif sell_count > buy_count:
            dominant = 'SELL'  
            consensus_strength = sell_count / len(directions)
        else:
            dominant = 'MIXED'
            consensus_strength = 0.5
        
        # تعدیل قدرت بر اساس میانگین اعتماد
        avg_strength = sum(strengths) / len(strengths) if strengths else 0
        final_strength = consensus_strength * avg_strength
        
        return {
            'dominant_direction': dominant,
            'consensus_strength': final_strength,
            'timeframe_agreement': f"{int(consensus_strength * 100)}%",
            'average_confidence': avg_strength * 100
        }
    
    def _generate_analysis_summary(self, top_signals: List[Dict], consensus: Dict) -> str:
        """تولید خلاصه تحلیل"""
        
        if not top_signals:
            return "هیچ سیگنال قوی در این تحلیل شناسایی نشد"
        
        dominant_dir = consensus.get('dominant_direction', 'نامشخص')
        consensus_strength = consensus.get('consensus_strength', 0) * 100
        
        summary = f"تحلیل {len(top_signals)} سیگنال قوی شناسایی شد. "
        summary += f"جهت غالب بازار: {dominant_dir} با قدرت اجماع {consensus_strength:.0f}%. "
        
        if top_signals:
            best_signal = top_signals[0]
            summary += f"قوی‌ترین سیگنال: {best_signal.get('signal_type', 'N/A')} "
            summary += f"با اعتماد {best_signal.get('confidence', 0):.0f}%."
        
        return summary
    
    def _log_system_activity(self, activity_type: str, message: str, level: str = 'INFO'):
        """لاگ اجباری فعالیت‌های سیستم"""
        
        try:
            # لاگ در فایل
            logger.info(f"[{activity_type}] {message}")
            
            # لاگ در دیتابیس
            if self.mandatory_logging:
                system_log = SystemLog(
                    log_type=activity_type,
                    message=message,
                    level=level,
                    timestamp=datetime.utcnow(),
                    source='FUSION_SIGNAL_SERVICE'
                )
                db.session.add(system_log)
                db.session.commit()
                
        except Exception as e:
            logger.error(f"خطا در لاگ اجباری: {e}")
    
    def _log_timeframe_analysis(self, timeframe: str, analysis_result: Dict):
        """لاگ تحلیل تایم‌فریم"""
        
        final_signals = analysis_result.get('final_signals', [])
        confluence_signals = analysis_result.get('confluence_signals', [])
        
        message = f"تحلیل {timeframe}: {len(confluence_signals)} همپوشانی، {len(final_signals)} سیگنال نهایی"
        
        if final_signals:
            best_confidence = max(s.get('confidence', 0) for s in final_signals)
            message += f"، بهترین اعتماد: {best_confidence:.0f}%"
        
        self._log_system_activity('TIMEFRAME_ANALYSIS', message)
    
    def get_system_status(self) -> Dict:
        """دریافت وضعیت سیستم اصلی"""
        
        try:
            # آمار امروز
            today = datetime.now().date()
            today_start = datetime.combine(today, datetime.min.time())
            
            today_signals = Signal.query.filter(Signal.created_at >= today_start).count()
            pending_signals = Signal.query.filter_by(status='PENDING_APPROVAL').count()
            approved_today = Signal.query.filter(
                Signal.created_at >= today_start,
                Signal.admin_approved == True
            ).count()
            
            # آمار کامپوننت‌ها
            last_analysis = SystemLog.query.filter_by(
                log_type='PRIMARY_ANALYSIS_COMPLETE'
            ).order_by(SystemLog.timestamp.desc()).first()
            
            system_health = self._calculate_primary_system_health(
                today_signals, pending_signals, last_analysis
            )
            
            return {
                'status': 'ACTIVE' if system_health['score'] >= 70 else 'WARNING',
                'health_score': system_health['score'],
                'health_status': system_health['status'],
                'today_signals': today_signals,
                'pending_approval': pending_signals,
                'approved_today': approved_today,
                'last_analysis': last_analysis.timestamp if last_analysis else None,
                'components_status': {
                    'price_action_analyzer': 'ACTIVE',
                    'smc_analyzer': 'ACTIVE',
                    'signal_fusion': 'ACTIVE',
                    'mandatory_logging': 'ACTIVE' if self.mandatory_logging else 'INACTIVE',
                    'admin_notifications': 'ACTIVE' if self.admin_notification_required else 'INACTIVE'
                },
                'last_updated': datetime.now()
            }
            
        except Exception as e:
            logger.error(f"خطا در دریافت وضعیت سیستم: {e}")
            return {
                'status': 'ERROR',
                'error': str(e),
                'last_updated': datetime.now()
            }
    
    def _calculate_primary_system_health(self, today_signals: int, pending_signals: int, last_analysis) -> Dict:
        """محاسبه سلامت سیستم اصلی"""
        
        health_score = 100
        issues = []
        
        # بررسی تولید سیگنال
        if today_signals == 0:
            health_score -= 40
            issues.append("هیچ سیگنالی امروز تولید نشده")
        elif today_signals < 2:
            health_score -= 20
            issues.append("تولید سیگنال کم")
        
        # بررسی سیگنال‌های در انتظار
        if pending_signals > 5:
            health_score -= 20
            issues.append(f"{pending_signals} سیگنال در انتظار تایید")
        elif pending_signals > 10:
            health_score -= 30
            issues.append("انباشتگی سیگنال‌های در انتظار")
        
        # بررسی آخرین تحلیل
        if last_analysis:
            time_since_last = datetime.utcnow() - last_analysis.timestamp
            if time_since_last > timedelta(hours=2):
                health_score -= 25
                issues.append("عدم تحلیل به موقع")
        else:
            health_score -= 50
            issues.append("هیچ تحلیلی ثبت نشده")
        
        # تعیین وضعیت
        if health_score >= 80:
            status = "عالی"
        elif health_score >= 60:
            status = "خوب"
        elif health_score >= 40:
            status = "متوسط"
        else:
            status = "نیاز به توجه فوری"
        
        return {
            'score': max(0, health_score),
            'status': status,
            'issues': issues
        }


# سرویس گلوبال
fusion_signal_service = FusionSignalService()