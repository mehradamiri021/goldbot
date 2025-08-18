"""
Weekly Report Service - سرویس گزارش‌گیری هفتگی
گزارش‌های یکشنبه با تحلیل چند تایم‌فریم + خبرهای طلا

Sunday reports with multi-timeframe analysis + gold news from Forex Factory and FXStreet
"""

import pandas as pd
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import pytz
from services.news_service_enhanced import EnhancedNewsService
from services.analysis_service import TechnicalAnalyzer
from services.data_service import get_multiple_timeframes
from services.telegram_service import TelegramService
from services.ta_shim import TA
from models import Analysis, SystemLog
from app import db

logger = logging.getLogger(__name__)

class WeeklyReportService:
    """سرویس گزارش‌گیری هفتگی - یکشنبه‌ها ساعت 12:12"""
    
    def __init__(self):
        self.news_service = EnhancedNewsService()
        self.technical_analyzer = TechnicalAnalyzer()
        self.telegram_service = TelegramService()
        self.tehran_tz = pytz.timezone('Asia/Tehran')
        
        # تنظیمات گزارش
        self.report_timeframes = ['W1', 'D1', 'H4']  # تایم‌فریم‌های گزارش
        self.rsi_period = 14
        
    async def generate_weekly_report(self, target_date: datetime = None) -> Dict:
        """تولید گزارش هفتگی کامل"""
        
        if target_date is None:
            target_date = datetime.now(self.tehran_tz)
        
        # محاسبه شروع هفته (یکشنبه قبل)
        days_since_sunday = target_date.weekday() + 1 if target_date.weekday() != 6 else 0
        week_start = target_date - timedelta(days=days_since_sunday)
        
        logger.info(f"📊 شروع تولید گزارش هفتگی برای هفته {week_start.strftime('%Y-%m-%d')}")
        
        try:
            # 1. تحلیل خبری هفته
            news_analysis = self.news_service.get_weekly_news_summary(week_start)
            
            # 2. تحلیل تکنیکال چند تایم‌فریم
            technical_analysis = await self._generate_multi_timeframe_analysis()
            
            # 3. ترکیب و فرمت‌سازی گزارش
            weekly_report = self._compile_weekly_report(
                news_analysis, technical_analysis, week_start, target_date
            )
            
            # 4. ذخیره در دیتابیس
            await self._save_weekly_analysis(weekly_report)
            
            # 5. ارسال به کانال
            await self._send_weekly_report_to_channel(weekly_report)
            
            # لاگ موفقیت
            self._log_weekly_activity('WEEKLY_REPORT_GENERATED', 
                                    f'گزارش هفتگی برای {week_start.strftime("%Y-%m-%d")} تولید شد')
            
            return weekly_report
            
        except Exception as e:
            error_msg = f"خطا در تولید گزارش هفتگی: {str(e)}"
            logger.error(error_msg)
            self._log_weekly_activity('WEEKLY_REPORT_ERROR', error_msg, 'ERROR')
            
            return {
                'error': error_msg,
                'timestamp': datetime.now(self.tehran_tz)
            }
    
    async def _generate_multi_timeframe_analysis(self) -> Dict:
        """تحلیل تکنیکال چند تایم‌فریم"""
        
        analysis_results = {}
        
        for timeframe in self.report_timeframes:
            try:
                # دریافت داده
                tf_data = await self._get_timeframe_data(timeframe)
                if tf_data is None or len(tf_data) < 50:
                    continue
                
                # تحلیل RSI + Price Action + SMC
                tf_analysis = await self._analyze_timeframe(tf_data, timeframe)
                analysis_results[timeframe] = tf_analysis
                
                logger.info(f"✅ تحلیل {timeframe} تکمیل شد")
                
            except Exception as e:
                logger.error(f"خطا در تحلیل {timeframe}: {e}")
                analysis_results[timeframe] = {
                    'error': str(e),
                    'status': 'FAILED'
                }
        
        return analysis_results
    
    async def _get_timeframe_data(self, timeframe: str) -> Optional[pd.DataFrame]:
        """دریافت داده برای تایم‌فریم"""
        try:
            # تعیین محدوده داده مناسب
            if timeframe == 'W1':
                limit = 20  # 20 هفته
            elif timeframe == 'D1':
                limit = 60  # 60 روز
            else:  # H4
                limit = 200  # 200 کندل
            
            # دریافت داده (از CSV یا API)
            data_dict = get_multiple_timeframes([timeframe], limit=limit)
            
            if timeframe in data_dict and data_dict[timeframe] is not None:
                return data_dict[timeframe]
            
            return None
            
        except Exception as e:
            logger.error(f"خطا در دریافت داده {timeframe}: {e}")
            return None
    
    async def _analyze_timeframe(self, df: pd.DataFrame, timeframe: str) -> Dict:
        """تحلیل کامل یک تایم‌فریم"""
        
        try:
            current_price = df.iloc[-1]['close']
            
            # 1. تحلیل RSI
            rsi_analysis = self._analyze_rsi_conditions(df)
            
            # 2. تحلیل Price Action
            price_action_analysis = self._analyze_price_action_patterns(df)
            
            # 3. تحلیل Smart Money Concepts
            smc_analysis = self._analyze_smc_structure(df)
            
            # 4. تحلیل روند کلی
            trend_analysis = self._analyze_trend_direction(df)
            
            # 5. سطوح حمایت و مقاومت
            support_resistance = self._find_key_levels(df)
            
            return {
                'timeframe': timeframe,
                'current_price': current_price,
                'rsi_analysis': rsi_analysis,
                'price_action': price_action_analysis,
                'smc_analysis': smc_analysis,
                'trend_analysis': trend_analysis,
                'support_resistance': support_resistance,
                'overall_bias': self._determine_timeframe_bias(
                    rsi_analysis, price_action_analysis, smc_analysis, trend_analysis
                ),
                'analysis_time': datetime.now(self.tehran_tz)
            }
            
        except Exception as e:
            logger.error(f"خطا در تحلیل {timeframe}: {e}")
            return {
                'error': str(e),
                'timeframe': timeframe,
                'status': 'FAILED'
            }
    
    def _analyze_rsi_conditions(self, df: pd.DataFrame) -> Dict:
        """تحلیل شرایط RSI فقط"""
        try:
            close_series = pd.Series(df['close'].values)
            rsi_values = TA.rsi(close_series, self.rsi_period).values
            
            if len(rsi_values) == 0:
                return {'error': 'محاسبه RSI ناموفق'}
            
            current_rsi = rsi_values[-1]
            prev_rsi = rsi_values[-2] if len(rsi_values) >= 2 else current_rsi
            
            # تشخیص وضعیت
            rsi_status = 'Neutral'
            if current_rsi >= 70:
                rsi_status = 'Overbought'
            elif current_rsi <= 30:
                rsi_status = 'Oversold'
            elif current_rsi > 50:
                rsi_status = 'Bullish Zone'
            else:
                rsi_status = 'Bearish Zone'
            
            # تشخیص روند RSI
            rsi_trend = 'Neutral'
            if current_rsi > prev_rsi + 2:
                rsi_trend = 'Rising'
            elif current_rsi < prev_rsi - 2:
                rsi_trend = 'Falling'
            
            return {
                'current_rsi': round(current_rsi, 2),
                'rsi_status': rsi_status,
                'rsi_trend': rsi_trend,
                'strength': self._calculate_rsi_strength(current_rsi, rsi_status),
                'description': f"RSI در {current_rsi:.1f} ({rsi_status}) - روند {rsi_trend}"
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def _analyze_price_action_patterns(self, df: pd.DataFrame) -> Dict:
        """تحلیل ساده الگوهای Price Action"""
        try:
            # بررسی 10 کندل اخیر برای الگوهای کلیدی
            recent_candles = df.tail(10)
            
            patterns_found = []
            
            # بررسی الگوهای ساده
            for i in range(2, len(recent_candles)):
                current = recent_candles.iloc[i]
                prev = recent_candles.iloc[i-1]
                
                # Doji detection
                body_size = abs(current['close'] - current['open'])
                total_range = current['high'] - current['low']
                
                if total_range > 0 and body_size / total_range < 0.1:
                    patterns_found.append({
                        'pattern': 'Doji',
                        'strength': 0.6,
                        'description': 'کندل دوجی - تردید بازار'
                    })
                
                # Strong directional candle
                elif body_size / total_range > 0.7:
                    direction = 'Bullish' if current['close'] > current['open'] else 'Bearish'
                    patterns_found.append({
                        'pattern': f'Strong {direction} Candle',
                        'strength': 0.7,
                        'description': f'کندل {direction} قوی'
                    })
            
            return {
                'patterns_count': len(patterns_found),
                'patterns': patterns_found[:3],  # 3 الگوی اخیر
                'dominant_pattern': patterns_found[0] if patterns_found else None,
                'overall_strength': sum(p['strength'] for p in patterns_found) / len(patterns_found) if patterns_found else 0.5
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def _analyze_smc_structure(self, df: pd.DataFrame) -> Dict:
        """تحلیل ساده Smart Money Concepts"""
        try:
            # بررسی ساختار Higher High/Lower Low
            recent_data = df.tail(20)
            
            highs = []
            lows = []
            
            for i in range(1, len(recent_data) - 1):
                current = recent_data.iloc[i]
                prev_high = recent_data.iloc[i-1]['high']
                next_high = recent_data.iloc[i+1]['high']
                prev_low = recent_data.iloc[i-1]['low']
                next_low = recent_data.iloc[i+1]['low']
                
                # Local highs
                if current['high'] > prev_high and current['high'] > next_high:
                    highs.append(current['high'])
                
                # Local lows
                if current['low'] < prev_low and current['low'] < next_low:
                    lows.append(current['low'])
            
            # تشخیص ساختار کلی
            structure_type = 'Ranging'
            if len(highs) >= 2 and len(lows) >= 2:
                if highs[-1] > highs[-2] and lows[-1] > lows[-2]:
                    structure_type = 'Uptrend (HH & HL)'
                elif highs[-1] < highs[-2] and lows[-1] < lows[-2]:
                    structure_type = 'Downtrend (LL & LH)'
            
            return {
                'structure_type': structure_type,
                'recent_highs': len(highs),
                'recent_lows': len(lows),
                'last_high': highs[-1] if highs else None,
                'last_low': lows[-1] if lows else None,
                'description': f"ساختار {structure_type} با {len(highs)} قله و {len(lows)} دره"
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def _analyze_trend_direction(self, df: pd.DataFrame) -> Dict:
        """تحلیل جهت روند"""
        try:
            close_prices = df['close']
            
            # Simple Moving Averages
            sma20 = close_prices.rolling(20).mean()
            sma50 = close_prices.rolling(50).mean()
            
            current_price = close_prices.iloc[-1]
            current_sma20 = sma20.iloc[-1]
            current_sma50 = sma50.iloc[-1]
            
            # تشخیص روند
            trend_direction = 'Sideways'
            trend_strength = 0.5
            
            if current_price > current_sma20 > current_sma50:
                trend_direction = 'Strong Uptrend'
                trend_strength = 0.8
            elif current_price > current_sma20:
                trend_direction = 'Uptrend'
                trend_strength = 0.6
            elif current_price < current_sma20 < current_sma50:
                trend_direction = 'Strong Downtrend'
                trend_strength = 0.8
            elif current_price < current_sma20:
                trend_direction = 'Downtrend'
                trend_strength = 0.6
            
            return {
                'direction': trend_direction,
                'strength': trend_strength,
                'current_price': current_price,
                'sma20': current_sma20,
                'sma50': current_sma50,
                'description': f"روند {trend_direction} با قدرت {trend_strength:.1%}"
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def _find_key_levels(self, df: pd.DataFrame) -> Dict:
        """پیدا کردن سطوح کلیدی"""
        try:
            # سطوح حمایت و مقاومت ساده
            recent_data = df.tail(50)
            
            # قله‌ها و دره‌های محلی
            resistance_levels = []
            support_levels = []
            
            for i in range(5, len(recent_data) - 5):
                current = recent_data.iloc[i]
                
                # بررسی مقاومت (قله محلی)
                is_resistance = True
                for j in range(i-5, i+6):
                    if j != i and recent_data.iloc[j]['high'] > current['high']:
                        is_resistance = False
                        break
                
                if is_resistance:
                    resistance_levels.append(current['high'])
                
                # بررسی حمایت (دره محلی)
                is_support = True
                for j in range(i-5, i+6):
                    if j != i and recent_data.iloc[j]['low'] < current['low']:
                        is_support = False
                        break
                
                if is_support:
                    support_levels.append(current['low'])
            
            # مرتب‌سازی و انتخاب مهم‌ترین سطوح
            resistance_levels = sorted(set(resistance_levels), reverse=True)[:3]
            support_levels = sorted(set(support_levels), reverse=True)[:3]
            
            return {
                'resistance_levels': resistance_levels,
                'support_levels': support_levels,
                'nearest_resistance': resistance_levels[0] if resistance_levels else None,
                'nearest_support': support_levels[-1] if support_levels else None,
                'description': f"{len(resistance_levels)} مقاومت، {len(support_levels)} حمایت"
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def _determine_timeframe_bias(self, rsi: Dict, pa: Dict, smc: Dict, trend: Dict) -> Dict:
        """تعیین تعصب کلی تایم‌فریم"""
        
        bias_score = 0.0  # -1 (Bearish) تا +1 (Bullish)
        
        # امتیاز RSI
        rsi_status = rsi.get('rsi_status', 'Neutral')
        if 'Bullish' in rsi_status or rsi_status == 'Oversold':
            bias_score += 0.3
        elif 'Bearish' in rsi_status or rsi_status == 'Overbought':
            bias_score -= 0.3
        
        # امتیاز روند
        trend_dir = trend.get('direction', 'Sideways')
        if 'Uptrend' in trend_dir:
            bias_score += 0.4
        elif 'Downtrend' in trend_dir:
            bias_score -= 0.4
        
        # امتیاز SMC
        smc_structure = smc.get('structure_type', 'Ranging')
        if 'Uptrend' in smc_structure:
            bias_score += 0.3
        elif 'Downtrend' in smc_structure:
            bias_score -= 0.3
        
        # تعیین تعصب نهایی
        if bias_score >= 0.5:
            bias = 'Strong Bullish'
        elif bias_score >= 0.2:
            bias = 'Bullish'
        elif bias_score <= -0.5:
            bias = 'Strong Bearish'
        elif bias_score <= -0.2:
            bias = 'Bearish'
        else:
            bias = 'Neutral'
        
        return {
            'bias': bias,
            'score': bias_score,
            'confidence': abs(bias_score),
            'description': f"تعصب {bias} با اطمینان {abs(bias_score):.1%}"
        }
    
    def _calculate_rsi_strength(self, rsi_value: float, rsi_status: str) -> float:
        """محاسبه قدرت RSI"""
        if rsi_status in ['Overbought', 'Oversold']:
            return 0.8
        elif rsi_status in ['Bullish Zone', 'Bearish Zone']:
            return 0.6
        else:
            return 0.4
    
    def _compile_weekly_report(self, news_analysis: Dict, technical_analysis: Dict,
                              week_start: datetime, target_date: datetime) -> Dict:
        """ترکیب گزارش هفتگی نهایی"""
        
        persian_week_range = f"{week_start.strftime('%Y/%m/%d')} تا {target_date.strftime('%Y/%m/%d')}"
        
        # خلاصه تکنیکال
        technical_summary = self._create_technical_summary(technical_analysis)
        
        # خلاصه خبری
        news_summary = news_analysis.get('important_news', [])[:5]  # 5 خبر مهم
        market_themes = news_analysis.get('market_themes', [])[:3]  # 3 موضوع برتر
        
        return {
            'report_type': 'WEEKLY_COMPREHENSIVE',
            'week_period': {
                'start_date': week_start.strftime('%Y-%m-%d'),
                'end_date': target_date.strftime('%Y-%m-%d'),
                'persian_range': persian_week_range
            },
            'technical_analysis': technical_analysis,
            'technical_summary': technical_summary,
            'news_analysis': news_analysis,
            'key_news': news_summary,
            'market_themes': market_themes,
            'overall_assessment': self._create_overall_assessment(technical_summary, news_analysis),
            'generated_at': datetime.now(self.tehran_tz),
            'report_id': f"WR_{int(datetime.now().timestamp())}"
        }
    
    def _create_technical_summary(self, technical_analysis: Dict) -> Dict:
        """خلاصه تحلیل تکنیکال"""
        
        timeframe_biases = {}
        overall_consensus = {'bullish': 0, 'bearish': 0, 'neutral': 0}
        
        for tf, analysis in technical_analysis.items():
            if analysis.get('error'):
                continue
                
            bias = analysis.get('overall_bias', {})
            bias_type = bias.get('bias', 'Neutral')
            
            timeframe_biases[tf] = bias_type
            
            if 'Bullish' in bias_type:
                overall_consensus['bullish'] += 1
            elif 'Bearish' in bias_type:
                overall_consensus['bearish'] += 1
            else:
                overall_consensus['neutral'] += 1
        
        # تشخیص اجماع کلی
        total_votes = sum(overall_consensus.values())
        if total_votes == 0:
            market_consensus = 'نامشخص'
        elif overall_consensus['bullish'] > overall_consensus['bearish']:
            market_consensus = 'صعودی'
        elif overall_consensus['bearish'] > overall_consensus['bullish']:
            market_consensus = 'نزولی'
        else:
            market_consensus = 'خنثی'
        
        return {
            'timeframe_biases': timeframe_biases,
            'overall_consensus': overall_consensus,
            'market_consensus': market_consensus,
            'consensus_strength': max(overall_consensus.values()) / total_votes if total_votes > 0 else 0,
            'summary_text': self._generate_technical_summary_text(timeframe_biases, market_consensus)
        }
    
    def _generate_technical_summary_text(self, tf_biases: Dict, consensus: str) -> str:
        """تولید متن خلاصه تکنیکال"""
        
        summary = f"تحلیل چند تایم‌فریم نشان‌دهنده روند کلی {consensus} است. "
        
        if tf_biases:
            for tf, bias in tf_biases.items():
                tf_name = {'W1': 'هفتگی', 'D1': 'روزانه', 'H4': '4ساعته'}.get(tf, tf)
                summary += f"تایم‌فریم {tf_name}: {bias}. "
        
        return summary.strip()
    
    def _create_overall_assessment(self, technical_summary: Dict, news_analysis: Dict) -> Dict:
        """ارزیابی کلی هفته"""
        
        # امتیاز تکنیکال
        tech_consensus = technical_summary.get('market_consensus', 'نامشخص')
        tech_strength = technical_summary.get('consensus_strength', 0)
        
        # امتیاز خبری
        important_news_count = len(news_analysis.get('important_news', []))
        themes_count = len(news_analysis.get('market_themes', []))
        
        news_impact = 'متوسط'
        if important_news_count >= 5:
            news_impact = 'بالا'
        elif important_news_count <= 2:
            news_impact = 'کم'
        
        return {
            'technical_outlook': tech_consensus,
            'technical_strength': f"{tech_strength:.1%}",
            'news_impact': news_impact,
            'key_factors': self._identify_key_factors(technical_summary, news_analysis),
            'week_rating': self._calculate_week_rating(tech_strength, important_news_count),
            'outlook_description': self._generate_outlook_description(tech_consensus, news_impact)
        }
    
    def _identify_key_factors(self, tech_summary: Dict, news_analysis: Dict) -> List[str]:
        """شناسایی عوامل کلیدی هفته"""
        
        factors = []
        
        # عوامل تکنیکال
        consensus = tech_summary.get('market_consensus', '')
        if consensus != 'نامشخص':
            factors.append(f"روند تکنیکال {consensus}")
        
        # عوامل خبری
        themes = news_analysis.get('market_themes', [])
        for theme in themes[:2]:  # 2 موضوع برتر
            factors.append(f"تأثیر {theme.get('theme', 'نامشخص')}")
        
        return factors[:4]  # حداکثر 4 عامل
    
    def _calculate_week_rating(self, tech_strength: float, news_count: int) -> str:
        """محاسبه امتیاز هفته"""
        
        score = (tech_strength * 50) + (min(news_count, 10) * 5)
        
        if score >= 70:
            return 'عالی'
        elif score >= 50:
            return 'خوب'
        elif score >= 30:
            return 'متوسط'
        else:
            return 'ضعیف'
    
    def _generate_outlook_description(self, tech_consensus: str, news_impact: str) -> str:
        """تولید توضیح چشم‌انداز"""
        
        return f"بر اساس تحلیل تکنیکال {tech_consensus} و تأثیر خبری {news_impact}، " \
               f"انتظار می‌رود بازار در هفته آینده تحت تأثیر این عوامل قرار گیرد."
    
    async def _save_weekly_analysis(self, report_data: Dict):
        """ذخیره گزارش در دیتابیس"""
        
        try:
            analysis = Analysis(
                timeframe='WEEKLY',
                analysis_type='COMPREHENSIVE_WEEKLY',
                symbol='XAUUSD',
                result=str(report_data),  # JSON string
                confidence=report_data.get('overall_assessment', {}).get('technical_strength', '50%'),
                created_at=datetime.utcnow()
            )
            
            db.session.add(analysis)
            db.session.commit()
            
            logger.info(f"✅ گزارش هفتگی در دیتابیس ذخیره شد: {analysis.id}")
            
        except Exception as e:
            logger.error(f"خطا در ذخیره گزارش هفتگی: {e}")
    
    async def _send_weekly_report_to_channel(self, report_data: Dict):
        """ارسال گزارش به کانال"""
        
        try:
            # فرمت گزارش برای کانال
            report_message = self._format_weekly_report_for_channel(report_data)
            
            # ارسال به کانال
            await self.telegram_service.send_message(
                chat_id=self.telegram_service.channel_id,
                text=report_message
            )
            
            logger.info("✅ گزارش هفتگی به کانال ارسال شد")
            
        except Exception as e:
            logger.error(f"خطا در ارسال گزارش هفتگی: {e}")
    
    def _format_weekly_report_for_channel(self, report_data: Dict) -> str:
        """فرمت گزارش هفتگی برای کانال"""
        
        period = report_data.get('week_period', {})
        tech_summary = report_data.get('technical_summary', {})
        key_news = report_data.get('key_news', [])
        overall_assessment = report_data.get('overall_assessment', {})
        
        # شروع گزارش
        message = "📊 **گزارش جامع هفتگی طلا**\n\n"
        message += f"📅 **دوره:** {period.get('persian_range', 'نامشخص')}\n\n"
        
        # تحلیل تکنیکال
        consensus = tech_summary.get('market_consensus', 'نامشخص')
        consensus_strength = tech_summary.get('consensus_strength', 0)
        
        message += "📈 **تحلیل تکنیکال چند تایم‌فریم:**\n"
        message += f"• روند کلی: **{consensus}**\n"
        message += f"• قدرت اجماع: {consensus_strength:.1%}\n"
        
        # تایم‌فریم‌ها
        tf_biases = tech_summary.get('timeframe_biases', {})
        if tf_biases:
            message += "\n🔍 **تایم‌فریم‌ها:**\n"
            for tf, bias in tf_biases.items():
                tf_name = {'W1': 'هفتگی', 'D1': 'روزانه', 'H4': '4ساعته'}.get(tf, tf)
                message += f"• {tf_name}: {bias}\n"
        
        # اخبار مهم
        if key_news:
            message += "\n📰 **مهم‌ترین اخبار هفته:**\n\n"
            for i, news in enumerate(key_news[:3], 1):
                message += f"{i}. **{news.get('title', 'بدون عنوان')}**\n"
                message += f"   📍 {news.get('source', 'نامشخص')} | {news.get('impact', 'متوسط')}\n\n"
        
        # ارزیابی کلی
        outlook = overall_assessment.get('technical_outlook', 'نامشخص')
        week_rating = overall_assessment.get('week_rating', 'متوسط')
        
        message += f"🎯 **ارزیابی کلی:**\n"
        message += f"• چشم‌انداز: {outlook}\n"
        message += f"• امتیاز هفته: {week_rating}\n"
        
        # عوامل کلیدی
        key_factors = overall_assessment.get('key_factors', [])
        if key_factors:
            message += f"\n🔑 **عوامل کلیدی:**\n"
            for factor in key_factors:
                message += f"• {factor}\n"
        
        # پایان
        message += f"\n📊 گزارش تولید شده در: {datetime.now(self.tehran_tz).strftime('%Y/%m/%d %H:%M')}"
        message += f"\n🤖 سیستم تحلیل هوشمند طلا"
        
        return message
    
    def _log_weekly_activity(self, activity_type: str, message: str, level: str = 'INFO'):
        """ثبت لاگ فعالیت هفتگی"""
        
        try:
            logger.info(f"[WEEKLY_SERVICE] {message}")
            
            system_log = SystemLog(
                log_type=activity_type,
                message=message,
                level=level,
                timestamp=datetime.utcnow(),
                source='WEEKLY_REPORT_SERVICE'
            )
            db.session.add(system_log)
            db.session.commit()
            
        except Exception as e:
            logger.error(f"خطا در ثبت لاگ هفتگی: {e}")
    
    async def test_weekly_report(self) -> Dict:
        """تست تولید گزارش هفتگی"""
        
        logger.info("🧪 شروع تست گزارش هفتگی")
        
        try:
            test_report = await self.generate_weekly_report()
            
            if test_report.get('error'):
                return {
                    'test_status': 'FAILED',
                    'error': test_report['error']
                }
            
            return {
                'test_status': 'SUCCESS',
                'report_id': test_report.get('report_id', 'N/A'),
                'generated_at': test_report.get('generated_at'),
                'technical_consensus': test_report.get('technical_summary', {}).get('market_consensus', 'N/A'),
                'news_count': len(test_report.get('key_news', [])),
                'week_rating': test_report.get('overall_assessment', {}).get('week_rating', 'N/A')
            }
            
        except Exception as e:
            error_msg = f"خطا در تست گزارش هفتگی: {str(e)}"
            logger.error(error_msg)
            return {
                'test_status': 'FAILED',
                'error': error_msg
            }


# سرویس گلوبال
weekly_report_service = WeeklyReportService()