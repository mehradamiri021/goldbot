"""
Price Action Pattern Recognition for Gold Trading
پشناسایی الگوهای Price Action برای معامله طلا

Focus: Pin Bar, Engulfing, Doji, Inside Bar, and 2-candle patterns
تمرکز: پین بار، انگلفینک، دوجی، اینساید بار و الگوهای دو کندلی
"""

import pandas as pd
import numpy as np
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

class PriceActionAnalyzer:
    def __init__(self):
        self.min_body_ratio = 0.1  # حداقل نسبت بدنه کندل
        self.min_wick_ratio = 0.6  # حداقل نسبت فیتله برای پین بار
        self.engulfing_min_ratio = 0.7  # حداقل نسبت انگلفینک
        
    def analyze_patterns(self, df: pd.DataFrame, timeframe: str = "H4") -> Dict:
        """تحلیل الگوهای Price Action در دیتافریم"""
        try:
            if len(df) < 3:
                return {"patterns": [], "signals": []}
            
            patterns = []
            signals = []
            
            # تحلیل آخرین 20 کندل
            recent_df = df.tail(20).copy()
            recent_df.reset_index(drop=True, inplace=True)
            
            for i in range(2, len(recent_df)):
                current_candle = recent_df.iloc[i]
                prev_candle = recent_df.iloc[i-1]  
                prev2_candle = recent_df.iloc[i-2] if i >= 2 else None
                
                # تحلیل الگوهای تک کندلی
                single_patterns = self._analyze_single_candle_patterns(
                    current_candle, prev_candle, i
                )
                patterns.extend(single_patterns)
                
                # تحلیل الگوهای دو کندلی
                if prev2_candle is not None:
                    double_patterns = self._analyze_double_candle_patterns(
                        current_candle, prev_candle, prev2_candle, i
                    )
                    patterns.extend(double_patterns)
                
            # تولید سیگنال برای الگوهای قوی
            strong_patterns = [p for p in patterns if p['strength'] >= 0.7]
            for pattern in strong_patterns:
                signal = self._generate_signal_from_pattern(pattern, recent_df)
                if signal:
                    signals.append(signal)
            
            return {
                "patterns": patterns,
                "signals": signals,
                "timeframe": timeframe,
                "analysis_time": datetime.now(),
                "total_patterns": len(patterns),
                "strong_patterns": len(strong_patterns)
            }
            
        except Exception as e:
            logger.error(f"خطا در تحلیل Price Action: {e}")
            return {"patterns": [], "signals": [], "error": str(e)}
    
    def _analyze_single_candle_patterns(self, candle: pd.Series, prev_candle: pd.Series, index: int) -> List[Dict]:
        """تحلیل الگوهای تک کندلی"""
        patterns = []
        
        # محاسبه پارامترهای کندل
        body_size = abs(candle['close'] - candle['open'])
        upper_wick = candle['high'] - max(candle['open'], candle['close'])
        lower_wick = min(candle['open'], candle['close']) - candle['low']
        total_range = candle['high'] - candle['low']
        
        if total_range == 0:
            return patterns
        
        # نسبت‌ها
        body_ratio = body_size / total_range
        upper_wick_ratio = upper_wick / total_range
        lower_wick_ratio = lower_wick / total_range
        
        # 1. Pin Bar (Hammer/Shooting Star)
        pin_bar = self._detect_pin_bar(candle, body_ratio, upper_wick_ratio, lower_wick_ratio)
        if pin_bar:
            patterns.append({
                "type": "Pin Bar",
                "subtype": pin_bar['subtype'],
                "candle_index": index,
                "strength": pin_bar['strength'],
                "direction": pin_bar['direction'],
                "price_level": candle['close'],
                "description": pin_bar['description']
            })
        
        # 2. Doji Pattern  
        doji = self._detect_doji(candle, body_ratio, upper_wick_ratio, lower_wick_ratio)
        if doji:
            patterns.append({
                "type": "Doji",
                "subtype": doji['subtype'],
                "candle_index": index,
                "strength": doji['strength'],
                "direction": "Neutral",
                "price_level": candle['close'],
                "description": doji['description']
            })
        
        return patterns
    
    def _analyze_double_candle_patterns(self, current: pd.Series, prev: pd.Series, 
                                       prev2: pd.Series, index: int) -> List[Dict]:
        """تحلیل الگوهای دو کندلی"""
        patterns = []
        
        # 1. Bullish/Bearish Engulfing
        engulfing = self._detect_engulfing(current, prev)
        if engulfing:
            patterns.append({
                "type": "Engulfing",
                "subtype": engulfing['subtype'],
                "candle_index": index,
                "strength": engulfing['strength'],
                "direction": engulfing['direction'],
                "price_level": current['close'],
                "description": engulfing['description']
            })
        
        # 2. Inside Bar
        inside_bar = self._detect_inside_bar(current, prev)
        if inside_bar:
            patterns.append({
                "type": "Inside Bar",
                "subtype": "Consolidation",
                "candle_index": index,
                "strength": inside_bar['strength'],
                "direction": "Neutral",
                "price_level": current['close'],
                "description": inside_bar['description']
            })
        
        # 3. Outside Bar (Mother Bar)
        outside_bar = self._detect_outside_bar(current, prev)
        if outside_bar:
            patterns.append({
                "type": "Outside Bar",
                "subtype": "Expansion",
                "candle_index": index,
                "strength": outside_bar['strength'],
                "direction": outside_bar['direction'],
                "price_level": current['close'],
                "description": outside_bar['description']
            })
        
        return patterns
    
    def _detect_pin_bar(self, candle: pd.Series, body_ratio: float, 
                       upper_wick_ratio: float, lower_wick_ratio: float) -> Optional[Dict]:
        """شناسایی پین بار"""
        
        # شرایط پین بار
        if body_ratio > 0.3:  # بدنه خیلی بزرگ نباشد
            return None
            
        # Bullish Pin Bar (Hammer)
        if (lower_wick_ratio >= self.min_wick_ratio and 
            upper_wick_ratio <= 0.1 and 
            body_ratio <= 0.3):
            
            strength = min(0.9, lower_wick_ratio + (0.3 - body_ratio))
            return {
                "subtype": "Bullish Pin Bar (Hammer)",
                "strength": strength,
                "direction": "Bullish",
                "description": f"هامر قوی با فیتله پایین {lower_wick_ratio:.1%}"
            }
        
        # Bearish Pin Bar (Shooting Star)  
        elif (upper_wick_ratio >= self.min_wick_ratio and 
              lower_wick_ratio <= 0.1 and 
              body_ratio <= 0.3):
            
            strength = min(0.9, upper_wick_ratio + (0.3 - body_ratio))
            return {
                "subtype": "Bearish Pin Bar (Shooting Star)",
                "strength": strength,
                "direction": "Bearish",
                "description": f"ستاره دنباله‌دار با فیتله بالا {upper_wick_ratio:.1%}"
            }
        
        return None
    
    def _detect_doji(self, candle: pd.Series, body_ratio: float,
                    upper_wick_ratio: float, lower_wick_ratio: float) -> Optional[Dict]:
        """شناسایی دوجی"""
        
        if body_ratio > 0.05:  # بدنه خیلی کوچک باشد
            return None
        
        # Dragonfly Doji
        if lower_wick_ratio >= 0.4 and upper_wick_ratio <= 0.1:
            return {
                "subtype": "Dragonfly Doji",
                "strength": 0.6,
                "description": "دوجی سنجاقک - احتمال صعودی"
            }
        
        # Gravestone Doji
        elif upper_wick_ratio >= 0.4 and lower_wick_ratio <= 0.1:
            return {
                "subtype": "Gravestone Doji", 
                "strength": 0.6,
                "description": "دوجی سنگ قبر - احتمال نزولی"
            }
        
        # Standard Doji
        elif upper_wick_ratio >= 0.2 and lower_wick_ratio >= 0.2:
            return {
                "subtype": "Standard Doji",
                "strength": 0.5,
                "description": "دوجی استاندارد - تردید بازار"
            }
        
        return None
    
    def _detect_engulfing(self, current: pd.Series, prev: pd.Series) -> Optional[Dict]:
        """شناسایی انگلفینک"""
        
        current_body = abs(current['close'] - current['open'])
        prev_body = abs(prev['close'] - prev['open'])
        
        if prev_body == 0 or current_body == 0:
            return None
        
        # نسبت انگلفینک
        engulfing_ratio = current_body / prev_body
        
        if engulfing_ratio < self.engulfing_min_ratio:
            return None
        
        # Bullish Engulfing
        if (prev['close'] < prev['open'] and  # کندل قبلی قرمز
            current['close'] > current['open'] and  # کندل فعلی سبز
            current['open'] < prev['close'] and  # باز شدن زیر بسته شدن قبلی
            current['close'] > prev['open']):  # بسته شدن بالای باز شدن قبلی
            
            strength = min(0.9, 0.5 + (engulfing_ratio - self.engulfing_min_ratio) * 0.5)
            return {
                "subtype": "Bullish Engulfing",
                "strength": strength,
                "direction": "Bullish", 
                "description": f"انگلفینک صعودی با نسبت {engulfing_ratio:.1f}"
            }
        
        # Bearish Engulfing
        elif (prev['close'] > prev['open'] and  # کندل قبلی سبز
              current['close'] < current['open'] and  # کندل فعلی قرمز
              current['open'] > prev['close'] and  # باز شدن بالای بسته شدن قبلی
              current['close'] < prev['open']):  # بسته شدن زیر باز شدن قبلی
            
            strength = min(0.9, 0.5 + (engulfing_ratio - self.engulfing_min_ratio) * 0.5)
            return {
                "subtype": "Bearish Engulfing",
                "strength": strength,
                "direction": "Bearish",
                "description": f"انگلفینک نزولی با نسبت {engulfing_ratio:.1f}"
            }
        
        return None
    
    def _detect_inside_bar(self, current: pd.Series, prev: pd.Series) -> Optional[Dict]:
        """شناسایی اینساید بار"""
        
        if (current['high'] <= prev['high'] and 
            current['low'] >= prev['low'] and
            current['high'] != prev['high'] and
            current['low'] != prev['low']):
            
            # محاسبه قدرت بر اساس کوچکی رنج
            prev_range = prev['high'] - prev['low'] 
            current_range = current['high'] - current['low']
            
            if prev_range > 0:
                strength = 1 - (current_range / prev_range)
                strength = max(0.3, min(0.7, strength))
            else:
                strength = 0.5
            
            return {
                "strength": strength,
                "description": f"اینساید بار - انقباض {strength:.1%}"
            }
        
        return None
    
    def _detect_outside_bar(self, current: pd.Series, prev: pd.Series) -> Optional[Dict]:
        """شناسایی اوت‌ساید بار"""
        
        if (current['high'] > prev['high'] and current['low'] < prev['low']):
            
            direction = "Bullish" if current['close'] > current['open'] else "Bearish"
            
            # محاسبه قدرت بر اساس گسترش رنج
            prev_range = prev['high'] - prev['low']
            current_range = current['high'] - current['low']
            
            if prev_range > 0:
                expansion_ratio = current_range / prev_range
                strength = min(0.8, 0.4 + (expansion_ratio - 1) * 0.3)
            else:
                strength = 0.6
                
            return {
                "strength": strength,
                "direction": direction,
                "description": f"اوت‌ساید بار {direction} - گسترش بازار"
            }
        
        return None
    
    def _generate_signal_from_pattern(self, pattern: Dict, df: pd.DataFrame) -> Optional[Dict]:
        """تولید سیگنال از الگوی شناسایی شده"""
        
        if pattern['type'] not in ['Pin Bar', 'Engulfing'] or pattern['strength'] < 0.7:
            return None
        
        current_price = pattern['price_level']
        
        # محاسبه نقاط ورود، استاپ و تارگت
        if pattern['direction'] == 'Bullish':
            entry_price = current_price * 1.0005  # ورود با 5 پیپ بالاتر
            stop_loss = current_price * 0.9985   # استاپ 15 پیپ پایین‌تر
            take_profit = current_price * 1.0025  # تارگت 25 پیپ بالاتر
            signal_type = "BUY"
            
        elif pattern['direction'] == 'Bearish':
            entry_price = current_price * 0.9995  # ورود با 5 پیپ پایین‌تر  
            stop_loss = current_price * 1.0015   # استاپ 15 پیپ بالاتر
            take_profit = current_price * 0.9975  # تارگت 25 پیپ پایین‌تر
            signal_type = "SELL"
        else:
            return None
        
        return {
            "signal_id": f"PA_{pattern['type']}_{int(datetime.now().timestamp())}",
            "signal_type": signal_type,
            "pattern_type": pattern['type'],
            "pattern_subtype": pattern.get('subtype', ''),
            "strength": pattern['strength'],
            "entry_price": round(entry_price, 2),
            "stop_loss": round(stop_loss, 2),
            "take_profit": round(take_profit, 2),
            "risk_reward_ratio": abs(take_profit - entry_price) / abs(stop_loss - entry_price),
            "confidence": pattern['strength'] * 100,
            "timeframe": "H4",
            "symbol": "XAUUSD",
            "created_at": datetime.now(),
            "status": "PENDING_APPROVAL",
            "description": f"{pattern['type']} {pattern['direction']} - {pattern.get('description', '')}"
        }
    
    def get_pattern_summary(self, analysis_result: Dict) -> str:
        """خلاصه الگوهای شناسایی شده"""
        
        if not analysis_result.get('patterns'):
            return "❌ هیچ الگوی Price Action شناسایی نشد"
        
        patterns = analysis_result['patterns']
        signals = analysis_result.get('signals', [])
        
        summary = f"🎯 **تحلیل Price Action**\n\n"
        summary += f"📊 **آمار کلی:**\n"
        summary += f"• کل الگوها: {len(patterns)}\n"
        summary += f"• الگوهای قوی: {len([p for p in patterns if p['strength'] >= 0.7])}\n"  
        summary += f"• سیگنال‌ها: {len(signals)}\n\n"
        
        # الگوهای مهم
        strong_patterns = sorted([p for p in patterns if p['strength'] >= 0.6], 
                               key=lambda x: x['strength'], reverse=True)[:3]
        
        if strong_patterns:
            summary += f"🔥 **الگوهای قوی:**\n"
            for i, pattern in enumerate(strong_patterns, 1):
                summary += f"{i}. {pattern['type']} {pattern.get('direction', '')} "
                summary += f"(قدرت: {pattern['strength']:.1%})\n"
                summary += f"   └─ {pattern.get('description', '')}\n"
        
        return summary