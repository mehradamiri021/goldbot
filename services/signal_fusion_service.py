"""
Signal Fusion Service - ترکیب Price Action و Smart Money Concepts
سیستم ترکیب سیگنال‌ها برای تولید سیگنال‌های دقیق طلا

Combines Price Action patterns with SMC analysis for high-probability signals
ترکیب الگوهای Price Action با تحلیل SMC برای سیگنال‌های با احتمال بالا
"""

import pandas as pd
import numpy as np
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from services.price_action_analyzer import PriceActionAnalyzer
from services.smc_analyzer import SmartMoneyAnalyzer
from services.ta_shim import TA

logger = logging.getLogger(__name__)

class SignalFusionService:
    def __init__(self):
        self.price_action = PriceActionAnalyzer()
        self.smc_analyzer = SmartMoneyAnalyzer()
        self.min_confluence_strength = 0.65  # حداقل قدرت همپوشانی
        self.rsi_overbought = 70
        self.rsi_oversold = 30
        
    def generate_fusion_signals(self, df: pd.DataFrame, timeframe: str = "H4") -> Dict:
        """تولید سیگنال‌های ترکیبی Price Action + SMC + RSI"""
        
        try:
            if len(df) < 50:
                return {"error": "داده کافی برای تحلیل وجود ندارد"}
            
            logger.info(f"🔍 شروع تحلیل ترکیبی برای {timeframe}")
            
            # تحلیل کامپوننت‌های جداگانه
            pa_analysis = self.price_action.analyze_patterns(df, timeframe)
            smc_analysis = self.smc_analyzer.analyze_smc_structure(df, timeframe)
            rsi_analysis = self._analyze_rsi_conditions(df)
            
            # پیدا کردن نقاط همپوشانی قوی
            confluence_signals = self._find_confluence_signals(
                pa_analysis, smc_analysis, rsi_analysis, df
            )
            
            # فیلتر و امتیازدهی نهایی
            final_signals = self._filter_and_score_signals(confluence_signals, df)
            
            return {
                "timeframe": timeframe,
                "analysis_time": datetime.now(),
                "price_action_analysis": pa_analysis,
                "smc_analysis": smc_analysis,
                "rsi_analysis": rsi_analysis,
                "confluence_signals": confluence_signals,
                "final_signals": final_signals,
                "total_confluence_points": len(confluence_signals),
                "high_probability_signals": len([s for s in final_signals if s['confidence'] >= 75])
            }
            
        except Exception as e:
            logger.error(f"خطا در تولید سیگنال‌های ترکیبی: {e}")
            return {"error": str(e)}
    
    def _analyze_rsi_conditions(self, df: pd.DataFrame) -> Dict:
        """تحلیل شرایط RSI"""
        try:
            close_series = pd.Series(df['close'].values)
            rsi_values = TA.rsi(close_series, 14).values
            
            if len(rsi_values) == 0:
                return {"error": "محاسبه RSI ممکن نیست"}
            
            current_rsi = rsi_values[-1]
            prev_rsi = rsi_values[-2] if len(rsi_values) >= 2 else current_rsi
            
            # تشخیص شرایط RSI
            conditions = []
            rsi_bias = "Neutral"
            
            if current_rsi >= self.rsi_overbought:
                conditions.append("Overbought")
                rsi_bias = "Bearish"
            elif current_rsi <= self.rsi_oversold:
                conditions.append("Oversold") 
                rsi_bias = "Bullish"
            
            # تشخیص واگرایی
            if self._detect_rsi_divergence(df, rsi_values):
                conditions.append("Divergence")
            
            # تشخیص عبور از خط میانی
            if prev_rsi < 50 < current_rsi:
                conditions.append("Bullish Cross")
                rsi_bias = "Bullish" if rsi_bias == "Neutral" else rsi_bias
            elif prev_rsi > 50 > current_rsi:
                conditions.append("Bearish Cross")
                rsi_bias = "Bearish" if rsi_bias == "Neutral" else rsi_bias
            
            return {
                "current_rsi": round(current_rsi, 2),
                "previous_rsi": round(prev_rsi, 2),
                "rsi_bias": rsi_bias,
                "conditions": conditions,
                "strength": self._calculate_rsi_strength(current_rsi, conditions),
                "support_zones": [30, 40],  # مناطق حمایت RSI
                "resistance_zones": [60, 70]  # مناطق مقاومت RSI
            }
            
        except Exception as e:
            logger.error(f"خطا در تحلیل RSI: {e}")
            return {"error": str(e)}
    
    def _find_confluence_signals(self, pa_analysis: Dict, smc_analysis: Dict, 
                                rsi_analysis: Dict, df: pd.DataFrame) -> List[Dict]:
        """پیدا کردن سیگنال‌های همپوشانی"""
        
        confluence_signals = []
        
        try:
            # سیگنال‌های Price Action
            pa_signals = pa_analysis.get('signals', [])
            
            # مناطق SMC
            smc_confluence_zones = smc_analysis.get('confluence_zones', [])
            market_bias = smc_analysis.get('market_bias', {})
            
            # شرایط RSI  
            rsi_bias = rsi_analysis.get('rsi_bias', 'Neutral')
            rsi_strength = rsi_analysis.get('strength', 0.5)
            
            current_price = df.iloc[-1]['close']
            
            # بررسی همپوشانی سیگنال‌های Price Action با مناطق SMC
            for pa_signal in pa_signals:
                for smc_zone in smc_confluence_zones:
                    
                    # بررسی نزدیکی قیمت
                    signal_price = pa_signal.get('entry_price', current_price)
                    zone_range = smc_zone.get('price_range', {})
                    
                    if self._is_price_near_zone(signal_price, zone_range):
                        
                        # بررسی همسویی جهت‌ها
                        pa_direction = pa_signal.get('signal_type', 'NEUTRAL')
                        smc_direction = smc_zone.get('direction', 'Mixed')
                        market_direction = market_bias.get('bias', 'Neutral')
                        
                        # محاسبه همپوشانی
                        confluence = self._calculate_confluence_strength(
                            pa_signal, smc_zone, rsi_analysis, market_bias
                        )
                        
                        if confluence['total_strength'] >= self.min_confluence_strength:
                            
                            # تولید سیگنال نهایی
                            fusion_signal = self._create_fusion_signal(
                                pa_signal, smc_zone, rsi_analysis, confluence, df
                            )
                            
                            confluence_signals.append(fusion_signal)
            
            # سیگنال‌های مستقل RSI در مناطق SMC
            rsi_independent_signals = self._generate_rsi_smc_signals(
                smc_analysis, rsi_analysis, df
            )
            
            confluence_signals.extend(rsi_independent_signals)
            
            return confluence_signals
            
        except Exception as e:
            logger.error(f"خطا در پیدا کردن همپوشانی‌ها: {e}")
            return []
    
    def _calculate_confluence_strength(self, pa_signal: Dict, smc_zone: Dict, 
                                     rsi_analysis: Dict, market_bias: Dict) -> Dict:
        """محاسبه قدرت همپوشانی"""
        
        # وزن‌های هر کامپوننت
        weights = {
            "price_action": 0.35,
            "smc": 0.35, 
            "rsi": 0.20,
            "market_bias": 0.10
        }
        
        scores = {
            "price_action": pa_signal.get('strength', 0.5),
            "smc": smc_zone.get('strength', 0.5),
            "rsi": rsi_analysis.get('strength', 0.5),
            "market_bias": market_bias.get('confidence', 0.5)
        }
        
        # بررسی همسویی جهت‌ها
        pa_direction = pa_signal.get('signal_type', '')
        smc_direction = smc_zone.get('direction', '')
        rsi_direction = rsi_analysis.get('rsi_bias', '')
        market_direction = market_bias.get('bias', '')
        
        direction_alignment = self._check_direction_alignment(
            pa_direction, smc_direction, rsi_direction, market_direction
        )
        
        # محاسبه امتیاز کل
        weighted_score = sum(scores[component] * weights[component] 
                           for component in scores)
        
        # اعمال ضریب همسویی
        total_strength = weighted_score * direction_alignment['multiplier']
        
        return {
            "component_scores": scores,
            "weights": weights,
            "direction_alignment": direction_alignment,
            "weighted_score": weighted_score,
            "total_strength": min(0.95, total_strength),
            "confidence_level": self._get_confidence_level(total_strength)
        }
    
    def _create_fusion_signal(self, pa_signal: Dict, smc_zone: Dict, 
                             rsi_analysis: Dict, confluence: Dict, df: pd.DataFrame) -> Dict:
        """ایجاد سیگنال ترکیبی نهایی"""
        
        current_price = df.iloc[-1]['close']
        
        # تشخیص جهت نهایی
        final_direction = self._determine_final_direction(pa_signal, smc_zone, rsi_analysis)
        
        # محاسبه نقاط ورود، استاپ و تارگت
        entry_points = self._calculate_fusion_entry_points(
            pa_signal, smc_zone, current_price, final_direction
        )
        
        # محاسبه اندازه پوزیشن بر اساس قدرت
        position_size = self._calculate_position_size(confluence['total_strength'])
        
        # ایجاد سیگنال نهایی
        fusion_signal = {
            "signal_id": f"FUSION_{int(datetime.now().timestamp())}",
            "signal_type": final_direction,
            "source": "Price Action + SMC + RSI",
            "symbol": "XAUUSD",
            "timeframe": "H4",
            
            # قیمت‌های کلیدی
            "entry_price": entry_points['entry'],
            "stop_loss": entry_points['stop_loss'],
            "take_profit_1": entry_points['tp1'],
            "take_profit_2": entry_points['tp2'],
            
            # اطلاعات کامپوننت‌ها
            "price_action_pattern": pa_signal.get('pattern_type', ''),
            "smc_components": smc_zone.get('components', []),
            "rsi_condition": rsi_analysis.get('conditions', []),
            
            # قدرت و اعتماد
            "confluence_strength": confluence['total_strength'],
            "confidence": confluence['total_strength'] * 100,
            "confidence_level": confluence['confidence_level'],
            
            # مدیریت ریسک  
            "position_size_percent": position_size,
            "risk_reward_ratio": entry_points['rr_ratio'],
            "max_risk_percent": 2.0,
            
            # وضعیت
            "status": "PENDING_APPROVAL",
            "created_at": datetime.now(),
            "expires_at": datetime.now() + timedelta(hours=4),
            
            # توضیحات
            "description": self._generate_signal_description(pa_signal, smc_zone, rsi_analysis),
            "analysis_summary": self._generate_analysis_summary(confluence)
        }
        
        return fusion_signal
    
    def _filter_and_score_signals(self, signals: List[Dict], df: pd.DataFrame) -> List[Dict]:
        """فیلتر و امتیازدهی نهایی سیگنال‌ها"""
        
        if not signals:
            return []
        
        # فیلتر بر اساس حداقل کیفیت
        quality_signals = [s for s in signals if s.get('confluence_strength', 0) >= 0.6]
        
        # حذف سیگنال‌های تکراری یا خیلی نزدیک
        unique_signals = self._remove_duplicate_signals(quality_signals)
        
        # امتیازدهی نهایی
        for signal in unique_signals:
            final_score = self._calculate_final_score(signal, df)
            signal['final_score'] = final_score
            signal['priority'] = self._get_signal_priority(final_score)
        
        # مرتب‌سازی بر اساس امتیاز نهایی
        unique_signals.sort(key=lambda x: x['final_score'], reverse=True)
        
        # برگرداندن حداکثر 3 سیگنال برتر
        return unique_signals[:3]
    
    def _detect_rsi_divergence(self, df: pd.DataFrame, rsi_values: np.ndarray) -> bool:
        """تشخیص واگرایی RSI"""
        try:
            if len(df) < 10 or len(rsi_values) < 10:
                return False
            
            # 10 کندل اخیر  
            recent_price = df['close'].tail(10).values
            recent_rsi = rsi_values[-10:]
            
            # تشخیص واگرایی صعودی (قیمت پایین‌تر، RSI بالاتر)
            price_trend = np.polyfit(range(len(recent_price)), recent_price, 1)[0]
            rsi_trend = np.polyfit(range(len(recent_rsi)), recent_rsi, 1)[0]
            
            # واگرایی اگر جهت‌ها مخالف باشند
            return (price_trend > 0 and rsi_trend < 0) or (price_trend < 0 and rsi_trend > 0)
            
        except:
            return False
    
    def _calculate_rsi_strength(self, current_rsi: float, conditions: List[str]) -> float:
        """محاسبه قدرت شرایط RSI"""
        base_strength = 0.5
        
        # افزایش قدرت برای شرایط خاص
        if "Overbought" in conditions or "Oversold" in conditions:
            base_strength += 0.2
        
        if "Divergence" in conditions:
            base_strength += 0.3
        
        if "Bullish Cross" in conditions or "Bearish Cross" in conditions:
            base_strength += 0.1
        
        # تعدیل بر اساس شدت RSI
        if current_rsi >= 80 or current_rsi <= 20:
            base_strength += 0.1
        
        return min(0.9, base_strength)
    
    def _is_price_near_zone(self, price: float, zone_range: Dict) -> bool:
        """بررسی نزدیکی قیمت به ناحیه SMC"""
        try:
            zone_top = zone_range.get('top', 0)
            zone_bottom = zone_range.get('bottom', 0)
            
            if zone_top == 0 or zone_bottom == 0:
                return False
            
            # محدوده تلرانس 0.1% (10 پیپ در طلا)
            tolerance = price * 0.001
            
            return (zone_bottom - tolerance <= price <= zone_top + tolerance)
            
        except:
            return False
    
    def _check_direction_alignment(self, pa_dir: str, smc_dir: str, 
                                  rsi_dir: str, market_dir: str) -> Dict:
        """بررسی همسویی جهت‌های مختلف"""
        
        # تبدیل جهت‌ها به فرمت استاندارد
        directions = {
            'pa': self._normalize_direction(pa_dir),
            'smc': self._normalize_direction(smc_dir), 
            'rsi': self._normalize_direction(rsi_dir),
            'market': self._normalize_direction(market_dir)
        }
        
        # شمارش جهت‌های مثبت و منفی
        bullish_count = sum(1 for d in directions.values() if d == 'Bullish')
        bearish_count = sum(1 for d in directions.values() if d == 'Bearish')
        neutral_count = sum(1 for d in directions.values() if d == 'Neutral')
        
        # محاسبه ضریب همسویی
        total_signals = len([d for d in directions.values() if d != 'Unknown'])
        
        if total_signals == 0:
            return {"alignment": "Unknown", "multiplier": 0.5}
        
        if bullish_count >= 3:
            return {"alignment": "Strong Bullish", "multiplier": 1.2}
        elif bearish_count >= 3:
            return {"alignment": "Strong Bearish", "multiplier": 1.2}
        elif bullish_count >= 2 and bearish_count == 0:
            return {"alignment": "Bullish", "multiplier": 1.0}
        elif bearish_count >= 2 and bullish_count == 0:
            return {"alignment": "Bearish", "multiplier": 1.0}
        else:
            return {"alignment": "Mixed", "multiplier": 0.8}
    
    def _normalize_direction(self, direction: str) -> str:
        """تبدیل جهت به فرمت استاندارد"""
        if not direction:
            return 'Neutral'
        
        direction = direction.lower()
        
        if 'bull' in direction or 'buy' in direction or 'up' in direction:
            return 'Bullish'
        elif 'bear' in direction or 'sell' in direction or 'down' in direction:
            return 'Bearish'
        elif 'neutral' in direction or 'mixed' in direction:
            return 'Neutral'
        else:
            return 'Unknown'
    
    def _determine_final_direction(self, pa_signal: Dict, smc_zone: Dict, rsi_analysis: Dict) -> str:
        """تشخیص جهت نهایی سیگنال"""
        
        pa_dir = pa_signal.get('signal_type', '')
        smc_dir = smc_zone.get('direction', '')
        rsi_dir = rsi_analysis.get('rsi_bias', '')
        
        # اولویت با Price Action
        if pa_dir in ['BUY', 'SELL']:
            return pa_dir
        
        # در غیر این صورت بر اساس اکثریت
        normalized_dirs = [
            self._normalize_direction(pa_dir),
            self._normalize_direction(smc_dir),
            self._normalize_direction(rsi_dir)
        ]
        
        bullish_count = normalized_dirs.count('Bullish')
        bearish_count = normalized_dirs.count('Bearish')
        
        if bullish_count > bearish_count:
            return 'BUY'
        elif bearish_count > bullish_count:
            return 'SELL'
        else:
            return 'HOLD'
    
    def _calculate_fusion_entry_points(self, pa_signal: Dict, smc_zone: Dict, 
                                     current_price: float, direction: str) -> Dict:
        """محاسبه نقاط ورود و خروج ترکیبی"""
        
        # نقاط پیش‌فرض از Price Action
        base_entry = pa_signal.get('entry_price', current_price)
        base_sl = pa_signal.get('stop_loss', current_price)
        base_tp = pa_signal.get('take_profit', current_price)
        
        # تعدیل بر اساس مناطق SMC
        zone_range = smc_zone.get('price_range', {})
        
        if direction == 'BUY':
            # ورود در پایین ناحیه SMC
            entry = min(base_entry, zone_range.get('bottom', base_entry) * 1.0002)
            stop_loss = min(base_sl, entry * 0.9985)
            tp1 = entry * 1.0015  # 15 پیپ
            tp2 = entry * 1.0025  # 25 پیپ
            
        else:  # SELL
            # ورود در بالای ناحیه SMC  
            entry = max(base_entry, zone_range.get('top', base_entry) * 0.9998)
            stop_loss = max(base_sl, entry * 1.0015)
            tp1 = entry * 0.9985  # 15 پیپ
            tp2 = entry * 0.9975  # 25 پیپ
        
        rr_ratio = abs(tp1 - entry) / abs(stop_loss - entry) if abs(stop_loss - entry) > 0 else 1.0
        
        return {
            "entry": round(entry, 2),
            "stop_loss": round(stop_loss, 2),
            "tp1": round(tp1, 2),
            "tp2": round(tp2, 2),
            "rr_ratio": round(rr_ratio, 2)
        }
    
    def _calculate_position_size(self, confluence_strength: float) -> float:
        """محاسبه اندازه پوزیشن بر اساس قدرت"""
        
        # اندازه پایه 1%
        base_size = 1.0
        
        # افزایش بر اساس قدرت
        if confluence_strength >= 0.8:
            return min(3.0, base_size * 2.5)
        elif confluence_strength >= 0.7:
            return min(2.5, base_size * 2.0)
        elif confluence_strength >= 0.6:
            return min(2.0, base_size * 1.5)
        else:
            return base_size
    
    def _get_confidence_level(self, strength: float) -> str:
        """تشخیص سطح اعتماد"""
        if strength >= 0.8:
            return "Very High"
        elif strength >= 0.7:
            return "High"
        elif strength >= 0.6:
            return "Medium"
        elif strength >= 0.5:
            return "Low"
        else:
            return "Very Low"
    
    def _generate_rsi_smc_signals(self, smc_analysis: Dict, rsi_analysis: Dict, df: pd.DataFrame) -> List[Dict]:
        """تولید سیگنال‌های مستقل RSI + SMC"""
        signals = []
        
        try:
            rsi_bias = rsi_analysis.get('rsi_bias', 'Neutral')
            rsi_conditions = rsi_analysis.get('conditions', [])
            current_rsi = rsi_analysis.get('current_rsi', 50)
            
            # فقط در شرایط extreme RSI
            if not ('Overbought' in rsi_conditions or 'Oversold' in rsi_conditions):
                return signals
            
            # پیدا کردن مناطق SMC مناسب
            smc_zones = []
            smc_zones.extend(smc_analysis.get('order_blocks', [])[:2])
            smc_zones.extend(smc_analysis.get('liquidity_zones', [])[:2])
            
            current_price = df.iloc[-1]['close']
            
            for zone in smc_zones:
                zone_price = zone.get('price', current_price)
                distance = abs(current_price - zone_price) / current_price
                
                # فقط مناطق نزدیک (کمتر از 0.2%)
                if distance <= 0.002:
                    
                    # بررسی همسویی RSI و SMC
                    zone_direction = self._normalize_direction(zone.get('direction', ''))
                    
                    if ((rsi_bias == 'Bullish' and zone_direction == 'Bullish') or
                        (rsi_bias == 'Bearish' and zone_direction == 'Bearish')):
                        
                        signal = self._create_rsi_smc_signal(zone, rsi_analysis, current_price)
                        signals.append(signal)
            
            return signals
            
        except Exception as e:
            logger.error(f"خطا در تولید سیگنال‌های RSI+SMC: {e}")
            return []
    
    def _create_rsi_smc_signal(self, smc_zone: Dict, rsi_analysis: Dict, current_price: float) -> Dict:
        """ایجاد سیگنال RSI + SMC"""
        
        rsi_bias = rsi_analysis.get('rsi_bias', 'Neutral')
        current_rsi = rsi_analysis.get('current_rsi', 50)
        
        direction = 'BUY' if rsi_bias == 'Bullish' else 'SELL'
        
        if direction == 'BUY':
            entry = current_price * 1.0005
            stop_loss = current_price * 0.999
            take_profit = current_price * 1.002
        else:
            entry = current_price * 0.9995
            stop_loss = current_price * 1.001
            take_profit = current_price * 0.998
        
        return {
            "signal_id": f"RSI_SMC_{int(datetime.now().timestamp())}",
            "signal_type": direction,
            "source": "RSI + SMC",
            "entry_price": round(entry, 2),
            "stop_loss": round(stop_loss, 2),
            "take_profit_1": round(take_profit, 2),
            "confluence_strength": 0.6,
            "confidence": 60,
            "rsi_value": current_rsi,
            "smc_zone_type": smc_zone.get('type', ''),
            "status": "PENDING_APPROVAL",
            "created_at": datetime.now(),
            "description": f"RSI {rsi_bias} + {smc_zone.get('type', 'SMC Zone')}"
        }
    
    def _remove_duplicate_signals(self, signals: List[Dict]) -> List[Dict]:
        """حذف سیگنال‌های تکراری یا نزدیک"""
        if len(signals) <= 1:
            return signals
        
        unique_signals = []
        
        for signal in signals:
            is_duplicate = False
            signal_price = signal.get('entry_price', 0)
            
            for existing in unique_signals:
                existing_price = existing.get('entry_price', 0)
                
                # اگر قیمت‌ها خیلی نزدیک باشند (کمتر از 10 پیپ)
                if abs(signal_price - existing_price) / existing_price < 0.0005:
                    # سیگنال قوی‌تر را نگه دار
                    if signal.get('confluence_strength', 0) > existing.get('confluence_strength', 0):
                        unique_signals.remove(existing)
                        unique_signals.append(signal)
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                unique_signals.append(signal)
        
        return unique_signals
    
    def _calculate_final_score(self, signal: Dict, df: pd.DataFrame) -> float:
        """محاسبه امتیاز نهایی سیگنال"""
        
        base_score = signal.get('confluence_strength', 0.5)
        
        # بونوس برای R:R بالا
        rr_ratio = signal.get('risk_reward_ratio', 1.0)
        rr_bonus = min(0.1, (rr_ratio - 1.0) * 0.05) if rr_ratio > 1.0 else 0
        
        # بونوس برای تنوع منابع
        source_count = len(signal.get('source', '').split('+'))
        source_bonus = min(0.1, (source_count - 1) * 0.03)
        
        # کاهش امتیاز برای فاصله زیاد از قیمت فعلی
        current_price = df.iloc[-1]['close']
        entry_price = signal.get('entry_price', current_price)
        distance_penalty = min(0.1, abs(entry_price - current_price) / current_price * 10)
        
        final_score = base_score + rr_bonus + source_bonus - distance_penalty
        
        return max(0.0, min(1.0, final_score))
    
    def _get_signal_priority(self, final_score: float) -> str:
        """تشخیص اولویت سیگنال"""
        if final_score >= 0.8:
            return "HIGH"
        elif final_score >= 0.65:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _generate_signal_description(self, pa_signal: Dict, smc_zone: Dict, rsi_analysis: Dict) -> str:
        """تولید توضیحات سیگنال"""
        
        pa_type = pa_signal.get('pattern_type', 'Pattern')
        smc_components = ', '.join(smc_zone.get('components', ['SMC Zone']))
        rsi_conditions = ', '.join(rsi_analysis.get('conditions', ['RSI']))
        
        return f"همپوشانی {pa_type} با {smc_components} و شرایط RSI: {rsi_conditions}"
    
    def _generate_analysis_summary(self, confluence: Dict) -> str:
        """تولید خلاصه تحلیل"""
        
        scores = confluence['component_scores']
        alignment = confluence['direction_alignment']['alignment']
        total_strength = confluence['total_strength']
        
        return (f"قدرت کل: {total_strength:.1%} | "
                f"همسویی: {alignment} | "
                f"PA: {scores['price_action']:.1%}, "
                f"SMC: {scores['smc']:.1%}, " 
                f"RSI: {scores['rsi']:.1%}")
    
    def get_fusion_summary(self, analysis_result: Dict) -> str:
        """خلاصه تحلیل ترکیبی"""
        
        if analysis_result.get('error'):
            return f"❌ خطای تحلیل ترکیبی: {analysis_result['error']}"
        
        final_signals = analysis_result.get('final_signals', [])
        confluence_signals = analysis_result.get('confluence_signals', [])
        
        summary = f"🔀 **تحلیل ترکیبی (PA + SMC + RSI)**\n\n"
        
        # آمار کلی
        summary += f"📊 **آمار تحلیل:**\n"
        summary += f"• نقاط همپوشانی: {len(confluence_signals)}\n"
        summary += f"• سیگنال‌های نهایی: {len(final_signals)}\n"
        summary += f"• احتمال بالا: {len([s for s in final_signals if s['confidence'] >= 75])}\n\n"
        
        # سیگنال‌های برتر
        if final_signals:
            summary += f"🎯 **سیگنال‌های برتر:**\n"
            for i, signal in enumerate(final_signals[:2], 1):
                summary += f"{i}. {signal['signal_type']} - {signal.get('source', 'Unknown')}\n"
                summary += f"   • اعتماد: {signal['confidence']:.0f}%\n"
                summary += f"   • ورود: {signal.get('entry_price', 0):.2f}\n"
                summary += f"   • R:R: {signal.get('risk_reward_ratio', 0):.1f}\n"
        
        return summary